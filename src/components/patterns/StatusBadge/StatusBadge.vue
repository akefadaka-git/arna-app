<!--
=============================================================================
 MASES Phase 2 UI — StatusBadge
=============================================================================

 File:      mase_app/src/components/patterns/StatusBadge/StatusBadge.vue
 Layer:     3 (Patterns)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.6
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The MASES-wide convention for rendering a status value. Composes
 BaseBadge (Unit 8.15) and BaseIcon (Unit 8.19) with a small enforcement
 layer that guarantees:

   - the raw status value is present as a data attribute;
   - the localized label is non-empty (dev warning);
   - the chosen variant is used verbatim (no automatic mapping);
   - the icon size is proportional to the badge size.

 -----------------------------------------------------------------------------
 Why a separate component from BaseBadge — see the response preamble
 -----------------------------------------------------------------------------
 BaseBadge is a generic pill; StatusBadge is the domain-wide
 convention for status rendering.

 -----------------------------------------------------------------------------
 No automatic status → variant mapping — see the response preamble
 -----------------------------------------------------------------------------
 The `variant` prop is the consumer's decision, made at the call site.
 The component does not fabricate a mapping; the status vocabulary is
 domain-specific and not frozen by the design system.

 -----------------------------------------------------------------------------
 The icon prop — see the response preamble
 -----------------------------------------------------------------------------
 When `icon` is supplied, it renders as a leading Lucide glyph before
 the label. Size derives from the badge size:
   'sm'  →  icon 'xs' (12px)
   'md'  →  icon 'sm' (16px)
 The icon is decorative; the label carries the accessible name.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - `label` (consumer-supplied, translated).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 The component declares no design tokens directly. All visual values
 are inherited from BaseBadge (background, text, radius, padding,
 typography). The only CSS this file declares styles the inline icon's
 alignment inside the badge label wrapper.

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="status-badge-root"   on the composed BaseBadge
 data-testid="status-badge-icon"   on the icon wrapper (rendered only
                                   when icon is supplied)
 data-testid="status-badge-label"  on the label wrapper

 The composed badge carries:
   data-status="<status>"                 (always)
   data-variant="<variant>"               (inherited from BaseBadge)
   data-size="sm" | "md"                  (inherited from BaseBadge)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - Renders a BaseBadge — a passive <span>, no role, no focus.
   - The label carries the status's accessible name.
   - The icon is decorative (aria-hidden via BaseIcon default).
   - The `variant` is not the sole carrier of meaning: the label text
     is the primary signal; the color reinforces it.
   - The `status` data attribute is not announced by screen readers;
     it exists for testing and consumer-side logic.
   - A dev warning fires when `label` is empty, because a color-only
     status violates the design system's no-color-only rule
     (Design System §11.7).
   - Reduced motion: no animation in this component.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 *
 * BadgeVariant and BadgeSize are re-exported from BaseBadge (Unit 8.15).
 * They are the same unions; the pattern narrows or extends nothing.
 */

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesStatusBadgeWarned = new Set<string>();

function __masesStatusBadgeWarnOnce(key: string, message: string): void {
  if (__masesStatusBadgeWarned.has(key)) {
    return;
  }
  __masesStatusBadgeWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import BaseBadge from '../../primitives/BaseBadge';
import type { BadgeVariant, BadgeSize } from '../../primitives/BaseBadge';
import BaseIcon from '../../primitives/BaseIcon';
import type { IconName } from '../../primitives/BaseIcon';

interface Props {
  /**
   * The raw machine-readable status value. Required.
   *
   * Rendered as a `data-status` attribute on the composed badge for
   * testing and consumer-side logic. NOT rendered visually and NOT
   * announced by screen readers.
   */
  status: string;

  /**
   * The localized human-readable label. Required.
   *
   * A translated string. Rendered as the badge's visible text and is
   * the badge's accessible name. An empty or whitespace-only label
   * triggers a deduplicated dev warning — a status must never be
   * communicated by color alone.
   */
  label: string;

  /**
   * The visual variant. Required.
   *
   * The consumer chooses the variant; the component does not map
   * `status` to a variant. See the response preamble §"Design note —
   * no automatic status → variant mapping".
   *
   *   'neutral'  →  surface-raised  + text-secondary
   *   'success'  →  surface-success + text-success
   *   'warning'  →  surface-warning + text-warning
   *   'info'     →  surface-info    + text-info
   *   'danger'   →  surface-danger  + text-danger
   *   'accent'   →  surface-accent  + text-accent
   */
  variant: BadgeVariant;

  /**
   * Optional leading Lucide icon. When supplied, rendered before the
   * label at a size proportional to the badge.
   *
   * See the response preamble §"Design note — the icon prop and its
   * size".
   */
  icon?: string;

  /**
   * Whether BaseBadge renders its leading dot. Defaults to false.
   *
   * The dot and the icon compete for the same leading slot; supplying
   * both triggers a deduplicated dev warning.
   */
  dot?: boolean;

  /**
   * Badge size. Defaults to 'sm'.
   *
   * Forwarded to BaseBadge and used to derive the icon size.
   */
  size?: BadgeSize;
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  dot: false,
  size: 'sm',
});

