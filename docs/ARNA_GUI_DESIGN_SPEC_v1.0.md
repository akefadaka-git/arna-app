# ARNA GUI Design Specification v1.0

- **Programme:** ARNA UI/UX Enhancement
- **Status:** A1 specification draft for Owner review
- **Repository:** `akefadaka-git/arna-app`
- **Baseline:** `28c1c8c0787a666cad12d66c650bfa71475a87ad`
- **Scope:** Shared design-system foundation and four existing frontend experiences
- **Authority:** Owner-governed; no merge or deployment is authorized by this document

## 1. Purpose and design intent

Enhance the existing ARNA frontend into one coherent, premium enterprise experience. This is an evolution of the current Vue 3 / TypeScript application, not a rewrite and not a new standalone dashboard.

The generated dashboard illustration is an art-direction reference only. It is not a screenshot, an implementation specification for fake data, or permission to invent operational metrics. Production screens must use existing routes, API contracts, and authorized data sources.

## 2. Application scope

The programme covers the four existing independent static builds:

| Experience | Entry point | Primary design responsibility |
|---|---|---|
| Enterprise workspace | `workspace-entry/` | Shared authenticated shell, navigation, dashboard and domain workflows |
| Shareholder portal | `portal-entry/` | Shareholder self-service and account-specific workflows |
| Administration console | `admin-entry/` | Administrative oversight, configuration and moderation |
| Public corporate website | `public-entry/` | Corporate identity, public information and public workflows |

The four entry points and output directories remain independent. Shared foundations may be reused without collapsing the applications into one runtime.

## 3. Brand and visual direction

The approved ARNA Brand Identity Master Specification v1.0 remains authoritative.

- Enterprise blue `#123D68` is the primary structural brand color.
- Action blue `#1769AA` is reserved for interactive emphasis.
- Aubergine `#3D1C50`, crimson `#B4233A`, and gold `#D4A017` are restrained supporting accents.
- Warm ivory `#FFFDF7`, cloud, white, and basalt provide readable surfaces and text.
- Existing approved corporate emblem assets remain the source of truth; do not redraw or replace them.
- Use the Living Path concept only as a restrained illustrative motif on appropriate surfaces. Do not apply decorative patterns to dense business tables and forms.
- Do not copy the exact composition or invented dashboard data from the generated concept image.

All runtime color use must resolve through semantic tokens. Brand primitives must not be used directly by components when a semantic role is appropriate. Foreground/background combinations require measured contrast verification before adoption.

## 4. Shared design-system foundation

### 4.1 Token tiers

Retain the repository's tiered token model and existing token names for compatibility:

1. **Primitive tokens:** approved palette and neutral scales.
2. **Semantic tokens:** page, raised, overlay and muted surfaces; primary, secondary and muted text; border; action; focus; selected; success; warning; error; information; disabled.
3. **Component tokens:** component-local references to semantic roles, not independent color systems.

Extend the existing substrate additively where possible. Do not rename, delete, or silently reassign frozen tokens. Any necessary compatibility migration must be explicit and covered by tests.

Token coverage must include color, typography, spacing, sizing, borders, radii, elevation, motion, focus, and z-index.

### 4.2 Light and dark themes

Implement complete light and dark semantic mappings. The initial theme follows `prefers-color-scheme`; a user-selected preference may override the system preference and must persist using the repository's existing state/persistence conventions. Theme selection must not cause a flash of the wrong theme where the current bootstrap architecture permits early initialization.

Every shared component and all four experiences must be checked in both themes. No component may retain an unreadable hard-coded light-only surface.

### 4.3 Typography and localization

- Amharic is the primary interface language; English remains supported.
- Retain left-to-right document direction for both languages unless a future language contract explicitly requires otherwise.
- Define shared font stacks only after confirming actual Ethiopic glyph coverage, weights, numerals, punctuation and fallback behavior.
- Define display, page-title, section-title, body, label, caption and numeric/data styles.
- Validate realistic long Amharic labels in navigation, cards, forms, tables, dialogs and mobile layouts.
- Do not clip or truncate essential financial, identity, status or authorization information.

### 4.4 Shared component states

Document and implement reusable primitives/patterns for buttons, links, text inputs, selects, checkboxes, radio controls, cards, tables, dialogs, alerts, badges/status labels, navigation, breadcrumbs, tabs, pagination, loading indicators, empty states, error states and permission-denied states.

Applicable components must expose default, hover, focus-visible, active, disabled, loading, selected, success, warning and error states. Preserve existing component contracts unless an explicit migration is reviewed.

## 5. Application shell and page composition

The shared authenticated shell should provide consistent brand placement, primary navigation, page heading, breadcrumbs where applicable, contextual actions, user/account controls, notifications where already supported, responsive navigation, main content and footer.

