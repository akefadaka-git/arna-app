/*
 * =============================================================================
 * MASES Phase 2 UI — FileUploader — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/FileUploader/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the FileUploader SFC and its supporting types so consumers
 * can import everything from a stable path:
 *
 *     import FileUploader from '@/components/patterns/FileUploader';
 *     import type {
 *       UploadFn,
 *       UploadedFile,
 *       UploadContext,
 *       FileUploaderLabels,
 *       FileUploaderQueueItem,
 *       FileUploaderStatus,
 *       FileUploaderRejectReason,
 *     } from '@/components/patterns/FileUploader';
 *
 * All types are declared in a separate <script> block inside
 * FileUploader.vue so that TypeScript can consume them without
 * instantiating the component.
 * =============================================================================
 */

import FileUploader from './FileUploader.vue';

export default FileUploader;

export type {
  UploadedFile,
  UploadContext,
  UploadFn,
  FileUploaderStatus,
  FileUploaderQueueItem,
  FileUploaderLabels,
  FileUploaderRejectReason,
} from './FileUploader.vue';