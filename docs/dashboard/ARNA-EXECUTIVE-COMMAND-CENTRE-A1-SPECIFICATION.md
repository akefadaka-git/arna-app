# ARNA Executive Command Centre — A1 Architecture and Implementation Specification

**Document ID:** ARNA-CC-A1-001  
**Version:** 1.0  
**Date:** 2026-11-22  
**Status:** OWNER-APPROVED PROPOSED DESIGN BASELINE  
**Owner approval:** Confirmed in ChatGPT on 2026-11-22  
**Implementation authority:** Not granted. A3 requires a separate explicit Owner decision.  
**Repository evidence baselines:** API `e7a5c04ece8e893ed99914f43664aad84683c726`; App `a1d98463cf324835379de9d627a7971272a0fb81`.

## 1. Purpose and decision boundary

Establish a measurable, Amharic-first, mobile-first executive information system across ARNA. The Command Centre is a read-only decision-support surface. It must aggregate domain-owned read models without taking ownership of domain data, business rules, approval authority, or accounting calculations.

This document freezes the proposed product and technical target. It does not authorize implementation, new permissions, role grants, schema changes, endpoint creation, merge, or deployment. A2 source reconciliation must be completed before an A3 proposal is opened.

## 2. Product and architecture principles

1. **Domain ownership:** Finance, Governance, People, Organization, Documents, Communications, Calendar, Risk/Security and Platform domains remain authoritative for their records and calculations.
2. **Read-only aggregation:** The dashboard composes authorized domain read models; it never writes business records or substitutes for a domain workflow.
3. **Fail closed:** Missing permission, tenant context, source contract, entity authorization, or data-quality evidence means the affected metric is omitted or reported unavailable without disclosing protected domain/permission metadata.
4. **Tenant and entity isolation:** Derive tenant from authenticated server context. No client-supplied tenant ID is authoritative. Legal-entity scope is enforced per entity.
5. **No implied authority:** Dashboard access is not data access. A domain permission and owning-domain policy are required for every widget.
6. **Evidence and freshness:** Every metric identifies its source domain, calculation version, effective period/as-of date, observation time and data-quality status.
7. **No false completeness:** Partial data is not presented as complete. A missing source is not rendered as zero.
8. **Amharic-first:** Amharic labels and Ethiopian Calendar (E.C.) are defaults; English and Gregorian Calendar (G.C.) remain user preferences.
9. **Accessibility and responsive design:** WCAG 2.2 AA target; keyboard, screen-reader, contrast, reduced-motion and mobile layouts are acceptance requirements.
10. **Preserve existing baselines:** Keep the existing Executive Overview and general Dashboard/launcher distinct; do not replace the current launcher.

## 3. Module catalogue

| ID | Module | Intended executive question | Initial scope |
|---|---|---|---|
| M01 | Executive Overview | What requires attention now? | Cross-domain summary of authorized, source-backed KPIs and alerts |
| M02 | Finance | What is the financial position and trend? | Trial balance, P&L, cash, receivables, payables, budget |
| M03 | Governance and Shareholders | What governance decisions and shareholder obligations are pending? | Resolutions, actions, meetings, elections, shareholder aggregates |
| M04 | People and Organization | What is our workforce and organizational position? | Active workforce, organizational units and assignments |
| M05 | Documents and Records | What official records are awaiting action? | Document workflow state, approvals and issuance |
| M06 | Operations and Workflow | Where are approvals and operational queues delayed? | Cross-domain queues, SLA and overdue work |
| M07 | Communication and Calendar | What has been communicated and what is upcoming? | Announcements, acknowledgement and authorized calendar events |
| M08 | Risk, Audit and Security | What control or security exposure needs attention? | Audit/security-event summaries and future risk register |
| M09 | Platform Health | Is the platform operating reliably? | API, queue, scheduler, integration, storage and service health |
| M10 | ARNA Intelligence | What evidence-backed insight or forecast can assist a decision? | Governed analytical proposals with source provenance and human approval |

Modules are product targets, not a claim that all source capabilities already exist.

## 4. KPI dictionary and calculation rules

