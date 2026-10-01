/*
 * =============================================================================
 * MASES Phase 2 UI — BaseBadge — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseBadge/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseBadge SFC so consumers can import it via a stable
 * layer-appropriate path:
 *
 *     import BaseBadge from '@/components/primitives/BaseBadge';
 *
 * The BadgeVariant and BadgeSize types are re-exported so TypeScript
 * consumers can type a variable against the accepted values without
 * duplicating the unions. This matters for the StatusBadge pattern
 * (Stage 10) whose prop validation derives from BaseBadge's variant set.
 * =============================================================================
 */

import BaseBadge from './BaseBadge.vue';

export default BaseBadge;

export type BadgeVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'
  | 'accent';

export type BadgeSize = 'sm' | 'md';