/*
 * =============================================================================
 * MASES Phase 2 UI — BaseTextarea — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseTextarea/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseTextarea SFC so consumers can import it via a
 * stable layer-appropriate path:
 *
 *     import BaseTextarea from '@/components/primitives/BaseTextarea';
 *
 * The TextareaResize type mirrors the `resize` prop's string union. It
 * is exported so TypeScript consumers can type a variable against the
 * accepted values without duplicating the union.
 * =============================================================================
 */

import BaseTextarea from './BaseTextarea.vue';

export default BaseTextarea;

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';