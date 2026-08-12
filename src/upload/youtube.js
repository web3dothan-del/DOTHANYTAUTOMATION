import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { google } from 'googleapis';
import { getAuthClient } from './auth.js';

const MAX_TITLE = 100;
const MAX_DESCRIPTION = 5000;
const MAX_TAGS_CHARS = 500;

/**
 * Uploads one rendered video. Resumable by default in the client library, so a
 * dropped connection mid-upload retries rather than restarting.
 *
 * @param {string} videoPath  path to the mp4
 * @param {object} meta       { title, description, tags, categoryId, privacyStatus, publishAt }
 * @param {object} opts       { thumbnail, onProgress, dryRun }
 */
export async function uploadVideo(videoPath, meta, { thumbnail, onProgress, dryRun } = {}) {
  const snippet = buildSnippet(meta);
  const status = buildStatus(meta);

  if (dryRun) {
    console.log('[dry run] would upload', videoPath);
    console.log(JSON.stringify({ snippet, status }, null, 2));
    return { id: null, dryRun: true };
  }

  const auth = await getAuthClient();
  const youtube = google.youtube({ version: 'v3', auth });
  const { size } = await fsp.stat(videoPath);

  const res = await youtube.videos.insert(
    {
      part: ['snippet', 'status'],
      notifySubscribers: meta.notifySubscribers ?? true,
      requestBody: { snippet, status },
      media: { body: fs.createReadStream(videoPath) },
    },
    {
      onUploadProgress: e => onProgress?.(e.bytesRead, size),
    },
  );

  const id = res.data.id;
  if (thumbnail) {
    try {
      await youtube.thumbnails.set({ videoId: id, media: { body: fs.createReadStream(thumbnail) } });
    } catch (err) {
      // Custom thumbnails need a verified channel; the upload itself already succeeded.
      console.warn(`  ! thumbnail rejected (${err.message}) — video is still up`);
    }
  }

  return { id, url: `https://www.youtube.com/watch?v=${id}`, shortsUrl: `https://www.youtube.com/shorts/${id}` };
}

function buildSnippet(meta) {
  if (!meta.title) throw new Error('meta.title is required');
  const title = truncate(meta.title, MAX_TITLE);
  // #Shorts in the description is the documented signal for the Shorts shelf;
  // a vertical video under 3 minutes also qualifies on its own.
  const body = meta.description || '';
  const description = truncate(
    body.includes('#Shorts') ? body : `${body}\n\n#Shorts`.trim(),
    MAX_DESCRIPTION,
  );
  return {
    title,
    description,
    tags: capTags(meta.tags || []),
    categoryId: String(meta.categoryId || '27'),   // 27 = Education
    defaultLanguage: meta.language || 'en',
  };
}

function buildStatus(meta) {
  const privacyStatus = meta.publishAt ? 'private' : (meta.privacyStatus || 'private');
  const status = {
    privacyStatus,
    selfDeclaredMadeForKids: meta.madeForKids ?? false,
    embeddable: true,
  };
  if (meta.publishAt) {
    const when = new Date(meta.publishAt);
    if (Number.isNaN(when.getTime())) throw new Error(`meta.publishAt is not a valid date: ${meta.publishAt}`);
    if (when <= new Date()) throw new Error(`meta.publishAt must be in the future: ${meta.publishAt}`);
    status.publishAt = when.toISOString();
  }
  return status;
}

/** YouTube caps the tag list by total characters, not count. */
function capTags(tags) {
  const out = [];
  let used = 0;
  for (const tag of tags) {
    const cost = tag.length + 1;
    if (used + cost > MAX_TAGS_CHARS) break;
    out.push(tag);
    used += cost;
  }
  return out;
}

function truncate(s, max) {
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + '…';
}
