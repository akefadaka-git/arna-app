# Contributing to ARNA App

This repository is the frontend for the ARNA Smart System. Contributions must preserve the frontend/backend boundary, domain ownership, approved brand identity, and Owner-governed change process.

## Before changing code

1. Read the [README](README.md) and the relevant document in `docs/`.
2. Identify the owning application and domain feature.
3. Confirm the change is within an explicitly authorized scope.
4. Inspect the current `main` base and relevant open pull requests before editing.
5. Define the acceptance criteria and verification commands before implementation.

## Branch and pull-request workflow

- Do not commit directly to `main`.
- Use a focused branch, for example `feat/<domain>-<capability>`, `fix/<short-description>`, or `docs/<short-description>`.
- Keep each pull request limited to one coherent change.
- Preserve unrelated files, branches, commits, and in-progress work.
- Do not move domain code across feature boundaries as incidental cleanup.
- Do not combine documentation, application behavior, dependency upgrades, and deployment changes without an explicit reason and approval.
- Link dependent API/frontend pull requests and state which exact API contract the UI expects.

## Frontend architecture rules

- Keep the workspace, shareholder portal, admin console, and public website as independent application entry points and static build outputs.
- Reuse shared components and semantic tokens rather than introducing duplicate components or ad hoc palettes.
- Keep domain-specific UI, labels, API adapters, and workflows inside the owning feature folder.
- Keep shared router, layout, and navigation changes narrow.
- Do not treat hidden buttons, client-side route guards, or UI role checks as security controls.
- The API is authoritative for authentication, tenant isolation, authorization, business rules, and workflow transitions.
- Do not introduce secrets into source control or `VITE_*` variables.

## Required verification

Run the checks applicable to the changed scope and record the exact commit tested:

```bash
npm ci
npm run type-check
npm run build
npm run verify:build
npm run test:public-build-smoke
npm run test:brand-palette-contract
```

For a domain or route change, also run the relevant route/contract tests and verify the affected application entry point. For visual changes, provide evidence for applicable desktop/mobile layouts, Amharic/English content, light/dark themes, keyboard interaction, focus states, and contrast. Do not report checks as passed unless the workflow or test output confirms them.

## Pull-request description

Every pull request should state:

- Purpose and scope.
- Owning application and domain.
- Exact base and head commits.
- Changed-file summary.
- API dependencies and contract assumptions.
- Tests/builds run and links to workflow runs.
- Accessibility, localization, responsive, and visual evidence when relevant.
- Known limitations, unresolved items, and checks not run.
- Risks and rollback considerations for behavior changes.

Use explicit evidence statuses: `VERIFIED`, `PARTIAL`, `MISSING`, `UNRESOLVED`, `UNKNOWN`, and `NOT RUN`.

## Approval and release boundaries

A passing CI run does not grant merge or deployment authorization. Specification approval, implementation authorization, verification acceptance, merge, and deployment are distinct decisions. The Owner retains authority over scope, architecture, approvals, risk acceptance, merges, and releases. Do not perform database operations, backend changes, production data changes, or deployment from this frontend contribution workflow without separate explicit authorization.
