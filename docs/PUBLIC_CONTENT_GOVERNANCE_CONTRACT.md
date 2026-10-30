# Public Content Governance Contract

**Scope:** ARNA public corporate website and ARNA Admin Console  
**Status:** Phase 1 implementation contract; backend enforcement and Admin workflow require their own verified delivery gate.

## Non-negotiable publication rule

Anyone may submit proposed public content. Submission is not publication. A public visitor, contributor, author, or submitter must never be able to approve or publish content. Only an authenticated ARNA administrator with the explicit content-publication permission may approve and publish.

The public website must display only records returned by a server-side published-content query. Client-side filtering is not an authorization boundary.

## Content types

- News
- Blog articles / insights
- Official announcements
- Press releases
- Public notices (future content subtype)

## Required lifecycle

`draft` (optional authenticated author workspace) → `pending_review` → one of:
- `changes_requested` (author may revise and resubmit; revision returns to `pending_review`)
- `rejected` (not public)
- `approved` → `published` (only by authorized administrator)
- `withdrawn` (authorized administrator; previously published content is removed from public delivery)

An administrator may edit a submission during review. Any material edit after approval must invalidate the prior approval and return the record to `pending_review`. Scheduling is an administrator-controlled publication action, not a submitter capability.

## Authorization invariants

1. Public submission endpoints accept content only; they do not accept status, approval, publication timestamps, reviewer identity, or publication actor as trusted client input.
2. The server assigns `pending_review` on accepted submissions.
3. Public/anonymous identities have submit-only capability. They cannot list the review queue, inspect other submissions, modify a submission after acceptance, approve, reject, schedule, publish, unpublish, or delete.
4. Only the Admin Console and API authorize reviewers. The API checks the authenticated principal, tenant context, and dedicated permission (recommended permission key: `public-content.publish`) on every review/publication mutation.
5. The submitter cannot approve their own submission. If the submitter is an administrator, a separate reviewer must approve it.
6. Public read endpoints return only `published` records whose publication time has arrived and which are not withdrawn.
7. Review actions are audit logged with actor, timestamp, action, reason, content version, and before/after state.
8. Submission endpoints are rate limited, validate and normalize input server-side, sanitize rendered content, protect against spam, and avoid exposing internal moderation notes or other submitters' data.
9. Media attachments require type/size validation, malware scanning where available, and moderation before public delivery.
10. Approval and publication are distinct audit events even if the Admin Console offers a single deliberate “Approve & Publish” action.

## Public submission client contract

The Phase 1 public form posts to the build-time configured `VITE_PUBLIC_CONTENT_SUBMISSION_URL`. The endpoint must be supplied only after the API implementation exists and its route, payload, response, rate limit, and authorization tests are verified.

Expected request fields: `type`, `title`, `body`, `author_name`, optional `author_email`, and a honeypot field. The client does not send a trusted publication status or reviewer identity.

Expected accepted response: HTTP 201 with an opaque submission reference and a generic acknowledgement. The response must not return unpublished content through a public read endpoint.

If the endpoint is not configured, the public form remains disabled and explains that submission is not yet available. It must not store or silently publish content in the browser.

## Admin Console requirements (API/UI follow-up gate)

- Dedicated pending-review queue with filters by content type, submission date, and status.
- Safe preview of sanitized content and attachments.
- View author-provided attribution/contact details only to authorized reviewers.
- Approve, reject, request changes, schedule, publish, unpublish/withdraw actions with reason capture.
- Version-aware review: edits invalidate prior approval.
- Audit trail and reviewer identity.
- Public preview must be unavailable until publication.
- No direct database status changes from the browser; all actions go through authorized API policies.

## Phase 1 boundary

Phase 1 delivers the public-site layout foundation and submission experience. It does **not** claim end-to-end public submission or Admin moderation until the API and Admin Console gates above are implemented and verified. The public form intentionally fails closed while its API endpoint is unconfigured.