The shell must not become a business-data service or authorization authority. Feature pages and existing services remain responsible for their data. Backend authorization remains authoritative; hidden controls and client route checks are not security controls.

The workspace dashboard is a navigation and overview surface. It may show operational metrics only where a real, authorized API source and metric definition exist. Do not fabricate totals, growth rates, charts, notifications or activity rows.

## 6. Responsive behavior

Use mobile-first responsive layouts with tested representative widths:

- Mobile: 320–639 CSS px
- Tablet: 640–1023 CSS px
- Desktop: 1024–1439 CSS px
- Wide desktop: 1440 CSS px and above

Navigation, cards, forms, tables, dialogs and data visualizations must remain usable without unintended horizontal overflow. Data tables may use an intentional accessible overflow region when a true tabular layout cannot reflow without losing meaning.

## 7. Accessibility and interaction

Target WCAG 2.2 AA. Required checks include semantic landmarks and heading order, accessible names, keyboard-only operation, visible focus, focus management in dialogs/drawers, contrast, non-color status communication, reduced-motion support, touch target sizing, zoom/reflow and screen-reader status announcements.

Automated checks alone are insufficient; manual keyboard and representative assistive-technology review must be recorded.

## 8. Domain and security boundaries

Keep People, Organization, Governance, Documents/File Management, Finance, Shareholder, Loan/Wallet, Procurement, Communication, Calendar and Reporting UI in their existing owning feature areas.

- Do not move domain code into shared shell components.
- Do not duplicate API business rules or create a second source of truth.
- Do not change API contracts, authentication/SSO, tenant resolution, permissions or backend code as part of visual enhancement.
- Preserve existing loading, empty, validation, forbidden, error and stale-data behavior; improve presentation without weakening semantics.
- Do not introduce dependencies or alter build/deployment behavior without a separate reviewed decision.

## 9. Phase sequence and acceptance evidence

The programme proceeds sequentially:

1. **Phase 1 — Design system:** token specification, light/dark themes, typography, shared primitives and documentation.
2. **Phase 2 — Application shell:** responsive shell and navigation across applicable authenticated builds.
3. **Phase 3 — Shared components:** operational patterns and data components.
4. **Phase 4 — Domain experiences:** domain-by-domain UI enhancement without boundary violations.
5. **Phase 5 — Dashboards/reporting:** source-backed metrics and operational dashboards.
6. **Phase 6 — Public website:** corporate site enhancement on the shared foundations.
7. **Phase 7 — Final quality/release acceptance:** cross-browser, responsive, language, theme, accessibility and regression evidence.

For each phase, report exact base/head SHAs, changed files, affected applications/domains, exact-head CI, test results, screenshots, accessibility findings, unresolved defects, and explicit statuses: VERIFIED, PARTIAL, MISSING, UNRESOLVED, UNKNOWN or NOT RUN.

A phase readiness percentage must be calculated from a weighted checklist; it cannot override mandatory blockers.

## 10. Gate and release controls

This document is an A1 draft. Owner review is required before treating its detailed specifications as approved. A2 validates the exact implementation baseline and impact. A3 authorizes the specific implementation slice. A4 verifies the exact head. A5 is a separate release/deployment decision.

This branch does not change `main`, merge any branch, alter repository settings, run database operations, modify the API, or deploy to a server.

## 11. Baseline observations at preparation

- Default branch: `main`.
- Baseline commit: `28c1c8c0787a666cad12d66c650bfa71475a87ad`.
- Frontend: Vue 3, TypeScript, Vite 6, Vue Router and Pinia.
- Four independent static builds are documented in the repository README.
- Existing tiered tokens and approved ARNA brand primitives are present.
- Existing token documentation states that dark mode is deferred; dark-theme implementation and cross-surface verification remain outstanding.
- Existing workspace dashboard is permission-filtered feature navigation, not a source-backed executive KPI dashboard.
- The latest main commit already includes a responsive dashboard-card and public-site navigation enhancement; that work is preserved as baseline.
- Runtime browser inspection, measured WCAG 2.2 AA audit and comprehensive visual-regression baseline remain unverified unless separately evidenced.

## 12. Open specification decisions

The following must be resolved before the corresponding implementation:

1. Confirm the final Amharic and Latin font stacks based on glyph and readability evidence.
2. Approve semantic light/dark color pairings only after contrast measurement.
3. Define whether theme preference is stored per browser/user using an existing supported persistence mechanism.
4. Confirm the exact shared component inventory and migration order against current feature consumers.
5. Define the evidence matrix for workspace, portal, admin and public builds, including representative routes and viewports.
