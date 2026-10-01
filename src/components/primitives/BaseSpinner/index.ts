/*
 * =============================================================================
 * MASES Phase 2 UI — BaseSpinner — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseSpinner/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseSpinner SFC so consumers can import it via a
 * stable layer-appropriate path:
 *
 *     import BaseSpinner from '@/components/primitives/BaseSpinner';
 *
 * The SpinnerSize type is re-exported for consumers that type a
 * variable against the accepted values (e.g., the LoadingState
 * pattern at Stage 10 re-exposes this size).
 * =============================================================================
 */

import BaseSpinner from './BaseSpinner.vue';

export default BaseSpinner;

export type SpinnerSize = 'sm' | 'md' | 'lg';