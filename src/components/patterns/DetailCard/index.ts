/*
 * =============================================================================
 * MASES Phase 2 UI — DetailCard — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/DetailCard/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the DetailCard SFC and re-exports the MetaListItem type
 * (owned by Unit 9.23) so consumers can import everything they need
 * from a single path:
 *
 *     import DetailCard from '@/components/patterns/DetailCard';
 *     import type { MetaListItem } from '@/components/patterns/DetailCard';
 *
 * MetaListItem is the shape of each field row in the `fields` prop.
 * It is declared in the MetaList composite and re-exported here for
 * ergonomic consumption by feature pages that only touch DetailCard's
 * surface.
 * =============================================================================
 */

import DetailCard from './DetailCard.vue';

export default DetailCard;

export type { MetaListItem } from '../../composites/MetaList';