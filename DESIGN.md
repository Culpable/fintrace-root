---
version: alpha
name: FinTrace
description: Obsidian-and-gold Evidence Engine design system for the FinTrace forensic financial analysis website.
---

# FinTrace Design System

## Overview

### Purpose and authority

This document is the visual implementation contract for the FinTrace production website: the Engine Network flagship serving at `/` and the approved production sub-pages that extend it. Read it before any UI work, alongside `AGENTS.md`; its binding technical rules take precedence over this document.

Token authority is **implementation-authoritative**: every exact colour, type, spacing and shadow value lives in `src/app/engine-network/engine-network.css` as CSS custom properties and rules scoped under the `.dsn-engine-network` class. This document records semantic roles, ownership and behaviour — it never becomes a second token registry. Where this document and the implementation disagree, treat the difference as drift: follow the implementation, then record the discrepancy here.

Every claim below carries one of three statuses:

- **Shipped** — verified in implementation and through the required headed browser checks. Unlabelled claims are shipped.
- **Approved, not yet implemented** — accepted future work recorded in a plan but absent from the current implementation. No production-page work currently carries this status.
- **Lab** — development-only comparison systems archived under `src/app/_design-lab/`; unrouted and never production precedent.

### Product character

- Audience and job: legal buyers — family law firms, in-house and institutional legal teams, forensic accountants, insolvency practitioners, estate and financial-abuse teams — evaluating a forensic bank-statement analysis service. The site's one job is to earn LexisNexis-grade trust and convert to a matter-assessment enquiry.
- Character: a precision instrument. Obsidian ground with a warm undertone, champagne-gold rendered as light on metal (gradients, never flat yellow), engraved plates with machined corner ticks, a mono specification voice for every label and numeral, and restrained motion that always demonstrates the product — evidence entering, reconciling, tracing, matching.
- Not: SaaS dashboard styling, stock imagery or photography, emoji, a light theme, playful illustration, decorative motion that demonstrates nothing, or any invented proof, people, clients or credentials.
- Expressive exceptions: the WebGL hero constellation and its three animated evidence set-pieces (ledger, trace, currency match) are the approved showpieces. The archived lab candidates each retain a deliberately divergent development-only system under `src/app/_design-lab/`.

### Source map

