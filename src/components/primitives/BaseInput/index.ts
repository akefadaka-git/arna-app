/*
 * =============================================================================
 * MASES Phase 2 UI — BaseInput — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseInput/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseInput SFC so consumers can import it via a stable
 * layer-appropriate path:
 *
 *     import BaseInput from '@/components/primitives/BaseInput';
 *
 * The InputType type mirrors the prop's string union. It is exported so
 * TypeScript consumers can type a variable against the accepted values
 * without duplicating the union.
 * =============================================================================
 */

import BaseInput from './BaseInput.vue';

export default BaseInput;

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'search'
  | 'number';