---
version: alpha
name: FinTrace
description: Obsidian-and-gold Evidence Engine design system for the FinTrace forensic financial analysis website.
---

# FinTrace Design System

## Overview

### Purpose and authority

This document is the visual implementation contract for the FinTrace production website: the Engine Network flagship serving at `/` and the approved production sub-pages that extend it. Read it before any UI work, alongside `AGENTS.md` (binding technical rules — they take precedence over this document) and `documents/plans/fintrace_design_plan.md` (the decision history and current-state register, which must be updated in the same task as any design change).

Token authority is **implementation-authoritative**: every exact colour, type, spacing and shadow value lives in `src/app/engine-network/engine-network.css` as CSS custom properties and rules scoped under the `.dsn-engine-network` class. This document records semantic roles, ownership and behaviour — it never becomes a second token registry. Where this document and the implementation disagree, treat the difference as drift: follow the implementation, then record the discrepancy here and in the design plan.

Every claim below carries one of three statuses:

- **Shipped** — verified in implementation and in the headed browser rounds recorded in the design plan. Unlabelled claims are shipped.
- **Approved, not yet implemented** — user-approved in `documents/todo/fintrace_site_pages_plan.md` (the contact, about, engagement and 404 pages). Binding once built; not on the live site today.
- **Lab** — development-only comparison routes under `/internal-design/`; never production precedent.

### Product character

- Audience and job: legal buyers — family law firms, public trustees and government legal, forensic accountants, insolvency practitioners, estate and financial-abuse teams — evaluating a forensic bank-statement analysis service. The site's one job is to earn LexisNexis-grade trust and convert to a matter-assessment enquiry.
- Character: a precision instrument. Obsidian ground with a warm undertone, champagne-gold rendered as light on metal (gradients, never flat yellow), engraved plates with machined corner ticks, a mono specification voice for every label and numeral, and restrained motion that always demonstrates the product — evidence entering, reconciling, tracing, matching.
- Not: SaaS dashboard styling, stock imagery or photography, emoji, a light theme, playful illustration, decorative motion that demonstrates nothing, or any invented proof, people, clients or credentials.
- Expressive exceptions: the WebGL hero constellation and its three animated evidence set-pieces (ledger, trace, currency match) are the approved showpieces. The eleven lab candidate routes each own deliberately divergent systems and are development-only.

### Source map

| Concern | Source | Ownership |
| --- | --- | --- |
| Tokens, all component and responsive rules | `src/app/engine-network/engine-network.css` | Palette custom properties, typography, buttons, header/footer, plates, cards, set-piece styling, breakpoints — all scoped under the route class |
| Fonts | `src/app/engine-network/fonts.ts::bricolage` | Bricolage Grotesque and Fragment Mono via next/font, exposed as CSS variables; the only permitted font instances |
| Page shell, sections, copy | `src/app/engine-network/EngineNetworkPage.tsx::EngineNetworkPage` | Header, section order, all section copy, footer, the internal-wrapper lab chip toggle |
| Hero composition and fallback | `src/app/engine-network/Hero.tsx::Hero` | Layered fallback/scene/scrim/headline/strip structure, load stagger, static SVG echoes |
| WebGL scene | `src/app/engine-network/Scene.tsx` | Constellation geometry, framing formulas, lifecycle gating, disposal, DPR cap |
| Entrance choreography | `src/app/engine-network/Reveal.tsx::Reveal` | One-shot IntersectionObserver trigger adding the visible class |
| Animated numerals | `src/app/engine-network/Stat.tsx::Stat` | Count-up/count-down proof stats |
| Ledger set-piece | `src/app/engine-network/LedgerPlate.tsx::LedgerPlate` | Reconciling table data, run choreography trigger, flag rule SVG |
| Trace set-piece | `src/app/engine-network/TraceDiagram.tsx` | Canvas account graph, label/note offset variables |
| Match set-piece | `src/app/engine-network/CurrencyMatch.tsx` | Cross-currency SVG diagram and its labelled-image semantics |
| Neutral global layer | `src/app/globals.css` | Smooth scroll, font smoothing, overflow-x clip — nothing visual |
| Root layout and metadata | `src/app/layout.tsx` | en-AU lang, metadata base and title template; deliberately font-neutral |
| Production route wrapper | `src/app/page.tsx` | Thin indexable wrapper rendering the shared page without the lab chip |
| Internal wrapper chrome | `src/app/engine-network/internal-engine-network.css` | The comparison-only lab chip; never loaded by the production route |
| Design decisions and validation record | `documents/plans/fintrace_design_plan.md` | Round-by-round decisions, framing formulas, verification evidence |
| Approved future pages | `documents/todo/fintrace_site_pages_plan.md` | Copy decks, form contract, shared chrome and prefixes for the coming pages |
| Binding project rules | `AGENTS.md` | Isolation, animation, static-export and validation rules; commands and server lifecycle |

