# Parity evidence

Captured from `https://fintrace.com.au/` while it still ran the Next.js app on GitHub Pages, before any migration change. These files are the source of truth the Astro rebuild was measured against and **must never be regenerated from the current site**.

| Path | What it holds |
| --- | --- |
| `production-baseline.json` | Per route and discovery file: status, content type, body SHA-256, title, `lang`, every `meta` and `link` element, every `img` attribute set, whitespace-normalised visible text with its SHA-256, the sorted `href` list, and the key-sorted JSON-LD graph. Also the two images, three icons, three fonts and the real 404. |
| `screenshots/production/` | 18 full-page WebP captures: six documents at `1440x900` and `390x900`, plus the contact sending, success and error states at both viewports. |
| `cutover-snapshot.json` | The complete zone state read immediately before the DNS write: all 14 records with every field, `always_use_https`, bot management, Workers domains, rulesets, the active Worker deployment and the GitHub Pages state. `site/scripts/cutover.mjs rollback` restores from this file. |
| `cutover-snapshot-applied.json` | The apex domain ID, certificate ID and redirect ruleset ID created by the cutover. |
| `lighthouse-production/summary.json` | Medians of three mobile Lighthouse runs per route against the live apex after cutover. |

`screenshots/candidate/` and `screenshots/diff/` are regenerated on every parity run and are not tracked.

## Regenerating a comparison

```bash
cd site
node scripts/capture-production-screenshots.mjs --base=https://fintrace.com.au \
  --out=../documents/guides/parity/screenshots/candidate
node scripts/compare-screenshots.mjs
node scripts/compare-text.mjs
```

`compare-text.mjs` applies the two approved exceptions to the expected side: `og:locale` is `en_AU`, and `/privacy/` carries the Cloudflare hosting sentence, the session-storage disclosure and the later update date. `compare-screenshots.mjs` compares `/privacy/` only above the changed copy, because everything below it legitimately reflows.
