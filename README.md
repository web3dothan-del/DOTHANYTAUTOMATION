# DOTHANYTAUTOMATION

Generates vertical "what's the difference?" comparison Shorts and publishes them
to YouTube. Write a topic as JSON, get a finished 1080×1920 MP4 plus a thumbnail,
then upload it with one command.

Two seeded series ship with the repo:

| Series    | Topics                        | Subject                          |
| --------- | ----------------------------- | -------------------------------- |
| `finance` | `money-basics`, `debt-and-wealth` | Personal finance terminology  |
| `defi`    | `defi-basics`, `defi-risks`   | Crypto / DeFi terminology        |

## Requirements

- Node 20+
- `ffmpeg` on `PATH`
- Chromium for Playwright (`npx playwright install chromium`)

```bash
npm install
```

If your machine already has a Chromium that Playwright doesn't manage, point at
it with `DOTHAN_CHROMIUM=/path/to/chrome` instead of downloading another copy.

## Rendering

```bash
npm run topics                    # list every topic file
node src/cli.js render money-basics
node src/cli.js batch --series defi
```

Output lands in `out/<topic-id>.mp4` with a matching `.jpg` thumbnail. A 63s
video is 1,890 frames and takes roughly 8 minutes — each frame is a real
screenshot, which is what makes the output reproducible.

Useful flags:

| Flag | Effect |
| ---- | ------ |
| `--keep-frames` | leave the PNG sequence in `.frames/` for inspection |
| `--audio track.mp3` | mux a background track |
| `--privacy public\|unlisted\|private` | override the topic's setting |
| `--publish-at 2026-08-09T14:00:00Z` | schedule the premiere |
| `--dry-run` | print the upload payload without sending it |

## Publishing to YouTube

One-time setup:

1. In Google Cloud Console, enable **YouTube Data API v3**.
2. Create an OAuth client of type **Desktop app**.
3. Save the downloaded JSON to `credentials/client_secret.json`.
4. Run `npm run auth` and approve on the channel you want to publish to.

```bash
node src/cli.js publish defi-basics --privacy unlisted   # render + upload
node src/cli.js upload out/money-basics.mp4 --topic money-basics
```

`credentials/` is git-ignored. For CI, run `auth` once locally and set
`YT_CLIENT_ID`, `YT_CLIENT_SECRET` and `YT_REFRESH_TOKEN` as secrets instead of
shipping the token file.

Topics default to `privacyStatus: "private"` so nothing goes live by accident —
raise it deliberately with `--privacy` or by editing the topic.

**Quota note:** each upload costs ~1,600 units against a default daily quota of
10,000, so a fresh project supports about 6 uploads/day.

## Writing a topic

A topic is one JSON file under `src/topics/<series>/`. Each segment is one term
pair and runs 12 seconds.

```jsonc
{
  "id": "money-basics",
  "series": "finance",
  "meta": {
    "title": "…",              // ≤100 chars, truncated if longer
    "description": "…",        // #Shorts is appended if absent
    "tags": ["…"],
    "categoryId": "27",        // 27 = Education, 28 = Science & Tech
    "privacyStatus": "private"
  },
  "segments": [
    {
      "left":  { "term": "Asset",     "image": "finance/asset.jpg" },
      "right": { "term": "Liability", "image": "finance/liability.jpg" },
      "hook": "what's the difference?",
      "lines": [
        { "text": "an asset puts money into your pocket", "highlight": "into" },
        { "text": "a liability takes money out of it",    "highlight": "out" },
        { "text": "buy assets before you buy liabilities","highlight": "before" }
      ]
    }
  ]
}
```

Rules the loader enforces, so a bad topic fails before you spend 8 minutes
rendering it:

- exactly **3** lines per segment — one for the left term, one for the right,
  one payoff
- each line **≤64 characters**, so it never spills past two rows
- every `highlight` must actually occur in its line

### Segment timing

Each segment follows the same beat sheet, expressed as fractions of its runtime
so changing `segmentSeconds` keeps the rhythm:

| Beat | Share | On screen | Pose |
| ---- | ----- | --------- | ---- |
| cards in | 0–5% | both terms pop in | thinking |
| hook | 5–22% | `hook` text | thinking |
| line A | 22–45% | left term explained, right card steps aside | points left |
| line B | 45–70% | right term explained, left card dims | points right |
| line C | 70–96% | the payoff | shrug |
| fade | 96–100% | crossfade to next pair | — |

## Images

Put photos in `assets/images/<series>/<name>.jpg` and reference them relative to
that directory. Images are inlined as data URIs at render time, so the scene has
no external dependencies.

**A missing image is not an error** — the scene draws a labelled gradient card
instead, so a topic is renderable while you are still sourcing art. Use images
you have the rights to; the seeded topics ship with no photos for that reason.

## Branding

Channel-wide look lives in `src/config.js` — handle, accent colours, outro text,
resolution, fps, encoder settings. A topic can override any brand field in its
own `brand` block.

## Layout

```
src/
  cli.js              commands: topics, render, batch, auth, upload, publish
  config.js           video, timing and brand constants
  render/
    scene.html        the animated scene; deterministic seek(t), no CSS animation
    topic.js          topic loading, validation, image inlining
    renderer.js       Playwright frame capture
    encode.js         ffmpeg mux, thumbnail extraction
  topics/<series>/    topic definitions
  upload/
    auth.js           OAuth2 (loopback or --manual paste), token persistence
    youtube.js        videos.insert + thumbnails.set
```

### Why frame-by-frame capture

`scene.html` exposes `SCENE.seek(t)` and uses no CSS animations or transitions.
The renderer sets the clock and screenshots, so output depends only on `t` — the
same topic renders byte-identically on a laptop and in CI. Screen-recording the
page in real time would drop frames under load and give a different video every
run.
