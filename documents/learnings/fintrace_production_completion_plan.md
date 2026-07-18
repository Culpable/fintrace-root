# ~~FinTrace Production Completion Plan — og:image, Brand Icon Set, Documentation Reconciliation, Deploy~~ ✅ **COMPLETED**

<critical_warning>
> **CRITICAL WARNING:** The entire round-seven production-pages build and most of Step 8 (centralised metadata) sit UNCOMMITTED on `main`. Pushing `main` auto-deploys to `https://fintrace.com.au/` through `.github/workflows/deploy.yml`. The user has confirmed the work is being actively completed and that committing and pushing IS part of finishing it — Step 5 of this plan performs the commit, push and post-deploy verification. Do not push before Steps 1–4 pass their success criteria, because a premature push publishes pages whose `og:image` meta tags point at a file that does not exist.
</critical_warning>

<important_note>
> **IMPORTANT NOTE:** The Formspree form ID `xwvgoenw` in `src/app/contact/ContactForm.tsx` is REAL (user-confirmed). The user explicitly decided to SKIP the live test submission and dashboard-receipt check. Do not submit the form, do not revert the ID to a placeholder, and do not record the success path as verified — Step 3 records it as "real ID shipped; live HTTP 200 submission and dashboard receipt deliberately not run (user decision)".
</important_note>

## 1. Goal

Close every remaining gap between the current repository state and the `/build-website` delivery standard, so the FinTrace production site (Engine Network homepage plus About, Engagement & pricing, Contact and the branded 404) is complete, truthfully documented, validated and live at `https://fintrace.com.au/`.

Five gaps existed when this plan started; everything else in the six-phase `/build-website` sequence (grounding, product shaping, workspace configuration, visual contract, journey implementation, and the round-seven browser proof) was already satisfied in the implementation and its completed validation record:

1. **Missing og:image asset.** Every built page (including `404.html`) emitted `og:image → https://fintrace.com.au/images/og/fintrace-og.png`, but `public/` did not exist. Deployed in that state, every social share would have referenced a 404.
2. **Off-brand favicon.** `src/app/icon.svg` was the pre-branding "neutral design-lab favicon" (graphite field, chalk serif FT in Georgia — a system font the project bans as a primary face). No `favicon.ico` or `apple-touch-icon` existed. The user selected favicon and logotype completion into this plan's scope.
3. **Documentation drift.** Governing documents claimed the contact form shipped a placeholder and that OG/social metadata was unconfigured, contradicting the real public ID `xwvgoenw` and implemented `openGraph`/`twitter` blocks.
4. **Unrecorded validation.** Step 8's social-tag, asset-dimension and rendered-tab-title suite had not been run and recorded.
5. **Nothing is deployed.** All of the above plus the entire round-seven pages build is uncommitted; production currently has no About/Engagement/Contact, an unbranded 404 and no social metadata.

Done means: the og:image and icon set exist at their exact paths and dimensions; all five governing documents are truthful; lint, build and the full validation suite pass; the work is committed and pushed; the Pages workflow succeeds; and the live production URLs serve the new pages, titles, social tags and icons.

---

## 2. Current State Analysis

### 2.1 Current Implementation Overview

The repo is a Next.js App Router static export (`output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`) deployed to GitHub Pages from `main` via `.github/workflows/deploy.yml` (npm ci → lint → build → upload `out/` → deploy; no secrets). Dev server: `npm run dev` → `http://localhost:3004`.

**Already implemented and verified (uncommitted on `main`):**

- Production routes `/about/`, `/engagement/`, `/contact/` and the branded root 404 (`src/app/about/`, `src/app/engagement/`, `src/app/contact/`, `src/app/not-found.tsx` + `not-found.css`), sharing the flagship `.dsn-engine-network` scope with `eng-ab-`/`eng-eg-`/`eng-ct-`/`eng-nf-`/`eng-page-` prefixes.
- Shared sub-page chrome `src/app/engine-network/SiteChrome.tsx` + `site-pages.css`; homepage footer nav and CTA retargets to `/contact/` in `EngineNetworkPage.tsx` and `Hero.tsx` (the href-only hero change already passed the full seven-viewport matrix).
- Four-URL sitemap (`src/app/sitemap.ts`): `/`, `/about/`, `/engagement/`, `/contact/`.
- Centralised metadata: `src/lib/metadata.ts` exports `siteMetadata` (name, title, description, `siteUrl: 'https://fintrace.com.au'`, `ogImage: '/images/og/fintrace-og.png'`, `locale: 'en-AU'`) and `pageMetadata` (home/about/engagement/contact). `src/app/layout.tsx` consumes it: `%s | FinTrace` title template plus full `openGraph` (siteName, url, locale, type, title, description, images with 1200×630 + alt) and `twitter` (`summary_large_image`) blocks. This pipe delimiter supersedes the interim slash template. `src/app/page.tsx` uses `title: { absolute: … }`; the three sub-pages import `pageMetadata`. `not-found.tsx` deliberately exports no metadata (falls back to the site default — correct).
- Contact form (`src/app/contact/ContactForm.tsx`): `FORMSPREE_FORM_ID = 'xwvgoenw'` (line 6), browser `fetch` POST of `FormData` to `https://formspree.io/f/xwvgoenw` with JSON acceptance, hidden `_subject`/`form_source`/`_gotcha` fields, busy/status/alert semantics, value preservation on error, reset on success. This POST is the approved sole runtime network exception.
- Both 2026-07-18 bug-sweep findings (mobile strip separators, contact anchor specificity) are fixed in code: `site-pages.css` groups each middle dot with its fact via `.eng-page-strip-item`, and `contact.css` uses `section.eng-ct-form-plate { scroll-margin-top: 6rem }` to outrank the shared 4rem rule.

