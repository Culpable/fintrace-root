# FinTrace Design Lab - Implementation Plan & State

## Why (context and goal)

FinTrace is the new brand name for the Statement Analysis (SA) tool (`/Users/sacino/statement-analysis`): a forensic financial analysis service that converts bulk PDF bank statements (any bank, any order, scanned paper included, no pre-sorting) into a single structured, source-traceable Excel ledger (file name, person, date, financial year, description, debit/credit, amount, category), auto-categorises transactions (Woolworths -> groceries), flags suspicious activity (cash-withdrawal patterns, gambling/crypto, transfers between related accounts, cross-currency matches such as rupee-to-AUD via Wise), and produces a written findings report with every finding traceable to its exact source PDF page (human-verifiable, no hallucination risk). Proven value: a ~50 hour manual lawyer job completed in ~10, findings matching the lawyer's independent analysis; real matters run to thousands of pages, ~50 accounts, 15 years.

Buyers: lawyers in document-heavy financial disputes (family law is the proven wedge), government legal bodies (Public Trustee / Dept of Justice), misappropriation and elder financial abuse matters, forensic accountants, insolvency practitioners. Trust and credibility are the biggest barrier (LexisNexis-grade gravitas benchmark). Positioned as a service, not software (flat cost + per-page pricing, engaged per matter). Mock contact used in copy: hello@fintrace.com.au; CTA style "Request a matter assessment".

Full brand brief: `/Users/sacino/statement-analysis/documents/reference/brand_naming_background.md`

Goal of this repo (`/Users/sacino/fintrace`): build multiple unique, extremely polished candidate homepage designs, each on its own route, so the team can compare working pages and pick a brand direction. Wow factor required; all must align with the product's purpose and carry a FinTrace-specific brand voice.

## Decisions locked in via blindspot pass (user-approved, round one)

