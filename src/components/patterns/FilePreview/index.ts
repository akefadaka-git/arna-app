/*
 * =============================================================================
 * MASES Phase 2 UI — FilePreview — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/FilePreview/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the FilePreview SFC and its supporting types so consumers
 * can import everything from a stable path:
 *
 *     import FilePreview from '@/components/patterns/FilePreview';
 *     import type {
 *       FilePreviewLabels,
 *       FilePreviewStatus,
 *       FilePreviewKind,
 *       FilePreviewSize,
 *       LoadTextFn,
 *     } from '@/components/patterns/FilePreview';
 *
 * Also re-exports the pure helpers deriveMimeFromName and kindFromMime
 * so consumers that need to apply the same MIME classification before
 * mounting the component (e.g. to choose between a preview and a
 * download link) do not duplicate the map.
 * =============================================================================
 */

import FilePreview from './FilePreview.vue';

export default FilePreview;

export {
  deriveMimeFromName,
  kindFromMime,
} from './FilePreview.vue';

export type {
  FilePreviewStatus,
  FilePreviewKind,
  FilePreviewSize,
  FilePreviewLabels,
  LoadTextFn,
} from './FilePreview.vue';