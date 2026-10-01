/*
 * =============================================================================
 * MASES Phase 2 UI — FormSection — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/FormSection/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the FormSection SFC and the FormSectionSpacing type so
 * consumers can import both from a stable path:
 *
 *     import FormSection from '@/components/composites/FormSection';
 *     import type { FormSectionSpacing } from '@/components/composites/FormSection';
 *
 * The FormSectionSpacing type is re-exported for consumers that type a
 * variable against the accepted values (e.g., a form renderer that
 * selects 'compact' for dense layouts).
 * =============================================================================
 */

import FormSection from './FormSection.vue';

export default FormSection;

export type FormSectionSpacing = 'compact' | 'default';