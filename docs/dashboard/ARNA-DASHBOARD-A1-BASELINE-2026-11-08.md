# ARNA Dashboard Enhancement — A1 Baseline, Widget Register and Phased Plan

**Assessment date:** 2026-11-08  
**Assessment type:** A1 read-only baseline and specification  
**Status:** Draft for Owner review; no implementation or release authorization implied  
**Repositories:** `akefadaka-git/arna-app`, `akefadaka-git/arna-api`

## 1. Executive finding

The current Workspace `/dashboard` is a permission-filtered feature launcher, not an executive/business intelligence dashboard. At the assessed App main SHA it contains a static catalogue of six feature tiles (Loans, Loan Products, Shareholders, Share Classes, Wallets, Files), rendered as internal RouterLinks after frontend permission checks. It does not present enterprise KPIs, financial summaries, organizational indicators, cross-domain trends, operational exceptions, or management analytics.

The Admin application's `/admin` landing page is explicitly documented as a static welcome panel with no fetch, state, metrics, or fabricated statistics. This is an intentional earlier architecture decision, not a defect to bypass.

**A1 conclusion:** retain the existing dashboard route and architecture, but specify a separate, data-backed Executive Command Center experience. Do not replace the feature launcher with fake metrics or duplicate domain logic. Dashboard metrics must be served by authoritative, tenant-scoped API/domain services and must drill down to authorized source records.

## 2. Exact repository baseline

| Repository | Ref | Exact SHA | Evidence |
|---|---|---|---|
| arna-app | main | `76fb67a421b1a54e0529a3479e551a1d1e0c0d0f` | GitHub main ref read on 2026-11-08 |
| arna-api | main | `ff290b353f1290cc91534fd4d694544e83c58d82` | GitHub main ref read on 2026-11-08 |

The two repositories are independent histories. These SHAs are the assessment baseline only; they are not a claim of cross-repository release compatibility.

### 2.1 App source inventory

- `src/features/dashboard/DashboardView.vue`: single feature-tile view.
- `src/features/dashboard/labels.ts`: translated tile labels.
- `src/layouts/AppShell/*`: shared header, sidebar, mobile drawer, launcher, tenant switcher, notifications bell, user menu, language and calendar controls.
- `src/router/pages/AdminDashboardRoute.vue`: static admin welcome panel; source documentation explicitly rejects fake statistics.
- `tests/workspace-dashboard-route-contract.test.mjs`: route registration contract.
- `tests/app-shell-responsive-contract.test.mjs`: responsive shell contract.
- `tests/design-system-theme-contract.test.mjs`: design-system theme contract.
- `docs/ARNA_DESIGN_SYSTEM_2.0_IMPLEMENTATION_GUIDE.md`: tokens, theme behavior, bilingual typography and accessibility contracts.
- `docs/ARNA_APP_SHELL_SERVICE_INTEGRATION_CONTRACT_v1.0.md`: notification/search integration gates and data-handling rules.

### 2.2 Dashboard implementation facts

The current Workspace dashboard:
- Filters a static tile catalogue using `authStore.hasAnyPermission`.
- Renders authorized tiles as `RouterLink` components.
- Uses a responsive one/two/three-column grid (base, 640px, 1024px).
- Uses translated labels and design tokens.
- Provides a permission-aware empty state.
- Does not itself fetch business metrics or render charts.
- Uses frontend permission filtering for presentation only; backend authorization must remain authoritative.

The current tile catalogue includes `loan_product.view`. An open App PR #42 reports a mismatch against the API's canonical `loan.view` permission for the Loan-product workspace route. This requires reconciliation across the tile catalogue, route guard, API permission catalogue and role grants; do not assume the PR fully resolves the dashboard tile.

### 2.3 API source inventory and constraints

The API main tree contains domain-owned Finance services, including financial reporting and trial-balance services, and a tenant-scoped notification controller/routes. The App Shell integration contract specifies:
- `GET /api/notifications`, unread count and read/read-all lifecycle routes;
- tenant/session-scoped in-memory cache behavior and bounded polling;
- enterprise search only through registered domain adapters with server-side permission filtering;
- allow-listed internal route names and opaque resource references;
- activation only after API schema, permissions, tenant-isolation tests, exact-head verification and visual/keyboard review.

The inspected root API routes file exposed the notification route group but no general executive-dashboard/aggregate KPI endpoint. The A1 baseline therefore does not claim that an executive dashboard API already exists. Existing domain reports should be reused through domain-owned contracts where appropriate; a new aggregation contract requires API/domain-owner review.

## 3. Live repository workflow and PR snapshot

