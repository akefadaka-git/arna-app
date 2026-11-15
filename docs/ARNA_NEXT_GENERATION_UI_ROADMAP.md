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
- Upgrade the existing `AppHeaderNavigation` Ctrl/⌘+K destination search rather than create a competing second palette. Shell labels and known workspace/portal destination names follow the active Amharic/English locale. The current branch adds an accessible combobox/listbox pattern, ArrowUp/ArrowDown result selection, Enter activation, active-descendant state, hover synchronization, and native-dialog focus restoration. Exact-head browser verification passed at `b65cc0bf85099cdca45d1b1fcce7615a784301bb`, workflow run `43720480876` (success). Grouping, recent destinations, and a distinct cross-domain entity-search layer remain future work when APIs are ready.
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
- The LanguageSelector component exists but its shell composition remains deliberately deferred until a locale-persistence API is authoritatively available. Do not invent or silently enable a persistence contract.
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
- A Ctrl/⌘+K navigation destination search already exists in AppHeaderNavigation. Its shell controls and known workspace/portal destination labels have been localized; this branch adds keyboard result navigation and combobox/listbox semantics. Latest exact-head CI passed at SHA `b65cc0bf85099cdca45d1b1fcce7615a784301bb`, workflow `43720480876`. Mounted browser coverage passed for keyboard result navigation, empty results, hover synchronization, selection, and focus restoration. It remains a navigation-only index, not a cross-domain entity search.
- NotificationsCenter, its Pinia store, and API adapter already exist; backend endpoints/schema have been source-reconciled against arna-api main SHA `b924f6555cca8f4c5a732ffb6ba9fb181c9d0733`. Mounted behavior and locale-switch coverage remain required.
- LanguageSelector exists but is intentionally not mounted pending a locale-persistence API contract.
- PR #69 exact-head workflow #43720480876 passed at `b65cc0bf85099cdca45d1b1fcce7615a784301bb`. The workflow passed type-check/build, four-app import analysis, design-system/theme and visual contracts, mounted component/navigation/notification tests (25 mounted A4 component tests, 7 FileUploader tests, 6 DatePicker tests), and public-browser/WCAG automated contracts. This is bounded evidence, not full cross-app A4.
- Historical `docs/MASES_PHASE_2_UI_DESIGN_SYSTEM.md` and `docs/MASES_PHASE_2_UI_COMPONENT_CATALOG.md` were checked against repository path history; both exact-path history queries returned zero commits, and the current tree contains only the reconstructed ARNA documents. Reconstructed documents remain drafts pending explicit Owner authority.
- No full authenticated-shell visual acceptance, formal WCAG certification, physical-device acceptance, or 3D model viewer is claimed.

## 8. First execution slice

The new branch starts with:
1. minimum-size checkbox and option targets;
2. reliable mounted tests for DataTable selection and diagnostic clipboard output;
3. a source-backed enhancement roadmap;
4. exact-head CI, then incremental implementation of the unified shell, component lab, navigation, workflow, dashboard, and productivity workstreams.


## 9. Consolidated A3/A4 evidence and scope reconciliation (2026-11-15)

