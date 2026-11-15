# ARNA Next-Generation UI — Enhancement and Integration Roadmap

> Status: implementation roadmap, owner-directed scope
> Repository: `akefadaka-git/arna-app`
> Starting baseline: `71602c41bdfd4f4c224b454c4d7a169b5a7ef11d`
> Working branch: `feat/arna-nextgen-ui-foundation`
> Release posture: no merge, production deployment, or live-data activation without separate Owner approval.

## 1. Product objective

Evolve ARNA into a coherent, high-quality, Amharic-first enterprise experience that can compete with leading modern enterprise platforms in usability, accessibility, visual quality, workflow clarity, responsiveness, performance, and operational trust.

"More advanced than any system" is treated as an ambition, not a verifiable comparative claim. Acceptance is based on measurable capabilities and evidence, not marketing language.

## 2. Non-negotiable product principles

1. Amharic-first, with complete English parity; locale changes update content, document language, date/number formatting, and layout direction where required.
2. Mobile-first, adaptive across phone, tablet, laptop, and large desktop; essential workflows remain usable at 320 CSS px and at enlarged text settings.
3. Ethiopian calendar is the default calendar presentation where domain policy requires it; Gregorian dates remain available as a preference and API interchange format.
4. Light, dark, system, and forced-colors modes use semantic design tokens.
5. WCAG 2.2 AA is the engineering target; automated scans are supplemented by keyboard, screen-reader, contrast, and human review.
6. Progressive enhancement: 3D, animation, charts, and media never block essential tasks or reduce readability.
7. Data provenance is explicit. Synthetic, stale, unavailable, and live values are visually distinct; no fabricated operational metrics.
8. Permission-aware presentation is never treated as server authorization.
9. Privacy by default: no hidden telemetry, third-party advertising, remote media fetch, or sensitive diagnostic copying without explicit product and security approval.
10. Performance budgets and graceful low-end-device fallbacks are required for visual effects.

## 3. Experience architecture

### 3.1 Shared application shell
- Unified ARNA shell across Workspace, Shareholder Portal, Admin Console, and Public Site.
- Responsive navigation: desktop rail/sidebar, tablet compact navigation, mobile bottom navigation/drawer where appropriate.
- Persistent global header with brand, context, locale, theme, calendar preference, notifications, help, and account controls.
- Consistent page title, breadcrumb, action, content, and contextual-help regions.
- Route-aware navigation state, permission-filtered entries, skip links, landmarks, and predictable focus restoration.

### 3.2 Design-system foundation
- Semantic token layers for color, typography, spacing, density, elevation, radius, motion, focus, breakpoints, and z-index.
- Component maturity states: experimental, beta, stable, deprecated.
- Typed public APIs, explicit slots/events, composability, documented defaults, and migration guidance.
- Storybook-like component gallery / live design lab with controls for locale, theme, density, viewport, and interaction state.
- Visual regression baselines for core components and all four app shells.

### 3.3 Navigation and information discovery
- Upgrade the existing `AppHeaderNavigation` Ctrl/⌘+K destination search rather than create a competing second palette. Shell labels and known workspace/portal destination names follow the active Amharic/English locale. The current branch adds an accessible combobox/listbox pattern, ArrowUp/ArrowDown result selection, Enter activation, active-descendant state, hover synchronization, and native-dialog focus restoration. Exact-head browser verification passed at `32238fe5950256020fa429d1c0298c329c10e0ee`, workflow run `43717109962` (success). Grouping, recent destinations, and a distinct cross-domain entity-search layer remain future work when APIs are ready.
- Add cross-domain entity search only when authoritative API contracts exist; keep it distinct from the existing route-destination index.
- Contextual quick actions and recently viewed items require an explicit route/action catalogue and persistence contract.
- Search and command results must be filtered by authoritative permissions; UI filtering is not a security boundary.