At the time of this A1 read-only inspection:
- App open PRs: 22.
- API open PRs: 48 (the earlier 2026-11-08 daily scorecard sampled 43; the live read is newer).
- Recent App workflow sample included run #992 SUCCESS and #991, #990, #989, #987, #986 FAILURE, plus #988 and #985 SUCCESS. These are feature-branch runs, not exact-main verification.
- Recent API sample included clean-install MySQL run #1262 SUCCESS on Calendar remediation PR #73 and #1261/#1260 FAILURE on earlier commits. Other sampled audit branch runs passed G-01 and shareholder seed-number regression checks. These are not consolidated exact-main dashboard verification.

The Owner-maintained daily scorecard dated 2026-11-08 03:09 reports 46% weighted programme completion and a qualitative engineering baseline of 5.8/10; these are programme-level scores, not dashboard-specific completion measures. That scorecard reported P0 85%, P1 65%, P2 48%, P3 35%, P4 20%, P5 25%. Its sampled 14-day workflow failure counts (App 43; API 17) are historical snapshot counts and must be refreshed before being treated as current totals.

**Verification status:** no exact-main end-to-end build/test, live deployment inspection, runtime visual audit, measured WCAG audit, performance benchmark, or production data validation was executed as part of this A1 assessment.

## 4. Governance and strategy reconciliation

The App UI/UX Master Strategy v1.2 states that Phase 0 is closed with limitations and Phase 1 implementation is not yet authorized. The repository also contains a Design System 2.0 implementation guide, Phase 1-related code/tests and an open PR #19 titled “Phase 1 completion: semantic themes, bilingual typography and accessible primitives”; the daily progress report also records Phase 1-related merged work.

This is a governance/documentation inconsistency. Before any new UI implementation, reconcile the current authorization status, accepted scope and exact evidence against the Owner-approved strategy. This A1 report does not infer that a prior PR, merge or guide authorizes the new dashboard programme.

## 5. Dashboard product boundary

The target is an **Enterprise Command Center**, not a single universal page containing every metric.

1. Preserve the Workspace feature launcher as a fast navigation surface.
2. Add an Executive Overview experience for users with the appropriate management permissions.
3. Provide role- and tenant-aware views; users only see metrics and drill-downs they are authorized to access.
4. Keep shareholder-facing, admin, public and employee views distinct where their data rights differ.
5. Reuse domain-owned services and definitions; do not duplicate accounting, HR, shareholder or governance calculations in the frontend.
6. Show explicit unavailable/partial/stale states; never fabricate or silently substitute zero for missing data.
7. Use Ethiopian Birr (ETB) as the Finance base currency where the underlying report contract specifies it. Respect approved reporting periods and Ethiopian Calendar defaults; do not mix Ethiopian and Gregorian date labels without the user's configured preference.
8. Distinguish actuals, budgets, forecasts, pending transactions and posted/approved values.

## 6. Widget-by-widget implementation register

Status meanings: **EXISTS** = source component or service is present; **PARTIAL** = foundation exists but acceptance is incomplete; **SPECIFIED** = target widget defined but implementation not verified; **BLOCKED** = prerequisite contract/authorization/evidence required.

