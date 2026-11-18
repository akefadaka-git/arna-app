/*
 * =============================================================================
 * MASES Phase 2 UI — Skeleton — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/Skeleton/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the Skeleton SFC and its two supporting types so
 * consumers can import all three from a stable path:
 *
 *     import Skeleton from '@/components/composites/Skeleton';
 *     import type {
 *       SkeletonVariant,
 *       SkeletonAnimation,
 *     } from '@/components/composites/Skeleton';
 *
 * Both types are re-exported for consumers that type a variable against
 * the accepted values (e.g., a table-row skeleton renderer that picks
 * a variant per column type).
 * =============================================================================
 */

import Skeleton from './Skeleton.vue';

export default Skeleton;

export type { SkeletonVariant, SkeletonAnimation } from './Skeleton.vue';