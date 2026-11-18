/*
 * =============================================================================
 * MASES Phase 2 UI — AccessDeniedPage — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/AccessDeniedPage/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the AccessDeniedPage SFC, its labels type, and the
 * FILE_ACCESS_DENIED_CODE constant so consumers can import everything
 * from a stable path:
 *
 *     import AccessDeniedPage, {
 *       FILE_ACCESS_DENIED_CODE,
 *     } from '@/components/patterns/AccessDeniedPage';
 *
 *     import type {
 *       AccessDeniedLabels,
 *     } from '@/components/patterns/AccessDeniedPage';
 *
 * The FILE_ACCESS_DENIED_CODE constant is exported so that the router
 * (or an error-normalization layer) can compare against the same string
 * the pattern matches, without duplicating the literal.
 * =============================================================================
 */

import AccessDeniedPage from './AccessDeniedPage.vue';

export default AccessDeniedPage;

export { FILE_ACCESS_DENIED_CODE } from './AccessDeniedPage.vue';

export type { AccessDeniedLabels } from './AccessDeniedPage.vue';