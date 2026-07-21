# Mixpanel analytics

FinTrace Root uses Mixpanel only for an anonymous five-event assessment funnel. This guide is the source of truth for analytics architecture, event data, privacy boundaries, and validation.

## Ownership and flow

| Responsibility | Owner |
| --- | --- |
| Event types, route normalisation, allowlists, queueing, deduplication and failure isolation | `src/lib/analytics/core.ts` |
| Production gating, public token, US host, SDK configuration and delivery adapter | `src/lib/analytics/client.ts` |
| Initial page view, App Router transitions, idle initialisation and marked CTA clicks | `src/instrumentation-client.ts` |
| Enquiry lifecycle calls | `src/app/contact/ContactForm.tsx` |
| Interface regression tests | `test/analytics.test.ts` |

Callers import only `initialiseAnalytics` or `trackAnalytics` from the project facade. They never import Mixpanel, receive its SDK object, or await analytics before navigation or form state changes.

The core rebuilds each accepted input from closed allowlists, normalises its page, adds common properties, and queues it until the production adapter is ready. Development calls are no-ops. Import, initialisation, and delivery failures remain inside the analytics boundary.

## Event contract

Every event contains only `site: fintrace-root`, `environment: production`, `schema_version: 1`, and a `page` value of `home`, `about`, `engagement`, `contact`, or `not_found`, plus the listed properties.

| Event | Additional properties | Trigger |
| --- | --- | --- |
| `Page Viewed` | None | Initial route and each distinct client route |
| `Assessment CTA Clicked` | `placement: header \| hero \| section \| footer`; `destination: contact \| contact_enquire` | Explicitly marked assessment link |
| `Matter Enquiry Started` | `placement: form` | First form interaction per mount |
| `Matter Enquiry Submitted` | `placement: form` | Formspree returns `response.ok` |
| `Matter Enquiry Submission Failed` | `placement: form`; `failure_stage: response \| network` | Non-2xx response or thrown network failure |

Unknown paths become `not_found`. Query, hash, and trailing-slash changes do not create a second page view for the same canonical page. CTA capture must run before Next.js navigation so the click precedes the destination page view.

## Privacy and vendor configuration

- Keep analytics production-only and anonymous with local-storage device identity.
- Keep the checked-in public browser token only in `src/lib/analytics/client.ts`. Never add a project secret, API secret, service-account credential, or private key.
- Send only to Mixpanel’s US browser ingestion host through `mixpanel-browser/src/loaders/loader-module-core`.
- Keep `autocapture`, automatic page views, marketing enrichment, first-touch marketing, feature flags, remote settings, heatmaps, session recording, IP collection, referrer storage, and Google/UTM persistence disabled.
- Keep the complete URL, referrer, UTM, and advertising-click property blacklist as defence in depth.
- Never call `identify`, `alias`, People, profile, or group methods.
- Never pass raw URLs, queries, hashes, referrers, click IDs, field names, form values, matter classifications, request or response bodies, status text, or error text.
- Do not add analytics consent, opt-out, preference, debug, or privacy-notice UI without an explicit product decision.

## Safe change procedure

1. Add or change the typed input and reconstruction rule in `core.ts` first. Use a closed event name and closed enum values.
2. Add an Interface test that proves the emitted event and proves unexpected or sensitive properties are absent.
3. Call the project facade from the narrowest existing Client Component or `src/instrumentation-client.ts`. Do not expose a generic string-based tracker.
4. Mark only assessment CTAs with `data-analytics-cta`, `data-analytics-placement`, and `data-analytics-destination`. Do not track ordinary navigation or generic clicks.
5. Preserve fail-open behaviour. Analytics must never delay, reject, or change navigation, animation, Formspree submission, success, failure, or retry state.
6. Update this guide and `DESIGN.md` when the event contract, caller ownership, runtime request, or visible interaction changes.

## Validation

Run:

```bash
npm test
npm run lint
npm run build
rg -n "mixpanel-recorder|@mixpanel/rrweb|rrweb-record" out/_next/static .next/static
```

The first three commands must pass. The recorder search must return no shipped recorder implementation. For analytics interaction changes, use the project browser matrix in `AGENTS.md`, stub Formspree, confirm development sends no Mixpanel request, and verify blocked analytics does not affect links, animation, or form state. Never send a real enquiry during validation.
