# ~~Genericise Site Copy and Retire Design-Lab Routes Plan~~ ✅ **COMPLETED**

<critical_warning>
> **CRITICAL WARNING:** `src/app/engine-network/` is BOTH a design-lab route AND the production visual system. The production homepage (`src/app/page.tsx`), `/about/`, `/engagement/`, `/contact/` and the root 404 all import its components, CSS and fonts. When retiring the lab routes, move ONLY `src/app/engine-network/page.tsx` and `src/app/engine-network/internal-engine-network.css` into the archive folder. Deleting or moving anything else in `src/app/engine-network/` breaks every production page.
</critical_warning>

<important_note>
> **IMPORTANT NOTE:** The working tree already contains modifications from other collaborators (visible in `git status`). Leave those changes in place — do not revert, re-format or fold them into this work beyond the files this plan explicitly touches. Do not commit unless the user asks.
</important_note>

## 1. Goal

The FinTrace marketing site (`https://fintrace.com.au/`, this repo, static Next.js export) was seeded from a single real job for a legal professional and from a call transcript discussing engaging a government department. As a result the live copy is "too on the nose": it names government procurement, hard-codes the pricing formula (flat engagement fee + per-page rate), fingerprints the seeded matter (fifty accounts, fifteen years, property matter), and reuses the real matter's AUD→INR/HDFC/Wise money corridor in copy, animated set-pieces, the WebGL hero and the social-share image.

This plan makes FinTrace read as a standalone, standard product/service:

1. **Remove all government/procurement targeting** — the word "government" (and government-flavoured terms: procurement, Public Trustee, Principal Legal Officer) must not appear anywhere on the served site.
2. **Generalise pricing language** — describe the promise (scoped, quoted in writing, up front, no subscription) instead of the formula (flat fee + per-page rate).
3. **Loosen the case-study fingerprint** — keep the 50-hours-to-10 proof, blur the identifying details.
4. **Swap the AUD→INR corridor to AUD→EUR (Deutsche Bank)** — consistently across prose, SVG set-pieces, WebGL scene labels, ledger rows and the OG image.
5. **Retire the ten design-lab routes and the `/internal-design/` gallery from the live site**, preserving them in `src/app/_design-lab/` (a Next.js private folder — unrouted but still type-checked in main) for future revisiting.
6. **Keep AGENTS.md and DESIGN.md truthful in the same task** (a hard project rule).

Done means: `npm run lint` and `npm run build` pass; the exported `out/` contains only production routes and zero banned terms; the four production pages plus 404 verify visually at 1440×900 and 390×900; the OG image no longer shows "WISE" or "HDFC".

---

## 2. Current State Analysis

### 2.1 Current Implementation Overview

- Static-export Next.js App Router site (`output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`). No backend; the only runtime request is the contact form's Formspree POST.
- Production routes: `/` (renders `src/app/engine-network/EngineNetworkPage.tsx`), `/about/`, `/engagement/`, `/contact/`, root `not-found`. All share the `.dsn-engine-network` visual system from `src/app/engine-network/` (CSS, fonts, `Hero`, `Scene` (three.js), `LedgerPlate`, `TraceDiagram`, `CurrencyMatch`, `Reveal`, `Stat`, `SiteChrome`).
- Ten unlinked, noindex design-lab candidate routes remain public URLs: `chambers`, `clarity`, `engine`, `engine-flow`, `engine-ledger`, `engine-refined`, `engine-trace`, `exhibit`, `ledger`, `trace`, plus the lab wrapper route `src/app/engine-network/page.tsx` and the comparison gallery `src/app/internal-design/`. Every lab page's only cross-directory import is `import { internalRobots } from '../internal-design-metadata'` (`src/app/internal-design-metadata.ts`). The lab wrapper additionally imports `./EngineNetworkPage` and `./internal-engine-network.css`.
- `src/app/sitemap.ts` lists only the four production URLs; `src/app/robots.ts` and `.github/workflows/deploy.yml` reference no lab routes. GitHub Pages serves `out/404.html` (the branded 404) for unknown paths, so retired URLs degrade gracefully with no config change.
- Site identity/descriptions live solely in `src/lib/metadata.ts` (AGENTS.md mandate).
- The social-share image `public/images/og/fintrace-og.png` (1200×630, 236,567 bytes) is a composed raster of the hero: headline text plus a node constellation whose label chips include `WISE` and `HDFC ··3321` — the real transfer service and bank from the seeded matter (site prose deliberately says "international money-transfer service" and never names Wise).
- `DESIGN.md` pins the current numbers as load-bearing: line 177 fixes the canonical evidence story (flagged A$9,500 ATM withdrawal 07 Mar 2024 · A$28,000 international transfer 02 Apr · ₹18,20,000 arrival at HDFC 04 Apr · FX 65.00) and says to change them only as a recorded decision; line 180 fixes the case-study claim set; line 88 mandates "Indian rupee lakh formats"; line 25 lists "public trustees and government legal" as audience; line 186 documents the lab-route exceptions. This plan IS the recorded decision.

### 2.2 Offending Copy Inventory (production surfaces)

