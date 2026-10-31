# ARNA UI/UX Enhancement Master Strategy

**Version:** 1.2  
**Status:** Owner-approved strategy; Phase 0 closed with recorded limitations  
**Date:** 31 October 2026  
**Programme:** ARNA UI/UX Enhancement Programme  
**Owner authority:** Owner retains control of scope, architecture, approvals, risk acceptance, changes, merges and releases.

> **PROGRAMME STATUS:** STRATEGY APPROVED • PHASE 0 CLOSED WITH RECORDED LIMITATIONS  
> **PHASE 1 IMPLEMENTATION: NOT YET AUTHORIZED**

## Document control

| Field | Value |
|---|---|
| Document | Master Strategy, Phased Implementation Plan, Acceptance Criteria and Reporting System |
| Version | 1.2 |
| Status | Approved by Owner; implementation not authorized beyond Phase 0 read-only assessment |
| Repositories | `akefadaka-git/arna-app`; `akefadaka-git/arna-api` (API context only for this UI programme) |

## 1. Executive summary

This document establishes the approved ARNA UI/UX Enhancement Master Strategy v1.2. The programme improves the existing Vue/TypeScript frontend rather than replacing it. It covers the public corporate website, enterprise workspace, shareholder portal, administrative console, shared design system and domain-specific experiences.

The visual direction is premium enterprise quality combined with the approved ARNA brand identity. The programme is Amharic-first and mobile-first, supports complete light and dark themes, and follows the operating-system theme preference by default.

Execution is strictly phased. Each phase must satisfy its completion criteria and pass its approval gate before dependent work begins. The strategy is approved. Phase 0 has been administratively closed as a read-only source-baseline assessment with limitations explicitly recorded. Runtime visual inspection, a measured WCAG 2.2 AA audit and a comprehensive visual-regression baseline were not run and must not be represented as verified.

## 2. Owner decisions and non-negotiable controls

- Preserve the approved ARNA/MASES Brand Identity Master Specification v1.0, emblem and approved semantic brand meaning.
- Preserve existing domain boundaries, application entry points, API contracts and unrelated work.
- Do not perform an unnecessary framework replacement or frontend rewrite.
- Do not duplicate domain business logic or create competing sources of truth.
- Backend authorization remains authoritative; frontend visibility is not a security control.
- No database operation, backend restructuring, merge, deployment or release without separate explicit authorization.
- Preserve unrelated branches, commits, files and local working changes.
- No phase completion claim without exact, inspectable evidence.

## 3. Programme scope and target experience

| Experience | Enhancement scope |
|---|---|
| Public corporate website | Corporate identity, company profile, business areas, services, announcements, contact/inquiries, public information, bilingual content, SEO and accessibility. |
| Enterprise workspace | Application shell, navigation, search, notifications, dashboards and domain workflows. |
| Shareholder portal | Consistent identity, responsive access, shareholder-specific workflows and shared components. |
| Administrative console | Administration, moderation, configuration, oversight and audit-oriented interfaces. |
| Shared design system | Tokens, typography, themes, reusable components, accessibility and usage documentation. |
| Domain experiences | People, Organization, Governance, Documents/File Management, Finance, Shareholder, Loan/Wallet, Procurement, Communication, Calendar and Reporting. |

**Approved programme controls**

| Control | Approved decision |
|---|---|
| Scope | All ARNA frontend experiences: public, workspace, portal and admin |
| First priority | Design System 2.0 foundation |
| Visual direction | Hybrid premium enterprise + approved ARNA identity |
| Responsive | Mobile-first |
| Theme behavior | Complete light and dark themes; follow system preference by default |
| Programme execution | Strictly phased; no dependent phase starts before prior phase acceptance |
| Public website | Included in programme; scheduled after shared foundations |
| Delivery | Quality-gated |
| Release policy | Explicit Owner approval at every gate |
| Initial implementation boundary | Phase 1 Design System 2.0 only, after separate authorization |

## 4. Phased implementation roadmap

**Planning estimate:** approximately 22–32 weeks after the baseline. This is an estimate, not a commitment. The strict sequential rule applies: a phase cannot begin until the preceding phase has passed its gate.

### Phase 0 — Baseline and architecture assessment

**Planning estimate:** 1–2 weeks

- Read-only inspection of destination repositories, default branches, relevant branches and PR inventory.
- Inventory routes, layouts, components, design tokens, themes and domain ownership.
- Review existing builds, CI workflows, tests, localization and responsive/accessibility source coverage.
- Establish exact baseline SHAs, evidence links, risks, defects and a prioritized backlog.

**Deliverables:** Repository/branch baseline, architecture map, UI inventory, evidence register, risk register and prioritized backlog.

