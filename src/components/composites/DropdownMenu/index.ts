/*
 * =============================================================================
 * MASES Phase 2 UI — DropdownMenu — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/DropdownMenu/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the DropdownMenu SFC and its two supporting types so
 * consumers can import all three from a stable path:
 *
 *     import DropdownMenu from '@/components/composites/DropdownMenu';
 *     import type {
 *       MenuItem,
 *       DropdownMenuAlign,
 *     } from '@/components/composites/DropdownMenu';
 *
 * The scoped default slot exposes:
 *
 *     { triggerId, menuId, open, toggle, ariaHaspopup, ariaExpanded,
 *       ariaControls }
 *
 * Consumers bind these on their own trigger element. See
 * DropdownMenu.vue's header comment for the full contract.
 * =============================================================================
 */

import DropdownMenu from './DropdownMenu.vue';

export default DropdownMenu;

export type { MenuItem } from './DropdownMenu.vue';

export type DropdownMenuAlign = 'start' | 'end';