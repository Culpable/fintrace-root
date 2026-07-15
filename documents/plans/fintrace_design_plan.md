# FinTrace Design Lab - Implementation Plan & State

## Why (context and goal)

FinTrace is the new brand name for the Statement Analysis (SA) tool
(`/Users/sacino/statement-analysis`): a forensic financial analysis service that
converts bulk PDF bank statements (any bank, any order, scanned paper included,
no pre-sorting) into a single structured, source-traceable Excel ledger
(file name, person, date, financial year, description, debit/credit, amount,
category), auto-categorises transactions (Woolworths -> groceries), flags
suspicious activity (cash-withdrawal patterns, gambling/crypto, transfers
between related accounts, cross-currency matches such as rupee-to-AUD via
Wise), and produces a written findings report with every finding traceable to
its exact source PDF page (human-verifiable, no hallucination risk).
Proven value: a ~50 hour manual lawyer job completed in ~10, findings matching
the lawyer's independent analysis; real matters run to thousands of pages,
~50 accounts, 15 years.

Buyers: lawyers in document-heavy financial disputes (family law is the proven
wedge), government legal bodies (Public Trustee / Dept of Justice),
misappropriation and elder financial abuse matters, forensic accountants,
insolvency practitioners. Trust and credibility are the biggest barrier
(LexisNexis-grade gravitas benchmark). Positioned as a service, not software
(flat cost + per-page pricing, engaged per matter). Mock contact used in copy:
hello@fintrace.com.au; CTA style "Request a matter assessment".

Full brand brief: `/Users/sacino/statement-analysis/documents/reference/brand_naming_background.md`

Goal of this repo (`/Users/sacino/fintrace`): build multiple unique, extremely
polished candidate homepage designs, each on its own route, so the team can
compare working pages and pick a brand direction. Wow factor required; all must
align with the product's purpose and carry a FinTrace-specific brand voice.

## Decisions locked in via blindspot pass (user-approved, round one)

1. Stack: Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript, App Router,
   static export (`output: 'export'`, `images.unoptimized`, `trailingSlash`),
   dev port 3004 (unique in workspace; 3000-3003, 4021, 4022, 4031, 5001 taken).
   Scaffolding mirrors `/Users/sacino/bulma-root/demo` (modern variant of the
   Embeddings pattern).
