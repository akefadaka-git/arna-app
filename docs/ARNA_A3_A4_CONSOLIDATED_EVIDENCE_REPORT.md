# ARNA UI — Consolidated A3/A4 Evidence Report
Date: 2026-11-15
Repository: `akefadaka-git/arna-app`
Working branch: `feat/arna-nextgen-ui-foundation`
PR: [#69](https://github.com/akefadaka-git/arna-app/pull/69)

## Executive status
- A3 implementation: PARTIAL. The foundation, accessibility corrections, bilingual navigation search, and visual library integration are present in the stacked PR chain.
- A4 verification: PASS for the configured exact-head workflow at SHA `32238fe5950256020fa429d1c0298c329c10e0ee`; PARTIAL for end-to-end product acceptance across four application shells and real devices.
- A2 reconciliation: PARTIAL / NOT VERIFIED-CLOSED because PR #65 scope is inconsistent with its declared one-file intent and historical design-system authority remains missing.
- A5: NOT STARTED. No merge or deployment is authorized by this report.

## Exact-head CI evidence
- Workflow run [#43717109962](https://github.com/akefadaka-git/arna-app/actions/runs/43717109962)
- Exact head: `32238fe5950256020fa429d1c0298c329c10e0ee`
- Conclusion: success.
- Configured successful checks include type-check/build, calendar/date controls, Chromium/public-browser and WCAG 2.2 automated contracts, visual library rendering, mounted Combobox/Modal/Drawer interactions, FileUploader lifecycle/accessibility, DatePicker browser interactions, and artifact upload.
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
- All 199 paths were retrieved using two pages of the PR files endpoint. The list spans environment/configuration, CI, docs, package/build scripts, component library, core, features, layouts, routes, styles, and tests.
- This report does not authorize merging or absorbing any of those changes. Required next action is an Owner-reviewed 199-path manifest and commit/path provenance analysis.
- Historical `MASES_PHASE_2_UI_DESIGN_SYSTEM.md` and component catalogue originals remain MISSING. Reconstructed documents are drafts, not normative authority unless explicitly approved by the Owner.

## Verification plan / remaining A4
- Workflow #43718770104 at SHA `d4ae2abdd70c503414755ba315dd5167a1585bc2` ran 25 mounted browser tests: 24 passed and one pagination test timed out. Follow-up diagnostics on SHA `563dfc668a2b96e84ddb7df391c4e8034e704b52` showed the test stalled while clicking the enabled next-page control, before the click completed. The likely cause was the notification list's default flex min-size pushing the footer outside the visible panel when 20 items were present. The component now gives the list `flex: 1 1 auto; min-height: 0`, and the test requires the next-page control to be in the viewport before activation. Exact-head CI remains pending.
1. Run exact-head type-check and all four builds on the new notification/navigation test commit.
2. Execute mounted notification tests for loading, read state, pagination, locale refresh, failure/retry, and fail-closed untrusted action metadata.
3. Execute navigation search tests for keyboard navigation, empty results, hover synchronization, selection, and focus restoration.
4. Run full application-shell locale × theme × viewport matrix; perform manual keyboard/AT and physical-device checks.
5. Validate notification route actions only after a documented route-name allowlist is agreed and implemented.

## Governance
- Preserve PR #65, #66, #67, and #69 histories; no branch force update.
- Keep PR #69 draft/open/unmerged pending Owner review.
- Do not merge, deploy, activate live data, add paid services, or change `main` without separate explicit approval.
