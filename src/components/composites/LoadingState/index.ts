/*
 * =============================================================================
 * MASES Phase 2 UI — LoadingState — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/LoadingState/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the LoadingState SFC and the LoadingStateSize type so
 * consumers can import both from a stable path:
 *
 *     import LoadingState from '@/components/composites/LoadingState';
 *     import type { LoadingStateSize } from '@/components/composites/LoadingState';
 *
 * The LoadingStateSize type is re-exported for consumers that type a
 * variable against the accepted values (e.g., a route meta configuration
 * that selects the loading size per route).
 * =============================================================================
 */

import LoadingState from './LoadingState.vue';

export default LoadingState;

export type { LoadingStateSize } from './LoadingState.vue';