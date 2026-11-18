/*
 * =============================================================================
 * MASES Phase 2 UI — DownloadButton — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/DownloadButton/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the DownloadButton SFC and its supporting types so
 * consumers can import everything from a stable path:
 *
 *     import DownloadButton from '@/components/patterns/DownloadButton';
 *     import type {
 *       DownloadFn,
 *       DownloadButtonLabels,
 *       DownloadButtonStatus,
 *       DownloadButtonVariant,
 *       DownloadButtonSize,
 *     } from '@/components/patterns/DownloadButton';
 *
 * All types are declared in a separate <script lang="ts"> block inside
 * DownloadButton.vue so that TypeScript can consume them without
 * instantiating the component.
 * =============================================================================
 */

import DownloadButton from './DownloadButton.vue';

export default DownloadButton;

export type {
  DownloadButtonStatus,
  DownloadButtonVariant,
  DownloadButtonSize,
  DownloadFn,
  DownloadButtonLabels,
} from './DownloadButton.vue';