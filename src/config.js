/**
 * Central knobs for the whole pipeline. Everything downstream reads from here so a
 * channel-wide look change is a one-file edit.
 */
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  // Constant Rate Factor: lower is better quality / bigger file. 20 is visually
  // lossless for flat graphics like ours.
  crf: 20,
  preset: 'medium',
};

export const TIMING = {
  // Seconds each comparison segment occupies. The reference video runs ~12s per pair.
  segmentSeconds: 12,
  // Trailing call-to-action card.
  outroSeconds: 3,
};

export const BRAND = {
  handle: '@Dualstix',
  // Shown on the outro card. Set to '' to hide a row.
  outroHandle: '@DUALSTIX_',
  outroLine: 'follow for more',
  accent: '#7c3aed',
  accentAlt: '#e11d8f',
  background: '#ffffff',
  ink: '#0b0b0c',
};

/** Where rendered artifacts land. */
export const PATHS = {
  out: 'out',
  frames: '.frames',
  topics: 'src/topics',
  images: 'assets/images',
  tokenFile: 'credentials/youtube.token.json',
  clientSecretFile: 'credentials/client_secret.json',
};