**Verified after the delimiter revision:** `npm run lint` exited 0 and `npm run build` statically exported all routes. Built titles read `About | FinTrace`, `Engagement &amp; pricing | FinTrace` and `Contact | FinTrace`; the home and 404 titles remain `FinTrace — Forensic financial analysis for legal matters`. Headed Chromium confirmed the three sub-page titles at 1440×900 and 390×900 with visible headings, zero horizontal overflow and zero application console/page errors.

**Workspace configuration:** `.vscode/launch.json` (npm dev on 3004) and `.gitignore` are present and fit; `public/` is not ignored by any rule.

### 2.2 The Core Problem

At plan start, the site's implementation was in a half-landed state: code truth, document truth and production truth disagreed. Steps 1–4 have now reconciled the local implementation, documentation and validation evidence. Production remains the only unsynchronised state until Step 5 commits, pushes, deploys and verifies the live URLs.

### 2.3 Affected User Scenarios

| Scenario | Impact today |
| --- | --- |
| Legal buyer visits `fintrace.com.au/about/` | 404 — page exists only locally |
| Anyone shares any fintrace.com.au URL on LinkedIn/Slack/X | No card image once deployed (og:image 404s); today, no social tags at all |
| Buyer bookmarks the site / views the tab | Off-brand graphite serif "FT" favicon |
| Buyer submits the contact form (once deployed) | Works against the real `xwvgoenw` endpoint — but the success path has never been proven live (user accepts this risk) |
| Next contributor reads DESIGN.md or the plans | Told the form ID is a placeholder and Step 8 is unimplemented — both false |

### 2.4 Technical Constraints (binding, from `AGENTS.md`)

- Static export only: no server runtime, API routes, dynamic runtime APIs or runtime image optimisation. No network visual assets — all page visuals are CSS, inline SVG, canvas or generated WebGL textures. The og:image and favicon files are **build artefacts fetched by crawlers and browser chrome**, not runtime page assets; this reading is already established for the og:image in `documents/learnings/fintrace_site_pages_plan.md` §4.2 and must be recorded in `AGENTS.md` (Step 3).
- British English, curly apostrophe `’`, no emoji, no Oxford comma in running copy. All claims ground in `/Users/sacino/fintrace/documents/reference/brand_naming_background.md`; the asset copy set is closed (Step 1).
- No new fonts: only Bricolage Grotesque and Fragment Mono (`src/app/engine-network/fonts.ts`). Never Inter/Roboto/Arial/system faces. The HTML templates used to render assets must load these exact faces.
- Validation gates: `npm run lint` zero errors; `npm run build` completes the export; `dev-browser` (headed) for browser checks, reusing `http://localhost:3004` if already running. Changed-route UI needs 1440x900 + 390x900 checks; **no step in this plan changes body markup on any route**, so no viewport matrix fires — but rendered tab-title/favicon checks are required (Step 4). Any `Hero.tsx` change would trigger the seven-viewport hero matrix; this plan makes none.
- Keep `DESIGN.md` truthful **in the same task** as every production design or interaction change (binding documentation-synchronisation rule).
- Do not edit `.next/` or `out/`. Do not touch lab routes (`/ledger`, `/trace`, `/clarity`, `/engine*`, `/exhibit`, `/chambers`, `/internal-design`).
- Multiple collaborators work concurrently; leave changes unrelated to this plan untouched.

### 2.5 Existing Infrastructure That Can Be Reused

- Engine tokens for asset production (from `src/app/engine-network/engine-network.css`): `--obsidian #0d0b09`, `--obsidian-2 #171310`, `--paper #f3ecdd`, `--gold #d4a94e`, `--gold-bright #f0d491`, `--gold-deep #8a6a2b`, hairline `rgba(212,169,78,0.22)`. Wordmark treatment: ivory `Fin`, luminous vertical gate bar, gold `Trace` (`.eng-wordmark`); gold type is always a gradient, never flat yellow.
- The `dev-browser` CLI (headed Chromium, Playwright Page API) for pixel-exact HTML-template screenshots and rendered checks; screenshots land in `~/.dev-browser/tmp/`.
- macOS `sips` for PNG resizing and dimension assertions; `python3` (stdlib only) for ICO container packing.
- The scratchpad directory for asset-template HTML files (never committed): `/private/tmp/claude-501/-Users-sacino-fintrace-root/d933b103-cf8a-47e7-b565-403bfd299dc7/scratchpad` — any session scratchpad works; only the final assets enter the repo.
- `gh` CLI for watching the Pages workflow run.

---

## 3. Desired State

### 3.1 Desired State Requirements

