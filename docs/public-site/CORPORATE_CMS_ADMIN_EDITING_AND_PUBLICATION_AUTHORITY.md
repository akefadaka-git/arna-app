# ARNA Corporate Website CMS — Administrator Editing and Publication Authority

**Status:** Owner-confirmed A3 requirement  
**Applies to:** ARNA Admin Console, Corporate Site API, and public corporate website

## Owner decision

1. Every authenticated administrator granted the platform-wide `public-content.review` permission may create, edit, enhance, update, and manage all corporate-site content types within the corporate CMS.
2. Editing authority does not itself grant publication authority.
3. A material edit to an already reviewed or published item invalidates its previous approval and returns it to the review workflow.
4. Publication requires approval by a second authorized administrator who is not the editor/author of that version.
5. Public pages and feeds expose only records whose publication state and publication time permit public display.
6. These controls must be enforced by the API, not only by hiding or disabling controls in the browser.

## Content coverage

The CMS must support authoring and lifecycle management for:

- Homepage: hero, introduction, calls to action, announcements, section order, visibility, and section content.
- Corporate pages: About, history (only from supplied authoritative facts), vision, mission, objectives, values, governance, leadership disclosures, business areas, products, services, contact, and legal/public disclosures.
- Editorial: news, announcements, publications, media/gallery metadata, careers, and opportunities.
- Directory and commercial listings: business/service profiles, advertising and marketplace records, subject to their separate approval and operational controls.
- Shared site elements: navigation, footer, contact details, localized labels, SEO metadata, canonical URLs, social-sharing metadata, and supported structured data.
- Amharic and English translations, slugs, summaries, body content, structured sections, metadata, and media alternatives.

A content type may be unavailable for publication until its required fields, supporting evidence, or separate operational approval is satisfied. The CMS must communicate these constraints to administrators.

## Editing experience

- Provide a structured editor appropriate to each content type, not a single generic title/body form for all content.
- Allow authorized administrators to create, edit, enhance, reorder, enable/disable, preview drafts, and save versioned drafts.
- Support bilingual content editing with clear translation completeness indicators; do not silently substitute one language for another.
- Support homepage section composition and reusable content blocks with explicit ordering and visibility.
- Support media selection from approved assets; quarantined assets remain unavailable for public use until scan and approval requirements pass.
- Support safe removal by archiving/unpublishing or soft deletion where audit/history retention is required. Permanent deletion must be restricted and audited.
- Show version history, editor identity, timestamps, approval state, reviewer notes, and stale-version conflicts.
- Preserve existing content and unrelated application functionality.

## Publication and governance lifecycle

Recommended state model:

`draft → pending_review → approved → published`

Optional transitions include `scheduled`, `unpublished`, `rejected`, and `archived`.

- An administrator may edit any corporate content item when holding the required edit permission.
- A material change creates a new version and resets approval.
- The author/editor cannot approve or publish the same version.
- A distinct reviewer with the required server-enforced permission approves the exact version.
- Publication may occur only after that approval; scheduled publication must preserve the approved version and write audit events.
- Any subsequent material edit invalidates the scheduled/published approval and must not leave unreviewed content publicly visible.
- All mutations and lifecycle transitions are optimistic-version checked and audit logged.
- Concurrent stale writes must fail with a conflict response rather than overwrite another administrator's work.

## Security and data integrity

- Enforce authentication, role/permission checks, author-reviewer separation, and record-level validation on every API mutation.
- Never trust client-supplied author, reviewer, approval, publication state, or audit identity.
- Public endpoints return published, locale-appropriate content only; no drafts, review notes, private inquiry data, or internal identifiers.
- Validate and sanitize rich text, links, embeds, uploads, and structured blocks against explicit allowlists.
- Prevent unsafe HTML/script injection, path traversal, unauthorized asset access, and unapproved media publication.
- Record actor, action, record/version, timestamp, and relevant before/after change metadata in the audit trail.
- Do not expose tenant-private Organization or Finance records directly; public disclosures must use an approved CMS projection or separately approved integration.

## Acceptance criteria

- An authorized administrator can manage every supported corporate content category from the admin console without direct database editing.
- Changes can be previewed and saved as drafts without becoming public.
- A different authorized reviewer can approve the exact edited version.
- The editor cannot approve their own version, including through direct API requests.
- A material edit to a published item immediately removes the old approval from the new version and prevents unreviewed changes from being served publicly.
- Amharic and English can be edited independently and completeness is visible.
- Homepage blocks can be added, edited, reordered, hidden, and restored.
- Safe archive/unpublish and audited deletion controls are available where appropriate.
- Version conflicts, validation failures, permission denials, and audit events are tested.
- Public API tests prove that drafts, private fields, and unapproved assets never leak.
- A4 verification records exact commit, tests, and any remaining NOT RUN or UNRESOLVED gates.

## Explicit boundaries

This requirement does not authorize production deployment, API migration execution on production, bypassing the existing content moderation system, or publishing unverified corporate claims. Legal identity, ownership, history, leadership, subsidiaries, financial figures, awards, and active business claims require Owner-supplied or authoritative evidence.
