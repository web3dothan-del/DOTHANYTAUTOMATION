#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { PATHS } from './config.js';
import { loadTopic, topicDuration } from './render/topic.js';
import { renderFrames } from './render/renderer.js';
import { encode, grabThumbnail, cleanFrames } from './render/encode.js';
import { uploadVideo } from './upload/youtube.js';
import { authorize } from './upload/auth.js';

const USAGE = `
dothan — comparison-explainer Shorts for YouTube

  topics                        list every topic file
  render <topic> [opts]         render one topic to out/<id>.mp4
  batch [--series <name>]       render every topic (optionally one series)
  auth [--manual]               one-time YouTube channel authorisation
  upload <video> --topic <t>    upload an already-rendered file
  publish <topic> [opts]        render then upload in one go

Options
  --keep-frames                 leave the PNG sequence in .frames/
  --audio <file>                mux a background track
  --privacy <public|unlisted|private>
  --publish-at <iso8601>        schedule (forces privacy=private until then)
  --dry-run                     print the upload payload, send nothing

A <topic> is a topic id (money-basics) or a path to a topic .json.
`;

main().catch(err => {
  console.error('\nError: ' + err.message);
  process.exit(1);
});

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const { flags, positional } = parseArgs(rest);

  switch (cmd) {
    case 'topics':  return cmdTopics();
    case 'render':  return cmdRender(positional[0], flags);
    case 'batch':   return cmdBatch(flags);
    case 'auth':    return authorize({ manual: !!flags.manual });
    case 'upload':  return cmdUpload(positional[0], flags);
    case 'publish': return cmdPublish(positional[0], flags);
    case undefined:
    case 'help':
    case '--help':  return console.log(USAGE);
    default:
      console.log(USAGE);
      throw new Error(`unknown command "${cmd}"`);
  }
}

// ------------------------------------------------------------------ commands

async function cmdTopics() {
  const files = await findTopics();
  if (!files.length) return console.log('No topic files under ' + PATHS.topics);
  for (const file of files) {
    const topic = await loadTopic(file);
    const mins = topicDuration(topic);
    console.log(
      `${topic.id.padEnd(20)} ${String(topic.series).padEnd(10)} ` +
      `${topic.segments.length} pairs  ${mins.toFixed(0)}s  ${path.relative('.', file)}`,
    );
  }
}

async function cmdRender(ref, flags) {
  if (!ref) throw new Error('render needs a topic. Try: npm run topics');
  const topic = await loadTopic(await resolveTopic(ref));
  return renderTopic(topic, flags);
}

async function cmdBatch(flags) {
  let files = await findTopics();
  if (flags.series) {
    const kept = [];
    for (const f of files) {
      const t = await loadTopic(f);
      if (t.series === flags.series) kept.push(f);
    }
    files = kept;
    if (!files.length) throw new Error(`no topics in series "${flags.series}"`);
  }
  const results = [];
  for (const file of files) {
    const topic = await loadTopic(file);
    results.push(await renderTopic(topic, flags));
  }
  console.log(`\nRendered ${results.length} video(s) into ${PATHS.out}/`);
  return results;
}

async function cmdUpload(videoPath, flags) {
  if (!videoPath) throw new Error('upload needs a video path');
  if (!flags.topic) throw new Error('upload needs --topic <id> to source the title/description');
  const topic = await loadTopic(await resolveTopic(flags.topic));
  const thumb = path.join(PATHS.out, `${topic.id}.jpg`);
  return doUpload(videoPath, topic, flags, await exists(thumb) ? thumb : null);
}

async function cmdPublish(ref, flags) {
  if (!ref) throw new Error('publish needs a topic');
  const topic = await loadTopic(await resolveTopic(ref));
  const { video, thumbnail } = await renderTopic(topic, flags);
  return doUpload(video, topic, flags, thumbnail);
}

// ------------------------------------------------------------------- helpers

async function renderTopic(topic, flags) {
  const seconds = topicDuration(topic);
  console.log(`\n${topic.id} — ${topic.segments.length} pairs, ${seconds.toFixed(0)}s`);

  const { dir, count } = await renderFrames(topic, {
    onProgress: (done, total) => {
      process.stdout.write(`\r  frames ${done}/${total}  (${((done / total) * 100).toFixed(0)}%)`);
    },
  });
  process.stdout.write('\n');

  const video = path.join(PATHS.out, `${topic.id}.mp4`);
  await encode(dir, video, { audio: flags.audio, duration: seconds });

  // Frame 24 lands just after the cards have popped in — a cleaner still than frame 0.
  const thumbnail = await grabThumbnail(dir, path.join(PATHS.out, `${topic.id}.jpg`), Math.min(24, count - 1));

  if (!flags['keep-frames']) await cleanFrames(dir);
  else console.log(`  frames kept in ${dir}`);

  const { size } = await fs.stat(video);
  console.log(`  ${video}  (${(size / 1048576).toFixed(1)} MB)`);
  return { topic, video, thumbnail };
}

async function doUpload(video, topic, flags, thumbnail) {
  const meta = {
    ...topic.meta,
    privacyStatus: flags.privacy || topic.meta.privacyStatus,
    publishAt: flags['publish-at'] || topic.meta.publishAt,
  };

  console.log(`\nuploading ${path.basename(video)} → "${meta.title}"`);
  const res = await uploadVideo(video, meta, {
    thumbnail,
    dryRun: !!flags['dry-run'],
    onProgress: (sent, total) => {
      process.stdout.write(`\r  ${((sent / total) * 100).toFixed(0)}%`);
    },
  });
  process.stdout.write('\n');
  if (res.url) console.log(`  ${res.shortsUrl}`);
  return res;
}

async function findTopics(dir = PATHS.topics) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await findTopics(full));
    else if (entry.name.endsWith('.json')) out.push(full);
  }
  return out.sort();
}

/** Accepts either a path to a topic file or a bare topic id. */
async function resolveTopic(ref) {
  if (ref.endsWith('.json') && await exists(ref)) return ref;
  const files = await findTopics();
  const hit = files.find(f => path.basename(f, '.json') === ref);
  if (!hit) {
    throw new Error(`no topic "${ref}". Known: ${files.map(f => path.basename(f, '.json')).join(', ')}`);
  }
  return hit;
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { positional.push(a); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) flags[key] = true;
    else { flags[key] = next; i++; }
  }
  return { flags, positional };
}