**Completion criteria:** Owner accepts the read-only baseline and authorizes the Phase 1 specification. Any unperformed runtime audit remains explicitly NOT RUN.

### Phase 1 — ARNA Design System 2.0 foundation

**Planning estimate:** 3–4 weeks

- Preserve approved brand palette, emblem and brand semantics.
- Define primitive, semantic and component-level tokens for color, typography, spacing, sizing, borders, radii, elevation and motion.
- Implement complete light and dark semantic themes; initialize from operating-system preference.
- Define Amharic and English typography, wrapping, font fallback and layout behavior.
- Build and document reusable buttons, inputs, selects, cards, tables, dialogs, alerts, status and navigation primitives.
- Specify focus, hover, active, disabled, loading, success, warning and error states.

**Deliverables:** Token specification, theme implementation, base component library, documentation and representative demonstrations.

**Completion criteria:** Approved brand preserved; light/dark tokens complete; system preference works; bilingual rendering verified; representative components pass accessibility and regression checks.

### Phase 2 — Enterprise application shell

**Planning estimate:** 2–3 weeks

- Responsive navigation, sidebar, header, breadcrumbs and contextual actions.
- Organization/tenant context controls only where supported by existing contracts.
- Global search, command palette, notification center, language and account controls.
- Mobile navigation and consistent loading, empty, error and permission-denied states.

**Deliverables:** Shared shell implementation and route-by-route integration evidence.

**Completion criteria:** Applicable workspace/admin entry points use the shared shell; existing routes and authorization behavior remain intact; mobile navigation is verified.

### Phase 3 — Shared enterprise components

**Planning estimate:** 3–4 weeks

- Advanced data grids with sorting, filtering and pagination.
- Reusable forms, validation and workflow/approval interfaces.
- Audit timelines, document previews and attachment components.
- Search/filter panels, dashboard widgets, charts and standardized feedback states.

**Deliverables:** Reusable component library, usage guidance and adoption evidence from representative domains.

**Completion criteria:** Components are adopted without duplicated business logic; keyboard, responsive, theme and API-contract behavior verified.

### Phase 4 — Domain-by-domain enhancement

**Planning estimate:** 6–9 weeks

- Enhance People and Organization.
- Enhance Governance.
- Enhance Documents and File Management.
- Enhance Finance and Accounting.
- Enhance Shareholder and Loan/Wallet.
- Enhance Procurement, Communication Hub, Calendar and Reporting.

**Deliverables:** Per-domain UI specifications, changed-file maps, workflow evidence and integration reports.

**Completion criteria:** Each domain passes its own workflow, authorization, API integration, localization, responsive and regression criteria; domain boundaries remain intact.

### Phase 5 — Operational dashboards and reporting

**Planning estimate:** 2–3 weeks

- Executive, employee/member, finance, operations, governance and administration dashboards.
- Tasks, approvals and exception center.
- Configurable widgets, reporting and data visualizations.

**Deliverables:** Dashboard specifications, metric dictionary, data provenance and UI verification.

**Completion criteria:** All displayed metrics have defined calculations and authorized backend sources; values, permissions, refresh behavior and responsive presentation are verified.

### Phase 6 — Public corporate website enhancement

**Planning estimate:** 3–4 weeks

- Corporate homepage, profile, business areas and services.
- Announcements/news, shareholder/public information and contact/inquiry workflows.
- Public document verification where supported by existing contracts.
- Amharic/English content, SEO, accessibility and performance.

**Deliverables:** Public-site content map, page inventory, publishing workflow and release evidence.

**Completion criteria:** All approved public routes and forms work; shared design system is used; bilingual, responsive, SEO, performance and accessibility checks pass.

### Phase 7 — Final quality and release acceptance

**Planning estimate:** 2–3 weeks

- Desktop, tablet and mobile verification.
- Amharic/English and light/dark matrix.
- WCAG 2.2 AA evaluation, visual regression and browser compatibility.
- Performance, API integration and authorization checks.
- Exact-commit CI and final readiness report.

**Deliverables:** Release-candidate evidence pack, defect register, rollback/release plan and final acceptance report.

**Completion criteria:** No unresolved critical/high defects; all required workflows and quality evidence pass; Owner explicitly accepts release and separately authorizes deployment.

## 5. Dependencies and sequencing

The programme uses strict sequential execution. Public website work is not started in parallel under this approved execution model. It follows the shared design system, shell, shared components, domain work and dashboards as listed in the approved roadmap. A change to this sequence requires an Owner-approved revision.

