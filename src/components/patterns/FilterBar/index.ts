/*
 * =============================================================================
 * MASES Phase 2 UI — FilterBar — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/FilterBar/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the FilterBar SFC and its supporting types so consumers
 * can import everything from a stable path:
 *
 *     import FilterBar from '@/components/patterns/FilterBar';
 *     import type {
 *       FilterType,
 *       FilterValue,
 *       FilterOption,
 *       FilterDescriptor,
 *       FilterUpdatePayload,
 *     } from '@/components/patterns/FilterBar';
 *
 * Consumers typically build the filters array from their page's filter
 * state and wire `update:filter` and `clear` back into that state.
 * =============================================================================
 */

import FilterBar from './FilterBar.vue';

export default FilterBar;

export type {
  FilterType,
  FilterValue,
  FilterOption,
  FilterDescriptor,
  FilterUpdatePayload,
} from './FilterBar.vue';