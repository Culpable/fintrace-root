# FinTrace User-Facing Performance Audit

> **Implemented status (verified 2026-08-31):** Implemented and ready to archive from documents/todo. Evidence: `src/app/globals.css`, `src/app/engine-network/Hero.tsx`, `src/instrumentation-client.ts`, `test/agent/`, `DESIGN.md`, and the accepted before/after Lighthouse evidence at `/Users/sacino/Documents/codex/web-performance/fintrace-root/baseline-final.p7HAK9/` and `/Users/sacino/Documents/codex/web-performance/fintrace-root/after-final.UuEW0r/`.

**Status:** Complete on 31 August 2026. The accepted before-state is `baseline-final.p7HAK9`; the accepted after-state is `after-final.UuEW0r`.

## Scope and action-to-usable-result definitions

This audit covers every production route and user interaction in the static FinTrace website. Archived design-lab routes are excluded because production does not route or link to them.

| ID | User action | Usable result | Failure terminal |
| --- | --- | --- | --- |
| A-1 | Open `/` | The shared header, readable hero fallback, primary actions and homepage content render; links work while the WebGL scene and later animation layers initialise. | A WebGL or client-script failure leaves the readable static hero and native links usable. |
| A-2 | Open `/about/` | The About heading, service evidence, client testimony, shared navigation and assessment actions render and accept input. | A client-script failure leaves the statically exported page and native links usable. |
| A-3 | Open `/engagement/` | The Engagement heading, engagement model, pricing explanation, shared navigation and assessment actions render and accept input. | A client-script failure leaves the statically exported page and native links usable. |
| A-4 | Open `/contact/` | The Contact heading, contact form, shared navigation and assessment actions render; every field accepts input. | A client-script failure may prevent form submission but must leave the page content and navigation usable. |
| A-5 | Open `/privacy/` | The Privacy heading, website and enquiry privacy terms, shared navigation and assessment actions render and accept input. | A client-script failure leaves the statically exported page and native links usable. |
| A-6 | Open an unknown route | The branded not-found heading, explanation and return action render and accept input. | A client-script failure leaves the statically exported not-found content and native return link usable. |
| A-7 | Activate a header, footer, hero or section navigation link | The intended production route or fragment becomes visible with the destination content and focusable controls usable. | If client navigation fails, the link's native URL remains a usable full-page navigation path. |
| A-8 | Scroll through a route | Deferred sections paint before they enter the viewport; one-shot reveals and evidence animations run when reached without blocking scrolling or controls. | If an effect fails, meaningful text and controls remain visible and usable. |
| A-9 | Enter and submit the contact form | A successful Formspree response replaces the form with the success panel; a non-success response or network failure preserves input and shows a retryable error panel. | Every response path settles into either success or a retryable error state; no analytics path delays or changes that terminal. |
| A-10 | Navigate by keyboard and activate a focused control | Focus follows document order, remains visible and reaches the same route, fragment or form result as pointer input. | A decorative animation or analytics failure does not remove focus, block activation or change the navigation result. |

## Audit boundary

- Source inspection is read-only until the ranked portfolio and implementation plan are complete.
- Measurements use a local static build and an isolated local browser only. Production, external analytics, Formspree and customer data are not accessed.
- Local evidence may prove call counts, bundle or transfer byte sizes, asset sizes and output equality. It does not prove production latency.
- Lighthouse evidence uses five sequential runs per production route in mobile and desktop modes with Lighthouse 13.4.1 and its default emulation and throttling.

## Accepted Lighthouse baseline

The accepted before-state is `/Users/sacino/Documents/codex/web-performance/fintrace-root/baseline-final.p7HAK9/`. It contains 60 parseable raw reports, five per route and mode, with no Lighthouse runtime error or warning. Scores below are medians; parentheses show the full five-run spread.

