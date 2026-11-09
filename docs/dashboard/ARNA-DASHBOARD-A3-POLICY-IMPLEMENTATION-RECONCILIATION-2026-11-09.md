# ARNA Executive Overview — A3 Policy-to-Implementation Reconciliation

**Date:** 2026-11-09  
**Status:** Implemented on isolated feature branches; exact-HEAD verification pending  
**Authority:** Owner-frozen A3 audience and permission policy, 2026-11-09  
**Release boundary:** No merge, production role grant, deployment, or production data access authorized.

## 1. Reconciliation outcome

The implementation follows the frozen initial audience and preserves the existing ARNA authorization model. The Executive Overview entry permission is not a data permission. Every data widget must independently pass its domain authorization and tenant/entity policy.

## 2. Canonical role and permission records

The checked-in API source catalogues define the following roles:

| Role | Canonical scope | Tenant-bound | Existing Finance report grant |
|---|---|---:|---:|
| ceo | tenant | yes | no |
| president | tenant | yes | no |
| finance_manager | application: finance | yes | yes |

The Finance grant map gives finance_manager both finance.report.view and finance.entity.view. CEO and President receive Finance application access only; this implementation does not add Finance reporting or entity permissions to either role.

The canonical PermissionCatalogue now defines dashboard.executive.view with:
- scope: tenant
- category: dashboard
- is_system: false

The canonical role grant map adds this permission only to ceo, president and finance_manager.

**Evidence limitation:** these are source-catalogue records. The live production roles table, role_has_permissions pivot, direct user grants and production assignments were not queried.

## 3. Wildcard inheritance correction

A naive tenant-scoped permission addition would have widened access through existing wildcard grant behavior:
- super_admin receives the '*' grant.
- platform_admin receives scope:tenant.
- tenant_admin receives scope:tenant.

The API RolePermissionSeeder now filters dashboard.executive.view out of resolved grants for every role outside the frozen three-role allowlist, after wildcard resolution. This keeps the existing wildcard behavior for all other permissions while enforcing the dashboard-specific exception.

The API ExecutiveOverviewAccessPolicy requires an active approved role whose role tenant_id matches the trusted resolved tenant AND whose role_has_permissions pivot contains the active tenant-scoped dashboard.executive.view permission. A direct user-level grant cannot substitute for the role grant; a platform role alone cannot bypass the audience restriction.

No other role grant or domain permission is widened.

## 4. API implementation

- GET /api/dashboard/v1/overview is registered inside the existing auth:sanctum and tenant.membership route group.
- The route requires auth.permission:dashboard.executive.view and is rate-limited.
- The controller checks the approved tenant-bound role and its role_has_permissions pivot again, preventing direct-user-grant and wildcard-only bypasses. The policy also requires the Finance application to be active and the permission record to be global-catalogue or scoped to the trusted tenant.
- Finance widget output independently requires finance.report.view.
- Each legal entity is checked through the existing LegalEntityPolicy, which enforces finance.entity.view and the current tenant boundary.
- Authorized entities are reported separately using the existing FinancialReportService::trialBalance implementation. Entities with no chart-of-accounts rows are omitted; the dashboard does not manufacture a zero-balance widget for an unconfigured ledger.
- No cross-entity aggregation, cross-currency conversion, or client-side accounting calculation is introduced.
- Users without Finance report and entity permissions receive an empty widgets array. Finance widgets carry source domain, report key and calculation/adapter version; entities without a chart of accounts are omitted rather than displayed as synthetic zeroes.
- The response contains no omitted_widgets field and does not expose hidden widget keys, inaccessible domains, permission slugs, counts, or denial reasons.
- Financial responses use Cache-Control: private, no-store.

## 5. App implementation

- A separate /executive-overview route is added under the existing authenticated workspace layout.
- The route and sidebar item both require dashboard.executive.view and the approved role allowlist as UX gates; the backend remains authoritative for the tenant-bound role assignment.
- The existing /dashboard feature launcher remains separate and is not repurposed.
- The page renders only widgets returned by the API.
- As-of and generated timestamps use the shared `formatCalendarDate` utility; E.C. is the default and G.C. is displayed only under the user's existing calendar preference.
- The client clears the current overview before reloading on tenant change, cancels superseded requests and aborts on unmount.
- No inaccessible widget metadata is represented in the frontend contract.

## 6. Files changed

API:
- mases_core/src/Authorization/ExecutiveOverviewAccessPolicy.php
- database/seeders/Data/PermissionCatalogue.php
- database/seeders/Data/RolePermissionGrants.php
- database/seeders/RolePermissionSeeder.php
- database/seeders/PermissionSeeder.php (catalogue count documentation)
- database/seeders/MasesCoreSeeder.php (catalogue count documentation)
- app/Http/Controllers/ExecutiveOverviewController.php
- routes/api.php
- tests/Feature/ExecutiveOverviewAuthorizationTest.php
- tests/Feature/ExecutiveOverviewRouteTest.php

App:
- src/features/executive-overview/api.ts
- src/features/executive-overview/service.ts
- src/features/executive-overview/labels.ts
- src/features/executive-overview/ExecutiveOverviewView.vue
- src/router/routes-workspace.ts
- src/router/shell-labels.ts
- tests/executive-overview-route-contract.test.mjs

Documentation:
- ARNA-DASHBOARD-A3-TECHNICAL-SPEC-2026-11-08.md
- ARNA-DASHBOARD-A3-AUDIENCE-PERMISSION-POLICY-2026-11-09.md
- this reconciliation record

## 7. Verification and release gates

| Check | Status |
|---|---|
| Role slugs and role scopes in canonical source catalogue | PASS — source inspected |
| Existing Finance grants | PASS — source grant map inspected |
| New entry permission definition | PASS — source catalogue updated |
| Exact three-role grant map | PASS — source grant map updated |
| Wildcard inheritance exclusion | IMPLEMENTED — tests added, not yet run |
| Direct-grant/platform-role audience fence | IMPLEMENTED — tests added, not yet run |
| API route and controller | IMPLEMENTED — tests added, not yet run |
| Finance report/entity authorization | IMPLEMENTED — uses existing service and policy; unconfigured ledgers omitted |
| Unauthorized metadata disclosure correction | IMPLEMENTED |
| App route and navigation gating | IMPLEMENTED — permission and approved-role UX gates; contract test added, not yet run |
| Existing /dashboard preservation | PASS — route/component not replaced |
| Exact-HEAD API test execution | NOT RUN |
| Exact-HEAD App test/build execution | NOT RUN |
| A4 cross-tenant, entity and cache-isolation verification | NOT STARTED |
| Independent security review | NOT STARTED |
| Production database role/grant inspection | NOT PERFORMED |
| Merge / deployment | NOT AUTHORIZED |

## 8. Required next step

Run API and App verification against the final exact branch heads. Fix all failures, then perform A4 negative authorization, tenant/entity isolation, cache transition and response-disclosure tests. Do not enable production access by running seeders or applying migrations until A4 evidence is accepted and production rollout is separately authorized.
