# ARNA Enterprise Calendar — A2 App Read-only Baseline Report

- Assessment: A2 — read-only repository inventory
- Repository: ake fadaka-git/arna-app
- Branch assessed: main
- Exact App baseline SHA: 23b2e65d9c16b03bbb7ccb2f0783c8813e2307da
- A1 approval: Owner approved A1 and authorized A2.
- Change boundary: No runtime source, router, store, or build configuration changed by this assessment.
- Overall A2 disposition: PARTIAL — shared shell/date foundations and domain feature pages exist; no unified Calendar page or Calendar route was found in the inspected inventories.

## 1. Executive result

The app has a shared App Shell, authenticated workspace router, design-system primitives, a central date formatter, notification API/center/store, and feature areas for Governance, People, Files, Loans, Wallet, Shareholders, Portal, Dashboard and Public Content.

No src/features/calendar directory, Calendar view component, or Calendar route was found in the inspected src/features and src/router inventories. Existing routes include Governance bodies, People, Files, Shareholders, Wallet, Loans, and Loan repayment schedule/statement pages. The loan schedule is a domain-specific amortization view, not a general enterprise calendar.

## 2. Source inventory and disposition

| Capability | Evidence at baseline SHA | A2 disposition |
|---|---|---|
| App Shell and router | src/layouts/AppShell, src/router/index.ts, routes-workspace.ts, route guards | REUSE; Calendar is a workspace feature route under existing authorization conventions |
| Central date preference | src/core/dates/calendar.ts | REUSE / AMEND; E.C. default, G.C. optional, exactly one selected formatter output |
| Preference persistence | same file stores arna.ui.calendar-system in browser localStorage | PARTIAL; browser-local, not account/profile synchronized across devices |
| Date formatting | formatCalendarDate() uses Intl.DateTimeFormat, ethiopic or gregory, timezone Africa/Addis_Ababa, throws if selected calendar unsupported | REUSE with cross-browser tests; avoid Gregorian fallback when E.C. selected |
| Notifications | src/features/notifications/api.ts, NotificationsCenter.vue, src/stores/notifications.ts, NotificationsBell.vue | REUSE; integrate calendar reminders through API/outbox, not frontend timers |
| Notification bootstrap | src/core/bootstrap.ts wires auth/tenant headers and tenant cache invalidation; auth service clears stores on logout | REUSE; verify calendar store clears on tenant change/logout |
| Governance UI | src/features/governance has body list/detail, overview, people directory/profile; API/service wrappers cover bodies, terms, positions, appointments, memberships | REUSE for governance references; no meeting/agenda/vote/resolution pages found |
| People | src/features/people directory/profile/API | REUSE for attendee lookup after server-side identity and visibility checks |
| Files | src/features/files list/detail/API/service | REUSE for agenda packs/minutes/document links; preserve document permission checks |
| Finance UI | Finance implementation contract documents route families including budgets, journals, reports and period close; these routes are not in the current workspace route table inspected | PARTIAL / planned contract, not evidence of live screens |
| Portfolio/projects | No project/portfolio feature directory in inspected src/features inventory | MISSING |
| Tasks/action items | No task feature directory in inspected inventory | MISSING |
| Communication | No Communication Hub feature directory in inspected inventory | MISSING |
| Reporting | Dashboard exists; no scheduled report/calendar feature found in inspected inventory | PARTIAL |
| Calendar view | No CalendarView or calendar feature directory found | MISSING |
| Appointment/scheduling UI | No general appointment/availability/resource scheduling feature found | MISSING |
| Governance meeting UI | No meeting/agenda/attendance/quorum/vote/resolution page found | MISSING |

## 3. Route and navigation findings

Workspace route tree currently includes launcher; Files list/detail; Shareholders/share classes; Wallet list/detail/statement; Loans list/detail/schedule/statement/products; People directory/profile; Governance overview, bodies and governance people pages.

No Calendar route was found. The route tree uses named routes, lazy-loaded views, route metadata and permission guard conventions. A future Calendar route must use the same router factory and permission policy; the App Shell must not become a business-domain router.

## 4. Date preference and UX constraints

- Shared utility already defaults to E.C. and supports G.C. as a mutually exclusive selected calendar.
- Preference is stored in localStorage; it is not cross-device account synchronization.
- Formatter uses Intl.DateTimeFormat and throws when the requested calendar is unsupported. Calendar UI must handle this visibly and must not silently show G.C. while E.C. is selected.
- Current formatter uses Africa/Addis_Ababa. Event display must still respect each event's stored IANA timezone and explicit all-day/date-only semantics; shared utility may need a timezone parameter or a separate event-time formatter.
- One selected calendar must apply to event chips, date pickers, detail panels, agenda lists, reminders, task due dates, dashboard widgets, reports and governance deadlines.

## 5. Notification and state integration

- Notifications are fetched through a feature API and held in a Pinia store; the store does not own I/O.
- Notification center supports recipient inbox operations and localized notification content.
- Bootstrap wires tenant headers and tenant cache invalidation; logout clearing is centralized in auth service.
- Calendar UI should call a calendar feature service and mutate stores through defined actions. On tenant switch/logout, calendar caches and subscriptions must clear.
- Reminders must be server-originated and linked to authorized route names/resources. Do not trust arbitrary URLs or client timers as proof of delivery.

## 6. Required A3/A4 design decisions

| Decision | Status | Requirement |
|---|---|---|
| Calendar route/navigation | OPEN | route names, permission mapping, navigation grouping and mobile entry |
| Calendar state ownership | OPEN | Pinia store/service boundaries and tenant cache invalidation |
| Date/time input contract | OPEN | E.C. input parsing, G.C. optional, timezone-aware instants, date-only values |
| Calendar event DTO | BLOCKED on API contract | generate types from approved API response; no invented fields |
| Domain filters and source links | OPEN | server-side permission-filtered calendars and linked-record resolution |
| Governance meetings/voting | BLOCKED on approved rules | no UI may imply quorum or binding decision when policy is unknown |
| Tasks/Portfolio/Finance/Reports/Communication | BLOCKED on authoritative APIs | do not create frontend-only duplicate records |
| Notifications/reminders | OPEN | event catalogue, recipient rules, server delivery state and dedupe |
| Accessibility | OPEN | keyboard, screen reader, contrast, reduced motion, responsive grid behavior |

## 7. A2 conclusion

App A2: PARTIAL / INVENTORY RECORDED at exact main SHA above. Existing shell, route conventions, date formatter, notification integration and domain features are reusable. A unified calendar page, generic appointment/scheduling, task and portfolio screens, communication hub, and governance meeting/voting views are not present in the inspected inventory.

This was a read-only assessment. No runtime code or route was changed and no local tests were run. A3 should begin only after API ownership and contracts are settled, then deliver Calendar UI against approved API contracts.
