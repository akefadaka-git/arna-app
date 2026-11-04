# ARNA App — A2 Usage and Dependency Reconciliation

Date: 2026-11-04
Baseline: main ca97c1ac0152c9b2a5dcf562b52575c0070b1d30
Working branch: audit/arna-repository-consolidation-2026-11-04

## Confirmed contract mismatch

The backend routes/api.php registers GET /api/launcher and documents that the historical missing-route defect was fixed. The frontend src/features/launcher/service.ts still:
- describes the endpoint as not yet deployed;
- treats HTTP 404 as an empty application catalogue;
- stamps the launcher store with an empty array on 404.

This behavior hides an API route, deployment or gateway regression. A legitimately empty launcher catalogue should be a successful 200 response containing an empty array. A 404 should reach the existing error state. A3 will remove the 404 suppression and reconcile the comments.

## Configuration consistency

All four environment files are tracked. .gitignore has exceptions for .env.workspace, .env.portal and .env.admin but omits .env.public. A3 will add the missing exception. No environment values are reproduced or modified.

## Intentional code boundaries

- Four entry points and four independent builds are required; retain.
- Public site has an intentionally isolated route table; retain.
- Workspace, portal and admin share boot-order requirements but differ in route scope and auth boundary; do not flatten without dedicated regression evidence.
- Wallet monetary formatting is shared through a Loans re-export; do not duplicate.
- Duplicate .htaccess and favicon blobs may be required at separate static deployment roots; retain pending host-path verification.

## Competing Admin PR contract

PR #36 and #37 overlap in route files and central Admin views. PR #36 expects platform.identity.read / platform.rbac.read / platform.tenancy.read. PR #37 expects tenant.list / user.list / role.list / permission.list and adds a route-guard change that evaluates every matched route record. Their corresponding API PRs #84 and #85 use different security models. These PRs must be reconciled as a single API/App contract; do not merge both pairs independently.

## Dependency security audit and remediation

The initial npm audit found 11 advisories: 7 high, 4 moderate, 0 critical. A compatible, non-major refresh updated:
- axios 1.7.9 -> 1.21.0
- vue 3.5.13 -> 3.5.44
- vite 6.0.5 -> 6.4.5
- vulnerable transitive dependencies were refreshed through npm audit fix.

The updated package.json and package-lock.json are committed to the audit branch. Post-refresh npm audit reports 3 moderate, 0 high, 0 critical. All 3 remaining advisories flow through vue-tsc 2.1.10 / @vue/language-core / minimatch; the available fix requires vue-tsc 3.3.14, a major upgrade. The existing project rule requires an explicit architecture decision for major dependency upgrades, so that version is not forced. The frontend CI now blocks high and critical npm advisories while reporting all remaining findings.

lucide-vue-next 0.468.0 emits an upstream deprecation warning in npm ci, but it is not among the reported security advisories. Retain until a separately tested migration to @lucide/vue is approved.

## A2 status

- API/frontend launcher contract: VERIFIED.
- Four-build architecture: VERIFIED from package scripts and Vite descriptors.
- Environment ignore inconsistency: VERIFIED.
- Admin duplicate implementation group: IDENTIFIED; security design review required.
- Component import graph: NOT YET FULLY AUTOMATED.
- Build/type/tests: NOT RUN in A2.
- Production deployment: NOT RUN.

## Final Vue-aware source reachability reconciliation

A Knip run configured with all four application entry points, workspace/portal/admin route roots, the `@` alias, and `@vue/compiler-sfc` SFC parsing completed after the feature integrations and direct test dependency registration.

- 45 file-level unused candidates remain. They are confined to reusable component-library primitives/composites/patterns and the two standalone AppShell components `AbstractBackground` and `LanguageSelector`. They are intentionally retained as reusable design-system assets; no unreferenced feature page or feature service file remains.
- 30 unused exports and 126 unused exported types were reported. The majority are reusable component contracts, test helpers, and service/API operations. These are retained pending domain-owner confirmation rather than deleting potential public module contracts.
- Unlisted dependencies: 0; unresolved imports: 0.
- Added exact dev dependencies for the existing tests: `@vue/compiler-sfc@3.5.44`, `@playwright/test@1.64.1`, and `@axe-core/playwright@4.14.0`. Added `test:public-browser` and wired the browser/Axe suite into CI.

