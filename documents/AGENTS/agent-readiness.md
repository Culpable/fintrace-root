# Agent readiness

Read this guide before changing public routes, crawler policy, redirects, 404s, trust pages, agent-readable output, negotiated representations, or provider runtime selection.

## Profiles

- The universal static baseline applies to every public production route.
- Business identity and trust applies when this site represents a public product, service, organisation, or local business.
- Negotiated Markdown applies only when the selected provider adapter is configured. Astro pages remain prerendered.
- The file-only HTML profile applies when no selector is configured. It generates no per-page `.md`, Markdown alternate relation, or `Vary: Accept` claim.
- Hosted verification applies only to an exact preview or canonical origin authorised by the user.

Record which profile owns each outcome. Do not add API, auth, OAuth, MCP, agent app, SDK, registry, payment, query-mode, bot-user-agent Markdown, off-site directory, Wikipedia, Wikidata, brand, or search-share work without a separate product requirement.

## Owners

- `src/config/site.ts` owns language, default social image, identity, official profiles, public contact, address, and readiness facts.
- The canonical route and sitemap data owner owns every indexable and trust route.
- `src/lib/metadata.ts`, `src/lib/structured-data.ts`, `PageMetadata.astro`, and `StructuredData.astro` own human and machine head output.
- `src/pages/robots.txt.ts` or the selected existing static file owns crawler policy.
- The llms config and renderer own `llms.txt`. It links canonical HTML under the file-only profile. Negotiated generated Markdown never becomes an authored content owner.
- `src/lib/agent-readiness/` owns robots resolution and bounded content checks when copied into this project.
- `src/lib/agent-readable-http/` owns Accept selection, internal paths, and portable document responses when negotiation is selected.
- On Vercel, the selected adapter's `document-vary.ts` is the sole owner of the complete document `Vary` value. It includes `Accept` plus every project-owned dimension.
- Exactly one selected provider adapter owns request-time representation choice.

Do not create a second metadata registry, public-fact object, route list, negotiation helper, internal prefix, or manually maintained Markdown version of an HTML page.

## Public route contract

Every indexable route returns direct 200 HTML with one H1, one `main`, substantive visible initial content, a self-canonical, configured language, `og:type`, and a real absolute social image. It must work with JavaScript disabled and must not resolve to an auth shell, WAF challenge, redirect stub, indirect canonical, or unexpected cross-origin hop.

The default extracted visible `main` ceiling is 100,000 Unicode characters. A higher limit requires an exact route override and a documented content reason.

A deterministic unknown route returns 404 plus a named internal HTML recovery link. Use 410 only for a separately configured intentionally retired resource. Scan hidden content and `aria-label`, `alt`, and `title` for bounded instruction patterns. Review every finding.

Normal public business sites keep canonical `/about/`, `/contact/`, and `/privacy/` outcomes. Each has at least 500 characters of distinct, page-specific visible `main` content and passes owner review. Hidden, duplicated, generic, placeholder, or invented content fails.

## Crawler contract

Keep user-triggered retrieval, retrieval or search crawling, model training, general indexing, and security denial as separate decisions. Resolve effective robots rules for every configured product token. A user-agent string is not authentication.

Compare the configured user-triggered agents with the browser baseline for status, content type, H1, and main markers. Local tests are loopback-only. Never treat source inspection as provider or canonical-host runtime proof.

## Negotiated HTTP contract

Apply negotiation only to public document GET and HEAD requests. Fixed assets, `llms.txt`, robots, and sitemap keep their media types. Missing or wildcard-only Accept stays HTML-first. Honour specificity and q-values. Return 406 when both supported types are unacceptable.

Every negotiated HTML, Markdown, 404, and 406 response includes `Accept` in `Vary` while preserving existing dimensions. On Vercel, declare the complete value in `document-vary.ts` and reject all `vercel.json` `Vary` rules because later rules can replace it. Markdown uses `text/markdown; charset=utf-8`. HEAD has GET-equivalent status and headers with no body. Recalculate or remove body-specific headers after transformation.

Keep generated Markdown under the one private internal prefix. Block direct requests and exclude it from canonical URLs, sitemap, robots, llms output, and visible links. Markdown 404 links to home, sitemap, llms, and contact while retaining status 404.

## Provider and authority boundaries

Run the selected provider's local emulator before hosted checks. Record cache-order isolation, static asset preservation, byte-identical HTML, blocked internal paths, quotas, latency, fail-open behaviour, and rollback.

Do not deploy, connect a repository, change DNS, change provider accounts, purge production caches, set `Content-Signal`, add production secrets, or run production mutation tests without explicit authority. If preview credentials or authority are absent, report hosted evidence as unavailable.

## Completion evidence

Report every selected outcome as pass, fail, or unavailable. Include command, route, representation, environment, status, content type, cache headers, and observed content marker. Run the local readiness, metadata, llms, sitemap, accessibility, and selected-provider suites. Review the scoped diff and generated output. Do not claim readiness from a vendor score or from the development server.
