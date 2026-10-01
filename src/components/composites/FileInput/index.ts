/*
 * =============================================================================
 * MASES Phase 2 UI — FileInput — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/FileInput/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the FileInput SFC and its two supporting types so
 * consumers can import all three from a stable path:
 *
 *     import FileInput from '@/components/composites/FileInput';
 *     import type {
 *       FileInputLabels,
 *       FileInputRejectReason,
 *     } from '@/components/composites/FileInput';
 *
 * FileInputLabels is the shape of the `labels` prop. It is optional at
 * the type level (see FileInput.vue's header comment) but required in
 * practice when the default presentation renders.
 *
 * FileInputRejectReason is the union of the reasons emitted with the
 * `reject` event.
 * =============================================================================
 */

import FileInput from './FileInput.vue';

export default FileInput;

export type { FileInputLabels, FileInputRejectReason } from './FileInput.vue';