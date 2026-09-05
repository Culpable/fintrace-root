# Site configuration

Read this guide before creating site configuration or adding or changing the site name, title separator, phone number, email address, business identity, physical address, social profile, repeated CTA fact, or the infrastructure that will own one.

## Source of truth

Use `src/config/site.ts` as the single typed owner of site identity and repeated public site facts. Every new site requires non-empty name and description, exact title separators, a verified BCP 47 language, one default social-image readiness decision, official-profile data, and a discriminated primary identity. If an existing site does not have the file, create it when this branch is first used. Do not publish empty placeholders for facts the site does not have.

Keep display and protocol forms separate where required:

```ts
export const site = {
  name: 'Example Site',
  titleSeparator: ' | ',
  phone: {
    display: '(08) 1234 5678',
    href: 'tel:+61812345678',
  },
} as const;
```

Use shared presentation components when several locations need identical markup or tracking attributes. Derive metadata and structured data from the same facts where applicable.

Organization and LocalBusiness readiness also require a verified public ContactPoint with `contactType` and email or telephone plus a truthful PostalAddress. Person identity does not inherit those fields. Missing applicable facts remain one batched owner request and prevent a false readiness pass.

## Boundaries

- Store public facts only. Never add secrets or private recipient data.
- Keep the canonical production origin authoritative in `astro.config.*`.
- Keep route-specific titles and descriptions with their page or content entry. The metadata resolver composes them with the site identity.
- Keep provider-owned snippets and their identifiers in the provider component by default so the supplied snippet remains literal.

## Verification

Search authored source for stale or duplicated values. Inspect representative rendered text, trust pages, links, metadata, structured data, llms output, and any dynamic-number-replacement fallback. Confirm that language, social image, identity type, official profiles, contact methods, and address match the owner-approved facts.
