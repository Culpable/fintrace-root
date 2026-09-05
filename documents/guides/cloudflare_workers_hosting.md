# Cloudflare Workers hosting

FinTrace Root is migrating its public site from GitHub Pages to Cloudflare Workers Static Assets, following `documents/todo/astro_workers_migration_plan.md`. This guide is the single evidence document for the migration: the pre-migration inventory, the token map, the release path, the parity and performance evidence, and the exact rollback payloads.

## Status

| Stage | State |
| --- | --- |
| Baseline snapshot (plan Step 1) | Complete - 5 September 2026 |
| Astro site in `site/` | Complete - parity proven locally |
| Workers provisioning | Not started |
| Staging proof | Not started |
| Production cutover | Not started |
| Decommission | Not started |

`https://fintrace.com.au/` is served by GitHub Pages until the recorded cutover approval.

## Account and zone inventory

Read from the Cloudflare API on 5 September 2026 with the Global API Key loaded from Keychain service `cloudflare-global-api-key` (account `jake.sacino@gmail.com`). No write was made.

| Fact | Value |
| --- | --- |
| Account ID | `213ab3604485056376263d22fa242742` |
| Member | `jake.sacino@gmail.com` |
| Zone | `fintrace.com.au` |
| Zone ID | `9f79f842598f32ede2fb86d93325260c` |
| Zone status | `active` |
| Nameservers | `vita.ns.cloudflare.com`, `will.ns.cloudflare.com` |
| `workers.dev` subdomain | `webpop` |

Existing Workers scripts in the account: `bulma-root`, `bulma-root-preview`, `hfmlegal`, `musclehacking-astro-preview`, `taxgenie-root`, `taxgenie-root-preview`. No Worker named `fintrace-root` or `fintrace-root-preview` exists yet.

Existing Workers custom domains: `taxgenie.com.au` (`taxgenie-root`) and `bulma.com.au` (`bulma-root`). No `fintrace.com.au` hostname is attached to any Worker.

Zone rulesets are the three managed entrypoints only - `Cloudflare Normalization Ruleset` (`70339d97bdb34195bbf054b1ebe81f76`), `Cloudflare Managed Free Ruleset` (`77454fe2d30c4220b5701f6fdfb893ba`) and `DDoS L7 ruleset` (`4d21379b4f9f4bb088e0729962c8b3cf`). There is no custom `http_request_dynamic_redirect` ruleset.

Relevant zone settings before the migration:

| Setting | Value |
| --- | --- |
| `always_use_https` | `off` |
| `automatic_https_rewrites` | `on` |
| `browser_cache_ttl` | `14400` |
| `ssl` | `full` |
| `min_tls_version` | `1.0` |

## DNS before-state

Thirteen records. Only the four apex `A` records and the `www` `CNAME` are migration targets; every other record must stay byte-identical.

| Type | Name | Content | Proxied | TTL | Record ID |
| --- | --- | --- | --- | --- | --- |
| A | `fintrace.com.au` | `185.199.111.153` | false | auto (`1`) | `cf861b013e474f150bd6a5b82f5fbaba` |
| A | `fintrace.com.au` | `185.199.110.153` | false | auto (`1`) | `8590cc3bfbccea4a1005e2f1e9a0fe4d` |
| A | `fintrace.com.au` | `185.199.109.153` | false | auto (`1`) | `fbe83d678853fb3636188c02e9433c21` |
| A | `fintrace.com.au` | `185.199.108.153` | false | auto (`1`) | `7347f879e73b415667097ab727258e95` |
| CNAME | `www.fintrace.com.au` | `culpable.github.io` | false | auto (`1`) | `cad18186776390d58893578cd8679ab1` |
| CNAME | `autodiscover.fintrace.com.au` | `autodiscover.outlook.com` | false | `3600` | `3afb03b228774331d2736424a8b4c2f2` |
| CNAME | `enterpriseenrollment.fintrace.com.au` | `enterpriseenrollment-s.manage.microsoft.com` | false | `3600` | `3e80715dde3221864994107b457abce6` |
| CNAME | `enterpriseregistration.fintrace.com.au` | `enterpriseregistration.windows.net` | false | `3600` | `c2c96887389b1f7c95370a73394f995c` |
| MX | `fintrace.com.au` | `fintrace-com-au.mail.protection.outlook.com` | false | `3600` | `4726503070dcaa1c5d22ad3efa2a54bb` |
| TXT | `fintrace.com.au` | `google-site-verification=gX2_7WqmTrGxltS0Z197PRiccqgzJX3WmkkCva9iqMw` | false | auto (`1`) | `a4b5d9d31fd04b8f4bf6aefbecca9213` |
| TXT | `fintrace.com.au` | `v=spf1 include:spf.protection.outlook.com ~all` | false | `3600` | `2690c22fc3b9038baab65f4dc6f08715` |
| TXT | `fintrace.com.au` | `MS=ms27983875` | false | `3600` | `7941323d42fde27a5b219f0f2d3bf27e` |
| TXT | `_github-pages-challenge-culpable.fintrace.com.au` | `362f6f987383bcf24673c6dbff3d6f` | false | auto (`1`) | `267f779f5b689011c906a3713a7c16d2` |

