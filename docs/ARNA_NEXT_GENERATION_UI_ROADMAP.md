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
- Upgrade the existing `AppHeaderNavigation` Ctrl/⌘+K destination search rather than create a competing second palette. Its shell labels and known workspace/portal destination names now follow the active Amharic/English locale. Remaining enhancements include stronger arrow-key result navigation, clearer grouping, consistent focus restoration, recent destinations, and a distinct cross-domain entity-search layer when APIs are ready.
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
- The repository already contains a NotificationsCenter, store, API adapter, and shell trigger. Reconcile the actual backend endpoints/schema and test the existing integration before expanding it; do not duplicate the feature or display simulated notifications.
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
- Add command palette, global search entry point, contextual quick actions, and notification affordances.
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
- Reconcile the existing NotificationsCenter API adapter and shell integration against the actual backend before expanding notification actions.
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
- A Ctrl/⌘+K navigation destination search already exists in AppHeaderNavigation. Its shell controls and known workspace/portal destination labels have been localized in the current enhancement branch; it remains a navigation-only index, not a cross-domain entity search.
- NotificationsCenter, its Pinia store, and API adapter already exist; backend schema/endpoint reconciliation and mounted behavior coverage remain required.
- LanguageSelector exists but is intentionally not mounted pending a locale-persistence API contract.
- PR #67 has a known failing mounted-browser suite; it is not accepted as complete.
- Historical catalogue/design-system source documents have not been recovered; reconstructed documents remain drafts pending Owner authority.
- No full authenticated-shell visual acceptance, formal WCAG certification, physical-device acceptance, or 3D model viewer is claimed.

## 8. First execution slice

The new branch starts with:
1. minimum-size checkbox and option targets;
2. reliable mounted tests for DataTable selection and diagnostic clipboard output;
3. a source-backed enhancement roadmap;
4. exact-head CI, then incremental implementation of the unified shell, component lab, navigation, workflow, dashboard, and productivity workstreams.
