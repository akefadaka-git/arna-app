/*
 * =============================================================================
 * MASES Phase 2 UI — Pagination — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/Pagination/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the Pagination SFC and the TotalLabelContext type so
 * consumers can import both from a stable path:
 *
 *     import Pagination from '@/components/composites/Pagination';
 *     import type { TotalLabelContext } from '@/components/composites/Pagination';
 *
 * TotalLabelContext is the payload passed to the `totalLabel` formatter
 * prop. Consumers write:
 *
 *     :total-label="(ctx) => t('pagination.showing', ctx)"
 *     // or a plain template-literal:
 *     :total-label="(ctx) => `Showing ${ctx.from}–${ctx.to} of ${ctx.totalItems}`"
 *
 * The component does not fabricate the string; the consumer's
 * translation layer owns it.
 * =============================================================================
 */

import Pagination from './Pagination.vue';

export default Pagination;

export type { TotalLabelContext } from './Pagination.vue';