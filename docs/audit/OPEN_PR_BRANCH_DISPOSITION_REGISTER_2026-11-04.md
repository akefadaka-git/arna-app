# arna-app — Open PR and Branch Disposition Register

Audit date: 2026-11-04
Repository: akefadaka-git/arna-app
Current open PRs: 22
Current branches: 28

## Open pull requests

| PR | Title | Head branch | Base | State | Mergeability | Disposition |
|---:|---|---|---|---|---|---|
| #38 | A1–A3: reconcile launcher API errors and repository configuration | `audit/arna-repository-consolidation-2026-11-04` | `main` | Ready | Mergeable | A1–A3 audit cleanup PR; verify then merge |
| #37 | A2: Admin central identity, RBAC and tenant directory UI | `feat/admin-central-identity-rbac-tenancy-a2` | `main` | Draft | Mergeable | OVERLAP: competing Admin Console contracts; consolidate API/App pair before merge |
| #36 | Admin control plane: identity, RBAC and tenant views | `feature/admin-central-identity-rbac-tenancy` | `main` | Draft | Mergeable | OVERLAP: competing Admin Console contracts; consolidate API/App pair before merge |
| #35 | Complete dividend administration and shareholder portal integration | `feat/dividend-portal-a1-a4-completion` | `feat/annual-shareholder-dividend-portal` | Draft | Mergeable | STACKED DEPENDENCY: based on feat/annual-shareholder-dividend-portal; preserve order and do not merge independently |
| #33 | Add shareholder annual dividend statement portal | `feat/annual-shareholder-dividend-portal` | `main` | Draft | Mergeable | Independent feature/documentation work; preserve and review against its own acceptance gate |
| #31 | [WIP] Add ARNA Board Election frontend contracts | `feat/board-election-a3` | `main` | Draft | Blocked | BLOCKED: GitHub currently reports not mergeable; inspect conflicts/base drift |
| #30 | feat(ocr): add bilingual Document Intelligence workspace | `feat/arna-ocr-a3-app` | `main` | Draft | Mergeable | Independent feature/documentation work; preserve and review against its own acceptance gate |
| #27 | feat(calendar): integrate Amharic-first Calendar workspace | `feat/arna-calendar-workspace-a4` | `main` | Draft | Blocked | BLOCKED: GitHub currently reports not mergeable; inspect conflicts/base drift |
| #26 | [Draft] Expand Communication Hub frontend experience | `feat/communication-hub-expansion` | `main` | Draft | Mergeable | Independent feature/documentation work; preserve and review against its own acceptance gate |
| #25 | A3: Calendar workspace integration contract | `feat/arna-calendar-workspace-a3` | `main` | Draft | Mergeable | Independent feature/documentation work; preserve and review against its own acceptance gate |
| #23 | A2: Calendar App baseline inventory | `docs/arna-enterprise-calendar-a2` | `main` | Draft | Mergeable | Independent feature/documentation work; preserve and review against its own acceptance gate |
| #22 | A1: ARNA enterprise calendar experience | `docs/arna-enterprise-calendar-a1` | `main` | Draft | Mergeable | Independent feature/documentation work; preserve and review against its own acceptance gate |
| #21 | A1: ARNA Calendar Workspace Experience | `feat/arna-calendar-experience-a1` | `main` | Draft | Mergeable | Independent feature/documentation work; preserve and review against its own acceptance gate |
| #19 | Phase 1 completion: semantic themes, bilingual typography and accessible primitives | `feat/arna-design-system-v2-complete` | `main` | Ready | Blocked | OVERLAP CANDIDATE: Design System 2.0 theme work; determine whether #19 supersedes #18 |
| #18 | Phase 1: ARNA Design System 2.0 — system-aware theme foundation | `feat/arna-design-system-v2` | `main` | Draft | Blocked | OVERLAP CANDIDATE: Design System 2.0 theme work; determine whether #19 supersedes #18 |
| #17 | A1: ARNA GUI design specification v1.0 | `docs/arna-gui-a1-design-spec` | `main` | Draft | Mergeable | Independent feature/documentation work; preserve and review against its own acceptance gate |
| #15 | feat(auth): use Sanctum session SSO in Workspace and Portal | `fix/unified-cookie-sso-app-current-main` | `main` | Draft | Mergeable | Independent feature/documentation work; preserve and review against its own acceptance gate |
| #13 | docs: add frontend architecture, configuration, and release guides | `docs/architecture-environment-release-guide` | `main` | Ready | Mergeable | Independent feature/documentation work; preserve and review against its own acceptance gate |
| #8 | docs(people): establish P0 application ownership and reporting | `docs/people-domain-p0-governance` | `main` | Draft | Mergeable | Independent feature/documentation work; preserve and review against its own acceptance gate |
| #7 | Governance meetings: add meeting workspace view | `feat/governance-meetings-ui` | `main` | Draft | Blocked | BLOCKED: GitHub currently reports not mergeable; inspect conflicts/base drift |
| #6 | Organization domain UI: dedicated feature folder and workspace integration | `feat/organization-domain-ui` | `main` | Draft | Blocked | BLOCKED: GitHub currently reports not mergeable; inspect conflicts/base drift |
| #5 | feat(people): add contact and relationship profile workflows | `feat/people-domain-phase-2-app` | `main` | Ready | Mergeable | Independent feature/documentation work; preserve and review against its own acceptance gate |

## Branches without an open PR

These branches are not automatically stale or unused. They may be supporting integration branches, work in progress, or branches with merged/closed PR history. Preserve them until their commit ancestry and references are checked.

- `feat/governance-attendance-a3`
- `feat/p1-4-people-domain-ui`
- `feat/people-lifecycle-display-a3`
- `fix/arna-public-emblem`
- `fix/unified-cookie-sso-app`
- `main`

## Cleanup policy

- Do not bulk-close open PRs or delete branches.
- Resolve stacked PRs in dependency order; retain their source branches until merged or explicitly superseded.
- For overlapping implementations, compare complete diffs, tests, permission contracts and database effects before selecting a canonical branch.
- A GitHub `mergeable=false` result is a blocker requiring conflict/base analysis, not proof that the work is obsolete.
- Close a superseded PR only after the successor is verified and all unique changes are preserved.
- Audit branches are not included in the original baseline counts; they are current audit work.
