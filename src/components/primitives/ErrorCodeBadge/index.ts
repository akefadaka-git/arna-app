/*
 * =============================================================================
 * MASES Phase 2 UI — ErrorCodeBadge — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/ErrorCodeBadge/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the ErrorCodeBadge SFC and the ErrorCodeBadgeVariant type
 * so consumers can import both from a stable path:
 *
 *     import ErrorCodeBadge from '@/components/primitives/ErrorCodeBadge';
 *     import type { ErrorCodeBadgeVariant } from '@/components/primitives/ErrorCodeBadge';
 *
 * The ErrorCodeBadgeVariant type is re-exported for consumers that
 * type a variable against the accepted values (e.g., ErrorPage.vue at
 * Stage 10, whose archetype table maps HTTP statuses to variants).
 * =============================================================================
 */

import ErrorCodeBadge from './ErrorCodeBadge.vue';

export default ErrorCodeBadge;

export type ErrorCodeBadgeVariant = 'danger' | 'warning' | 'neutral';