/*
 * =============================================================================
 * MASES Phase 2 UI — BaseSelect — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseSelect/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseSelect SFC and its SelectOption interface so
 * consumers can import both from a stable path:
 *
 *     import BaseSelect from '@/components/primitives/BaseSelect';
 *     import type { SelectOption } from '@/components/primitives/BaseSelect';
 *
 * The SelectOption interface is defined in the SFC's <script setup>
 * block with an `export` keyword; the type is therefore available from
 * the compiled SFC module. The re-export here makes it addressable
 * from the barrel without requiring consumers to import the .vue file
 * directly.
 * =============================================================================
 */

import BaseSelect from './BaseSelect.vue';

export default BaseSelect;

export type { SelectOption } from './BaseSelect.vue';