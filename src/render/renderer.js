import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { chromium } from 'playwright';
import { VIDEO, PATHS } from '../config.js';
import { topicDuration } from './topic.js';

const SCENE = path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'scene.html');

/**
 * Normally Playwright finds its own Chromium. Some CI images ship a browser at a
 * revision the installed Playwright doesn't recognise, so allow an explicit
 * override before falling back to a well-known symlink.
 */
function chromiumExecutable() {
  if (process.env.DOTHAN_CHROMIUM) return process.env.DOTHAN_CHROMIUM;
  const shared = '/opt/pw-browsers/chromium';
  if (fsSync.existsSync(shared)) return shared;
  return undefined;   // let Playwright resolve it
}

/**
 * Captures one PNG per frame by stepping the scene's own clock. Nothing is
 * recorded in real time, so a slow machine produces a byte-identical video to
 * a fast one — it just takes longer.
 *
 * @returns {Promise<{dir: string, count: number, duration: number}>}
 */
export async function renderFrames(topic, { onProgress } = {}) {
  const dir = path.join(PATHS.frames, topic.id);
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });

  const duration = topicDuration(topic);
  const count = Math.round(duration * VIDEO.fps);

  const browser = await chromium.launch({
    executablePath: chromiumExecutable(),
    args: ['--force-color-profile=srgb', '--disable-lcd-text', '--hide-scrollbars'],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: VIDEO.width, height: VIDEO.height },
      deviceScaleFactor: 1,
    });
    await page.goto(url.pathToFileURL(SCENE).href, { waitUntil: 'load' });
    await page.evaluate(data => window.SCENE.init(data), topic);
    // Give inlined images a beat to decode before the first capture.
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);

    for (let i = 0; i < count; i++) {
      const t = i / VIDEO.fps;
      await page.evaluate(time => window.SCENE.seek(time), t);
      await page.screenshot({
        path: path.join(dir, `${String(i).padStart(6, '0')}.png`),
        animations: 'disabled',
      });
      if (onProgress && (i % 30 === 0 || i === count - 1)) onProgress(i + 1, count);
    }
  } finally {
    await browser.close();
  }

  return { dir, count, duration };
}
