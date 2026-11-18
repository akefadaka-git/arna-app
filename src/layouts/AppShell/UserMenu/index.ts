/*
 * =============================================================================
 * MASES Phase 2 UI — UserMenu — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/UserMenu/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the UserMenu SFC and its supporting types so consumers
 * can import everything from a stable path:
 *
 *     import UserMenu from '@/layouts/AppShell/UserMenu';
 *     import type {
 *       UserMenuItem,
 *       UserMenuItemVariant,
 *       UserMenuLabels,
 *     } from '@/layouts/AppShell/UserMenu';
 *
 * All types are declared in a separate <script lang="ts"> block inside
 * UserMenu.vue so that TypeScript can consume them without
 * instantiating the component.
 * =============================================================================
 */

import UserMenu from './UserMenu.vue';

export default UserMenu;

export type {
  UserMenuItem,
  UserMenuItemVariant,
  UserMenuLabels,
} from './UserMenu.vue';