# ARNA App — A3 Cleanup Implementation Record

Date: 2026-11-04
Branch: audit/arna-repository-consolidation-2026-11-04
Base: main @ ca97c1ac0152c9b2a5dcf562b52575c0070b1d30

## Launcher API contract correction

Updated src/features/launcher/service.ts:
- Removed the historical 404-to-empty conversion.
- A successful HTTP 200 response with [] remains the legitimate empty state.
- HTTP 404 and all other API failures now propagate to the existing composable error state.
- Removed the now-unneeded local isNotFoundError helper.
- Updated stale comments that described GET /api/launcher as not yet deployed.

The API repository's current routes/api.php registers GET /api/launcher inside the authenticated tenant-scoped route group. Treating a missing route as an empty list would conceal deployment or route-registration defects.

## Environment ignore consistency

Updated .gitignore to explicitly unignore .env.public, matching the existing exceptions for workspace, portal and admin. No environment values were modified or reproduced.

## Preserved

- All four independent application entry points/build outputs.
- Public-site route isolation.
- Workspace/Portal/Admin authentication and router boundaries.
- All domain components, services, routes, API clients, styles, assets and tests.
- Duplicate static deployment files pending proof of separate-host usage.
- All unrelated branches and open PRs.

## Verification status

- Source/API contract reconciliation: PASS (static inspection).
- Type-check: NOT RUN.
- Four production builds: NOT RUN.
- Frontend tests/smoke: NOT RUN.
- Browser/device/accessibility regression: NOT RUN.
- Production deployment: NOT RUN.

This is a proposed cleanup branch, not a production release. Merge remains gated on exact-head verification.

## Additional confirmed cleanup and integration

- Retired four unreferenced duplicate legacy files: AuthLayout/api.ts, AuthLayout/service.ts, router/pages/error-labels.ts and router/pages/shell-labels.ts. The canonical auth services and router-level label modules remain.
- Registered the existing DashboardView at /dashboard with dashboardViewLabels, repairing the pre-existing workspace sidebar link.
- Connected WalletOpenForm to WalletListView. The previously no-op New wallet action now opens the form and refreshes the first list page after successful creation.
- Added dedicated dashboard-route and wallet-open-form contract tests.
- Corrected public-site WCAG contrast for dark-eyebrow text (#694d0a; 7.74:1 against #fffdf7) and aligned the public brand links' accessible names with their visible corporate and product wordmarks.
- Updated exact-pinned dependencies within existing major versions: axios 1.21.0, vue 3.5.44, vite 6.4.5; refreshed vulnerable transitive dependencies. Post-refresh npm audit reports 0 high/critical and 3 moderate advisories. The remaining advisories require vue-tsc 3.x, so no unapproved major upgrade was forced.
- A Vue-aware source-reachability scan with all four application roots and alias resolution reports 45 file-level unused candidates, all within reusable component-library primitives/composites/patterns or the two standalone AppShell components AbstractBackground and LanguageSelector. No unreferenced feature page/service remains after the dashboard and wallet integrations. These reusable library components are retained intentionally.

## A4 verification

- Type-check, all four production builds, static asset checks, public build smoke, theme contracts, responsive shell contract, wallet form contract and dashboard route contract: PASS at code SHA 82e3c5779d8370cd0cdfe8b84b5abd5700c826d4 (later commits added public-site accessibility fixes and browser-test wiring).
- npm audit high/critical gate: PASS after non-major refresh.
- Initial public Playwright/Axe run: 7 PASS, 2 FAIL; failures were the gold eyebrow contrast and brand accessible-name mismatch. Both defects are corrected. Re-run of browser and WCAG 2.2 AA contracts is in progress.
- Production deployment: NOT RUN.