2. Scope: each design is a FULL self-contained homepage (hero, product
   narrative/how-it-works, capabilities/findings, proof/credibility,
   who-it's-for, CTA, footer) with its own typography, palette, and motion
   system. A neutral gallery index at `/` links to everything.
3. Copy: shared core facts from the brand brief, headlines/tone tuned per
   design concept. Each design gets its own typographic FinTrace logotype.
   British English, curly apostrophes (’), no emoji.
4. Animation budget: bespoke CSS/SVG/Canvas + scroll-driven animation
   throughout; WebGL/three.js permitted for 1-2 showpiece designs.
5. Count: exactly 6 designs, full aesthetic range (conservative legal-grade
   trust through bold dark forensic/investigative).

## Technical rules (binding for all agents)

- Static export only: no server runtime, no API routes, no next/image
  optimisation. Fonts via `next/font/google` (self-hosted at build); never
  Inter/Roboto/Arial/system fonts. No external/network assets - all visuals
  are CSS, inline SVG, canvas, or generated WebGL textures.
- Isolation: each route owns its complete visual system in its folder -
  `page.tsx` (server component + metadata), scoped `<route>.css` (ALL rules
  nested under a `.dsn-<route>` wrapper class - this is what prevents
  cross-page style bleed during client-side navigation), `fonts.ts`, colocated
  `'use client'` components. `globals.css`/`layout.tsx` stay minimal/neutral.
  `three` is dynamically imported inside WebGL routes only.
- Animations: transform/opacity wherever possible; IntersectionObserver scroll
  triggers; passive listeners; rAF/WebGL loops pause when tab hidden or element
  offscreen; canvas DPR capped at 2; rAF clock deltas clamped to [0, 0.05]
  (Chrome's first rAF timestamp can predate the start clock - unclamped, this
  crashed the original /trace hero via a negative array index); full three.js
  disposal on unmount; WebGL renderer construction wrapped in try/catch so a
  missing GL context leaves the designed static fallback instead of crashing
  the React tree. NEVER add `prefers-reduced-motion` gates (workspace rule).
- better-ui skill compliance (user-mandated from round two onward, skill at
  `~/.claude/skills/better-ui/`): active press scale 0.96 with explicit
  transition-property lists (never `transition: all`), >=44px hit areas
  (pseudo-element extensions), concentric border radii on nested rounded pairs,
  layered low-opacity shadows for elevation (hairline borders kept where they
  are the design language / dividers), interruptible hover/press transitions,
  visible focus states.
- Responsive: clean at 1440x900 and 390x900, zero horizontal overflow.
- Parallel workers must not run `npm run dev`/`npm run build`/git (shared
  `.next` conflicts) - the coordinating agent validates centrally.
- Validation gate per round: `npm run lint` (zero errors), `npm run build`
  (static export completes), browser verification of every page at 1440x900 +
  390x900 (console errors, page errors, horizontal overflow, animation
  rendering), plus headed-browser (real GPU) verification for WebGL scenes.

---

## ~~Round one: six designs~~ ✅ **COMPLETED**

All built by six parallel fork agents, validated (lint/build/browser both
viewports/headed WebGL), committed (`6f3ad31` scaffold, `1b965a4` designs).

1. `/ledger` - "The Ledger". Light editorial broadsheet: ivory paper, Fraunces
   display serif, ruled ledger lines, oxide-red accents, self-reconciling
   ledger hero (rows enter, chips stamp, $9,500 ATM withdrawal flagged).
   Voice: calm authority ("Every dollar, accounted for.").
2. `/trace` - "Follow the Money". Dark investigative evidence board: ink navy,
   red thread drawing through a canvas account network, cross-currency
   "MATCHED" set-piece (₹15,40,000 -> A$28,004 via Wise). Archivo + IBM Plex
   Mono. Voice: investigative ("Money leaves a trail.").
3. `/clarity` - "Chaos to Clarity". Swiss grid: strewn scanned pages snap into
   a live spreadsheet (replayable), 50-vs-10-hour proportional bars. Familjen
   Grotesk + Spline Sans Mono, white + cobalt.
4. `/engine` - "The Evidence Engine". WebGL/three.js showpiece: paper documents
   stream through a glowing golden gate ring and emerged (originally) as a
   burst of ~950 gold points locking into a point lattice. Obsidian + champagne
   gold, Bricolage Grotesque + Fragment Mono. Voice: engineering-grade rigour.
5. `/exhibit` - "The Exhibit". Brutalist court exhibit: stamped headline with
   ink bleed, EXHIBIT FT-01 stamp, typed matter register, finding cards that
   flip to their source excerpt, footnote source register. IBM Plex Mono +
   Archivo Black, white/black/stamp red.
6. `/chambers` - "Chambers". Quiet luxury: letterpress reveal, twin gold
   hairlines, wax-seal FT monogram, parchment invitation CTA. Cormorant
   Garamond + EB Garamond + Cinzel on deep green.

Defects found and fixed during round-one verification: /trace negative-dt
first-frame crash (clamped); /engine blank page when WebGL unavailable
(try/catch + persistent fallback); three react-hooks lint errors
(engine/Reveal ref-in-render -> React 19 callback ref; engine/Scene ref write
in render -> effect; exhibit/HeroRegister closure mutation -> loop); ledger
mobile table masthead cramping (stacked). Favicon `src/app/icon.svg` added.

## User feedback on round one (verbatim intent)

- `/engine/` is the BEST overall: design, font, colour scheme; most unique in a
  non-tacky way. BUT the "dust" coming out of the gate doesn't make sense
  (paper going in is loved; the point-burst output reads as meaningless).
- `/trace/`: likes the diagrams/drawings - the hero network background and the
  "CROSS-CURRENCY MATCH - RECONSTRUCTED" set-piece. NOT a fan of trace's font
  or colour scheme.
- `/ledger/`: decent; font pretty good, logo decent, likes the table - though
  it "looks like it has some errors in it". Diagnosis: the data arithmetic is
  correct (balances reconcile to 13,098.05); the perceived errors are the
  flagged-row red rule rendering as broken disconnected fragments (SVG rect
  with `preserveAspectRatio="none"` + dash animation distorting the stroke).
  Does NOT like the white + black palette.
- Direction set by user: keep `/engine/` AS-IS as the reference; build
  VARIATIONS of it to compare across. Liking an element (e.g. ledger's font)
  does not obligate using it. All designs must align with the better-ui skill.

## ~~Round two: five Evidence Engine variations~~ ✅ **COMPLETED**

User-approved plan (via follow-up Q&A): build all five variants; use ALL THREE
proposed hero-output treatments distributed across them. Every variant replaces
the post-gate "dust" with legible structured output, keeps the document stream
+ gate untouched, and carries the better-ui pass. `/engine/` untouched
(git-verified). Built by five parallel forks, validated (lint/build; browser
both viewports - zero real console errors, zero overflow; all five scenes
verified rendering headed with real GPU), committed (`bd8cf99`).

1. `/engine-refined` - CONTROL. Hero: documents become thin record slabs with
   baked CanvasTexture ledger rows (salary, flagged ATM, Wise cross-currency,
   groceries) that lock into a drifting 4x3 lattice with overshoot. Otherwise
   identical to base + better-ui. Judges the hero fix in isolation.
2. `/engine-trace` - hero: documents become gold-edged evidence cards
   ("FT-0114 · p. 214 · VERIFIED") in a disciplined arc joined by gold
   filaments (one crimson flagged pair). New `#tracing` section: account
   network trace redrawn in gold ("Fifty accounts. One thread of evidence.",
   crimson only on the flagged CASH hop) + cross-currency MATCHED set-piece
   (CSS offset-path behind @supports). Trace's old font/colours dropped
   entirely.
3. `/engine-ledger` - hero: documents dissolve into cells tiling one growing
   spreadsheet plane (7x22 instanced cells, one crimson glint). New `#ledger`
   section: the reconciling table on an obsidian machined plate ("Every line
   entered. Every line sourced."), same verified LINES data, flag rule rebuilt
   as a CONTINUOUS draw (no-viewBox SVG rect in CSS-pixel space,
   `pathLength={1}` dash draw + `vector-effect: non-scaling-stroke`) - the
   round-one fragmentation defect is impossible by construction. Mobile
   masthead stacks properly.
4. `/engine-serif` - typography A/B: identical to refined (same lattice hero)
   except display font Bricolage Grotesque -> Fraunces (variable opsz, italic
   gold accents), optically retuned (weights ~560, relaxed tracking, italic
   overhang padding for background-clip).
5. `/engine-light` - full parchment inversion: parchment #f4efe4 field, bronze
   #a07c2c structure (champagne gold survives only as button faces with ink
   text), ink #141210 text, re-lit scene (parchment fog, bronze gate tori with
   normal-blended pigment sprites - additive washes out on light), spreadsheet
   plane rendered as printed ledger sheet, paper plates elevated by layered
   oklch shadows.

Gallery `/` gained a gold-tinted "The Evidence Engine - variations" section
(V1-V5); README documents both rounds.

## Repo state (current)

- Branch `main`, clean. Commits: `6f3ad31` (scaffold + gallery), `1b965a4`
  (six designs + fixes + docs), `bd8cf99` (five variations + gallery/README).
- Routes (all statically exported, all validation green): `/` gallery,
  `/ledger`, `/trace`, `/clarity`, `/engine` (untouched reference),
  `/engine-refined`, `/engine-trace`, `/engine-ledger`, `/engine-serif`,
  `/engine-light`, `/exhibit`, `/chambers`.
- `AGENTS.md` (repo root): binding rules - content rules, design-isolation
  rules, animation standards, port 3004 dev policy, validation commands.
- Dev: `npm run dev` -> http://localhost:3004. Build: `npm run build` -> `out/`.
- Verification screenshots (transient): `~/.dev-browser/tmp/*.png`.

## Current status / next step

Round two is delivered and awaiting user comparison. Open question put to the
user: which variant - or which combination of variables (e.g. serif type +
ledger table + tracing section) - becomes the final FinTrace homepage. The
expected round three is a single consolidated build from that selection,
following the same isolation/validation rules above.
