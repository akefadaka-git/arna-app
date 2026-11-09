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