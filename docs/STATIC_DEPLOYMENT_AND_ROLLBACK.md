# Static Deployment and Rollback Guide

**Status:** Operational procedure derived from the current build scripts and Apache configuration. This is not evidence that any production deployment has been performed or that the target hosts are currently healthy.

## Deployment model

ARNA App produces four static site outputs. Production hosting serves the generated files; Node.js is a build-time tool and is not required as a production application server.

| Build output | Intended document root |
|---|---|
| `dist/` | `app.maalearna.com.et/httpdocs/` |
| `dist-portal/` | `portal.maalearna.com.et/httpdocs/` |
| `dist-admin/` | `admin.maalearna.com.et/httpdocs/` |
| `dist-public/` | `www.maalearna.com.et/httpdocs/` |

These mappings are also recorded in the package manifest. Confirm the actual hosting account, document root, DNS, and deployment method with the release owner before publishing.

## Build a release candidate

Use the exact commit intended for release. Prefer the lockfile and the repository's supported Node/npm versions.

```bash
npm ci
npm run build
npm run verify:build
npm run test:public-build-smoke
npm run test:brand-palette-contract
```

Expected outputs are `dist/`, `dist-portal/`, `dist-admin/`, and `dist-public/`. The build preparation script ensures each output has a root `index.html`. The verifier checks generated entry references, local assets, Apache configuration, CSP API allow-list, and SPA fallback.

The current frontend CI workflow uploads all four outputs as a commit-specific artifact named `arna-frontend-build-<commit-sha>` with a 14-day retention period. Retrieve the artifact from the successful workflow for the exact release SHA; do not substitute an artifact from another commit.

## Pre-deployment gate

Before uploading any files, record and confirm:

- [ ] Owner-approved release scope and exact source commit SHA.
- [ ] Successful exact-head frontend CI and required checks.
- [ ] All four expected outputs exist and pass `npm run verify:build`.
- [ ] The intended mode's API base URL is correct for the target environment.
- [ ] API CORS, credentialed request, authentication/CSRF, and tenant behavior have been verified by the API/environment owners.
- [ ] The deployed CSP `connect-src` matches the intended API origin.
- [ ] The target host and document root are confirmed for each application being released.
- [ ] A complete backup of the current document root is stored outside the directory being replaced.
- [ ] The previous release's exact artifact/commit and recovery owner are recorded.
- [ ] A maintenance/communication decision is made if the change affects user-visible behavior.

A successful static build is not a substitute for API compatibility, browser acceptance, accessibility, or production smoke tests.

## Publish

1. Deploy only the application outputs included in the approved release scope.
2. Preserve the generated root `index.html`, hashed assets, manifest/favicon assets, and copied `.htaccess` together as one release unit.
3. Do not mix files from different build commits. A new `index.html` can reference hashed assets that do not exist if the upload is incomplete.
4. Use the hosting platform's supported atomic release/swap facility if available. If it is not available, use a controlled maintenance window and a complete pre-deployment backup; do not improvise a destructive delete-and-copy procedure.
5. Do not modify the API, database, DNS, certificates, or other application document roots as part of a frontend-only deployment unless separately authorized.

## Post-deployment smoke checks

For every application that was released:

- Load its hostname over HTTPS and confirm the expected application entry renders.
- Hard-refresh and confirm generated JavaScript, CSS, images, fonts, and manifest assets load without 404s.
- Open a representative nested route directly and refresh it to verify Apache SPA fallback.
- Confirm security headers and the CSP are present and the browser can connect only to the intended API origin.
- Verify login/session behavior and a small set of read-only domain screens against the intended API, where authorized.
- Inspect browser console and network errors.
- Record timestamp, hostname, release SHA, artifact name, operator, and results.

Do not report a hostname as healthy based only on a successful upload.

## Rollback

Rollback is a static-asset restoration, not a database rollback:

1. Stop further promotion and record the failure, affected hostname(s), and current release SHA.
2. Restore the complete previous document-root snapshot or previous immutable release directory, including its matching `index.html`, hashed assets, manifest, and `.htaccess`.
3. Do not restore only `index.html` or only the asset directory; they must come from the same build.
4. Purge hosting/CDN caches only where the configured cache layer requires it. The shipped Apache rules make `index.html` non-cacheable and hashed assets immutable; do not weaken these policies as a quick fix.
5. Re-run the post-deployment smoke checks and verify the restored release SHA.
6. Preserve the failed release artifact and logs for diagnosis. Record the rollback decision and obtain authorization before attempting another release.

This procedure does not authorize or describe rollback of API code, database migrations, backend data, DNS, or infrastructure. Those require their own service-specific rollback plans and approval.

## Hosting configuration notes

The repository's `public/.htaccess` is copied into each build output. It provides HTTPS redirection, SPA fallback, security headers, CSP, cache policy, MIME types, compression, UTF-8, and disabled directory listing. It assumes the relevant Apache modules are available. Validate actual host behavior; configuration presence in a build is not proof that the host honors it.

The current CSP allows `connect-src 'self' https://api.maalearna.com.et`. If the API origin changes, update the approved environment configuration and CSP together through review, then ensure `npm run verify:build` passes. Do not add a wildcard origin as a workaround.
