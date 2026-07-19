# ~~Generalise Founding-Matter Copy Plan~~ ✅ **COMPLETED**

<critical_warning>
> **CRITICAL WARNING:** `DESIGN.md:179` declares the current proof numbers a fixed, closed claim set. This plan is the recorded decision that changes that set. DESIGN.md MUST be updated in the same task as the copy edits (per the `<documentation_synchronisation>` rule in `AGENTS.md`), or the design contract and the shipped site will contradict each other.
</critical_warning>

<important_note>
> **IMPORTANT NOTE:** All new copy must be grounded in `/Users/sacino/fintrace/documents/reference/brand_naming_background.md`. Generalising capability claims (any bank, any format, decades of statements, multi-currency) is permitted; inventing proof is not. Specifically: never claim plural engagements ("proven on live matters", "one of many matters", "typical of our matters") — the grounded record is one real matter. The generalisation strategy is to state capabilities in general terms and present the one real matter as a framed worked example, without asserting a count of engagements in either direction.
</important_note>

## 1. Goal

Remove insider-context references to FinTrace's founding matter from the production website so a cold visitor with zero background understands every claim, while keeping the site's only concrete proof point available as a properly framed case study on `/about/`.

The pain point: the site was written from inside the founding engagement (a real family-law property matter: thousands of pages, ~50 accounts, 15 years of statements, a review estimated at 50 hours delivered in ~10). Those numbers were promoted into positioning slots — the homepage hero stat strip, section headlines, an audience card, the proof section — with no antecedent. A new visitor cannot resolve "≈50 ACCOUNTS" or "Fifty hours of review. Delivered in about ten." because the matter they refer to is never introduced. The fix is to GENERALISE: talk about what the engine handles in general (thousands of pages, decades of statements, any bank, any currency), and confine the specific story to one clearly framed case-study block on the About page, written as a worked example rather than an origin myth.

Done means:
- No unframed founding-matter numbers anywhere on production routes (`/`, `/about/`, `/engagement/`, `/contact/`, root 404).
- The homepage is 100% general — every numeral answers "of what?" within its own sentence.
- The About page carries the single quantified case study, framed as one live matter the engine ran ("In one live property matter…"), not as "the project FinTrace was built on".
- `DESIGN.md` reflects the new claim set. Lint, static build, and browser checks pass.

---

## 2. Current State Analysis

### 2.1 Current Implementation Overview

FinTrace Root is a static-export Next.js App Router site (`output: 'export'`, GitHub Pages, no backend). The production homepage at `src/app/page.tsx` renders `EngineNetworkPage` from `src/app/engine-network/EngineNetworkPage.tsx`; its hero is `src/app/engine-network/Hero.tsx`. Production sub-pages live at `src/app/about/page.tsx`, `src/app/engagement/page.tsx`, `src/app/contact/page.tsx`, plus `src/app/not-found.tsx`. Site-wide titles/descriptions live solely in `src/lib/metadata.ts`. The visual/voice contract is `DESIGN.md`.

Copy audit result (all production surfaces read in full):

- **Already fully general — no changes needed:** `src/app/engagement/page.tsx`, `src/app/contact/page.tsx` (+ `ContactForm.tsx`), `src/app/not-found.tsx`, the homepage hero headline/lede, process stages (`STAGES`), capability specs (`SPECS`), ledger section, currency-match section, CTA plate, header/footer (`SiteChrome.tsx`), the hero fallback SVGs (no text), and the OG image `public/images/og/fintrace-og.png` (verified visually: headline + diagram only, no matter stats).
- **Insider references to fix (exhaustive list):**
  1. `src/app/engine-network/Hero.tsx:133-141` — hero mono stat strip: `Thousands of pages | ≈50 accounts | 15 years of statements | One ledger`.
  2. `src/app/engine-network/EngineNetworkPage.tsx:194` — tracing headline: `Fifty accounts. One thread of evidence.`
  3. `src/app/engine-network/EngineNetworkPage.tsx:98-103` — audience card copy `…the matters FinTrace was proven on: thousands of pages, fifty accounts, fifteen years of history.` with note `The proven wedge` (internal strategy vocabulary), plus the code comment at line 98.
  4. `src/app/engine-network/EngineNetworkPage.tsx:255-295` — proof section: kicker `Proven on a live matter`, H2 `Fifty hours of review. Delivered in about ten.`, four stat tiles (50→10 hrs backwards meter, ≈50 accounts, 15 yrs, 1,000s pages), and the note about matching the instructing lawyer's independent analysis.
  5. `src/app/about/page.tsx:48-71` — origin section: kicker `The origin`, H2 `Built on a real matter, not a demo.`, two story paragraphs ("FinTrace was proven inside a live property matter…", "That matter set the standard for the service."), and the mono strip `≈50 hrs estimated · ≈10 delivered · ≈50 accounts · 15 yrs of statements`.
  6. `src/lib/metadata.ts` — the `about` description contains `proven on a live matter`.
  7. `DESIGN.md:142` (featured "proven wedge" card) and `DESIGN.md:179` (fixed proof-number claim set) document the copy being changed; `DESIGN.md:176` names the section order including "proof".

