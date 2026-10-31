# ARNA Calendar Experience — UI & Integration Specification v1.0

**Status:** A1 architecture proposal  
**Owner:** ARNA Owner  
**Target:** `akefadaka-git/arna-app`  
**Branch:** `feat/arna-calendar-experience-a1`  
**Date:** 2026-10-31

## 1. Product experience

Build a first-class Calendar workspace inside ARNA OS, not a decorative shell widget. It is a unified schedule and coordination experience with domain-aware permissions and a single E.C.-first date presentation.

## 2. Navigation and workspace

- Primary navigation entry: **Calendar / የቀን መቁጠሪያ**.
- Calendar landing page opens in the user's preferred default view (initially month on desktop, agenda on narrow mobile).
- Header: current E.C. date range, today, previous/next, create, view selector, filters, search and sync state.
- Views: month, week, work-week, day, agenda/list, timeline and resource schedule.
- Side panel: mini-calendar, My calendars, team calendars, shared calendars, resource calendars, categories and saved filters.
- Detail drawer/page: title, date/time, E.C. display, location, attendees, organizer, visibility, linked domain records, attachments, reminders, audit/history and permitted actions.
- Quick create with event type, date/time, duration, timezone, attendees and linked source record; advanced editor for recurrence and governance pack.
- Mobile: agenda-first list, bottom-sheet event editor, accessible date navigation, no horizontal overflow.

## 3. Event taxonomy and templates

- General event, appointment, task deadline, milestone, reminder, holiday, training, reporting deadline, budget review, project/portfolio review.
- Governance meeting templates: Board, Board Committee, Management, Shareholder General Assembly, extraordinary GA, project steering and operational meeting.
- Template-driven agenda sections, notice dates, paper deadlines, attendance, minutes and action follow-up.
- Governance-specific fields appear only when the user has domain permission; Calendar never grants those permissions.

## 4. Meeting workspace

A meeting detail view provides:
- Overview and notice status.
- Agenda with ordering, presenter, timebox, papers and decision/motion references.
- Attendee list, invitation responses, attendance/check-in and quorum status supplied by Governance.
- Voting session and ballot state from Governance, with secure link to vote UI.
- Decisions/resolutions with official number, adopted/rejected status and effective date.
- Minutes and approved papers from Documents.
- Action items/TODOs with owner, due date, priority and completion state from Task/Workflow.
- Communications thread and notification timeline.

No client-side quorum calculation or vote tally. Secret ballot details never appear in ordinary attendee/event payloads.

## 5. Cross-domain contextual panels

- Tasks: linked TODO list, dependencies, assignees, overdue state and due dates.
- Plans: strategic/operational objective, checkpoint and progress reference.
- Budget/Finance: planned budget reference, review date, approval deadline, variance/report link; no duplicate budget amounts or financial postings.
- Portfolio/Projects: project, milestone, stage gate, owner and status.
- Reporting: due report, period, responsible unit and submitted/approved status.
- Documents: meeting papers, agenda, minutes and decision records.
- Communication: invitation, thread, messages and delivery state.
- People/Organization/Shareholders: authorized participant and group context.

Panels must distinguish live domain data from calendar snapshot metadata and link only to records the current user can open.

## 6. E.C.-first interaction standard

- The global preference control selects one calendar system: E.C. by default or G.C. optionally.
- Every date in the UI uses the shared calendar service, including input labels, pickers, tables, breadcrumbs, reports, exports, notification timestamps and detail screens.
- Never render paired E.C. + G.C. dates by default.
- Timed events retain a clear clock and timezone label; the calendar preference changes the date calendar, not the stored instant.
- Date pickers support 13 Ethiopian months, Pagume, leap-year correctness and keyboard navigation.
- Preference should be account-backed in final integration; current local cache is transitional only.
- Amharic-first copy and labels, English parity, localized numerals as an optional accessibility/user preference.

## 7. Synchronization and state

- Calendar data refreshes incrementally using server version/cursor.
- Event updates optimistically lock by version and recover cleanly from conflicts.
- Notifications use the centralized ARNA notification center and unread count; reminder delivery is server-authoritative.
- Event invitation responses, rescheduling, cancellations, task completion and governance decisions update through domain commands and refresh linked calendar projections.
- Offline/read-only cache may show last-sync time, but must not imply writes succeeded offline.

## 8. Design system and accessibility

- Reuse existing ARNA tokens, shared components, app shell, modal/drawer and data table components.
- High information density with calm visual hierarchy; event categories use accessible text/icon labels and never color alone.
- WCAG 2.2 AA contrast, keyboard-operable calendar grid, screen-reader date/event labels, focus management, reduced motion, forced-colors and touch targets.
- Responsive: desktop multi-column, tablet collapsible calendar sidebar, mobile agenda with quick create.
- Provide skeleton, empty, loading, permission-denied, conflict, offline/stale and error states.

## 9. Delivery slices

1. Calendar navigation, global date preference migration to profile API, calendar month/week/day/agenda read views.
2. Event CRUD, attendees, availability, resources, recurrence, invitation response and conflict checks.
3. Task/TODO, plans, budget review, reporting and portfolio/project links.
4. Governance meeting packs: board, committee, management, shareholder GA; agenda, papers, attendance/quorum, voting and decisions via Governance APIs.
5. Notification reminders, communication threads, documents, sync state and analytics/reporting.
6. Mobile polish, accessibility, bilingual visual verification and performance.

## 10. UI acceptance criteria

- Calendar is discoverable through the primary ARNA navigation and works at desktop/tablet/mobile breakpoints.
- All views show the same event data and enforce the same visibility filters.
- E.C. is default; selecting G.C. switches all date labels, not just calendar page, and never shows both.
- Every linked item respects source-domain authorization and opens its canonical domain detail.
- Meeting, voting, decision and quorum UI reflects authoritative Governance responses only.
- Notifications are deduplicated, synchronized and actionable only through authorized internal routes.
- Browser visual checks include Amharic and English, E.C. and G.C., keyboard and screen reader workflows, mobile and desktop.
