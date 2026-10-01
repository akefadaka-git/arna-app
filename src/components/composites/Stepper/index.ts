/*
 * =============================================================================
 * MASES Phase 2 UI — Stepper — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/Stepper/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the Stepper SFC and its two supporting types so consumers
 * can import all three from a stable path:
 *
 *     import Stepper from '@/components/composites/Stepper';
 *     import type {
 *       StepperStep,
 *       StepperOrientation,
 *     } from '@/components/composites/Stepper';
 *
 * StepperStep is the item shape. StepperOrientation is the union of the
 * accepted orientation values.
 * =============================================================================
 */

import Stepper from './Stepper.vue';

export default Stepper;

export type { StepperStep } from './Stepper.vue';

export type StepperOrientation = 'horizontal' | 'vertical';