# ARNA Executive Command Centre — A2 Read-only Source Reconciliation

**Document ID:** ARNA-CC-A2-001  
**Version:** 1.0  
**Date:** 2026-11-22  
**Status:** A2 RECONCILIATION COMPLETE — DESIGN BASELINE VERIFIED WITH EXPLICIT CAPABILITY GAPS  
**Authority:** Owner-approved A1 and explicit A2 read-only authorization, 2026-11-22  
**Inspection mode:** Read-only GitHub source inspection. No code, schema, permissions, role grants, workflows, production data or runtime state changed.  
**API source SHA:** `e7a5c04ece8e893ed99914f43664aad84683c726`  
**App source SHA:** `a1d98463cf324835379de9d627a7971272a0fb81`  
**A1 baseline document:** [ARNA-EXECUTIVE-COMMAND-CENTRE-A1-SPECIFICATION.md](ARNA-EXECUTIVE-COMMAND-CENTRE-A1-SPECIFICATION.md)

## 1. Executive outcome

A2 confirms that the current Executive Overview has a narrowly frozen three-role audience, a dedicated tenant-scoped entry permission, independent Finance widget authorization and a single existing trial-balance widget. It does **not** confirm that the proposed ten-module Command Centre is already supported by existing domain APIs.

The A1 design baseline remains valid, subject to the explicit A2 corrections and source-capability classifications below. A3 should begin only with a bounded implementation proposal that separates:
1. source-backed metrics that can be exposed through existing domain contracts;
2. source-backed records that need a new read-only aggregate contract and explicit authorization;
3. metrics that require new domain lifecycle, data, accounting or telemetry capabilities.

**A2 disposition:** audience policy VERIFIED; current permission inventory reconciled; current source contracts inspected; KPI support classified; remaining unknowns are isolated as specific design/capability gaps rather than being treated as available features.

## 2. Exact Executive Overview audience policy — VERIFIED

### 2.1 Frozen policy and canonical implementation

The App repository contains the Owner-frozen audience policy in:
- `docs/dashboard/ARNA-DASHBOARD-A3-AUDIENCE-PERMISSION-POLICY-2026-11-09.md`
- `docs/dashboard/ARNA-DASHBOARD-A3-POLICY-IMPLEMENTATION-RECONCILIATION-2026-11-09.md`

The API implementation at the inspected SHA is:
- `mases_core/src/Authorization/ExecutiveOverviewAccessPolicy.php`
- `database/seeders/Data/PermissionCatalogue.php`
- `database/seeders/Data/RolePermissionGrants.php`
- `database/seeders/RolePermissionSeeder.php`
- `tests/Feature/ExecutiveOverviewAuthorizationTest.php`
- `tests/Feature/ExecutiveOverviewA4FreshAuthorizationTest.php`

The approved audience is exactly:

| Role slug | Required role scope | Tenant binding | Executive entry |
|---|---|---|---|
| `ceo` | `tenant` | `roles.tenant_id = resolved tenant` | Allowed when active and role pivot holds active `dashboard.executive.view` |
| `president` | `tenant` | `roles.tenant_id = resolved tenant` | Same |
| `finance_manager` | `application`, application slug `finance` | `roles.tenant_id = resolved tenant` | Allowed only when Finance application is active and role pivot holds active entry permission |

No other role is in the initial audience. Specifically excluded by default: `board`, `shareholder`, `cashier`, generic `manager`, `hr_manager`, `tenant_admin`, `platform_admin`, and `super_admin`. CFO/CTO job titles do not map to roles without canonical role records and explicit Owner approval.

### 2.2 Exact policy predicates

`ExecutiveOverviewAccessPolicy::allows(User $user, int $tenantId)` requires all of the following:
- an active role;
- role tenant ID exactly equal to the trusted resolved tenant;
- either `ceo` or `president` with `roles.scope = tenant`, or `finance_manager` with `roles.scope = application` and an active related application whose slug is `finance`;
- an attached role-permission pivot for `dashboard.executive.view`;
- the permission row is active, tenant-scoped, and either has null `permissions.tenant_id` or matches the resolved tenant.