| Location | Current text (abridged) | Problem |
|---|---|---|
| `src/app/about/page.tsx:88-91` | "Per-matter engagement suits government procurement and private practice alike: one flat engagement fee, one per-page rate, scoped in writing before the work begins." | Government + pricing formula |
| `src/app/about/page.tsx:53-69` | "One live matter…" / "In one live property matter - about fifty accounts and fifteen years of statements…" / strip "≈50 hrs estimated · ≈10 delivered · ≈50 accounts · 15 yrs of statements" | Seeded-matter fingerprint |
| `src/app/about/page.tsx:85` | "no platform to procure" | Procurement echo |
| `src/app/engine-network/EngineNetworkPage.tsx:107-109` | Audience card "Public trustees & government legal" — "…suited to procurement…" | Government + procurement |
| `src/app/engine-network/EngineNetworkPage.tsx:238-239` | "…put in front of a Principal Legal Officer - or a court - and hold." | Government job title from the seeded call |
| `src/app/engine-network/EngineNetworkPage.tsx:324-326` | "…engaged per matter: a flat engagement fee plus per-page pricing." | Pricing formula |
| `src/app/engine-network/EngineNetworkPage.tsx:87` | "…Australian dollars to rupees through an international money-transfer service…" | Seeded corridor |
| `src/app/engine-network/EngineNetworkPage.tsx:220-223` | "…the dollars that left Australia are matched to the rupees that landed overseas two days later…" | Seeded corridor |
| `src/app/engagement/page.tsx:141-142` | "…so procurement sees the full shape of the cost before committing." | Procurement |
| `src/app/engagement/page.tsx:50-56` | Hero "A flat fee to engage. Per-page from there." + lede "…a flat engagement fee plus per-page pricing…" | Pricing formula |
| `src/app/engagement/page.tsx:28` | Step 02 "…quote the engagement in writing: the flat fee and the per-page rate." | Pricing formula |
| `src/app/engagement/page.tsx:139-143` | "Two numbers, agreed in writing before any work starts: a flat engagement fee and a per-page rate…" | Pricing formula |
| `src/app/engagement/page.tsx:153-155` | CTA "Two numbers. One enquiry away." | Pricing formula echo |
| `src/app/contact/page.tsx:19` | "You receive the engagement shape in writing: flat fee plus per-page rate." | Pricing formula |
| `src/lib/metadata.ts:32` | engagement description "…at a flat fee plus per-page pricing…" | Pricing formula in search snippets |
| `src/app/engine-network/CurrencyMatch.tsx` | Stations `NAB ****8324` → `INTL TRANSFER` (FX 65.00) → `HDFC ****9878`; chip `A$28,000` → `₹18,20,000`; aria-label "…matched to a rupee deposit…"; header comment names HDFC/rupees | Seeded corridor |
| `src/app/engine-network/TraceDiagram.tsx:69,120` | Node `HDFC ****9878 · INR`; annotation `₹18,20,000 · 04 APR 2024 · FX MATCH` | Seeded corridor |
| `src/app/engine-network/LedgerPlate.tsx:54` | Row `INTL TRANSFER AUD→INR REF 8991` | Seeded corridor |
| `src/app/engine-network/Scene.tsx:193-227` (+comments 164-165, 198-201, 208-212, 388) | WebGL node labels `HDFC ··9878` in `DESKTOP_NODES` and `COMPACT_NODES` | Seeded corridor |
| `public/images/og/fintrace-og.png` | Label chips `WISE` and `HDFC ··3321` | Names the real transfer service and bank |
| `DESIGN.md:25,88,177,180,186` | Government audience, rupee formats, canonical INR story, fixed case-study numbers, lab-route policy | Docs pin the old state |
| `AGENTS.md:24-28` | Lab-candidate/`/internal-design/` policy; "Import `three` only from `src/app/engine*/Scene.tsx`" | Docs pin the old state |

The ten lab routes repeat the same seeded copy (each has a "Public trustees & government legal" card, flat-fee/per-page CTAs, rupee corridors; `exhibit` also has "Principal Legal Officer" and invented specifics; `chambers` has a testimonial attributed to "A principal solicitor — family-law property matter"). Per the resolved decision, their copy is left untouched because they stop being served (see §4.2).

### 2.3 The Core Problem

The site reads as tailored to one conversation and one buyer (a government legal team) instead of describing a standard service. Copy tuned this precisely undermines credibility with every other buyer, and the corridor/case details are recognisable to anyone near the seeded matter.

### 2.4 Technical Constraints (from AGENTS.md — binding)

