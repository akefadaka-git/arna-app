# ARNA Communication Hub Expansion — Frontend Contract v1.0

**Status:** Owner-authorized expansion specification; implementation and runtime acceptance remain pending.
**Base:** Communication Hub A4 merge `2eff0a0e08062728bba071b1728ffe1886e200ad`
**Branch:** `feat/communication-hub-expansion`

## 1. Product outcome

Extend the existing Amharic-first Communication Hub without replacing its verified inbox and announcement foundation. Keep the four ARNA application entry points and shared App Shell intact. Communication screens belong in the authenticated enterprise workspace unless a separately approved portal experience is defined.

## 2. Information architecture

Retain the existing routes and add the following workspace routes after reconciling route naming, guards and navigation conventions:

- `/communications` — hub overview, unread summary, inbox and entry points.
- `/communications/conversations` — direct/group/department conversation list.
- `/communications/conversations/:id` — conversation detail, composer, attachment references and receipts.
- `/communications/announcements` — existing official announcement workflow.
- `/communications/search` — permission-gated, tenant/participant-scoped search.
- `/communications/preferences` — locale, in-app/email/SMS/push preferences, consent and quiet hours.
- `/communications/analytics` — permission-gated aggregate reporting and delivery health.
- Optional context routes/deep links for Governance meetings/decisions and Calendar events; canonical domain pages remain authoritative.

## 3. Screens and capabilities

### 3.1 Hub and inbox
- Summary cards for unread messages, announcements, pending acknowledgements and delivery exceptions (only when authorized).
- Unified activity feed sourced from the existing Platform Notification service.
- Filters for unread, announcements, messages, Governance and Calendar notices.
- Loading, empty, offline, permission-denied and recoverable-error states.
- Mark read and mark all read with optimistic UI only where rollback is safe.

### 3.2 Direct and group conversations
- Direct conversation creation from canonical People search.
- Group creation, title/avatar metadata, member management and department-based recipient selection from Organization.
- Conversation list with unread counts, last activity, participant labels and pinned/muted state where supported.
- Conversation view with chronological messages, reply context, pagination, send retry and idempotency.
- Delivered/read receipt indicators; distinguish sent, delivered and read.
- Clear membership changes and removed-member access behavior.

### 3.3 Attachments
- Upload/select files through Documents/File Management UI and API.
- Display upload, scan-pending, available, quarantined and unavailable states.
- Show metadata and canonical document links; never expose raw storage URLs.
- Respect file type/size limits and Documents authorization.

### 3.4 Domain-linked communication
- Governance meeting/decision cards with canonical links and action context.
- Calendar invitation/reminder cards with canonical event links and Calendar-owned response actions.
- Organization department audience picker based on active assignments.
- People picker uses canonical identity and tenant access.
- Documents preview/open action delegates to the existing document viewer and ACL.
- Other domains can render typed notification cards without embedding domain business rules in Communication UI.

### 3.5 Search and analytics
- Search by conversation, sender, date, content and attachment presence; display only authorized results.
- Analytics dashboard for activity volume, active conversations, acknowledgement and delivery outcomes.
- Date range, domain, channel and tenant filters only when supported by API authorization.
- No message-body analytics or client-side aggregation of inaccessible records.

### 3.6 Preferences and channels
- Separate in-app, email, SMS and push preferences.
- Explicit consent and channel availability state.
- Locale and quiet-hour preferences.
- Push subscription registration/revocation UX.
- Show channel as unavailable until backend provider configuration and consent checks pass.

## 4. Shared design and accessibility

- Use approved ARNA semantic tokens, existing shared components and App Shell.
- Amharic-first labels with English support; no hard-coded one-language-only workflows.
- Mobile-first responsive layouts; usable at narrow phone widths.
- Keyboard navigation, visible focus, semantic headings/landmarks, accessible dialogs and live status announcements.
- WCAG 2.2 AA evaluation is required for release; CI contract checks alone are not a measured conformance audit.
- Do not introduce dependencies or replace existing design-system contracts without review.
- Use loading skeletons, empty states, error recovery, offline/retry states and permission-aware actions consistently.

## 5. Frontend/backend integration contract

- Use the shared API client and existing authentication/tenant context.
- Frontend permission gates improve UX only; API authorization remains authoritative.
- Do not cache messages or attachments across tenant/account changes.
- Clear tenant-scoped state on logout, account switch or tenant switch.
- Every mutation handles duplicate submission, retry and server conflict responses.
- Do not embed provider secrets or private file URLs in client bundles.
- Deep links must re-check server authorization on every navigation and fetch.

## 6. Delivery slices

1. **E1 — Messaging workspace:** conversation list/detail, direct/group/department flows, message composer, receipts and mobile layouts.
2. **E2 — Attachments and search:** Documents integration, attachment states, scoped search and filters.
3. **E3 — Domain communication:** Governance and Calendar event cards, Organization/People recipient pickers and document deep links.
4. **E4 — Channel preferences:** email/SMS/push settings, consent, quiet hours and subscription lifecycle.
5. **E5 — Analytics and operations:** aggregate dashboard, delivery status and audit-aware operational views.

## 7. Acceptance evidence

For each slice, record exact API and App head SHAs, changed-file inventory, screenshots or runtime walkthrough evidence, route/permission checks, responsive behavior, Amharic/English behavior, accessibility results, API contract tests, exact-head CI URLs and unresolved issues. No feature is complete because a route or component merely exists.

## 8. Explicit non-claims

This document is a frontend specification. It does not claim the routes, views, channel providers, analytics, attachments, messaging or domain cards have already been implemented or deployed.