The route is `GET /api/dashboard/v1/overview`, inside `auth:sanctum` + `tenant.membership`, with `auth.permission:dashboard.executive.view` and `throttle:60,1`. The controller repeats the uncached audience role-pivot check. A direct user-level grant cannot substitute for the required approved role grant.

The role grant seeder filters `dashboard.executive.view` out of wildcard/scope-derived grants for all roles outside the frozen allowlist. This is necessary because `super_admin` has `*`, while `platform_admin` and `tenant_admin` have tenant-scope grant specifications. The exclusion is applied after wildcard resolution.

### 2.3 Domain data is a separate authorization gate

The entry permission is not a business-data permission. Current Finance output separately requires:
- current tenant-scoped `finance.report.view`;
- current tenant-scoped `finance.entity.view`;
- the registered `LegalEntityPolicy::view` check for each entity;
- tenant-scoped entity lookup and report generation.

The controller reads the current permission pivots directly for Finance checks, avoiding stale positive authorization cache access after revocation. Finance results are emitted as separate per-entity widgets. Entities with no ledger accounts are omitted. No cross-entity or cross-currency aggregate is emitted.

**Important audience consequence:** the canonical Finance role grant maps give `finance_manager` `finance.report.view` and `finance.entity.view`; CEO and President receive Finance application access but do not receive those Finance reporting/entity permissions by default. Therefore CEO/President may pass the Executive Overview audience gate while receiving no Finance widgets. Do not widen their Finance permissions in A3 without a separate Owner decision.

### 2.4 Test evidence present in source

- `ExecutiveOverviewAuthorizationTest` pins the three-role audience, role scopes, Finance grants and executive entry permission grant set; tests wildcard-role non-inheritance and direct-grant/platform-role exclusion.
- `ExecutiveOverviewA4FreshAuthorizationTest` verifies Finance report revocation despite a deliberately stale positive authorization cache and entry-permission revocation despite stale middleware cache.
- `docs/dashboard/ARNA-EXECUTIVE-OVERVIEW-A4-SECURITY-VERIFICATION.md` records prior A4 scope, tenant/entity isolation and disclosure checks. It explicitly separates source/branch evidence from live production role and pivot state.

**Live production state:** NOT INSPECTED. No production role rows, user assignments, role-permission pivots or live access state were queried.

## 3. Existing permission slug inventory

The following inventory is derived from the checked-in API permission catalogue and domain permission seeders at API SHA `e7a5c04...`. It is a source-code inventory, not proof that production seeders have been run or that a particular user has a grant.

### 3.1 Platform, identity, files, People, audit, Calendar, communication and dashboard

- Identity/profile: `user.profile.view`, `user.profile.update`, `user.list`, `user.create`, `user.update`, `user.delete`, `user.assign_roles`.
- Role administration: `role.list`, `role.create`, `role.update`, `role.delete`, `role.assign_permissions`.
- Permission administration: `permission.list`, `permission.create`, `permission.update`, `permission.delete`.
- Application access: `app.portal.access`, `app.hr.access`, `app.admin.access`, `app.arna.access`, `app.app.access`, `app.launcher.access`, `app.finance.access`, `app.governance.access`.
- Files: `file.upload`, `file.download`, `file.view`, `file.update`, `file.delete`, `file.force_delete`, `file.restore`, `file.list`, `file.view_versions`.
- Tenant administration: `tenant.list`, `tenant.create`, `tenant.update`, `tenant.delete`.
- People identity administration: `people.manage` (tenant-scoped), `people.account-link.manage` (global), `people.tenant-access.manage` (global).
- Audit/security: `audit.view`, `security-event.view`, `security-event.resolve`.
- Calendar: `calendar.view`, `calendar.create`, `calendar.update`, `calendar.reserve`.
- Public content: `public-content.review`.
- Announcements: `announcement.view`, `announcement.manage`, `announcement.approve`, `announcement.publish`.
- Executive entry: `dashboard.executive.view` (tenant-scoped, category `dashboard`, non-system).
- Test-only catalogue entry: `test.permission`.

### 3.2 Finance (domain-owned catalogue)

