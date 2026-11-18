/*
 * =============================================================================
 * MASES Phase 2 UI — BaseProgressBar — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseProgressBar/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseProgressBar SFC and the two supporting types so
 * consumers can import all three from a stable path:
 *
 *     import BaseProgressBar from '@/components/primitives/BaseProgressBar';
 *     import type {
 *       ProgressBarVariant,
 *       ProgressBarSize,
 *     } from '@/components/primitives/BaseProgressBar';
 *
 * Both types are re-exported for consumers that type a variable against
 * the accepted values (e.g., a feature that selects a variant based on
 * a domain state).
 * =============================================================================
 */

import BaseProgressBar from './BaseProgressBar.vue';

export default BaseProgressBar;

export type ProgressBarVariant = 'default' | 'success' | 'warning' | 'danger';

export type ProgressBarSize = 'sm' | 'md';