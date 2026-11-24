# ARNA Enterprise Calendar — App Experience Specification v1.0

**Status:** A1 proposal  
**Experience:** Amharic-first, E.C.-first, mobile-first  
**Backend:** ARNA Calendar Core API; domain records remain authoritative

## 1. Information architecture

Workspace navigation: Calendar, My Schedule, Team Schedules, Meetings, Action Items, Resources, Reports. Calendar is the unified time-oriented workspace.

Views: Month, Week, Day, Agenda, Timeline. Agenda is the mobile default; desktop may default to Week. Date picker and all date labels use exactly one calendar: E.C. default; G.C. optional user preference. Show timezone explicitly where relevant; default Africa/Addis_Ababa.

## 2. Calendar workspace

Header: page title, selected date, previous/next/today, view switcher, filters, create action.

Left rail: My Calendar, Shared, Teams, Governance, Projects/Portfolio, Reports, Rooms/Resources; only show authorized collections.

Main canvas: responsive month grid/time grid, all-day row, event chips, status and conflict labels. Never rely on color alone.

Detail panel: summary, source domain, organizer, attendees/RSVP, location, agenda, linked documents, action items, budget/portfolio/report references, communication, audit and notification state.

## 3. Typed create/edit flows

One entry point branches into Event/Appointment, Board/Committee/Management/Shareholders' GA meeting, Task/Action, Project Milestone/Portfolio Review, Report Schedule/Review, and Resource Reservation.

Show only type-relevant fields. Validate dates, timezone, recurrence, visibility, attendees, resource collisions, and linked-domain permissions. Support drafts where policy requires. Display conflicts and alternatives; require explicit confirmation for rescheduling.

## 4. Governance meeting workspace

Meeting detail includes body/type, organizer/authorized secretary, notice deadline and publication state, agenda items and owners, supporting pack, eligible membership/appointment snapshot, attendance/quorum status, voting windows and charter-governed rules, certified decisions/resolutions, minutes, and accountable actions.

Never imply quorum or binding approval until the backend governing-policy evaluation is verified. Missing/unknown policy is visibly not approved.

## 5. Cross-domain panels

- Tasks: assigned to me, due/overdue, dependencies, checklist, status.
- Budget: planned/approved/committed/actual references, variance and approval status. Finance remains authoritative.
- Portfolio: programmes/projects, milestones, owner, status, risks, dependencies, next review.
- Reports: period, due date, owner, generation state, evidence link.
- Communication: invitations, agenda distribution, updates, minutes publication, follow-up.
- Documents: agenda pack, attachments, minutes, resolutions, version state.
- Notifications: invitation, RSVP, reminder, reschedule, cancellation, assignment, deadline, voting open/close, certified decision; links are server-authorized internal resources.

## 6. Accessibility and resilience

Responsive touch targets, keyboard navigation, visible focus, screen-reader event summaries, non-color status, contrast and reduced motion. Detail uses drawer on wide screens and full-screen sheet on mobile. Distinguish loading, offline, stale, denied, conflict, and retry states. Bulk actions show selection count and confirmation.

## 7. Synchronization

Read calendar projections from Calendar Core API and follow source links to authoritative records. Optimistic writes use server versions; conflicts trigger reconciliation. Notifications derive from committed server outbox events, not client-only timers. Display delivery state and never claim sent without server confirmation. Calendar does not grant permissions to linked resources.

## 8. Progressive delivery

1. Calendar page, personal/team calendars, event detail and CRUD.
2. Scheduling, recurrence, resources, RSVP, reminders.
3. Governance meetings, agenda, attendance, quorum, voting and resolutions.
4. Tasks/actions, portfolio milestones, budget/report references, documents and communication.
5. Dashboard, analytics, exports, optional external calendar connectors.