| Concern | Source | Ownership |
| --- | --- | --- |
| Tokens, all component and responsive rules | `src/app/engine-network/engine-network.css` | Palette custom properties, typography, buttons, header/footer, plates, cards, set-piece styling, breakpoints — all scoped under the route class |
| Fonts | `src/app/engine-network/fonts.ts::bricolage` | Bricolage Grotesque and Fragment Mono via next/font, exposed as CSS variables; the only permitted font instances |
| Page shell, sections, copy | `src/app/engine-network/EngineNetworkPage.tsx::EngineNetworkPage` and production route folders | Homepage section order plus About, Engagement, Contact and branded 404 copy |
| Shared production chrome | `src/app/engine-network/SiteChrome.tsx` and `src/app/engine-network/site-pages.css` | Sub-page header, four-link footer navigation and shared sub-page layout primitives |
| Hero composition and fallback | `src/app/engine-network/Hero.tsx::Hero` | Layered fallback/scene/scrim/headline/strip structure, load stagger, static SVG echoes |
| WebGL scene | `src/app/engine-network/Scene.tsx` | Constellation geometry, framing formulas, lifecycle gating, disposal, DPR cap |
| Entrance choreography | `src/app/engine-network/Reveal.tsx::Reveal` | One-shot IntersectionObserver trigger adding the visible class |
| Animated numerals | `src/app/engine-network/Stat.tsx::Stat` | Count-up/count-down stats; production uses count-up only (the outcome plate's 100%), count-down remains for archived lab candidates |
| Ledger set-piece | `src/app/engine-network/LedgerPlate.tsx::LedgerPlate` | Reconciling table data, run choreography trigger, flag rule SVG |
| Trace set-piece | `src/app/engine-network/TraceDiagram.tsx` | Canvas account graph, label/note offset variables |
| Match set-piece | `src/app/engine-network/CurrencyMatch.tsx` | Cross-currency SVG diagram and its labelled-image semantics |
| Neutral global layer | `src/app/globals.css` | Smooth scroll, font smoothing, overflow-x clip — nothing visual |
| Site and page metadata | `src/lib/metadata.ts` | Single source for site identity, production titles, descriptions, canonical origin and the social-image reference |
| Root layout and social metadata | `src/app/layout.tsx` | en-AU lang, metadata base, pipe title template and site-wide Open Graph/Twitter blocks; deliberately font-neutral |
| Analytics Module | `src/lib/analytics/core.ts` and `src/lib/analytics/client.ts` | Closed five-event taxonomy, route normalisation, common properties, queueing, production gating and recorder-free Mixpanel US adapter |
| Global analytics instrumentation | `src/instrumentation-client.ts` | Initial and distinct client-route page views, deferred idle initialisation and delegated marked-CTA tracking without hydrating the root layout |
| Social-share image | `public/images/og/fintrace-og.png` | 1200×630 crawler-facing PNG using the Engine Network wordmark, approved home-title clause and domain; its settled homepage-scene diagram contains the same eight labelled account nodes, seven rim-connected edges, scanning gate and crimson CASH ATM hop as the live hero |
| Browser identity assets | `src/app/icon.svg`, `src/app/favicon.ico` and `src/app/apple-icon.png` | Shared Bricolage glow `F | T` SVG, 16/32/48 px PNG-entry ICO and 180×180 Apple icon derived from that vector; the previous Root set remains under `src/assets/browser-identity/` for rollback |
| Production route wrapper | `src/app/page.tsx` | Thin indexable wrapper rendering the shared page without the lab chip |
| Archived internal wrapper chrome | `src/app/_design-lab/engine-network/internal-engine-network.css` | The unrouted comparison-only lab chip; never loaded by a production route |
| Production site pages | `documents/learnings/fintrace_site_pages_plan.md` | Implemented copy decks, form contract, shared chrome and route-specific prefixes |
| Binding project rules | `AGENTS.md` | Isolation, animation, static-export and validation rules; commands and server lifecycle |

### Foundations

- Framework and rendering: Next.js App Router with React Server Components by default; interactivity lives in colocated `'use client'` components. The site is a pure static export (`output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`) — no server runtime, API routes, middleware or runtime image optimisation.
- Analytics: production uses anonymous local-storage device identity in dedicated US Mixpanel project `4045938`. The only project-owned events are `Page Viewed`, `Assessment CTA Clicked`, `Matter Enquiry Started`, `Matter Enquiry Submitted` and `Matter Enquiry Submission Failed`; development and tests make no live Mixpanel request.
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
- Accessibility target: no formal contrast target is recorded. Verification is visual through the required headed browser checks; rendered contrast pairs have not been formally measured, so no WCAG conformance is claimed.
- Status communication: colour never carries a status alone. The flagged ledger row pairs its crimson rule with a marginal text annotation and a category chip; the trace diagram's crimson hop is captioned in text; the gold "matched" verdict is a text stamp.
- A page-wide gold-dust film grain (a fixed SVG turbulence tile at 4% alpha) and a gold `::selection` colour keep even incidental surfaces on-brand.

## Typography

- Display role: Bricolage Grotesque through the `--font-eng-display` variable. Hero display sits at weight 760 with tight negative tracking; section headings at 700; card and spec headings at 650. Every h1/h2 wraps exactly one payoff clause in the gold-gradient span (`.eng-gold-text`) — gold type is a gradient clipped to glyphs, never a flat colour.
- Specification role: Fragment Mono through `--font-eng-mono` for kickers, navigation, buttons, tags, stats, strips, captions, footer metadata and all tabular data. Mono text is uppercase with wide letter-spacing; the kicker carries an engraved leading dash. Every mono stack leads with the single-glyph companion face `--font-eng-mono-approx` — a self-hosted 716-byte Fragment Mono subset holding only `≈` U+2248 (`src/assets/fonts/fragment-mono-approx.woff2`, loaded per route via next/font/local with the metric fallback disabled) — because the latin subset's unicode-range excludes that glyph; without the companion face it renders in the Arial metric fallback and sits visibly misaligned beside the numerals.
- Body role: ledes and body copy render in the display face at reading weight in `--grey-warm`, line-height 1.65.
- Scale: sizes are clamp-based fluid values owned by the stylesheet — consult `.eng-display`, `.eng-h2`, `.eng-lede` and the mono classes rather than restating values.
- Measure and wrapping: page container is a 74rem measure; section heads are bounded only by the container so short headings hold a single line; ledes cap at 52rem (~85ch — the generous end of the readable band, replacing an earlier heading-narrow 42rem/34rem that read as a pinched column) and the proof note at 42rem; the hero and CTA ledes keep tighter overrides (33rem and 38rem). Below 768px the homepage hero swaps to a shorter one-line kicker and compact lede, lightens that lede over a stronger reading scrim and aligns both actions to the full content width. Below 375px the kicker proportionally compresses its engraved lead, tracking and type so its audience statement remains complete without wrapping or clipping; both full-width hero actions compress their mono labels to one line so the complete evidence strip remains above the fold at 320 × 690. Ledger descriptions truncate with ellipsis; mono strips wrap with row gaps rather than overflowing. Production sub-page strips group each decorative middle dot with the fact it introduces so narrow column layouts never render punctuation as a standalone row.
- Numerics: `font-variant-numeric: tabular-nums` on stat values and all ledger data. Amounts use the true minus sign, credits carry a plus and the brighter gold, currency formats follow the canonical evidence story (Australian dollar and euro formats), and mono strips separate items with middle dots.

## Layout

- Spacing rhythm: sections use clamp-based block padding (`.eng-section`); plate padding and grid gaps are likewise fluid. There is no numbered spacing scale — rhythm values live in the stylesheet. Specification rows use shared desktop column starts, with content-sized badges aligned to the start of a fixed final track and their mono labels optically centred inside the borders.
- Breakpoints and frames: 900px (grids stack; the process progress line rotates into a left rail), 767px (header section links hide; the homepage also hides its duplicate header assessment button while sub-pages retain theirs), 700px (ledger table drops balance and category columns, masthead stacks), 480px (proof stats compress to a single-line rule). The hero has its own compact contract independent of these: width below 768px **or** aspect ratio below 1.2 selects the compact scene, fallback SVG and framing. A phone-only paint translation shifts both the live canvas and compact SVG right without changing the same compact Three.js projection used by portrait tablets.
- Navigation and shell: an absolute (not sticky) header over the hero — wordmark left, About / Engagement / Contact links and the gold assessment button right. Every production route uses the same `SiteHeader` contract. The shared footer uses a stable three-column desktop grid for brand, four production page links and the Contact-page action; it collapses to two columns below 1000 px and one column below 700 px.
- Overflow and dense data: `html, body { overflow-x: clip }` in the global layer; zero horizontal overflow at every verified viewport is a validation gate. Dense data compresses by dropping columns at breakpoints, never by page-level horizontal scrolling.
- Touch targets: 44px minimum everywhere. Sparse inline links (wordmark, header anchors, footer Contact-page action) extend via invisible pseudo-elements sized to stay clear of neighbours; buttons carry the target in their real padded box because their sheen's `overflow: hidden` clips pseudo extensions. The footer page nav uses in-flow 44px boxes because stacked links would otherwise overlap extended targets.

## Elevation & Depth

- Surface hierarchy: flat obsidian ground → hairline-ruled sections → engraved plates (gradient surface, 1px hairline border, inset top light, deep layered drop shadow, inner 10px engraved frame with gold corner registration ticks) → cards (hairline border plus ambient layered shadow; hover lifts 3px and deepens the shadow with a corner glow). Hairlines are the design language; shadows are additive depth, never a substitute.
- Overlays and stacking: the route root creates its own stacking context (`isolation: isolate`) so the fixed grain sits at z −1 beneath everything. Header floats at z 20; the hero stacks fallback → WebGL layer → contrast scrim → content. Below 768px a stronger directional scrim turns the translated network into right-hand atmosphere and protects the full copy band. The hero strip sits on translucent obsidian with backdrop blur. The archived internal wrapper retains a fixed lab chip at z 50, but the wrapper is unrouted and never rendered on production routes. No dialog/modal layer exists.
- Expressive depth: additive WebGL glow sprites and halos stand in for bloom; sheen sweeps travel gold surfaces (buttons on hover, the CTA plate on a loop, the hero gold word); scrims guarantee headline contrast over the brightest scene moments. All approved as the flagship's instrument character.

## Shapes

- Radius and geometry: near-square machined edges — 2px on buttons, chips and tags; 3px on the ledger plate; plates otherwise square with the engraved inner frame. The pill radius exists only on the internal lab chip. Do not introduce rounded-card geometry.
- Icons: there is no page icon library. The browser-chrome identity set uses the same self-contained Bricolage Grotesque 700 `F | T` vector as the FinTrace App, with equal clear space around its luminous gate. `icon.svg` is the canonical active source; the 16/32/48 px PNG-entry `favicon.ico` and 180×180 Apple icon derive from it. The previous Root SVG, ICO and Apple icon remain byte-identical under `src/assets/browser-identity/` for rollback. Page pictograms remain bespoke inline SVG diagrams; decorative SVGs (hero fallback, flag rule, stage markers, strip dividers) carry `aria-hidden="true"`.
- Imagery: no raster images render inside production pages. Page visuals are CSS gradients, inline SVG, canvas-baked textures or WebGL. The raster social-share image and browser icons are static-export artefacts fetched only by crawlers or browser chrome.

## Components

### Interaction and accessibility

- Semantics: native `a` and `button` elements only; no custom interactive widgets. The animated set-pieces are non-interactive graphics with deliberate semantics: the trace diagram is `aria-hidden` with a visible text caption alongside; the currency match is a single labelled image (`role="img"` with a descriptive label); the ledger is a `figure` whose decorative status line is hidden from assistive technology.
- Cursor and stable states: hover states transition colour, border-colour, transform and shadow with explicit transition-property lists — `transition: all` is prohibited. Hover and press are interruptible; entrance animation is owned by the `Reveal` wrapper while the inner element owns hover, so the two transforms never fight.
- Focus and keyboard: `:focus-visible` renders a 1px `--gold-bright` outline offset 3px on links and buttons, verified visible in headed rounds. Focus order follows DOM order; no focus traps exist because no overlays exist. Complete keyboard flows have not been formally tested — keyboard operation beyond focus visibility is unverified.
- Names and announcements: the wordmark link is labelled "FinTrace home"; header nav labels distinguish page sections from site pages. The contact form ships status/alert roles, busy state and explicit label associations.
- Motion: transform/opacity only, IntersectionObserver-armed, passive listeners. `Reveal` adds `is-visible` exactly once; stagger via the reveal-delay variable; hero load choreography staggers via the load-delay variable. Keyframe names are document-global, so every keyframe is route-prefixed (`engnet-`, `ecmnet-`, `engnet-lt-`; the approved pages reserve `engab-`/`engeg-`/`engct-`/`engnf-`). rAF and WebGL loops pause when hidden or offscreen; canvas DPR caps at 2. **Never add `prefers-reduced-motion` conditionals — binding workspace rule.**

### Actions and buttons

Two-tier hierarchy, both in the mono voice with 2px radius and press `scale: 0.96`:

- Gold (`.eng-btn-gold`): dark ink on a champagne metal gradient, hover lift with brightened ring shadow and a light sweep; the CTA plate variant (`.eng-btn-loop`) loops its sweep unattended; the header size (`.eng-btn-sm`) carries its 44px target in its real box. One gold action per surface.
- Ghost (`.eng-btn-ghost`): gold mono text in a hairline border, hover fills faintly and brightens. The secondary path beside every gold action.

Every public contact action targets `/contact/` or its `#enquire` form anchor. Assessment actions carry invisible allowlisted analytics attributes for header, hero, section or footer placement and contact or anchored-enquiry destination; ordinary navigation and the home process anchor do not. Any hero CTA change, even attribute-only, triggers the full seven-viewport hero matrix.

### Forms and selection

The contact page ships the complete form contract: mono uppercase labels above obsidian fields with hairline borders and gold focus, a fixed six-field order, hidden subject/source/honeypot fields, a submit button in the full gold pattern, an error panel that preserves typed values and asks the user to check their connection and retry, and a success panel that resets the form. It is the production pages' only Client Component form, and its Formspree POST to public form `xwvgoenw` is an approved runtime request. Generic lifecycle instrumentation records first interaction once per mount, confirmed success or a response/network failure; it never records the field, value, payload, response or error text. Local fetch stubs verify the success and failure state transitions. A live HTTP 200 submission and dashboard receipt were deliberately not run by user decision, so the production success path remains unproven until the first real enquiry. The `#enquire` form plate owns a 6rem anchor offset that explicitly outranks the shared 4rem section offset. Its restrained crimson error panel is an explicitly recorded exception to the flagged-evidence-only accent rule because text and alert semantics communicate the state independently of colour.

### Navigation and search

- Header: wordmark (ivory "Fin", luminous gate bar, gold "Trace") linking home; mono uppercase links for About / Engagement / Contact; gold "Request assessment" button. Below 768px the page links hide; the homepage header also hides its duplicate assessment button so the full-width hero action owns conversion, while production sub-pages retain the header button. There is no menu, hamburger or search, and none is planned.
- Anchored sections set `scroll-margin-top` so smooth scrolling (global) lands clear of content.
- Internal route-target actions — the header and footer links, the hero CTA and every CTA-plate button — render through `next/link`, so production navigation is prefetched and client-side. Same-page hash actions (the hero’s `#process` button and the contact page’s own `#enquire` header button) remain native anchors, keeping their in-page jump behaviour unchanged.
- Every production route uses the shared About / Engagement / Contact header, and the footer exposes exactly Home / About / Engagement & pricing / Contact. Production pages never link to an archived lab candidate.

### Cards, badges, and statuses

- Audience cards (`.eng-card`): hairline border, faint gold corner-gradient surface, hover lift with corner glow; the featured "core matter type" card spans two tracks with a brighter border and a mono gold note. Card headings 650, body in supporting grey.
- Badges and tags: mono uppercase chips with hairline borders (spec tags, ledger category chips); the flagged chip borrows the crimson treatment.
- Status language: run/animation states are one-shot staged keyframes armed by visibility, never spinners. Crimson is reserved for flagged evidence — it must never become a general error/danger colour on new surfaces without a recorded decision.

### Tables and dense data

The ledger set-piece is the only table and the template for any future dense data: a mono CSS grid with baseline alignment, tabular numerals, right-aligned amounts (credits in the brighter gold), hairline row rules, stamped category chips, and the flagged-row treatment — a continuous crimson rule drawn via pathLength dash with a non-scaling stroke, plus the in-flow marginal annotation so nothing shifts. A double-gold rule closes the reconciled balance. Below 700px it drops the balance and category columns and re-flows chips beneath rows rather than scrolling sideways. No sorting, filtering or pagination exists anywhere.

### Dialogs, sheets, popovers, and tooltips

None shipped and none planned. Record any decision to introduce an overlay layer in this document before implementation.

### Alerts, loading, empty, and error states

- Hero resilience is the model: a designed static SVG fallback paints instantly; the WebGL layer cross-fades in only when its first frame has rendered; renderer construction is wrapped so a missing WebGL context leaves the designed fallback rather than a crash. Wide and compact fallbacks mirror the scene's own aspect contract so the cross-fade never jumps.
- Empty states: none exist (the site has no user data).
- Error pages: the branded 404 uses the obsidian shell, “This page isn’t in the record.” copy, a static constellation echo and a gold return button.
- The contact form defines the only alert-style panels (success/error) in the system.

## Do's and Don'ts

- Do scope every new production rule under `.dsn-engine-network` and prefix every new keyframe with its route-unique prefix.
- Do reuse the exported font instances, palette variables and existing component classes before writing new ones.
- Do ground every visible claim in the brand brief's closed claim set, write British English with curly apostrophes, no emoji, and no Oxford comma in running copy.
- Do re-run the seven-viewport hero matrix (with fallback and lifecycle checks) for ANY hero change, however trivial, and the standard two-viewport check for everything else — zero console errors, zero page errors, zero horizontal overflow.
- Do keep this document truthful in the same task whenever production design or behaviour changes.
- Don't add fonts, page icon libraries, UI libraries, page-rendered raster images, network assets or analytics outside the approved Module; Formspree and production-only Mixpanel ingestion are the only permitted runtime request classes, while the social PNG and browser identity files are static-export artefacts.
- Don't add `prefers-reduced-motion` conditionals, `transition: all`, or unprefixed keyframes.
- Don't let crimson leave the flagged-evidence role, put more than one gold button on a surface, or wrap more than one clause per heading in gold.
- Don't duplicate a sentence verbatim between visible copy blocks, and don't link any production page to an archived lab candidate.
- Don't "fix" archived lab candidates (including the base engine's point-burst output — it is the preserved comparison reference), and don't edit generated `.next/` or `out/` files.