| ID | Widget / capability | Intended data and behavior | Source of truth / dependency | Baseline status | Priority |
|---|---|---|---|---|---|
| W-01 | Executive KPI strip | Approved top-level KPIs, period comparison, trend and freshness timestamp | New API aggregation contract over domain services; per-KPI permission checks | SPECIFIED | P1 |
| W-02 | Financial position | Cash/bank, assets, liabilities, equity and net position with drill-down | Finance ledger/report services; posted/approved state only | PARTIAL (domain foundation; dashboard integration not verified) | P1 |
| W-03 | Income and expenditure | Period income/expense, variance and trend | Finance financial reports; legal-entity and period filters | PARTIAL | P1 |
| W-04 | Budget vs actual | Approved budget, commitments, actuals, variance and thresholds | Finance budget domain; do not infer budget from ledger totals | BLOCKED (budget contract/evidence not verified) | P2 |
| W-05 | Legal-entity comparison | Side-by-side entity metrics and consolidated view | Finance entity mappings/consolidation; elimination and FX policies | PARTIAL | P2 |
| W-06 | Shareholder overview | Active shareholders, share classes, capital and status changes | Shareholder domain; privacy-scoped aggregates | PARTIAL | P1 |
| W-07 | Dividend position | Declared, payable, paid, withheld/tax and outstanding dividends | Dividend engine and Finance payable/payment records | PARTIAL (open App/API work remains) | P2 |
| W-08 | Governance & decisions | Upcoming meetings, quorum/attendance, pending decisions and deadlines | Governance authority, meeting and decision lifecycle | PARTIAL | P1 |
| W-09 | People & organization | Headcount, active/inactive distribution, vacancies/assignments where supported | People and Organization domain services | PARTIAL | P2 |
| W-10 | Approvals & tasks | Current user's pending approvals, assigned actions, aging and escalation | Domain-owned workflow/task APIs | SPECIFIED | P1 |
| W-11 | Documents & records | Pending review/signature, overdue records, recent issued documents | Documents/File Management services and access policy | PARTIAL | P2 |
| W-12 | Notifications & alerts | Unread count, priority, category and authorized action | Existing notification API contract | PARTIAL | P1 |
| W-13 | Calendar & deadlines | Meetings, events, reminders, recurrence and resources | Calendar APIs, timezone and E.C. display rules | PARTIAL / HIGH DEPENDENCY | P2 |
| W-14 | Operational exceptions | Failed jobs, integration health, overdue approvals, reconciliation exceptions | Observability and domain exception feeds | SPECIFIED | P2 |
| W-15 | Enterprise search | Permission-filtered people, documents, transactions and governance records | App Shell search contract and registered domain adapters | SPECIFIED / GATED | P2 |
| W-16 | Analytics and trends | Time series, entity comparisons, cohort/participation analysis | Validated reporting models and metric definitions | SPECIFIED | P3 |
| W-17 | Forecasts and scenarios | Clearly labeled projections with assumptions and confidence | Approved Finance/analytics model; never presented as actuals | BLOCKED / LATER | P4 |
| W-18 | AI management brief | Source-cited summaries, exceptions and suggested next actions; human approval for actions | Governed AI layer, provenance, authorization and audit | BLOCKED / LATER | P4 |
| W-19 | Personal workspace | My tasks, approvals, meetings, recent records and saved views | Current user's authorized domain data | SPECIFIED | P2 |
| W-20 | Dashboard preferences | Widget visibility/order, date/entity filters and saved layouts | User preference contract; no duplicate preference store | SPECIFIED | P3 |

Each widget requires a metric definition, owner, permission, tenant scope, API schema, loading/empty/error/stale states, drill-down route, freshness target, accessibility acceptance and tests before it can be marked complete.

## 7. Proposed dashboard information architecture

### Workspace
- Keep the existing `/dashboard` feature launcher available.
- Introduce an Executive Overview route only after route ownership and authorization are approved.
- Header context: active organization/entity, reporting period, locale, theme and notifications.
- First row: authorized KPI cards with trend, comparison, source/freshness and drill-down.
- Main content: financial performance, entity comparison and governance/operational activity.
- Secondary content: approvals, documents, meetings, alerts and recent activity.
- Personalization: optional layout preferences only after the common preference contract is approved.

### Admin
- Retain the honest static landing behavior until admin metrics have approved contracts.
- Admin-wide identity/security/tenant metrics must be platform-scoped, separately permissioned and isolated from tenant dashboards.

### Shareholder portal
- Use shareholder-specific statements, ownership, dividend and meeting/voting information only.
- Never expose enterprise-wide financial or people metrics by reusing the Workspace overview.

## 8. Metric and API contract requirements

Every KPI response must carry:
- stable metric key and definition/version;
- value, unit/currency and aggregation period;
- period start/end and calendar basis;
- comparison value and comparison basis, when valid;
- trend series only when the reporting service supports it;
- source domain and source record/report reference;
- `as_of` timestamp and freshness status;
- tenant/entity scope resolved from trusted server context;
- permission/visibility policy and authorized drill-down route;
- explicit unavailable/partial reason where data is not complete.

API requirements:
1. Derive tenant context from trusted middleware/session; never trust a client-supplied tenant ID as authorization.
2. Enforce domain permissions before aggregating or projecting data.
3. Do not leak small-group or personal data through aggregates; apply domain privacy rules.
4. Avoid unbounded queries; paginate activity lists and bound trend windows.
5. Use consistent period and currency semantics; define consolidation eliminations and FX treatment.
6. Distinguish posted ledger values from drafts, proposals, pending payments and forecasts.
7. Cache only with tenant + user/permission context in the key; invalidate on tenant/role changes and relevant domain events.
8. Record source lineage and metric calculation version for auditability.
9. Return safe, typed error envelopes; no silent fallback to mock data or zero.
10. Drill-down routes must be allow-listed and destination endpoints must re-authorize access.

## 9. Prioritized implementation plan and gates

