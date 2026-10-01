/*
 * =============================================================================
 * MASES Phase 2 UI — ErrorState — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/ErrorState/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the ErrorState SFC and the ErrorStateVariant type so
 * consumers can import both from a stable path:
 *
 *     import ErrorState from '@/components/composites/ErrorState';
 *     import type { ErrorStateVariant } from '@/components/composites/ErrorState';
 *
 * The ErrorStateVariant type is re-exported for consumers that type a
 * variable against the accepted values (e.g., a feature that maps a
 * backend error code to the correct variant).
 * =============================================================================
 */

import ErrorState from './ErrorState.vue';

export default ErrorState;

export type { ErrorStateVariant } from './ErrorState.vue';