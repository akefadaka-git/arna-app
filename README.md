# ARNA — Maale Arna Smart System | Frontend

**ARNA is the master name for the Maale Arna Smart System. MASES is the established legacy/product name used during the transition.**

ARNA is an Amharic-first, mobile-first enterprise platform. This repository contains its Vue 3 / TypeScript frontend: the enterprise workspace, shareholder portal, administration console, and public corporate website. The API/backend is maintained separately in [akefadaka-git/arna-api](https://github.com/akefadaka-git/arna-api).

> **Repository scope:** browser-side applications and shared frontend foundations. This repository does not own backend business rules, database operations, tenant isolation, or authoritative authorization.

## Applications

The project uses one package manifest, one lockfile, one dependency tree, and four independent static application builds.

| Application | Entry point | Build output | Intended host |
|---|---|---|---|
| Enterprise workspace | `workspace-entry/` | `dist/` | `app.maalearna.com.et` |
| Shareholder portal | `portal-entry/` | `dist-portal/` | `portal.maalearna.com.et` |
| Administration console | `admin-entry/` | `dist-admin/` | `admin.maalearna.com.et` |
| Public corporate website | `public-entry/` | `dist-public/` | `www.maalearna.com.et` |

These are intended build/deployment mappings, not proof that each artifact is deployed or that a production host is healthy. Production hosting serves static assets; it does not run a Node.js application server.

## Capabilities and domain organization

The source tree contains shared routing, layouts, reusable components, stores, styles, and API integration. Domain-oriented frontend areas currently include authentication, dashboard, files, governance, loans, people, portal, public content, shareholders, and wallet. This is a source-tree inventory, not a feature-completion or production-readiness claim. The API remains authoritative for identity, tenant scoping, permissions, business rules, and state transitions.

## Technology

- Vue 3, TypeScript, and Vite 6
- Vue Router and Pinia
- Axios and Lucide Vue icons
- `vue-tsc` for TypeScript/Vue type checking
- Node.js and npm for development and static builds

Versions are pinned in `package.json` and `package-lock.json`. `.node-version` specifies Node.js 22; `package.json` requires Node.js 20+ and npm 10+. The current frontend CI workflow uses Node.js 20.

## Getting started

Install the locked dependencies:

```bash
npm ci
```

Start the enterprise workspace or an individual application:

```bash
npm run dev
npm run dev:portal
npm run dev:admin
npm run dev:public
```

## Build and verification

```bash
npm run type-check
npm run build
npm run verify:build
npm run test:public-build-smoke
npm run test:brand-palette-contract
```

The aggregate build type-checks and builds all four modes sequentially, then prepares each static output. The verifier checks root entry points, generated JavaScript/CSS references, referenced local assets, deployed Apache configuration, the API-origin CSP allow-list, and SPA fallback. The CI workflow additionally runs the two focused contract/smoke tests and uploads commit-specific build artifacts.

The workflow runs for pull requests targeting `main` and pushes to `main`, `feat/**`, and `test/**`. A command listed here is not evidence it was executed. Report verification against the exact commit SHA and workflow run.

## Repository map

| Path | Responsibility |
|---|---|
| `workspace-entry/`, `portal-entry/`, `admin-entry/`, `public-entry/` | Four application entry points |
| `src/core/` | Shared application foundations and API client |
| `src/features/` | Domain-oriented frontend features |
| `src/components/` | Primitive, composite, and pattern UI components |
| `src/layouts/` | Application layouts and shells |
| `src/router/` | Route composition and guards |
| `src/stores/` | Client-side state |
| `src/styles/` | Shared styling and tokens |
| `public/` | Static assets and Apache configuration |
| `scripts/` | Static-build preparation and verification |
| `tests/` | Frontend contract and smoke tests |
| `.github/workflows/` | GitHub Actions workflows |
| `docs/` | Architecture, brand, UI/UX, domain, release, and governance documents |

## Architecture and security boundaries

1. Keep the four application entry points and output directories independent while reusing shared foundations.
2. Keep domain-specific frontend code within its owning feature area; keep shared shell/router integration narrow.
3. Do not duplicate backend business rules in the browser. UI visibility and route guards are not authorization boundaries.
4. Treat API responses and server-side authorization as authoritative. Tenant isolation and access control must be enforced by the API.
5. Never place credentials, private keys, tokens, or other secrets in source files or client-exposed `VITE_*` variables. Values compiled into a browser bundle are public.
6. Preserve the approved ARNA emblem, brand meaning, and semantic token direction. Do not silently overwrite frozen design tokens or component contracts.
7. Keep Amharic-first usability, English support, mobile responsiveness, accessible contrast, keyboard navigation, and clear loading/empty/error/permission states in scope.
8. Do not add dependencies, change major versions, alter deployment behavior, or restructure application boundaries without a reviewed and authorized change.

## Brand identity

The approved brand direction is **The Living Leader**:

> **ARNA — Lead by Example.**  
> **Rooted in Maale. Built for Tomorrow.**

The identity expresses leadership through responsibility, productive work, trust, integrity, and service—not superiority over people. The approved specification governs brand meaning, palette, typography, emblem rules, and adoption governance. Approval of the direction does not certify runtime adoption.

## Documentation

Use the [Documentation Index](docs/README.md) as the maintained catalogue.

- [Frontend Architecture and Integration](docs/FRONTEND_ARCHITECTURE.md)
- [Environment and Configuration](docs/ENVIRONMENT_CONFIGURATION.md)
- [Static Deployment and Rollback](docs/STATIC_DEPLOYMENT_AND_ROLLBACK.md)
- [UI/UX Enhancement Master Strategy v1.2](docs/ARNA_UI_UX_Enhancement_Master_Strategy_v1.2.md)
- [Brand Identity Master Specification v1.0](docs/BRAND_IDENTITY_MASTER_SPEC_V1.0.md)
- [Public Content Governance Contract](docs/PUBLIC_CONTENT_GOVERNANCE_CONTRACT.md)
- [Operations Finance UI implementation contract](docs/ARNA-OPERATIONS-FINANCE-UI-IMPLEMENTATION-CONTRACT.md)
- [Historical Local Windows Release Handoff](docs/LOCAL_WINDOWS_RELEASE_HANDOFF.md)

The Owner-approved UI/UX Enhancement Master Strategy v1.2 records Phase 0 as closed with limitations, including unperformed runtime visual inspection, measured WCAG 2.2 AA evaluation, and comprehensive visual-regression work. It remains the controlling reference for programme sequencing and approval gates; this README does not certify production readiness.

## Contribution and change governance

All changes must follow [CONTRIBUTING.md](CONTRIBUTING.md). Use focused branches and pull requests, preserve unrelated work, identify exact base/head commits, and report evidence as `VERIFIED`, `PARTIAL`, `MISSING`, `UNRESOLVED`, `UNKNOWN`, or `NOT RUN`. A passing CI run does not grant merge or deployment authorization. The Owner retains authority over scope, architecture, approvals, risk acceptance, merges, and releases.

## License and usage

No license is currently declared. No open-source reuse or redistribution permission should be inferred from repository visibility.
