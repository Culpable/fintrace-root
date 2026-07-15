# FinTrace Design Lab - Implementation Plan & State

This document is the standalone source of truth for the FinTrace design-lab repo: why it exists, what has been built across three rounds, exactly what is on every page right now, the binding technical rules, and what happens next. A new contributor (human or agent) should be able to work from this file alone.

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
- Isolation: each route owns its complete visual system in its folder - `page.tsx` (server component + metadata), scoped `<route>.css` (ALL rules nested under a `.dsn-<route>` wrapper class - this is what prevents cross-page style bleed during client-side navigation), `fonts.ts`, colocated `'use client'` components. `globals.css`/`layout.tsx` stay minimal/neutral. `three` is dynamically imported inside WebGL routes only (the /engine family).
- `@keyframes` names are DOCUMENT-GLOBAL (not scoped by the `.dsn-*` wrapper): any keyframes duplicated across route stylesheets silently collide under client-side navigation (last loaded wins). Every route must prefix its keyframe names uniquely (round three uses `ecm-`/`ecmr-`/`eclm-`/`ecmnet-`/`ecmf-` for the shared match diagram).
- Animations: transform/opacity wherever possible; IntersectionObserver scroll triggers; passive listeners; rAF/WebGL loops pause when tab hidden or element offscreen; canvas DPR capped at 2; rAF clock deltas clamped to [0, 0.05] (Chrome's first rAF timestamp can predate the start clock - unclamped, this crashed the original /trace hero via a negative array index); full three.js disposal on unmount; WebGL renderer construction wrapped in try/catch so a missing GL context leaves the designed static fallback instead of crashing the React tree. NEVER add `prefers-reduced-motion` gates (workspace rule).
- WebGL hero FRAMING BUDGET (learned in round three - three of five reworked heroes shipped off-frame on first pass): with the engine-family camera (fov 34°, lookAt(0, 0.1, 0), desktop z=10.5/aspect 1.6, mobile z=14/aspect 0.433), the usable stage-local x limit at depth z is ≈ (10.5 − z) × 0.489 − 1.1 (stage shift) − 0.95 (camera drift 0.35 + pointer parallax 0.6) on desktop → ≈3.1 at z=0; and ≈ (14 − z) × 0.1324 − stage shift − 0.35 on mobile → ≈1.5 at z=0 with no shift. Designed post-gate structures must fit inside this budget at MAX camera sway (spread vertically, use −z depth for extra width, and shift `stage.position.x` to −0.7 on mobile so the output band right of the gate widens to ≈2.2). Any scene layout change requires a visual screenshot check at both viewports - frustum maths sets the budget, but only the browser proves it.
- better-ui skill compliance (user-mandated from round two onward, skill at `~/.claude/skills/better-ui/`): active press scale 0.96 with explicit transition-property lists (never `transition: all`), >=44px hit areas (pseudo-element extensions), concentric border radii on nested rounded pairs, layered low-opacity shadows for elevation (hairline borders kept where they are the design language / dividers), interruptible hover/press transitions, visible focus states.
- Responsive: clean at 1440x900 and 390x900, zero horizontal overflow.
- Parallel workers must not run `npm run dev`/`npm run build`/git (shared `.next` conflicts) - the coordinating agent validates centrally. Workers MAY verify their own route visually via `dev-browser` against the already-running dev server, using a unique page name per worker to avoid collisions.
- Validation gate per round: `npm run lint` (zero errors), `npm run build` (static export completes), browser verification of every page at 1440x900 + 390x900 (console errors, page errors, horizontal overflow, animation rendering), plus headed-browser (real GPU) verification for WebGL scenes.

## Commands and environment

- `npm run dev` → http://localhost:3004 (assume it may already be running; check before starting another instance).
- `npm run build` → static export into `out/`. `npm run lint` → ESLint, must be zero errors.
- Browser verification is done with the `dev-browser` CLI (headed Chromium, real GPU, Playwright Page API in a sandboxed script runtime; screenshots land in `~/.dev-browser/tmp/`).
- No tests exist; validation is lint + build + browser. No deployment is configured. No git remote is configured - the repo is local-only.
- Repo-root `AGENTS.md` carries the binding content/isolation/animation/testing rules and mirrors the rules above.

---

## History: three completed rounds

### ~~Round one: six designs~~ ✅ COMPLETED

All built by six parallel fork agents, validated (lint/build/browser both viewports/headed WebGL), committed (`6f3ad31` scaffold, `1b965a4` designs). Defects found and fixed during verification: /trace negative-dt first-frame crash (clamped); /engine blank page when WebGL unavailable (try/catch + persistent fallback); three react-hooks lint errors (engine/Reveal ref-in-render → React 19 callback ref; engine/Scene ref write in render → effect; exhibit/HeroRegister closure mutation → loop); ledger mobile table masthead cramping (stacked). Favicon `src/app/icon.svg` added.

**User feedback on round one (verbatim intent):** `/engine/` is the BEST overall - design, font, colour scheme; most unique in a non-tacky way - BUT the "dust" coming out of the gate doesn't make sense (paper going in is loved; the point-burst output reads as meaningless). `/trace/`: likes the diagrams/drawings - the hero network background and the "CROSS-CURRENCY MATCH - RECONSTRUCTED" set-piece - but NOT the font or colour scheme. `/ledger/`: decent; font pretty good, logo decent, likes the table though it "looks like it has some errors in it" (diagnosis: the arithmetic was correct; the flagged-row red rule rendered as broken fragments - an SVG `preserveAspectRatio="none"` + dash-animation artefact). Does NOT like white + black. Direction set: keep `/engine/` AS-IS as the reference; build VARIATIONS of it. All designs must align with the better-ui skill.

### ~~Round two: five Evidence Engine variations~~ ✅ COMPLETED (V4/V5 superseded in round three)

Five variants built by parallel forks from the /engine base (all replace the post-gate "dust" with structured output, keep the document stream + gate, and carry the better-ui pass), committed (`bd8cf99`): V1 `/engine-refined` (record-slab lattice control), V2 `/engine-trace` (evidence-card arc + `#tracing` section), V3 `/engine-ledger` (cell-mosaic sheet + `#ledger` reconciling table), V4 `/engine-serif` (Fraunces typography A/B - since REMOVED), V5 `/engine-light` (parchment inversion - since REMOVED).

**User feedback on round two (verbatim intent):**

- Dark mode only; no light mode.
- Keep the font as per the original `/engine/` (Bricolage Grotesque + Fragment Mono) - no font changes.
- `/engine-refined/` has the right idea but is "way too busy" - a lot less going on needed (too many items).
- `/engine-ledger/` is a good idea but unclear what's going on; the hero RHS must look more like a spreadsheet.
- `/engine-trace/` has the right idea but looks "off": the card connections read as "a string with cards connected to it" - the connections need rework.
- Serif and Light: redo into two NEW dark variations on the original font, and use the opportunity to redesign the hero RHS as something "Trace"-related - closer to the `/trace/` trace diagrams.
- In ADDITION to everything already on the engine variation pages, every variation must include a diagram like /trace's "CROSS-CURRENCY MATCH - RECONSTRUCTED" - restyled to the engine palette, with the overlap fixed (in /trace the MATCHED badge overlapped the travelling A$28,004 chip at landing, and the right-hand station labels clipped the viewBox edge).

### ~~Round three: feedback pass on the five variations~~ ✅ COMPLETED

Executed by four parallel fork agents + coordinator (refined/ledger/trace reworked in place; network/flow built fresh from the committed engine-refined state; engine-serif and engine-light deleted). Committed as `955fb25`. All validated: lint zero errors, static build green (14 routes), browser verification of all changed pages at 1440x900 + 390x900 with zero console errors, zero page errors, zero horizontal overflow, all five WebGL scenes rendering on a real GPU (headed Chromium via dev-browser).

Defects found and fixed during round-three central verification:

- FRAMING (the big one): first-pass layouts for ledger/trace/network/flow placed structures at stage-local x 4.8-10.7 - almost entirely outside the camera frustum (desktop limit ≈3.1 at z=0; mobile ≈1.5). Diagnosed centrally from screenshots + frustum maths, fixed by the same agents against explicit per-depth budgets, then re-verified visually at both viewports. The budget formula now lives in Technical rules above.
- Mobile occlusion: first mobile passes on network and flow hid the CASH ATM node/label behind the opaque gold CTA button; fixed with a +0.35..+0.5 y bias on the mobile layouts.
- Thread crossing: network's WISE→BTC edge crossed ANZ→CBA in the compact layout; BTC re-parented to CBA.
- Instanced-mesh over-allocation on refined: the four slab meshes allocated `ceil(SLAB_COUNT/4)` instances uniformly, which at 9 slabs would render never-written identity-matrix instances as frozen slabs at the gate centre; each mesh now allocates exactly what the round-robin writes.

---

## Current page inventory (route by route)

Twelve routes, all statically exported and validation-green. Six original concepts (round one, kept for comparison), the untouched `/engine` reference, and five dark Evidence Engine variations (the active direction).

### Gallery `/` (`src/app/page.tsx` + `gallery.css`)

Deliberately neutral so it never biases comparison: Newsreader (editorial serif) + Spline Sans Mono on near-black, staggered `lab-rise` entrance animation. Two registers: `DESIGNS` (the six round-one concepts, numbered 01-06 with palette swatch dots and voice lines) and `ENGINE_VARIATIONS` (V1 Refined, V2 Trace, V3 Ledger, V4 Network, V5 Flow - all Dark - under the heading "The Evidence Engine - variations", label "Rounds two & three · base kept as reference"). All hrefs use trailing slashes (`/engine-refined/` etc.).

### The six round-one concepts (kept as historical candidates)

1. `/ledger` - "The Ledger". Light editorial broadsheet: ivory paper, Fraunces display serif, ruled ledger lines, oxide-red accents; hero is a self-reconciling ledger table (rows enter, category chips stamp, a $9,500 ATM withdrawal flags; balances genuinely reconcile to 13,098.05). Voice: "Every dollar, accounted for."
2. `/trace` - "Follow the Money". Dark ink-navy investigative evidence board: canvas account-network hero with a red thread drawing through it (`TraceNetwork.tsx`), and the original cross-currency set-piece (`MoneyFlow.tsx` - NOTE: still has the old overlapping MATCHED/chip geometry; only the engine variations received the fix). Archivo + IBM Plex Mono. Voice: "Money leaves a trail."
3. `/clarity` - "From Chaos to Clarity". Swiss white + cobalt grid: strewn scanned pages snap into a live spreadsheet (replayable), 50-vs-10-hour proportional bars. Familjen Grotesk + Spline Sans Mono.
4. `/engine` - "The Evidence Engine", THE UNTOUCHED ROUND-ONE REFERENCE. Documents stream into the golden gate and exit as the original ~950-point burst/lattice ("dust") - kept exactly as round one shipped it so variations can be judged against it. Everything below the hero is DOM-only and scroll-choreographed.
5. `/exhibit` - "The Exhibit". Brutalist court exhibit: stamped headline with ink bleed, EXHIBIT FT-01 stamp, typed matter register, finding cards that flip to their source excerpts, footnote source register. IBM Plex Mono + Archivo Black, white/black/stamp red.
6. `/chambers` - "Chambers". Quiet luxury: letterpress reveal, twin gold hairlines, wax-seal FT monogram, parchment invitation CTA. Cormorant Garamond + EB Garamond + Cinzel on deep green.

### The Evidence Engine family - shared system (all five variations + base)

**Palette (CSS vars in each route's stylesheet):** obsidian background `#0d0b09`; gold `--gold #d4a94e`; bright gold `--gold-bright #f0d491`; warm paper/off-white text `--paper`; muted `--grey-warm`; restrained crimson for flags - `#b3231f` (threads/edges) and `#e0503a` (text/row glints). Fog colour matches the background so geometry materialises/dissolves without pop-in.

**Typography (`fonts.ts`, identical in every engine route):** Bricolage Grotesque (variable, `--font-eng-display`) for display/headlines; Fragment Mono (400, `--font-eng-mono`) for kickers, labels, stats, buttons. This pairing is user-locked - do not change it.

**Wordmark:** "Fin | Trace" - `Fin` in paper, a luminous vertical gate bar, `Trace` in gold (`.eng-wordmark`); reused in header and footer, linking to the route's own root.

**Page skeleton (every engine-family page, in order):**

1. Fixed header: wordmark + nav (Process / Capabilities / Proof - engine-trace adds Tracing) + gold "Request assessment" mailto button.
2. `<Hero />` (client component): layered bottom-to-top as (a) designed static SVG fallback (instant first paint, echoes that route's scene), (b) the WebGL scene layer that cross-fades in when its first frame renders (`.eng-scene-layer.is-ready`, `onReady` callback), (c) a contrast scrim, (d) DOM headline block lower-left (kicker "Forensic infrastructure for legal teams", h1 "The evidence engine.", lede, two CTAs), (e) golden scroll-cue filament, (f) mono stat strip along the hero's bottom edge ("Thousands of pages | ≈50 accounts | 15 years of statements | One ledger").
3. `#process` - "Four stages. One chain of evidence." Four stages with a drawing progress line: 01 Intake (any bank/order/era, no pre-sorting), 02 Extraction (one structured Excel ledger), 03 Analysis (cash patterns, gambling/crypto, related-account transfers, cross-currency matches), 04 Findings (report where every finding cites its exact source page).
4. Variant-specific set-piece section(s) - see per-route notes below (`#match` everywhere; `#tracing` on trace; `#ledger` on ledger).
5. `#capabilities` - "Built to withstand scrutiny." Six spec cards: Universal intake, Structured ledger, Auto-categorisation, Anomaly detection, Cross-account tracing, Source-linked findings (each tagged Input/Output/Analysis/Report).
6. `#proof` - "Fifty hours of review. Delivered in about ten." Animated counters (50→10 hrs backwards meter, ≈50 accounts, 15 yrs, 1,000s of pages) + the note that findings closely matched the instructing lawyer's independent analysis.
7. `#for` - "For matters that hinge on the money." Five audience cards, family-law property matters featured as "The proven wedge" (plus public trustees/government legal, forensic accountants, insolvency practitioners, estate & financial-abuse matters).
8. `#engage` - CTA plate with sheen sweep: service positioning (flat engagement fee + per-page pricing), gold mailto CTA "Request a matter assessment" + ghost email link.
9. Footer (wordmark, "Forensic financial analysis for the legal profession.", email, "Engaged per matter · Australia-wide", © line) and a fixed "Design lab" back-chip to `/`.

**Shared WebGL scene bones (every engine `Scene.tsx`):** three.js dynamically imported client-side only; renderer in try/catch (missing WebGL → static fallback survives); DPR ≤ 2; fog `#0d0b09` 9→24; camera fov 34 at (0, 0.9, 10.5 desktop / 14 mobile) with gentle drift + pointer parallax, lookAt(0, 0.1, 0); a `stage` group shifted +1.1 x on desktop (−0.7 on mobile for the round-three variants) so the gate sits right-of-centre clear of the headline; incoming paper documents (instanced planes with a baked statement CanvasTexture) streaming from x −13 into the gate, funnelling and shrinking as they're swallowed; the gate itself (two gold tori + two additive glow sprites standing in for bloom, breathing at ~1.6 Hz); ambient gold dust points; IntersectionObserver + visibilitychange gating so the rAF loop fully stops offscreen/hidden; ResizeObserver-driven camera/renderer resize; exhaustive disposal on unmount. The delta clamp is [0, 0.05]. What differs per variant is ONLY the post-gate output on the right-hand side.

**The shared cross-currency match set-piece (`CurrencyMatch.tsx` per route + `ecm-*` CSS block):** the /trace "CROSS-CURRENCY MATCH - RECONSTRUCTED" diagram redrawn in engine gold, added in round three to ALL five variation pages. Server component; pure-CSS animation armed by the route's `Reveal` (`.eng-reveal.is-visible`), motion gated behind `@supports (offset-path: …)` so non-supporting browsers keep the static diagram. Canonical FIXED geometry (designed so the round-two overlap cannot recur): viewBox `0 0 560 200`; route path `M 76 118 Q 178 52 280 118 Q 382 52 484 118`; stations at x 76 (HDFC ****3321 / OUT ₹15,40,000 · 04 APR), 280 (WISE / FX 0.01818), 484 (ANZ ****4417 / IN A$28,004 · 04 APR); node y 118, names y 144, subs y 162; travelling chip rect x −48, y −40, 96x24 (lands in band y 78-102); MATCHED plate rect (440, 40) 88x24 (band y 40-64) - a permanent 14-unit clear gap between plate and landed chip, and all labels inside the widened viewBox. 9 s loop: chip departs HDFC, dwells at Wise while ₹15,40,000 swaps to A$28,004, lands at ANZ, MATCHED stamps in, everything fades and loops. Marching-dash route line runs continuously. Keyframe prefixes per route: `ecm-` (trace), `ecmr-` (refined), `eclm-` (ledger), `ecmnet-` (network), `ecmf-` (flow). Placement: a `#match` section (kicker "Traced across currencies", h2 "Same funds. Two currencies. One match.", diagram on an `eng-plate eng-ecm-plate`) between `#process` and `#capabilities` on refined/network/flow, after `#ledger` on engine-ledger; engine-trace keeps its copy inside `#tracing`. Caption: "Same funds, two currencies - matched automatically, with source pages cited for both sides."

**Per-route files:** every engine route contains `page.tsx`, `<route>.css`, `fonts.ts`, `Hero.tsx`, `Scene.tsx`, `Reveal.tsx` (IntersectionObserver reveal wrapper adding `is-visible`), `Stat.tsx` (count-up/count-down number animation), and - variations only - `CurrencyMatch.tsx`; engine-trace additionally `TraceDiagram.tsx`; engine-ledger additionally `LedgerPlate.tsx`.

### V1 `/engine-refined` - the control (calm record band)

Hero output: exactly 9 (desktop) / 5 (mobile) legible ledger-row slabs - baked 512x64 CanvasTextures of real transactions (Woolworths groceries −214.63, flagged ATM −9,500.00 CASH, Wise AUD→INR −5,200.00 CROSS-CCY, salary +8,412.90 INCOME) on gold-framed obsidian plates - born at the gate, overshoot-locking (ease-out-back) into a SINGLE-depth-layer, 3-row lattice (row gap 0.62) and drifting right into the fog. Evenly phase-spaced (i/SLAB_COUNT), scale 1.15/0.9, scatter ±0.5 y / ±0.25 z, speed ~0.045; DOC_COUNT 12/7, DUST 110/60 at opacity 0.24. This is the round-two control with the round-three "way too busy" feedback applied: a handful of large readable records instead of a 28-slab swarm. Everything else is the base page + better-ui polish. Sections: process → match → capabilities → proof → for → engage.

### V2 `/engine-trace` - the docked evidence network

Hero output: evidence cards (gold-edged citation plates baked as textures - "FT-0114 / p. 214 · VERIFIED" with data rules) emerge through the gate every 1.6 s, arc-fly ~2.2 s and overshoot-dock into a fixed branching tree: desktop root (1.7, 0, 0), branches (2.45, ±1.05, ∓0.4/0.35), four leaves x 3.15-3.45 / y ±0.62 and ±1.8 / z −0.25..−0.9, CARD_SCALE 0.92; mobile 5 slots (root 0.4, leaves ≤1.95, scale 0.6). Connectors join card BORDER midpoints (±CARD_W/2 × scale - lines never cross a card face; this is the fix for "a string with cards connected to it") and each draws in over 0.6 s only after BOTH endpoint cards dock; one leaf edge is crimson with a warming leaf card. 26 s cycle: build (complete ~12.4 s desktop / 9.2 s mobile) → dwell with 3 gold pulse motes hopping edges (1.9 s per hop) + gentle group sway → the whole constellation drifts +4.5 x and fades into fog → rebuild. Hero fallback SVG echoes the branching network. Extra section `#tracing` (nav link "Tracing", placed after `#process`): "Fifty accounts. One thread of evidence." - the DOM/SVG account-network diagram (`TraceDiagram.tsx`, gold, crimson only on the flagged CASH hop) + the CurrencyMatch set-piece. Sections: process → tracing (network diagram + match) → capabilities → proof → for → engage.

### V3 `/engine-ledger` - the live spreadsheet

Hero output: ONE spreadsheet sheet (no more abstract cell mosaic). A single plane (length 7.2) pivoted at stage-local (1.9, 0, 0.2), yawed +1.0 rad into −z depth so all five columns fit the frustum with the far end fading into fog; idle sway ±0.01 rad yaw. It carries a baked 1024x330 canvas that is a literal spreadsheet: header band DATE | DESCRIPTION | DEBIT | CREDIT | CATEGORY, `#` row-number gutter (1-8), gold hairline gridlines rgba(212,169,78,0.26), alternating row shading, outlined category chips, and eight grounded rows - Woolworths/groceries, salary/income, ATM WITHDRAWAL - CROWS NEST −9,500.00 CASH rendered fully in crimson `#e0503a` with a row wash, BP fuel, internal transfer to J SACINO ****4417, Wise AUD→INR cross-ccy, Sportsbet/gambling, rent received. 13.2 s cycle synced to the document stream: fade-in on headers-only, rows land at 0.9 s + n×1.1 s each with a bright entry band + left tick that clears a beat later, dwell ~2 s, fade out, invisible reset; the canvas redraws ONLY on row events (~10 redraws per cycle, never per frame). Mobile: sheet at (0.35, 0, 0.2), scale 0.35, yaw 0.75, stage shift −0.7. Extra section `#ledger` (after `#process`): "Every line entered. Every line sourced." - the DOM reconciling statement table on an obsidian machined plate (`LedgerPlate.tsx`; same verified row data as round one, balances reconcile; flag rule drawn as one continuous `pathLength={1}` dash draw with `vector-effect: non-scaling-stroke`, making the round-one fragmentation defect impossible). Sections: process → ledger → match → capabilities → proof → for → engage.

### V4 `/engine-network` - the account constellation (NEW in round three, replaces `/engine-serif`)

Hero output: an account-network constellation - the /trace hero network reimagined in engine gold. Eight nodes desktop / five mobile, each a thin gold torus ring + soft dot core + baked mono label plate: ANZ ··4417 is the hub at (2.2, 0.1, −0.2); spokes WISE (1.8, 1.25, −0.6), CBA ··0092 (2.95, 1.0, −0.8), CASH ATM (2.45, −1.35, 0) - THE FLAG, crimson edge + pulsing crimson-warmed ring - AMEX ··3010 (1.5, −1.15, −0.3); second ring HDFC ··3321 (2.6, 2.05, −1.0) off WISE, NAB ··7793 (3.2, 1.75, −1.3) off CBA, BTC WALLET (3.1, −0.35, −1.1) off CBA (re-parented from WISE to keep the graph crossing-free). Threads terminate at ring RIMS (endpoint inset 0.27 × NODE_SCALE), never at centres. 28 s cycle: nodes materialise from the gate every 1.4 s and glide to their slots with ring scale-in → threads draw in 0.9 s once both ends are placed → dwell with 3 gold pulses running hub→spoke + gentle sway → constellation drifts +3.4 into the fog and reassembles; edges collapse whenever a node's fade < 0.15 so bare lines never outlive rings. NODE_SCALE 0.9/0.62; mobile layout carries +0.5 y bias so the CASH ATM label clears the CTA button. Fallback SVG echoes hub + spokes with one crimson hop. Sections: process → match → capabilities → proof → for → engage.

### V5 `/engine-flow` - the money trail (NEW in round three, replaces `/engine-light`)

Hero output: three static quadratic-bezier money trails leaving a shared start just right of the gate (1.2, 0, 0), fanning VERTICALLY to ringed, mono-labelled destinations - ANZ ··4417 end (3.0, 1.7, −0.5), WISE end (3.35, 0.12, −1.1), CASH ATM end (2.7, −1.7, 0.15) - drawn as dashed gold lines (~64 samples, opacity ~0.35, out-of-phase shimmer) with mid waypoint rings at ~t 0.42. Amount pulses (a lead comet sprite + 3 trailing sprites at decreasing opacity/scale; 12 sprites total off one shared dot texture) travel the curves on staggered clocks - 4.6 s, 5.6 s (+1.9 s offset), 5.1 s (+3.4 s offset) - swelling as they cross waypoints; every arrival at CASH ATM lerps its ring gold→crimson `#b3231f` with a brief crimson glow flash, then cools. Curves are never rebuilt per frame - life comes from pulses, shimmer and camera drift. Mobile: fan compressed (spreadX 0.42, spreadY 0.66, fixtures 0.62 scale, +0.35 y bias), stage shift −0.7. Fallback SVG echoes three dotted diverging routes with rings. Sections: process → match → capabilities → proof → for → engage.

---

## Repo state (current)

- Branch `main`, working tree CLEAN. History: `6f3ad31` (scaffold + gallery) → `1b965a4` (six designs + fixes + docs) → `bd8cf99` (five round-two variations) → `a0b5b01`/`ed4d7a4` (plan doc updates) → `955fb25` (round three: reworked refined/ledger/trace, new network/flow, serif/light removed, shared match set-piece, gallery/README/plan updates). NO git remote is configured - everything is local; nothing has been pushed anywhere.
- Routes (14 in the export, all validation green): `/` gallery, `/ledger`, `/trace`, `/clarity`, `/engine` (untouched reference), `/engine-refined`, `/engine-trace`, `/engine-ledger`, `/engine-network`, `/engine-flow`, `/exhibit`, `/chambers` (+ `/_not-found`, `/icon.svg`).
- README documents all rounds and the variations table. `AGENTS.md` carries the binding rules.
- Verification screenshots (transient, regenerate as needed): `~/.dev-browser/tmp/r3-*.png` (final round-three captures: hero desktop/mobile + match diagram per route) and `fix-*.png` (agent framing-fix iterations).

## Known open items / caveats (worth a new contributor's attention)

- `/trace`'s own `MoneyFlow.tsx` still has the ORIGINAL overlapping MATCHED/chip geometry - the fix was applied only to the five engine variations (per the user's instruction scope). If /trace ever advances, port the canonical geometry.
- All evidence cards in the /engine-trace hero share a single baked "FT-0114" texture; varying citation numbers per card would deepen the illusion (cheap: bake 3-4 textures round-robin).
- The match diagram's SVG text is small at 390 px width (scales with the viewBox); acceptable on retina devices, but a mobile-specific font-size bump inside the SVG is an easy polish item.
- No automated tests exist; every change re-runs the manual gate (lint, build, dev-browser at both viewports). Browser checks are Chromium-only so far.
- The base `/engine` intentionally still shows the round-one point-burst "dust" - it is the comparison reference and must NOT be "fixed".
- No deployment, analytics, real favicon set beyond `icon.svg`, OG/social metadata, or production email are configured - all deferred until a direction is chosen.

## Next steps

1. **User comparison (blocking).** The user reviews the five dark variations side by side from the gallery (`npm run dev` → http://localhost:3004): V1 Refined (calm record band), V2 Trace (docked evidence network + tracing section), V3 Ledger (live spreadsheet hero + reconciling table), V4 Network (account constellation), V5 Flow (money trail). The decision may be a single winner OR a combination of variables - e.g. one hero treatment + engine-ledger's `#ledger` table + engine-trace's `#tracing` section; every set-piece is modular enough to recompose.
2. **Round four - consolidation (expected).** Build ONE final FinTrace homepage from the selection: fold the chosen hero output + chosen sections into a single route, carry the better-ui pass, the canonical match set-piece, and the base type/palette; follow the same isolation rules; run the full validation gate (lint, build, both viewports, headed GPU); retire or archive the non-selected variation routes (and decide whether the six round-one concepts stay in the gallery for posterity).
3. **Post-selection productionisation (not started, in rough priority order):** choose and configure a deployment target for the static `out/` (any static host works - no server runtime is needed); add a git remote/backup; real contact address + any form/analytics decisions; OG/social metadata and SEO pass; favicon/logotype finalisation; content/legal review of claims (50→10 hours, "court-ready", client-matter references); cross-browser verification (Safari/Firefox - especially `offset-path` behaviour, which currently has an @supports fallback); optional accessibility review within the workspace's no-reduced-motion constraint.
4. **If any further hero/scene work happens:** obey the WebGL framing budget in Technical rules, keep designed structures inside the frustum at max camera sway on BOTH viewports, and screenshot-verify - this was the round-three lesson.