- **REQ-1 (MUST):** `public/images/og/fintrace-og.png` exists, measures exactly 1200×630, is under 300 KB, and renders only the closed copy set: the FinTrace wordmark treatment, the clause `Forensic financial analysis for legal matters` with exactly one gold-gradient span, and `fintrace.com.au` in Fragment Mono. Obsidian ground, engine tokens only.
- **REQ-2 (MUST):** `src/app/favicon.ico` (PNG-compressed entries at 16, 32 and 48 px) and `src/app/apple-icon.png` (exactly 180×180) exist, derived from one 512×512 master render of an on-brand mark: obsidian ground, `F` in `--paper` and `T` in gold gradient set in Bricolage Grotesque, separated by the luminous gold gate bar (the wordmark's motif at monogram scale).
- **REQ-3 (MUST):** `src/app/icon.svg` is replaced with an on-brand vector: obsidian `#0d0b09` rounded square and a centred luminous gold gate-bar slot built from geometry and gradients only — no `<text>` elements and no font references (SVG favicons cannot rely on webfonts, and system-font fallbacks are banned).
- **REQ-4 (MUST):** All four governing documents are truthful about the current state: `AGENTS.md`, `DESIGN.md`, `README.md` and `documents/learnings/fintrace_site_pages_plan.md` contain zero claims that the form ID is a placeholder, that OG metadata is unconfigured, or that Step 8 is unimplemented (Step 3 lists every stale passage).
- **REQ-5 (MUST):** The Formspree state is recorded exactly as: real public ID `xwvgoenw` shipped; live HTTP 200 submission and dashboard receipt deliberately not run (user decision); residual risk is that the success path is unproven until the first real enquiry.
- **REQ-6 (MUST):** `npm run lint` exits 0 and `npm run build` completes the static export with the new assets present in `out/` (`out/images/og/fintrace-og.png`, `out/favicon.ico`, `out/apple-icon.png`, `out/icon.svg`).
- **REQ-7 (MUST):** All work is committed on `main` and pushed; the `.github/workflows/deploy.yml` run completes successfully; the live site serves the four production pages, the branded 404, correct titles, social tags, og:image and icons (Step 5 checks).
- **REQ-8 (MUST NOT):** No page body markup, route CSS, scene code or copy changes on any route; `Hero.tsx`, `EngineNetworkPage.tsx`, all page components and all lab routes remain byte-identical to the pre-plan working tree. No `prefers-reduced-motion`, no new fonts, no analytics.
- **REQ-9 (MUST NOT):** No live Formspree submission is made and the form ID is not modified.
- **REQ-10 (SHOULD):** Asset-generation HTML templates stay out of the repository (scratchpad only); only the final binary assets are committed.

### 3.2 Verification Checklist

**Functional:**
- [x] `sips -g pixelWidth -g pixelHeight public/images/og/fintrace-og.png` → 1200 × 630; `stat -f%z` < 300000
- [x] `sips -g pixelWidth -g pixelHeight src/app/apple-icon.png` → 180 × 180
- [x] `python3` ICO inspection confirms 16/32/48 entries in `src/app/favicon.ico`
- [x] `grep -c "<text" src/app/icon.svg` → 0
- [x] Built pages emit `og:image` absolute URL, `og:site_name`, `twitter:card summary_large_image`, and `<link rel="apple-touch-icon"` / `favicon.ico` references

**Docs:**
- [x] Current-state records contain no placeholder Formspree claim; historical/superseded plan passages are explicitly contextualised
- [x] `documents/learnings/fintrace_site_pages_plan.md` header and Step 8 no longer read IN PROGRESS

**Deployment:**
- [x] `git status --porcelain` clean after implementation commit; push completed; `gh run watch` on deployment run `29636640457` exited success
- [x] Live About, Engagement, Contact, og:image, browser icons, four-location sitemap and branded 404 checks passed at `https://fintrace.com.au/`

---

## 4. Additional Context

### 4.1 User-Provided Context (blindspot-pass decisions, 2026-07-18)

1. **Formspree:** asked whether `xwvgoenw` is real and whether to run the live test gate, the user chose **"ID is real, skip live test"** — trust the ID without submitting; the success path stays unproven and the docs record that honestly. (The earlier site-pages plan required a live HTTP 200 + dashboard receipt before completion; this user decision supersedes that gate.)
2. **Deploy:** asked whether the plan should include commit + push + live verification, the user answered verbatim: *"We're still actively working on it; as part of it, it will push already. Just make that clear in the plan if it isn't already."* — i.e. pushing to `main` (and therefore deploying) is an explicit, expected part of completing this work. Step 5 makes it explicit.
3. **Scope extras:** offered favicon set, Safari/Firefox verification, accessibility review and analytics, the user chose **core completion plus the favicon/logotype set** ("1 + 2"). Safari/Firefox verification, the formal accessibility review, the analytics decision, mailbox verification and lab-route housekeeping remain deferred and must stay recorded as open work in `DESIGN.md` — do not silently drop them.

### 4.2 Background and Decisions

- This plan completes `documents/learnings/fintrace_site_pages_plan.md` (round seven + its Step 8). That plan's copy decks, form contract and Step 8 spec remain the source of truth for everything already implemented; this plan does not restate them, it finishes and reconciles them.
- Step 8's code side (metadata.ts, layout/page wiring and title template) was implemented by a concurrent collaborator session without updating the plan's status lines — hence the "not implemented" drift at the bottom of that file. The later `%s | FinTrace` delimiter supersedes that step's interim slash decision. Treat the working tree as truth.
- The og:image production method (HTML template + dev-browser screenshot at exact size) is the one specified in site-pages plan Step 8.2.6 and is reused for the icon master because it renders the real self-hosted fonts — `sips`/ImageMagick cannot.
- **Why PNG-entry ICO via python3 stdlib:** ICO containers have accepted PNG-compressed entries since Windows Vista; packing three PNGs with a hand-written ICONDIR header needs only `struct`, avoiding an ImageMagick dependency that may not be installed. If `magick` IS available, `magick icon-16.png icon-32.png icon-48.png src/app/favicon.ico` is an acceptable substitute — verify the entry table either way.
- **Why replace `icon.svg` rather than keep it:** it predates the brand (file comment says "Neutral design-lab favicon"), uses Georgia (banned family), and now serves production routes. Replacing it affects lab-route tabs too — acceptable because production identity governs.
- **Why geometry-only SVG:** SVG favicons cannot load webfonts reliably (and the no-network-assets rule forbids trying); outlining Bricolage glyphs by hand invites error. The gate bar is the brand's one approved pictogram motif; at 16–32 px a glyphless luminous slot reads cleaner than letterforms.
- Next.js App Router file conventions: `src/app/favicon.ico` serves at `/favicon.ico`; `src/app/apple-icon.png` serves at `/apple-icon.png` and injects `<link rel="apple-touch-icon">`; `src/app/icon.svg` continues to serve at `/icon.svg`. All are copied into `out/` by the static export — no `layout.tsx` changes needed for icons.
- Recent commit style is conventional commits (`docs(design): …`, `ci(pages): …`); keep it for Step 5.
- The three untracked 2026-07-18 bug-sweep XMLs under `documents/todo/bugs/codex/` are round-seven audit artefacts the plan record says are retained — they are committed with everything else in Step 5.

### 4.3 Source-Skill Application (per `/build-website`)

This plan executes inside the `/build-website` sequence, which requires applying its named source skills on every branch that fires, and reporting how each source resolved.

**Resolution caveat (report it):** this repository has no project-level `.agents/skills/` or `.codex/skills/` directory — the canonical resolution roots in `build-website`'s `references/source-skills.md`. Every applicable source instead resolves from the USER-LEVEL roots: `~/.claude/skills/<name>/SKILL.md` for most sources, and `~/.codex/skills/` for `post-change-documentation-sync` (directory of the same name), `vercel-composition-patterns` (directory `composition-patterns` — match by frontmatter name, not directory) and `imagegen` (hidden directory `~/.codex/skills/.system/imagegen/` — a `**` glob that skips dot-directories will miss it; use a hidden-dir-aware search). Per the skill's rule, the executor's final report MUST include a `Skill resolution` section listing each applied source with expected path (`.agents/skills/<name>/SKILL.md`) and actual path.

**Sources whose branches do not fire in this plan** (all exist at the paths above; do not report them missing):
- `$imagegen` — both assets are produced by deterministic HTML render + screenshot; imagegen's own frontmatter excludes exactly this case ("Do not use when… building the visual directly in HTML/CSS/canvas").
- `$vercel-composition-patterns` — no React component work occurs in this plan.

**Skill map for this plan's steps** (read each source's complete `SKILL.md` from `~/.claude/skills/` before acting on its branch; reconcile against `AGENTS.md`, which wins on conflict):
| Step | Source skills to apply | How they constrain the step |
| --- | --- | --- |
| 1–2 (assets) | `$better-colors`, `$better-typography`, `$dev-browser` | Assets reuse the existing engine hex tokens and the two locked faces only — no new colours, no new fonts, gold as gradient never flat; dev-browser produces the pixel-exact renders and evidence |
| 3 (docs) | `$design-md-creator` | DESIGN.md stays implementation-authoritative (no second token registry); the og:image/icon entries and drift rewrites follow its existing section structure and status labels |
| 4 (validation) | `$dev-browser` | Headed checks, session cleanup, screenshots under `~/.dev-browser/tmp/` with the `r8-*` prefix |
| 3–4 (after code changes, before handoff) | `$post-change-documentation-sync` (from `~/.codex/skills/post-change-documentation-sync/SKILL.md`) | Run its documentation check once implementation is complete; it complements — and must be reconciled against — the binding `AGENTS.md` doc-sync rule executed as Step 3 |
| 1–5 (throughout) | `track-implementation-plan-file` | Keep this plan file's step statuses and final solution record current in the same task |

