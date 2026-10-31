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

These are the intended build/deployment mappings, not a claim that each artifact is currently deployed or that a production host is healthy. Production hosting serves static assets; it does not run a Node.js application server.

## Frontend capabilities and domain organization

Shared application foundations include routing, layouts, reusable components, state stores, styles, and API integration. Domain-oriented feature folders on `main` include:

- Authentication and dashboard
- People and shareholder experiences
- Governance
- Documents and File Management
- Loans and Wallet
- Public content and portal experiences
- Application launcher

Feature availability and completeness vary by domain and release. A folder, route, mockup, or open pull request is not proof that a workflow is complete or production-ready. The API remains authoritative for identity, tenant scoping, permissions, business rules, and state transitions.

## Technology

- Vue 3 and TypeScript
- Vite 6
- Vue Router and Pinia
- Axios
- Lucide Vue icons
- `vue-tsc` for TypeScript/Vue type checking
- Node.js and npm for development and static builds

Versions are pinned in `package.json` and `package-lock.json`. The repository's `.node-version` currently specifies Node.js 22; `package.json` declares Node.js 20 or later and npm 10 or later. The current frontend CI workflow uses Node.js 20.

## Getting started

Prerequisites: Node.js 20+ (Node.js 22 is the repository's local version pin) and npm 10+.

Install the locked dependencies:

```bash
npm ci
```

Start the enterprise workspace:

```bash
npm run dev
```

Start another application independently:

```bash
npm run dev:portal
npm run dev:admin
npm run dev:public
```

## Verification and builds

Run the Vue/TypeScript check:

```bash
npm run type-check
```

Build all four applications. This runs the type check, builds the four Vite modes sequentially, and prepares the static outputs:

```bash
npm run build
```

Verify the generated static outputs and deployment policy:

```bash
npm run verify:build
```

Run the focused repository contract tests:

```bash
npm run test:public-build-smoke
npm run test:brand-palette-contract
```

The `frontend-ci.yml` workflow runs on pull requests targeting `main` and pushes to `main`, `feat/**`, and `test/**`. It installs with `npm ci`, runs the full build, verifies the static outputs, runs the public-build smoke test and brand-palette contract test, and uploads commit-specific build artifacts. A documentation-only branch may not receive a push-triggered run; the pull-request workflow is the relevant verification path.

A command listed here is an available verification command, not evidence that it has been executed. Report results against the exact commit SHA and link the corresponding workflow run.

## Repository map

| Path | Responsibility |
|---|---|
| `workspace-entry/` | Workspace Vite entry point |
| `portal-entry/` | Shareholder portal entry point |
| `admin-entry/` | Administration entry point |
| `public-entry/` | Public website entry point |
| `src/core/` | Shared application/core foundations |
| `src/features/` | Domain-oriented frontend features |
| `src/components/` | Shared UI components |
| `src/layouts/` | Application layouts |
| `src/router/` | Route composition |
| `src/stores/` | Shared client state |
| `src/styles/` | Shared styling and design tokens |
| `public/` | Static public assets |
| `scripts/` | Static-build preparation and verification |
| `tests/` | Node-based frontend contract and smoke tests |
| `.github/workflows/` | GitHub Actions verification workflows |
| `docs/` | Architecture, brand, UI/UX, domain, and governance documents |

## Architecture and security boundaries

1. Keep the four application entry points and their output directories independent while reusing shared foundations.
2. Keep domain-specific frontend code within its owning feature area. Shared shell/router integration should remain narrow and explicit.
3. Do not duplicate backend business rules in the browser. UI visibility is not an authorization boundary.
4. Treat API responses and server-side authorization as authoritative. Tenant isolation and access control must be enforced by the API.
5. Never place credentials, private keys, tokens, or other secrets in source files or client-exposed `VITE_*` variables. Values compiled into a browser bundle are public to its users.
6. Preserve the approved ARNA emblem, brand meaning, and semantic token direction. Do not silently replace frozen design tokens or component contracts.
7. Keep Amharic-first usability, English support, mobile responsiveness, accessible contrast, keyboard navigation, and clear loading/empty/error/permission states in scope.
8. Do not add a new dependency, change a major version, alter deployment behavior, or restructure application boundaries without a reviewed and authorized change.

## Brand and product identity

The approved brand direction is **The Living Leader**:

> **ARNA — Lead by Example.**  
> **Rooted in Maale. Built for Tomorrow.**

The identity expresses leadership through responsibility, productive work, trust, integrity, and service—not superiority over people. The approved brand specification is the source for brand meaning, palette, typography, emblem rules, and adoption governance.

- [Brand Identity Master Specification v1.0](docs/BRAND_IDENTITY_MASTER_SPEC_V1.0.md)
- [Brand palette/token reconciliation candidate](docs/BRAND_PALETTE_TOKEN_RECONCILIATION_CANDIDATE.md)
- [Public content governance contract](docs/PUBLIC_CONTENT_GOVERNANCE_CONTRACT.md)

Brand-direction approval does not by itself certify that every UI surface has adopted the specification. Runtime adoption must be verified against the implementation.

## Project documentation

- [ARNA UI/UX Enhancement Master Strategy v1.2](docs/ARNA_UI_UX_Enhancement_Master_Strategy_v1.2.md) — approved programme scope, phased roadmap, acceptance criteria, gates, reporting system, and Phase 0 closure record.
- [Operations Finance UI implementation contract](docs/ARNA-OPERATIONS-FINANCE-UI-IMPLEMENTATION-CONTRACT.md)
- [Local Windows release handoff](docs/LOCAL_WINDOWS_RELEASE_HANDOFF.md)
- [Brand Identity Master Specification v1.0](docs/BRAND_IDENTITY_MASTER_SPEC_V1.0.md)
- [Public Content Governance Contract](docs/PUBLIC_CONTENT_GOVERNANCE_CONTRACT.md)

Consult the relevant domain contract before changing a domain workflow. The UI/UX strategy is the controlling reference for programme sequencing and its Owner approval gates.

## Contribution and change governance

All changes must follow [CONTRIBUTING.md](CONTRIBUTING.md). In particular:

- Keep changes bounded to the approved scope and preserve unrelated work.
- Use a focused branch and pull request; do not work directly on `main`.
- Identify the exact base/head commits, changed files, affected domains, dependencies, and verification evidence.
- Distinguish `VERIFIED`, `PARTIAL`, `MISSING`, `UNRESOLVED`, `UNKNOWN`, and `NOT RUN`.
- Do not claim completion from source inspection alone when runtime, accessibility, or workflow evidence is required.
- Merge, release, deployment, database operations, and backend changes are separate decisions and require their own explicit authorization.

## Current programme status

The Owner-approved UI/UX Enhancement Master Strategy v1.2 records **Phase 0 as closed with limitations**. It explicitly preserves unperformed runtime visual inspection, measured WCAG 2.2 AA evaluation, and comprehensive visual-regression work as outstanding evidence. The strategy also defines the authorization boundary for subsequent phases. This README does not override that strategy or certify production readiness.

## License and usage

No license is currently declared in this repository. Unless and until an explicit license is added, no open-source reuse or redistribution permission should be inferred from the repository's public visibility.