1. Stack: Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript, App Router, static export (`output: 'export'`, `images.unoptimized`, `trailingSlash`), dev port 3004 (unique in workspace; 3000-3003, 4021, 4022, 4031, 5001 taken). Scaffolding mirrors `/Users/sacino/bulma-root/demo` (modern variant of the Embeddings pattern).
2. Scope: each design is a FULL self-contained homepage (hero, product narrative/how-it-works, capabilities/findings, proof/credibility, who-it's-for, CTA, footer) with its own typography, palette, and motion system. A neutral gallery index at `/` links to everything.
3. Copy: shared core facts from the brand brief, headlines/tone tuned per design concept. Each design gets its own typographic FinTrace logotype. British English, curly apostrophes (’), no emoji.
4. Animation budget: bespoke CSS/SVG/Canvas + scroll-driven animation throughout; WebGL/three.js permitted for 1-2 showpiece designs.
5. Count: exactly 6 designs, full aesthetic range (conservative legal-grade trust through bold dark forensic/investigative).

## Technical rules (binding for all agents)

- Static export only: no server runtime, no API routes, no next/image optimisation. Fonts via `next/font/google` (self-hosted at build); never Inter/Roboto/Arial/system fonts. No external/network assets - all visuals are CSS, inline SVG, canvas, or generated WebGL textures.
- Isolation: each route owns its complete visual system in its folder - `page.tsx` (server component + metadata), scoped `<route>.css` (ALL rules nested under a `.dsn-<route>` wrapper class - this is what prevents cross-page style bleed during client-side navigation), `fonts.ts`, colocated `'use client'` components. `globals.css`/`layout.tsx` stay minimal/neutral. `three` is dynamically imported inside WebGL routes only.
- `@keyframes` names are DOCUMENT-GLOBAL (not scoped by the `.dsn-*` wrapper): any keyframes duplicated across route stylesheets silently collide under client-side navigation (last loaded wins). Every route must prefix its keyframe names uniquely (round three uses `ecm-`/`ecmr-`/`eclm-`/`ecmnet-`/`ecmf-` for the shared match diagram).
- Animations: transform/opacity wherever possible; IntersectionObserver scroll triggers; passive listeners; rAF/WebGL loops pause when tab hidden or element offscreen; canvas DPR capped at 2; rAF clock deltas clamped to [0, 0.05] (Chrome's first rAF timestamp can predate the start clock - unclamped, this crashed the original /trace hero via a negative array index); full three.js disposal on unmount; WebGL renderer construction wrapped in try/catch so a missing GL context leaves the designed static fallback instead of crashing the React tree. NEVER add `prefers-reduced-motion` gates (workspace rule).
- WebGL hero FRAMING BUDGET (learned in round three - three of five reworked heroes shipped off-frame on first pass): with the engine-family camera (fov 34°, lookAt(0, 0.1, 0), desktop z=10.5/aspect 1.6, mobile z=14/aspect 0.433), the usable stage-local x limit at depth z is ≈ (10.5 − z) × 0.489 − 1.1 (stage shift) − 0.95 (camera drift 0.35 + pointer parallax 0.6) on desktop → ≈3.1 at z=0; and ≈ (14 − z) × 0.1324 − stage shift − 0.35 on mobile → ≈1.5 at z=0 with no shift. Designed post-gate structures must fit inside this budget at MAX camera sway (spread vertically, use −z depth for extra width, and shift `stage.position.x` to −0.7 on mobile so the output band right of the gate widens to ≈2.2). Any scene layout change requires a visual screenshot check at both viewports - frustum maths sets the budget, but only the browser proves it.
- better-ui skill compliance (user-mandated from round two onward, skill at `~/.claude/skills/better-ui/`): active press scale 0.96 with explicit transition-property lists (never `transition: all`), >=44px hit areas (pseudo-element extensions), concentric border radii on nested rounded pairs, layered low-opacity shadows for elevation (hairline borders kept where they are the design language / dividers), interruptible hover/press transitions, visible focus states.
- Responsive: clean at 1440x900 and 390x900, zero horizontal overflow.
- Parallel workers must not run `npm run dev`/`npm run build`/git (shared `.next` conflicts) - the coordinating agent validates centrally. Workers MAY verify their own route visually via `dev-browser` against the already-running dev server, using a unique page name per worker to avoid collisions.
- Validation gate per round: `npm run lint` (zero errors), `npm run build` (static export completes), browser verification of every page at 1440x900 + 390x900 (console errors, page errors, horizontal overflow, animation rendering), plus headed-browser (real GPU) verification for WebGL scenes.

---

## ~~Round one: six designs~~ ✅ **COMPLETED**

All built by six parallel fork agents, validated (lint/build/browser both viewports/headed WebGL), committed (`6f3ad31` scaffold, `1b965a4` designs).

1. `/ledger` - "The Ledger". Light editorial broadsheet: ivory paper, Fraunces display serif, ruled ledger lines, oxide-red accents, self-reconciling ledger hero (rows enter, chips stamp, $9,500 ATM withdrawal flagged). Voice: calm authority ("Every dollar, accounted for.").
2. `/trace` - "Follow the Money". Dark investigative evidence board: ink navy, red thread drawing through a canvas account network, cross-currency "MATCHED" set-piece (₹15,40,000 -> A$28,004 via Wise). Archivo + IBM Plex Mono. Voice: investigative ("Money leaves a trail.").
3. `/clarity` - "Chaos to Clarity". Swiss grid: strewn scanned pages snap into a live spreadsheet (replayable), 50-vs-10-hour proportional bars. Familjen Grotesk + Spline Sans Mono, white + cobalt.
4. `/engine` - "The Evidence Engine". WebGL/three.js showpiece: paper documents stream through a glowing golden gate ring and emerged (originally) as a burst of ~950 gold points locking into a point lattice. Obsidian + champagne gold, Bricolage Grotesque + Fragment Mono. Voice: engineering-grade rigour.
5. `/exhibit` - "The Exhibit". Brutalist court exhibit: stamped headline with ink bleed, EXHIBIT FT-01 stamp, typed matter register, finding cards that flip to their source excerpt, footnote source register. IBM Plex Mono + Archivo Black, white/black/stamp red.
6. `/chambers` - "Chambers". Quiet luxury: letterpress reveal, twin gold hairlines, wax-seal FT monogram, parchment invitation CTA. Cormorant Garamond + EB Garamond + Cinzel on deep green.

Defects found and fixed during round-one verification: /trace negative-dt first-frame crash (clamped); /engine blank page when WebGL unavailable (try/catch + persistent fallback); three react-hooks lint errors (engine/Reveal ref-in-render -> React 19 callback ref; engine/Scene ref write in render -> effect; exhibit/HeroRegister closure mutation -> loop); ledger mobile table masthead cramping (stacked). Favicon `src/app/icon.svg` added.

## User feedback on round one (verbatim intent)

- `/engine/` is the BEST overall: design, font, colour scheme; most unique in a non-tacky way. BUT the "dust" coming out of the gate doesn't make sense (paper going in is loved; the point-burst output reads as meaningless).
- `/trace/`: likes the diagrams/drawings - the hero network background and the "CROSS-CURRENCY MATCH - RECONSTRUCTED" set-piece. NOT a fan of trace's font or colour scheme.
- `/ledger/`: decent; font pretty good, logo decent, likes the table - though it "looks like it has some errors in it". Diagnosis: the data arithmetic is correct (balances reconcile to 13,098.05); the perceived errors are the flagged-row red rule rendering as broken disconnected fragments (SVG rect with `preserveAspectRatio="none"` + dash animation distorting the stroke). Does NOT like the white + black palette.
- Direction set by user: keep `/engine/` AS-IS as the reference; build VARIATIONS of it to compare across. Liking an element (e.g. ledger's font) does not obligate using it. All designs must align with the better-ui skill.

## ~~Round two: five Evidence Engine variations~~ ✅ **COMPLETED** (V4/V5 superseded in round three)

User-approved plan (via follow-up Q&A): build all five variants; use ALL THREE proposed hero-output treatments distributed across them. Every variant replaces the post-gate "dust" with legible structured output, keeps the document stream + gate untouched, and carries the better-ui pass. `/engine/` untouched (git-verified). Built by five parallel forks, validated, committed (`bd8cf99`).

1. `/engine-refined` - CONTROL. Hero: documents become thin record slabs with baked CanvasTexture ledger rows (salary, flagged ATM, Wise cross-currency, groceries) that lock into a drifting 4x3 lattice with overshoot. Otherwise identical to base + better-ui.
2. `/engine-trace` - hero: gold-edged evidence cards ("FT-0114 · p. 214 · VERIFIED") in a fanned arc joined by gold filaments (one crimson pair). New `#tracing` section: account network trace redrawn in gold + cross-currency MATCHED set-piece (CSS offset-path behind @supports). Trace's old font/colours dropped entirely.
3. `/engine-ledger` - hero: documents dissolve into cells tiling one growing spreadsheet plane (7x22 instanced cells). New `#ledger` section: the reconciling table on an obsidian machined plate, flag rule rebuilt as a CONTINUOUS draw (the round-one fragmentation defect is impossible by construction).
4. ~~`/engine-serif`~~ - typography A/B (Fraunces display). REMOVED in round three (user kept the base font).
5. ~~`/engine-light`~~ - parchment inversion. REMOVED in round three (user wants dark mode only).

## User feedback on round two (verbatim intent)

- Dark mode only; no light mode.
- Keep the font as per the original `/engine/` (Bricolage Grotesque + Fragment Mono) - no font changes; it is the pairing the other variants use.
- `/engine-refined/` has the right idea but is "way too busy" - a lot less going on needed (too many items).
- `/engine-ledger/` is a good idea but unclear what's going on; the hero RHS must look more like a spreadsheet.
- `/engine-trace/` has the right idea but looks "off": the card connections read as "a string with cards connected to it" - the connections need rework.
- Serif and Light: redo into two NEW dark variations on the original font, and use the opportunity to redesign the hero RHS as something "Trace"-related - closer to the `/trace/` trace diagrams.
- In ADDITION to everything already on the engine variation pages, every variation must include a diagram like /trace's "CROSS-CURRENCY MATCH - RECONSTRUCTED" - restyled to the engine palette, with the overlap fixed (in /trace the MATCHED badge overlapped the travelling A$28,004 chip at landing, and the right-hand station labels clipped the viewBox edge).

## ~~Round three: feedback pass on the five variations~~ ✅ **COMPLETED**

Executed by four parallel fork agents + coordinator (refined/ledger/trace reworked in place; network/flow built fresh from the committed engine-refined state; engine-serif and engine-light deleted). All validated: lint zero errors, static build green (14 routes), browser verification of all changed pages at 1440x900 + 390x900 with zero console errors, zero page errors, zero horizontal overflow, all five WebGL scenes rendering on a real GPU (headed Chromium via dev-browser).

### The shared cross-currency match set-piece (all five variation pages)

Each route owns a server-component `CurrencyMatch.tsx` + an `ecm-*` CSS block scoped under its `.dsn-*` wrapper (keyframes uniquely prefixed per route). Canonical FIXED geometry, designed so the round-two overlap cannot recur: viewBox `0 0 560 200`; route path `M 76 118 Q 178 52 280 118 Q 382 52 484 118`; stations at x 76 (HDFC ****3321 / OUT ₹15,40,000 · 04 APR), 280 (WISE / FX 0.01818), 484 (ANZ ****4417 / IN A$28,004 · 04 APR), node y 118, names y 144, subs y 162; travelling chip rect x −48, y −40, 96x24 (lands in band y 78-102); MATCHED plate rect (440, 40) 88x24 (band y 40-64) - a permanent 14-unit clear gap between plate and landed chip, and all labels inside the widened viewBox. Choreography unchanged from round two: 9 s loop, chip departs HDFC, dwells at Wise while ₹ swaps to A$, lands at ANZ, MATCHED stamps; armed by the route's Reveal (`.eng-reveal.is-visible`), motion gated behind `@supports (offset-path: …)`. Placement: new `#match` section (kicker "Traced across currencies", h2 "Same funds. Two currencies. One match.") - after Process on refined/network/flow, after `#ledger` on engine-ledger; engine-trace keeps its diagram inside `#tracing`.

### Per-route outcomes

1. `/engine-refined` (calmed): SLAB_COUNT 28→9 desktop / 12→5 mobile on a SINGLE depth layer (3 rows, row gap 0.62), slabs evenly phase-spaced (i/SLAB_COUNT) at scale 1.15/0.9 with reduced scatter (±0.5 y, ±0.25 z) and slower drift (~0.045); DOC_COUNT 26→12 / 12→7; DUST_COUNT 260→110 / 120→60 at opacity 0.24. Bug fixed en route: the four instanced slab meshes previously allocated `ceil(SLAB_COUNT/4)` instances uniformly, which at 9 slabs would render never-written identity-matrix instances as frozen slabs at the gate - each mesh now allocates exactly what the round-robin writes.
2. `/engine-ledger` (spreadsheet hero): the cell mosaic (cells/chips/grid-plane) is gone. One sheet plane (length 7.2), pivoted at stage-local (1.9, 0, 0.2) and yawed +1.0 rad into −z depth so all five columns fit the frustum (far end fades into fog - on-language), carrying a 1024x330 baked canvas: header band DATE | DESCRIPTION | DEBIT | CREDIT | CATEGORY, `#` row gutter (1-8), gold hairline gridlines rgba(212,169,78,0.26), alternating row shading, outlined category chips, eight grounded rows (Woolworths/groceries, salary, ATM −9,500.00 CASH in crimson #e0503a, BP fuel, internal transfer, Wise AUD→INR cross-ccy, Sportsbet gambling, rent). 13.2 s cycle: rows land at 0.9 s + n×1.1 s with a bright entry band, dwell, fade-out, invisible reset; canvas redraws only on row events (~10 per cycle, never per frame). Mobile: stage shift −0.7, sheet at (0.35, 0, 0.2), scale 0.35, yaw 0.75.
3. `/engine-trace` (docked network): fanned queue + string-of-cards polyline replaced by a fixed branching tree the cards dock into. Desktop 7 slots: root (1.7, 0, 0); branches (2.45, ±1.05, ∓0.4/0.35); four leaves x 3.15-3.45, y ±0.62/±1.8, z −0.25..−0.9 (deeper where wider); CARD_SCALE 0.92. Mobile 5 slots (root 0.4, leaves ≤1.95, scale 0.6, stage shift −0.7). Connectors join card border midpoints (±CARD_W/2 × scale) - lines never cross a card face; each draws in over 0.6 s only after BOTH endpoint cards dock; one leaf edge crimson #b3231f with a warming leaf card. 26 s cycle: cards emerge every 1.6 s through the gate, arc-fly 2.2 s, overshoot-dock; dwell with 3 pulse motes hopping edges; whole constellation drifts +4.5 x and fades into fog; rebuild. Hero fallback SVG updated to echo the network. CurrencyMatch geometry + offset-path fixed per the canonical spec.
4. `/engine-network` - NEW V4, "Network" (replaces engine-serif; dark, base fonts). Post-gate output = account-network constellation: 8 ringed, mono-labelled nodes (ANZ ··4417 hub at (2.2, 0.1, −0.2); WISE, CBA ··0092, CASH ATM flag, AMEX ··3010, HDFC ··3321, NAB ··7793, BTC WALLET; BTC parented to CBA to keep the graph crossing-free), threads terminating at ring rims (offset 0.27 × NODE_SCALE), CASH ATM edge crimson with pulsing ring. 28 s cycle: births every 1.4 s from the gate, glide + ring scale-in, threads draw in 0.9 s, dwell with 3 gold pulses running the spokes, drift +3.4 into fog, reassemble. NODE_SCALE 0.9 desktop / 0.62 mobile; mobile 5 nodes with +0.5 y bias (clears the CTA block) behind stage shift −0.7. Keyframes `ecmnet-*`.
5. `/engine-flow` - NEW V5, "Flow" (replaces engine-light; dark, base fonts). Post-gate output = the money trail: three static quadratic-bezier trails from (1.2, 0, 0) fanning vertically to ANZ ··4417 (3.0, 1.7, −0.5), WISE (3.35, 0.12, −1.1) and CASH ATM (2.7, −1.7, 0.15), drawn as dashed gold lines with mid waypoint rings (~t 0.42) and ringed, labelled destinations. Amount pulses (lead comet + 3-sprite tail, 12 sprites total, one shared texture) travel the curves on staggered clocks (4.6 s / 5.6 s + 1.9 s / 5.1 s + 3.4 s), swelling over waypoints; every CASH ATM arrival lerps its ring gold→crimson with a brief glow flash. Curves never rebuilt per frame. Mobile: compressed fan (spread 0.42/0.66, scale 0.62, +0.35 y bias) behind stage shift −0.7. Keyframes `ecmf-*`. Hero fallback SVG echoes the three dotted routes.

### Round-three defects found and fixed during central verification

- FRAMING (the big one): first-pass layouts for ledger/trace/network/flow placed structures at stage-local x 4.8-10.7 - almost entirely outside the camera frustum (desktop limit ≈3.1 at z=0; mobile ≈1.5). Diagnosed centrally from screenshots + frustum maths, fixed by the same agents against explicit per-depth budgets, then re-verified visually at both viewports. The budget formula now lives in Technical rules above.
- Mobile occlusion: first mobile passes on network and flow hid the CASH ATM node/label behind the opaque gold CTA button; fixed with a +0.35..+0.5 y bias on the mobile layouts.
- Thread crossing: network's WISE→BTC edge crossed ANZ→CBA in the compact layout; BTC re-parented to CBA.
- Instanced-mesh over-allocation on refined (see per-route outcome 1).

### Gallery, README, deletions

- Gallery `/`: variations register now V1 Refined / V2 Trace / V3 Ledger / V4 Network / V5 Flow (all Dark), voice lines updated, section label "Rounds two & three · base kept as reference".
- README: variations table updated (all dark, base type pairing, all carry the match diagram); `three` isolation note now says "the /engine family of routes".
- `src/app/engine-serif/` and `src/app/engine-light/` deleted.

## Repo state (current)

- Branch `main`. Committed history: `6f3ad31` (scaffold + gallery), `1b965a4` (six designs + fixes + docs), `bd8cf99` (five round-two variations), `a0b5b01`/`ed4d7a4` (plan doc). **Round-three changes are in the working tree, NOT yet committed** (user has not asked for a commit).
- Routes (all statically exported, all validation green): `/` gallery, `/ledger`, `/trace`, `/clarity`, `/engine` (untouched reference), `/engine-refined`, `/engine-trace`, `/engine-ledger`, `/engine-network`, `/engine-flow`, `/exhibit`, `/chambers`.
- `AGENTS.md` (repo root): binding rules - content rules, design-isolation rules, animation standards, port 3004 dev policy, validation commands.
- Dev: `npm run dev` -> http://localhost:3004. Build: `npm run build` -> `out/`.
- Verification screenshots (transient): `~/.dev-browser/tmp/r3-*.png` (final round-three captures) and `fix-*.png` (agent framing-fix iterations).

## Current status / next step

Round three is delivered and awaiting user comparison: five dark Evidence Engine variations, all on the base type pairing, each with a distinct post-gate hero treatment (calm record band / live spreadsheet / docked evidence network / account constellation / money trail) and all carrying the reconstructed cross-currency match set-piece with the overlap fixed. Open question for the user: which variant - or which combination of variables (e.g. one hero treatment + the ledger table + the tracing section) - becomes the final FinTrace homepage. The expected round four is a single consolidated build from that selection, following the same isolation/validation rules above. Round-three work also still needs a commit once the user signs off.
