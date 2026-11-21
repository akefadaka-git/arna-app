# ARNA Admin Control Plane — A2 Frontend Reconciliation Addendum

**Document ID:** ARNA-ADM-CP-A2-FE-RR-001  
**Version:** 1.0.0  
**Review date:** 10 November 2026  
**Status:** Read-only A2 frontend evidence; implementation not authorized  
**Canonical A2 findings:** [API repository A2 reconciliation report](https://github.com/akefadaka-git/arna-api/blob/docs/admin-control-plane-a2-contract-v1/docs/architecture/ARNA-ADMIN-CENTRAL-CONTROL-PLANE-A2-RECONCILIATION-REPORT.md)

## 1. Exact frontend repository baseline

Current `arna-app/main` reviewed at:

`76fb67a421b1a54e0529a3479e551a1d1e0c0d0f`

Current Admin route source: `src/router/routes-admin.ts`  
Current Admin navigation source: `src/router/admin-labels.ts`

## 2. Existing current-main Admin routes to preserve

Current main includes:
- `/admin/public-content` — `public-content.review`
- `/admin/corporate-site` — `public-content.review`
- `/admin/audit-security` — `audit.view` or `security-event.view`

Current main Admin sidebar includes:
- Dashboard.
- Audit/security centre.
- Public-content review.

There is no separate corporate-site sidebar entry in the current main navigation snapshot; the corporate-site route itself must nevertheless be preserved.

## 3. Competing PR state

| PR | Head SHA | Base SHA at creation | Ahead | Behind | State |
|---|---|---|---:|---:|---|
| #36 | `ff05ecff36004914a30cbca9b68d7efed5aaea49` | `ca97c1ac0152c9b2a5dcf562b52575c0070b1d30` | 4 | 72 | Open / draft |
| #37 | `e3a92a7ec256bc27c9895776d33d21535940295f` | `ca97c1ac0152c9b2a5dcf562b52575c0070b1d30` | 11 | 72 | Open / draft |

Both branches diverge from current main and must not be merged independently.

### PR #36

- Read-only platform identity/RBAC/tenant directory UI.
- Depends on global platform read permissions and the API #84 endpoint design.
- Its PR description states frontend tests/build were not run at delivery.
- It does not provide the tenant-scoped lifecycle UI present in #37.

Disposition: retain as a read-only UI reference; adapt endpoints to the canonical `/api/admin/platform/*` namespace and reconcile current routes/navigation.

### PR #37

- Tenant-scoped identity, membership and RBAC screens.
- Includes create/update profile, add/suspend/reactivate/revoke membership, role assignment and role-permission editing.
- Uses tenant-scoped API paths and existing action permissions.
- Its frontend verification workflow completed successfully at the recorded PR head.
- Its branch does not preserve the current main audit/security route or audit/security sidebar item.
- It does contain the corporate-site route, which must remain present.

Disposition: preferred tenant-scoped UI reference, but not merge-ready. Port only after the API schema and endpoint contracts are reconciled.

## 4. Frontend integration boundary

The Admin UI should represent two distinct authority surfaces:

1. **Platform read-only directory:** identity/RBAC/membership visibility, explicit `platform.*.read` permissions, API namespace `/api/admin/platform/*`.
2. **Tenant-scoped administration:** identity and membership lifecycle plus tenant roles/permissions, resolved tenant context, existing `user.*`, `role.*`, and `permission.list` permission families.

Do not combine a platform-global identity list with tenant-scoped mutations in one screen unless the UI makes the authority and scope explicit and the API separately enforces each operation.

The API is authoritative. Client route guards, navigation filters, hidden controls, cached state, and current tenant selector are not authorization boundaries.

## 5. Required port/rebase checks for a later A3

- Rebase/port from current main SHA, not the stale PR base.
- Preserve current corporate-site route.
- Preserve current audit/security route and sidebar item.
- Preserve current public-content route and sidebar item.
- Add tenant/user/role/permission routes and navigation without replacing existing entries.
- Keep parent `app.admin.access` and child feature permission checks; verify the guard evaluates every matched route record.
- Verify platform read-only endpoints use `/api/admin/platform/*` and `platform.*.read`.
- Verify tenant-scoped mutation endpoints use tenant context and tenant-scoped permissions.
- Distinguish global tenant directory permission `tenant.list` from platform membership directory permission `platform.tenancy.read`.
- Ensure the UI never reports mutation success before the API confirms success.
- Test 401, 403, revoked membership, suspended membership, stale tenant context, network/server failure, and cross-tenant navigation.
- Re-run type-check, build, route/guard tests, all four app-mode builds, and mobile/accessibility checks at the exact candidate SHA.

## 6. Verification boundary

The A2 review fetched current main routes/navigation and the PR #36/#37 branch files. App #37's recorded frontend verification run passed at its PR head:

https://github.com/akefadaka-git/arna-app/actions/runs/41728377171

That run does not establish compatibility with current main or the canonical API contract. No frontend source, route, navigation, or PR branch was changed during this A2 review.

## 7. Status

| Item | Result |
|---|---|
| Current Admin routes/navigation inspected | PASS |
| PR #36/#37 metadata and divergence inspected | PASS |
| PR #37 current-main preservation gap identified | PASS |
| Platform vs tenant UI authority boundary | DEFINED |
| Frontend implementation | NOT AUTHORIZED |
| Merge | NOT AUTHORIZED |
| Deployment | NOT AUTHORIZED |

*End of frontend A2 reconciliation addendum.*
