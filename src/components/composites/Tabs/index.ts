/*
 * =============================================================================
 * MASES Phase 2 UI — Tabs — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/Tabs/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the Tabs SFC and its two supporting types so consumers
 * can import all three from a stable path:
 *
 *     import Tabs from '@/components/composites/Tabs';
 *     import type { TabItem, TabsValue } from '@/components/composites/Tabs';
 *
 * The two types are declared in a separate <script> block inside
 * Tabs.vue (see that file's header comment) and re-exported here so
 * consumers can import them from the barrel.
 * =============================================================================
 */

import Tabs from './Tabs.vue';

export default Tabs;

export type { TabItem, TabsValue } from './Tabs.vue';