- Application: `app.finance.access`.
- Entity/accounting: `finance.entity.view`, `finance.entity.manage`, `finance.account.view`, `finance.account.manage`, `finance.period.view`, `finance.period.manage`.
- Journals: `finance.journal.view`, `finance.journal.create`, `finance.journal.cancel`, `finance.journal.post`, `finance.journal.reverse`.
- Reports: `finance.report.view`.
- Governance settlement: `finance.governance_settlement.configure`, `finance.governance_settlement.approve`, `finance.governance_settlement.execute`.
- Finance intelligence: `finance.ai.view`, `finance.ai.propose`, `finance.ai.approve`.
- Integration/subledger: `finance.subledger.view`, `finance.subledger.ingest`, `finance.integration.view`.

### 3.3 Governance (domain-owned seeder)

- Root/body/member: `governance.view`, `governance.manage`, `governance.body.view`, `governance.body.manage`, `governance.member.view`, `governance.member.manage`.
- Meetings/agenda/attendance/minutes: `governance.meeting.view`, `governance.meeting.create`, `governance.meeting.manage`, `governance.meeting.approve`, `governance.agenda.view`, `governance.agenda.manage`, `governance.attendance.view`, `governance.attendance.manage`, `governance.minute.view`, `governance.minute.manage`, `governance.minute.approve`.
- Resolutions/actions: `governance.resolution.view`, `governance.resolution.create`, `governance.resolution.manage`, `governance.resolution.approve`, `governance.action.view`, `governance.action.create`, `governance.action.manage`, `governance.action.verify`.
- Authority/declarations/elections: `governance.delegation.view`, `governance.delegation.manage`, `governance.declaration.view`, `governance.declaration.manage`, `governance.election.view`, `governance.election.manage`, `governance.election.authorize`, `governance.election.schedule`, `governance.election.suspend`, `governance.election.cancel`, `governance.election.archive`.
- Governance documents/reports: `governance.document.view`, `governance.document.upload`, `governance.document.download`, `governance.report.view`, `governance.report.generate`.
- Application access: `app.governance.access`.

**Capability distinction:** the seeder registers resolution/action permission slugs, but the inspected API tree contains no GovernanceResolution or GovernanceAction model, migration, service or route surface. Permission registration alone is not a delivered lifecycle capability.

### 3.4 Shareholder

`shareholder.view_own`, `shareholder.view`, `shareholder.create`, `shareholder.update`, `share_class.view`, `share_class.manage`, `share_holding.view_own`, `share_holding.view`, `share_holding.entry`, `certificate.view_own`, `certificate.view`, `certificate.issue`, `certificate.cancel`.

### 3.5 Wallet

`wallet.view_own`, `wallet.view`, `wallet.open`, `wallet.adjust`, `wallet.obligation.create`, `wallet.payment.record`, `wallet.allocation.create`, `wallet.allocation.reverse`, `wallet.statement.view_own`, `wallet.statement.view`.

### 3.6 Loan

`loan.view`, `loan.view_own`, `loan.apply`, `loan.approve`, `loan.reject`, `loan.disburse`, `loan.repay`, `loan.restructure`, `loan.writeoff`, `loan.schedule.view`, `loan.statement.view`, `loan.statement.view_own`, `loan.collateral.view`, `loan.collateral.manage`, `loan.collateral.release`.

### 3.7 Documents

`documents.view`, `documents.create`, `documents.update`, `documents.submit`, `documents.review`, `documents.return`, `documents.reject`, `documents.approve`, `documents.sign`, `documents.issue`, `documents.withdraw`, `documents.revoke`, `documents.supersede`.

### 3.8 Organization permission registration gap — UNRESOLVED

Organization policies reference:
- `organization.unit.view`, `organization.unit.manage`;
- `organization.assignment.view`, `organization.assignment.manage`.

These strings appear in Organization policies and feature tests. However, they do **not** appear in the inspected canonical `PermissionCatalogue` or in a domain-owned Organization permission seeder in the API tree. The Organization tests create these permission rows directly with `firstOrCreate`, so those tests do not prove canonical registration or role grants. Treat all four as **code-referenced but not canonically registered/seeded** at this SHA. Do not use them for a Command Centre widget until a domain-owned catalogue, grants and migration/seed verification exist.

### 3.9 Permission grant cautions