**Sources whose branches do not fire in this plan** — `$better-ui`, `$fixing-accessibility`, `$frontend-design`, `$codebase-design`, `$vercel-react-best-practices`, `$domain-modeling`, `$context7`, `$fixing-motion-performance`, `$agents-md-creator` (AGENTS.md exists and is suitable; Step 3 only appends facts). No UI surfaces, interaction states, React components, module seams, dependencies or motion change here. Their prior application to the shipped site is real and verified: better-ui compliance was user-mandated from round two and its markers hold in the current tree (zero `transition: all` in production scope, press `scale: 0.96`, 44px in-flow footer/contact hit boxes, `:focus-visible` outlines, zero `will-change`); fixing-accessibility semantics shipped with the round-seven pages; the codebase follows deep-module shape (shared `EngineNetworkPage` behind two thin route wrappers, `SiteChrome`, `metadata.ts` as single sources of truth). REQ-8 exists precisely so this plan cannot regress any of that.

**Known skill-shaped gaps deliberately left open (user decision, §4.1.3 — keep them recorded in `DESIGN.md`):** `$better-colors`' contrast discipline is unmet in the formal sense (palette is hex not OKLCH; DESIGN.md records that rendered contrast pairs were never measured and no WCAG conformance is claimed) and `$fixing-accessibility`'s complete keyboard flows remain unverified beyond focus visibility. Both belong to the deferred accessibility review, not this plan. A full read of `$better-typography` against the production CSS also surfaced two micro-polish absences — no `font-synthesis: none` anywhere, and no `text-wrap: balance`/`pretty` on headings or descriptions — while confirming the rest of its checklist holds (woff2 via next/font, role-based clamp scale, 1.65 body line-height, tracking by size, measure caps, `tabular-nums`, curly punctuation, root font smoothing, styled `::selection`, 1rem/16px form inputs so iOS never zooms). Step 3 records both micro-items in `DESIGN.md`; implementing them is out of scope here because REQ-8 forbids CSS changes and each would trigger the two-viewport verification matrix. Note also that `$fixing-accessibility`'s "respect prefers-reduced-motion" rule is discarded under the source-reconciliation rule — the workspace's binding no-reduced-motion rule in `AGENTS.md` wins, as DESIGN.md already records.

