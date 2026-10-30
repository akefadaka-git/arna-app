# ARNA Public Content Governance Contract

**Scope:** ARNA public corporate website, Public Content API, and ARNA Admin Console  
**Status:** Phase 1.2 implementation contract

## Publication authority

Anyone may propose public content. Submission is not publication. Only an authenticated ARNA administrator with the server-enforced global `public-content.review` permission may review, approve, reject, request changes, schedule, publish, or unpublish content. The browser never supplies trusted status, reviewer, approval, or publication state.

The public website consumes only API records in `published` state whose publication time has arrived. Review queue data and author contact details are private to authorized reviewers.

## Contributor identity assurance

- Guest contributors request a six-digit code sent to their email address, verify it, and receive a short-lived opaque submission proof.
- Codes expire after 15 minutes, permit no more than five verification attempts, and are stored as hashes. Challenge issuance is rate-limited by source and by normalized email address.
- The submission proof is hashed at rest, bound to the challenge and normalized email, and consumed once in the same database transaction that creates the submission.
- The API derives guest author email from the verified challenge. A client-supplied author email is never trusted.
- Authenticated contributors must have a verified ARNA account email; the API derives author email and submitter identity from the authenticated account.
- Editorial changes cannot replace the verified contributor identity. A submitter account or matching verified contributor email cannot review or publish its own submission.
- Email transport must be configured and tested in each deployed environment. If sending fails, challenge issuance fails closed and no submission is accepted.

Email verification proves control of the mailbox at verification time; it does not prove legal identity, organizational authority, or authorship of the submitted material.

## Content lifecycle

`pending_review` → `approved` → `published` or `scheduled` → `unpublished`.

A reviewer may reject or request changes from the reviewable states. A material administrator edit increments the content version, clears prior review/publication metadata, and returns the item to `pending_review`. Every review mutation is version-checked; stale versions return HTTP 409. All submission, review, publication, scheduling, unpublication, and material-edit events are audit logged.

## Public submission client contract

The public contribution form calls:
- `POST /api/public/content/verification-challenges` with an email address.
- `POST /api/public/content/verification-challenges/verify` with the challenge UUID, email, and six-digit code.
- `POST /api/public/content/submissions` with content fields, consent, honeypot, challenge UUID, and one-time proof.

If the API is not configured, email verification fails, or the proof is missing/expired/used, the form must not submit or store content locally. Public reads must never expose pending or rejected submissions, contributor email, internal IDs, reviewer identity, or moderation notes.

## Admin Console contract

- Review queue is permission-gated server-side; hiding controls in the UI is not an authorization boundary.
- Every decision and edit carries the expected content version.
- Author identity and verified email are read-only.
- Review notes and contributor contact details remain private.
- Public preview is available only after publication.
- No direct database status changes from the browser.

## Phase boundary

This contract does not include third-party advertiser onboarding, campaign approval, billing, or campaign reporting. Commercial advertisements require a separate advertiser and campaign governance domain; editorial approval must not be reused as ad approval.