| Route | Mobile performance | Desktop performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- | --- |
| `/` | 67 (53-70) | 92 (91-92) | 100 | 100 (96-100 mobile) | 100 |
| `/about/` | 81 (80-81) | 99 | 100 | 100 | 100 |
| `/engagement/` | 81 (80-82) | 99 (98-99) | 100 | 100 | 100 |
| `/contact/` | 81 (80-81) | 98 (98-99) | 100 | 100 | 100 |
| `/privacy/` | 81 | 99 | 100 | 100 | 100 |
| `/404.html` | 79 (69-80) | 99 (95-99) | 100 | 100 | 63 |

Home's mobile spread is material. Conclusions use its median and require the after batch to report its own spread. `/404.html` has an expected SEO limitation because it audits the exported artefact at HTTP 200; real unknown-route status remains in the agent-readiness suite.

## Traced user flows

### A-1 - Open the homepage

1. `src/app/page.tsx::Home` renders reviewed structured data and `EngineNetworkPage` as static HTML.
2. `src/app/engine-network/EngineNetworkPage.tsx::EngineNetworkPage` applies the two local fonts, shared chrome, hero, static evidence sections, reveal wrappers and native link destinations.
3. `src/app/engine-network/Hero.tsx::Hero` renders the readable SVG fallback and DOM copy, then mounts `EvidenceScene` on pointer, touch or keyboard intent, or automatically three seconds after `window.load`.
4. `src/app/engine-network/Scene.tsx::EvidenceScene` imports Three.js in the homepage async chunk, creates the renderer and scene resources, cross-fades the first frame over the fallback, pauses when hidden or off-screen and disposes every resource on cleanup.
5. `src/instrumentation-client.ts` queues the initial page view, schedules analytics initialisation after the same interaction classes or bounded post-load delay and installs one delegated assessment-CTA listener.
6. `src/lib/analytics/client.ts` imports the core-only Mixpanel adapter when initialisation begins and flushes the validated queue without delaying rendering or navigation.

Usable content and native link destinations exist before the scene and analytics adapter. A scene or analytics failure therefore retains a usable terminal.

### A-2, A-3 and A-5 - Open About, Engagement or Privacy

1. The route Server Component renders static page HTML, reviewed structured data, local-font classes, `SiteHeader`, route content and `SiteFooter`.
2. `src/app/engine-network/Reveal.tsx::Reveal` hydrates only the one-shot entrance wrappers used on that route.
3. The shared `next/link` controls expose native destinations and default client-navigation prefetch.
4. Global instrumentation queues the route page view and imports Mixpanel after interaction or the bounded post-load delay.

The static copy and links are usable without client JavaScript. Reveal or analytics failure leaves the terminal usable.

### A-4 and A-9 - Open and submit Contact

1. `src/app/contact/page.tsx::ContactPage` renders the static shell, reviewed structured data, explanatory copy and `ContactForm`.
2. `src/app/contact/ContactForm.tsx::ContactForm` hydrates fields, validation, honeypot, busy state and Formspree submission.
3. A successful Formspree response renders the success panel. A response error or network failure preserves the form and renders a retryable error.
4. Enquiry events enter the fail-open analytics queue. Adapter load or delivery failure never changes the form state or fetch result.

Every locally controlled response path settles into success or a retryable error. External Formspree behaviour was not invoked by this audit.

### A-6 - Open an unknown route

1. The static host returns `out/404.html` for an unknown path.
2. `src/app/not-found.tsx::NotFound` renders the branded static content, shared header and native home action.
3. Analytics normalisation maps the pathname to `not_found` when JavaScript runs.

The exported not-found content and home action are usable without client JavaScript. Lighthouse cannot accept an intentional HTTP 404 as a successful navigation, so the visual artefact is audited at `/404.html`; real status handling remains covered by the agent-readiness suite.

### A-7 and A-10 - Activate navigation by pointer or keyboard

1. `src/app/engine-network/SiteChrome.tsx` and route content render `next/link` anchors with complete `href` values and visible focus treatment.
2. Next.js may prefetch visible destinations. On activation, client navigation uses the prefetched route when available.
3. If the router fails, the anchor retains the browser's full-page navigation path.
4. The capture-phase analytics listener validates marked assessment actions before the router transition and never cancels the event.

### A-8 - Scroll through a route