Every released KPI must have a signed-off dictionary entry with: stable key; Amharic and English labels; business definition; numerator/denominator or aggregation; unit/currency; tenant and entity grain; reporting period/as-of semantics; inclusion/exclusion rules; source owner and query/read contract; permission and policy; freshness SLA; null/zero semantics; calculation version; test fixtures and owner.

| KPI key | Definition / formula | Source status at A1 |
|---|---|---|
| `finance.trial_balance.debits` | Sum posted debit balances for one legal entity through as-of date | Existing v1 report |
| `finance.trial_balance.credits` | Sum posted credit balances for one legal entity through as-of date | Existing v1 report |
| `finance.trial_balance.difference` | Absolute difference between total debits and credits | Existing v1 report |
| `finance.trial_balance.is_balanced` | True only when exact minor-unit debit and credit totals match | Existing v1 report |
| `finance.revenue.actual` | Posted net credit activity on approved revenue accounts for the reporting period | New P&L read contract |
| `finance.expense.actual` | Posted net debit activity on approved expense accounts for the reporting period | New P&L read contract |
| `finance.operating_result` | Revenue actual less expense actual under approved account classification | New P&L read contract |
| `finance.cash.position` | Approved cash/bank/payment-clearing account balances at as-of date, reconciled to source balances | New cash-position and reconciliation contract |
| `finance.receivables.outstanding` | Net collectible balances on approved receivable control accounts, reconciled to subledgers | New AR/loan/wallet reconciliation and ageing contract |
| `finance.payables.outstanding` | Net payable balances on approved payable control accounts, reconciled to subledgers | New AP/dividend/obligation reconciliation and ageing contract |
| `finance.budget.utilization` | Actual eligible spend divided by approved budget for same entity, period and cost scope | New Budget domain capability |
| `governance.resolutions.pending` | Count of valid resolutions not yet final/closed at as-of time | New resolution lifecycle capability |
| `governance.actions.overdue` | Count of open governance actions with due date earlier than as-of time | New action lifecycle and due-date capability |
| `people.workforce.active` | Count of active, non-deleted employee records in the validated tenant | Employee source exists; governed read contract required |
| `documents.pending_approval` | Count of workflow aggregates in approved pending-review states (initial candidate: submitted or in_review) | Existing workflow state; dashboard read contract required |
| `operations.approvals.overdue` | Count of actionable approval items past an owning-domain SLA/due time | New cross-domain queue/SLA contract |
| `communications.announcements.unacknowledged` | Count of published, acknowledgement-required recipient rows with null acknowledged_at | Existing recipient state; audience-aware aggregate contract required |

Do not release a KPI merely because a database column exists. A source contract, permission, policy, definition, freshness and reconciliation rule are required. Additional shareholder, calendar, audit, risk and platform-health indicators must be specified before release; no arbitrary counts or unapproved risk scores.

### 4.1 Finance rules

- Amounts remain exact decimal strings/minor units; no floating-point arithmetic.
- Keep each legal entity separate unless a separately approved consolidation policy explicitly permits aggregation.
- The current consolidation foundation is unadjusted trial balance only; it does not perform intercompany eliminations, FX translation, tax or statutory adjustments.
- Revenue/expense classification must use approved account mappings, posting state and reporting period.
- Receivable/payable metrics must reconcile to their owning subledgers and must not double-count balances.
- Budget utilization requires an approved budget baseline and explicit treatment of commitments, actuals, transfers and amendments.

## 5. API and data contracts

### 5.1 Existing compatibility contract

Existing endpoint: `GET /api/dashboard/v1/overview?as_of=YYYY-MM-DD`.

Current source response has `success`, `data.contract_version`, `data.generated_at` and `data.widgets`. The only implemented widget is `finance.trial_balance`, returned per authorized legal entity. Preserve this contract during any future migration; do not silently change its shape.

### 5.2 Proposed v2 contracts (not implemented)

Preferred public surface is one executive aggregation endpoint with modular server-side providers:

- `GET /api/dashboard/v2/executive`
- Optional focused read endpoints only where justified: `/finance`, `/governance`, `/people`, `/documents`, `/operations`, `/communications`, `/risk`, `/platform-health`.

The endpoint list is a proposal, not an existing route inventory. Avoid independent dashboards duplicating business logic. Each domain provider owns source selection and calculation; the executive aggregator composes only authorized provider outputs.

