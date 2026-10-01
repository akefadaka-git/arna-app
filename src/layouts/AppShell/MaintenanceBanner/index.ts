/*
 * =============================================================================
 * MASES Phase 2 UI — MaintenanceBanner — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/MaintenanceBanner/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the MaintenanceBanner SFC and its variant type so
 * consumers can import both from a stable path:
 *
 *     import MaintenanceBanner from '@/layouts/AppShell/MaintenanceBanner';
 *     import type {
 *       MaintenanceBannerVariant,
 *     } from '@/layouts/AppShell/MaintenanceBanner';
 *
 * The variant union is exported so consumers that compute the variant
 * dynamically (e.g. from a status-code mapping) can type their own
 * variables against the same union without duplicating the literals.
 * =============================================================================
 */

import MaintenanceBanner from './MaintenanceBanner.vue';

export default MaintenanceBanner;

export type { MaintenanceBannerVariant } from './MaintenanceBanner.vue';