1. Phase 0 establishes the actual source baseline and confirms the design-system specification inputs.
2. Phase 1 establishes shared tokens, themes and primitives required by every later experience.
3. Phase 2 applies the foundation to the application shell.
4. Phase 3 establishes reusable operational components before domain-wide adoption.
5. Phase 4 enhances domain workflows without moving domain business rules into shared UI.
6. Phase 5 depends on verified domain data contracts and metric definitions.
7. Phase 6 uses the approved shared design system and interaction standards.
8. Phase 7 validates the integrated release candidate across all experiences.

## 6. Design System 2.0 completion criteria

| Area | Required acceptance evidence |
|---|---|
| Brand | Approved ARNA palette, emblem and semantics preserved; token mapping documented; no unapproved brand drift. |
| Theme | Complete light and dark semantic mappings; follows OS preference by default; no incomplete component surfaces or hardcoded color exceptions. |
| Localization | Amharic and English verified for realistic text lengths, typography, wrapping, labels, navigation and forms. |
| Components | Documented default, hover, focus, active, disabled, loading, error and applicable selected states. |
| Accessibility | Keyboard operation, visible focus, semantic structure, accessible names and contrast checked in both themes. |
| Regression | Representative existing screens retain expected behavior; build/type-check and required component tests pass on exact head. |
| Documentation | Token reference, theme usage, component guidance and migration/compatibility notes available. |

## 7. Quality targets and measurement

Targets are not current scores. Every score must have a defined rubric, scope, sample and evidence. A high aggregate score cannot compensate for a failed mandatory criterion.

| Dimension | Target | Measurement method |
|---|---:|---|
| Visual consistency | 9.5/10 | Rubric-based review of representative screens and token/component conformance. |
| Usability | 9/10 | Task-based workflow review and documented usability findings. |
| Amharic/English localization | 9.5/10 | Bilingual screen matrix, typography and content-fit checks. |
| Responsive experience | 9/10 | Representative mobile/tablet/desktop viewport and interaction tests. |
| Accessibility | WCAG 2.2 AA | Automated checks plus documented manual keyboard, semantics and contrast review. |
| Component reuse | 9/10 | Shared-component adoption and duplication review. |
| Maintainability | 9/10 | Architecture, ownership, complexity and regression review. |
| Performance | 9/10 | Defined performance budgets and measured build/runtime results. |
| Cross-domain consistency | 9.5/10 | Representative domain screen comparison and interaction consistency review. |

## 8. Owner approval gates

| Gate | Required evidence | Owner decision |
|---|---|---|
| A0 — Strategy | Approved scope, phases, constraints, quality targets and controls. | Approve strategy. |
| A1 — Specification | Architecture map, token/theme/component specifications, UX flows and acceptance plan. | Approve design specification. |
| A2 — Read-only validation | Exact source baseline, branches, dependencies, risks and implementation impact. | Authorize specific implementation scope. |
| A3 — Implementation | Changed-file inventory, exact commits, design evidence, boundary impact and implementation report. | Review implementation. |
| A4 — Verification | Exact-head CI, tests, screenshots, responsive/theme/accessibility/regression evidence and defects. | Accept or reject. |
| A5 — Release | Release plan, rollback approach, exact artifact/commit and deployment evidence. | Separately authorize release/deployment. |

Gate passage is not blanket authorization. A3 implementation approval is not merge approval. A4 verification is not deployment approval. A5 requires explicit release authorization.

## 9. Reporting system

A single evidence-backed phase report is required at each gate. It must be concise enough for decision-making and detailed enough to reproduce or independently inspect the result. Every report must include:

- Phase name, objective, scope authorized and scope actually completed.
- Destination repository, branch, exact base SHA and exact head SHA.
- PR links and workflow run links, including run conclusion and tested SHA.
- Changed-file inventory and component/domain ownership impact.
- Build, type-check, unit, integration, browser and accessibility results as applicable.
- Visual evidence for representative desktop, tablet, mobile, language and theme combinations.
- Defect register with severity, reproduction steps, owner and resolution status.
- Explicit statuses: VERIFIED, PARTIAL, MISSING, UNRESOLVED, UNKNOWN and NOT RUN.
- Readiness percentage with formula, denominator, evidence and exclusions.
- Risk/decision log, scope deviations and unresolved dependencies.
- One recommended next step and the exact Owner decision required.

### 9.1 Standard status definitions

| Status | Meaning |
|---|---|
| VERIFIED | Direct evidence confirms the criterion on the stated source revision. |
| PARTIAL | Some evidence exists, but coverage or acceptance is incomplete. |
| MISSING | Required artifact, implementation or evidence does not exist in the inspected scope. |
| UNRESOLVED | A known issue or conflict remains open. |
| UNKNOWN | Available evidence is insufficient to determine the state. |
| NOT RUN | The check was not executed; no pass/fail conclusion is implied. |

### 9.2 Readiness calculation

