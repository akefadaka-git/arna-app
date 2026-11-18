/*
 * =============================================================================
 * MASES Phase 2 UI — ErrorSupportPanel — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/ErrorSupportPanel/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the ErrorSupportPanel SFC and the ErrorSupportPanelLabels
 * type so consumers can import both from a stable path:
 *
 *     import ErrorSupportPanel from '@/components/composites/ErrorSupportPanel';
 *     import type { ErrorSupportPanelLabels } from '@/components/composites/ErrorSupportPanel';
 *
 * The ErrorSupportPanelLabels type carries the eight translated strings
 * the panel renders. Consumers build this object from their translation
 * layer; the component does not fabricate any string.
 * =============================================================================
 */

import ErrorSupportPanel from './ErrorSupportPanel.vue';

export default ErrorSupportPanel;

export type { ErrorSupportPanelLabels } from './ErrorSupportPanel.vue';