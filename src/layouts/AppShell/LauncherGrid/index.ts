/*
 * =============================================================================
 * MASES Phase 2 UI — LauncherGrid — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/LauncherGrid/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the LauncherGrid SFC and its supporting types so
 * consumers can import everything from a stable path:
 *
 *     import LauncherGrid from '@/layouts/AppShell/LauncherGrid';
 *     import type {
 *       LauncherGridState,
 *       LauncherGridLabels,
 *       IconName,
 *     } from '@/layouts/AppShell/LauncherGrid';
 *
 * IconName is re-exported from BaseIcon (Unit 8.19) so a consumer
 * wiring the `iconForSlug` prop does not need a second import line.
 * =============================================================================
 */

import LauncherGrid from './LauncherGrid.vue';

export default LauncherGrid;

export type {
  LauncherGridState,
  LauncherGridLabels,
  IconName,
} from './LauncherGrid.vue';