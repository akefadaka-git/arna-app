# ARNA Enterprise Calendar — App A2 Read-only Inventory

**Status:** A2 PARTIAL; read-only source review
**Repository:** akefadaka-git/arna-app
**Main SHA:** 23b2e65d9c16b03bbb7ccb2f0783c8813e2307da
**A1 PR:** #22; proposal commit 0c92277389cc213d0740b94fd294bb662b14dae9
**Method:** GitHub source/tree inspection only. No app code, tests, builds, browser state or deployment changed.

## Executive findings

| Capability | Source evidence / disposition |
|---|---|
| Shared date preference | src/core/dates/calendar.ts provides reactive E.C./G.C. preference; defaults E.C.; localStorage and same-origin storage event. REUSE. |
| Shared date formatting | formatCalendarDate renders one selected calendar and throws if browser calendar support is missing; fixed Africa/Addis_Ababa timezone. REUSE and enhance. |
| Calendar page/routes | No Calendar feature or route in inspected router/feature inventory. CREATE. |
| Governance UI | Governance body list/detail views and workspace routes exist; no meeting/agenda/voting UI found. REUSE body foundation; add meeting UI after API contract. |
| Tasks | No standalone tasks feature in inspected src/features inventory. Owner unresolved. |
| Finance/Budget | No Finance feature in inspected App feature inventory. MISSING. |
| Portfolio/Projects | No portfolio/projects feature found. MISSING. |
| Reporting | No reporting feature found. MISSING. |
| Communication Hub | No Communication feature found. MISSING. |
| Files | src/features/files exists. REUSE authorized file links. |
| Notifications | API adapter, NotificationsCenter, store and AppShell bell exist. REUSE; calendar publishers must be server-driven. |

## Date preference foundation

src/core/dates/calendar.ts blob 801486e2698b31325118be4df238719906169bca defines CalendarSystem ethiopic/gregory, E.C. default, browser localStorage key arna.ui.calendar-system, storage-event synchronization and formatCalendarDate(). It formats exactly one selected calendar and throws if resolved browser calendar differs from requested calendar. Timezone is fixed to Africa/Addis_Ababa.

Gaps: preference is browser-local, not account/profile synchronized across devices; instant and date-only business values are not explicit in formatter contract; timezone is fixed rather than event-specific; this A2 pass did not establish cross-browser E.C. leap/Pagume test coverage.

**Disposition:** reuse the shared formatter; add account preference sync, date-only parsing, explicit event timezone and calendar test vectors in a later approved phase. No per-view conversion snippets.

## Routing and feature inventory

Router factory is src/router/index.ts; route trees are split into base, workspace, portal and admin. Workspace routes include Governance body list/detail with governance.body.view metadata. Portal includes self-service holdings, certificates, wallet and loans. No calendar route or page was found.

Top-level src/features inventory: auth, dashboard, files, governance, launcher, loans, notifications, people, portal, public-content, shareholders and wallet. No calendar, tasks, finance, portfolio/projects, reporting or communication module appears in this inventory.

## Notification seam

src/features/notifications/api.ts uses the shared authenticated API client and accepts no tenant ID; tenant context comes from the shared client. NotificationsCenter uses formatCalendarDate. AppShell includes the bell and center.

Calendar reminders/invitations must originate from committed API-side events/outbox. Client-only timers cannot be authoritative. Linked-record navigation must recheck domain authorization.

## UI integration map

- Add Calendar route/page under authenticated workspace shell and reuse global date preference.
- My Schedule and team schedules are filtered calendar collections, not duplicate event stores.
- Governance meeting detail links to body, agenda, attendance/quorum evaluation, vote and certified resolution; show only API-authorized operations.
- Tasks/actions must link to authoritative source-domain work items; do not create a parallel task store before owner is confirmed.
- Finance budget panels read Finance-owned approved values; no mutation from calendar.
- Portfolio/report/communication panels remain unavailable until authoritative APIs and permissions exist.
- Notifications center receives server-generated invitations, reminders, reschedules, cancellations, action assignments and voting deadlines.

## A3 prerequisites

1. Define account-level preference API; user choice overrides tenant E.C. default.
2. Define instant vs date-only DTOs, event timezone and recurrence rendering.
3. Define calendar route, view/query state, subscriptions and permission-aware filters.
4. Define server-owned event/meeting APIs and DTOs before UI implementation.
5. Define internal deep-link allow-list and authorization recheck.
6. Specify loading, stale, offline, denied, conflict and retry states.
7. Add browser test matrix for E.C. leap/Pagume boundaries, G.C.-only rendering, timezones, keyboard and mobile layouts.

## Limitations

This is a bounded source inventory, not a full component-wide date usage audit, browser test, accessibility audit or live API verification.

**A2 result: PARTIAL.** Shared date and notification foundations plus router/feature boundaries are verified. Complete date-usage inventory and UI permission matrix remain open. No A3 implementation is included.