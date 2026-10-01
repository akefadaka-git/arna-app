/*
 * =============================================================================
 * MASES Phase 2 UI — FormActions — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/FormActions/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the FormActions SFC and the FormActionsLayout type so
 * consumers can import both from a stable path:
 *
 *     import FormActions from '@/components/composites/FormActions';
 *     import type { FormActionsLayout } from '@/components/composites/FormActions';
 *
 * The FormActionsLayout type is re-exported for consumers that type a
 * variable against the accepted values (e.g., a form-builder that
 * selects the layout per domain convention).
 * =============================================================================
 */

import FormActions from './FormActions.vue';

export default FormActions;

export type FormActionsLayout = 'start' | 'end';