---

## 5. Implementation Plan

### ~~Step 1: og:image asset~~ ✅ **COMPLETED**

**Objective:** Create the 1200×630 social-share image every built page already references, eliminating the crawler-visible 404.

#### 1.1 High-Level Approach

- Build a scratchpad HTML file styled with the engine tokens: `#0d0b09` ground (add the faint gold-dust turbulence film if trivial — optional), the FinTrace wordmark treatment (ivory `Fin`, luminous gate bar, gold-gradient `Trace`), the clause `Forensic financial analysis for legal matters` with one gold-gradient span, and `fintrace.com.au` in Fragment Mono, uppercase, wide tracking. Load Bricolage Grotesque and Fragment Mono in the template (Google Fonts `<link>` is fine in the scratchpad — the template never enters the repo).
- Screenshot with dev-browser at a viewport of exactly 1200×630, DPR 1, and save the capture to `public/images/og/fintrace-og.png` (creating `public/images/og/`).
- If the capture exceeds 300 KB, recompress (e.g. `sips -s format png` round-trip or reduce texture detail) until under.

**Success Criteria:**
- `sips -g pixelWidth -g pixelHeight public/images/og/fintrace-og.png` reports exactly 1200 and 630.
- `stat -f%z public/images/og/fintrace-og.png` < 300000.
- Visual check of the file: only the three approved copy elements appear; no emoji, no straight apostrophes, no unapproved claims.
- `git check-ignore public/images/og/fintrace-og.png` exits 1 (not ignored).

### ~~Step 2: Favicon/logotype set~~ ✅ **COMPLETED**

**Objective:** Replace the pre-brand neutral favicon with an on-brand icon set across SVG, ICO and apple-touch formats.

#### 2.1 High-Level Approach

- **Master render:** scratchpad HTML at 512×512 — obsidian ground (2 px hairline-gold inset optional), monogram `F` in `--paper` and `T` in the gold gradient (Bricolage Grotesque, weight ~700), separated by a luminous vertical gate bar (gradient `--gold-bright` core to transparent, echoing `.eng-wordmark`'s bar). Screenshot at 512×512 DPR 1 into the scratchpad.
- **Derive:** `sips -z 180 180` → `src/app/apple-icon.png`; `sips -z 48 48 / 32 32 / 16 16` → three scratchpad PNGs; pack them into `src/app/favicon.ico` with a python3 stdlib script writing the ICONDIR header + PNG entries (or `magick` if installed).
- **Vector:** rewrite `src/app/icon.svg` as geometry only: `viewBox="0 0 64 64"`, rounded-rect ground `#0d0b09` (keep `rx="12"`), centred vertical gate-bar slot using `<linearGradient>` stops from `#f0d491` through `#d4a94e`, plus a soft `<radialGradient>` halo. No `<text>`, no `font-family`, no external refs. Update the file comment to describe the production mark (imperative mood per `AGENTS.md` commenting standards).
- Sanity check at 16 px: the bar must remain visible against the ground (widen the slot rather than brightening beyond the token range if it vanishes).

**Success Criteria:**
- `sips -g pixelWidth -g pixelHeight src/app/apple-icon.png` reports exactly 180 and 180.
- `python3 -c` ICO-header inspection of `src/app/favicon.ico` reports exactly 3 entries with dimensions 16, 32 and 48.
- `grep -c "<text\|font-family" src/app/icon.svg` returns 0; `grep -c "0d0b09" src/app/icon.svg` returns ≥1.
- `npm run build` output contains `out/favicon.ico`, `out/apple-icon.png`, `out/icon.svg`; built HTML for `/` contains `rel="apple-touch-icon"`.
- dev-browser visit to `http://localhost:3004/` shows the new icon in the tab (screenshot of the tab strip or `document.querySelector('link[rel="icon"]')` assertions).

### ~~Step 3: Documentation reconciliation~~ ✅ **COMPLETED**

**Objective:** Make every governing document truthful about the shipped state, per the binding documentation-synchronisation rule. Historical round descriptions stay as written; only CURRENT-state claims change.

#### 3.1 High-Level Approach

- **`documents/learnings/fintrace_site_pages_plan.md`:**
  - Header: `🔄 **IN PROGRESS**` → completed marker matching the file's own step style.
  - Step 8 heading: `🔄 **IN PROGRESS**` → `✅ **COMPLETED**` once Steps 1–4 of this plan pass.
  - Replace the final two "Pending required validation" / "Pending implementation" bullets with an accurate record: real ID `xwvgoenw` shipped; live submission + dashboard receipt intentionally skipped (user decision, with the residual-risk sentence from REQ-5); Step 8 implemented including the og:image asset and this plan's icon set; titles verified in the built output.
  - Update the REQ-4 / §4.2 / Step 4 passages that say the placeholder ships "until the user supplies the real ID" to past-tense record (search `REPLACE_WITH_FINTRACE_FORM_ID` — five hits at lines 132, 152, 415, 424, 657 of the current file).
- **`DESIGN.md`:**
  - "Approved Exceptions and Drift": rewrite the known-drift bullet — form ID is real (`xwvgoenw`), OG/social metadata and the favicon set are now configured; the remaining drift items are the unverified mailbox and no analytics.
  - "Shapes → Icons": amend "there is no icon set" to record the favicon set (icon.svg gate-bar mark, favicon.ico 16/32/48, apple-icon 180) as browser-chrome assets, not page iconography.
  - Add the og:image (1200×630, path, closed copy set, HTML-render production method) and icon set to the source map / brand-asset record per site-pages plan Step 8.3.
  - Update the status legend's "Approved, pending production form activation" wording — activation has happened.
- **This implementation record:**
  - Record the three blindspot decisions from §4.1, the assets created (paths, dimensions and method), the documentation reconciliation, validation results and the Step 5 deployment evidence in the Implemented Solution section.
  - Keep mailbox verification, the analytics decision, Safari/Firefox, the accessibility review and lab housekeeping listed as deferred work.
- **`AGENTS.md`:** record `src/lib/metadata.ts` as the single source of truth for site/page titles, descriptions and social metadata, and record `public/images/og/` + the icon files as static build artefacts fetched by crawlers/browser chrome — not runtime visual assets (the approved reading).
- **`README.md`:** no change required unless its structure prose now misstates something — read it once and touch only if inaccurate.

**Success Criteria:**
- Current-state read-through across `AGENTS.md`, `DESIGN.md`, `documents/learnings/fintrace_design_plan.md` and `documents/learnings/fintrace_site_pages_plan.md` contains no placeholder Formspree claim. The former README and superseded plan paths are absent following documentation consolidation.
- `grep -n "IN PROGRESS" documents/learnings/fintrace_site_pages_plan.md` returns 0 hits.
- `grep -c "xwvgoenw" DESIGN.md documents/learnings/fintrace_site_pages_plan.md` reports at least one hit in each file, adjacent to the skip-live-test decision record.
- `AGENTS.md` names `src/lib/metadata.ts` and the build-artefact reading (manual read-through).
- This plan's Implemented Solution covers every completed item above (manual read-through against this step's list).