Readiness must be calculated from a phase-specific checklist. Each criterion is assigned a weight before verification. VERIFIED receives full weight; PARTIAL receives only the explicitly justified fraction; MISSING, UNRESOLVED, UNKNOWN and NOT RUN receive zero verified credit. Report the numerator, denominator, coverage and excluded criteria. Mandatory blockers remain blockers regardless of the percentage.

## 10. Phase 0 closure record

**Decision:** Phase 0 is closed administratively as a read-only source-baseline assessment, with limitations explicitly carried forward. This closure does not assert that every proposed Phase 0 verification activity was performed. It closes the source-inventory portion and records outstanding runtime evidence as NOT RUN.

**Phase 0 closure classification: CLOSED WITH LIMITATIONS.** The previously reported 80% assessment-coverage estimate is directional, not a formal readiness score. No 100% baseline or full visual/accessibility sign-off is claimed. The outstanding evidence must be incorporated into the Phase 1 specification and its acceptance plan, or explicitly rescheduled through an Owner-approved change.

**Additional governance observation:** the repositories reported public visibility and branch metadata did not show protected branches during the read-only inspection. These are observations only; no settings were changed. Owner confirmation of intended visibility and branch-protection policy is recommended as a separate governance decision.

### 10.1 Phase 0 evidence register

| Item | Recorded result |
|---|---|
| Destination repositories | VERIFIED — akefadaka-git/arna-app and akefadaka-git/arna-api inspected. |
| App main SHA | `856fefb8efde257ece484bd6b66690d899d0468c` |
| API main SHA | `3ea51d000b9cfbac989bab5dd4042d5235f0a3ac` |
| Branch/PR inventory | VERIFIED — App: 8 branches / 4 open PRs; API: 38 branches / 27 open PRs at assessment time. |
| Frontend structure | VERIFIED — 358 tracked tree entries, 160 Vue files, 65 shared component Vue files; inventory counts are source-tree counts. |
| Design system and brand source | VERIFIED — tiered tokens and approved brand specification found. |
| Theme gap | VERIFIED — token specification defers dark mode; base stylesheet declares light color scheme. |
| Localization source | VERIFIED — centralized locale store supports Amharic/English; both are configured LTR. |
| CI evidence | VERIFIED — App main frontend workflow run #41033230479 succeeded for stated main SHA. |
| Runtime visual inspection | NOT RUN. |
| Workspace/admin browser verification | NOT RUN. |
| Measured WCAG 2.2 AA audit | NOT RUN. |
| Comprehensive visual-regression baseline | MISSING. |
| Repository mutations during Phase 0 | NONE — no files, branches, PRs, settings, database or deployments changed. |

## 11. Current authorization boundary

The next decision is to review and approve the Phase 1 Design System 2.0 specification. Only after that separate approval may implementation begin, and only within the explicitly authorized scope.

| Activity | Authorization status |
|---|---|
| Phase 0 read-only source assessment | Authorized; closed with limitations as documented. |
| Phase 1 specification preparation | May be prepared for review; no code changes. |
| Phase 1 implementation | **NOT AUTHORIZED** — requires separate explicit Owner approval. |
| Application shell/domain/public-site implementation | **NOT AUTHORIZED.** |
| Branch creation, PR modification or merge for implementation | **NOT AUTHORIZED.** |
| Database/backend operations | **NOT AUTHORIZED.** |
| Deployment or release | **NOT AUTHORIZED.** |

## 12. Reference links

- ARNA App repository: https://github.com/akefadaka-git/arna-app
- ARNA API repository: https://github.com/akefadaka-git/arna-api
- App main at assessed SHA: https://github.com/akefadaka-git/arna-app/tree/856fefb8efde257ece484bd6b66690d899d0468c
- API main at assessed SHA: https://github.com/akefadaka-git/arna-api/tree/3ea51d000b9cfbac989bab5dd4042d5235f0a3ac
- App frontend workflow run #41033230479: https://github.com/akefadaka-git/arna-app/actions/runs/41033230479
- Brand Identity Master Specification v1.0: https://github.com/akefadaka-git/arna-app/blob/856fefb8efde257ece484bd6b66690d899d0468c/docs/BRAND_IDENTITY_MASTER_SPEC_V1.0.md
- People UI PR #5: https://github.com/akefadaka-git/arna-app/pull/5
- Organization UI PR #6: https://github.com/akefadaka-git/arna-app/pull/6
- Governance UI PR #7: https://github.com/akefadaka-git/arna-app/pull/7
- Public corporate foundation PR #9: https://github.com/akefadaka-git/arna-app/pull/9
- Admin moderation PR #10: https://github.com/akefadaka-git/arna-app/pull/10

---

**END OF APPROVED STRATEGY v1.2**