1. `.eng-cv` in `src/app/engine-network/engine-network.css` defers below-the-fold paint with an intrinsic placeholder while preserving cold fragment targets.
2. Each `Reveal` creates an observer, adds `is-visible` once, then disconnects.
3. `LedgerPlate`, `TraceDiagram`, `CurrencyMatch`, `Stat` and the testimony surfaces start their existing effect only when reached.
4. Canvas and WebGL loops stop when hidden or off-screen. CSS-only evidence loops continue only on their visible set-pieces.

Meaningful text and labelled diagrams remain in the DOM if a decorative effect cannot run.

## Five-category sweep

Every traced flow was swept twice. The second sweep found no additional reachable candidate.

| Flow | Repeated request work | Scaling work | Unbounded inputs | Cold-path transfer weight | Broken terminal states |
| --- | --- | --- | --- | --- | --- |
| A-1 | One delegated analytics listener; multiple short-lived reveal observers | Scene work is bounded by fixed geometry and a capped device-pixel ratio | None | Immediate Three.js and Mixpanel async chunks; full global and route CSS | None found; static fallback remains usable |
| A-2 | Multiple short-lived reveal observers | Fixed page content only | None | Mixpanel, archived-design Tailwind utilities and full homepage stylesheet | None found |
| A-3 | Multiple short-lived reveal observers | Fixed page content only | None | Mixpanel, archived-design Tailwind utilities and full homepage stylesheet | None found |
| A-4/A-9 | One form component and one delegated analytics listener | Form input lengths are browser-bounded but not processed in loops | No local data query or accumulation | Mixpanel, archived-design Tailwind utilities and full homepage stylesheet | None found; local error paths are retryable |
| A-5 | No repeated route work beyond shared chrome | Fixed page content only | None | Mixpanel, archived-design Tailwind utilities and full homepage stylesheet | None found |
| A-6 | No repeated route work beyond shared chrome | Fixed page content only | None | Mixpanel, archived-design Tailwind utilities and full homepage stylesheet | None found |
| A-7/A-10 | Default prefetch can request several visible route payloads before activation | Work grows with the fixed visible link set | Link set is fixed | Prefetched route payloads and a contact-form client chunk | Native anchor fallback remains usable |
| A-8 | One observer per reveal instance, each disconnected after use | Fixed reveal and diagram counts | No persistent observer or unbounded animation allocation found | Below-fold client code ships before some effects are reached | Meaningful content remains usable |

## Evidence-backed findings