### ~~Step 4: Full validation suite~~ ✅ **COMPLETED**

**Objective:** Run and record every check the site-pages plan's §6.4 defines, plus this plan's asset checks, before anything is committed.

#### 4.1 High-Level Approach

- `npm run lint` then `npm run build` on the completed tree.
- Static assertions on `out/` (exact commands in §6.3).
- dev-browser (reuse a running `http://localhost:3004`, else start one): visit `/`, `/about/`, `/engagement/`, `/contact/` — assert rendered `document.title` values, zero console/page errors, and the icon link tags. No body markup changed in this plan, so no viewport matrix fires; do not touch `Hero.tsx`.
- Record results in this plan's Implemented Solution section.

**Success Criteria:**
- Every command in §6.3 produces its expected result.
- Zero console errors and zero page errors on all four routes.
- This plan's Implemented Solution states each validation result with its evidence prefix (`r8-*` screenshots under `~/.dev-browser/tmp/`).

### ~~Step 5: Commit, push, deploy and live verification~~ ✅ **COMPLETED**

**Objective:** Land the complete production site on `main`, deploy through the existing Pages workflow and prove the live result — the explicit final act of this work per the user's decision.

#### 5.1 High-Level Approach

- Stage everything belonging to this work: the modified tracked files, the untracked round-seven directories (`src/app/about/`, `src/app/contact/`, `src/app/engagement/`, `src/app/engine-network/SiteChrome.tsx`, `site-pages.css`, `src/app/not-found.tsx`, `not-found.css`), `src/lib/`, the new assets (`public/`, `src/app/favicon.ico`, `src/app/apple-icon.png`, `src/app/icon.svg`), the three 2026-07-18 bug-sweep XMLs, this plan file and all documentation updates. Verify with `git status --porcelain` that nothing unexpected remains.
- Commit on `main` in the repo's conventional-commit style, e.g. `feat(site): complete production pages, social metadata and brand icons`, with a body summarising pages, metadata, assets and doc sync.
- `git push origin main`, then `gh run watch` (or `gh run list --workflow=deploy.yml --limit 1` + `gh run watch <id>`) until the Pages workflow completes.
- Live checks with `curl` against `https://fintrace.com.au` (§6.3 table). GitHub Pages CDN can serve stale content briefly — retry up to ~5 minutes before treating a mismatch as failure.
- Record the run ID, commit SHA and live-check results in this plan's Implemented Solution section (same task).

**Success Criteria:**
- `git status --porcelain` is empty after the commit; `git log --oneline -1` shows the new commit on `main`; push succeeds.
- The deploy workflow run concludes `success`.
- Every live check in §6.3's production table passes (HTTP 200s, title strings, og:image content-type `image/png`, 4 sitemap `<loc>` entries, branded 404 markup on an unknown route).
- This plan records the SHA, run ID and results.

---

## 6. Testing Plan

No automated test suite exists (per `AGENTS.md`); validation is lint + build + static-artefact assertions + headed dev-browser evidence + live production checks.

### 6.1 Source-of-Truth Artefacts

| Artefact | Why it matters | Expected behaviour |
| --- | --- | --- |
| `documents/todo/bugs/codex/combined_bug_sweep_20260718_k3p9d2w7.xml` | The round-seven audit's two real CSS defects (mobile strip separators; contact anchor specificity) | Both remain fixed: `site-pages.css` contains `.eng-page-strip-item`; `contact.css` contains `section.eng-ct-form-plate { scroll-margin-top: 6rem }` — grep both before commit |
| `src/app/contact/ContactForm.tsx` line 6 | The real Formspree ID whose truth this plan records | Still reads `FORMSPREE_FORM_ID = 'xwvgoenw'` at commit time — grep; never submitted, never reverted |
| `documents/learnings/fintrace_site_pages_plan.md` §6.4 | The Step 8 validation contract this plan executes | Every §6.4 row passes via the commands below |
| `/Users/sacino/fintrace/documents/reference/brand_naming_background.md` | The closed claim set governing asset copy | og:image and icon assets contain only wordmark, approved clause and domain |

