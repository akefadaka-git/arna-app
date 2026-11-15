# ARNA UI — Consolidated A3/A4 Evidence Report
Date: 2026-11-15
Repository: `akefadaka-git/arna-app`
Working branch: `feat/arna-nextgen-ui-foundation`
PR: [#69](https://github.com/akefadaka-git/arna-app/pull/69)

## Executive status
- A3 implementation: PARTIAL. The foundation, accessibility corrections, bilingual navigation search, notification lifecycle and pagination layout correction, and visual library integration are present in the stacked PR chain.
- A4 verification: PASS for configured exact-head workflow #43719708309 at SHA `424728e195f5d4a44c29fc74b28bd649afecffe5`; PARTIAL for end-to-end product acceptance across four application shells and real devices.
- A2 reconciliation: PARTIAL / NOT VERIFIED-CLOSED because PR #65 scope is inconsistent with its declared one-file intent and historical design-system authority remains missing.
- A5: NOT STARTED. No merge or deployment is authorized by this report.

## Exact-head CI evidence
- Workflow run [#43719708309](https://github.com/akefadaka-git/arna-app/actions/runs/43719708309)
- Exact head: `424728e195f5d4a44c29fc74b28bd649afecffe5`
- Conclusion: success.
- Configured successful checks include type-check/build, calendar/date controls, Chromium/public-browser and WCAG 2.2 automated contracts, visual library rendering, mounted Combobox/Modal/Drawer interactions, FileUploader lifecycle/accessibility, DatePicker browser interactions, and artifact upload.
- Mounted A4 browser results on this exact head: 25 component/navigation/notification tests passed; 7 FileUploader tests passed; 6 DatePicker tests passed. The public-browser contract suite (10 tests) and visual-library render (1 test) also passed.
- Notification coverage includes loading, mark-one-read, mark-all-read, pagination next/previous, Amharic-to-English refresh, recoverable error/retry, and refusal to treat untrusted resource_ref as a navigable URL.
- Scope limitation: this is not a formal WCAG certification, screen-reader sign-off, physical-device test, or full locale × theme × viewport acceptance across Workspace, Portal, Admin, and Public Site.

## Implemented and evidenced UI areas
- 65 core component directories: 24 primitives, 26 composites, 15 patterns.
- Visual library: MetricWidget, ChartPanel, ImageFrame, PromoBanner, AbstractBackdrop, TextEffect, MotionReveal, VisualPanel, VisualLibraryShowcase.
- Existing Ctrl/⌘+K route-destination search retained as the single search surface. Bilingual chrome and known destination labels; combobox/listbox semantics; ArrowUp/ArrowDown, Enter, hover selection, focus restoration, and empty-query behavior are tested. It is not cross-domain entity search.
- NotificationsCenter, Pinia store, and adapter reuse the existing backend contract: inbox, unread-count, mark-one-read, and mark-all-read. No duplicate notification system or speculative API was added.
- Locale refresh re-fetches the current notification page after an in-session locale change; locale persistence remains the existing client-side contract and no new API endpoint is assumed.
- Notification action metadata is treated as data, not a URL. The current UI does not execute arbitrary `resource_ref` values. Any future route action must resolve through an explicit route-name allowlist and remain protected by server authorization.

## PR #65 scope and authority blockers
- PR #65 description promises one file; GitHub reports 190 commits, 199 changed files, +6,356/−4,691, head `86eea1fc507b49065ec017dfa59f15153f9ddaaa`.
- The first commit `42890d68fa44c7a9e0c0c165eed0f5b05d6a5fa7` is the exact declared one-file change: `src/layouts/AppShell/AppHeader/AppHeader.vue` (+36/−18), parent `85751ca489b7e2a250da46f408b040254827a199`. The subsequent 189 commits expand the PR to 199 changed paths.
- The first PR commit `42890d68fa44c7a9e0c0c165eed0f5b05d6a5fa7` has parent `85751ca489b7e2a250da46f408b040254827a199` and changes exactly one file: `src/layouts/AppShell/AppHeader/AppHeader.vue` (+36/−18). This verifies the declared original scope.
- The remaining 189 commits expand the PR to 199 paths (198 beyond the original file). The final commit is `86eea1fc507b49065ec017dfa59f15153f9ddaaa` (`ci(architecture): generate and retain four-app import graph`).
- The 199-path inventory is committed at `docs/PR65_SCOPE_RECONCILIATION_INVENTORY.md`; the original header file is marked VERIFIED, and 198 additional paths are marked SCOPE EXPANSION — AUTHORIZATION UNKNOWN. Path groups: 68 components, 59 features, 28 layouts, 16 router files, 4 public-site, 4 styles, 8 tests, and 12 root/config/docs/build/entry/asset paths.
- This report does not authorize merging or absorbing any expanded changes. Remaining work is an Owner-reviewed disposition for the 198 expanded paths, supported by per-commit provenance; preserve unrelated work.
- Exact repository path-history queries for `docs/MASES_PHASE_2_UI_DESIGN_SYSTEM.md` and `docs/MASES_PHASE_2_UI_COMPONENT_CATALOG.md` returned zero commits; the current tree contains only `ARNA_UI_DESIGN_SYSTEM_RECONSTRUCTED.md` and `ARNA_UI_COMPONENT_CATALOG_RECONSTRUCTED.md`. Historical originals remain MISSING. Reconstructed documents are drafts, not normative authority unless explicitly approved by the Owner.

## Verification plan / remaining A4
- The initial notification pagination tests exposed two actual layout constraints: the list's default flex min-size and the absence of `--arna-shell-header-height` in the standalone fixture. The component now sets the list to `flex: 1 1 auto; min-height: 0` and supplies a conservative `4rem` fallback for the header-height token used by its max-height and top offset. Exact-head workflow #43719708309 confirms the footer remained visible and pagination next/previous passed.
1. Run exact-head type-check and all four builds on the new notification/navigation test commit.
2. Execute mounted notification tests for loading, read state, pagination, locale refresh, failure/retry, and fail-closed untrusted action metadata.
3. Execute navigation search tests for keyboard navigation, empty results, hover synchronization, selection, and focus restoration.
4. Run full application-shell locale × theme × viewport matrix; perform manual keyboard/AT and physical-device checks.
5. Validate notification route actions only after a documented route-name allowlist is agreed and implemented.

## Governance
- Preserve PR #65, #66, #67, and #69 histories; no branch force update.
- Keep PR #69 draft/open/unmerged pending Owner review.
- Do not merge, deploy, activate live data, add paid services, or change `main` without separate explicit approval.


## Next workstream
- Draft PR #70 — [ARNA Unified Shell Parity — A1 assessment](https://github.com/akefadaka-git/arna-app/pull/70), branch `feat/arna-unified-shell-parity-a1`.
- A1 assessment prepared; Owner freeze pending. It preserves Workspace/Portal/Admin shared AppShell and the separate Public Site trust boundary. No implementation or merge is included.
