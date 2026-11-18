/*
 * =============================================================================
 * MASES Phase 2 UI — Drawer — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/Drawer/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the Drawer SFC and the two supporting types so consumers
 * can import all three from a stable path:
 *
 *     import Drawer from '@/components/composites/Drawer';
 *     import type { DrawerSide, DrawerSize } from '@/components/composites/Drawer';
 *
 * Both types are re-exported for consumers that type a variable against
 * the accepted values (e.g., a settings panel that picks side='left'
 * for a navigation drawer and side='right' for a detail panel).
 * =============================================================================
 */

import Drawer from './Drawer.vue';

export default Drawer;

export type DrawerSide = 'left' | 'right';

export type DrawerSize = 'sm' | 'md' | 'lg' | 'full';