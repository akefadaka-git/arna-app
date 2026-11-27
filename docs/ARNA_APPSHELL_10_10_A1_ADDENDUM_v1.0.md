# ARNA AppShell 10/10 Quality Addendum v1.0

- **Document ID:** ARNA-APPSHELL-A1-ADD-001
- **Programme:** ARNA UI/UX Enhancement
- **Stage:** A1 — quality addendum
- **Status:** OWNER-APPROVED; FROZEN
- **Approval:** Owner approval received in ChatGPT on 2026-11-26
- **Repository:** `akefadaka-git/arna-app`
- **Baseline:** `main` at `f694eb13ba822440c6842cb135a66f89218bc454`
- **Scope:** AppShell and directly supporting shared shell components, styles, localization/calendar context and verification.
- **Authority:** This addendum supplements the existing Owner-approved ARNA brand and UI/UX direction. It does not replace or silently amend the corporate brand specification, backend/API contracts, security policies or other domain architecture.

## 1. Owner decision

The Owner approves a 10/10 target quality standard for the ARNA AppShell and authorizes the bounded A3 implementation programme described in the companion A3 plan, subject to the existing stage gates.

The target is an evidence-based acceptance objective, not a claim that a software interface can be objectively perfect in every context. A 10/10 rating may be assigned only after every mandatory acceptance criterion is satisfied, independent review is complete, and evidence is tied to the exact candidate commit. Any unverified dimension remains NOT VERIFIED and cannot be awarded 10/10.

## 2. Governing principles

1. Preserve the existing AppShell architecture and compatible public component contracts; improve by bounded refactoring, not wholesale replacement.
2. Preserve the approved ARNA identity, emblem, palette intent and brand narrative.
3. Amharic-first and mobile-first experience; English remains complete and selectable.
4. Ethiopian calendar (E.C.) is the default presentation; Gregorian (G.C.) remains available. Machine-readable dates remain ISO Gregorian.
5. Accessibility is a release criterion, not optional polish.
6. No presentation-layer authorization. Backend authorization and tenant isolation remain authoritative.
7. Preserve unrelated repository work, branches, commits and pull requests.
8. No main-branch modification, merge or deployment as part of this authorization.
9. No new paid service or dependency unless separately justified and approved.
10. A5 deployment remains a separate stage and requires separate Owner approval.

## 3. Scope

Included:
- Workspace, Shareholder Portal and Admin authenticated shell surfaces.
- Header, navigation, sidebar, mobile drawer, skip link, footer, brand, tenant switcher, user menu, notification entry points and theme/language/calendar controls.
- Shared shell tokens and themes, only where directly necessary.
- Shell localization and calendar context.
- Directly related automated tests, fixtures and frontend CI registration.

Excluded:
- Backend/API redesign, database migrations and seeders.
- Authentication/SSO, RBAC policy and tenant-isolation redesign.
- Domain workflow redesign or unrelated feature work.
- Corporate emblem replacement or unapproved brand redesign.
- Public-site redesign except where a shared component contract requires compatibility.
- Production hosting, deployment, merge and A5 activities.

## 4. Quality dimensions and acceptance targets

| Dimension | Required evidence and acceptance |
|---|---|
| Architecture | Clear component ownership, stable contracts, no duplicated state authority, no unnecessary rewrite |
| Visual design | Approved ARNA identity, coherent hierarchy, responsive composition, consistent states and visual regression review |
| Accessibility | WCAG 2.2 AA audit combining automated checks and manual keyboard/screen-reader review |
| Contrast | Applicable text and non-text contrast thresholds pass on rendered, composited colors in all supported themes |
| Localization | Complete Amharic and English shell labels; no untranslated navigation/search fallback |
| Calendar | Correct E.C.-first default, G.C. alternative, ISO machine values and explicit timezone policy |
| Responsive behavior | No loss of essential content or functionality across agreed viewport matrix and zoom/reflow checks |
| Interaction | Keyboard, focus, dialogs, drawers, search, notification and tenant-switch interactions work predictably |
| Theme | System, Light and Dark preference behavior, persistence and failure handling verified |
| Security boundaries | No weakening of server authorization, tenant scoping or data access boundaries |
| Performance | Core Web Vitals targets: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 under a documented test protocol |
| Maintainability | Semantic tokens, focused components/composables, current documentation and controlled compatibility |
| Verification | CI and browser evidence tied to exact candidate SHA; no unresolved mandatory tests |

## 5. Required rendering and interaction matrix

Core rendering matrix:
- Surfaces: Workspace, Portal, Admin.
- Languages: Amharic, English.
- Explicit themes: Light, Dark.
- Viewports: 320, 360, 390, 768, 1024, 1280 and 1440 CSS pixels.
- Total: 84 core rendering combinations.

Additional checks:
- System theme following and operating-system theme changes.
- 200% and 400% zoom/reflow.
- Keyboard-only operation and visible focus.
- Screen-reader review of landmarks, names, states and announcements.
- Mobile drawer open/close, Escape, focus entry/restoration and scroll locking.
- Search shortcut behavior in editable contexts.
- Notification panel state and keyboard behavior.
- Long Amharic/English labels, names and mixed-script content.
- Calendar date correctness, year boundaries and timezone behavior.
- Storage unavailable and preference persistence failure cases.
- Browser console/runtime errors and horizontal overflow.

## 6. Defect severity and release policy

- **P0 Critical:** security, tenant isolation, data integrity or fundamental application failure. Must be resolved before acceptance.
- **P1 High:** core accessibility, localization, calendar, interaction or acceptance failure. Must be resolved before A4 closure.
- **P2 Medium:** architectural, usability, maintainability or consistency weakness. Must be resolved or explicitly accepted with rationale.
- **P3 Low:** polish/documentation/optimization. Must be resolved or explicitly dispositioned.
- **INFO:** accepted decision or verification limitation.

No P0/P1 defects may remain open at A4 acceptance. P2/P3 items require explicit closure or documented Owner-approved deferral. No dimension may be rated 10/10 without evidence.

## 7. Governance and stage gates

- A1: this addendum is Owner-approved and frozen.
- A2: read-only reconciliation is closed against the recorded baseline. If material authoritative evidence contradicts the baseline, reopen only the affected finding.
- A3: implementation is authorized on a dedicated branch. No main modification, merge or deployment.
- A4: exact-head tests, browser evidence, accessibility review, performance evidence, defect disposition and independent review.
- A5: deployment is separate and requires separate Owner approval.

## 8. Approval record

Owner approval was explicitly provided on 2026-11-26 in response to the recommendation approving the AppShell 10/10 quality addendum and bounded A3 implementation scope. This record preserves that approval; it does not assert an external digital signature.