### Foundations

- Framework and rendering: Next.js App Router with React Server Components by default; interactivity lives in colocated `'use client'` components. The site is a pure static export (`output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`) — no server runtime, API routes, middleware or runtime image optimisation.
- Styling and token authority: Tailwind CSS v4 is imported globally but route systems are hand-written CSS. All production styling is scoped under `.dsn-engine-network`; tokens are custom properties declared on that class in the route stylesheet.
- Components and icons: no external UI or icon library. Native elements plus bespoke classes; every graphic is CSS, inline SVG, canvas or a generated WebGL texture. Compose existing classes before inventing new ones.
- Fonts and charts: Bricolage Grotesque (display) and Fragment Mono (specification voice) are self-hosted at build via next/font and are user-locked — no other fonts, ever, and no Inter/Roboto/Arial/system fallbacks as primary faces. There is no charting library; data pictures are bespoke set-pieces.

## Colors

| Role | Token or source | Use |
| --- | --- | --- |
| Canvas | `--obsidian` | Page ground, warm black; also the WebGL fog colour so geometry dissolves without pop-in |
| Raised surface | `--obsidian-2` | Panels and plates (plates use gradient blends of the same family) |
| Headline text | `--paper` | Ivory display text and primary data values |
| Supporting text | `--grey-warm` | Ledes, body copy, labels, muted metadata |
| Accent | `--gold` | Primary champagne gold: kickers, data accents, borders, threads |
| Accent highlight | `--gold-bright` | Light on metal: hovers, focus outline, credit values, hot labels |
| Accent recessed | `--gold-deep` | Engraved indices and tags |
| Border | `--hairline` and `--hairline-dim` | Gold hairline rules and dim dividers; borders are 1px, never heavy |
| Error / flagged | crimson literals in component rules | The single "flagged" accent — reserved exclusively for the flagged evidence treatment, used sparingly, and paired with text. Not a shared custom property: the base crimson is a literal in scene/diagram code, the ledger flag declares a local variable, and the trace label uses its own tint. Check the owning component before reusing. |

- Theme status: one dark theme only, by explicit user decision ("dark mode only; no light mode"). No light theme is shipped or prepared, and there is no `prefers-color-scheme` handling.
- Accessibility target: no formal contrast target is recorded. Verification is visual, through the headed browser rounds in the design plan; rendered contrast pairs have not been formally measured, so no WCAG conformance is claimed.
- Status communication: colour never carries a status alone. The flagged ledger row pairs its crimson rule with a marginal text annotation and a category chip; the trace diagram's crimson hop is captioned in text; the gold "matched" verdict is a text stamp.
- A page-wide gold-dust film grain (a fixed SVG turbulence tile at 4% alpha) and a gold `::selection` colour keep even incidental surfaces on-brand.

## Typography