<critical_warning>
> **CRITICAL WARNING:** The two bug-sweep XML findings are regression sources of truth — verify their fixes by grepping the exact selectors above in the real stylesheets, not by re-reading the plan's claim that they were fixed.
</critical_warning>

### 6.2 Static Assertions (run in Step 4, after lint and build)

| Check | Command | Expected Result |
| --- | --- | --- |
| Lint | `npm run lint` | Exit 0, zero errors |
| Build | `npm run build` | Static export completes; `out/images/og/fintrace-og.png`, `out/favicon.ico`, `out/apple-icon.png` exist |
| Titles | `grep -o "<title>[^<]*</title>" out/index.html out/about/index.html out/engagement/index.html out/contact/index.html out/404.html` | `FinTrace — Forensic financial analysis for legal matters` (home + 404), `About | FinTrace`, `Engagement &amp; pricing | FinTrace`, `Contact | FinTrace` |
| Social tags | `grep -c "og:image\|twitter:card\|og:site_name" out/index.html out/about/index.html out/engagement/index.html out/contact/index.html out/404.html` | Every file ≥1 per tag; og:image URL is the absolute `https://fintrace.com.au/images/og/fintrace-og.png` |
| og dimensions | `sips -g pixelWidth -g pixelHeight public/images/og/fintrace-og.png` | 1200 × 630; `stat -f%z` < 300000 |
| Apple icon | `sips -g pixelWidth -g pixelHeight src/app/apple-icon.png` | 180 × 180 |
| ICO entries | python3 stdlib header read of `src/app/favicon.ico` | 3 entries: 16, 32, 48 |
| SVG purity | `grep -c "<text\|font-family" src/app/icon.svg` | 0 |
| Sitemap | `grep -c "<loc>" out/sitemap.xml` | Exactly 4 |
| Internal leak | `grep -rn "internal-design" out/index.html out/about/index.html out/engagement/index.html out/contact/index.html out/404.html` | Zero hits |
| Regression greps | `grep -c "eng-page-strip-item" src/app/engine-network/site-pages.css` and `grep -c "section.eng-ct-form-plate" src/app/contact/contact.css` | ≥1 each |
| Form ID | `grep -c "xwvgoenw" src/app/contact/ContactForm.tsx` | Exactly 1 |
| Scope guard | `git diff --stat -- src/app/engine-network/Hero.tsx src/app/engine-network/EngineNetworkPage.tsx src/app/about src/app/engagement src/app/contact src/app/not-found.tsx` compared before/after this plan's steps | No changes introduced by this plan (round-seven diffs remain as found) |
| Whitespace | `git diff --check` | Clean |

### 6.3 Integration Scenarios

1. Rendered metadata and icons (dev-browser, headed, 1440x900)
   - Action: visit `/`, `/about/`, `/engagement/`, `/contact/` on `http://localhost:3004`; read `document.title`; query `link[rel="icon"]` and `link[rel="apple-touch-icon"]`; collect console/page errors.
   - Expected: titles match §6.2; both link tags resolve; zero errors.
   - Verify: scripted assertions + `r8-*` screenshots.
2. Deploy pipeline (Step 5)
   - Action: push `main`; watch the `deploy.yml` run.
   - Expected: workflow concludes `success` with lint, build, upload and deploy steps green.
   - Verify: `gh run watch` exit status; run URL recorded in this plan.
3. Live production (after deploy; retry ≤5 min for CDN propagation)
   - Action and expected, all via `curl -s` / `curl -s -o /dev/null -w "%{http_code} %{content_type}"`:
     - `https://fintrace.com.au/about/` → 200, body contains `About | FinTrace`
     - `https://fintrace.com.au/engagement/` → 200, body contains `Engagement &amp; pricing | FinTrace`
     - `https://fintrace.com.au/contact/` → 200, body contains `Contact | FinTrace` and `formspree.io/f/xwvgoenw`
     - `https://fintrace.com.au/images/og/fintrace-og.png` → 200, `image/png`
     - `https://fintrace.com.au/favicon.ico` → 200; `https://fintrace.com.au/apple-icon.png` → 200
     - `https://fintrace.com.au/sitemap.xml` → 200 with exactly 4 `<loc>` entries
     - `https://fintrace.com.au/nope/` → 404 status, body contains the branded `No trace of this page.` copy
   - Verify: command outputs recorded in this plan's Implemented Solution section.

---

## Implemented Solution

### Current delivery state

- Steps 1–5 are implemented and validated. The production implementation was committed as `9a0032235e2f10a1a141c568104728960490c9fa`, pushed to `origin/main` and deployed through GitHub Pages run `29636640457`.
- The plan-level status is complete because every implementation, documentation, audit, local-validation, deployment and live-production gate has passed.

### Assets and implementation

- `public/images/og/fintrace-og.png` now supplies the site-wide crawler image at exactly 1200×630 and 291,784 bytes. It uses the approved FinTrace identity, home-title clause and domain on the Engine Network visual system.
- `src/app/icon.svg` now supplies the geometry-only luminous gate mark without text, font references or external resources.
- `src/app/favicon.ico` now supplies PNG-compressed RGBA entries at 16×16, 32×32 and 48×48.
- `src/app/apple-icon.png` now supplies the 180×180 Apple icon. The ICO and Apple icon derive from the same 512×512 DPR-1 Bricolage Grotesque monogram render.
- `src/lib/metadata.ts`, `src/app/layout.tsx` and `src/app/page.tsx` centralise the site identity, page title/description pairs, canonical origin and social metadata while preserving the absolute homepage title.