| ID | Evidence | Derived finding | User-facing path |
| --- | --- | --- | --- |
| E-1 | `src/app/engine-network/Hero.tsx::Hero` renders the dynamic `EvidenceScene` unconditionally on its first client render. | `next/dynamic` separates Three.js from the initial route graph but does not defer its cold-load request until after critical content. | A-1 |
| E-2 | The stable static build's Three.js chunk is 531,370 raw bytes and 133,596 gzip bytes; `src/app/engine-network/Scene.tsx::EvidenceScene` is its only production entry. | The scene is the largest controllable cold-path transfer and script-evaluation unit, while the SVG fallback already provides a usable first result. | A-1 |
| E-3 | `src/instrumentation-client.ts::scheduleInitialisation` calls `requestIdleCallback` immediately after hydration, and an idle callback may run before critical loading settles. `src/lib/analytics/client.ts::loadAdapter` then imports a 128,132 raw byte, 35,430 gzip byte Mixpanel chunk on every production route. | The analytics queue already permits adapter loading to move after the critical visual window without changing caller results. | A-1 to A-10 |
| E-4 | `src/app/globals.css` imports all of `tailwindcss`. The accepted compiled global stylesheet is 26,433 raw bytes and 5,606 gzip bytes and contains utility selectors used only under unrouted `src/app/_design-lab/`; production class-string inspection found no Tailwind utility token. | Production pays for theme variables, utilities and registered properties generated from archived source even though it needs only the reset and the file's three global rules. | A-1 to A-10 |
| E-5 | Each production page imports `src/app/engine-network/engine-network.css`; its compiled stylesheet is 50,417 raw bytes and 9,644 gzip bytes. Lighthouse's directional batch found 30,649 raw bytes unused on Home and 36,716 raw bytes unused on About. | Sub-pages receive homepage hero, ledger, trace and currency-match rules that their DOM cannot use. | A-2 to A-6 |
| E-6 | `src/app/engine-network/SiteChrome.tsx` and route CTAs use default `next/link` prefetch. A homepage Lighthouse run requested route RSC payloads for Home, About and Contact plus the contact-form client chunk before a navigation action. | Prefetch deliberately trades cold-page bytes for lower activation latency. Removing it without an intent-prefetch replacement would violate the navigation invariant. | A-1 to A-7 |
| E-7 | Stable exported HTML references 636,613 to 656,493 raw bytes of initial framework and route JavaScript before the separate Three.js and Mixpanel chunks. `Reveal`, the contact form and homepage effects are the reachable client boundaries; shared chrome remains a Server Component. | The current client boundaries are already localised. Further reduction requires deferring below-fold boundaries, not converting the shell to more client code. | A-1 to A-9 |
| E-8 | `src/app/engine-network/Reveal.tsx::Reveal` creates one observer per instance, adds one class, then disconnects. Lighthouse found low blocking work on sub-pages, and each route has a fixed reveal count. | A shared observer is theoretically possible, but its absolute work reduction is too small to justify another subscription registry. | A-2, A-3 and A-8 |
| E-9 | The two local font files total 57,128 raw bytes; `src/app/engine-network/fonts.ts` preloads them with `display: swap`, and both families are visible in the first viewport. | Removing either preload or changing display policy risks font replacement and layout or visual drift; a glyph subset would need independent coverage proof. | A-1 to A-10 |
| E-10 | `public/images/testimonial/nick-brookes.png` is 28,959 bytes at 252 by 252 pixels. Both below-fold consumers reserve dimensions and use lazy loading with asynchronous decoding. Lighthouse reported no image-delivery saving in the diagnostic batch. | The testimonial image has no current cold-load or delivery opportunity. | A-1, A-2 and A-8 |
| E-11 | `src/app/engine-network/Scene.tsx`, `TraceDiagram.tsx` and the reveal wrappers stop off-screen or hidden work, reuse fixed resources and dispose browser resources. `.eng-cv` defers below-the-fold paint. | Removing lifecycle guards or content visibility would add work. Reducing scene fidelity would change the accepted visual result rather than remove waste. | A-1 and A-8 |
| E-12 | `next.config.ts` requires a static export to GitHub Pages. `documents/guides/agent_readiness.md` records that application code cannot set GitHub Pages cache headers. The local audit server intentionally sends no-store and no compression. | Lighthouse cache-lifetime and document-compression diagnostics are hosting or local-server facts, not authorised application fixes. | A-1 to A-10 |
| E-13 | `src/lib/analytics/core.ts::createAnalyticsCore` validates a bounded 50-event queue, drops the oldest overflow item, flushes in order and disables delivery after a permanent adapter failure. | Deferring the vendor import has a bounded queue and a fail-open terminal, but activation must remain guaranteed and interaction-triggered events must still flush in order. | A-1 to A-10 |

## Reach verification

- E-1 and E-2 are reachable only on `/`, where `EngineNetworkPage` always renders `Hero` in the production static export.
- E-3 and E-13 are reachable on every production route because Next.js emits `src/instrumentation-client.ts` globally in production. Development exits before adapter loading.
- E-4 is reachable on every route because `src/app/layout.tsx` imports `globals.css`; the archived classes are present in the compiled production CSS even though their source routes are unrouted.
- E-5 is reachable on every HTML route because each production route imports `engine-network.css` directly.
- E-6 is reachable for links inside the initial viewport and for links brought into the prefetch observer's range.
- E-7 to E-11 are reachable through the production components named in their evidence.
- E-12 is reachable on production deployment, but the required control lies outside the application architecture authorised by this task.

## Performance invariants