| Stage | Deliverable | Acceptance gate |
|---|---|---|
| A1 | This read-only baseline, widget register, dependency map and risk list | Owner accepts baseline and resolves authorization inconsistency |
| A2 | Detailed API/App contract reconciliation, metric dictionary, route/permission matrix, source-to-widget mapping and test plan | Every P1 widget has an owner, source, schema and acceptance criteria; no duplicate domain logic |
| A3.1 | Executive overview shell, KPI card primitives, loading/empty/error/stale states, accessible chart primitives | Design System 2.0 and route/permission approvals reconciled |
| A3.2 | P1 widgets: financial position/income-expense (only validated sources), shareholder overview, governance summary, approvals and notifications | Domain API contracts, tenant isolation and exact-source tests pass |
| A3.3 | P2 widgets: budget, entity comparison, people/org, documents, calendar, operational exceptions, search | Respective domain acceptance and privacy controls pass |
| A3.4 | P3 analytics, saved views and dashboard preferences | Metric definitions and reporting validation accepted |
| A3.5 | P4 forecast and AI brief | Separate model risk, provenance, permission, audit and human-approval gates |
| A4 | Exact-SHA verification, accessibility, responsive, performance, security and integration evidence | All required checks pass against one exact App SHA and compatible API SHA |
| A5 | Release-readiness and deployment decision | Separate Owner authorization; rollback, backup, monitoring and operations proven |

No phase automatically authorizes the next. A3 implementation, merge, production data access, deployment and closure remain separate approval decisions.

## 10. A1 risk and issue register

| ID | Severity | Finding | Required disposition |
|---|---|---|---|
| R-01 | HIGH | Current Workspace dashboard is a six-tile feature launcher, not a KPI dashboard | Preserve launcher; specify a separate Executive Overview |
| R-02 | HIGH | No general executive KPI aggregation endpoint was found in the inspected API route inventory | A2 source-to-widget/API contract mapping |
| R-03 | HIGH | Design System strategy says Phase 1 implementation is not authorized while later Phase 1 code/PR evidence exists | Owner-approved authorization reconciliation |
| R-04 | HIGH | Loan-product permission slug differs between dashboard tile and reported canonical API permission | Reconcile tile, route guard, API catalogue and grants |
| R-05 | HIGH | Domain metric completeness varies; finance, governance, calendar and analytics remain partial in scorecard | Only expose metrics with validated domain contracts |
| R-06 | HIGH | Open PR backlog is large and includes competing/stacked branches with differing base SHAs | Reconcile dashboard dependencies against current main; no blind merge |
| R-07 | MEDIUM | Recent CI failures are present on feature branches; latest success is not exact-main evidence | Classify relevant runs; do not rerun indiscriminately |
| R-08 | HIGH | Runtime visual, measured accessibility and performance evidence not established by this A1 | Include explicit A4 verification plan |

## 11. A1 completion status

| Requirement | Status |
|---|---|
| Exact App/API main SHA captured | VERIFIED |
| Dashboard source inspected | VERIFIED |
| App shell and relevant contracts inventoried | VERIFIED (bounded source inventory) |
| API metric endpoint baseline | PARTIAL (root routes and selected domain tree inspected; no full endpoint audit) |
| Open PR/workflow snapshot | VERIFIED (live snapshot; workflow runs sampled) |
| Widget-by-widget register | COMPLETE FOR A1 SPECIFICATION |
| Prioritized phased plan | COMPLETE FOR A1 SPECIFICATION |
| Runtime UI / visual review | NOT RUN |
| WCAG measured audit | NOT RUN |
| Performance benchmark | NOT RUN |
| Exact-main CI verification | NOT RUN |
| Production readiness | NOT ASSESSED / NOT CLEARED |
| A2/A3/A4/A5 authorization | NOT GRANTED BY THIS DOCUMENT |

**A1 disposition: PARTIAL / READY FOR OWNER REVIEW.** The baseline and proposed register are complete at specification level. A2 must perform a deeper API/domain contract and permission reconciliation before implementation is designed in detail.

## 12. Owner decisions requested

1. Accept or amend the separation between the existing feature launcher and the new Executive Overview.
2. Confirm the first P1 audience: executive/management roles, with visibility constrained by existing tenant/entity and domain permissions.
3. Confirm that Finance widgets show posted/approved figures only and that draft/pending amounts are separately labeled.
4. Resolve the Design System Phase 1 authorization/documentation inconsistency.
5. Authorize A2 read-only API/App contract and metric-source reconciliation.

**Safety boundary:** This document was prepared from public GitHub repository metadata and source files at the exact SHAs above. No source code, database, production environment, branch protection, merge, deployment, or user data was changed or accessed.
