# ARNA Design System 2.0 — Implementation Guide

**Status:** Phase 1 implementation guide  
**Scope:** Shared frontend design foundation for Workspace, Shareholder Portal, Admin Console and Public Site  
**Source baseline:** `main` at `2eff0a0e08062728bba071b1728ffe1886e200ad`

## 1. Authority and design principles

ARNA Design System 2.0 extends the existing Vue/TypeScript application. It does not replace the approved ARNA brand identity, frozen primitive token substrate, application entry points, route ownership or domain boundaries.

The design system is Amharic-first and mobile-first. Components must consume semantic tokens rather than introduce local, unreviewed design values. Backend authorization remains authoritative; visual hiding or disabling is not an access-control boundary.

## 2. Source-of-truth files

| Concern | Source |
|---|---|
| Primitive and semantic token substrate | `src/styles/tokens.css` |
| Theme overlay, global typography and accessibility defaults | `src/styles/themes.css` |
| Shared button | `src/components/primitives/BaseButton/BaseButton.vue` |
| Shared form field | `src/components/composites/FormField/FormField.vue` |
| Shared card | `src/components/patterns/Card/Card.vue` |
| Shared data table | `src/components/patterns/DataTable/DataTable.vue` |
| Shared modal/dialog | `src/components/composites/Modal/Modal.vue` |
| Automated theme/component contracts | `tests/design-system-theme-contract.test.mjs` |

The four application entry points import the shared theme layer:
- `workspace-entry/main.ts`
- `portal-entry/main.ts`
- `admin-entry/main.ts`
- `public-entry/main.ts`

The CSS import is bundled by Vite into the application’s generated stylesheet. A deployed page is not expected to request a standalone file literally named `themes.css`.

## 3. Theme behavior

The theme layer supports:
- Light as the default semantic mapping.
- Dark semantic mappings for the shared surface, text, border, action, icon, state, overlay and authentication roles.
- Operating-system dark preference when no explicit light override is present.
- Explicit `data-theme="light"` and `data-theme="dark"` overrides on the document root.
- Native `color-scheme` hints for browser controls.

The shared `ThemePreferenceControl` is now rendered in the authenticated AppShell, authentication layout, and public-site navigation. It exposes three explicit choices: System, Light, and Dark. The preference is persisted per origin under `arna.theme`; System removes the explicit `data-theme` attribute so the operating-system media query remains authoritative. If browser storage is unavailable, the selection still applies to the current page but cannot be persisted.

## 4. Bilingual typography

The global theme layer uses the existing frozen typography tokens:
- English: Inter-first Latin stack.
- Amharic: Noto Sans Ethiopic-first stack.
- The document `lang` attribute selects the appropriate stack.
- Body size and line-height remain token-driven.

Content authors and component owners must allow Amharic labels and names to wrap naturally. Do not impose English-only fixed widths, truncate essential labels, or assume text length from Latin strings.

## 5. Accessibility and interaction states

The shared theme layer establishes:
- Visible `:focus-visible` outlines.
- Invalid form-control border treatment through `aria-invalid`.
- Disabled control cursor semantics.
- Reduced-motion overrides.
- Forced-colors focus treatment.

Shared primitives retain semantic contracts:
- Buttons expose disabled and busy states and require accessible names for icon-only use.
- Form fields connect descriptions and validation feedback.
- Interactive cards expose keyboard focus and Enter/Space activation.
- Tables retain native table semantics, column scope and sort state.
- Dialogs use the native dialog element, labelled title and modal semantics.

These are implementation contracts, not a substitute for manual keyboard, screen-reader, contrast or assistive-technology testing.

## 6. Rules for component authors

1. Consume semantic Tier-2 roles; do not reference primitive palette values directly from feature components.
2. Do not hardcode colors, spacing, radii, typography, shadows, durations or z-index values where a token exists.
3. Preserve existing component public props, events, slots and route behavior unless a separately approved change requires otherwise.
4. Provide loading, empty, error, disabled, success, warning and permission-denied states where relevant.
5. Keep focus visible and keyboard operation complete.
6. Test long Amharic labels, mixed Ethiopic/Latin content, numerals and date strings.
7. Keep business logic and authorization in their existing domain/API layers.

## 7. Required verification

The frontend CI workflow runs the following Phase 1-relevant checks:
- Locked dependency installation.
- TypeScript type-check.
- All four static application builds.
- Static output and deployment-policy verification.
- Public build smoke test.
- Approved ARNA palette/contrast contract.
- Design-system theme and shared-component contract.
- Responsive App Shell contract.

The design-system contract also checks that all four entry points import the shared theme stylesheet.

## 8. Phase 1 A3 remediation

- `src/core/theme-preference.ts` owns the shared System/Light/Dark preference and per-origin persistence.
- `src/layouts/ThemePreferenceControl.vue` provides a labelled, keyboard-operable native select with Amharic and English option names.
- The control is composed in AppShell, AuthLayout and PublicSiteLayout, covering authenticated pages, login/recovery pages and the public site.
- Authenticated applications initialize the preference before the first route render through App.vue; the independent public entry initializes it before mounting.
- The four HTML entry documents default to `lang="am"`; App.vue synchronizes the language attribute with the active locale store.
- The theme preference is intentionally per-origin. No cross-subdomain cookie or shared preference service is introduced.
- The font stacks remain token declarations. This change does not bundle font binaries; actual font availability and computed glyph rendering still require production-browser confirmation.

## 9. Known acceptance limitations

Automated source contracts and successful builds do not establish:
- A complete manual WCAG 2.2 AA audit.
- Screen-reader behavior across supported assistive technologies.
- Visual correctness at every mobile, tablet and desktop breakpoint.
- Theme switching and preference persistence through a user-facing control.
- Authenticated domain workflows in all four applications.
- Production deployment parity with the current repository head.

Those checks remain separate A4/A5 acceptance work. The current programme does not authorize deployment, merge or hosting changes as part of this guide.