### 3.4 Data and dashboard experiences
- Composable dashboard layouts with movable/resizable widgets only where user value and persistence are supported.
- KPI cards with provenance, as-of time, unit, trend context, and empty/unavailable states.
- Charts with accessible data tables, textual summaries, legends, and non-color-only distinctions.
- Data tables with sorting, filtering, pagination, selection, bulk actions, column visibility, responsive card mode, and clear empty/error states.
- No live-looking sample data: synthetic values must carry visible demo labels.

### 3.5 Workflow and forms
- Consistent multi-step workflow pattern with progress, save/resume where backend support exists, validation summary, and safe cancellation.
- Field-level validation with Amharic/English messages, associated descriptions, keyboard support, and server-error mapping.
- Confirmation patterns for destructive or irreversible actions.
- Upload/preview/download states with progress, cancellation, retry, and server-side validation assumptions documented.
- Ethiopian calendar and Gregorian date conversion tested at month/year boundaries and timezone edges.

### 3.6 Communication and productivity surfaces
- The repository already contains a NotificationsCenter, store, API adapter, and shell trigger. The API backend was reconciled read-only at `akefadaka-git/arna-api` main SHA `b924f6555cca8f4c5a732ffb6ba9fb181c9d0733`: all four inbox/unread/read/read-all routes exist; the controller returns the adapter's pagination, localized title/body, priority, read state, timestamp, and action shape; storage is tenant- and recipient-scoped with UUID identifiers. Mounted browser coverage now passes for loading, unread/read, read-all, pagination, locale refresh, recoverable errors/retry, and fail-closed untrusted action metadata. Notification list sizing and a standalone header-height fallback keep pagination controls visible.
- Activity timeline and audit event presentation.
- Calendar views (month/week/day/agenda) with E.C./G.C. preference and accessible event details.
- Document center with metadata, preview, version history, and safe download affordances.
- Contextual help and support panel with strict diagnostic allowlists.

### 3.7 Visual media and depth
- Keep existing 2D and CSS 3D panel library additive and token-driven.
- Add a true 3D model/AR layer only after assets, rendering engine, security, bundle budget, device fallback, and accessibility are separately assessed.
- Support reduced motion, pause/stop controls for non-essential motion, and static fallbacks.
- GIF/video must not contain essential information that is unavailable in text.
- Promotional banners remain clearly identified; no ad network or user tracking.

## 4. Quality attributes and measurable acceptance

| Area | Acceptance target |
|---|---|
| Responsive layout | No document-level horizontal overflow at 320, 360, 390, 768, 1024, 1280, and 1440 CSS px |
| Touch targets | At least 24×24 CSS px or documented WCAG 2.2 spacing exception; prefer 44×44 for primary mobile actions |
| Accessibility | No serious/critical automated axe violations in tested states; manual keyboard and assistive-technology review recorded |
| Localization | Amharic and English content-fit tests; no clipped Ethiopic glyphs; locale-aware labels and date formats |
| Themes | Light, dark, system, and forced-colors behavior tested |
| Performance | Route-level bundle budgets, image dimensions/lazy loading, no unnecessary runtime dependencies, measured interaction responsiveness |
| Data integrity | Every metric has source/provenance and freshness; synthetic values explicitly labeled |
| Security | No secrets in client bundle; permission presentation not relied on for authorization; safe links and file handling |
| Reliability | Loading, empty, error, success, offline, and retry states specified where applicable |
| Maintainability | Typed APIs, contract tests, consumer compatibility census, documented deprecation policy |

## 5. Implementation workstreams

### W0 — Stabilize and govern the current branch
- Resolve the four known mounted-browser test failures on the current PR #67 head.
- Reconcile PR #65 scope and avoid silently absorbing unrelated feature changes.
- Normalize design-system and icon-registry documentation to source-of-truth.
- Establish a clean additive implementation branch and exact-head CI evidence.

### W1 — Design-system vNext
- Approve a versioned token contract and component API conventions.
- Build the interactive component gallery and state matrix.
- Add visual regression snapshots for primitives, composites, patterns, and app shells.
- Add density and responsive layout primitives.

### W2 — Unified shell and navigation
- Integrate consistent shell behavior across all four applications.
- Complete the existing command-palette-style destination search, then add global entity search only when API contracts exist; add contextual quick actions only from a permission-aware action catalogue and reconcile existing notification affordances.
- Verify permission-aware navigation and route-level focus management.

