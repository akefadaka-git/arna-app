/*
 * =============================================================================
 * MASES Phase 2 UI — AbstractBackground barrel
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/AbstractBackground/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §6
 *            L-5 (this delivery)
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * Re-export the AbstractBackground component so that consumers can
 * import it as:
 *
 *     import AbstractBackground from '@/layouts/AppShell/AbstractBackground';
 *
 * matching the import pattern used by every other component in the
 * AppShell family (AppHeader, AppSidebar, AppFooter, MASESBrand,
 * MASESFooterContent, SkipToContent, MaintenanceBanner, UserMenu,
 * NotificationsBell, TenantSwitcher, CalendarContext,
 * LanguageSelector, LauncherGrid, LauncherTile, AppMobileDrawer,
 * PageTitle).
 *
 * The barrel contains no logic. It is a single re-export.
 * =============================================================================
 */

export { default } from './AbstractBackground.vue';