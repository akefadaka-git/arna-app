# ARNA Public Website — Plesk Deployment Readiness Handoff

**Purpose:** prepare and verify the static public-site package for manual handling through the Plesk server. This document is not an authorization to deploy.

## Source and output

- Source repository: `akefadaka-git/arna-app`
- Public application entry: `public-entry/`
- Required build output: `dist-public/`
- Public build environment: `.env.public` sets the non-secret `VITE_API_BASE_URL=https://api.maalearna.com.et` at build time
- Apache/Plesk SPA rules: `public/.htaccess` is copied into the output; verify that the Plesk domain is served by Apache with the required rewrite/header modules enabled
- Official public origin: https://www.maalearna.com.et/
- Plesk destination mapping already documented by the repository: `www.maalearna.com.et/httpdocs/`
- Required brand asset: `public/logo.png`, emitted as `dist-public/logo.png`

Only the contents of `dist-public/` belong in the public website document root. Do not copy the workspace, portal, or admin build outputs into this document root.

## Package verification

Run the existing repository checks against one exact source commit:

```bash
npm ci
npm run build
npm run verify:build
npm run test:public-build-smoke
```

The GitHub workflow `Prepare ARNA public website package for Plesk` can prepare an immutable artifact for the selected SHA. It is a build-and-package check only; it does not connect to Plesk, upload files, change DNS, or deploy.

## Manual Plesk-side acceptance

The authorized Plesk operator performs the actual hosting action through the Plesk server interface, outside this repository workflow. Before replacing production files, confirm the intended domain and document root, preserve a rollback copy, and verify that the artifact SHA matches the approved release record.

After the Plesk-side action, verify the public homepage, Amharic and English routes, API-driven published content, contact submission path, canonical URL, social preview image, favicon, and `/logo.png`. Confirm that no admin drafts, private inquiries, quarantined media, or private asset paths are exposed.

## Backend and runtime dependencies

- The public site consumes published-only corporate content from the ARNA API.
- The frontend API origin is compiled from `.env.public`; it is public configuration, not a secret. Never place credentials or private keys in `VITE_*` variables.
- Configure `CORPORATE_SITE_URL=https://www.maalearna.com.et` in the API environment.
- The API's corporate-media scanner URL, bearer token, and Ed25519 public key must be supplied securely by the operator. Until a trusted scanner and key are configured, media publication remains fail-closed.
- Do not run production migrations or expose storage as part of this frontend handoff; those require their own authorized API release procedure.

## Release boundary

This handoff establishes package readiness only. Production deployment, DNS changes, Plesk credentials, server access, and post-deployment operations are outside GitHub Actions and outside this workflow. A separate Owner release authorization remains mandatory.
