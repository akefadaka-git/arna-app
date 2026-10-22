# MASES / ARNA — Maale Arna Smart System

**ARNA is the master name for the Maale Arna Smart System. MASES is the established legacy/product name used during the transition.**

This repository contains the Vue-based client applications for the ARNA smart system: the workspace, shareholder portal, administration interface, and public corporate website. It is not a backend repository. Production hosting serves static frontend assets; the API/backend is maintained separately.

## Brand identity

ARNA's proposed brand direction is **The Living Leader**:

> **ARNA — Lead by Example.**  
> **Rooted in Maale. Built for Tomorrow.**

The identity connects Maale Arna's corporate heritage with agriculture, technology, finance, services, innovation, communication, and AI. Its guiding story is that a small, purposeful beginning can grow into a trusted leader through productive work, connection, integrity, and service.

The proposed visual system combines:
- Enterprise blue for trust and corporate structure.
- Aubergine for distinctive depth.
- Crimson for deliberate emphasis.
- Gold for excellence and restrained highlights.
- Warm ivory and neutral surfaces for clarity and human warmth.
- Green and controlled bright accents for growth, connection, and innovation.
- **The Living Path**, an original proposed graphic language of a seed point, growing lines, connected branches, and meaningful milestones.

The v1.0 brand direction and proposed palette have been approved by the Owner. They are not yet implemented in the UI; runtime token adoption requires a separately verified change.

### Brand specification

See [MASES / ARNA Brand Identity Master Specification v1.0](docs/BRAND_IDENTITY_MASTER_SPEC_V1.0.md) for the approved brand direction and architecture, principles, palette, semantic-color guidance, typography requirements, emblem rules, domain accents, visual texture, content voice, governance, and adoption acceptance criteria.

**Governance note:** the brand direction is Owner-approved; runtime adoption is pending. Existing frozen design tokens and component contracts must not be silently overwritten. Production adoption requires explicit approval, reconciliation with the existing design-system specifications, accessibility checks, a bounded candidate change, exact-head verification, and a separate release decision.

## Applications and build outputs

This repository uses one package manifest, one dependency tree, and four independent static builds:

| Application | Entry point | Build output | Intended deployment |
|---|---|---|---|
| Workspace | `workspace-entry/` | `dist/` | `app.maalearna.com.et` |
| Shareholder portal | `portal-entry/` | `dist-portal/` | `portal.maalearna.com.et` |
| Administration | `admin-entry/` | `dist-admin/` | `admin.maalearna.com.et` |
| Public corporate website | `public-entry/` | `dist-public/` | `www.maalearna.com.et` |

The production deployment targets above describe the repository's intended build/deployment mapping; they do not assert that a particular build is currently deployed or healthy.

## Technology

- Vue 3
- TypeScript and `vue-tsc`
- Vite
- Vue Router
- Pinia
- Lucide Vue icons

See `package.json` for the exact dependency versions and available scripts.

## Requirements

- Node.js 20 or later
- npm 10 or later

## Common commands

Install dependencies:

```bash
npm ci
```

Start the workspace:

```bash
npm run dev
```

Start individual applications:

```bash
npm run dev:portal
npm run dev:admin
npm run dev:public
```

Type-check the project:

```bash
npm run type-check
```

Build all four static applications:

```bash
npm run build
```

Verify the static build outputs:

```bash
npm run verify:build
```

Run the public-build smoke test:

```bash
npm run test:public-build-smoke
```

Build commands and their exact semantics are defined in `package.json`; this README does not claim that any command was run as part of the documentation change.

## Architecture and design-system principles

- Keep the four entry points independent while reusing shared components and design tokens.
- Treat the repository's canonical design-token file as the intended shared source of UI design values.
- Do not introduce per-component palettes or unreviewed hardcoded brand colors.
- Keep Amharic-first usability, English support, mobile responsiveness, accessible contrast, keyboard focus, and clear status communication in scope.
- Preserve existing architecture and frozen component contracts unless an explicitly reviewed change authorizes a modification.
- Keep API/backend concerns separate from this static frontend repository.
- Do not put secrets in `VITE_*` variables; client-exposed environment values are embedded into browser bundles.

## Brand and cultural integrity

The existing approved Maale Arna corporate emblem remains the source of truth. Any compact mark or new culturally inspired motif must be reviewed as a derivative or new design, not presented as an established Maale tradition without review by knowledgeable Maale community members.

ARNA's leadership identity means responsibility and service—not superiority over people. Trust must be demonstrated through reliable behavior, transparent information, security, and accountable service.

## Change governance

For UI, design-system, or brand changes:
1. Define the scope and identify affected files.
2. Preserve unrelated work and frozen contracts.
3. Use a separate candidate branch for bounded changes.
4. Verify type checks, relevant tests, all applicable builds, accessibility, and visual behavior against the exact candidate SHA.
5. Report verified, reported, and unknown/not-run items separately.
6. Treat merge and deployment as separate decisions.

## Status

This README describes repository architecture and the proposed brand direction. It is not a production-readiness certification. Current workflow results, exact build health, deployment state, and final brand approval must be established from their own evidence.
