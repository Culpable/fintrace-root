# Mixpanel analytics

FinTrace Root uses Mixpanel only for an anonymous five-event assessment funnel. This guide is the source of truth for analytics architecture, event data, privacy boundaries, and validation.

## Ownership and flow

| Responsibility | Owner |
| --- | --- |
| Event types, route normalisation, allowlists, queueing, deduplication and failure isolation | `site/src/lib/analytics/core.ts` |
| Production gating, public token, US host, SDK configuration, session-storage persistence and delivery adapter | `site/src/lib/analytics/client.ts` |
| Initial page view, intent-or-post-load initialisation and marked CTA clicks | `site/src/scripts/analytics-boot.ts` |
| Enquiry lifecycle calls | `site/src/scripts/contact-form.ts` |
| Interface regression tests | `site/test/analytics.test.ts` |
| Hosted proof | `site/scripts/verify-hosted-analytics.mjs` |

Callers import only `initialiseAnalytics` or `trackAnalytics` from the project facade. They never import Mixpanel, receive its SDK object, or await analytics before navigation or form state changes.

The core rebuilds each accepted input from closed allowlists, normalises its page, adds common properties, and queues it until the production adapter is ready. `analytics-boot.ts::scheduleInitialisation` keeps the vendor outside the critical render: pointer, touch or keyboard intent can initialise it early, while a three-second timer starts after `window.load` and guarantees eventual delivery. Development calls are no-ops, gated on `import.meta.env.PROD`. Import, initialisation, and delivery failures remain inside the analytics boundary.

### Surviving a full page navigation

Every navigation is a real page load, so an event queued before the vendor initialises would die with the document. Two mechanisms prevent that, and both are covered by tests:

- The core accepts an optional persistence adapter. `client.ts` supplies one backed by `sessionStorage` key `fintrace-analytics-queue`, capped at 50 events. It is read once at boot and the key is cleared on read, so a restored event is delivered exactly once and keeps the `page` it was tracked on, not the destination's. Every storage call fails open: a browser with session storage blocked keeps the in-memory behaviour.
- `Assessment CTA Clicked` is handed to Mixpanel's `sendBeacon` transport once the adapter is ready, because the default XHR transport is cancelled when the document unloads.

Re-queued events bypass validation because they were validated on the originating page. A reload before initialisation can produce two `Page Viewed` events for the same page, which matches the previous reload behaviour.

## Event contract

Every event contains only `site: fintrace-root`, `environment: production`, `schema_version: 1`, and a `page` value of `home`, `about`, `engagement`, `contact`, `privacy`, or `not_found`, plus the listed properties.

| Event | Additional properties | Trigger |
| --- | --- | --- |
| `Page Viewed` | None | Once per document load, deduplicated by page |
| `Assessment CTA Clicked` | `placement: header \| hero \| section \| footer`; `destination: contact \| contact_enquire` | Explicitly marked assessment link |
| `Enquiry Started` | `placement: form` | First form interaction per mount |
| `Enquiry Submitted` | `placement: form` | Formspree returns `response.ok` |
| `Enquiry Submission Failed` | `placement: form`; `failure_stage: response \| network` | Non-2xx response or thrown network failure |

The three enquiry events were renamed from `Matter Enquiry Started`, `Matter Enquiry Submitted` and `Matter Enquiry Submission Failed` when the contact form became a general enquiry form. Mixpanel keeps historical events under the old names, so any saved report or funnel built on them must be repointed.

Unknown paths become `not_found`. Query, hash, and trailing-slash changes do not create a second page view for the same canonical page. CTA capture runs on a capture-phase listener so the click enters analytics before the browser starts the destination navigation.

## Privacy and vendor configuration

- Keep analytics production-only and anonymous with local-storage device identity.
- Keep the checked-in public browser token only in `site/src/lib/analytics/client.ts`. Never add a project secret, API secret, service-account credential, or private key.
- Send only to Mixpanel’s US browser ingestion host through `mixpanel-browser/src/loaders/loader-module-core`.
- Keep `autocapture`, automatic page views, marketing enrichment, first-touch marketing, feature flags, remote settings, heatmaps, session recording, IP collection, referrer storage, and Google/UTM persistence disabled.
- Keep the complete URL, referrer, UTM, and advertising-click property blacklist as defence in depth.
- Never call `identify`, `alias`, People, profile, or group methods.
- Never pass raw URLs, queries, hashes, referrers, click IDs, field names, form values, matter classifications, request or response bodies, status text, or error text.
- Keep `/privacy/` aligned with the actual analytics settings and service providers, including the session-storage queue and Cloudflare as the host. The notice is informational and does not change delivery.
- Do not add analytics consent, opt-out, preference or debug UI without an explicit product decision.

## Safe change procedure

1. Add or change the typed input and reconstruction rule in `core.ts` first. Use a closed event name and closed enum values.
2. Add an Interface test that proves the emitted event and proves unexpected or sensitive properties are absent.
3. Call the project facade from the narrowest existing script under `site/src/scripts/`. Do not expose a generic string-based tracker.
4. Mark only assessment CTAs with `data-analytics-cta`, `data-analytics-placement`, and `data-analytics-destination`. Do not track ordinary navigation or generic clicks.
5. Preserve fail-open behaviour. Analytics must never delay, reject, or change navigation, animation, Formspree submission, success, failure, or retry state.
6. Update this guide and `DESIGN.md` when the event contract, caller ownership, runtime request, or visible interaction changes.

## Validation

Run from `site/`:

```bash
corepack pnpm check
corepack pnpm build
corepack pnpm test
rg -n "mixpanel-recorder|@mixpanel/rrweb|rrweb-record" dist/_astro
```

All commands must pass and the recorder search must return no shipped recorder implementation.

Against a deployment:

```bash
node scripts/verify-hosted-analytics.mjs https://fintrace.com.au
```

That check proves one `Page Viewed` per route, the queued CTA click surviving a real navigation with its originating page, and the vendor chunk absent for the first two seconds after load then loaded exactly once after intent. Mixpanel batches ingestion, so a check must wait past its flush interval before concluding nothing was sent.

For analytics interaction changes, use the project browser matrix in `AGENTS.md`, stub Formspree, confirm development sends no Mixpanel request, and verify blocked analytics does not affect links, animation, or form state. The agent suite fulfils only `https://api-js.mixpanel.com/track/` inside Chromium and aborts every other non-first-party request, so it exercises production analytics without live delivery or a synthetic browser error. Never send a real enquiry during validation.