- Display role: Bricolage Grotesque through the `--font-eng-display` variable. Hero display sits at weight 760 with tight negative tracking; section headings at 700; card and spec headings at 650. Every h1/h2 wraps exactly one payoff clause in the gold-gradient span (`.eng-gold-text`) — gold type is a gradient clipped to glyphs, never a flat colour.
- Specification role: Fragment Mono through `--font-eng-mono` for kickers, navigation, buttons, tags, stats, strips, captions, footer metadata and all tabular data. Mono text is uppercase with wide letter-spacing; the kicker carries an engraved leading dash.
- Body role: ledes and body copy render in the display face at reading weight in `--grey-warm`, line-height 1.65.
- Scale: sizes are clamp-based fluid values owned by the stylesheet — consult `.eng-display`, `.eng-h2`, `.eng-lede` and the mono classes rather than restating values.
- Measure and wrapping: page container is a 74rem measure; section heads cap at 46rem, ledes at 34rem, the proof note at 42rem. Ledger descriptions truncate with ellipsis; mono strips wrap with row gaps rather than overflowing.
- Numerics: `font-variant-numeric: tabular-nums` on stat values and all ledger data. Amounts use the true minus sign, credits carry a plus and the brighter gold, currency formats follow the canonical evidence story (Australian dollar and Indian rupee lakh formats), and mono strips separate items with middle dots.

## Layout

- Spacing rhythm: sections use clamp-based block padding (`.eng-section`); plate padding and grid gaps are likewise fluid. There is no numbered spacing scale — rhythm values live in the stylesheet.
- Breakpoints and frames: 900px (grids stack; the process progress line rotates into a left rail), 767px (header section links hidden — wordmark and gold button remain; touch padding on the small button), 700px (ledger table drops balance and category columns, masthead stacks), 480px (proof stats compress to a single-line rule). The hero has its own compact contract independent of these: width below 768px **or** aspect ratio below 1.2 selects the compact scene, fallback SVG and framing.
- Navigation and shell: an absolute (not sticky) header over the hero — wordmark left, mono section anchors and the gold assessment button right. Footer carries brand, contact metadata and the copyright line. Sub-pages will share extracted header/footer chrome with page links replacing section anchors, plus a four-link footer page nav — approved, not yet implemented.
- Overflow and dense data: `html, body { overflow-x: clip }` in the global layer; zero horizontal overflow at every verified viewport is a validation gate. Dense data compresses by dropping columns at breakpoints, never by page-level horizontal scrolling.
- Touch targets: 44px minimum everywhere. Sparse inline links (wordmark, header anchors, footer mail link) extend via invisible pseudo-elements sized to stay clear of neighbours; buttons carry the target in their real padded box because their sheen's `overflow: hidden` clips pseudo extensions. The approved footer page nav must use in-flow 44px boxes — stacked links would otherwise overlap extended targets.

## Elevation & Depth

- Surface hierarchy: flat obsidian ground → hairline-ruled sections → engraved plates (gradient surface, 1px hairline border, inset top light, deep layered drop shadow, inner 10px engraved frame with gold corner registration ticks) → cards (hairline border plus ambient layered shadow; hover lifts 3px and deepens the shadow with a corner glow). Hairlines are the design language; shadows are additive depth, never a substitute.
- Overlays and stacking: the route root creates its own stacking context (`isolation: isolate`) so the fixed grain sits at z −1 beneath everything. Header floats at z 20; the hero stacks fallback → WebGL layer → contrast scrim → content. The hero strip sits on translucent obsidian with backdrop blur. The only fixed overlay is the internal wrapper's lab chip (z 50) — never rendered on production routes. No dialog/modal layer exists.
- Expressive depth: additive WebGL glow sprites and halos stand in for bloom; sheen sweeps travel gold surfaces (buttons on hover, the CTA plate on a loop, the hero gold word); scrims guarantee headline contrast over the brightest scene moments. All approved as the flagship's instrument character.

## Shapes

