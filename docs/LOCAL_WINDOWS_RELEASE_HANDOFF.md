# ARNA App — Local Release Candidate Handoff

Status: source candidate only. Automated tests and production builds have intentionally not been run for this handoff. Do not label this candidate production-ready until local verification passes.

## Baseline
- Repository: `akeayu/arna-app`
- Base branch at preparation: `main`
- Candidate branch: `release/local-candidate-2026-10-23`

## Candidate UI included
- Amharic-first corporate public homepage and public-site shell.
- Legal center route and accessible public-route smoke/contract tests.
- Governance overview with API-backed body counts, governance people directory, and membership detail route.
- Workspace navigation now opens the governance overview; the routes remain permission-gated by `governance.body.view`.

These are source-level consolidations from open draft work. The UI is not verified against the candidate API yet; any missing backend endpoints or permission grants must be resolved locally before release.

## Windows preparation
1. Install Node.js 20 or later and npm 10 or later.
2. Extract this branch into a new directory. Preserve existing work and do not overwrite an unrelated worktree.
3. Run `npm ci` from the repository root so the lockfile controls dependency versions.
4. Set the correct environment variables for each build mode. Never put secrets in `VITE_*` variables; these are embedded in browser bundles.
5. Build the four static applications with `npm run build`. The expected outputs are `dist/`, `dist-portal/`, `dist-admin/`, and `dist-public/`.
6. Run `npm run verify:build`, `npm run test:public-build-smoke`, and `npm run test:brand-palette-contract` locally. Review generated assets and browser console/network errors for each entry point.
8. Run `node --test tests/governance-route-contract.test.mjs` locally in addition to the scripts above.
9. Test login, logout, session expiry, tenant context, permission-denied states, forms, empty/error/loading states, and API failures against a local API.

## Deployment cautions
- The frontend is a static client. API authorization must remain authoritative; hiding a route or button is not access control.
- Verify the production API base URL, CORS, cookie/Sanctum configuration, HTTPS, and SPA fallback routing for each deployed hostname.
- Confirm every visible action has a real API operation; do not deploy placeholder or mock-data workflows as complete business functions.
- Keep a copy of the currently deployed static assets for recovery.

## Release gate
This branch is not evidence that all planned domains are implemented. Record the tested commit SHA, build/test outputs, API compatibility evidence, and hosting smoke-test results before release.