- Dashboard entry grants are limited to the frozen three roles by the central grant map and explicit wildcard exclusion.
- Finance Manager has Finance report/entity view; CEO and President do not by default.
- Governance, Shareholder, Wallet, Loan and Documents have their own domain role-grant seeders; dashboard access does not confer those grants.
- People read visibility intentionally does not use `people.manage`: `PersonPolicy` requires active caller account, active tenant membership, active Person and active `PersonTenantAccess`.
- Calendar routes require the Calendar permissions; links to other domains are re-authorized by the owning domain.
- Announcement grants are role-specific in the checked-in grant matrix. Recipient reads and acknowledgement are constrained by publication, recipient and tenant state.
- Source grants are not production grants. No live seed status was inspected.

## 4. Authoritative source contracts and domain readiness

| Domain / source | Existing authoritative evidence | KPI readiness and A2 disposition |
|---|---|---|
| Executive Overview | `GET /api/dashboard/v1/overview`; `ExecutiveOverviewController`; `FinancialReportContract::trialBalance`; response per authorized legal entity | **SUPPORTED:** trial-balance debit/credit/difference/balanced metrics only. No other domain widgets in current endpoint. |
| Finance GL | Tenant/entity-scoped legal entities, ledger accounts, periods, journal entries/lines; `TrialBalanceService`, `FinancialReportService`; exact decimal arithmetic; canonical CoA | Trial balance supported. Revenue/expense account types and codes exist in CoA but no P&L report contract. Cash/bank and receivable/payable account codes exist but no approved cash position, AR/AP ageing or source-reconciliation report. |
| Finance consolidation | `FinanceConsolidationService` reads explicitly selected tenant entities and approved account mappings | **LIMITED:** unadjusted consolidated trial balance only, same base currency only; no intercompany elimination, FX translation, tax or statutory adjustments. Not sufficient for consolidated executive P&L/cash/AR/AP. |
| Governance | Models, migrations, policies, routes and services for bodies, positions, terms, appointments, memberships, meetings/attendance, elections and election lifecycle | Existing records can support future counts only after exact state definitions and authorized aggregate contract. No resolution/action lifecycle models or routes were found despite corresponding permission slugs. |
| Shareholder | Shareholder, ShareClass, ShareHolding, ShareCertificate models, migrations, policies, services and routes; own-vs-tenant permission variants | Underlying data exists. No A1 KPI definition or executive aggregate contract; any shareholder metrics require per-user/role and tenant policy review. |
| People | `employees` table includes tenant_id, employee_number, is_active, soft deletes; `EmployeeRecord` is explicitly read-oriented adapter. Person identity is separate from employment; PersonPolicy uses active membership + active PersonTenantAccess | **PARTIALLY SUPPORTED:** active employee count is technically derivable from existing tenant-scoped employee rows, but no canonical workforce aggregate API, employee lifecycle contract, dashboard read permission or explicit executive visibility policy was verified. New read contract and authorization are required; do not infer from `people.manage`. |
| Organization | OrganizationUnit and OrganizationAssignment records include tenant, status, effective dates and audit association; policies reference four organization.* slugs | Data model exists; canonical permission registration is unresolved (see §3.8), and no verified executive read contract exists. New catalogue/grant/read policy work is required before metrics. |
| Documents | Formal document workflow aggregate and append-only events; service transitions include submitted → in_review → approved/signing/issued, etc.; domain permissions and governance-authority check | **PARTIALLY SUPPORTED:** counts by submitted/in_review can be derived from tenant-scoped workflow state, but a dashboard read contract and authorized audience are missing. No due_at/SLA field was established, so overdue approval cannot be asserted. |
| Communication / announcements | `communication_announcements` and `communication_announcement_recipients`; explicit recipient IDs, publication lifecycle, requires_acknowledgement, acknowledged_at; acknowledge endpoint | **DATA SUPPORTED:** unacknowledged recipient count is derivable for published acknowledgement-required announcements. New aggregate contract must distinguish recipient-self scope from manager-authorized tenant-wide scope; never expose other recipients' state to an ordinary recipient. |
| Calendar | Calendar and event models/services, tenant/visibility/owner/attendee filters, E.C./G.C. date conversion, `calendar.view` etc. | **DATA SUPPORTED WITH LIMITS:** user-visible upcoming event counts can be derived through CalendarService visibility rules. Not a substitute for governance meeting quorum/voting. Recurrence expansion and attendee response are incomplete per Calendar contract. |
| Risk / Audit / Security | `audit.view`, `security-event.view`, `security-event.resolve`; audit/security event source and admin security tests | Audit/security records exist; no enterprise risk register, risk taxonomy, control-owner/mitigation lifecycle or approved risk score source was verified. Security-event summary requires a separate authorized aggregate contract. |
| Platform health | Public `GET /api/health` returns basic status/timestamp/version/environment. Finance integration health snapshot reports outbox/inbox operational counts and explicitly says source reconciliation is unavailable without adapters/control totals | **LIMITED:** basic liveness and Finance integration queue counts exist. No tenant-safe platform SLO, latency, queue-wide, scheduler, storage, backup, service availability or alerting contract was found. |
| ARNA Intelligence | Finance-only `FinanceIntelligenceProviderContract`, `finance.ai.*` permissions and Finance proposal service | **LIMITED:** Finance-scoped evidence-backed proposals only. No cross-domain Executive Intelligence contract, model governance, source registry or executive recommendation audit trail was verified. |

