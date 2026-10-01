/*
 * =============================================================================
 * MASES Phase 2 UI — FileDetailView — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/files/FileDetailView/index.ts
 * Layer:     Features (Stage 14 — File Management vertical)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the FileDetailView SFC and its labels type so consumers
 * can import everything from a stable path:
 *
 *     import FileDetailView from '@/features/files/FileDetailView';
 *     import type {
 *       FileDetailViewLabels,
 *     } from '@/features/files/FileDetailView';
 * =============================================================================
 */

import FileDetailView from './FileDetailView.vue';

export default FileDetailView;

export type { FileDetailViewLabels } from './FileDetailView.vue';