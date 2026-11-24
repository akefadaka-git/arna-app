# ARNA UI/UX Enhancement Assessment and Specification

- **Document ID:** ARNA-UIUX-A1-001
- **Version:** 1.0
- **Stage:** A1 — Assessment and Specification
- **Status:** OWNER-APPROVED; A2 READ-ONLY RECONCILIATION AUTHORIZED
- **Approval date:** 2026-11-24
- **Repository:** `akefadaka-git/arna-app`
- **Owner direction:** Improve the existing ARNA design rather than replace it.

## 1. Decision and authorization record

The Owner approves this A1 v1.0 assessment and specification and authorizes A2 read-only repository/browser reconciliation.

The authorization is strictly bounded:

- A2 may inspect repository state, source files, branches, pull requests, workflows, tests, and available browser/runtime evidence.
- A2 must not modify source files, documentation, branches, pull requests, repository settings, CI configuration, databases, or deployments.
- The separate act of recording this approved A1 document is the only repository write authorized by the accompanying Owner instruction. This document is saved on a dedicated documentation branch; it is not committed to `main`.
- No A3 implementation is authorized.
- No merge, deployment, hosting change, or release is authorized.
- Any later implementation requires a separately approved scope and stage gate.

## 2. Executive assessment

ARNA should undergo controlled visual and usability enhancement, not a wholesale redesign. Preserve the approved corporate identity, circular emblem, semantic brand meaning, approved palette, typography direction, Vue/TypeScript architecture, application entry points, component architecture, API contracts, and domain boundaries.

Enhancements should focus on:

- Visual hierarchy, spacing, alignment, and content density.
- Navigation and application-shell usability.
- Responsive behavior across mobile, tablet, and desktop.
- Amharic-first typography and bilingual content fit.
- Light/dark theme completeness and consistency.
- Accessibility and interaction feedback.
- Shared component consistency.
- Operational dashboards and data presentation.

No framework replacement, competing token system, unnecessary component duplication, or unrelated scope expansion is proposed.

## 3. Governing principles

1. Preserve approved ARNA identity and brand semantics.
2. Trust before spectacle; clarity before decoration.
3. Amharic-first and mobile-first.
4. One semantic design system across ARNA application surfaces.
5. Predictable navigation and consistent interaction patterns.
6. WCAG 2.2 AA as a mandatory target.
7. Restrained premium enterprise visual quality.
8. Keep financial, administrative, and data-heavy surfaces visually quiet.
9. Preserve domain ownership and existing API contracts.
10. Never claim an unimplemented or unverified capability is operational.

The Living Path is a conceptual graphic motif, not a claim about an established traditional Maale cultural artifact. Use it selectively and avoid placing it behind dense forms, tables, and financial records.

## 4. Assets and architecture to preserve

| Asset | Treatment |
|---|---|
| ARNA corporate identity and approved circular emblem | Preserve; no replacement |
| Approved brand principle and semantics | Preserve |
| Enterprise blue and approved supporting palette | Preserve; reconcile before runtime adoption |
| Existing typography direction | Preserve and validate |
| Vue/TypeScript architecture and four application entry points | Preserve |
| Existing shared components and domain boundaries | Preserve |
| Existing API contracts and backend authorization | Preserve |
| Existing token/theme architecture | Refine without competing sources |
| Existing AppShell | Targeted improvement, not replacement |

The brand palette in the Brand Identity Master Specification is an approved direction, not proof that every proposed color pairing is a verified runtime token. Contrast-test pairings and reconcile with the frozen token substrate before adoption.

## 5. Application-surface assessment

### 5.1 Enterprise Workspace — P0

Refine the header, sidebar, navigation hierarchy, breadcrumbs, search, notifications, contextual actions, dashboards, tables, forms, and feedback states. Verify mobile navigation, overflow, theme consistency, and representative operational workflows.

### 5.2 Shareholder Portal — P0

Refine shareholder identity/context, shareholding information, balances and statements, notices, meeting information, document access, verification states, and mobile presentation of financial records. Clearly distinguish informational content from actions requiring authorization.

### 5.3 Administration Console — P0

Refine administrative task hierarchy, role/permission visibility, audit context, search/filtering, tables, confirmation flows, destructive actions, exception states, and dense-screen readability. Frontend visibility is never an authorization control; backend authorization remains authoritative.

### 5.4 Public Corporate Website — P1, after shared foundations

Refine corporate identity, homepage hierarchy, profile, business areas, services, announcements, contact/inquiry workflows, bilingual content, accessibility, metadata, and SEO. Do not advertise unavailable services or unverified capabilities.

## 6. Shared design-system requirements

### 6.1 Hierarchy and composition

Use consistent levels for application identity, page title, section headings, primary/secondary actions, main content, supporting information, and status feedback. Avoid unnecessary decoration, excessive borders, competing accents, and inconsistent typography.

### 6.2 Color and themes

Preserve the approved palette hierarchy:

- Enterprise blue: primary corporate anchor.
- Action blue: interaction emphasis.
- Aubergine: restrained brand depth.
- Gold: limited highlights.
- Crimson: distinct from semantic error states.
- Supporting accents: purposeful and subordinate.
- Neutral surfaces: readable working and financial content.

Maintain semantic roles for text, surfaces, borders, focus, selected, success, warning, error, information, disabled, and destructive states. Both light and dark themes must be complete. System preference remains the default under the existing per-origin theme contract. Do not replace frozen runtime tokens without reconciliation and approval.

### 6.3 Typography and localization

