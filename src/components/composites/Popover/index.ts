/*
 * =============================================================================
 * MASES Phase 2 UI — Popover — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/Popover/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the Popover SFC and the PopoverPlacement type so consumers
 * can import both from a stable path:
 *
 *     import Popover from '@/components/composites/Popover';
 *     import type { PopoverPlacement } from '@/components/composites/Popover';
 *
 * The scoped default slot exposes:
 *
 *     { triggerId, controlsId, open, toggle, ariaHaspopup,
 *       ariaExpanded, ariaControls }
 *
 * Consumers bind these on their own trigger element. See Popover.vue's
 * header comment for the full contract.
 * =============================================================================
 */

import Popover from './Popover.vue';

export default Popover;

export type { PopoverPlacement } from './Popover.vue';