The four `A` records and the `www` `CNAME` above are the complete rollback payload for restoring GitHub Pages. The refreshed pre-cutover snapshot required by plan Step 9 is added to this guide immediately before the DNS write.

## GitHub state

| Fact | Value |
| --- | --- |
| Repository | `Culpable/fintrace-root` |
| Repository ID | `1302542539` |
| Owner ID | `31677655` |
| Default branch | `main` |
| Pages `build_type` | `workflow` |
| Pages `cname` | `fintrace.com.au` |
| Pages `protected_domain_state` | `verified` |
| Pages HTTPS | enforced, certificate approved for `fintrace.com.au` and `www.fintrace.com.au`, expires 2026-10-15 |
| Actions secrets | none (`0`) |
| Actions variables | none (`0`) |

## Live HTTP before the migration

| Request | Result |
| --- | --- |
| `GET https://fintrace.com.au/` | `200`, `server: GitHub.com`, `cache-control: max-age=600`, no security headers |
| `GET http://fintrace.com.au/about/` | `301` to HTTPS, `Server: GitHub.com` |
| `GET https://www.fintrace.com.au/about/?x=1` | `301` to the apex |
| `GET https://fintrace.com.au/about` | `301` to `https://fintrace.com.au/about/` |
| `GET https://fintrace.com.au/llms.txt` | `text/plain; charset=utf-8`, `cache-control: max-age=600` |
| IPv6 `GET https://fintrace.com.au/` | `200` |

## Token map

Secrets live only in the macOS Keychain under account `jake.sacino@gmail.com`. Values are never printed, logged or committed.

| Purpose | Keychain service | Created |
| --- | --- | --- |
| Cloudflare Global API Key (pre-existing, all accounts) | `cloudflare-global-api-key` | before this migration |
| Workers Builds deploy token value | `fintrace-root-cloudflare-build-api-token` | plan Step 7 |
| Workers Builds deploy token ID | `fintrace-root-cloudflare-build-api-token-id` | plan Step 7 |
| Workers Builds token registry UUID | `fintrace-root-cloudflare-build-api-token-uuid` | plan Step 7 |

## Parity baseline

The production parity manifest is `documents/guides/parity/production-baseline.json`, captured from `https://fintrace.com.au/` on 5 September 2026 at repository commit `cc22a724676ee5ee91080cb96f2874cb14735b41`. It records, per route, the response status, content type, cache control, body SHA-256, document title, `lang`, every `meta` and `link` element, every `img` attribute set, whitespace-normalised visible text with its SHA-256, the sorted `href` list and the key-sorted JSON-LD graph. It also records the three discovery files with their full text and SHA-256, the two images, the three browser identity icons, the three production font files and the real 404 document.

Reference screenshots are `documents/guides/parity/screenshots/production/*.webp`: the six routes at `1440x900` and `390x900` plus the contact sending, success and error states at both viewports (18 files).

Known capture artefact: Chromium's full-page capture renders the fixed `.eng-skip-link` inside the page body on the three contact interaction states. The behaviour is deterministic and comes from the shared stylesheet, so it appears identically on both sides of the comparison; the parity spec masks `.eng-skip-link` regardless.

## Next.js performance baseline

Measured from `out/` after `npm run build` at commit `cc22a724676ee5ee91080cb96f2874cb14735b41`, using the same method as `test/agent/performance.spec.ts` (gzip of the HTML plus the gzip of every stylesheet and script the document references).

| Route | HTML gzip | CSS gzip | Initial JS gzip | Scripts |
| --- | ---: | ---: | ---: | ---: |
| `/` | 15,326 | 10,907 | 197,087 | 9 |
| `/about/` | 6,370 | 11,605 | 190,969 | 9 |
| `/engagement/` | 6,002 | 11,779 | 190,969 | 9 |
| `/contact/` | 5,626 | 12,394 | 191,764 | 9 |
| `/privacy/` | 5,960 | 11,878 | 190,555 | 9 |
| `404.html` | 3,799 | 11,867 | 190,555 | 9 |

Budgets from `documents/guides/agent_readiness.md`: HTML 30,000 bytes gzip, CSS 30,000 bytes gzip, initial JavaScript 250,000 bytes gzip, testimonial portrait 45,000 bytes. Every route is inside budget today; the Astro build must additionally stay below each Next sample in the initial-JavaScript column.

## Root validation baseline

