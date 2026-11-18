/*
 * =============================================================================
 * MASES Phase 2 UI — SkipToContent — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/SkipToContent/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the SkipToContent SFC. SkipToContent has no supporting
 * types — its public API is two string props (targetId, label) and no
 * emits, slots, or constants. This barrel exists for API consistency
 * with every other Stage 10/11 unit so consumers can uniformly import
 * from '@/layouts/AppShell/SkipToContent'.
 *
 *     import SkipToContent from '@/layouts/AppShell/SkipToContent';
 * =============================================================================
 */

import SkipToContent from './SkipToContent.vue';

export default SkipToContent;