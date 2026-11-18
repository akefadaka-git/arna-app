/*
 * =============================================================================
 * MASES Phase 2 UI — ErrorActions — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/ErrorActions/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the ErrorActions SFC and the ErrorAction type so consumers
 * can import both from a stable path:
 *
 *     import ErrorActions from '@/components/composites/ErrorActions';
 *     import type { ErrorAction } from '@/components/composites/ErrorActions';
 *
 * The ErrorAction type is the shape of each of the three action props.
 * Consumers typically build the three actions from the Amendment A1
 * Revision 2 §A1R4.4 action catalog and their own translation layer.
 *
 * The component emits `perform(actionId)`; consumers dispatch on the
 * identifier (typically via a switch or a lookup into an action
 * handler map).
 * =============================================================================
 */

import ErrorActions from './ErrorActions.vue';

export default ErrorActions;

export type { ErrorAction } from './ErrorActions.vue';