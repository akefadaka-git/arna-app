/*
 * =============================================================================
 * MASES Phase 2 UI — AppFooter — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/AppFooter/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the AppFooter SFC. AppFooter has no supporting types —
 * its public API is two optional string props (copyright, version) and
 * one optional slot (default). This barrel exists for API consistency
 * with every other Stage 10/11 unit so consumers can uniformly import
 * from '@/layouts/AppShell/AppFooter'.
 *
 *     import AppFooter from '@/layouts/AppShell/AppFooter';
 * =============================================================================
 */

import AppFooter from './AppFooter.vue';

export default AppFooter;