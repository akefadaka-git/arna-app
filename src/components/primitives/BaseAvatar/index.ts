/*
 * =============================================================================
 * MASES Phase 2 UI — BaseAvatar — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseAvatar/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseAvatar SFC and its two supporting types:
 *
 *     import BaseAvatar from '@/components/primitives/BaseAvatar';
 *     import type { AvatarSize, AvatarShape } from '@/components/primitives/BaseAvatar';
 *
 * The two types are re-exported for consumers that type a variable
 * against the accepted values (e.g., a settings page that lets the
 * user choose the avatar shape).
 * =============================================================================
 */

import BaseAvatar from './BaseAvatar.vue';

export default BaseAvatar;

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

export type AvatarShape = 'circle' | 'rounded';