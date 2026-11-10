# ARNA Admin Central Control Plane — Frontend Reference

**Document ID:** ARNA-ADM-CP-A2-FE-001  
**Version:** 1.1.0  
**Status:** Owner-approved frontend reference to the canonical A2 contract  
**Owner:** Akefa Ayele Daka  
**Date:** 10 November 2026

## Canonical authority

The binding system-wide specification is maintained in the API repository:

[ARNA Admin Central Control Plane — Final A1 Capability Inventory and Owner-Approved A2 Implementation Contract v1.1.0](https://github.com/akefadaka-git/arna-api/blob/docs/admin-control-plane-a2-contract-v1/docs/architecture/ARNA-ADMIN-CENTRAL-CONTROL-PLANE-A2-CONTRACT.md)

This file is a frontend integration reference, not a competing copy of the API authorization contract. If the documents appear inconsistent, the canonical API contract controls identity, tenant context, authorization, data scope, state transitions, audit, and API behavior. Record and resolve any inconsistency through Owner-governed change control; do not silently reinterpret it.

## Approval and stage boundary

The Owner approved saving and freezing the A2 design contract. This does **not** authorize frontend implementation, API implementation, database migration, merge, release, or deployment.

- A1: inventory evidence complete; formal closure remains pending reconciliation of identified schema-authority issues.
- A2: read-only reconciliation and design validation.
- A3: implementation requires separate explicit authorization.
- A4: exact-HEAD verification and independent review.
- A5: merge/release/deployment requires separate approval.

## Four application surfaces

| Application | Route source | A1 route count |
|---|---|---:|
| Workspace | `src/router/routes-workspace.ts` | 29 |
| Shareholder Portal | `src/router/routes-portal.ts` | 6 |
| Admin Console | Admin router and feature modules | Existing routes plus candidate identity/RBAC/tenant views |
| Public Corporate Website | `public-entry/main.ts` | 8 |

Counts reflect the 10 November 2026 A1 evidence snapshot and must be refreshed against the exact A2 base SHA.

## Admin integration requirements

The Admin integration must reconcile the following capability areas without displacing current functionality:

1. Dashboard / command centre.
2. Existing public-content review.
3. Existing corporate website CMS.
4. Existing tenant-bound audit and security-event review.
5. Tenant directory and membership views.
6. Identity directory and tenant-scoped identity lifecycle.
7. Role and permission catalogue/lifecycle views, subject to canonical schema reconciliation.

**Preservation requirement:** the candidate identity/RBAC/tenant UI branch must not omit the current corporate-site CMS or audit/security routes, sidebar entries, permission guards, breadcrumbs, or tests. Preserve both existing capabilities during any later rebase or port.

## Frontend security contract

- Client-side route guards and hidden controls are UX controls, not authorization boundaries.
- The API remains authoritative for principal identity, tenant resolution, active membership, permissions, data filtering, and state transitions.
- Never accept a tenant identifier from local state, query parameters, request body, or headers as proof of authority.
- Display only fields returned by the API's approved response contract; do not derive sensitive identity or security fields from cached client state.
- Handle 401, 403, expired tenant context, revoked membership, validation errors, and server failures distinctly.
- Do not cache sensitive cross-tenant directory data in a way that survives principal or tenant-context changes.
- After membership or role changes, refresh relevant authorization-derived UI state; do not assume a successful mutation means every cached permission has updated.
- Do not expose deferred capabilities such as direct per-user tenant grants or account-wide suspension.

## Required UI behavior for later A3

When separately authorized, each Admin workflow must include:
- Responsive mobile-first layout and accessible keyboard/focus behavior.
- Explicit loading, empty, error, forbidden, and stale-context states.
- Server-side pagination/filtering contracts; tenant scoping must occur before counts and pagination.
- Confirmation and reason capture for high-impact membership/RBAC actions where the API contract requires them.
- No optimistic UI that presents a privileged mutation as complete before the API confirms success.
- Clear distinction between platform-level read-only views and tenant-scoped administration.
- Audit context or trace reference where appropriate, without exposing private audit payloads.
- Tests for direct route access, forged tenant context, forbidden actions, stale session/context, and preservation of CMS/audit navigation.

## Existing implementation proposals

The A1 review recorded Admin frontend PRs #36 and #37 as overlapping, open/unmerged proposals. Their recorded A1 head SHAs were:
- PR #36: `ff05ecff36004914a30cbca9b68d7efed5aaea49`
- PR #37: `e3a92a7ec256bc27c9895776d33d21535940295f`

These are historical refs. Before any A3 work, refresh PR state, exact head/base SHAs, changed files, reviews, workflow runs, and merge base. Treat #37 as an implementation reference only after reconciliation; do not merge it independently or discard useful work without inspection.

## Frontend verification gates for A4

At the exact candidate HEAD, record and link:
- `npm ci` result and Node/npm versions.
- `npm run type-check`.
- `npm run build` for all four application modes.
- `npm run verify:build`.
- Existing public-build smoke and brand-palette contract tests.
- Admin route/guard/navigation tests.
- Workspace, Portal, and Public Website regression checks.
- CMS and audit/security route/navigation regression evidence.
- Responsive/mobile and accessibility checks for changed screens.
- Exact workflow run IDs and artifact references.

A changed commit invalidates evidence for the affected code and requires re-verification. A passing frontend build does not establish backend authorization correctness or production readiness.

## Current disposition

| Item | Status |
|---|---|
| Frontend route inventory | PASS at A1 snapshot |
| Admin capability assessment | PASS at A1 snapshot |
| Existing CMS preservation requirement | BINDING |
| Existing audit/security preservation requirement | BINDING |
| API identity/RBAC/tenant authority | Defined by canonical API contract |
| Frontend implementation | NOT AUTHORIZED |
| Merge/deployment | NOT AUTHORIZED |

**Next permitted action:** read-only A2 reconciliation of the Admin routes, navigation, guards, API clients, and competing PR branches against the canonical API contract. No source modification is authorized until a separate A3 approval.

*End of frontend reference.*