### W3 — Enterprise interaction patterns
- Upgrade forms, tables, filters, dialogs, drawers, date/time, upload, preview, and bulk-action workflows.
- Add reusable workflow stepper, validation summary, autosave/resume only where supported by backend contracts.
- Validate all high-risk interactions with mounted browser tests.

### W4 — Data visualization and dashboards
- Improve charts, KPI widgets, accessible data alternatives, dashboard composition, and freshness/provenance labels.
- Keep synthetic demo data visibly separate from production data.
- Integrate real data only through approved API contracts and permissions.

### W5 — Productivity and communication
- Calendar, activity feed, document center, and contextual help.
- The existing NotificationsCenter API adapter and shell integration now have a source-level backend match. Add mounted lifecycle, locale-switch, pagination and error-state tests before expanding action handling.
- The LanguageSelector component exists but its shell composition is deliberately deferred by the current architecture record until a locale-persistence API is available. Resolve that contract before enabling it; do not silently change the existing policy.
- Identify backend/API contracts before presenting controls as operational.

### W6 — Advanced visual experience
- Extend 2D/CSS 3D surfaces, responsive media, motion, and optional model viewer.
- Gate 3D model rendering behind device capability, asset budget, accessibility, and fallback checks.

### W7 — Cross-app acceptance
- Run locale × theme × viewport matrix across Workspace, Portal, Admin, and Public Site.
- Perform keyboard, screen-reader, contrast, zoom, reduced-motion, and device testing.
- Publish a traceable acceptance report with evidence and unresolved risks.

## 6. Delivery controls

- Work proceeds in bounded, reviewable commits and pull requests.
- A2 remains read-only; A3 contains implementation; A4 contains verification; A5 is a separate deployment stage.
- Do not merge, deploy, publish, activate live data, add paid services, or introduce external tracking without separate approval.
- Preserve unrelated changes. Scope discrepancies are isolated and documented rather than silently discarded.
- Every completion claim cites the exact branch, SHA, tests, workflow run, and remaining limitations.

## 7. Current implementation baseline and known constraints

- Core component inventory: 24 primitives, 26 composites, 15 patterns (65 component directories).
- Additive visual library: MetricWidget, ChartPanel, ImageFrame, PromoBanner, AbstractBackdrop, TextEffect, MotionReveal, VisualPanel, VisualLibraryShowcase.
- Four independent application entry points remain in place.
- A Ctrl/⌘+K navigation destination search already exists in AppHeaderNavigation. Its shell controls and known workspace/portal destination labels have been localized; this branch adds keyboard result navigation and combobox/listbox semantics. Latest exact-head CI passed at SHA `424728e195f5d4a44c29fc74b28bd649afecffe5`, workflow `43719708309`. Mounted browser coverage passed for keyboard result navigation, empty results, hover synchronization, selection, and focus restoration. It remains a navigation-only index, not a cross-domain entity search.
- NotificationsCenter, its Pinia store, and API adapter already exist; backend endpoints/schema have been source-reconciled against arna-api main SHA `b924f6555cca8f4c5a732ffb6ba9fb181c9d0733`. Mounted behavior and locale-switch coverage remain required.
- LanguageSelector exists but is intentionally not mounted pending a locale-persistence API contract.
- PR #69 exact-head workflow #43719708309 passed at `424728e195f5d4a44c29fc74b28bd649afecffe5`. The workflow passed type-check/build, four-app import analysis, design-system/theme and visual contracts, mounted component/navigation/notification tests (25 mounted A4 component tests, 7 FileUploader tests, 6 DatePicker tests), and public-browser/WCAG automated contracts. This is bounded evidence, not full cross-app A4.
- Historical catalogue/design-system source documents have not been recovered; reconstructed documents remain drafts pending Owner authority.
- No full authenticated-shell visual acceptance, formal WCAG certification, physical-device acceptance, or 3D model viewer is claimed.

## 8. First execution slice

