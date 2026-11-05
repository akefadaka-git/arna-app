# ARNA General Assembly Workspace — App A3 Contract

- Document ID: ARNA-GOV-GA-APP-A3-001
- Version: 1.0.0
- Status: Implementation contract; code changes not yet represented by this document
- Controlling requirements: API `ARNA-GOV-GA-A1-001` and `ARNA-GOV-GA-A2-A3-001`
- App baseline inspected: `main` at `76fb67a421b1a54e0529a3479e551a1d1e0c0d0f`
- Existing attendance workspace: merged PR #32, merge commit `fc6ff8c230d2aaa6dd371ba2f69b4fa1f2944558`
- Meeting UI reference: PR #7 (open/unmerged at inspection)
- Calendar UI reference: PR #27 (open/unmerged at inspection)

## 1. Objective

Deliver a unified Amharic-first, mobile-first GA workspace integrated with the authoritative Governance API and ARNA Calendar. Preserve the current attendance and settlement screens as reusable functionality. Do not import the stale meeting UI branch wholesale.

## 2. Workspace information architecture

1. GA dashboard: upcoming meetings, status, pending approvals, deadlines and decision actions.
2. Meeting register: ordinary/extraordinary GA, lifecycle, authority and schedule.
3. Meeting detail: overview, participants, notice compliance, agenda, quorum, proceedings, votes, resolutions and minutes.
4. Electorate: record date, eligible shareholders, voting rights and frozen snapshot.
5. Attendance: registration, channel, identity verification, arrival/departure and corrections.
6. Proxy desk: submission, evidence, review, expiry, revocation and represented entitlement.
7. Live session: chair controls, agenda timer, recess/suspension/adjournment and audit events.
8. Quorum and voting: rule source/version, eligibility, calculation trace, vote session and certified tally.
9. Resolutions: exact text, approval evidence, effective date and execution owner.
10. Penalties: candidates, independent review, appeal and Finance settlement.
11. Notices and documents: approved notice, recipients, service evidence, proxy documents and minutes.
12. Calendar: linked meeting event, schedule display, reminders and synchronization state.
13. Minutes and actions: approval, corrections, action owner, due date, evidence and closure.
14. Audit: attributable event history and exportable evidence.

## 3. Calendar UX contract

The GA meeting date is a first-class Calendar event, not merely a date displayed in a Governance form.

- Show a Calendar link on every scheduled meeting.
- Show the meeting in Month, Week, Day and Agenda views.
- Open the corresponding GA meeting from the event.
- Display Ethiopian Calendar dates by default; Gregorian dates are available through user preference.
- Use `Africa/Addis_Ababa` for meeting-local schedule display.
- Show event synchronization state to authorized operators.
- Prevent editing schedule fields in Calendar unless the user has Governance meeting-edit permission and the change is submitted through the Governance API.
- Distinguish official notice deadlines from Calendar reminders.
- Show cancelled/adjourned state without erasing the meeting's history.
- Avoid duplicate event cards when API retries or a user refreshes.

## 4. Interaction and accessibility

- Amharic-first labels and date presentation; English may be selected.
- Responsive layouts for mobile, tablet and desktop.
- Keyboard-operable forms, dialogs and tables.
- Clear loading, empty, error, permission-denied and stale-data states.
- Destructive or consequential actions require confirmation and display the authority context.
- Never imply that a quorum, vote, penalty or resolution is valid merely because the UI accepted input.
- Show blocked states when an approved legal rule is missing.
- Preserve unsaved form state safely and prevent duplicate submissions.

## 5. Role-sensitive actions

The UI must derive available actions from server-side permissions. Hiding a button is not authorization.

- Convening authority: submit meeting for approval and authorize convening as permitted.
- Chair: control proceedings and authorized time adjustments.
- Secretary: prepare and submit minutes.
- Registration officer: record attendance and corrections.
- Proxy reviewer: review proxy evidence.
- Vote counter: record/reconcile vote results.
- Legal/governance reviewer: review source rules and disputes.
- Finance reviewer: process only approved financial consequences.
- Shareholder: view permitted meeting information and submit permitted documents.
- System administrator: technical configuration only, not corporate decisions.

## 6. API dependency order

The App must not depend on endpoints that exist only in unmerged branches. Implement in this order:
1. Current-main attendance API compatibility.
2. Canonical meeting lifecycle and authorization API.
3. Electorate snapshots and proxy lifecycle.
4. Versioned quorum evaluation and agenda.
5. Motions, voting and resolution certification.
6. Penalty review and Finance settlement gate.
7. Calendar event link, event detail and sync status.
8. Notices, delivery evidence, minutes and action execution.

Use typed API contracts and explicit response/error states. Do not create local calculations for legally consequential quorum or vote results.

## 7. A3 UI acceptance

- No broken routes or duplicate meeting workspaces.
- No UI calls to unmerged-only endpoints.
- Every meeting date links to the same authoritative Calendar event.
- Date/time/venue changes use Governance authorization.
- E.C.-first display and G.C. preference work consistently.
- Blocked legal rules are visible and cannot be bypassed from the client.
- All role restrictions are enforced by API and reflected in UI.
- Proxy, attendance, quorum and vote states are distinguishable.
- Penalty candidates are not presented as payable debts before approval.
- Notices, reminders and legal service evidence are clearly differentiated.
- Mobile and keyboard acceptance passes.

## 8. Non-goals and safety

This contract does not authorize electronic voting, remote attendance as legally valid participation, automatic dividend deductions, inferred quorum, or legal notice service by Calendar. Those remain subject to A1 source authority gates.

This document is an implementation contract only. It does not claim code implementation, test execution, deployment or production readiness.
