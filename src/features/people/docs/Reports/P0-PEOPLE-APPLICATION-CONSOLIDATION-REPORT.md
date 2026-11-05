# P0 People Application Consolidation Report

- Report ID: PD-APP-P0-RPT-001
- Version: 1.0.0
- Date: 2026-10-30
- Status: IN PROGRESS — NOT CLOSED
- Repository: `akefadaka-git/arna-app`
- Current main SHA: `7b04286d4a20b3587249eed8b90281699492b4c7`
- People PR #5 head: `faf16e769756dcb1bc01afab69c418b881c8d980`

## 1. Findings

People directory, profile and API client files are inside `src/features/people/` on main. This is consistent with the canonical feature root.

PR #5 is open and unmerged, 13 commits ahead of current main and 4 changed files (+731 / -7). It adds or updates the People directory, profile and API client, and adds a People application implementation register at `docs/phase-2/PEOPLE-APPLICATION-IMPLEMENTATION-REGISTER.md`. That register is outside the People feature root and is classified LEGACY-TO-RELOCATE.

Governance-specific People directory/profile views and `src/features/governance/people-service.ts` remain in Governance. Governance may own appointment/authority workflows, but it must consume the canonical People identity/profile contract and must not maintain a second Person master. The exact service ownership/duplication status remains UNRESOLVED pending source review.

Previously inspected exact-head type-check/build runs for PR #5 failed. Their failure annotations have not been re-retrieved in this P0 documentation activity. No workflow was rerun.

## 2. P0 application requirements

| Requirement | Status | Evidence / remaining work |
|---|---|---|
| Canonical application People root defined | VERIFIED | `src/features/people/` |
| Existing directory/profile/API client under root | VERIFIED | Main tree |
| Application architecture and ownership strategy documented | VERIFIED | `docs/Architecture/PEOPLE-APPLICATION-STRATEGY.md` in this branch |
| Frontend phase-report template documented | VERIFIED | `docs/Reports/PEOPLE-APPLICATION-PHASE-REPORT-TEMPLATE.md` in this branch |
| Out-of-root People register identified | VERIFIED | PR #5 file list |
| Governance integration ownership reviewed | PARTIAL | Full service and route source review outstanding |
| Complete import/route/type dependency map | NOT RUN | Required before any relocation/refactor |
| Exact-head failure annotation review | NOT RUN | Existing failures only; no rerun |
| Independent review and Owner closure | NOT RUN | Required |

## 3. Documentation created on this branch

Branch: `docs/people-domain-p0-governance`

1. `src/features/people/docs/Architecture/PEOPLE-APPLICATION-STRATEGY.md`
2. `src/features/people/docs/Reports/PEOPLE-APPLICATION-PHASE-REPORT-TEMPLATE.md`
3. `src/features/people/docs/Reports/P0-PEOPLE-APPLICATION-CONSOLIDATION-REPORT.md`

## 4. Action boundary

Documentation-only files were created under the canonical People feature root. No Vue/TypeScript source, route, type, API client or test code was changed. No files were moved or deleted. No workflow was run or modified. PR #5 was not modified, merged or closed. No deployment was performed.

## 5. Disposition

P0 remains IN PROGRESS / PARTIAL. Complete the Governance-to-People dependency review, import and route inventory, and frontend exact-head failure diagnosis. Obtain independent review and explicit Owner closure approval before starting P1 implementation.