### 4.1 Important source-level limitations

- The current backend response has no top-level `status` field. The App TypeScript interface declares optional `status?: 'complete' | 'partial'`. The frontend supports empty/error/forbidden/retry handling, but complete/partial status cannot be considered fully wired until the API contract is aligned.
- The existing endpoint is read-only and Finance-only. No v2 endpoints in A1 are present in the inspected route table.
- Finance controller checks current Finance pivots and per-entity policy. Preserve this freshness/security behavior.
- The Finance CoA includes account types `revenue` and `expense`, cash/bank/payment-clearing accounts, trade receivable/payable accounts, loan principal and dividend payable accounts. Classification alone is not an approved executive metric; source-to-ledger reconciliation and accounting policy are still required.
- Finance integration health explicitly reports `not_reconciled` and `source_control_totals_available=false`; do not present integration queue counts as proof of financial reconciliation.
- Documents workflow states support pending-work counts, but no due date/SLA contract was verified.
- Announcement acknowledgement is per explicit recipient; no tenant-wide broadcast is implied.
- Calendar domain links are opaque references and never confer access to linked domain records. Every referenced resource must be authorized by its owning domain.
- Calendar contract explicitly excludes Governance quorum, voting and binding-resolution behavior.

## 5. KPI-by-KPI support classification

Status meanings:
- **SUPPORTED NOW:** exact existing read contract and calculation exists.
- **SOURCE EXISTS — NEW AGGREGATE CONTRACT:** underlying authoritative records exist; a safe dashboard read contract/authorization is still required.
- **PARTIAL / NEW DOMAIN CONTRACT:** some data exists, but material lifecycle, reconciliation or permission authority is missing.
- **NEW DOMAIN CAPABILITY REQUIRED:** authoritative records or lifecycle do not exist in the inspected source baseline.

