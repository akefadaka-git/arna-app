/*
 * =============================================================================
 * MASES Phase 2 UI — AppSidebar — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/AppSidebar/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the AppSidebar SFC, its navigation types, and the
 * isNavGroup type guard so consumers can import everything from a
 * stable path:
 *
 *     import AppSidebar, {
 *       isNavGroup,
 *     } from '@/layouts/AppShell/AppSidebar';
 *
 *     import type {
 *       NavItem,
 *       NavLeaf,
 *       NavGroup,
 *       NavPermissionMode,
 *       AppSidebarLabels,
 *     } from '@/layouts/AppShell/AppSidebar';
 *
 * The type guard is exported so a consumer that inspects a mixed
 * NavItem[] array (e.g. to log or transform it) narrows without
 * duplicating the `'children' in item` check.
 * =============================================================================
 */

import AppSidebar from './AppSidebar.vue';

export default AppSidebar;

export { isNavGroup } from './AppSidebar.vue';

export type {
  NavPermissionMode,
  NavLeaf,
  NavGroup,
  NavItem,
  AppSidebarLabels,
} from './AppSidebar.vue';