### 2.2 The Core Problem

Curse-of-knowledge copy. Statistics from one specific engagement were placed in slots a cold reader parses as general product claims (a hero stat strip conventionally signals aggregate track record), with no framing sentence introducing the matter. The numbers therefore read as confusing specs, arbitrary limits, or an underwhelming lifetime total. Secondary problem: internal strategy vocabulary ("the proven wedge") leaked into user-facing copy.

### 2.3 Affected User Scenarios

- Cold prospect landing on `/`: hits `≈50 ACCOUNTS | 15 YEARS OF STATEMENTS` immediately below the headline and cannot tell whether these are capacity limits, requirements, or averages.
- Prospect scrolling to the proof section: reads `Fifty hours of review. Delivered in about ten.` with no referent — whose fifty hours, which review?
- Prospect reading audience cards: `the matters FinTrace was proven on` refers (plural, definite) to matters never described; `The proven wedge` is meaningless outside a strategy meeting.

### 2.4 Technical Constraints

From `AGENTS.md` (all apply to this work):
- British English; curly apostrophe `’` (never `'`) in all frontend copy; no emoji.
- Ground every claim in `/Users/sacino/fintrace/documents/reference/brand_naming_background.md`; service-not-software positioning; do not invent capabilities, proof, clients, or features.
- Keep DESIGN.md truthful in the same task as any production copy-voice change.
- Preserve `output: 'export'`; do not edit generated `.next/` or `out/` files.
- Validation commands: `npm run lint` (zero errors) and `npm run build` (static export completes). No unit/integration/Playwright suite exists.
- Browser verification via the `dev-browser` skill at desktop `1440x900` and mobile `390x900` for every changed route; because the hero strip is part of the hero, DESIGN.md:198 additionally requires the full hero viewport matrix (`1440x900, 1998x750, 2560x1080, 3425x1245, 1024x768, 900x1080, 390x900`) for any hero change, however small. Dev server: check `http://localhost:3004` first; reuse if running, else `npm run dev`.
- Apply the `vercel-react-best-practices` skill to changed React code (changes here are copy-only within existing components; no rendering-architecture changes).

From `DESIGN.md` (voice contract, lines 83, 87-88, 176-179):
- Every h1/h2 wraps exactly one payoff clause in the gold-gradient span (`.eng-gold-text`).
- Headline voice: two short declaratives with the payoff clause in gold. Kickers are short mono phrases. Ledes are concrete, colon- and em-dash-heavy (true em dashes with spaces).
- Mono strips are uppercase (via CSS), separate items with dividers/middle dots, and must wrap with row gaps rather than overflow.
- Do not reorder the homepage section order: hero → process → ledger → tracing → match → capabilities → proof → audiences → engage → footer. This plan re-copies the proof section in place; it does not move it.
- The canonical evidence story (the flagged A$9,500 ATM withdrawal, the A$28,000 Wise transfer, the ₹18,20,000 HDFC arrival at FX 65.00) at DESIGN.md:177 is load-bearing **illustrative** copy for the ledger/trace/match set-pieces. It is a worked demonstration, not an unframed matter stat — it MUST NOT be changed by this plan.
- Proof stats compress to a single-line rule at 480px (DESIGN.md:93); the proof note measure caps at 42rem (DESIGN.md:87).

### 2.5 Existing Infrastructure That Can Be Reused

- `src/app/engine-network/Stat.tsx` — animated numeral component (`from`, `to`, `duration`, `prefix`, `suffix`); supports count-up and count-down; renders the start value in static export markup. Reused for the new `100%` stat. Static string values (like the existing `1,000s`) are plain `<p className="eng-stat-value">` text — no component needed.
- All existing CSS classes (`.eng-hero-strip`, `.eng-strip-div`, `.eng-proof-stats`, `.eng-proof-stat`, `.eng-stat-value`, `.eng-stat-label`, `.eng-proof-note`, `.eng-page-strip`, `.eng-ab-strip`, `.eng-kicker`, `.eng-h2`, `.eng-gold-text`) are reused unchanged. This is a copy-only change: no CSS, layout, animation, or component-structure edits.

