/*
 * =============================================================================
 * MASES Phase 2 UI — AppHeader — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/AppHeader/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the AppHeader SFC. AppHeader has no supporting types —
 * its public API is two optional props (sticky, mobileMenuLabel), one
 * emit (open-mobile-menu), and four slots (brand, nav, actions,
 * mobile-menu-trigger). This barrel exists for API consistency with
 * every other Stage 10/11 unit.
 *
 *     import AppHeader from '@/layouts/AppShell/AppHeader';
 * =============================================================================
 */

import AppHeader from './AppHeader.vue';

export default AppHeader;