### 5.3 Proposed response envelope

```json
{
  "success": true,
  "data": {
    "contract_version": "2.0",
    "generated_at": "ISO-8601 timestamp",
    "as_of": "YYYY-MM-DD",
    "status": "complete",
    "widgets": [
      {
        "key": "finance.trial_balance",
        "status": "available",
        "source": {
          "domain": "finance",
          "resource": "trial_balance",
          "calculation_version": "1",
          "observed_at": "ISO-8601 timestamp"
        },
        "entity": {"code": "ENTITY-CODE", "currency": "ETB"},
        "period": {"from": null, "to": "YYYY-MM-DD"},
        "value": {},
        "data_quality": {"freshness": "current", "reconciled": true}
      }
    ]
  }
}
```

Overall `status`: `complete`, `partial`, or `unavailable`. Widget status: `available`, `stale`, or `not_applicable`; do not use zero to represent missing data. The exact envelope is a proposed v2 contract. Do not reveal omitted widget names, unavailable domain names, permission slugs, denial reasons or protected counts.

### 5.4 Contract requirements

- Validate date, period, entity selection and pagination server-side.
- Include a stable contract version and per-metric calculation version.
- Include source observation time and data-quality/freshness metadata.
- Return currency and legal-entity identity for all monetary values.
- Never combine currencies without approved FX policy.
- Use bounded query counts and pagination for detail lists; summary endpoints must avoid N+1 access.
- Use `Cache-Control: private, no-store` for sensitive executive data unless a later security-reviewed cache design is approved.
- Apply tenant, principal, role, domain permission and entity scope before aggregation.
- Audit sensitive access without disclosing hidden-domain metadata to the caller.

## 6. Authorization and permissions

### 6.1 Frozen initial audience

The initial audience remains exactly `ceo`, `president`, and `finance_manager`, subject to the exact backend policy confirmed by A2. The entry permission is `dashboard.executive.view`. The permission is necessary but not sufficient.

- CEO and President are tenant-scoped roles.
- Finance Manager is application-scoped to the active Finance application and tenant-bound.
- Board, shareholder, cashier, generic manager, HR manager, tenant admin, platform admin and super admin are not included by default.
- Organizational titles such as CFO/CTO do not imply role grants.
- Finance Manager sees only Finance widgets for which current Finance permissions and entity policies allow access.
- CEO/President are not automatically granted Finance report or entity permissions.

### 6.2 Per-widget authorization

The aggregator must invoke the owning domain's canonical authorization service/policy. Dashboard entry permission must never substitute for `finance.report.view`, `finance.entity.view`, Governance, People, Documents, Communications, Calendar, audit or other domain permissions. Missing or unverified permission/policy means fail closed.

No role grant, permission family, wildcard exception, audience expansion, cross-entity scope or direct grant is authorized by this specification.

## 7. Frontend architecture

Keep the current Vue application and feature boundaries. Proposed components:

- `ExecutiveCommandCentreView` — page composition and global state.
- `ExecutiveSummaryHeader` — tenant, as-of date, generated time, freshness.
- `ExecutiveKpiGrid` / `ExecutiveKpiCard` — metric presentation.
- `ExecutiveModuleNav` — module navigation, permission-aware.
- `ExecutiveWidgetFrame` — consistent loading/error/empty/stale shell.
- Domain widgets under module feature folders, with domain-specific formatting and tests.
- `ExecutiveDataQualityNotice` — partial/stale/unavailable explanation that does not leak hidden permissions.
- `ExecutiveDateRangeControl` — E.C.-first date and period selection.
- `ExecutiveEntityScopeControl` — only entities returned as authorized by API.

Reuse the existing API client, tenant store, locale/calendar utilities, PermissionGate and route guards. Backend authorization is authoritative; frontend role/permission gates are UX only. Cancel superseded requests and clear sensitive state on logout, tenant switch or authorization change.

The current Executive Overview frontend type allows optional `status: complete | partial`, but the current backend omits top-level status. A3 must reconcile this contract rather than assuming partial-data behavior already works.

## 8. UX, localization and accessibility