| A1 KPI | Status | A2 finding / implementation prerequisite |
|---|---|---|
| `finance.trial_balance.debits` | **SUPPORTED NOW** | Existing `FinancialReportContract::trialBalance` summary; per entity, as-of date, currency |
| `finance.trial_balance.credits` | **SUPPORTED NOW** | Same |
| `finance.trial_balance.difference` | **SUPPORTED NOW** | Exact absolute difference from decimal arithmetic |
| `finance.trial_balance.is_balanced` | **SUPPORTED NOW** | Exact debit/credit comparison |
| `finance.revenue.actual` | **PARTIAL / NEW DOMAIN CONTRACT** | Revenue CoA accounts exist; add approved period-based P&L read contract and account inclusion/exclusion rules |
| `finance.expense.actual` | **PARTIAL / NEW DOMAIN CONTRACT** | Expense CoA accounts exist; add approved period-based P&L read contract |
| `finance.operating_result` | **PARTIAL / NEW DOMAIN CONTRACT** | Depends on approved revenue and expense definitions; no existing P&L contract |
| `finance.cash.position` | **PARTIAL / NEW DOMAIN CONTRACT** | Cash/bank/clearing CoA accounts exist; require account mapping, as-of report, bank/payment reconciliation and freshness |
| `finance.receivables.outstanding` | **PARTIAL / NEW DOMAIN CONTRACT** | Trade receivable and loan/wallet receivable sources exist; require AR/subledger ownership, reconciliation and ageing |
| `finance.payables.outstanding` | **PARTIAL / NEW DOMAIN CONTRACT** | Trade payable and dividend payable data exist; require AP/subledger reconciliation and ageing; avoid double-counting |
| `finance.budget.utilization` | **NEW DOMAIN CAPABILITY REQUIRED** | No approved budget model, budget lifecycle, allocation or permission contract found |
| `governance.resolutions.pending` | **NEW DOMAIN CAPABILITY REQUIRED** | Permission slugs exist, but no resolution model/migration/service/routes or state lifecycle found |
| `governance.actions.overdue` | **NEW DOMAIN CAPABILITY REQUIRED** | Permission slugs exist, but no action model/migration/service/routes or due-date lifecycle found |
| `people.workforce.active` | **SOURCE EXISTS — NEW AGGREGATE CONTRACT** | Employees table has tenant_id/is_active/soft deletes; require workforce read policy, source contract and visibility authorization |
| `documents.pending_approval` | **SOURCE EXISTS — NEW AGGREGATE CONTRACT** | Document workflow states submitted/in_review exist; define exact pending states, query contract and Documents authorization |
| `operations.approvals.overdue` | **NEW DOMAIN CAPABILITY REQUIRED** | No common queue/SLA/due-date contract across owning domains; cannot infer overdue from pending status |
| `communications.announcements.unacknowledged` | **SOURCE EXISTS — NEW AGGREGATE CONTRACT** | Recipient acknowledgement timestamps exist; enforce recipient-self vs announcement-manager visibility |
| Risk/security incident count | **PARTIAL / NEW DOMAIN CONTRACT** | Audit/security event records exist; define event taxonomy, severity, retention and permission-scoped aggregate |
| Platform availability/SLO | **NEW DOMAIN CAPABILITY REQUIRED** | Basic liveness and Finance integration counts only; no platform-wide telemetry/SLO contract |
| Cross-domain ARNA Intelligence | **NEW DOMAIN CAPABILITY REQUIRED** | Finance-only AI provider exists; no cross-domain evidence registry/governance contract |

## 6. Permission-to-KPI mapping and safe-use rules

| KPI/module | Candidate existing permission(s) | A2 authorization finding |
|---|---|---|
| Executive entry | `dashboard.executive.view` | Frozen three-role gate; not data access |
| Trial balance / Finance | `finance.report.view`, `finance.entity.view` | Both current tenant-scoped checks and LegalEntityPolicy required |
| Revenue / expense / operating result / cash / AR / AP | `finance.report.view`, `finance.entity.view` | Candidate only; new Finance report contract and exact mapping/reconciliation needed |
| Budget utilization | No budget permission family | New Budget capability and permission policy required |
| Governance bodies/meetings/attendance | `governance.body.view`, `governance.meeting.view`, `governance.attendance.view`, `governance.report.view` | Use owning Governance policy; role grants do not imply dashboard access |
| Governance resolutions/actions | `governance.resolution.view`, `governance.action.view` | Slugs registered but lifecycle data/model absent |
| Shareholder | `shareholder.view`, `shareholder.view_own`, `share_holding.view`, `share_holding.view_own`, `certificate.view`, `certificate.view_own` | Preserve own-vs-tenant scope and policy |
| People | No `people.view` slug; `people.manage` is identity-management | Person reads use active membership + active PersonTenantAccess; EmployeeRecord requires a separate authorized aggregate contract |
| Organization | `organization.unit.view/manage`, `organization.assignment.view/manage` referenced by policies | Not in canonical permission catalogue; no executive widget until registration/grants are fixed |
| Documents | `documents.view` plus action-specific `documents.*` | Use DocumentWorkflowAuthorizationService and governance authority where action is governed; dashboard read-only must not invoke workflow mutation |
| Announcements | `announcement.view`, `announcement.manage` | Recipient-only view versus manager tenant-wide view; acknowledgement count must honor this distinction |
| Calendar | `calendar.view` | Respect calendar visibility, owner/attendee rules and owning-domain authorization for links |
| Audit/security | `audit.view`, `security-event.view` | Separate permission-scoped aggregate; resolution requires `security-event.resolve` and is not a dashboard action |
| Platform health | No general platform-health permission family found | Define operator/admin read policy; do not equate `app.admin.access` with business-data authority |
| ARNA Intelligence | `finance.ai.view`, `finance.ai.propose`, `finance.ai.approve` | Finance-only; no cross-domain executive permission or model-governance contract |