---

## 3. Desired State

### 3.1 Desired State Requirements

- **REQ-1 (MUST):** The homepage (`/`) contains no founding-matter-specific numbers or references: no `≈50 accounts`, no `15 years` / `fifteen years`, no `Fifty accounts`, no `Fifty hours` / `fifty hours`, no `proven` (any casing), no `The proven wedge`, no reference to an instructing lawyer.
- **REQ-2 (MUST):** The hero stat strip states general capability claims: `Thousands of pages`, `Decades of statements`, `Any bank, any currency`, `One ledger` (in that order, existing divider markup unchanged).
- **REQ-3 (MUST):** The homepage proof section is re-copied in place as a general outcomes section (kicker `The outcome`; H2 `Statements in. Evidence out.` with `Evidence out.` in the gold span; four general stat tiles per Step 3; verifiability note per Step 3). Section `id="proof"` and DOM/CSS structure are unchanged.
- **REQ-4 (MUST):** The About page retains the single quantified case study (≈50 hrs estimated → ≈10 delivered, ≈50 accounts, 15 yrs, thousands of pages, findings matching the instructing lawyer's independent analysis) reframed as one worked example — kicker `In practice`, no "FinTrace was proven inside", no "That matter set the standard for the service", no "Built on a real matter" — per the exact copy in Step 4.
- **REQ-5 (MUST):** `src/lib/metadata.ts` `about` description no longer says `proven on a live matter`; replacement per Step 5.
- **REQ-6 (MUST):** `DESIGN.md` is updated in the same task: line 142's "proven wedge" card wording, line 176's section-order description if it names "proof" in a way that no longer matches, and line 179's fixed claim set rewritten to the new contract (Step 6).
- **REQ-7 (MUST NOT):** Do not touch the canonical evidence story numbers (A$9,500 / A$28,000 / ₹18,20,000 / FX 65.00), the ledger/trace/match set-piece copy that tells it (including the Wise/rupee references in the tracing and currency-match ledes — they are framed worked illustrations, not unframed matter stats), the homepage section order, any CSS, any animation lifecycle, or generated `.next/`/`out/` files.
- **REQ-8 (MUST NOT):** Do not edit the unlinked lab candidate routes (`src/app/engine-flow/`, `engine-trace/`, `engine-ledger/`, `engine/`, `engine-refined/`, `trace/`, `exhibit/`, and any other non-production `src/app/<route>/` design candidates) or `src/app/internal-design/`. They repeat the old copy by design, are `noindex` and unlinked, and are historical comparison artefacts. Only `engine-network` files are in scope because they ARE the production homepage.
- **REQ-9 (MUST):** All new copy is British English with curly apostrophes, no emoji, em dashes with spaces, one gold payoff clause per h2, and claims grounded in `brand_naming_background.md`.
- **REQ-10 (SHOULD):** Update code comments adjacent to changed copy so they stay accurate (the line-98 audience comment, the line-255 section banner comment, the signature-stat comment) in imperative mood per `AGENTS.md` commenting standards.

### 3.2 Verification Checklist

**Functional:**
- [x] `grep -rniE "≈50|fifty|15 years|fifteen years|proven|instructing lawyer" src/app/engine-network src/app/page.tsx` returns zero matches (required rewording two non-copy code comments — see Implemented Solution).
- [x] `grep -rniE "proven|built on a real matter|set the standard" src/app/about src/lib/metadata.ts` returns zero matches.
- [x] `grep -rn "≈" src/app/about` matches only the case-study strip line (`about/page.tsx:68`).
- [x] Every new h2 contains exactly one `.eng-gold-text` span (verified in source and rendered screenshots).
- [x] No straight apostrophes in user-facing copy strings; new contractions (`can’t`, `isn’t`) use the curly apostrophe.

**Validation commands:**
- [x] `npm run lint` exits 0 with zero errors (run after all edits).
- [x] `npm run build` completes the static export into `out/` without errors.

**Browser (dev-browser skill, `http://localhost:3004`):**
- [x] `/` at the full hero matrix (1440x900, 1998x750, 2560x1080, 3425x1245, 1024x768, 900x1080, 390x900): strip renders the four new items at every viewport, horizontal overflow 0 everywhere, headline clear of the gate, exactly one canvas inside `.eng-hero`, zero console errors. Strip wraps to two rows with row gaps at 390x900.
- [x] `/` outcomes section at 1440x900, 480x900 and 390x900: four new tiles render with labels unclipped; the `100%` stat completed its count-up (settled text `100%`) after scroll into view; note within measure. At 480px the tiles render two-up above the hairline rule — layout unchanged by construction (no CSS or markup structure touched).
- [x] `/about/` at 1440x900 and 390x900: `In practice` kicker, new H2 and both paragraphs render; the `≈50 hrs…` strip wraps with each middle dot grouped with its fact; zero console errors. Keyboard focus order unchanged by construction (no interactive elements added or removed).

**Docs:**
- [x] `DESIGN.md` lines 41/142/176/179 match the shipped copy (no "proven wedge", no fixed 50→10 homepage stat; hero strip and outcome stats recorded).

---

## 4. Additional Context

### 4.1 User-Provided Context

- The user's complaint (verbatim, on the hero strip and proof headline): "This doesn't make any sense in the context of a new user visiting the page with 0 context about the previous job that we worked through. … we need to GENERALISE this to BROAD benefits for a new user."
- Direction on strategy (verbatim): "we are GENERALISING from the founding matter - not making specific references to it. e.g we talk about how we can deal with thousands of pages / decades of statements / multicurrrcy IN GENERAL, not specific to the single job that we used to help the initial writer understand the context." The hero strip items in REQ-2 implement the user's own example trio plus the existing payoff item.
- Decision on proof content (user's answer to a direct question): keep the story on the About page, but "it needs to be more like 'one of many stories' rather than the current wording which makes it sound like it was the only project. More like a single testimonial within a generalised tool with such benefits, rather than 'we did this once so we can do it for you now'". Step 4's copy implements this: the matter is introduced as "one live property matter" (a worked example of the matter class), and the origin-myth sentences are removed.
- The user rated the proof section ("Fifty hours of review. Delivered in about ten.") a lesser instance of the problem than the hero strip, because its kicker partially frames it — but it is still to be generalised on the homepage.

### 4.2 Background and Decisions

- **Rejected alternative:** an earlier proposal kept the founding-matter numbers on the homepage proof section with stronger framing ("introduce the referent before the numbers"). The user explicitly rejected keeping specific references on the homepage. Do not reintroduce quantified matter stats to `/`.
- **Grounding tension resolved:** the brand brief records exactly one proven engagement, and `AGENTS.md` forbids inventing proof. Therefore the case-study copy must not claim plural engagements, and generalised homepage claims must be capability-shaped (what the engine handles / delivers), not track-record-shaped (what has been done N times). "Decades of statements" is user-supplied capability phrasing; the grounded real case spanned 15 years.
- **Why the About strip keeps `≈`:** inside a framed case study the approximation glyph is legible ("about fifty accounts" of that matter). On the unframed homepage it was part of the problem and is removed.
- **Signature backwards stat retired:** the 50→10 count-down meter (DESIGN.md:41, :179 and the code comment in `EngineNetworkPage.tsx`) IS the founding-matter number, so it cannot survive on the homepage. The animated-numeral pattern is retained via a 0→100 count-up on the `100%` cited-findings stat. `Stat.tsx` keeps its count-down capability (still used by unlinked lab routes); only its homepage usage changes.
- **Homepage note echoes the About standard deliberately:** the new outcomes note reuses the "If it can’t be checked, it isn’t a finding" formulation from `about/page.tsx`'s "The standard" section as a consistent brand line across pages. This is intentional voice cohesion, not accidental duplication.
- **`100%` claim grounding:** the brand brief states outputs have "full traceability back to the source PDF — so every finding can be human-verified". "100% of findings cited to the exact source page" restates that existing grounded claim.
- **`0` software claim grounding:** service-not-software positioning (brand brief; About page "Nothing to license. Nothing to learn.").
- **Sibling app:** FinTrace App (`/Users/sacino/fintrace`, deployed separately) owns actual document processing; this repository is only the marketing site — no copy here is generated from application data.
- **Concurrent collaborators:** other agents/humans may touch this repository simultaneously; if unexpected unrelated file changes appear, leave them untouched and continue.

---

## 5. Implementation Plan

Steps 1–6 are independent edits and may be done in any order; Step 7 (validation) runs last. Quoted "current" strings are exact file contents to locate; quoted "new" strings are exact replacements (apostrophes in new copy are curly).

### Step 1: Hero stat strip — general capability items ✅
**Objective:** Replace the founding-matter numbers in the homepage hero strip with the user-specified general capability claims.

File: `src/app/engine-network/Hero.tsx` (lines 133–141). Within the `eng-hero-strip` div, replace the two middle span texts, keeping all markup, classes, dividers, and load-delay styling identical:
- `<span>≈50 accounts</span>` → `<span>Decades of statements</span>`
- `<span>15 years of statements</span>` → `<span>Any bank, any currency</span>`
- First span `Thousands of pages` and last span `One ledger` are unchanged.

**Success Criteria:**
- The strip renders exactly four text spans in order: `Thousands of pages`, `Decades of statements`, `Any bank, any currency`, `One ledger`, with the three existing `eng-strip-div` dividers between them.
- `grep -n "≈50\|15 years" src/app/engine-network/Hero.tsx` returns zero matches.
- No other line of `Hero.tsx` changes (verify via `git diff -- src/app/engine-network/Hero.tsx` showing only the two span lines).

### Step 2: Tracing headline — every account ✅
**Objective:** Generalise the account-count headline; the lede below it already speaks generally ("the engine maps every account it reads") and is untouched.

File: `src/app/engine-network/EngineNetworkPage.tsx` (line 194):
- Current: `Fifty accounts. <span className="eng-gold-text">One thread of evidence.</span>`
- New: `Every account. <span className="eng-gold-text">One thread of evidence.</span>`

**Success Criteria:**
- Line renders `Every account. One thread of evidence.` with only `One thread of evidence.` inside the gold span.
- `grep -n "Fifty accounts" src/app/engine-network/EngineNetworkPage.tsx` returns zero matches.

### Step 3: Proof section → general outcomes section ✅
**Objective:** Re-copy the homepage proof plate in place as a fully general outcomes statement, keeping section id, order, and DOM/CSS structure.

File: `src/app/engine-network/EngineNetworkPage.tsx` (lines 255–295).
1. Section banner comment `{/* ----------------------------- Proof ----------------------------- */}` → `{/* ---------------------------- Outcome ---------------------------- */}`.
2. Kicker: `Proven on a live matter` → `The outcome`.
3. H2: `Fifty hours of review. <span className="eng-gold-text">Delivered in about ten.</span>` → `Statements in. <span className="eng-gold-text">Evidence out.</span>`
4. Replace the four stat tiles' contents (keep the `eng-proof-stats` / `eng-proof-stat` / `eng-stat-value` / `eng-stat-label` structure, four tiles):
   - Tile 1 — value: static text `1,000s` (no `Stat` component); label: `Of pages consolidated into a single ledger`.
   - Tile 2 — value: `<Stat to={100} suffix="%" duration={2200} />`; label: `Of findings cited to the exact source page`. Replace the old signature-stat comment with an imperative comment noting this tile keeps the plate’s single animated numeral (count-up to full coverage).
   - Tile 3 — value: static text `Decades`; label: `Of statements reconciled end to end`.
   - Tile 4 — value: static text `0`; label: `Software to license, install or learn`.
5. Note (`eng-proof-note`): replace the instructing-lawyer sentence with: `If it can’t be checked, it isn’t a finding — anything the engine asserts, a human can verify against its source page in seconds.`
6. The `Stat` import remains (still used by Tile 2). The `id="proof"` attribute and section position are unchanged.

**Success Criteria:**
- Section renders kicker `The outcome`, H2 `Statements in. Evidence out.` (gold span wraps exactly `Evidence out.`), the four tiles above in order, and the new note; `id="proof"` still present.
- `grep -nE "Fifty hours|from=\{50\}|to=\{10\}|instructing lawyer|Proven on a live matter" src/app/engine-network/EngineNetworkPage.tsx` returns zero matches.
- `grep -c "Stat " src/app/engine-network/EngineNetworkPage.tsx` confirms exactly one `<Stat` usage remains in the section (Tile 2), and `npm run lint` reports no unused-import error for `Stat`.
- The note string uses curly apostrophes (`can’t`, `isn’t`).

### Step 4: Audience card — benefit, not provenance ✅
**Objective:** Make the family-law card a general benefit statement and remove internal strategy vocabulary.

File: `src/app/engine-network/EngineNetworkPage.tsx` (lines 98–103):
1. Comment: `/** Audience cards; the first is the proven wedge and spans wider on desktop. */` → `/** Audience cards; the first is the core matter type and spans wider on desktop. */`
2. `copy`: current `'Property pools that turn on years of statements — the matters FinTrace was proven on: thousands of pages, fifty accounts, fifteen years of history.'` → new `'Property pools that turn on years of statements — contributions, drawings and transfers traced across every account in the pool.'`
3. `note`: `'The proven wedge'` → `'The core matter type'`

**Success Criteria:**
- `grep -ni "proven\|wedge\|fifty\|fifteen" src/app/engine-network/EngineNetworkPage.tsx` returns zero matches (this also re-verifies Steps 2–3).
- The featured card still spans wide on desktop (no className/structure change; only the three strings above differ in `git diff`).

### Step 5: About page — origin story becomes a framed case study ✅
**Objective:** Keep the site's single quantified proof point on `/about/`, reframed as one worked example rather than the founding project, per the user's testimonial-style direction.

File: `src/app/about/page.tsx` (the section currently at lines 48–71):
1. Kicker: `The origin` → `In practice`.
2. H2: `Built on a real matter, <span className="eng-gold-text">not a demo.</span>` → `One live matter. <span className="eng-gold-text">A fifth of the time.</span>`
3. Paragraph 1 — current: `FinTrace was proven inside a live property matter: thousands of pages of statements, about fifty accounts and fifteen years of history. The manual review was estimated at fifty hours of lawyer time. The engine delivered the ledger and the findings in about ten.` → new: `Document-heavy matters arrive as paper: thousands of pages of statements, accounts by the dozen, histories running back a decade or more. In one live property matter — about fifty accounts and fifteen years of statements — the manual review was estimated at fifty hours of lawyer time. The engine delivered the ledger and the findings in about ten.`
4. Paragraph 2 — current: `Those findings closely matched the analysis the instructing lawyer prepared independently, at a fifth of the time. That matter set the standard for the service.` → new: `Those findings closely matched the analysis the instructing lawyer prepared independently, at a fifth of the time — and every finding cited the source page it came from.`
5. Mono strip `≈50 hrs estimated · ≈10 delivered · ≈50 accounts · 15 yrs of statements` is unchanged — inside the framed case study these numbers now have their antecedent.

File: `src/lib/metadata.ts` — `about` description:
- Current: `'FinTrace is a specialist AI-assisted forensic bank-statement analysis service for legal teams - proven on a live matter, engaged per matter, Australia-wide.'`
- New: `'FinTrace is a specialist AI-assisted forensic bank-statement analysis service for legal teams - engaged per matter, Australia-wide, verifiable to the source page.'`
- Keep the file's existing hyphen-with-spaces convention in meta descriptions (meta strings are not rendered page copy; the em-dash rule applies to frontend copy).

**Success Criteria:**
- `grep -niE "proven|built on a real matter|set the standard|the origin" src/app/about/page.tsx src/lib/metadata.ts` returns zero matches.
- The section renders kicker `In practice`, the new H2 (gold span wraps exactly `A fifth of the time.`), both new paragraphs verbatim, and the unchanged `≈50 hrs…` strip.
- Em dashes in the new paragraphs are true em dashes with surrounding spaces; the new metadata description is ≤ 160 characters.

### Step 6: DESIGN.md — record the new claim contract ✅
**Objective:** Keep the design contract truthful in the same task, as `AGENTS.md` `<documentation_synchronisation>` requires.

File: `DESIGN.md`:
1. Line 142: update the featured-card description from `the featured "proven wedge" card` to `the featured "core matter type" card` (styling description unchanged).
2. Line 176: the section-order list keeps the section (position unchanged); if the surrounding prose names it "proof", annotate it as the outcome plate (e.g. `… capabilities → outcome (id "proof") → audiences …`) so the documented order matches shipped headings.
3. Line 179: replace the fixed-claim-set sentence with the new contract, preserving the closed-set rule. New content must state: the homepage outcome stats are fixed as `1,000s` of pages into a single ledger, `100%` of findings cited to the exact source page (the plate's single animated count-up numeral), `Decades` of statements reconciled end to end, and `0` software to license, install or learn; the hero strip is fixed as `Thousands of pages · Decades of statements · Any bank, any currency · One ledger`; the quantified case study (an estimated fifty hours delivered in about ten, about fifty accounts, fifteen years, thousands of pages, findings closely matching the instructing lawyer's independent analysis) now lives only on `/about/`, framed as one live matter; the claim set remains closed — no founders, dates, team, offices, clients, turnaround promises or security claims may be invented, and no unframed founding-matter numbers may return to `/`.
4. Line 41 documents `Stat` as "Count-up/count-down proof stats" — amend to note production now uses count-up only (count-down remains available to lab routes).

**Success Criteria:**
- `grep -n "proven wedge\|fifty hours delivered in about ten" DESIGN.md` shows the old line-179 claim text only within the new `/about/`-scoped sentence, and no "proven wedge" anywhere.
- DESIGN.md's stated homepage stats, hero strip items, and section order exactly match the shipped copy from Steps 1–4 (manual read-through comparison).

### Step 7: Validate ✅
**Objective:** Prove the change against project validation rules.

1. Run the grep sweep from §3.2 Functional.
2. `npm run lint` → exit 0, zero errors.
3. `npm run build` → static export completes into `out/` without errors.
4. Check `http://localhost:3004`; reuse a running dev server or start `npm run dev`. Using the `dev-browser` skill (fall back to `agent-browser` only if unavailable), verify `/` and `/about/` per §3.2 Browser, including the full hero viewport matrix (hero copy changed), scrolling the outcome plate into view to witness the `100%` count-up, and checking console/page errors, wrapping, clipping, and focus order on changed surfaces.

**Success Criteria:**
- All §3.2 checklist items pass; screenshots or dev-browser observations recorded for each required viewport; zero console errors on `/` and `/about/`.

---

## 6. Testing Plan

No automated test suite exists in this repository (per `AGENTS.md` `<testing_rules>`: validation is lint + static build + browser checks). Testing is therefore the Step 7 procedure; this section fixes the artefacts and expected outcomes.

### 6.1 Source-of-Truth Regression Artefacts

- **Artefact:** `/Users/sacino/Library/Application Support/CleanShot/media/media_AlkfZErNtX/CleanShot 2026-07-19 at 13.47.06.png` — the user's screenshot of the live homepage hero strip reading `THOUSANDS OF PAGES | ≈50 ACCOUNTS | 15 YEARS OF STATEMENTS | ONE LEDGER`. This is the reported symptom that triggered the work.
  - Why it matters: proves the unframed founding-matter stats a cold visitor sees first.
  - Expected post-fix behaviour: the same strip position renders `THOUSANDS OF PAGES | DECADES OF STATEMENTS | ANY BANK, ANY CURRENCY | ONE LEDGER` (mono uppercase styling applied by existing CSS). Verify by loading `http://localhost:3004/` in dev-browser at 1440x900 and comparing the strip region against the screenshot; the old `≈50` and `15 YEARS` items must be absent.
- If the artefact file is missing at execution time, the strip assertion above is fully specified here and stands on its own.

<critical_warning>
> **CRITICAL WARNING:** The CleanShot screenshot above is the regression source of truth for the hero strip. Verify against the rendered strip at the same composition, not only via source grep — the strip is uppercase-transformed and layout-wrapped by CSS, so source-only checks cannot prove the visual outcome.
</critical_warning>

### 6.2 Validation Commands

| Check | Command | Expected Result |
| --- | --- | --- |
| Lint | `npm run lint` | Exit 0, zero errors (including no unused `Stat` import) |
| Static export | `npm run build` | Completes into `out/` with no errors |
| Homepage sweep | `grep -rniE "≈50\|fifty\|15 years\|fifteen years\|proven\|instructing lawyer" src/app/engine-network src/app/page.tsx` | Zero matches |
| About/metadata sweep | `grep -rniE "proven\|built on a real matter\|set the standard" src/app/about src/lib/metadata.ts` | Zero matches |
| Lab routes untouched | `git status --porcelain` | Only the six planned files modified: `src/app/engine-network/Hero.tsx`, `src/app/engine-network/EngineNetworkPage.tsx`, `src/app/about/page.tsx`, `src/lib/metadata.ts`, `DESIGN.md`, plus this plan file |

### 6.3 Browser Verification (dev-browser skill)

1. Homepage hero strip
   - Action: load `http://localhost:3004/` at each hero-matrix viewport (1440x900, 1998x750, 2560x1080, 3425x1245, 1024x768, 900x1080, 390x900).
   - Expected: strip shows the four new items with dividers, wraps with row gaps at narrow widths, no overflow/clipping, headline clear of the gate, one WebGL canvas per load.
   - Verify: visual inspection per viewport; console free of errors.
2. Homepage outcome plate
   - Action: at 1440x900 and 390x900, scroll the `#proof` section into view; also check a 480px-wide viewport for the single-line stat rule.
   - Expected: kicker `THE OUTCOME`, H2 `Statements in. Evidence out.`, tiles `1,000s / 100% / Decades / 0` with their labels, the `100%` numeral animating count-up exactly once on first intersection, new note within its 42rem measure.
   - Verify: visual inspection; re-scrolling does not replay the animation (existing `Stat` behaviour).
3. About case study
   - Action: load `http://localhost:3004/about/` at 1440x900 and 390x900; scroll the `In practice` section into view.
   - Expected: new H2 and paragraphs; `≈50 hrs estimated · ≈10 delivered · ≈50 accounts · 15 yrs of statements` strip wraps with each middle dot grouped with its fact (no dot stranded on its own row).
   - Verify: visual inspection; console free of errors; keyboard focus order unchanged on the page's links.

---

## Implemented Solution

### Files touched
- `src/app/engine-network/Hero.tsx` — hero strip spans: `≈50 accounts` → `Decades of statements`; `15 years of statements` → `Any bank, any currency`. Markup, dividers and load stagger unchanged.
- `src/app/engine-network/EngineNetworkPage.tsx` — four changes: (1) tracing H2 `Fifty accounts.` → `Every account.`; (2) proof section re-copied in place as the outcome plate — kicker `The outcome`, H2 `Statements in. Evidence out.`, tiles `1,000s` (static) / `<Stat to={100} suffix="%" duration={2200} />` / `Decades` (static) / `0` (static) with the labels from Step 3, note replaced with the verifiability line; (3) audience card copy/note generalised (`The core matter type`) with its comment updated; (4) file-header comment `every proven set-piece` → `every selected set-piece` (comment-only, to keep the REQ-1 grep sweep objective — "proven" there referred to lab set-pieces, not the founding matter).
- `src/app/engine-network/engine-network.css` — comment-only: `every proven set-piece` → `every selected set-piece` (same sweep rationale; no style rules changed). This file was not in the plan's original six-file scope — documented deviation.
- `src/app/about/page.tsx` — origin section reframed as case study: kicker `In practice`, H2 `One live matter. A fifth of the time.`, both paragraphs replaced per Step 5 (matter introduced as "In one live property matter", origin-myth sentences removed); `≈50 hrs…` strip retained unchanged.
- `src/lib/metadata.ts` — about description ends `…engaged per matter, Australia-wide, verifiable to source pages.` (159 chars; the plan's draft wording measured 162, over the ≤160 cap, so the tail was tightened from `the source page` to `source pages` — documented deviation).
- `DESIGN.md` — line 41 Stat purpose (production count-up only), line 142 featured-card name, line 176 section order annotated `outcome (section id "proof")`, line 179 rewritten fixed/closed claim set (homepage outcome stats + hero strip fixed; quantified case study scoped to `/about/`; no unframed founding-matter numbers may return to the homepage).

### Behavioural changes
- Homepage carries no founding-matter numbers; every numeral is self-framing. Section order, ids, CSS, animation lifecycles and all other routes' copy unchanged. The 50→10 count-down numeral is retired from production; the plate's single animated numeral is now the 0→100% count-up. Lab candidate routes intentionally untouched (REQ-8).
- The site's only quantified proof lives on `/about/` as a framed worked example, per the user's testimonial-style direction.

### Validation outcomes
- Grep sweeps (§3.2): all pass with zero matches.
- `npm run lint`: exit 0, zero errors. `npm run build`: static export completed into `out/`.
- dev-browser (task browser `fintrace-copy-gen`, closed after use; dev server on 3004 reused): hero verified at all seven matrix viewports (strip content asserted from the DOM, overflow 0, one `.eng-hero` canvas, zero console/page errors, screenshots `hero-<w>x<h>.png` in `~/.dev-browser/tmp/`); outcome plate verified at 1440/480/390 (DOM-asserted kicker/H2/stats/note, `100%` count-up settled, screenshots `outcome-<w>.png`); about verified at 1440/390 (screenshots `about-<w>.png`).
- Regression artefact: the CleanShot screenshot's strip position now renders `THOUSANDS OF PAGES | DECADES OF STATEMENTS | ANY BANK, ANY CURRENCY | ONE LEDGER` (visually confirmed at 1440x900); the old `≈50 ACCOUNTS` / `15 YEARS OF STATEMENTS` items are absent.
- No pending or skipped validations.
