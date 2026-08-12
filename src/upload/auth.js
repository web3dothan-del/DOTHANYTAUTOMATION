import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import readline from 'node:readline/promises';
import { google } from 'googleapis';
import { PATHS } from '../config.js';

// youtube.upload is required to publish; youtube is required to set a thumbnail
// and read back the resulting video.
export const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
];

const LOOPBACK_PORT = 8712;
const REDIRECT_URI = `http://127.0.0.1:${LOOPBACK_PORT}/oauth2callback`;

/**
 * Builds an authorised OAuth2 client.
 *
 * Credentials are read in this order:
 *   1. env vars  YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN  (for CI)
 *   2. credentials/client_secret.json + credentials/youtube.token.json (local)
 *
 * Nothing here ever writes a secret outside the git-ignored credentials/ dir.
 */
export async function getAuthClient() {
  if (process.env.YT_CLIENT_ID && process.env.YT_CLIENT_SECRET && process.env.YT_REFRESH_TOKEN) {
    const client = new google.auth.OAuth2(
      process.env.YT_CLIENT_ID, process.env.YT_CLIENT_SECRET, REDIRECT_URI,
    );
    client.setCredentials({ refresh_token: process.env.YT_REFRESH_TOKEN });
    return client;
  }

  const client = await clientFromSecretFile();
  const token = await readJson(PATHS.tokenFile);
  if (!token) {
    throw new Error(
      'No YouTube credentials yet. Run `npm run auth` once to authorise the channel, ' +
      'or set YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN.',
    );
  }
  client.setCredentials(token);
  // Persist rotated refresh tokens so a long-lived setup keeps working.
  client.on('tokens', async t => {
    if (t.refresh_token) await writeToken({ ...token, ...t });
  });
  return client;
}

/** Interactive one-time consent. Prints the URL, then waits for the redirect. */
export async function authorize({ manual = false } = {}) {
  const client = await clientFromSecretFile();
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',          // forces a refresh_token even on re-auth
    scope: SCOPES,
  });

  console.log('\nOpen this URL in a browser signed in to the target channel:\n');
  console.log(url + '\n');

  const code = manual ? await codeFromPaste() : await codeFromLoopback();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error('Google did not return a refresh token. Revoke the app at ' +
      'https://myaccount.google.com/permissions and run auth again.');
  }
  await writeToken(tokens);
  console.log(`\nSaved ${PATHS.tokenFile}`);
  console.log('For CI, set YT_REFRESH_TOKEN to:\n' + tokens.refresh_token);
  return tokens;
}

/** Waits for Google to redirect back to the loopback listener. */
function codeFromLoopback() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, `http://127.0.0.1:${LOOPBACK_PORT}`);
      if (u.pathname !== '/oauth2callback') { res.writeHead(404).end(); return; }
      const code = u.searchParams.get('code');
      const err = u.searchParams.get('error');
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(`<p style="font:20px system-ui;padding:40px">${err ? 'Failed: ' + err : 'Authorised. You can close this tab.'}</p>`);
      server.close();
      err ? reject(new Error(err)) : resolve(code);
    });
    server.on('error', reject);
    server.listen(LOOPBACK_PORT, '127.0.0.1', () => {
      console.log(`Waiting for the redirect on ${REDIRECT_URI} …`);
      console.log('(If this machine has no browser, re-run with --manual)');
    });
  });
}

/** Fallback for headless boxes: consent elsewhere, paste the redirect URL back. */
async function codeFromPaste() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    'After approving, your browser lands on a 127.0.0.1 URL that will not load.\n' +
    'Paste that full URL (or just the code) here: ',
  );
  rl.close();
  const trimmed = answer.trim();
  if (!trimmed.startsWith('http')) return trimmed;
  const code = new URL(trimmed).searchParams.get('code');
  if (!code) throw new Error('That URL has no ?code= parameter.');
  return code;
}

async function clientFromSecretFile() {
  const secret = await readJson(PATHS.clientSecretFile);
  if (!secret) {
    throw new Error(
      `Missing ${PATHS.clientSecretFile}. Create an OAuth client of type "Desktop app" ` +
      'in Google Cloud Console (YouTube Data API v3 enabled) and save the JSON there.',
    );
  }
  const cfg = secret.installed || secret.web;
  if (!cfg) throw new Error(`${PATHS.clientSecretFile} has neither an "installed" nor "web" section.`);
  return new google.auth.OAuth2(cfg.client_id, cfg.client_secret, REDIRECT_URI);
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

async function writeToken(tokens) {
  await fs.mkdir(path.dirname(PATHS.tokenFile), { recursive: true });
  await fs.writeFile(PATHS.tokenFile, JSON.stringify(tokens, null, 2), { mode: 0o600 });
}
