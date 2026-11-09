## Owner decision — A3 initial audience and permission-grant policy (2026-11-09)

**Status: FROZEN for A3 implementation.** This policy governs the initial ARNA Executive Overview release. It does not authorize merge or deployment.

### 1. Initial audience
- `ceo` and `president`: eligible for the Executive Overview entry point.
- `finance_manager`: eligible for the entry point for Finance-domain widgets only, and only where the existing Finance authorization (including `finance.report.view`) permits the requested metric.
- No other role is included in the initial audience. In particular, `board`, `shareholder`, `cashier`, generic `manager`, `hr_manager`, `tenant_admin`, `platform_admin`, and `super_admin` are not granted Executive Overview access by default. Their existing domain and administrative permissions remain unchanged.
- CFO/CTO are organizational titles, not assumed role slugs. No role mapping or dashboard grant is inferred from a title alone.

### 2. Entry permission and grants
- Introduce the dedicated tenant-scoped permission `dashboard.executive.view`.
- Initial role grants: `ceo`, `president`, and `finance_manager` only.
- Do not use wildcard grants, global grants, or `app.admin.access` as substitutes.
- Do not alter existing role grants beyond adding this one permission to the three approved roles.
- If any of the three role slugs is absent in the target role registry, fail closed and report it; do not create or rename roles as part of this change.

### 3. Per-widget authorization (mandatory second gate)
The entry permission does not grant access to underlying domain data. Each widget must independently enforce the owning domain's existing backend policy, tenant scope, authorized legal-entity scope, and any resource-level restrictions. Examples:
- Finance metrics: existing Finance policy and `finance.report.view`; `finance_manager` receives only the Finance widgets it is already authorized to read.
- Governance, shareholder, People, Organization, Files, Notifications and Calendar: require their own verified canonical permissions and backend policy. No inferred grants.
- If a permission slug, policy, source contract, role grant, or entity scope is unverified, omit the widget and record the reason; never return data on the strength of `dashboard.executive.view` alone.

### 4. Scope and isolation
- Resolve tenant from trusted authenticated server context, never from a client-supplied tenant identifier.
- Restrict results to entities the authenticated principal is authorized to access. No cross-tenant or cross-entity aggregation by default.
- Cache keys and invalidation must include tenant, principal/authorization scope, entity scope, period, metric and contract version. Clear sensitive client state on logout and tenant switch.
- Platform administration is not business-data authorization. Administrative roles receive no implicit Executive Overview or domain-data grants.

### 5. Exclusions and change control
- No board-wide or shareholder-wide executive dashboard in this initial release.
- No CFO/CTO title-to-role mapping without a canonical role record and explicit grant.
- No new domain permission families, role creation, role renaming, broad role sync, or permission widening.
- Any expansion of audience, widget permissions, cross-entity consolidation, or role grants requires a separate Owner decision and auditable change.

**Implementation consequence:** build the route and authorization plumbing against this frozen policy; enable only widgets whose domain contracts and permissions are verified. A3 does not authorize merging this PR or deployment.

## 6. A3 implementation reconciliation — 2026-11-09

This section records how the frozen policy is enforced by the A3 source implementation. It does not change the approved audience or authorize production grants.

### Canonical source verification
- Canonical role definitions confirm ceo and president as tenant-scoped roles.
- finance_manager is application-scoped to Finance and tenant-bound.
- The canonical Finance role grant map includes finance.report.view and finance.entity.view for finance_manager.
- ceo and president have app.finance.access only from the Finance grant map; neither receives finance.report.view or finance.entity.view from the existing canonical grants.
- The canonical PermissionCatalogue now defines dashboard.executive.view as tenant-scoped, non-system permission.
- The canonical role grant map includes the permission only for ceo, president, and finance_manager.

### Wildcard and direct-grant protections
- Existing super_admin wildcard and platform_admin / tenant_admin scope:tenant grants would inherit any new tenant permission if no exception were applied.
- RolePermissionSeeder therefore removes dashboard.executive.view from resolved grant IDs for every role outside the frozen three-role allowlist, after wildcard resolution.
- ExecutiveOverviewAccessPolicy additionally requires an active approved role whose tenant_id equals the trusted resolved tenant. A direct user-level grant or platform role alone cannot admit a caller.
- No existing domain permission was added to any role. No wildcard, global, app.admin.access, or platform-administration grant is used as a substitute.

### API and frontend enforcement
- The API endpoint is tenant-membership protected and requires dashboard.executive.view.
- Finance widget generation independently checks finance.report.view and the existing LegalEntityPolicy for each entity before invoking the existing FinancialReportService trial-balance implementation.
- Finance results remain per-entity; there is no cross-entity or cross-currency consolidation.
- The response contains only authorized widgets. It does not include omitted_widgets, inaccessible widget keys, denial reasons, permission slugs, or hidden-domain metadata.
- Financial overview responses are marked private, no-store.
- The App has a separate /executive-overview route and sidebar entry, both gated by dashboard.executive.view. The existing /dashboard feature launcher is preserved.
- Client state is cleared and reloaded when the effective tenant changes; requests are cancelled when superseded or the view is unmounted.

### Evidence boundary and remaining gates
- Verified: checked-in canonical role/permission catalogues and source grant maps at the A3 API branch; frontend route and navigation source at the A3 App branch.
- Not verified: live production database role rows, production role-permission pivots, direct user permission assignments, or any live production access state. No production database was queried or modified.
- Not yet verified: exact-HEAD API/App test results, negative tenant-isolation tests, cache/session transition tests, independent security review, A4 acceptance.
- The permission seeder change is source code only. Production roles do not receive the new permission until a separately approved deployment/seeding operation.
- Merge and A5 deployment remain separately gated.
