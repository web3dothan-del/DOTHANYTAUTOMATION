import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { VIDEO, PATHS } from '../config.js';

/**
 * Muxes a PNG frame sequence into an MP4 that YouTube accepts without
 * re-encoding surprises: H.264 High, yuv420p, +faststart.
 *
 * A silent video is valid but tends to be treated poorly by Shorts, so when no
 * audio track is supplied we still mux a silent AAC track — players and the
 * upload pipeline both behave better with one present.
 */
export async function encode(framesDir, outFile, { audio, duration } = {}) {
  await fs.mkdir(path.dirname(outFile), { recursive: true });

  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-framerate', String(VIDEO.fps),
    '-i', path.join(framesDir, '%06d.png'),
  ];

  if (audio) {
    args.push('-i', audio);
  } else {
    args.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100');
  }

  args.push(
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'libx264',
    '-preset', VIDEO.preset,
    '-crf', String(VIDEO.crf),
    '-profile:v', 'high',
    '-pix_fmt', 'yuv420p',
    '-r', String(VIDEO.fps),
    '-c:a', 'aac', '-b:a', '192k', '-ar', '44100',
    '-shortest',
    '-movflags', '+faststart',
  );
  if (duration) args.push('-t', String(duration));
  args.push(outFile);

  await run('ffmpeg', args);
  return outFile;
}

/** Pulls a single frame out as a JPEG for use as the video thumbnail. */
export async function grabThumbnail(framesDir, outFile, frameIndex = 0) {
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  const src = path.join(framesDir, `${String(frameIndex).padStart(6, '0')}.png`);
  await run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-q:v', '2', outFile]);
  return outFile;
}

export async function cleanFrames(topicId) {
  await fs.rm(path.join(PATHS.frames, topicId), { recursive: true, force: true });
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'inherit', 'pipe'] });
    let stderr = '';
    p.stderr.on('data', d => { stderr += d; });
    p.on('error', err => reject(
      err.code === 'ENOENT'
        ? new Error(`${cmd} not found. Install ffmpeg and make sure it is on PATH.`)
        : err
    ));
    p.on('close', code => code === 0
      ? resolve()
      : reject(new Error(`${cmd} exited ${code}\n${stderr.trim()}`)));
  });
}
