/*
 * =============================================================================
 * MASES Phase 2 UI — FilesListView — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/files/FilesListView/index.ts
 * Layer:     Features (Stage 14 — File Management vertical)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the FilesListView SFC and its labels type so consumers
 * can import everything from a stable path:
 *
 *     import FilesListView from '@/features/files/FilesListView';
 *     import type {
 *       FilesListViewLabels,
 *     } from '@/features/files/FilesListView';
 * =============================================================================
 */

import FilesListView from './FilesListView.vue';

export default FilesListView;

export type { FilesListViewLabels } from './FilesListView.vue';