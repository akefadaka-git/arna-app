/*
 * =============================================================================
 * MASES Phase 2 UI — DatePicker — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/DatePicker/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the DatePicker SFC and the DatePickerLabels type so
 * consumers can import both from a stable path:
 *
 *     import DatePicker from '@/components/composites/DatePicker';
 *     import type { DatePickerLabels } from '@/components/composites/DatePicker';
 *
 * The DatePickerLabels type is required by the component and must be
 * populated from the consumer's translation layer. See DatePicker.vue's
 * header comment for the exact fields.
 * =============================================================================
 */

import DatePicker from './DatePicker.vue';

export default DatePicker;

export type { DatePickerLabels } from './DatePicker.vue';