/*
 * =============================================================================
 * MASES Phase 2 UI — AppShell — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the AppShell capstone SFC and its supporting types.
 * Consumers import the shell as:
 *
 *     import AppShell from '@/layouts/AppShell';
 *
 *     import type {
 *       AppShellLabels,
 *       AppShellMaintenanceState,
 *     } from '@/layouts/AppShell';
 *
 * The pass-through re-exports of NavItem and the per-region label
 * types exist so a consumer configuring the shell does not need to
 * reach into each sub-unit's folder. This is the single public
 * entry point for the shell.
 * =============================================================================
 */

import AppShell from './AppShell.vue';

export default AppShell;

export type {
  AppShellLabels,
  AppShellMaintenanceState,
  // pass-through re-exports — see the file header comment
  NavItem,
  AppSidebarLabels,
  UserMenuItem,
  UserMenuLabels,
  NotificationsBellLabels,
  TenantSwitcherLabels,
  AppMobileDrawerLabels,
  MaintenanceBannerVariant,
} from './AppShell.vue';