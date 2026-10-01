/*
 * =============================================================================
 * MASES Phase 2 UI — AppMobileDrawer — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/AppMobileDrawer/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the AppMobileDrawer SFC and its labels type. The
 * NavItem and AppSidebarLabels types are re-exported from
 * AppSidebar (Unit 11.16) so a consumer importing from this module
 * has everything it needs to configure the drawer:
 *
 *     import AppMobileDrawer from '@/layouts/AppShell/AppMobileDrawer';
 *     import type {
 *       AppMobileDrawerLabels,
 *       NavItem,
 *       AppSidebarLabels,
 *     } from '@/layouts/AppShell/AppMobileDrawer';
 *
 * The pass-through re-exports avoid a second import line at the call
 * site and make the drawer's contract self-contained from the
 * consumer's perspective.
 * =============================================================================
 */

import AppMobileDrawer from './AppMobileDrawer.vue';

export default AppMobileDrawer;

export type {
  AppMobileDrawerLabels,
  NavItem,
  AppSidebarLabels,
} from './AppMobileDrawer.vue';