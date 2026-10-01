/*
 * =============================================================================
 * MASES Phase 2 UI — PageTitle — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/PageTitle/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the PageTitle SFC. PageTitle has no supporting types —
 * its public API is three string props (title, suffix, separator), no
 * emits, and no slots. This barrel exists for API consistency with
 * every other Stage 10/11 unit so consumers can uniformly import from
 * '@/layouts/AppShell/PageTitle'.
 *
 *     import PageTitle from '@/layouts/AppShell/PageTitle';
 * =============================================================================
 */

import PageTitle from './PageTitle.vue';

export default PageTitle;