/*
 * =============================================================================
 * MASES Phase 2 UI — ErrorPage — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/ErrorPage/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the ErrorPage SFC and its supporting types so consumers
 * can import everything from a stable path:
 *
 *     import ErrorPage from '@/components/patterns/ErrorPage';
 *     import type {
 *       ErrorPageAction,
 *       ErrorPageActionVariant,
 *       ErrorPageLabels,
 *       ErrorPageSupportLabels,
 *     } from '@/components/patterns/ErrorPage';
 *
 * All types are declared in a separate <script lang="ts"> block inside
 * ErrorPage.vue so that TypeScript can consume them without
 * instantiating the component.
 * =============================================================================
 */

import ErrorPage from './ErrorPage.vue';

export default ErrorPage;

export type {
  ErrorPageAction,
  ErrorPageActionVariant,
  ErrorPageLabels,
  ErrorPageSupportLabels,
} from './ErrorPage.vue';