- The static export, unoptimised-image setting and trailing-slash routes MUST remain unchanged.
- The homepage MUST render its existing readable SVG fallback and DOM copy before WebGL, and the full live scene MUST still load automatically for every JavaScript-capable user.
- The WebGL scene, evidence animations, hover effects, reveal choreography and scene fidelity MUST NOT be removed, shortened or simplified to raise a lab score.
- A delayed effect MUST run with its existing geometry, animation timing, device-pixel-ratio cap, pause/resume behaviour and cleanup after activation.
- Every production route, fragment, CTA, keyboard path and Formspree state MUST retain its current usable result and native-link fallback.
- Analytics MUST retain its closed taxonomy, anonymous configuration, validation, queue bound, event order, fail-open caller behaviour and production-only network boundary.
- Analytics or scene loading MUST NOT delay navigation, form feedback or input handling.
- Default link prefetch MUST remain unless an intent-prefetch replacement proves the same pointer, touch and keyboard activation result.
- The Bricolage Grotesque and Fragment Mono typography, layout, focus treatment, copy, colours, responsive composition and static fallback MUST remain visually unchanged.
- No new runtime origin, server route, dynamic runtime API, credential or production access may be introduced.
- Changes MUST NOT edit generated `.next/` or `out/` artefacts.

## Ranked opportunity portfolio

Scores are ordinal from 1 (low) to 5 (high). They are not added, averaged or treated as estimates. Rank is portfolio value order, not execution order.

| Rank | Opportunity | Benefit / Reach / Scale / Confidence | Effort / Risk | Decision | Evidence and decision reason |
| --- | --- | --- | --- | --- | --- |
| 1 | Activate the homepage WebGL scene after the critical visual window | 5 / 3 / 4 / 5 | 2 / 2 | Implement now | E-1, E-2 and E-11. The static fallback is already the usable result, the async chunk is the largest controllable cold-load unit, and the live scene remains guaranteed. |
| 2 | Compile only Tailwind preflight for production globals | 4 / 5 / 4 / 5 | 1 / 1 | Implement now | E-4. Production uses no utility token, so the narrow import removes archived-design output while retaining the exact reset contract. |
| 3 | Activate Mixpanel after load settling or the first user interaction | 4 / 5 / 4 / 5 | 2 / 2 | Implement now | E-3 and E-13. The existing queue makes the vendor non-critical; a bounded fallback and interaction wake-up preserve eventual ordered delivery. |
| 4 | Split shared and homepage-only Engine Network CSS | 3 / 5 / 4 / 5 | 5 / 4 | Deferred | E-5. The byte removal is real, but the 3,003-line stylesheet has shared cascade and responsive dependencies. Revive after selector-ownership mapping and computed-style parity fixtures cover all production viewports. |
| 5 | Defer below-fold client boundaries until their sections approach the viewport | 2 / 3 / 3 / 4 | 4 / 3 | Deferred | E-7 and E-11. Revive if post-fix evidence identifies a specific remaining route chunk and a pre-viewport load gate proves every current effect starts before it becomes visible. |
| 6 | Replace viewport-wide route prefetch with pointer, touch and focus intent prefetch | 2 / 5 / 3 / 4 | 3 / 4 | Deferred | E-6. Revive only with framework-version evidence and browser checks proving equal activation behaviour for pointer, touch and keyboard users on every link class. |
| 7 | Subset the two local fonts to production glyph coverage | 2 / 5 / 4 / 4 | 4 / 4 | Deferred | E-9. Revive with a repeatable glyph-generation source, licence confirmation, full-copy coverage and screenshot parity at every required viewport. |
| 8 | Inline route-specific critical CSS | 2 / 5 / 3 / 3 | 5 / 4 | Deferred | E-4 and E-5. Revive only after stylesheet ownership is split; otherwise it duplicates a large shared cascade into HTML and raises maintenance risk. |
| 9 | Share one IntersectionObserver across all reveal wrappers | 1 / 4 / 2 / 5 | 2 / 2 | Remove | E-8. The fixed, short-lived observers have no meaningful absolute saving and already disconnect after one class change. |
| 10 | Remove or reduce WebGL and evidence effects | 5 / 3 / 4 / 5 | 1 / 5 | Remove | E-2 and E-11. This violates the explicit visual-experience invariant rather than removing waste. |
| 11 | Replace `next/link` with plain anchors | 2 / 5 / 3 / 5 | 1 / 5 | Remove | E-6. It would remove the accepted client-navigation and prefetch behaviour and make activation slower on an important conversion path. |
| 12 | Configure application cache headers or migrate the host | 5 / 5 / 5 / 5 | 5 / 5 | Remove | E-12. The application cannot control GitHub Pages headers; a CDN or hosting migration is an architecture project disguised as a source performance fix. |
| 13 | Replace named Three.js imports with selective imports | 1 / 3 / 3 / 5 | 3 / 4 | Remove | E-2. The production scene already uses named imports and the renderer core dominates the tree-shaken chunk, so the premise is false. |
| 14 | Remove font preloads or switch the visible families to optional loading | 2 / 5 / 4 / 4 | 1 / 5 | Remove | E-9. Both families are first-viewport design inputs; the change risks a replacement-font result and layout drift for a small absolute transfer change. |