- Radius and geometry: near-square machined edges — 2px on buttons, chips and tags; 3px on the ledger plate; plates otherwise square with the engraved inner frame. The pill radius exists only on the internal lab chip. Do not introduce rounded-card geometry.
- Icons: there is no icon set. The only pictograms are bespoke inline SVG diagrams and the wordmark's luminous gate bar. Decorative SVGs (hero fallback, flag rule, stage markers, strip dividers) carry `aria-hidden="true"`.
- Imagery: no raster images anywhere on the site. All visuals are CSS gradients, inline SVG, canvas-baked textures or WebGL — a static-export rule (no network visual assets) as much as a brand one.

## Components

### Interaction and accessibility

- Semantics: native `a` and `button` elements only; no custom interactive widgets. The animated set-pieces are non-interactive graphics with deliberate semantics: the trace diagram is `aria-hidden` with a visible text caption alongside; the currency match is a single labelled image (`role="img"` with a descriptive label); the ledger is a `figure` whose decorative status line is hidden from assistive technology.
- Cursor and stable states: hover states transition colour, border-colour, transform and shadow with explicit transition-property lists — `transition: all` is prohibited. Hover and press are interruptible; entrance animation is owned by the `Reveal` wrapper while the inner element owns hover, so the two transforms never fight.
- Focus and keyboard: `:focus-visible` renders a 1px `--gold-bright` outline offset 3px on links and buttons, verified visible in headed rounds. Focus order follows DOM order; no focus traps exist because no overlays exist. Complete keyboard flows have not been formally tested — keyboard operation beyond focus visibility is unverified.
- Names and announcements: the wordmark link is labelled "FinTrace home"; the header nav is labelled "Page sections". No live regions are shipped. The approved contact form specifies status/alert roles, busy state and label associations — approved, not yet implemented.
- Motion: transform/opacity only, IntersectionObserver-armed, passive listeners. `Reveal` adds `is-visible` exactly once; stagger via the reveal-delay variable; hero load choreography staggers via the load-delay variable. Keyframe names are document-global, so every keyframe is route-prefixed (`engnet-`, `ecmnet-`, `engnet-lt-`; the approved pages reserve `engab-`/`engeg-`/`engct-`/`engnf-`). rAF and WebGL loops pause when hidden or offscreen; canvas DPR caps at 2. **Never add `prefers-reduced-motion` conditionals — binding workspace rule.**

### Actions and buttons

Two-tier hierarchy, both in the mono voice with 2px radius and press `scale: 0.96`:

- Gold (`.eng-btn-gold`): dark ink on a champagne metal gradient, hover lift with brightened ring shadow and a light sweep; the CTA plate variant (`.eng-btn-loop`) loops its sweep unattended; the header size (`.eng-btn-sm`) carries its 44px target in its real box. One gold action per surface.
- Ghost (`.eng-btn-ghost`): gold mono text in a hairline border, hover fills faintly and brightens. The secondary path beside every gold action.

All current CTAs target the assessment mailto or in-page anchors. The approved retarget to the contact page is not yet implemented — and any hero CTA change, even attribute-only, triggers the full seven-viewport hero matrix.

### Forms and selection

None shipped. The approved contact form (site pages plan) defines the complete contract: mono uppercase labels above obsidian fields with hairline borders and gold focus, a fixed six-field order, hidden subject/source/honeypot fields, a submit button in the full gold pattern, an error panel that preserves typed values and offers the mailto fallback, and a success panel that resets the form. Build it from that plan's copy deck and behaviour contract verbatim; it ships as the site's only Client Component form and its Formspree POST is the approved sole runtime network request.

### Navigation and search

- Header: wordmark (ivory "Fin", luminous gate bar, gold "Trace") linking home; mono uppercase anchors for Process / Ledger / Tracing / Proof; gold "Request assessment" button. Below 768px the anchors hide and the wordmark and button remain — there is no menu, hamburger or search, and none is planned.
- Anchored sections set `scroll-margin-top` so smooth scrolling (global) lands clear of content.
- Approved, not yet implemented: shared sub-page header (About / Engagement / Contact links) and the four-link footer page nav; production pages must never link to `/internal-design/` or any lab route.

