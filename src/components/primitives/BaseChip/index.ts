/*
 * =============================================================================
 * MASES Phase 2 UI — BaseChip — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseChip/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseChip SFC and the ChipVariant type so consumers
 * can import both from a stable path:
 *
 *     import BaseChip from '@/components/primitives/BaseChip';
 *     import type { ChipVariant } from '@/components/primitives/BaseChip';
 *
 * The ChipVariant type is re-exported for consumers that type a
 * variable against the accepted values (e.g., a filter-bar
 * configuration that decides chip variants dynamically).
 * =============================================================================
 */

import BaseChip from './BaseChip.vue';

export default BaseChip;

export type ChipVariant = 'default' | 'accent';