No new permission slugs or grants are approved by this A2 report.

## 7. A1 corrections required before A3

1. **Preserve frozen audience unchanged.** CEO/President entry does not imply Finance report visibility. Finance Manager remains limited to Finance data already authorized.
2. **Do not plan a single broad v2 endpoint as if all modules are ready.** Keep one aggregator architecture, but activate only providers with verified source contracts and authorization.
3. **Mark KPI capability states explicitly.** Only four trial-balance KPIs are supported now. Other KPIs need a new aggregate contract or domain capability as shown in §5.
4. **Treat organization permission registration as a blocker.** The four organization.* slugs are referenced by policies/tests but absent from canonical registration at this SHA.
5. **Add a People workforce read policy.** Do not repurpose `people.manage` as a dashboard view permission; Person identity and employee records are separate concerns.
6. **Do not claim overdue metrics without due dates and SLAs.** Current pending states do not establish that an item is overdue.
7. **Do not claim a risk register or platform SLO.** Existing audit/security events and liveness endpoints are narrower capabilities.
8. **Align response completeness semantics.** API must define top-level `status` if App will depend on `complete/partial`; do not imply current backend emits it.
9. **Preserve Finance accounting boundaries.** No unapproved consolidation, FX, intercompany elimination, tax or statutory treatment.
10. **Do not broaden role grants or create domain models in an Executive Overview change.** Missing domain capabilities need their own A1/A2 and Owner approval before implementation.

## 8. A2 evidence register

Inspected at the exact source SHAs listed above:

### API
- `mases_core/src/Authorization/ExecutiveOverviewAccessPolicy.php`
- `app/Http/Controllers/ExecutiveOverviewController.php`
- `routes/api.php`
- `database/seeders/Data/PermissionCatalogue.php`
- `database/seeders/Data/RoleCatalogue.php`
- `database/seeders/Data/RolePermissionGrants.php`
- `database/seeders/RolePermissionSeeder.php`
- `mases_core/src/Domains/Finance/Database/Seeders/FinancePermissionCatalogue.php`
- `mases_core/src/Domains/Finance/Database/Seeders/FinanceRolePermissionGrants.php`
- `mases_core/src/Domains/Governance/Database/Seeders/GovernancePermissionsSeeder.php`
- `mases_core/src/Domains/Governance/Database/Seeders/GovernanceRolesSeeder.php`
- `mases_core/src/Domains/Shareholder/Database/Seeders/ShareholderPermissionsSeeder.php`
- `mases_core/src/Domains/Wallet/Database/Seeders/WalletPermissionsSeeder.php`
- `mases_core/src/Domains/Loan/Database/Seeders/LoanPermissionsSeeder.php`
- `mases_core/src/Domains/Documents/Database/Seeders/DocumentsPermissionCatalogue.php`
- `mases_core/src/Domains/Documents/Database/Seeders/DocumentsRolePermissionGrants.php`
- `mases_core/src/Domains/Documents/Services/DocumentWorkflowAuthorizationService.php`
- `mases_core/src/Domains/Documents/Services/DocumentWorkflowAggregateService.php`
- `mases_core/src/Domains/Finance/Contracts/FinancialReportContract.php`
- `mases_core/src/Domains/Finance/Services/FinancialReportService.php`
- `mases_core/src/Domains/Finance/Services/TrialBalanceService.php`
- `mases_core/src/Domains/Finance/Services/FinanceConsolidationService.php`
- `mases_core/src/Domains/Finance/Services/FinanceIntegrationHealthService.php`
- `mases_core/src/Domains/Finance/Config/chart_of_accounts_v1.php`
- `mases_core/src/Domains/People/Models/EmployeeRecord.php`
- `mases_core/src/Domains/People/Models/Person.php`
- `mases_core/src/Domains/People/Policies/PersonPolicy.php`
- `mases_core/src/Domains/Organization/Models/OrganizationUnit.php`
- `mases_core/src/Domains/Organization/Models/OrganizationAssignment.php`
- `mases_core/src/Domains/Organization/Policies/OrganizationUnitPolicy.php`
- `mases_core/src/Domains/Organization/Policies/OrganizationAssignmentPolicy.php`
- `mases_core/src/Domains/Governance/Models/GovernanceElection.php`
- `mases_core/src/Domains/Calendar/Services/CalendarService.php`
- `mases_core/src/Calendar/Services/CalendarDomainResourceAuthorizer.php`
- `app/Http/Controllers/CommunicationAnnouncementController.php`
- `database/migrations/2026_10_22_000001_create_employees_table.php`
- `database/migrations/2026_11_01_000001_create_communication_announcements_tables.php`
- `tests/Feature/ExecutiveOverviewAuthorizationTest.php`
- `tests/Feature/ExecutiveOverviewA4FreshAuthorizationTest.php`
- `docs/dashboard/ARNA-EXECUTIVE-OVERVIEW-A4-SECURITY-VERIFICATION.md`
- `docs/architecture/organization-domain-contract.md`
- `docs/architecture/document-records-lifecycle-contract.md`
- `docs/calendar/ARNA_CALENDAR_A3_2_CORE_PERSISTENCE_API_CONTRACT.md`
- `docs/calendar/ARNA_CALENDAR_OWNING_DOMAIN_AUTH_AND_REMINDER_OUTBOX_CONTRACT.md`
- `docs/communication/ANNOUNCEMENTS-001.md`

