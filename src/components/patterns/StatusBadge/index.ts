/*
 * =============================================================================
 * MASES Phase 2 UI — StatusBadge — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/StatusBadge/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the StatusBadge SFC and re-exports the BadgeVariant and
 * BadgeSize types (owned by Unit 8.15) so consumers can import
 * everything they need from a single path:
 *
 *     import StatusBadge from '@/components/patterns/StatusBadge';
 *     import type {
 *       BadgeVariant,
 *       BadgeSize,
 *     } from '@/components/patterns/StatusBadge';
 *
 * BadgeVariant and BadgeSize are the same unions declared by BaseBadge.
 * They are re-exported here for ergonomic consumption by feature pages
 * that only touch StatusBadge's surface.
 * =============================================================================
 */

import StatusBadge from './StatusBadge.vue';

export default StatusBadge;

export type { BadgeVariant, BadgeSize } from '../../primitives/BaseBadge';