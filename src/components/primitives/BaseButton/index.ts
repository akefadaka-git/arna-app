/*
 * =============================================================================
 * MASES Phase 2 UI — BaseButton — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseButton/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the public surface of the BaseButton primitive so consumers
 * can import it via a stable path:
 *
 *     import BaseButton from '@/components/primitives/BaseButton';
 *
 * The default export is the SFC. The named export of the type is provided
 * for consumers that need to type a variant or size value.
 * =============================================================================
 */

import BaseButton from './BaseButton.vue';

export default BaseButton;

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';