## Audit evidence checks

| Check | Safe input | Observed result | Decision |
| --- | --- | --- | --- |
| Source stability | SHA-256 over `src/`, `package.json` and `package-lock.json` before and after the accepted baseline build | `0b92919c55a1b4cbc16241139f48a3c06803cc6c25ed8ce83c09943fa8d01147` matched | Accept the build as one stable source state; reject earlier batches whose fingerprints changed. |
| Static build | Local Node.js 22.23.1 production export | 13 static pages exported with no build error | Authorise bundle and route inspection for the accepted state. |
| Referenced route assets | Exported HTML and referenced immutable files, sized in memory | Initial HTML: 23,586 to 81,208 raw bytes; initial JS: 636,613 to 656,493 raw bytes; CSS: 79,065 to 82,426 raw bytes; fonts: 57,128 raw bytes where preloaded | Use exact byte sizes as transfer-weight evidence, not a production latency claim. |
| Deferred async chunks | Stable exported chunk files, sized raw and with gzip in memory | Three.js: 531,370 / 133,596 bytes; Mixpanel vendor: 128,132 / 35,430 bytes | Authorise delayed activation while preserving automatic eventual loading. |
| Tailwind reach | Production `className` strings excluding `_design-lab`, then compiled global CSS inspection | No production utility token; compiled output contains archived utility selectors and is 26,433 / 5,606 bytes | Authorise a preflight-only import, subject to build and browser parity. |
| Testimonial asset | Local PNG metadata and component attributes | 28,959 bytes, 252 by 252; both uses are dimensioned, lazy and async-decoded | Retain the current asset and delivery attributes. |
| Local Lighthouse diagnostic batch | Five mobile and five desktop runs per six exported routes; Chrome wrapper blocks Mixpanel ingestion | 60 valid reports, numeric category scores, no runtime error; batch fingerprint changed during collection | Use for candidate discovery only, not as the comparison baseline. |
| Real unknown-route Lighthouse attempt | Isolated local static server returning the exported 404 with HTTP 404 | Lighthouse stopped at the first intentional 404 with a page-load runtime error | Audit `/404.html` for visual performance and use agent tests for real status semantics. |
| Accepted Lighthouse baseline | Stable build fingerprint, six exported routes, five sequential mobile and desktop runs | 60 raw reports; no runtime error or warning; exact medians and spreads in `baseline-final.p7HAK9/summary.json` | Use as the only score and metric comparison baseline. |
| Tailwind preflight result | Final production export after the narrow global import | Global CSS fell from 26,433 / 5,606 to 3,506 / 1,263 raw / gzip bytes and retained reset, smooth-scroll, font-smoothing and overflow rules | Accept the global CSS reduction. |
| Deferred activation result | Headed production export with Mixpanel fulfilled locally | Neither the 531,370-byte Three.js chunk nor the 128,132-byte analytics chunk loaded in the first two seconds; automatic, pointer, touch and keyboard paths each loaded one copy and one hero canvas | Accept delayed activation without effect removal. |
| Accepted Lighthouse after-state | Stable fingerprint, matching six routes, five sequential mobile and desktop runs | 60 raw reports, no runtime error or warning; Home performance 67 → 76 mobile and 92 → 98 desktop; no route-mode median regressed | Accept the performance result and stop at the invariant boundary. |