- British English; curly apostrophe `’` (never `'`) in frontend copy; no emoji in UI copy.
- Ground product claims in `/Users/sacino/fintrace/documents/reference/brand_naming_background.md`; preserve service-not-software positioning; do not invent capabilities, proof, clients or production features. (The EUR corridor is an illustrative reconstruction — same status as today's invented account numbers `****8324`/`****9878` — not a claimed client outcome. The capability claim "cross-currency matching" remains grounded in the brand doc.)
- Preserve `output: 'export'`, `images.unoptimized: true`, `trailingSlash: true`; no runtime network assets. The OG PNG stays a static artefact at `public/images/og/fintrace-og.png`.
- Site identity/titles/descriptions only in `src/lib/metadata.ts`.
- `three` imported only from engine-family `Scene.tsx` modules via the colocated client hero's dynamic import.
- Keep `DESIGN.md` truthful in the same task as every production design/copy change; every h1/h2 wraps exactly one payoff clause in the gold span (`.eng-gold-text`); mono strips separate items with middle dots; amounts use the true minus sign and `tabular-nums`.
- Validation: `npm run lint` (zero errors) and `npm run build` (clean static export to `out/`). No unit/integration/Playwright suite exists. UI verification via `dev-browser` skill at desktop 1440×900 and mobile 390×900, with a headed real-GPU browser for WebGL; dev server is `npm run dev` at `http://localhost:3004` (check for an existing server first; stop only servers you started).

### 2.5 Reusable Infrastructure

- Next.js App Router private-folder convention: any folder under `src/app/` whose name starts with `_` is excluded from routing while remaining in the TypeScript/ESLint project — this is the archive mechanism.
- `makeLabelTexture()` in `src/app/engine-network/Scene.tsx:125-159` bakes labels onto a fixed 512×128 canvas (plate rect 504px wide, centred 48px Menlo). `DEUTSCHE ··9878` (15 chars ≈ 432px) fits the plate; the current longest label is `INTL TRANSFER` (13 chars). No code change needed for sizing — verify visually.
- The branded 404 (`src/app/not-found.tsx`) already handles retired URLs on GitHub Pages via `out/404.html`.

---

## 3. Desired State

### 3.1 Desired State Requirements

- **REQ-1 (MUST NOT)**: The served site (every file in `out/` after build) contains none of: `government`, `procurement`, `procure`, `Public Trustee`/`public trustees`, `Principal Legal Officer`, `flat fee`, `flat engagement`, `per-page`, `page rate`, `rupee`, `INR`, `HDFC`, `WISE`/`Wise`, `₹` — in any casing.
- **REQ-2 (MUST)**: Pricing is described only as: engaged per matter; scoped/quoted in writing before work begins; no subscriptions, no licences, no minimum term. The `/engagement/` page keeps its "Engagement & pricing" identity but describes the promise, not the formula.
- **REQ-3 (MUST)**: The cross-currency example is AUD→EUR via Deutsche Bank everywhere it appears: A$28,000 leaves `NAB ****8324` on 02 Apr, passes `INTL TRANSFER` at FX 0.6000, lands as €16,800 at `DEUTSCHE ****9878` on 04 Apr ("two days later"). A$28,000 × 0.6000 = €16,800 exactly. The OG image, prose, SVG set-pieces, WebGL labels and ledger row all tell this same transaction.
- **REQ-4 (MUST)**: The `/about/` case study keeps the proof (estimated fifty hours delivered in about ten; findings closely matched the instructing lawyer's independent analysis; every finding cited to source) but loses the fingerprint: "one recent matter", "dozens of accounts", "more than a decade of statements"; the stat strip drops the accounts/years figures.
- **REQ-5 (MUST)**: The ten lab routes, the lab wrapper (`/engine-network/`) and `/internal-design/` produce no routes in `out/`; their source lives unmodified (except required import-path fixes) under `src/app/_design-lab/`, still passing lint and typecheck.
- **REQ-6 (MUST)**: `src/app/engine-network/` (minus the moved `page.tsx` + `internal-engine-network.css`) stays in place; `/`, `/about/`, `/engagement/`, `/contact/` and the 404 render unchanged apart from the copy edits in this plan.
- **REQ-7 (MUST)**: `DESIGN.md` and `AGENTS.md` are updated in this same task to describe the new copy claims, EUR canonical story, and `_design-lab/` archive policy.
- **REQ-8 (MUST NOT)**: No changes to `src/lib/metadata.ts` site name/URL/locale, `sitemap.ts`, `robots.ts`, the Formspree form contract, fonts, or the visual design system (colours, layout, motion). Copy and labels only.
- **REQ-9 (SHOULD)**: The regenerated OG image stays 1200×630 PNG at ≤ 240 KB (current: 236,567 bytes) and visually matches the existing composition apart from the two replaced label chips.

### 3.2 Verification Checklist

**Functional:**
- [x] `npm run lint` exits 0.
- [x] `npm run build` completes the static export with zero errors.
- [x] `out/` contains exactly the production routes: `index.html`, `about/`, `engagement/`, `contact/`, `404.html` (plus `_next/`, `images/`, icons, `sitemap.xml`, `robots.txt`) — no `chambers/`, `clarity/`, `engine*/`, `exhibit/`, `ledger/`, `trace/`, `internal-design/` directories.
- [x] `grep -riE "government|procurement|procure|public trustee|principal legal|flat fee|flat engagement|per-page|page rate|rupee|INR|HDFC|₹" out/ --include="*.html" --include="*.js" --include="*.txt"` returns no matches (investigate and clear any hit; `wise` is checked case-sensitively as `Wise|WISE` to avoid false positives on ordinary prose).
- [x] All four production pages + a bogus URL verify in dev-browser at 1440×900 and 390×900: no overflow/clipping (especially the `DEUTSCHE ****9878 · EUR` TraceDiagram label and the WebGL `DEUTSCHE ··9878` plate), no console errors, animations run.

**Compatibility:**
- [x] The archived lab pages under `src/app/_design-lab/` still typecheck (they compile as part of `npm run lint`/`tsc` — no route required).
- [x] Restoring a lab route is possible by moving its folder back under `src/app/` (documented in AGENTS.md).

**Ops/Docs:**
- [x] `DESIGN.md` lines that pinned the old numbers/audience/lab policy now state the new truth; `grep -niE "rupee|INR|HDFC|government|lakh" DESIGN.md` returns no stale matches.
- [x] `AGENTS.md` describes the `_design-lab/` archive and no longer presents lab candidates/`/internal-design/` as live routes.

---

## 4. Additional Context

### 4.1 User-Provided Context (binding, from the requesting session)

- The site "was created on the basis of a single job… for a legal professional in the financial analysis space" and "seeded with a copy of a call between myself and a lawyer discussing… engaging the DOJ (i.e. the government)". The copy is "overly specific and on the nose, as if it's too tailored to this conversation".
- "There should be literally no mention of the word 'government' on these pages."
- "We need to be talking about things in general terms, as if this is a standard product or service, not specifically how our product or service is priced or how it's catered to government contracts."
- "FinTrace should be standalone and should just describe what the product/service does."
- On the corridor: "don't think we use INR here. But whichever we chose, it must keep consistent throughout the copy." → consistency is mandatory across prose, set-pieces, WebGL and the OG image.
- On the labs: "I want to retire these altogether, so that they're no longer on the live site. But I want to keep them SOMEWHERE so that I can revisit these designs in future as/if needed."

### 4.2 Decisions Resolved by Blindspot Pass (user-selected)

1. **Corridor = AUD→EUR via Deutsche Bank** (user chose over recommended GBP/HSBC and over USD/Chase). Maths chosen for clean reconciliation: A$28,000 × FX 0.6000 = €16,800. Prose distinguishes "the dollars that left Australia" from "the euros that landed overseas" with no dollar/dollar ambiguity.
2. **Case study: loosen identifiers** (recommended option). Keep 50→10 hours and the independent-match claim; replace "one live property matter - about fifty accounts and fifteen years of statements" with "one recent matter - dozens of accounts, more than a decade of statements"; drop `≈50 accounts · 15 yrs` from the strip.
3. **Archive mechanism: private folder in main** (`src/app/_design-lab/`; user chose over the recommended archive branch and over a separate repo). Consequences accepted: retired code keeps compiling in every lint/typecheck; import paths must be fixed at move time; designs are revived by moving a folder back.
4. **Archived lab copy stays as-is** (still contains "government" etc.) because those files are no longer served; the no-government rule applies to the live site. Do not edit archived copy.
5. **OG image labels**: `WISE` → `INTL TRANSFER` (matches the site's generic phrasing) and `HDFC ··3321` → `DEUTSCHE ··3321`.
6. **`brand_naming_background.md` is NOT edited** — it is an internal factual record of the real matter (it legitimately mentions DOJ/government/Wise/rupees), not site copy.
7. Rejected: redirects for retired URLs (they are unlinked and noindexed; the branded 404 suffices). Rejected: genericising lab copy before archiving (pointless work on unserved pages).

### 4.3 Background Knowledge for the Executor

- "Engaged per matter" is the service model, not a pricing formula — it stays everywhere it appears (header strips, footer "Engaged per matter · Australia-wide", metadata). Only the flat-fee/per-page mechanics are banned.
- The real seeded matter (for recognition, so you can spot any stragglers): family-law property matter, ~50 accounts, 15 years, ~3,000+ pages, 50 hours estimated / ~10 delivered, rupee↔AUD transfers via Wise, engagement discussed with a government legal body. Any copy echoing these specifics beyond what REQ-4 permits is a defect.
- The copy voice: mono "specification" strips with middle-dot separators; hyphen-with-spaces " - " (not em dash) inside prose sentences on production pages; every h1/h2 wraps exactly one payoff clause in `<span className="eng-gold-text">…</span>`.

---

`## 5. Implementation Plan

### ~~Step 1: Production prose edits (government/pricing/case-study language)~~ ✅ **COMPLETED**

**Objective:** Remove government/procurement/pricing-formula language and loosen the case study on the four production surfaces plus shared metadata.

#### 1.1 Exact replacements

`src/app/about/page.tsx`:
- h2 (line 53): `One live matter. <span className="eng-gold-text">A fifth of the time.</span>` → `One recent matter. <span className="eng-gold-text">A fifth of the time.</span>`
- Case-study paragraph (lines 57-62): replace the middle sentence so the paragraph reads: `Document-heavy matters arrive as paper: thousands of pages of statements, accounts by the dozen, histories running back a decade or more. In one recent matter - dozens of accounts, more than a decade of statements - the manual review was estimated at fifty hours of lawyer time. The engine delivered the ledger and the findings in about ten.` (second paragraph, lines 63-66, is unchanged)
- Strip (line 68): `≈50 hrs estimated · ≈10 delivered · ≈50 accounts · 15 yrs of statements` → `≈50 hrs estimated · ≈10 delivered · every finding cited to source`
- Line 85: `no platform to procure` → `no platform to adopt`
- Lines 88-90: `Per-matter engagement suits government procurement and private practice alike: one flat engagement fee, one per-page rate, scoped in writing before the work begins.` → `Each matter is scoped and quoted in writing before the work begins, so the cost is known before anything is committed.`

`src/app/engine-network/EngineNetworkPage.tsx`:
- `AUDIENCES` entry (lines 106-110): name `Public trustees & government legal` → `In-house & institutional legal teams`; copy → `Engaged per matter as a specialist provider: nothing to roll out, suited to overloaded teams with every reason to save time.`
- Capabilities lede (lines 237-240): `…so a finding can be put in front of a Principal Legal Officer - or a court - and hold.` → `…so a finding can be put in front of a senior lawyer, opposing counsel - or a court - and hold.`
- CTA lede (lines 324-326): `FinTrace is a specialist forensic service, engaged per matter: a flat engagement fee plus per-page pricing. Send the statements; receive the ledger, the findings and the sources to back them.` → `FinTrace is a specialist forensic service, engaged per matter and quoted in writing before the work begins. Send the statements; receive the ledger, the findings and the sources to back them.`

`src/app/engagement/page.tsx`:
- STEPS 02 copy (line 28): → `We confirm the engine fits the matter and quote the engagement in writing.`
- Hero h1 (line 51): → `Engaged per matter. <span className="eng-gold-text">Quoted up front.</span>`
- Hero lede (lines 53-56): → `No subscriptions, no licences, no minimum term. FinTrace is engaged per matter, quoted in writing once the matter is scoped.`
- Pricing prose (lines 139-143): → `The engagement is quoted in writing before any work starts, scaled to the size of the matter - so you see the full shape of the cost before committing.`
- CTA h2 (line 154): `Two numbers. <span className="eng-gold-text">One enquiry away.</span>` → `One quote. <span className="eng-gold-text">One enquiry away.</span>`

`src/app/contact/page.tsx`:
- NEXT_STEPS 02 copy (line 19): → `You receive the engagement quoted in writing.`

`src/lib/metadata.ts`:
- Engagement description (line 32): → `FinTrace is engaged per matter - AI-assisted analysis quoted in writing after an initial assessment. No licences, no subscriptions.`

Use `’` for any apostrophes introduced; keep the existing " - " hyphen style and middle-dot strip separators.

**Success Criteria:**
- `grep -rniE "government|procurement|procure |principal legal|flat fee|flat engagement|per-page|page rate|public trustee" src/app/about src/app/engagement src/app/contact src/app/engine-network src/lib src/app/page.tsx src/app/not-found.tsx` returns zero matches.
- `grep -rn "fifty accounts\|fifteen years\|50 accounts\|15 yrs\|property matter\|live matter" src/app/about` returns zero matches.
- The strings `estimated at fifty hours` and `in about ten` still appear in `src/app/about/page.tsx` (proof retained).
- Every edited h1/h2 still contains exactly one `eng-gold-text` span.
- `npm run lint` exits 0.

### ~~Step 2: Currency corridor swap (AUD→EUR / Deutsche Bank) in production components~~ ✅ **COMPLETED**

**Objective:** Retell the identical canonical transaction in EUR across every production surface so the story stays reconciled (REQ-3).

#### 2.1 Exact replacements

`src/app/engine-network/EngineNetworkPage.tsx`:
- SPECS 05 copy (line 87): `…including cross-currency matches: Australian dollars to rupees through an international money-transfer service, reconciled line to line.` → `…Australian dollars to euros through an international money-transfer service, reconciled line to line.`
- Cross-currency lede (lines 220-223): `…the dollars that left Australia are matched to the rupees that landed overseas two days later, down to the exchange rate.` → `…the dollars that left Australia are matched to the euros that landed overseas two days later, down to the exchange rate.`

`src/app/engine-network/CurrencyMatch.tsx`:
- Header comment (lines 5-6): describe dollars leaving NAB, converting at 0.6000 and landing at Deutsche Bank as €16,800.
- aria-label (line 25): → `An Australian dollar transfer matched to a euro deposit through an international money transfer`
- Station 2 sub (line 50): `FX 65.00` → `FX 0.6000`
- Station 3 name (line 59): `HDFC ****9878` → `DEUTSCHE ****9878`; sub (line 62): `IN ₹18,20,000 · 04 APR` → `IN €16,800 · 04 APR`
- Chip in-text (line 73): `₹18,20,000` → `€16,800`; comment (line 66) `dollars out, rupees in` → `dollars out, euros in`

`src/app/engine-network/TraceDiagram.tsx`:
- Node 4 label (line 69): `HDFC ****9878 · INR` → `DEUTSCHE ****9878 · EUR`
- Annotation (line 120): `₹18,20,000 · 04 APR 2024 · FX MATCH` → `€16,800 · 04 APR 2024 · FX MATCH`

`src/app/engine-network/LedgerPlate.tsx`:
- Row (line 54): `INTL TRANSFER AUD→INR REF 8991` → `INTL TRANSFER AUD→EUR REF 8991`

`src/app/engine-network/Scene.tsx`:
- `DESKTOP_NODES` label (line 201) and `COMPACT_NODES` label (line 227): `HDFC ··9878` → `DEUTSCHE ··9878` (fits the fixed 504px plate at 48px Menlo — 15 chars ≈ 432px; keep `labelOffset` values unchanged and confirm visually)
- Update comments naming HDFC (lines 164-165, 198-201, 208-212 edge list, ~388) to say Deutsche Bank / the overseas Deutsche account.

Do not change dates (02 APR / 04 APR / "two days later"), the flagged A$9,500 hop, the A$28,000 amount, account masks (`****8324`, `****9878`), or any geometry/animation values.

**Success Criteria:**
- `grep -rniE "rupee|INR|HDFC|₹|lakh|65\.00" src/app/engine-network src/app/about src/app/engagement src/app/contact src/lib` returns zero matches.
- `grep -rn "€16,800" src/app/engine-network` matches in `CurrencyMatch.tsx` (twice: station sub + chip) and `TraceDiagram.tsx` (once); `grep -rn "FX 0.6000" src/app/engine-network` matches once; `grep -rn "DEUTSCHE" src/app/engine-network` matches in `CurrencyMatch.tsx`, `TraceDiagram.tsx` and twice in `Scene.tsx`.
- A$28,000 and the 02/04 APR dates are unchanged (`grep -rn "A\$28,000" src/app/engine-network` still matches `CurrencyMatch.tsx` and `TraceDiagram.tsx`).
- `npm run lint` exits 0.

### ~~Step 3: Regenerate the OG image labels~~ ✅ **COMPLETED**

**Objective:** Remove `WISE` and `HDFC ··3321` from `public/images/og/fintrace-og.png` so the share image matches the genericised corridor (REQ-1, REQ-3, REQ-9).

#### 3.1 Approach

- Work in the session scratchpad with a small script (Python/PIL or `node-canvas`): open the PNG, cover the two existing label chips with sampled background colour, then redraw each chip in the same style — near-black fill, thin warm-gold 1px border, centred uppercase letterspaced mono text (`INTL TRANSFER` sized wider to fit its longer text; `DEUTSCHE ··3321` in place of `HDFC ··3321`). Match the neighbouring chips (`NAB ··1130`, `CBA ··8802`, `ANZ ··4417`, `AMEX ··9010`, `BTC WALLET`, `CASH ATM`) for font size, tracking, chip padding and border colour by sampling their pixels.
- A mono font visually close to the site's Fragment Mono is required; downloading Fragment Mono's TTF from Google Fonts into the scratchpad is acceptable (build-time tooling, not a runtime network asset).
- Re-optimise the output (e.g. `pngquant`/`oxipng` if available, else PIL `optimize=True`) and overwrite `public/images/og/fintrace-og.png` in place — same path, per AGENTS.md single-share-image rule.
- Verify by reading the final image and comparing chips at zoom against the original.

**Success Criteria:**
- Final image is PNG, exactly 1200×630 (`file`/PIL check), ≤ 240 KB.
- Visual inspection of the final image shows no `WISE` or `HDFC` text anywhere; the two new chips read `INTL TRANSFER` and `DEUTSCHE ··3321` in a style consistent with neighbouring chips (same approximate text height and border treatment).
- No other region of the image differs visibly from the original (headline, wordmark, constellation geometry untouched).
- The file remains at `public/images/og/fintrace-og.png`; no new image files are added under `public/`.

### ~~Step 4: Retire the design-lab routes into `src/app/_design-lab/`~~ ✅ **COMPLETED**

**Objective:** Remove all lab routes and the gallery from the served site while keeping their source compiling in main (REQ-5, REQ-6).

#### 4.1 Moves (use `git mv` to preserve history)

- Move these eleven directories from `src/app/` to `src/app/_design-lab/`: `chambers`, `clarity`, `engine`, `engine-flow`, `engine-ledger`, `engine-refined`, `engine-trace`, `exhibit`, `ledger`, `trace`, `internal-design`.
- Move `src/app/internal-design-metadata.ts` → `src/app/_design-lab/internal-design-metadata.ts`. Every moved lab page imports it as `../internal-design-metadata`, which resolves unchanged from one level inside `_design-lab/` — no import edits needed in those files.
- Create `src/app/_design-lab/engine-network/` and move ONLY `src/app/engine-network/page.tsx` and `src/app/engine-network/internal-engine-network.css` into it. In the moved `page.tsx`, update `./EngineNetworkPage` → `../../engine-network/EngineNetworkPage` and keep `./internal-engine-network.css` (now colocated) and `../internal-design-metadata` (resolves within `_design-lab/`) as-is.
- Do not edit any other archived file: copy, links to now-dead routes inside `internal-design/page.tsx`, and the `showDesignLabLink` chip are inert in unrouted code and are intentionally preserved verbatim for future revival.
- Leave `EngineNetworkPage.tsx`'s `showDesignLabLink` prop in place — the archived wrapper still consumes it and production passes `false`.

**Success Criteria:**
- `ls src/app/` shows no `chambers`, `clarity`, `engine`, `engine-flow`, `engine-ledger`, `engine-refined`, `engine-trace`, `exhibit`, `ledger`, `trace`, `internal-design` entries and no `internal-design-metadata.ts`; all exist under `src/app/_design-lab/`.
- `src/app/engine-network/` contains no `page.tsx` and no `internal-engine-network.css`, and still contains `EngineNetworkPage.tsx`, `Scene.tsx`, `Hero.tsx`, `LedgerPlate.tsx`, `TraceDiagram.tsx`, `CurrencyMatch.tsx`, `Reveal.tsx`, `Stat.tsx`, `SiteChrome.tsx`, `fonts.ts`, `engine-network.css`, `site-pages.css`.
- `npm run lint` exits 0 and `npm run build` succeeds.
- `out/` after build contains no directories for any retired route (check: `ls out/` lists only `index.html`, `404.html`, `about/`, `engagement/`, `contact/`, `_next/`, `images/`, icon files, `sitemap.xml`, `robots.txt`).
- With the dev server running, `http://localhost:3004/engine-flow/` (and one other retired URL) renders the branded FinTrace 404; `/`, `/about/`, `/engagement/`, `/contact/` render normally.

### ~~Step 5: Documentation sync (DESIGN.md + AGENTS.md)~~ ✅ **COMPLETED**

**Objective:** Keep the two governing documents truthful in the same task (REQ-7; a hard AGENTS.md rule).

#### 5.1 DESIGN.md amendments

- Line 25 (audience): replace `public trustees and government legal` with `in-house and institutional legal teams`.
- Line 88: replace `(Australian dollar and Indian rupee lakh formats)` with `(Australian dollar and euro formats)`.
- Line 177 (canonical evidence story): restate as the flagged A$9,500 ATM withdrawal (07 Mar 2024, cited to its source page), the A$28,000 international transfer (02 Apr) and the €16,800 arrival at Deutsche Bank (04 Apr) at FX 0.6000, and record that this corridor replaced the original AUD→INR/HDFC story as a deliberate decision to decouple the site from the seeded matter.
- Line 180 (claim set): update the case-study sentence to the loosened form (estimated fifty hours delivered in about ten, dozens of accounts, more than a decade of statements, findings closely matched the instructing lawyer's independent analysis, framed as one recent matter, lives only on `/about/`); update the strip wording to `≈50 hrs estimated · ≈10 delivered · every finding cited to source`.
- Line 186 (approved exceptions): rewrite the lab-route clauses to state that lab candidates and the internal comparison wrapper are archived unrouted under `src/app/_design-lab/` and no longer ship.
- Then sweep: `grep -niE "rupee|INR|HDFC|lakh|government|procurement|fifty accounts|fifteen years|flat fee|per-page" DESIGN.md` and update every remaining stale line to the new truth (including any copy-deck quotations).

#### 5.2 AGENTS.md amendments

- Rewrite the lab-candidate bullets (lines 24-26): lab candidates and `/internal-design/` are retired from routing and archived under `src/app/_design-lab/` (a Next private folder — unrouted, still type-checked); to revive one, move its folder back under `src/app/`; archived copy is intentionally left as-seeded and must not be served without a copy review.
- Update line 28: `three` is imported only from `src/app/engine-network/Scene.tsx` (production) and archived `src/app/_design-lab/engine*/Scene.tsx` modules.
- Confirm the production-routes list and description need no other change.

**Success Criteria:**
- `grep -niE "rupee|INR|HDFC|lakh|government|procurement" DESIGN.md AGENTS.md` returns zero matches (excluding, if present, an explicit historical-decision note that names the old corridor — if such a note is kept, it must be phrased as a past decision record; simplest passing state is zero matches, describing the change without naming the old corridor).
- `grep -n "_design-lab" AGENTS.md DESIGN.md` matches at least once in each file.
- Both files accurately describe: EUR canonical story with FX 0.6000, loosened case-study claim set, new audience wording, archive policy.

### ~~Step 6: Full validation pass~~ ✅ **COMPLETED**

**Objective:** Prove REQ-1 through REQ-9 end to end.

- Run `npm run lint` and `npm run build`.
- Run the banned-terms grep over `out/` (exact command in §3.2).
- Check `http://localhost:3004` for an existing dev server; start `npm run dev` only if absent. Verify with the `dev-browser` skill (headed, real GPU for the WebGL hero) at 1440×900 and 390×900 on `/`, `/about/`, `/engagement/`, `/contact/` and a retired URL: scroll all reveal/lazy/sticky content into view, confirm the LedgerPlate, TraceDiagram (`DEUTSCHE ****9878 · EUR` label unclipped at both breakpoints, including its `mobileLabelDx` placement) and CurrencyMatch (`€16,800` chip and `DEUTSCHE ****9878` station labels unclipped) set-pieces animate, the hero constellation shows `DEUTSCHE ··9878` without plate overflow, and no console or page errors appear.
- Stop only a dev server this task started.

**Success Criteria:** every box in §3.2 checked; any failure is fixed and the full pass repeated until clean.

---

## 6. Testing Plan

No automated unit/integration/Playwright suite exists in this repository (AGENTS.md `<environments>`): validation is lint + static build + browser checks, per `<validation_commands>` and `<ui_verification>`.

### 6.1 Source-of-Truth Regression Artefacts

The seeded language itself is the regression input — the artefacts are the current files at the exact locations inventoried in §2.2:

- `src/app/about/page.tsx:53-91`, `src/app/engagement/page.tsx:28,50-56,139-155`, `src/app/contact/page.tsx:19`, `src/lib/metadata.ts:32`, `src/app/engine-network/EngineNetworkPage.tsx:87,107-109,220-223,237-240,324-326` — prove the government/procurement/pricing/corridor language existed on production surfaces. Post-fix behaviour: the §3.2 grep over `out/` returns zero matches while the retained proof strings ("estimated at fifty hours", "in about ten") survive on `/about/`.
- `src/app/engine-network/CurrencyMatch.tsx`, `TraceDiagram.tsx:69,120`, `LedgerPlate.tsx:54`, `Scene.tsx:193-227` — prove the INR corridor in visuals. Post-fix: EUR strings per Step 2 criteria; visual verification in the browser at both breakpoints.
- `public/images/og/fintrace-og.png` (1200×630, 236,567 bytes) — proves `WISE`/`HDFC` in the share image. Post-fix: visual inspection shows the replacement chips; dimensions unchanged; ≤ 240 KB.
- Route inventory `ls src/app/` and built output `ls out/` — prove the lab routes shipped. Post-fix: `out/` contains only production routes; retired URLs render the branded 404 in the browser.

<critical_warning>
> **CRITICAL WARNING:** Verification must run against the real built export (`out/`) and the real `public/images/og/fintrace-og.png` — not against source-only greps. Source greps are step-level gates; only the `out/` sweep proves nothing banned is served (RSC payloads embed page copy in `.js`/`.txt` chunks, which is why the sweep includes those extensions).
</critical_warning>

### 6.2 Validation Commands

| Check | Command | Expected |
| --- | --- | --- |
| Lint | `npm run lint` | Exit 0, zero errors |
| Build | `npm run build` | Static export to `out/` with no errors |
| Banned terms (served) | `grep -riE "government|procurement|procure|public trustee|principal legal|flat fee|flat engagement|per-page|page rate|rupee|INR|HDFC|₹" out/ --include="*.html" --include="*.js" --include="*.txt"` | No output |
| Wise (case-sensitive) | `grep -rE "WISE|Wise" out/ --include="*.html" --include="*.js" --include="*.txt"` | No output |
| Retired routes absent | `ls out/` | Only production entries (§3.2 list) |
| Proof retained | `grep -o "estimated at fifty hours" out/about/index.html` | Exactly one match |
| Corridor consistency | `grep -o "€16,800" out/index.html \| wc -l` | ≥ 2 (TraceDiagram annotation + CurrencyMatch) |
| OG image | PIL/`sips -g pixelWidth -g pixelHeight` on `public/images/og/fintrace-og.png` | 1200×630, PNG, ≤ 240 KB |

### 6.3 Browser Verification (dev-browser skill, per AGENTS.md `<ui_verification>`)

1. Production pages at 1440×900 and 390×900 — `/`, `/about/`, `/engagement/`, `/contact/`
   - Action: load each, let layout settle, scroll every reveal/sticky section into view; use a headed real-GPU browser for the homepage hero.
   - Expected: no overflow/clipping (explicitly check the `DEUTSCHE ****9878 · EUR` node label and `€16,800 · 04 APR 2024 · FX MATCH` annotation in the trace diagram at 390px, the CurrencyMatch stations, and the WebGL `DEUTSCHE ··9878` plate), animations run, zero console/page errors, copy shows the new wording.
2. Retired URL behaviour
   - Action: open `http://localhost:3004/engine-flow/` and `http://localhost:3004/internal-design/`.
   - Expected: branded FinTrace 404 ("No trace of this page."), site header/footer intact.
3. 404 regression
   - Action: open a random unknown path.
   - Expected: same branded 404, no console errors.

---

## 7. Implemented Solution

### Production copy and metadata

- Updated `src/app/about/page.tsx` to frame the proof as one recent matter involving dozens of accounts and more than a decade of statements while retaining the fifty-hours-to-ten outcome, independent-analysis match and source-citation claim.
- Updated `src/app/engagement/page.tsx`, `src/app/contact/page.tsx`, `src/app/engine-network/EngineNetworkPage.tsx` and `src/lib/metadata.ts` to remove institutional-buyer targeting and formula-based pricing. Production copy now describes a per-matter service scoped and quoted in writing with no subscription, licence or minimum term.
- Confirmed the final served export contains no banned buyer, pricing or seeded-corridor terminology. The plan’s literal case-insensitive `INR` pattern also matched the unrelated Next.js runtime word `Invariant`; the final payload check constrained `INR` to a standalone term and returned no product-copy matches.

### Canonical EUR evidence story

- Updated `src/app/engine-network/CurrencyMatch.tsx`, `TraceDiagram.tsx`, `Scene.tsx`, `LedgerPlate.tsx`, `EngineNetworkPage.tsx` and `engine-network.css` so the production story uses AUD→EUR, FX 0.6000, €16,800 and Deutsche Bank consistently.
- Corrected the canonical ledger row after the independent audit: A$28,000 leaves on 02 Apr 2024, and the chronological running balances now reconcile from A$24,180.22 to −A$9,701.95 across all seven rows.
- Preserved the existing animation geometry, account masks in production components, transfer dates, flagged A$9,500 hop and source references.

### Social image

- Replaced only the two seeded labels in `public/images/og/fintrace-og.png`: `WISE` became `INTL TRANSFER`, and the user-selected `HDFC ··3321` replacement became `DEUTSCHE ··3321`.
- Preserved every pixel outside the two label-chip rectangles. The final image is a 1200×630 PNG at 238,433 bytes.
- Used the deterministic scratch script `/Users/sacino/.codex/visualizations/2026/07/20/019f7e11-040a-7010-9b0a-f361ffbe4874/localise_og_labels.py`; it remains available for review or deletion.

### Design-lab retirement

- Moved `chambers`, `clarity`, `engine`, `engine-flow`, `engine-ledger`, `engine-refined`, `engine-trace`, `exhibit`, `ledger`, `trace`, `internal-design` and `internal-design-metadata.ts` under `src/app/_design-lab/` without editing archived copy.
- Moved only the retired Engine Network wrapper and wrapper CSS into `src/app/_design-lab/engine-network/`; corrected its import to the preserved production `src/app/engine-network/EngineNetworkPage.tsx`.
- Kept the production Engine Network components, CSS, fonts and Three.js scene in `src/app/engine-network/`. The static export and live route checks confirmed that all retired URLs now return the branded 404.

### Governing documentation and audit artefacts

- Updated `DESIGN.md` with the general legal audience, euro formatting, canonical EUR transaction, loosened case-study claim set and unrouted archive policy.
- Updated `AGENTS.md` with archive/revival instructions and exact production plus archived Three.js authority paths.
- Preserved the two independent reports at `documents/todo/bugs/codex/subagent_bug_sweep_20260720_p7k3m9q2.xml` and `documents/todo/bugs/codex/subagent_bug_sweep_20260720_r4v8c2n6.xml`, plus the consolidated report at `documents/todo/bugs/codex/combined_bug_sweep_20260720_h5q8t2m4.xml`.
- The audit reported three potential findings. The ledger inconsistency and stale documentation path were independently reproduced and fixed. The OG suffix report was rejected because the plan explicitly selected `DEUTSCHE ··3321` while preserving the OG image’s separate fabricated node set.

### Validation outcomes

- `npm run lint`: passed with zero errors after the audit corrections.
- `npm run build`: passed; TypeScript completed and the route table contains only `/`, `/about`, `/contact`, `/engagement`, the root not-found and static metadata/icon routes.
- Served-output sweeps: passed for banned terms, case-sensitive `WISE|Wise`, retired route directories, retained proof and EUR output. The rendered `/about/` proof appears once visibly and twice in serialised `index.html` payload text.
- Ledger reconciliation check: passed from A$24,180.22 opening balance to −A$9,701.95 closing balance.
- Browser matrix: passed `/`, `/about/`, `/engagement/` and `/contact/` at 1440×900 and 390×900 with zero page errors, request failures, horizontal overflow or clipping. All reveal animations armed, focus outlines rendered and the WebGL hero used the headed Apple M2 Max Metal renderer with one canvas.
- Visual corridor checks: passed for the settled `DEUTSCHE ··9878` WebGL plate, `DEUTSCHE ****9878 · EUR` trace label, €16,800 annotation and match station at both required viewports.
- Retired URL checks: `/engine-flow/`, `/internal-design/` and a random unknown path returned HTTP 404 with the branded “No trace of this page.” content. Chromium logged only the expected failed main-document request for each deliberate 404 navigation; no application page error occurred.
- Post-audit ledger browser rerun: passed at 1440×900 and 390×900 with the 02 Apr date, −A$28,000 amount and −A$9,701.95 desktop closing balance rendered without overflow.
