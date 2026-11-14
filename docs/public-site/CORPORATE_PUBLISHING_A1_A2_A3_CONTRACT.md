# ARNA Public Corporate Website — A1/A2 Reconciliation and A3 Delivery Contract

**Status:** A1/A2 reconciled; A3 implementation delivered on the feature branch; A4 verification remains separate.

## Existing app findings

- The public site is an independent Vite static build. It must fetch published content from the configured HTTPS API origin.
- `PublicContributionRoute.vue` and the existing PublicContent domain already provide contributor email verification and editorial moderation. That workflow remains intact.
- The homepage has a designed Amharic corporate presentation. A3 connects CMS-managed homepage content, localized published navigation and live editorial/business/service/career/marketplace/media feeds without treating client-side content as authoritative.
- Do not create a competing local content store or bypass server-side publication approval.

## A3 delivered

- Typed API clients for corporate pages, editorial entries, localized lists, inquiries, opportunities and admin moderation.
- Public routes for bilingual corporate pages and localized editorial details.
- Homepage locale selection, published CMS navigation, CMS-managed homepage sections, localized content feeds, contact and opportunity submission forms.
- Corporate CMS administration route for page creation/editing, independent review, publish/unpublish/schedule; bilingual editorial authoring/editing and moderation; quarantined media upload and scan; and contact inquiry triage.
- Expanded CMS authoring so authorized editors can revise the complete ordered page-section JSON, localized page SEO metadata, editorial-entry payloads and localized entry SEO metadata without silently dropping unedited structured fields. Page and entry edits remain version-checked drafts and return to independent review before publication.
- Bylaws-based corporate content source map at `docs/public-site/MAALE_ARNA_BYLAWS_CONTENT_MAP.md`; formal vision/mission are not attributed to the bylaws where no separately labelled statements were found. Proposed editorial wording remains subject to Owner approval.
- Public display feeds for businesses/subsidiaries, services, news, announcements, publications, media/gallery, careers/opportunities and marketplace entries. Only server-published records are displayed.
- Explicit consent before contact inquiry submission, a honeypot field, API throttling and opaque inquiry reference.
- Page/editorial metadata application for title, description, canonical URL, robots and Open Graph title where provided.
- Responsive layouts, labelled controls, skip links, keyboard focus styling and graceful loading/error/empty states.

## A3 security boundary

- Public reads are published-only. Client-side UI never approves or publishes content.
- CMS admin route uses the existing `public-content.review` permission; server endpoints independently enforce Sanctum and that permission.
- Page/entry edits are optimistic-version checked. Page authors and entry submitters cannot review their own records.
- Contact inquiries are private and are exposed only to the protected administration queue.
- Media uploads use the authenticated admin route and private quarantine storage. A trusted HTTPS malware scanner must return a clean verdict before media publication; missing/unavailable scanner means fail-closed.
- Organization records remain tenant-scoped. Public structure and subsidiary information is published from approved corporate CMS pages/business entries, not exposed by querying internal Organization rows directly.

## API contract

The API contract is documented in the API repository at `docs/public-site/CORPORATE_PUBLISHING_FOUNDATION_A3.md`. Public data comes from `/api/public/site/*`; existing contributor content remains available through `/api/public/content`.

## A4 acceptance still required

- API clean-install MySQL migration gate and corporate publishing feature tests.
- App type-check, all application builds, public-entry build smoke and route/locale contract tests on the final exact PR head.
- Scanner clean/infected/unavailable path tests and runtime scanner configuration validation.
- Verify no draft/private fields or unapproved assets appear in public responses.
- Manual Amharic/English review, keyboard and screen-reader review, contrast and WCAG 2.2 AA assessment, reduced-motion review, and mobile/tablet/desktop acceptance.
- Record exact branch SHAs and evidence. No production deployment is included.