## Final outcome

The final source fingerprint is `2e9d0276a74383c02ab70183627477bc4f3e6d6bcc13b08be293cbb3a289df20`; it matched before and after `/Users/sacino/Documents/codex/web-performance/fintrace-root/after-final.UuEW0r/`. Home mobile LCP fell from 9,936.2 ms to 6,063.1 ms and TBT fell from 292 ms to 87 ms. Home desktop LCP fell from 1,874.4 ms to 1,181 ms. Engagement mobile and Contact desktop each gained one point; all other route-mode medians held.

The final theoretical sweep found no further Implement now item. Lighthouse still identifies unused framework JavaScript, the render-blocking Engine Network stylesheet and local document compression. Replacing Next links would remove the approved client-navigation behaviour; splitting or deferring the 3,003-line visual cascade lacks the required ownership and computed-style parity evidence; hosting and compression changes exceed the application boundary. Those findings therefore remain Deferred or Remove, not unfinished fixes.

## Conditional decision rules

There are no Conditional candidates. Every implementation-ready candidate has source and byte evidence; every higher-risk idea is Deferred until its stated revival prerequisite exists.

## Deferred candidates

| Candidate | Reason and revival prerequisites |
| --- | --- |
| Split shared and homepage-only Engine Network CSS | Requires selector ownership plus computed-style and screenshot parity across the seven hero viewports and both standard route viewports before the shared cascade can be moved safely. |
| Defer below-fold client boundaries | Requires post-fix chunk evidence naming an absolute remaining payload plus a near-viewport activation proof for every affected effect. |
| Intent-triggered route prefetch | Requires current Next.js behaviour evidence and activation parity for pointer, touch and keyboard navigation. |
| Subset local fonts | Requires a repeatable glyph source, licence confirmation, production-copy coverage and visual parity. |
| Inline critical CSS | Requires the stylesheet split first so critical rules are bounded and do not duplicate the monolith. |

## Removed candidates

| Candidate | Reason for removal |
| --- | --- |
| Shared reveal observer | Fails the absolute-savings test for fixed, short-lived observers. |
| Remove or reduce visual effects | Violates the accepted frontend experience and the user's explicit instruction. |
| Replace Next links with plain anchors | Violates client-navigation and prefetch behaviour. |
| Configure application cache headers or migrate hosting | Requires an unauthorised architecture migration outside application control. |
| Selective Three.js imports | Wrong premise: the current named imports are already tree-shaken and require renderer core. |
| Remove font preloads or use optional fonts | Violates the typography and layout invariant. |

## Evidence limits

- No production, staging, shared analytics, Formspree, customer data, shared cache or external service was accessed.
- The Chrome wrapper maps `api-js.mixpanel.com` to an unreachable host, so Lighthouse cannot create analytics traffic. It does not simulate successful analytics delivery.
- Local static-server results do not represent GitHub Pages compression, caching, edge latency or repeat-visit behaviour. Cache and document-compression audits are excluded from source decisions.
- Lighthouse is controlled lab evidence. Its medians compare two matching local builds; they are not production latency claims or user-population measurements.
- `/404.html` proves the exported not-found design's payload and render. It does not prove an HTTP 404 navigation because Lighthouse rejects that status; `npm run test:agent` owns the real-status check.
- Safari and Firefox performance are not measured by Lighthouse. Cross-browser correctness remains subject to the existing static, automated and headed-browser checks.
- External Formspree response time and delivery are outside scope. Only the local success and retryable-error state logic was inspected.
- Deferred stylesheet, prefetch and font ideas have no production-code authorisation until their exact revival prerequisites are met.