- Amharic labels and E.C. default; English and G.C. preferences honored.
- ETB is the default monetary unit; display currency per entity.
- Responsive desktop/tablet/mobile layouts; no horizontal scrolling for core KPIs at mobile widths.
- WCAG 2.2 AA: semantic headings, keyboard-operable controls, visible focus, accessible chart summaries, contrast, screen-reader labels, reduced motion and error announcements.
- Charts must have equivalent tabular/text summaries and avoid color-only encoding.
- Loading, empty, forbidden, partial, stale, unavailable and retry states must be distinct.
- Never display unauthorized metrics as zero or as a generic empty chart.

## 9. Acceptance criteria and tests

| ID | Acceptance criterion |
|---|---|
| CC-001 | Only the frozen audience can enter with an active, tenant-compatible role and entry permission |
| CC-002 | Direct user grant, platform role, wildcard grant or inactive role cannot bypass the audience policy |
| CC-003 | Tenant A cannot receive tenant B data through IDs, filters, caches or joins |
| CC-004 | Finance widgets require current report permission and per-entity policy |
| CC-005 | Revocation is effective despite stale positive authorization cache |
| CC-006 | Unauthorized widget keys, permission slugs, counts and denial reasons are not disclosed |
| CC-007 | Trial balance matches exact posted ledger fixtures and reversals |
| CC-008 | Revenue/expense/P&L fixtures reconcile to approved account mappings and posted entries |
| CC-009 | Cash position reconciles to approved cash/bank accounts and source controls |
| CC-010 | AR/AP totals reconcile to their subledgers and ageing buckets |
| CC-011 | Budget utilization uses the same approved budget, entity, period and spend scope |
| CC-012 | Governance pending/overdue metrics respect state transitions and due-date boundaries |
| CC-013 | Workforce count excludes inactive, deleted and foreign-tenant employee records |
| CC-014 | Document pending-approval metric uses canonical workflow states and tenant authorization |
| CC-015 | Overdue operations metrics use owning-domain SLAs and do not invent due dates |
| CC-016 | Announcement acknowledgement counts respect recipients, publication state and acknowledgement requirement |
| CC-017 | Calendar metrics honor visibility, attendee and owning-domain resource authorization |
| CC-018 | Every metric exposes provenance, calculation version, currency/period and freshness status |
| CC-019 | Partial/stale/unavailable states render correctly; missing values are not zero-filled |
| CC-020 | Amharic/E.C. defaults, English/G.C. preferences, responsive behavior and WCAG 2.2 AA pass |

Tests must include feature/API authorization, tenant and entity isolation, exact calculation fixtures, revocation, cache invalidation, stale source handling, contract snapshots, component tests, browser tests and accessibility checks. No metric is released without 100% pass of its deterministic calculation fixtures and authorization boundary tests.

## 10. Quality and release gates

- 100% of released KPIs have approved definitions, source mappings, permissions, provenance and deterministic fixtures.
- Zero unresolved critical/high security findings in the released scope.
- WCAG 2.2 AA acceptance evidence for all released surfaces.
- Exact-head API and App verification required before declaring A4.
- Production readiness is a separate A5 assessment; independent security review and explicit Owner deployment authorization remain separate final gates.

## 11. Proposed delivery sequence (not authorized by this document)

- **A3.1:** reconcile/freeze contract and authorization implementation plan from A2 findings.
- **A3.2:** harden existing v1 compatibility and introduce a versioned shared response contract.
- **A3.3:** implement only source-backed, already-authorized metrics.
- **A3.4:** add domain capabilities only after separate domain specifications and Owner approval.
- **A3.5:** build module components, responsive states and localization.
- **A3.6:** add security, calculation, contract and browser tests.
- **A3.7:** integrate and verify exact API/App heads.
- **A3.8:** A4 acceptance and closure.
- **A3.9:** produce a release candidate for separate A5 assessment.

## 12. Preservation and change control

The A1/A2 work must not alter the verified API/App code baselines, their PRs, workflows, production settings or data. Documentation may be committed on a separate documentation branch. A3, merge and A5 require their own explicit approvals. Any material change to audience, metric definition, source authority, permission model, entity consolidation or security boundary requires a documented Owner decision.
