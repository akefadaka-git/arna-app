/*
 * =============================================================================
 * MASES Phase 2 UI — FormField — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/FormField/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the FormField SFC so consumers can import it via a stable
 * layer-appropriate path:
 *
 *     import FormField from '@/components/composites/FormField';
 *
 * The component's public API is documented in FormField.vue's header
 * comment. The scoped default slot exposes:
 *
 *     { id, aria-describedby, invalid, required, disabled }
 *
 * Consumers bind these onto their control inside the slot.
 * =============================================================================
 */

import FormField from './FormField.vue';

export default FormField;