// -----------------------------------------------------------------------------
// Development-time guards
// -----------------------------------------------------------------------------

if (import.meta.env.DEV && props.label.trim() === '') {
  __masesStatusBadgeWarnOnce(
    'status-badge:empty-label',
    `[StatusBadge] the label for status "${props.status}" is empty. ` +
      `A status must never be communicated by color alone (Design ` +
      `System §11.7). Supply a translated label.`,
  );
}

if (import.meta.env.DEV && props.icon !== undefined && props.dot === true) {
  __masesStatusBadgeWarnOnce(
    'status-badge:icon-and-dot',
    '[StatusBadge] both `icon` and `dot=true` are supplied. The two ' +
      'leading visuals compete for the same slot and produce a busy ' +
      'badge. Supply only one.',
  );
}

// -----------------------------------------------------------------------------
// Computed — icon size mapping
// -----------------------------------------------------------------------------
/**
 * Icon size derived from the badge size.
 * See the response preamble §"Design note — the icon prop and its size".
 */
const iconSize = computed<'xs' | 'sm'>(() =>
  props.size === 'md' ? 'sm' : 'xs',
);

/**
 * Icon name passed to BaseIcon.
 *
 * The prop is typed `string | undefined` so consumers can supply it
 * from arbitrary data. BaseIcon performs the runtime check and emits
 * its own dev warning for unregistered names.
 */
const iconName = computed<IconName | undefined>(() => {
  return props.icon !== undefined ? (props.icon as IconName) : undefined;
});

const hasIcon = computed<boolean>(() => props.icon !== undefined);
</script>

<template>
  <BaseBadge
    :variant="variant"
    :size="size"
    :dot="dot"
    :data-status="status"
    data-testid="status-badge-root"
  >
    <!--
      Leading icon.
      Rendered inside BaseBadge's default slot, before the label text,
      so it flows inline with the label. Decorative (aria-hidden via
      BaseIcon default); the label carries the accessible name.
    -->
    <span
      v-if="hasIcon && iconName !== undefined"
      class="status-badge__icon"
      data-testid="status-badge-icon"
    >
      <BaseIcon :name="iconName" :size="iconSize" />
    </span>

    <!--
      Label.
      The badge's accessible name and primary semantic signal.
    -->
    <span
      class="status-badge__label"
      data-testid="status-badge-label"
    >{{ label }}</span>
  </BaseBadge>
</template>

<style scoped>
/* ============================================================================
   Icon wrapper
   ---------------------------------------------------------------------------
   The icon sits inside BaseBadge's label wrapper (which has
   display: inline-block). To keep the icon and text on a shared
   baseline, the wrapper is inline-flex with a small end margin and
   center alignment.
   ============================================================================ */
.status-badge__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  /*
   * A small end-margin between the icon and the label text. Space-1
   * (4px) matches the leading-dot-to-label spacing that BaseBadge
   * itself uses for its own dot affordance.
   */
  margin-inline-end: var(--mases-space-1);
  /*
   * Inherit the current color so the icon matches the variant's text
   * color.
   */
  color: currentColor;
}

/* ============================================================================
   Label
   ============================================================================ */
.status-badge__label {
  display: inline-block;
  vertical-align: middle;
}

/* ============================================================================
   Reduced motion
   ============================================================================
   No transitions or animations in this component. The composed
   BaseBadge has none either.
   ============================================================================ */
</style>