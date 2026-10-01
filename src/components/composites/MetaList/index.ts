/*
 * =============================================================================
 * MASES Phase 2 UI — MetaList — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/MetaList/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the MetaList SFC and its three supporting types so
 * consumers can import all four from a stable path:
 *
 *     import MetaList from '@/components/composites/MetaList';
 *     import type {
 *       MetaListItem,
 *       MetaListColumns,
 *       MetaListDensity,
 *     } from '@/components/composites/MetaList';
 *
 * MetaListItem is the item shape. MetaListColumns and MetaListDensity
 * are the prop unions.
 * =============================================================================
 */

import MetaList from './MetaList.vue';

export default MetaList;

export type {
  MetaListItem,
  MetaListColumns,
  MetaListDensity,
} from './MetaList.vue';