The new branch starts with:
1. minimum-size checkbox and option targets;
2. reliable mounted tests for DataTable selection and diagnostic clipboard output;
3. a source-backed enhancement roadmap;
4. exact-head CI, then incremental implementation of the unified shell, component lab, navigation, workflow, dashboard, and productivity workstreams.


## 9. Exact-head A3/A4 evidence and scope reconciliation (2026-11-15)

### Verified evidence
- PR #69: `feat/arna-nextgen-ui-foundation`, base `feat/arna-visual-panels-integration`, draft/open/unmerged.
- Verified baseline SHA: `32238fe5950256020fa429d1c0298c329c10e0ee`.
- Exact-head GitHub Actions run: [#43717109962](https://github.com/akefadaka-git/arna-app/actions/runs/43717109962), conclusion `success`.
- Configured checks passed: type-check/build; Ethiopian calendar conversion/date-entry; Chromium/public-browser and WCAG 2.2 accessibility contracts; visual-library rendering; mounted Combobox/Modal/Drawer; FileUploader lifecycle/accessibility; DatePicker browser interactions; artifact upload.
- This run is evidence for the configured workflow at the exact SHA only. It is not a full four-app-shell, device, manual assistive-technology, or formal WCAG certification.

### PR #65 scope discrepancy — UNRESOLVED / ISOLATED
- PR #65 declares one file (`src/layouts/AppShell/AppHeader/AppHeader.vue`) in its description.
- GitHub PR metadata reports 190 commits, 199 changed files, +6,356 additions, −4,691 deletions, head `86eea1fc507b49065ec017dfa59f15153f9ddaaa`, base `main` at `85751ca489b7e2a250da46f408b040254827a199`.
- The paginated PR files API returns 199 file entries (100 on page 1, 99 on page 2). The changes span environment files, workflow, design-system docs, package/build scripts, 68 component paths, core, features, layouts, routes, styles, and tests.
- The discrepancy is not resolved by treating the PR as authorized. Preserve all files and history. Do not merge, cherry-pick, rebase, squash, or silently incorporate this PR as part of PR #69.
- Required resolution: produce an Owner-reviewed manifest classifying all 199 paths as intended UI baseline, necessary dependency, unrelated work, or unknown; compare each changed path with its parent/base; identify the original one-file change and subsequent commits that expanded scope. Only then propose a separate extraction/reconciliation PR.

### Historical design-system authority — MISSING
- The historical `MASES_PHASE_2_UI_DESIGN_SYSTEM.md` / `MASES_PHASE_2_UI_COMPONENT_CATALOG.md` authority has not been recovered from a verified original artifact in this repository history.
- `ARNA_UI_DESIGN_SYSTEM_RECONSTRUCTED.md` and `ARNA_UI_COMPONENT_CATALOG_RECONSTRUCTED.md` remain reconstructed working drafts, not historical originals and not automatically Owner-approved normative authority.
- A2 remains PARTIAL / NOT VERIFIED-CLOSED until either the authoritative originals are recovered and provenance-checked or the Owner explicitly approves the reconstructed versions as replacement authority.

### Gate status
- A3 implementation: PARTIAL — bounded UI foundation, notification lifecycle, and navigation-search improvements are implemented; broader workstreams remain.
- A4 verification: PASS for configured exact-head workflow #43719708309 at `424728e195f5d4a44c29fc74b28bd649afecffe5`; PARTIAL for product-wide acceptance.
- A2 reconciliation: PARTIAL — PR #65 scope and historical authority blockers remain.
- A5 deployment: NOT STARTED — separate approval required.


### Next workstream — PR #70: Unified shell parity (A1)
- Draft PR: https://github.com/akefadaka-git/arna-app/pull/70
- Branch: `feat/arna-unified-shell-parity-a1`
- A1 assessment is source-backed and prepared; Owner freeze remains pending.
- Scope: parity audit and acceptance contract across Workspace, Shareholder Portal, Admin Console, and Public Site, preserving the separate public-site trust boundary.
- No source implementation is included; no A2/A3 work until the A1 scope is approved.