### Documentation reconciliation

- `AGENTS.md` now records `src/lib/metadata.ts` as the metadata source of truth and classifies the social image and browser identity files as static-export crawler/browser-chrome artefacts.
- `DESIGN.md` now records the social image, icon set, production metadata ownership, real Formspree validation boundary and deferred accessibility/browser/analytics work.
- `documents/learnings/fintrace_site_pages_plan.md` is completed and records the central metadata, social image, icon set, title validation and real public Formspree form ID `xwvgoenw`.
- `documents/learnings/fintrace_design_plan.md` records the round-ten asset, metadata, documentation and validation result. Its deployment record remains explicitly pending until Step 5 completes.
- `README.md` is absent following the repository’s documentation consolidation, so there was no current README claim to reconcile.

### Decisions and deferred work

- The real public Formspree ID `xwvgoenw` ships unchanged. A live HTTP 200 submission and dashboard receipt were deliberately not run by user decision, so the production success path remains unproven until the first real enquiry.
- Commit and push to `main`, the Pages workflow and live-site verification completed under Step 5.
- Safari/Firefox verification, formal accessibility review, rendered contrast measurement, notification-mailbox verification, analytics and lab-route housekeeping remain deferred by user decision.
- Asset-generation HTML and intermediate icon renders remained outside the repository; only the final static artefacts were retained.

### Validation evidence

- Node `22.23.1`, `npm run lint`, `npm run build`, `git diff --check` and the `DESIGN.md` compatibility validator passed on the completed Steps 1–4 tree.
- Static assertions passed for the 1200×630, 291,784-byte social image; 180×180 Apple icon; ICO RGBA PNG entries at 16/32/48 px; geometry-only SVG; icon and social metadata links; five title outputs; four-location sitemap; internal-design link exclusion; Formspree ID and both CSS regression selectors.
- Headed Chromium passed on `/`, `/about/`, `/engagement/`, `/contact/` and the branded unknown route at 1440×900 and 390×900. Exact titles, favicon and Apple icon links, the absolute social-image URL, horizontal overflow and application console/page errors all met the contract. The expected browser diagnostic for the 404 document was excluded from application-error counts.
- Round-eight evidence is stored under `~/.dev-browser/tmp/` with the `r8-*` prefix: desktop and mobile captures for home, About, Engagement, Contact and the branded 404, plus `r8-og-final-compressed.png` and `r8-icon-master.png`.
- The requested two-worker post-change audit produced `subagent_bug_sweep_20260718_q8m3v6n2.xml`, `subagent_bug_sweep_20260718_u4m7q2x9.xml` and consolidated `combined_bug_sweep_20260718_n5c8r2v4.xml`. The asset/metadata partition found no defect. Both documentation findings were independently verified as real, fixed in this plan, `DESIGN.md` and `documents/learnings/fintrace_design_plan.md`, then revalidated.
- The intentionally skipped live Formspree submission is not represented as passed. This user-approved exclusion does not block completion because the real public ID and residual risk are explicitly recorded.

### Deployment and live-production evidence

- Implementation commit `9a0032235e2f10a1a141c568104728960490c9fa` pushed from `main` to `origin/main` with a clean post-commit working tree.
- GitHub Pages run `29636640457` completed successfully: dependency install, lint, static build, artefact upload and Pages deployment all passed. GitHub emitted non-blocking maintenance warnings that the current action versions target Node.js 20 and were forced onto Node.js 24.
- Live HTTP checks returned 200 for `/`, `/about/`, `/engagement/`, `/contact/`, `/favicon.ico`, `/apple-icon.png`, `/icon.svg`, `/images/og/fintrace-og.png` and `/sitemap.xml`; the unknown route returned the required 404.
- Live titles match the five built-title assertions. Contact contains `formspree.io/f/xwvgoenw` without any submission. The sitemap exposes exactly four `<loc>` entries, and the 404 contains both parts of “No trace of this page.” in its streamed markup.
- The live social PNG reports `image/png` and SHA-256 `3890469100973392ce1d915e2c0094276c3f3e7db0cdf8c714ea06f4fb06dac7`, exactly matching the verified local 291,784-byte source.

### Skill resolution

| Applied source | Expected path | Actual path |
| --- | --- | --- |
| `better-colors` | `.agents/skills/better-colors/SKILL.md` | `/Users/sacino/.agents/skills/better-colors/SKILL.md` |
| `better-typography` | `.agents/skills/better-typography/SKILL.md` | `/Users/sacino/.agents/skills/better-typography/SKILL.md` |
| `dev-browser` | `.agents/skills/dev-browser/SKILL.md` | `/Users/sacino/.agents/skills/dev-browser/SKILL.md` |
| `design-md-creator` | `.agents/skills/design-md-creator/SKILL.md` | `/Users/sacino/.agents/skills/design-md-creator/SKILL.md` |
| `track-implementation-plan-file` | `.agents/skills/track-implementation-plan-file/SKILL.md` | `/Users/sacino/.agents/skills/track-implementation-plan-file/SKILL.md` |
| `post-change-documentation-sync` | `.agents/skills/post-change-documentation-sync/SKILL.md` | `/Users/sacino/.codex/skills/post-change-documentation-sync/SKILL.md` |
| `post-change-subagent-audit` | `.agents/skills/post-change-subagent-audit/SKILL.md` | `/Users/sacino/.codex/skills/post-change-subagent-audit/SKILL.md` |
| `post-audit-bug-fixer` | `.agents/skills/post-audit-bug-fixer/SKILL.md` | `/Users/sacino/.codex/skills/post-audit-bug-fixer/SKILL.md` |
