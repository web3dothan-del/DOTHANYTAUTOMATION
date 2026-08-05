import fs from 'node:fs/promises';
import path from 'node:path';
import { TIMING, BRAND, VIDEO, PATHS } from '../config.js';

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
};

/**
 * Reads a topic file and turns it into the exact shape scene.html expects,
 * with images inlined as data URIs so the page has zero external dependencies.
 */
export async function loadTopic(topicPath) {
  const raw = JSON.parse(await fs.readFile(topicPath, 'utf8'));
  validate(raw, topicPath);

  const segments = [];
  for (const seg of raw.segments) {
    segments.push({
      slug: `${seg.left.term}-${seg.right.term}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      duration: seg.duration ?? raw.segmentSeconds ?? TIMING.segmentSeconds,
      hook: seg.hook ? asLine(seg.hook) : { text: "what's the difference?" },
      lines: seg.lines.map(asLine),
      left: { term: seg.left.term, image: await inlineImage(seg.left.image) },
      right: { term: seg.right.term, image: await inlineImage(seg.right.image) },
    });
  }

  return {
    id: raw.id || path.basename(topicPath, '.json'),
    series: raw.series || 'default',
    meta: raw.meta || {},
    fps: VIDEO.fps,
    outroSeconds: raw.outroSeconds ?? TIMING.outroSeconds,
    brand: { ...BRAND, ...(raw.brand || {}) },
    segments,
  };
}

function asLine(line) {
  if (typeof line === 'string') return { text: line };
  return { text: line.text, highlight: line.highlight };
}

/** Resolves an image reference to a data URI, or null when it can't be found. */
async function inlineImage(ref) {
  if (!ref) return null;
  if (/^data:/.test(ref)) return ref;
  const file = path.isAbsolute(ref) ? ref : path.join(PATHS.images, ref);
  try {
    const buf = await fs.readFile(file);
    const mime = MIME[path.extname(file).toLowerCase()];
    if (!mime) throw new Error(`unsupported image type: ${path.extname(file)}`);
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    // Missing art is expected while drafting — the scene draws a labelled
    // gradient card instead, so a topic is always renderable.
    console.warn(`  ! image not found, using placeholder: ${file}`);
    return null;
  }
}

function validate(raw, topicPath) {
  const where = path.basename(topicPath);
  if (!Array.isArray(raw.segments) || raw.segments.length === 0) {
    throw new Error(`${where}: "segments" must be a non-empty array`);
  }
  raw.segments.forEach((seg, i) => {
    const at = `${where} segment ${i}`;
    if (!seg.left?.term || !seg.right?.term) {
      throw new Error(`${at}: needs left.term and right.term`);
    }
    if (!Array.isArray(seg.lines) || seg.lines.length !== 3) {
      throw new Error(`${at}: needs exactly 3 script lines (got ${seg.lines?.length ?? 0})`);
    }
    for (const line of seg.lines) {
      const text = typeof line === 'string' ? line : line?.text;
      if (!text) throw new Error(`${at}: a script line is missing text`);
      if (text.length > 64) {
        throw new Error(`${at}: line is ${text.length} chars, keep it under 64 so it fits two rows: "${text}"`);
      }
      const hl = typeof line === 'object' ? line.highlight : null;
      if (hl && !text.toLowerCase().includes(String(hl).toLowerCase())) {
        throw new Error(`${at}: highlight "${hl}" does not appear in "${text}"`);
      }
    }
  });
}

/** Total runtime in seconds for a loaded topic. */
export function topicDuration(topic) {
  return topic.segments.reduce((n, s) => n + s.duration, 0) + topic.outroSeconds;
}
