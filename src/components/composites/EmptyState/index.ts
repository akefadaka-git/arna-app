/*
 * =============================================================================
 * MASES Phase 2 UI — EmptyState — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/EmptyState/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the EmptyState SFC and the EmptyStateActionVariant type so
 * consumers can import both from a stable path:
 *
 *     import EmptyState from '@/components/composites/EmptyState';
 *     import type { EmptyStateActionVariant } from '@/components/composites/EmptyState';
 *
 * The EmptyStateActionVariant type is re-exported for consumers that
 * type a variable against the accepted values (e.g., a feature that
 * chooses 'secondary' when the empty state is informational rather than
 * inviting a create action).
 * =============================================================================
 */

import EmptyState from './EmptyState.vue';

export default EmptyState;

export type { EmptyStateActionVariant } from './EmptyState.vue';