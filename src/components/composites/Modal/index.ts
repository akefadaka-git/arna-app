/*
 * =============================================================================
 * MASES Phase 2 UI — Modal — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/Modal/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the Modal SFC and the ModalSize type so consumers can
 * import both from a stable path:
 *
 *     import Modal from '@/components/composites/Modal';
 *     import type { ModalSize } from '@/components/composites/Modal';
 *
 * The ModalSize type is re-exported for consumers that type a variable
 * against the accepted values (e.g., a confirmation flow that picks
 * size='sm' for simple prompts and 'md' for forms).
 * =============================================================================
 */

import Modal from './Modal.vue';

export default Modal;

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';