## Product Workflows and Content

- The page is one narrative in a fixed section order: hero → process → ledger ("the evidence, structured") → tracing ("the evidence, connected") → match ("the evidence, matched") → capabilities → outcome (section id "proof") → audiences → engage → footer. The three set-pieces tell a single transaction's story — the arc runs pages → ledger → network → finding. Do not reorder sections or break the story's continuity.
- The canonical evidence story is load-bearing copy: the flagged A$9,500 ATM withdrawal (07 Mar 2024, cited to its source page), the A$28,000 international transfer (02 Apr) and the €16,800 arrival at Deutsche Bank (04 Apr) at FX 0.6000. The ledger's balances genuinely reconcile. Recorded decision (20 July 2026): this illustrative Australian-dollar-to-euro corridor deliberately replaced the seeded matter’s corridor to decouple the public site from that matter. Change these numbers only as a recorded decision, and keep ledger, trace and match telling the same transaction.
- Recorded decision (20 July 2026): the FX bridge is named generically — "INTL TRANSFER" on diagram and ledger labels, "an international money-transfer service" in prose — never a brand. All account suffixes, deposit/transfer references, store and matter numbers across production and archived lab candidates are fabricated and were verified absent, even as substrings, from the founding matter's extracted records; do not reuse real-matter digits when changing them.
- Headline voice: two short declaratives with the payoff clause in gold ("Four stages. One chain of evidence."). Kickers are short mono phrases. Ledes are concrete and rhythmic, heavy on colons and em dashes (true em dashes with spaces). The mono voice owns labels, numerals, buttons and strips. The mobile homepage hero uses the kicker "Forensic analysis for legal teams" and the lede "FinTrace turns thousands of bank-statement pages into structured, source-linked evidence, ready for legal review." The wider hero retains its more detailed intake wording.
- The claim set is fixed and closed. Homepage outcome stats: 1,000s of pages consolidated into a single ledger, 100% of findings cited to the exact source page (the plate's single animated numeral, counting up), Decades of statements reconciled end to end, and 0 software to license, install or learn. The hero strip reads "Thousands of pages · Decades of statements · Any bank, any currency · One ledger". The quantified case study — an estimated fifty hours delivered in about ten, dozens of accounts, more than a decade of statements, every finding cited to source, and the finding that results closely matched the instructing lawyer's independent analysis — lives only on `/about/`, framed as one recent matter. Its strip reads "≈50 hrs estimated · ≈10 delivered · every finding cited to source". No founders, dates, team, offices, clients, turnaround promises or security claims may be invented, and no unframed founding-matter numbers may return to the homepage.
- Terminology: "service, not software"; "Engaged per matter · Australia-wide"; the CTA is always "Request a matter assessment"; every public contact action routes to `/contact/` and no mailbox address is displayed. The wordmark is Fin | gate bar | Trace with Trace in gold. Page language is en-AU; sub-page titles flow through the root layout's title template.
- The approved pages' copy decks in the site pages plan are verbatim-binding when those pages are built; new-page sentences must not duplicate home-page sentences.

## Approved Exceptions and Drift

- Approved exceptions: WebGL for the flagship hero only, imported solely through the production scene and archived engine-family scene modules; the Formspree browser POST and production-only Mixpanel US ingestion as the only runtime request classes; the crawler-facing social PNG as the sole raster asset; and the production pages sharing the flagship scope with route-specific class prefixes (about `eng-ab-`, engagement `eng-eg-`, contact `eng-ct-`, 404 `eng-nf-`, shared `eng-page-`). Lab candidates and the internal comparison wrapper are archived unrouted under `src/app/_design-lab/` and no longer ship.
- Analytics privacy decision: Mixpanel remains anonymous and explicit-event only, with local-storage device persistence and no identify/People calls, form or matter data, raw locations, referrers, advertising identifiers, autocapture, heatmaps or replay. The site intentionally has no analytics consent, opt-out, preference or privacy-notice UI.
- Known implementation drift: Safari/Firefox, notification-mailbox delivery, complete keyboard flows and rendered contrast pairs remain unverified. No WCAG conformance is claimed. Typography review also records two deferred micro-items: no global `font-synthesis: none` and no deliberate `text-wrap: balance`/`pretty`; both require a separate production CSS change and the full two-viewport validation matrix.
- Archived lab drift is historical and protected: four variations keep the earlier currency direction, the original trace page keeps its overlapping match geometry, and the base engine keeps its point-burst output. Port the canonical story deliberately if a candidate is ever revived — never patch piecemeal.
- Development-only patterns: the neutral gallery and eleven candidates remain unrouted under `src/app/_design-lab/`, each with a full divergent visual system under its own scope class. Nothing there is production precedent.

## Design Verification

There is no automated visual test suite; evidence is the focused Node analytics Interface suite, lint, static build and headed real-GPU dev-browser checks. Analytics verification also inspects captured payloads for excluded data, confirms development makes no ingestion request and proves the built application has no rrweb or recorder implementation chunk. Keep commands and server lifecycle in `AGENTS.md`. Latest hero-matrix run: 2026-07-20, after the mobile visibility pass. All seven viewports passed every gate: one canvas per normal load, intact forced fallback, same-canvas live resize, lifecycle pause and resume, zero console/page errors and zero horizontal overflow. The six viewports at or above 768px retained their existing copy, header action and unshifted canvas.

| Viewport or mode | Routes and states | Proof |
| --- | --- | --- |
| 1440x900 | Every changed route, full scroll with reveals settled | Zero console/page errors, zero horizontal overflow, animations render, focus outline visible |
| 390x900 | Every changed route, compact hero, stacked grids, ledger's compressed columns | Same gates; mobile hero copy and full-width actions visible; homepage header action absent; complete strip and single-line proof stats; no clipped foreground copy |
| Hero matrix: 1440x900, 1998x750, 2560x1080, 3425x1245, 1024x768, 900x1080, 390x900 | Any hero change, however small | One canvas per load; composition matches the recorded baselines; labels crisp; headline clear of the gate |
| Live resize 1300x900 → 3425x1245 | Hero | Same canvas retained, offsets apply monotonically, zero overflow |
| Forced WebGL failure | Hero | Designed static fallback remains at full opacity; no canvas, no error |
| Offscreen / hidden tab | Hero and set-pieces | rAF callbacks drop to zero, resume cleanly; mount/unmount cycles hold heap steady |
| Rendered-copy read-through | All production pages after any copy change | Every claim maps to the brand brief; no verbatim duplication between copy blocks — read the live page, not the source |

Also verify keyboard order and focus visibility on changed surfaces, long-content wrapping in the ledger and strips, and that flagged states still pair crimson with text. The single dark theme is the only theme to verify.
