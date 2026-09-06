# Testing

## Select checks

- Read `package.json` and use the repository's declared commands.
- Run type and Astro checks, the production build, and the focused tests that cover the changed surface.
- Add meaningful tests for logic, generated routes, content invariants, provider scripts, or request handlers when those surfaces change.
- Run local generic-readiness, metadata, llms, sitemap, accessibility, and selected-provider runtime checks when those profiles apply.

## Isolation

- Use local or disposable test targets.
- Do not send test conversions, leads, email, analytics, or advertising events to production accounts.
- Keep preview and production provider identifiers separate when the provider supports environment separation.

## Generated output

- Inspect representative built HTML after changes to metadata, scripts, canonicals, routes, or discovery files.
- For metadata, assert one title, description, and canonical per applicable route; verify composed and absolute title modes and reject double suffixes.
- For provider scripts, compare literal snippet text, count sitewide instances, verify page-specific route membership, and assert required source order.
- For user-facing changes, verify representative desktop and mobile layouts in the real interface when available.
- Assert the built HTML ships no render-blocking stylesheet and no unreviewed font preload. Both regress silently: the page still renders, so no functional test and no screenshot catches them. This project preloads exactly two faces by recorded decision - the display and mono faces that carry above-the-fold text on every route - and deliberately does not preload the 716-byte approx subset, which leads every mono stack and is discovered at CSS parse time. `site/test/production-parity.test.ts` and `site/scripts/validate-build.mjs` both pin that count at two.
- Response headers, including the Content Security Policy and cache rules, are applied by the host and not by the development server. Verify them against the platform runtime or a deployment, and assert zero console errors there. A blocked script leaves the page looking correct.
- For negotiated output, test default HTML, explicit Markdown, q-values, 406, GET and HEAD, HTML and Markdown 404, the complete final `Vary` value, both cache orders, fixed assets, and direct internal-path blocking. HTML must remain byte-identical. On Vercel, also run the adapter's configuration verifier so no later `vercel.json` `Vary` rule can replace the owner-declared value.
- For generic readiness, open every indexable route without JavaScript and compare configured agent responses with the browser baseline. Require direct status, one H1, one main, content markers, text ceilings, real 404 recovery, crawler-policy resolution, and review of every hidden-instruction finding.

## Proof

Report the commands run, their results, the generated or rendered surfaces inspected, the environment and authority used, and any unavailable check with its remaining risk. Missing preview authority is unavailable evidence, not a pass. Never run these checks against production or shared services.