Run at commit `cc22a724676ee5ee91080cb96f2874cb14735b41` on 5 September 2026:

- `npm test` - 11 passed, 0 failed.
- `npm run lint` - zero errors.
- `npm run build` - static export succeeded, 13 routes generated.
- `npm run test:agent` - 124 passed.

## Local Worker contract

Run against `wrangler dev` (`http://127.0.0.1:8787`) on 5 September 2026 with `site/test/http-contract.json`:

- 19 of 19 cases pass, covering the five canonical documents as HTML and as negotiated Markdown, both cache orders, the slashless `307`, the unknown-path `404` in both representations, `406` for an unacceptable media type, a Markdown `HEAD`, the blocked `/_agent-markdown/` prefix, `robots.txt`, `sitemap.xml`, `llms.txt` with its charset and curly apostrophe intact, a fingerprinted `/_astro/*` asset with the immutable policy, and the declared favicon media type.
- Every document response carries the `_headers` policy: the hash-free CSP, `Permissions-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Vary: Accept`. HTML bodies are byte-identical to `dist`.
- Generated Markdown carries the authored content: the seven ledger rows and the reconciled closing balance `−9,701.95`, the four trace annotations including `A$9,500 · 07 MAR 2024 · SEE P. 214` and `€16,800 · 04 APR 2024 · FX MATCH`, the `100%` stat final value, the `≈50 hrs` About strip with its glyph intact, and the testimonial.
- `site/scripts/verify-browser-runtime.mjs` passes on all six documents at `1440x900` and `390x900`: zero console errors, zero page errors, zero CSP violations, zero failed first-party requests, zero horizontal overflow.
- `wrangler deploy --dry-run` succeeds for both environments with `main: src/worker.ts`, one `ASSETS` binding and no other binding.

### Prefetch reuse measurement (plan D-17)

Measured against `wrangler dev` on 5 September 2026 with `site/scripts/measure-prefetch-reuse.mjs`: hovering the header `About` link issued exactly one document prefetch, and the following navigation reported `PerformanceNavigationTiming.deliveryType: "cache"` with `transferSize: 300` against `decodedBodySize: 11,823`. The prefetched document is reused despite `Vary: Accept`, so `prefetch` stays enabled in `astro.config.mjs`. The measurement is repeated on staging in plan Step 8.

## Local gate

Run on 5 September 2026 from `site/`:

| Command | Result |
| --- | --- |
| `pnpm check` | 0 errors, 0 warnings, 0 hints across 86 files |
| `pnpm build` | 6 pages built, Markdown generated for all five indexable routes plus the recovery document |
| `pnpm test:unit` | 48 passed (analytics including the six D-8 persistence cases, discovery, metadata, structured data, build output, production parity, runtime contract, negotiated document, Markdown generation) |
| `pnpm test:build-output` | 10 required outputs validated; About 1,969, Contact 880 and Privacy 2,713 page-specific characters |
| `playwright test` | 124 passed across the desktop and mobile projects |
| `pnpm test:http` (under `wrangler dev`) | 19 of 19 cases passed |
| `scripts/compare-text.mjs` | all five routes match the production manifest |
| `scripts/compare-screenshots.mjs` | all 18 captures pass |
| `scripts/verify-hero-matrix.mjs` (headed, real GPU) | 7 viewports plus live resize and forced WebGL failure passed |
| Root `npm test`, `npm run lint`, `npm run build`, `npm run test:agent` | still pass with `site/` present (11, 0 errors, export succeeded, 124) |

### Parity result

Maximum recorded pixel difference across the 18 captures is **0.361%** (contact error state at `390x900`), against a `1.0%` gate; twelve captures are byte-identical. `/privacy/` is compared above the approved D-13 copy change, where it differs by 0.034% desktop and 0.117% mobile.

### Per-route gzip against the Next.js baseline

| Route | HTML | CSS | Initial JS | JS change |
| --- | ---: | ---: | ---: | ---: |
| `/` | 8,395 | 10,039 | 5,224 | −191,863 |
| `/about/` | 3,409 | 10,216 | 1,774 | −189,195 |
| `/engagement/` | 3,100 | 10,393 | 1,774 | −189,195 |
| `/contact/` | 3,226 | 11,007 | 2,420 | −189,344 |
| `/privacy/` | 3,355 | 10,483 | 1,774 | −188,781 |
| `404.html` | 2,113 | 10,478 | 1,774 | −188,781 |

Every route is inside the `agent_readiness.md` budgets and below its Next.js sample on all three axes. The Three.js chunk and the Mixpanel loader chunk are separate files that no initial document references.

## Release path

Not yet provisioned. Plan Steps 7 to 10 record the Worker IDs, script tags, repository connection UUID, trigger UUIDs, build IDs, version IDs, custom domains, certificate IDs, the cutover packet and the rollback calls here as they are created.
