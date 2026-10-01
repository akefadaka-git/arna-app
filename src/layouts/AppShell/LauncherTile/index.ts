/*
 * =============================================================================
 * MASES Phase 2 UI — LauncherTile — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/LauncherTile/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the LauncherTile SFC and its target type so consumers can
 * import everything from a stable path:
 *
 *     import LauncherTile from '@/layouts/AppShell/LauncherTile';
 *     import type {
 *       LauncherTileTarget,
 *     } from '@/layouts/AppShell/LauncherTile';
 *
 * The LauncherApplication type is defined in @/stores/launcher
 * (Unit 11.7); consumers importing the tile's props will also need to
 * import that type from the store, or accept the inference.
 * =============================================================================
 */

import LauncherTile from './LauncherTile.vue';

export default LauncherTile;

export type { LauncherTileTarget } from './LauncherTile.vue';