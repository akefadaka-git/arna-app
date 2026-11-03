# ARNA Public Corporate Website — A1/A2 Reconciliation and A3/A4 Contract

Status: A1 reconciled; A2 contract baseline. Implementation branch: feat/public-corporate-platform.

## Existing app findings

- PublicHome.vue contains a mostly static corporate landing page and a small API-backed public news feed.
- PublicContributionRoute.vue already submits user-contributed editorial content through email verification and server-side moderation.
- src/features/public-content/api.ts contains an admin moderation client for the existing PublicContent API.
- The public build is an independent static Vite build (build:public); production hosting serves static files, so content must be fetched from the configured HTTPS API origin.
- Do not add a second CMS, local content store, or client-side publication authority.

## A3 app scope

- Replace hard-coded corporate sections with typed, locale-aware API data while retaining a safe loading/error/empty state.
- Build public routes for About/governance/organization, businesses/subsidiaries/services, news/announcements/publications, media/gallery, careers/opportunities, contact and advertising/marketplace information.
- Keep published content only on public routes. Admin authoring/review routes require authenticated permission checks and server-side authorization.
- Add Amharic/English locale selection and locale-aware navigation, slugs, page metadata and SEO tags. Do not silently substitute unreviewed translations.
- Add responsive accessible media cards/gallery with alt text, captions and keyboard operation.
- Add contact inquiry submission with consent, validation, rate-limit feedback and opaque reference.
- Advertising/marketplace public displays must show approved, active listings only; no client-side ad approval or payment assumptions.
- Add structured page metadata, canonical URL, OpenGraph/Twitter metadata, robots directives and sitemap integration appropriate to static hosting and API-driven content.
- Preserve the existing contribution flow and its security semantics.

## API contract

Use the API contract in the API repository at docs/public-site/CORPORATE_PUBLISHING_A1_A2_A3_CONTRACT.md. Public data comes from /api/public/site/* and editorial news continues to use the existing /api/public/content endpoints until the unified response contract is implemented. All API errors must degrade gracefully without inventing corporate facts.

## A4 acceptance

- npm run type-check
- npm run build:public
- npm run test:public-build-smoke
- route and locale contract tests
- Amharic/English content and metadata checks
- keyboard, screen-reader, contrast, reduced-motion and WCAG 2.2 AA review
- mobile/tablet/desktop responsive checks
- verify no draft/private fields or unapproved assets appear in public responses
- record exact branch SHA and evidence; no production deployment in A4.
