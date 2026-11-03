# ARNA App Repository Audit — A1 Baseline

Date: 2026-11-04
Repository: akefadaka-git/arna-app
Default branch: main
Baseline commit: ca97c1ac0152c9b2a5dcf562b52575c0070b1d30
Audit branch: audit/arna-repository-consolidation-2026-11-04

## Inventory

- Recursive Git tree complete (GitHub reports truncated=false).
- 386 tracked files; 335 are under src/.
- 21 open pull requests and 27 branches at the audit baseline.
- No production files or data have been changed by this audit.

## Intentional independent application surfaces

The four Vite build entry points are explicit architecture, not standalone orphaned code:
- workspace-entry/ -> workspace build (dist/)
- portal-entry/ -> shareholder portal (dist-portal/)
- admin-entry/ -> admin console (dist-admin/)
- public-entry/ -> public corporate site (dist-public/)

The public entry intentionally uses its own route table and does not boot the authenticated application shell, auth guards, or session bootstrap. Do not consolidate these entry points into one router without a separate architecture decision.

## Exact duplicate blobs

1. .htaccess and public/.htaccess share blob 6d276c854b155d92ef6afae5eb9e4c6b7099036e. They may be consumed at different deployment roots; preserve until static-hosting behavior is verified.
2. favicon.png and public/favicon.png share blob 5cd306680ee25b4558557ca4c718518684a09d1e. Preserve pending asset-path/build verification.

## Configuration findings

- Four environment files are tracked: .env.workspace, .env.portal, .env.admin and .env.public.
- Their inspected variable names are VITE_API_BASE_URL and, where present, VITE_APP_NAME. No secret-like key names were observed in this limited key-name scan; values were deliberately not reproduced.
- .gitignore explicitly unignores workspace, portal and admin environment files but not .env.public, despite .env.public being tracked. Correct the ignore exception for consistency and future maintenance.
- VITE_* values are compiled into client bundles and must remain non-secret.

## Confirmed maintenance debt

- src/features/launcher/service.ts contains historical comments saying GET /api/launcher is not deployed, while the current API routes/api.php registers the endpoint and documents the historical fix. Reconcile stale comments with the current API contract; do not remove the working launcher service.
- workspace, portal and admin entry points have similar boot sequencing. Their shared sequence is intentional, but duplicated implementation should be evaluated for a safe shared bootstrap helper without changing per-app router, auth, storage, or trust boundaries.
- src/features/loans/service.ts re-exports formatAmount from the wallet feature. This is shared functionality, not evidence of duplicate implementation.
- package metadata still identifies the package as mases. This is naming/metadata debt, not unused code; preserve namespace and compatibility decisions during any rename discussion.

## Duplicate/competing implementation groups requiring contract reconciliation

- App PRs #36 and #37 both implement central Admin directory views/routes. Their permission contracts differ. PR #37 expects tenant.list, user.list, role.list and permission.list; PR #36 expects platform.identity.read, platform.rbac.read and platform.tenancy.read. Reconcile with API PR #84 or #85 before merging.
- Other open PRs for Dividend, Election, OCR, Calendar, Communication Hub, SSO, Governance and People are active work. Do not classify them as unused based solely on their absence from main.

## A1 disposition

- Baseline inventory: VERIFIED.
- Exact duplicate blob classification: PARTIAL; all identified duplicates have plausible deployment/documentation purposes.
- Environment ignore consistency: CONFIRMED GAP.
- Stale launcher comments: CONFIRMED DOCUMENTATION GAP.
- Unused-component/import graph analysis: NOT YET RUN.
- Build/type/test verification: NOT RUN in A1.
- Deletion/cleanup: NOT RUN.
- Production deployment: NOT RUN.

## Preservation requirements

Keep all four independent application surfaces, static deployment boundaries, historical UI/domain evidence, unrelated branch work, and existing production behavior. No bulk branch deletion or mass PR closure is authorized by this audit.

## Current disposition snapshot (2026-11-04)

- Current branches: 28 (includes this isolated audit branch).
- Current open PRs: 22 (includes audit PR #38).
- Six branches without an open PR remain untouched pending ancestry/age review.