### 9.1 Verified implementation head
- PR #69: `feat/arna-nextgen-ui-foundation`, based on `feat/arna-visual-panels-integration`; draft, open, unmerged.
- Exact tested implementation head: `b65cc0bf85099cdca45d1b1fcce7615a784301bb`.
- Exact-head GitHub Actions run: [#43720480876](https://github.com/akefadaka-git/arna-app/actions/runs/43720480876), conclusion `success`, head SHA matched.
- Configured workflow checks passed: dependency audit gate; four-application AST import graph; type-check and four application builds; build/public smoke checks; palette/theme/design-system contracts; visual-library and panel integration contracts; responsive shell contracts; Ethiopian calendar/date-entry contracts; public browser and WCAG 2.2 automated contracts; mounted A4 component browser suite; FileUploader lifecycle; DatePicker browser interactions; artifact uploads.
- Mounted `tests/a4-components-browser.spec.mjs` includes notification-center lifecycle and safe-navigation cases: loading, unread/read, read-all, pagination, locale refresh, recoverable error/retry, and fail-closed untrusted action metadata. Navigation search covers locale labels, keyboard operation, destination activation, empty results, hover synchronization, and focus restoration.
- This is configured exact-head CI evidence, not formal WCAG certification, physical-device acceptance, manual screen-reader sign-off, or complete authenticated-shell acceptance across every app and state.

### 9.2 Documentation follow-up after the verified head
- The complete PR #65 path inventory was added as `docs/PR65_SCOPE_MANIFEST_199_PATHS.md` in a documentation-only commit after the tested implementation head.
- That documentation commit changes the branch head and therefore requires its own exact-head CI result before it can be called verified. The successful run above remains evidence for `b65cc0b`, not for a later documentation commit.
- Roadmap and manifest changes do not authorize merge or deployment.

### 9.3 PR #65 scope discrepancy — isolated, not absorbed
- PR #65 remains open and unmerged: head `86eea1fc507b49065ec017dfa59f15153f9ddaaa`, base `85751ca489b7e2a250da46f408b040254827a199`, 190 commits, 199 paths, +6,356/−4,691.
- The complete 199-path inventory and per-file GitHub API statistics are recorded in `docs/PR65_SCOPE_MANIFEST_199_PATHS.md`. Every path remains authorization UNKNOWN except that the first commit establishes the original one-file scope.
- The first commit is `42890d68fa44c7a9e0c0c165eed0f5b05d6a5fa7`, parent `85751ca489b7e2a250da46f408b040254827a199`; its only changed path is `src/layouts/AppShell/AppHeader/AppHeader.vue` (+36/−18).
- Draft PR #71, [Extract PR #65 original responsive header change only](https://github.com/akefadaka-git/arna-app/pull/71), preserves that exact one-file commit on `extract/pr65-original-header-only`, based on main. It is a proposal only; exact-head CI/review and separate merge approval remain required.
- PR #65 has not been modified, closed, merged, rebased, or discarded. Its 198 later additional paths are preserved and explicitly unapproved/unclassified pending Owner review.

### 9.4 Historical design-system authority — source recovery outcome
- The exact historical paths `MASES_PHASE_2_UI_DESIGN_SYSTEM.md` and `MASES_PHASE_2_UI_COMPONENT_CATALOG.md` are absent from the current main tree.
- Additional repository tree checks on `feat/arna-design-system-v2`, `feat/arna-design-system-v2-complete`, `docs/arna-gui-a1-a2-reconciled`, and `docs/arna-gui-a1-design-spec` did not recover those original files.
- No verified original artifact or provenance was found in the checked repository refs. This is a bounded source-recovery result, not proof that no external/archive copy exists.
- `ARNA_UI_DESIGN_SYSTEM_RECONSTRUCTED.md` and `ARNA_UI_COMPONENT_CATALOG_RECONSTRUCTED.md` remain reconstructed working drafts. They are not silently promoted to historical or normative authority.
- Resolution requires either (a) Owner supplies/identifies the authoritative original artifact and provenance, or (b) Owner explicitly approves the reconstructed ARNA documents as replacement authority. Until one occurs, A2 remains PARTIAL / NOT VERIFIED-CLOSED.

### 9.5 Stage assessment
- A1: existing UI foundation assessment and PR #70's Unified Shell Parity A1 candidate are prepared; the latter is not Owner-frozen.
- A2: PARTIAL — complete PR #65 manifest exists; 198 later paths still await Owner classification; historical design-system authority remains unresolved.
- A3: PARTIAL — current foundation, notification lifecycle, navigation-search and visual-panel work are implemented on PR #69; broader UI workstreams remain.
- A4: PASS for configured exact-head CI at `b65cc0b`; PARTIAL for complete product-wide, human and device acceptance.
- A5: NOT STARTED — separate approval required.

## 10. Next workstream — PR #70 Unified Shell Parity (A1 freeze candidate)

- Draft PR: [#70](https://github.com/akefadaka-git/arna-app/pull/70), branch `feat/arna-unified-shell-parity-a1`, base `feat/arna-nextgen-ui-foundation`.
- A1 assessment file: `docs/ARNA_UNIFIED_SHELL_PARITY_A1.md`; current A1 head `cf25446d6a85bb9521c619e59d0649ccd7388d51`.
- Purpose: establish consistent, Amharic-first shell behavior across Workspace, Shareholder Portal, Admin Console, and Public Site while preserving distinct information architecture and trust boundaries.
- In scope: source inventory; shell props/labels/navigation; main landmarks and skip links; route focus; breakpoints; locale content fit; theme/forced-colors; keyboard and overlay focus; reduced motion; mounted acceptance fixtures for each app; documented intentional differences.
- Out of scope: public-site conversion to authenticated AppShell; authenticated controls on Public Site; authorization/routes/API/session/tenant/backend changes; locale persistence invention or LanguageSelector activation; token/component-contract rewrites before design-system authority is resolved; merge/deployment.
- Acceptance: exactly one primary main landmark and working skip link per surface; all controls keyboard-operable; predictable focus restoration; correct scope-specific navigation; no Amharic/English clipping at 320/360/390/768/1024/1280/1440 CSS px; light/dark/system/forced-colors behavior; no authenticated-only controls on Public Site; exact-head CI evidence plus separately recorded manual AT and physical-device checks.
- Dependencies: PR #69 exact-head checks are green at `b65cc0b`; PR #65 remains isolated with its 199-path manifest; historical design-system authority remains an explicit blocker for token/API changes.
- **A1 gate:** assessment is prepared, not Owner-frozen. No A2/A3 implementation is authorized by this document. Await explicit Owner approval of this scope and acceptance contract. A5 remains separate.

## 11. Delivery controls

- Preserve unrelated PR #65 changes; do not infer authorization from path relevance.
- Do not start PR #70 A2/A3 until Owner freezes its A1 scope and acceptance criteria.
- Do not treat reconstructed design-system documents as authoritative until explicit Owner approval or verified recovery of originals.
- Keep PR #69, #70, and #71 open/draft as appropriate; no merge or deployment without separate authorization.
- Report exact tested head separately from later documentation-only commits and their pending verification.
