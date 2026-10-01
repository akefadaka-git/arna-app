/*
 * =============================================================================
 * MASES Phase 2 UI — ConfirmDialog — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/ConfirmDialog/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the ConfirmDialog SFC and the ConfirmDialogVariant type so
 * consumers can import both from a stable path:
 *
 *     import ConfirmDialog from '@/components/composites/ConfirmDialog';
 *     import type { ConfirmDialogVariant } from '@/components/composites/ConfirmDialog';
 *
 * The ConfirmDialogVariant type is re-exported for consumers that type
 * a variable against the accepted values (e.g., a delete-action flow
 * that picks variant='danger' based on the resource's criticality).
 * =============================================================================
 */

import ConfirmDialog from './ConfirmDialog.vue';

export default ConfirmDialog;

export type ConfirmDialogVariant = 'primary' | 'danger';