### Cards, badges, and statuses

- Audience cards (`.eng-card`): hairline border, faint gold corner-gradient surface, hover lift with corner glow; the featured "proven wedge" card spans two tracks with a brighter border and a mono gold note. Card headings 650, body in supporting grey.
- Badges and tags: mono uppercase chips with hairline borders (spec tags, ledger category chips); the flagged chip borrows the crimson treatment.
- Status language: run/animation states are one-shot staged keyframes armed by visibility, never spinners. Crimson is reserved for flagged evidence — it must never become a general error/danger colour on new surfaces without a recorded decision.

### Tables and dense data

The ledger set-piece is the only table and the template for any future dense data: a mono CSS grid with baseline alignment, tabular numerals, right-aligned amounts (credits in the brighter gold), hairline row rules, stamped category chips, and the flagged-row treatment — a continuous crimson rule drawn via pathLength dash with a non-scaling stroke, plus the in-flow marginal annotation so nothing shifts. A double-gold rule closes the reconciled balance. Below 700px it drops the balance and category columns and re-flows chips beneath rows rather than scrolling sideways. No sorting, filtering or pagination exists anywhere.

### Dialogs, sheets, popovers, and tooltips

None shipped and none planned. Do not introduce an overlay layer without a decision recorded in the design plan.

### Alerts, loading, empty, and error states

- Hero resilience is the model: a designed static SVG fallback paints instantly; the WebGL layer cross-fades in only when its first frame has rendered; renderer construction is wrapped so a missing WebGL context leaves the designed fallback rather than a crash. Wide and compact fallbacks mirror the scene's own aspect contract so the cross-fade never jumps.
- Empty states: none exist (the site has no user data).
- Error pages: the production 404 is currently Next's unstyled default — known drift. The approved branded 404 (obsidian shell, "No trace of this page.", static constellation echo, gold return button) is specified in the site pages plan.
- The approved contact form defines the only alert-style panels (success/error) in the system.

## Do's and Don'ts

- Do scope every new production rule under `.dsn-engine-network` and prefix every new keyframe with its route-unique prefix.
- Do reuse the exported font instances, palette variables and existing component classes before writing new ones.
- Do ground every visible claim in the brand brief's closed claim set, write British English with curly apostrophes, no emoji, and no Oxford comma in running copy.
- Do re-run the seven-viewport hero matrix (with fallback and lifecycle checks) for ANY hero change, however trivial, and the standard two-viewport check for everything else — zero console errors, zero page errors, zero horizontal overflow.
- Do record every design decision in `documents/plans/fintrace_design_plan.md` in the same task, and keep this document truthful when behaviour changes.
- Don't add fonts, icon sets, UI libraries, raster images, network assets or analytics; the approved Formspree POST is the only permitted runtime network request.
- Don't add `prefers-reduced-motion` conditionals, `transition: all`, or unprefixed keyframes.
- Don't let crimson leave the flagged-evidence role, put more than one gold button on a surface, or wrap more than one clause per heading in gold.
- Don't duplicate a sentence verbatim between visible copy blocks, and don't link any production page to `/internal-design/` or a lab route.
- Don't "fix" lab routes (including the base engine's point-burst output — it is the preserved comparison reference), and don't edit generated `.next/` or `out/` files.

## Product Workflows and Content