Amharic remains the default interface language; English remains supported. Preserve the established Amharic/Latin font-stack direction. Validate actual glyph coverage, weights, numerals, punctuation, line height, wrapping, and realistic Amharic text lengths. Prevent clipping in navigation, buttons, forms, tables, dialogs, and mobile layouts. Preserve the current LTR locale contract unless separately approved.

### 6.4 Component contracts

Define consistent visual/behavioral states for buttons, inputs, selects, cards, tables, data grids, dialogs, alerts, notifications, navigation, forms, status indicators, and loading/empty/error states. Applicable states include default, hover, focus-visible, active, disabled, loading, selected, success, warning, and error.

### 6.5 Responsive validation

Minimum viewport matrix:

| Width | Coverage |
|---:|---|
| 320 px | Small mobile |
| 375–390 px | Common mobile |
| 640 px | Small tablet boundary |
| 768 px | Tablet |
| 1024 px | Desktop boundary |
| 1280 px | Standard desktop |
| 1440 px | Wide desktop |

Check navigation, overflow, tables, forms, dialogs, touch targets, typography, and content hierarchy.

### 6.6 Accessibility

Target WCAG 2.2 AA. Required evidence includes normal text contrast >= 4.5:1, large text >= 3:1, applicable non-text contrast, visible keyboard focus, keyboard operation, accessible names/labels, semantic structure, status messages not relying on color alone, reduced-motion support, and forced-colors behavior. Automated testing alone is insufficient for full acceptance.

## 7. Preserved AppShell contrast-remediation baseline

The separate bounded AppShell contrast remediation remains a preserved baseline:

- Issue #135: https://github.com/akefadaka-git/arna-app/issues/135
- PR #136: https://github.com/akefadaka-git/arna-app/pull/136
- Branch: `accessibility/issue-135-contrast-reproduction`
- Head SHA: `3fcccfce73815ffe8de3eb550c8e709a11581276`
- Main baseline SHA recorded for that work: `ffe0495c0eb7c8b5d2013419123aac5b68893d51`

Six scoped contrast measurements passed and the recorded frontend CI run succeeded on the stated head. Limitations remain: PR #136 is open, draft, and unmerged; the light-theme full-page Axe scan has one violation outside the six in-scope elements; verified browser coverage is Workspace at 1440x960 in English/default state. Portal, Admin, Public Website, other breakpoints, localization, and full focus/hover coverage remain unverified.

Do not reopen or replace this bounded remediation as part of this broader assessment.

## 8. Prioritized enhancement backlog

| Priority | Workstream | Expected outcome |
|---|---|---|
| P0 | Design-system reconciliation | One authoritative token/component contract |
| P0 | Theme completeness | Reliable light/dark behavior |
| P0 | Amharic typography | Readable, unclipped bilingual interfaces |
| P0 | Shared AppShell | Consistent navigation and responsive behavior |
| P0 | Accessibility | Measurable WCAG 2.2 AA evidence |
| P1 | Workspace workflows | Improved operational usability |
| P1 | Shareholder Portal | Clear, legible shareholder information |
| P1 | Administration | Better oversight and task clarity |
| P1 | Data presentation | Consistent tables, dashboards, feedback |
| P2 | Public Website | Improved corporate presentation and public information |
| P2 | Performance and polish | Measured performance and restrained refinement |

Priority is not implementation authorization.

## 9. A2 reconciliation and acceptance plan

A2 is read-only and must:

1. Reconcile the current destination repository, default branch, exact SHA, relevant branches, open PRs, and workflow state.
2. Map the four application surfaces, routes, layouts, and shared component ownership.
3. Inspect current tokens, themes, typography, locale behavior, and component contracts.
4. Verify representative browser/runtime screens at desktop, tablet, and mobile widths where browser evidence is available.
5. Check Amharic and English rendering.
6. Review existing contrast remediation and related UI work without changing their baselines.
7. Produce a file-specific, evidence-backed implementation plan, risks, and unresolved items.

A2 must not modify source files, documentation, branches, PRs, repository settings, CI configuration, databases, or deployment configuration.

Every finding must use one of: VERIFIED, PARTIAL, MISSING, UNRESOLVED, UNKNOWN, or NOT RUN. Every claim must identify its source revision and evidence. Readiness percentages require a pre-weighted checklist, numerator, denominator, coverage, and exclusions. Mandatory blockers remain blockers regardless of aggregate score.

## 10. Stage gates

| Stage | Purpose | Authorization |
|---|---|---|
| A1 | Assessment and specification | OWNER-APPROVED |
| A2 | Read-only repository/browser reconciliation | AUTHORIZED |
| A3 | Targeted implementation | NOT AUTHORIZED |
| A4 | Visual, accessibility, and regression verification | PENDING |
| A5 | Merge/deployment/release | SEPARATE EXPLICIT AUTHORIZATION REQUIRED |

A2 completion does not authorize A3. A3 approval does not authorize merge. A4 acceptance does not authorize deployment.

## 11. Exclusions

This document does not authorize wholesale redesign, framework migration, backend/database restructuring, authentication or authorization contract changes, new business functionality, unapproved token changes, unrelated branch/file changes, merge, deployment, hosting changes, or release.

## 12. A1 closure

**A1 v1.0: OWNER-APPROVED.**

**A2: READ-ONLY RECONCILIATION AUTHORIZED.**

**A3: NOT AUTHORIZED.**

**Merge/deployment: NOT AUTHORIZED.**

The next deliverable is an A2 read-only reconciliation report with exact repository/branch/PR evidence, source-file inventory, browser evidence and limitations, prioritized findings, and the exact scope recommended for a later Owner decision.
