/*
 * =============================================================================
 * MASES Phase 2 UI — Combobox — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/Combobox/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the Combobox SFC and its two supporting types:
 *
 *     import Combobox from '@/components/composites/Combobox';
 *     import type { ComboboxOption, ComboboxValue } from '@/components/composites/Combobox';
 *
 * The two types are declared in a separate <script> block inside
 * Combobox.vue (see that file's header comment) and are re-exported
 * here so consumers can import them from the barrel without reaching
 * into the SFC directly.
 * =============================================================================
 */

import Combobox from './Combobox.vue';

export default Combobox;

export type { ComboboxOption, ComboboxValue } from './Combobox.vue';