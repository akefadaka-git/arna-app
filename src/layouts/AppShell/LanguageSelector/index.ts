/*
 * =============================================================================
 * MASES Phase 2 UI — LanguageSelector — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/LanguageSelector/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the LanguageSelector SFC and its labels type so consumers
 * can import everything from a stable path:
 *
 *     import LanguageSelector from '@/layouts/AppShell/LanguageSelector';
 *     import type {
 *       LanguageSelectorLabels,
 *     } from '@/layouts/AppShell/LanguageSelector';
 *
 * Note: the component must NOT be rendered by the shell until
 * POST /api/locale exists — see the SFC's file header comment and the
 * response preamble §"Notice 2".
 * =============================================================================
 */

import LanguageSelector from './LanguageSelector.vue';

export default LanguageSelector;

export type { LanguageSelectorLabels } from './LanguageSelector.vue';