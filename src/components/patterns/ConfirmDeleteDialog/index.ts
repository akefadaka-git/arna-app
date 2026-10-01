/*
 * =============================================================================
 * MASES Phase 2 UI — ConfirmDeleteDialog — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/ConfirmDeleteDialog/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the ConfirmDeleteDialog SFC and the
 * ConfirmDeleteDialogLabels type so consumers can import both from a
 * stable path:
 *
 *     import ConfirmDeleteDialog from '@/components/patterns/ConfirmDeleteDialog';
 *     import type { ConfirmDeleteDialogLabels } from '@/components/patterns/ConfirmDeleteDialog';
 *
 * ConfirmDeleteDialogLabels carries the six translated strings the
 * dialog renders. Three interpolation tokens are recognized:
 * `{entityLabel}`, `{entityName}`, and `{confirmationText}`.
 *
 * The component emits only two events, per the catalog:
 *   - update:open  (fires on every close path)
 *   - confirm      (fires only on confirmation)
 *
 * Consumers that need to distinguish cancel from confirm use
 * ConfirmDialog (Unit 9.7), which has the additional `cancel` emit.
 * =============================================================================
 */

import ConfirmDeleteDialog from './ConfirmDeleteDialog.vue';

export default ConfirmDeleteDialog;

export type { ConfirmDeleteDialogLabels } from './ConfirmDeleteDialog.vue';