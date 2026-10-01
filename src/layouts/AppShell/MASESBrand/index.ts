/*
 * =============================================================================
 * MASES Phase 2 UI — MASESBrand barrel
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/MASESBrand/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.x (Layout)
 *            CR-BRAND1 (this delivery)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (CR-BRAND1). Re-exports the MASESBrand
 *          component so consumers import from
 *          `@/layouts/AppShell/MASESBrand` rather than from the
 *          component file directly, matching the import path the
 *          other AppShell components use.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The public entry point for the MASESBrand component. Consumers
 * import:
 *
 *     import MASESBrand from '@/layouts/AppShell/MASESBrand';
 *
 * The barrel exists so that:
 *
 *   · The component's internal file name (`MASESBrand.vue`) is not
 *     part of any consumer's import path. A future rename of the
 *     `.vue` file — a split into sub-components, a move — does not
 *     require editing the import sites.
 *
 *   · The component's public surface can grow (an exported props
 *     type, a sub-component) without changing the import path.
 *     Consumers continue to import from the barrel.
 *
 *   · The import path matches the convention used throughout
 *     `layouts/AppShell/`: AppShell, AppHeader, AppFooter,
 *     AppSidebar, UserMenu, and the rest are all imported through
 *     their directory's `index.ts`.
 *
 * -----------------------------------------------------------------------------
 * What this file exports
 * -----------------------------------------------------------------------------
 * The MASESBrand component, as the default export. The component has
 * no props, no emits, no slots, and no auxiliary types in its v1.0.0
 * delivery; the barrel therefore re-exports exactly one value.
 *
 * If a future revision adds a public type (e.g. a props interface for
 * a variant, a sub-label prop), it is exported from here as a named
 * export. No consumer of the default export is affected.
 *
 * -----------------------------------------------------------------------------
 * No default-less or side-effect exports
 * -----------------------------------------------------------------------------
 * The barrel does not re-export anything from the design system, the
 * label files, or any other module. Consumers that need
 * `masesBrandLabels` import it from `@/router/shell-labels` directly,
 * which is where it is declared. The barrel's job is to expose the
 * component; it is not a convenience aggregator.
 *
 * This matches the pattern the sibling barrels follow. `AppShell`'s
 * barrel re-exports the AppShell component and the types declared in
 * AppShell.vue's `<script lang="ts">` block; it does not re-export
 * the label files, the stores, or the router. `LauncherGrid`'s
 * barrel re-exports the component and its labels interface. Neither
 * is a bulk re-export of unrelated modules.
 * =============================================================================
 */

export { default } from './MASESBrand.vue';