/*
 * =============================================================================
 * MASES Phase 2 UI — BaseIcon — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseIcon/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseIcon SFC and the two supporting types:
 *
 *     import BaseIcon from '@/components/primitives/BaseIcon';
 *     import type { IconName, IconSize } from '@/components/primitives/BaseIcon';
 *
 * IconName is the frozen union of the 56 registered icon names. Any
 * consumer that needs to type a variable against the accepted values
 * uses this type. Passing an unregistered name to BaseIcon's `name`
 * prop produces a compile-time error.
 *
 * IconSize is the size union. It is re-exported for consistency with
 * the other primitives' size exports.
 *
 * Note: the ICONS object itself is NOT re-exported. It is an internal
 * implementation detail of BaseIcon.vue. A consumer that needs to
 * enumerate icons (e.g., an administrative icon-picker UI, which is
 * not in Phase 2) reads the design system's icon inventory, not this
 * module's runtime object.
 * =============================================================================
 */

import BaseIcon from './BaseIcon.vue';

export default BaseIcon;

export type { IconName } from './BaseIcon.vue';

/**
 * The size union for BaseIcon.
 *
 * Mirrors the size prop's type. It is not declared in BaseIcon.vue's
 * public surface because the SFC's <script setup> scopes the type
 * locally; a future refactor that moves it into the shared <script>
 * block would let this line import it directly.
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';