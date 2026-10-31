# ARNA App Documentation Index

This index maps the maintained frontend documentation to the decisions and workflows it governs. Check links and update this index whenever a document is added, renamed, or retired.

## Start here

- [Repository overview](../README.md) — product scope, applications, technology, commands, and repository status.
- [Contribution guide](../CONTRIBUTING.md) — branch, pull-request, evidence, and approval requirements.
- [Frontend architecture and integration](FRONTEND_ARCHITECTURE.md) — application boundaries, source organization, API client behavior, and security responsibilities.
- [Environment and configuration](ENVIRONMENT_CONFIGURATION.md) — Vite modes, environment variable names, safe configuration, and API/CSP coordination.
- [Static deployment and rollback](STATIC_DEPLOYMENT_AND_ROLLBACK.md) — build artifacts, deployment gates, smoke checks, and static rollback procedure.

## Product, UI, and brand governance

- [ARNA UI/UX Enhancement Master Strategy v1.2](ARNA_UI_UX_Enhancement_Master_Strategy_v1.2.md) — approved phased UI/UX programme, acceptance criteria, gates, reporting, and Phase 0 closure limitations.
- [Brand Identity Master Specification v1.0](BRAND_IDENTITY_MASTER_SPEC_V1.0.md) — approved brand identity, design principles, palette, typography, emblem, and governance.
- [Brand palette/token reconciliation candidate](BRAND_PALETTE_TOKEN_RECONCILIATION_CANDIDATE.md) — bounded token reconciliation material.
- [Public Content Governance Contract](PUBLIC_CONTENT_GOVERNANCE_CONTRACT.md) — public-facing content governance and editorial controls.

## Domain and operational contracts

- [Operations Finance UI implementation contract](ARNA-OPERATIONS-FINANCE-UI-IMPLEMENTATION-CONTRACT.md) — frontend scope and integration constraints for the Finance UI.
- [Local Windows release handoff](LOCAL_WINDOWS_RELEASE_HANDOFF.md) — historical candidate handoff and its verification limitations. It is not a current release approval.

## Cross-repository dependency

- [ARNA API repository](https://github.com/akefadaka-git/arna-api) — authoritative backend implementation, API routes/contracts, authentication, tenant isolation, authorization, and business rules.

## Documentation maintenance

- Treat approved strategy/specification documents as controlled references; do not silently rewrite approved decisions.
- Add implementation observations to the relevant operational guide and distinguish observed source behavior from approved architecture and verified runtime behavior.
- Do not publish secret values, credentials, tokens, private endpoints, or personal data.
- Verify every relative link against the repository tree before merging.
- Include document owner/scope, status, source-of-truth references, last-reviewed commit, and known limitations where the document governs operational behavior.
- Keep historical handoff documents clearly labeled as historical; do not present them as current release instructions.
