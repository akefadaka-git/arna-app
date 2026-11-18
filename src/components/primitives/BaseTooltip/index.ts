/*
 * =============================================================================
 * MASES Phase 2 UI — BaseTooltip — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseTooltip/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseTooltip SFC and the TooltipPlacement type so
 * consumers can import both from a stable path:
 *
 *     import BaseTooltip from '@/components/primitives/BaseTooltip';
 *     import type { TooltipPlacement } from '@/components/primitives/BaseTooltip';
 *
 * The default slot is scoped and exposes `{ tooltipId }`, which
 * consumers bind to their trigger's aria-describedby attribute. See
 * BaseTooltip.vue's header comment for the full accessibility
 * contract.
 * =============================================================================
 */

import BaseTooltip from './BaseTooltip.vue';

export default BaseTooltip;

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';