### App
- `docs/dashboard/ARNA-DASHBOARD-A3-AUDIENCE-PERMISSION-POLICY-2026-11-09.md`
- `docs/dashboard/ARNA-DASHBOARD-A3-POLICY-IMPLEMENTATION-RECONCILIATION-2026-11-09.md`
- `docs/dashboard/ARNA-DASHBOARD-A3-TECHNICAL-SPEC-2026-11-08.md`
- `src/features/executive-overview/api.ts`
- `src/features/executive-overview/service.ts`
- `src/features/executive-overview/ExecutiveOverviewView.vue`
- `src/features/governance/api.ts`
- `src/features/communications/api.ts`
- `src/router/routes-workspace.ts`
- `tests/executive-overview-route-contract.test.mjs`
- `tests/executive-overview-security.spec.mjs`

## 9. A2 closure and stage gate

| Work item | Status |
|---|---|
| Confirm frozen Executive Overview audience and exact backend predicates | **VERIFIED** |
| Reconcile entry permission, role grants and wildcard exclusion | **VERIFIED** |
| Reconcile Finance widget permissions and entity policy | **VERIFIED** |
| Inventory existing platform and domain permission slugs | **VERIFIED** |
| Identify missing canonical Organization permission registration | **UNRESOLVED — explicit A3 dependency** |
| Inspect Finance source contracts and accounting limitations | **VERIFIED** |
| Inspect Governance source records and lifecycle gaps | **VERIFIED** |
| Inspect People/Organization source records and read-policy gaps | **VERIFIED** |
| Inspect Documents workflow and authorization contracts | **VERIFIED** |
| Inspect Communication/Calendar source contracts | **VERIFIED** |
| Inspect Audit/Security, Platform Health and Intelligence evidence | **PARTIAL — bounded source capability confirmed; full product contracts absent** |
| Classify every A1 KPI by source readiness | **VERIFIED** |
| Runtime/live production grants and role state | **NOT INSPECTED — intentionally outside read-only source A2** |
| A3 implementation | **NOT AUTHORIZED** |
| Merge / deployment | **NOT AUTHORIZED** |

**A2 conclusion:** source reconciliation is complete for the requested design-baseline decision. The remaining gaps are not missing A2 work; they are explicit domain capability and authorization prerequisites for future A3 scope. No A3 implementation should start until a separate Owner authorization names the permitted A3 slice and accepts the scope boundaries above.

**Preservation:** API A4 baseline `e7a5c04ece8e893ed99914f43664aad84683c726` and App A4 baseline `a1d98463cf324835379de9d627a7971272a0fb81` remain unchanged by this A2 inspection. The documentation branch is separate and must not be merged without separate authorization.
