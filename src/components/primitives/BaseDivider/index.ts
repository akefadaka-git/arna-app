/*
 * =============================================================================
 * MASES Phase 2 UI — BaseDivider — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseDivider/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseDivider SFC so consumers can import it via a
 * stable layer-appropriate path:
 *
 *     import BaseDivider from '@/components/primitives/BaseDivider';
 *
 * The DividerOrientation type is re-exported for consumers that type a
 * variable against the accepted values (e.g., a layout helper that
 * decides orientation dynamically).
 * =============================================================================
 */

import BaseDivider from './BaseDivider.vue';

export default BaseDivider;

export type DividerOrientation = 'horizontal' | 'vertical';