- The page is one narrative in a fixed section order: hero → process → ledger ("the evidence, structured") → tracing ("the evidence, connected") → match ("the evidence, matched") → capabilities → proof → audiences → engage → footer. The three set-pieces tell a single transaction's story — the arc runs pages → ledger → network → finding. Do not reorder sections or break the story's continuity.
- The canonical evidence story is load-bearing copy: the flagged A$9,500 ATM withdrawal (07 Mar 2024, cited to its source page), the A$28,000 Wise transfer (02 Apr) and the ₹18,20,000 arrival at HDFC (04 Apr) at FX 65.00. The ledger's balances genuinely reconcile. Change these numbers only as a recorded decision, and keep ledger, trace and match telling the same transaction.
- Headline voice: two short declaratives with the payoff clause in gold ("Four stages. One chain of evidence."). Kickers are short mono phrases. Ledes are concrete and rhythmic, heavy on colons and em dashes (true em dashes with spaces). The mono voice owns labels, numerals, buttons and strips.
- Proof numbers are fixed: an estimated fifty hours delivered in about ten (the signature stat counts backwards), about fifty accounts, fifteen years, thousands of pages, and the finding that results closely matched the instructing lawyer's independent analysis. The allowed claim set is closed — no founders, dates, team, offices, clients, turnaround promises or security claims may be invented.
- Terminology: "service, not software"; "Engaged per matter · Australia-wide"; the CTA is always "Request a matter assessment"; contact is `hello@fintrace.com.au`. The wordmark is Fin | gate bar | Trace with Trace in gold. Page language is en-AU; sub-page titles flow through the root layout's title template.
- The approved pages' copy decks in the site pages plan are verbatim-binding when those pages are built; new-page sentences must not duplicate home-page sentences.

## Approved Exceptions and Drift

- Approved exceptions: WebGL for the flagship hero only, imported solely through the engine-family scene modules; the Formspree browser POST as the sole future runtime network request; the production pages sharing the flagship scope with per-page class prefixes (about `eng-ab-`, engagement `eng-eg-`, contact `eng-ct-`, 404 `eng-nf-`, shared `eng-page-`) while lab routes keep strict per-route isolation; the internal comparison wrapper rendering the same page with the lab chip and noindex metadata.
- Known implementation drift: the production 404 is unstyled (branded replacement approved); all CTAs still point at the mailto pending the contact page; the sitemap lists one URL until the approved pages land; the contact mailbox exists in copy but was never verified; OG/social metadata, a favicon set beyond the SVG icon and analytics are deliberately unconfigured; keyboard flows and measured contrast are unverified (see Colors and Components).
- Lab-route drift is historical and protected: four variations keep the pre-flip currency direction, the original trace page keeps its overlapping match geometry, and the base engine keeps its point-burst output. Port the canonical story deliberately if a route is ever promoted — never patch piecemeal.
- Development-only patterns: the neutral gallery and eleven candidate routes (public, unlinked, noindex) each own a full divergent visual system under their own scope class. Nothing there is production precedent.

## Design Verification

There is no automated design test suite; evidence is lint, static build and headed real-GPU dev-browser checks, with screenshots recorded per round in the design plan. Keep commands and server lifecycle in `AGENTS.md`.

| Viewport or mode | Routes and states | Proof |
| --- | --- | --- |
| 1440x900 | Every changed route, full scroll with reveals settled | Zero console/page errors, zero horizontal overflow, animations render, focus outline visible |
| 390x900 | Every changed route, compact hero, stacked grids, ledger's compressed columns | Same gates; single-line proof stats; no clipped labels |
| Hero matrix: 1440x900, 1998x750, 2560x1080, 3425x1245, 1024x768, 900x1080, 390x900 | Any hero change, however small | One canvas per load; composition matches the recorded baselines; labels crisp; headline clear of the gate |
| Live resize 1300x900 → 3425x1245 | Hero | Same canvas retained, offsets apply monotonically, zero overflow |
| Forced WebGL failure | Hero | Designed static fallback remains at full opacity; no canvas, no error |
| Offscreen / hidden tab | Hero and set-pieces | rAF callbacks drop to zero, resume cleanly; mount/unmount cycles hold heap steady |
| Rendered-copy read-through | All production pages after any copy change | Every claim maps to the brand brief; no verbatim duplication between copy blocks — read the live page, not the source |

Also verify keyboard order and focus visibility on changed surfaces, long-content wrapping in the ledger and strips, and that flagged states still pair crimson with text. The single dark theme is the only theme to verify.
