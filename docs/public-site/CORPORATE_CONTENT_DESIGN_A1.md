# ARNA Public Corporate Website — Corporate Content and Design Specification

**Document ID:** ARNA-PUBLIC-A1-001  
**Version:** 1.0  
**Stage:** A1 — Assessment, specification and freeze  
**Status:** **OWNER-APPROVED / FROZEN**  
**Approval date:** 2026-11-14  
**Implementation repository:** `akefadaka-git/arna-app`  
**Public domain target:** `www.maalearna.com.et`

## 1. Purpose and governing identity

The public site represents **Maale Arna Share Company** as a corporate organization. It must not present the company merely as a software platform.

Brand hierarchy:
- **Maale Arna:** corporate identity and organization.
- **ARNA:** master name for the wider system/platform.
- **MASES:** legacy/original product identity retained where historical or technical context requires it.

The corporate website and authenticated shareholder/workspace applications are distinct surfaces.

## 2. Audience

The site serves shareholders and investors, customers, business partners, employees and candidates, suppliers, the local community and public, and media.

## 3. Content principles and authority

- Amharic is the primary language; English is a complete alternative.
- Amharic and English must communicate equivalent facts and commitments.
- Do not invent corporate history, legal identity, ownership, leadership, subsidiaries, licenses, active operations, services, awards, partnerships, financial figures, contact details or geographic reach.
- Clearly distinguish bylaw-authorized business purposes from current operations, approved projects, planned initiatives and proposed opportunities.
- A contribution or saved draft is not a published statement.
- Public content is served only from the authoritative API after the required approval and publication transitions.
- Verification is offered only for document types supported by an authoritative verification system.

## 4. Required information architecture

The public site should provide:
1. Homepage and corporate introduction.
2. About the company.
3. Vision, mission, objectives and values, with approval status and source authority respected.
4. Governance and authorized public leadership disclosures.
5. Business areas and verified operating activities.
6. Products and services.
7. News and announcements.
8. Publications and media/gallery.
9. Careers and opportunities.
10. Contact and inquiry channels.
11. Legal notices and public verification.

Content may be omitted or shown as a truthful empty state when verified information is not available.

## 5. Admin CMS requirements

The admin console is the authoritative content-management surface. Administrators granted the corporate-content permission must be able to create, edit, update, enhance and manage all supported corporate content categories, including homepage composition, corporate pages, bilingual copy, business/service records, news, announcements, publications, media metadata, careers, opportunities, contact details, navigation, footer and SEO/social metadata.

Editing authority is distinct from publication authority:
- Every material edit creates or updates a versioned draft.
- The editor cannot approve or publish the same version.
- A second authorized reviewer must approve the exact version before publication.
- Editing an approved or published item invalidates its prior approval and returns the new version to review.
- Unpublishing, archiving and any deletion must follow retention and audit rules.
- Mutations must be permission-checked, version-checked and audit logged by the API.
- Public endpoints must never expose drafts, private inquiry data, internal moderation notes or unapproved assets.

The detailed CMS authority and acceptance contract is recorded in `CORPORATE_CMS_ADMIN_EDITING_AND_PUBLICATION_AUTHORITY.md`.

## 6. Design direction

- Preserve the approved ARNA design-system architecture and corporate emblem.
- Enterprise-blue foundation with restrained aubergine, crimson, gold and warm-ivory accents in the approved hierarchy.
- Consistent typography, spacing, navigation, cards, content widths, footer and page templates.
- Amharic-first typography must render correctly; avoid mixed-language labels where a localized equivalent is available.
- Use authentic, authorized corporate imagery where it adds factual value.
- Avoid excessive gradients, animation, glass effects and decorative elements that reduce clarity.
- Mobile-first and responsive behavior across phone, tablet and desktop.

## 7. Accessibility and usability

Target **WCAG 2.2 AA**:
- Semantic landmarks and heading hierarchy.
- Keyboard-operable navigation and controls.
- Visible focus indicators and skip navigation.
- Sufficient text and UI contrast.
- Accessible labels, errors, status announcements and form instructions.
- Reduced-motion support.
- Manual screen-reader and assistive-technology review before A4 closure.

## 8. Search and sharing

- Unique localized title and description for each public route.
- Correct canonical URLs and alternate-language destinations.
- Open Graph/social metadata and suitable social image where available.
- Search indexing controls appropriate to the publication state.
- Structured data only where facts are verified and the schema is appropriate.

## 9. Acceptance criteria

A4 must establish:
- No fabricated or misleading corporate claims.
- Bilingual content parity and correct alternate-slug navigation.
- Correct published-only rendering, including full page body and structured sections.
- Admin editing for supported content categories, with independent review and audit/version controls.
- Working public routes, forms and content feeds.
- Responsive verification at phone, tablet and desktop widths.
- WCAG 2.2 AA automated checks plus manual review.
- SEO, canonical, alternate-language and social metadata checks.
- Exact-commit static build, route tests and relevant API feature tests.

## 10. Scope boundaries and stage gates

- **A1:** this specification is frozen by Owner approval.
- **A2:** read-only reconciliation against the actual repositories; no code mutation.
- **A3:** implementation on separate feature branches.
- **A4:** verification and closure evidence on exact PR heads.
- **A5:** deployment is separate and remains the Owner's responsibility.

No production deployment, production data mutation, PR merge or main-branch modification is authorized by this specification. No backend/domain restructuring or unrelated workspace/shareholder changes are included.
