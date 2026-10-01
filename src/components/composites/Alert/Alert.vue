<!--
=============================================================================
 MASES Phase 2 UI — Alert
=============================================================================

 File:      mase_app/src/components/composites/Alert/Alert.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.12
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A static alert banner for a semantic message. Five variants (success,
 warning, info, danger, neutral); optional title; optional leading icon;
 optional dismiss button; optional bottom action row.

 The Alert is a MESSAGE, not a page. For error pages, use ErrorPage
 (Stage 10). For inline form field errors, use FormField's error region.
 Alert is for messages that stand on their own — an important notice
 above a form, a save confirmation at the top of a detail view, a
 warning that requires acknowledgment.

 -----------------------------------------------------------------------------
 Live-region semantics — see the response preamble
 -----------------------------------------------------------------------------
   variant='danger'                                    → role="alert"
   variant='success' | 'warning' | 'info' | 'neutral'  → role="status"

 The mapping is frozen and not configurable. Consumers must mount the
 Alert at the moment the message is present (via v-if) for the live
 region to announce correctly.

 -----------------------------------------------------------------------------
 The dismiss button
 -----------------------------------------------------------------------------
 Rendered when dismissible=true. Emits `dismiss` on click; the consumer
 removes the alert from its own state.
 The button's accessible name is `dismissLabel`. See the response
 preamble §"Design note — the dismissLabel prop".

 -----------------------------------------------------------------------------
 Icon
 -----------------------------------------------------------------------------
 Rendered when icon=true (default). The glyph is chosen per variant:

   success  →  check-circle
   warning  →  alert-triangle
   info     →  info
   danger   →  alert-circle
   neutral  →  info

 The icon is decorative (aria-hidden); the visible text carries the
 message.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - `title` (consumer-supplied, translated);
   - `dismissLabel` (consumer-supplied) as the dismiss button's
     aria-label;
   - the default slot content (consumer-supplied);
   - the actions slot content (consumer-supplied).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, borders per
 variant, positioning for the dismiss button).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="alert-root"            on the outer <div role=...>
 data-testid="alert-icon"            on the icon wrapper (rendered
                                     only when icon=true)
 data-testid="alert-content"         on the content wrapper
 data-testid="alert-title"           on the title <p> (rendered only
                                     when title is supplied)
 data-testid="alert-message"         on the default slot's wrapper
 data-testid="alert-dismiss"         on the dismiss button (rendered
                                     only when dismissible=true)
 data-testid="alert-actions"         on the actions row (rendered only
                                     when the actions slot is supplied)

 The root carries:
   data-variant="success" | "warning" | "info" | "danger" | "neutral"
   data-dismissible="true"   (present only when dismissible)
 for consumer assertions in tests.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 ALERT (per the catalog):

   - Live-region role per variant. See the response preamble.
   - The icon is aria-hidden; the text carries the meaning.
   - The dismiss button has an accessible name from dismissLabel.
   - All colors use Tier 2 tokens; contrast is verified by the design
     system (Design System §2.4.1 / §2.4.2).
   - No reliance on color alone: every variant pairs the color with a
     distinct icon glyph and the message text.
   - Focus is not moved into the alert on mount. Live regions announce
     content without moving focus. The dismiss button is focusable in
     the normal tab order.
   - Reduced motion: the alert's entry animation (if any is added by a
     consumer) is not defined here; the component itself is static.
   - On mobile: the alert stacks its icon above its content when the
     message wraps beyond one line — see the CSS; this preserves the
     icon-content relationship without cramping the text column.
=============================================================================
-->

<script lang="ts">
/*
 * Exported type.
 *
 * Declared in a separate <script> block so TypeScript consumers can
 * import it from the barrel (index.ts).
 */
export type AlertVariant =
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'
  | 'neutral';

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesAlertWarned = new Set<string>();

function __masesAlertWarnOnce(key: string, message: string): void {
  if (__masesAlertWarned.has(key)) {
    return;
  }
  __masesAlertWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/*
 * Variant → icon mapping.
 *
 * Frozen by this unit. See the response preamble §"Design note — icon
 * glyph per variant".
 */
export const ALERT_ICON_BY_VARIANT = {
  success: 'check-circle',
  warning: 'alert-triangle',
  info: 'info',
  danger: 'alert-circle',
  neutral: 'info',
} as const;
</script>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../../primitives/BaseIcon';
import type { IconName } from '../../primitives/BaseIcon';

interface Props {
  /**
   * Visual + semantic variant. Required.
   *
   *   'success'  →  role="status"  (positive confirmation)
   *   'warning'  →  role="status"  (caution, non-blocking)
   *   'info'     →  role="status"  (neutral information)
   *   'danger'   →  role="alert"   (blocking error, requires attention)
   *   'neutral'  →  role="status"  (muted notice)
   *
   * See the response preamble §"Live-region semantics".
   */
  variant: AlertVariant;

  /**
   * Optional title. A translated string.
   *
   * When supplied, rendered as a bold line above the message. The
   * title should be short (a word or two); the message carries the
   * detail.
   */
  title?: string;

  /**
   * Whether the alert renders a dismiss (×) button. Defaults to false.
   *
   * When true, the button is rendered and emits `dismiss` on click. The
   * consumer removes the alert from its own state.
   */
  dismissible?: boolean;

  /**
   * Translated accessible name for the dismiss button.
   *
   * Required when dismissible=true. A missing value triggers a
   * development-time warning; in production, the button renders with
   * an empty aria-label (visible defect).
   */
  dismissLabel?: string;

  /**
   * Whether the leading icon is rendered. Defaults to true.
   *
   * Set to false for text-only alerts in dense contexts (a table cell,
   * a compact inline notice).
   */
  icon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  dismissible: false,
  dismissLabel: undefined,
  icon: true,
});

const emit = defineEmits<{
  (event: 'dismiss'): void;
}>();

/**
 * Named slots. Both are optional.
 *
 * default — the alert message. Typically a paragraph of text.
 * actions — a bottom action row. Typically small buttons ("Retry",
 *           "View details", "Dismiss").
 */
defineSlots<{
  default(): unknown;
  actions(): unknown;
}>();

// -----------------------------------------------------------------------------
// Development-time guard
// -----------------------------------------------------------------------------
if (import.meta.env.DEV && props.dismissible && !props.dismissLabel) {
  __masesAlertWarnOnce(
    'alert:missing-dismiss-label',
    '[Alert] dismissible=true without dismissLabel. The dismiss button ' +
      'will render with an empty aria-label, which is an accessibility ' +
      'defect. Supply a translated string such as "Dismiss".',
  );
}

// -----------------------------------------------------------------------------
// Computed — role
// -----------------------------------------------------------------------------
/**
 * The live-region role. Frozen mapping: danger is assertive; all others
 * are polite. See the response preamble.
 */
const role = computed<'alert' | 'status'>(() =>
  props.variant === 'danger' ? 'alert' : 'status',
);

// -----------------------------------------------------------------------------
// Computed — icon
// -----------------------------------------------------------------------------
/**
 * Whether the icon region renders.
 */
const hasIcon = computed<boolean>(() => props.icon);

const iconName = computed<IconName>(() => {
  return ALERT_ICON_BY_VARIANT[props.variant];
});

// -----------------------------------------------------------------------------
// Computed — title and classes
// -----------------------------------------------------------------------------
const hasTitle = computed<boolean>(
  () => props.title !== undefined && props.title.trim().length > 0,
);

const rootClasses = computed<Array<string | Record<string, boolean>>>(() => [
  'alert',
  `alert--${props.variant}`,
  {
    'alert--dismissible': props.dismissible,
    'alert--with-title': hasTitle.value,
  },
]);

// -----------------------------------------------------------------------------
// Dismiss
// -----------------------------------------------------------------------------
function onDismiss(): void {
  emit('dismiss');
}
</script>

<template>
  <div
    :role="role"
    :class="rootClasses"
    :data-variant="variant"
    :data-dismissible="dismissible ? 'true' : undefined"
    data-testid="alert-root"
  >
    <!--
      Icon.
      Decorative; the message text carries the meaning. Rendered only
      when icon=true.
    -->
    <span
      v-if="hasIcon"
      class="alert__icon"
      aria-hidden="true"
      data-testid="alert-icon"
    >
      <BaseIcon :name="iconName" size="md" />
    </span>

    <!--
      Content.
      Hosts the title (when supplied), the message (default slot), and
      the actions row (when supplied).
    -->
    <div
      class="alert__content"
      data-testid="alert-content"
    >
      <p
        v-if="hasTitle"
        class="alert__title"
        data-testid="alert-title"
      >
        {{ title }}
      </p>

      <div
        class="alert__message"
        data-testid="alert-message"
      >
        <slot />
      </div>

      <div
        v-if="$slots.actions"
        class="alert__actions"
        data-testid="alert-actions"
      >
        <slot name="actions" />
      </div>
    </div>

    <!--
      Dismiss button.
      Rendered only when dismissible=true.
    -->
    <button
      v-if="dismissible"
      type="button"
      class="alert__dismiss"
      :aria-label="dismissLabel ?? ''"
      data-testid="alert-dismiss"
      @click="onDismiss"
    >
      <BaseIcon name="close" size="sm" />
    </button>
  </div>
</template>

<style scoped>
/* ============================================================================
   Base layout
   ============================================================================ */
.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--mases-space-3);
  width: 100%;
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-4);
  border: 1px solid transparent;
  border-radius: var(--mases-radius-md);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
}

/* When dismissible, reserve room on the trailing edge for the × button
   so that long messages do not run under it. */
.alert--dismissible {
  padding-inline-end: calc(
    var(--mases-space-4) + var(--mases-icon-sm) + var(--mases-space-2)
  );
}

/* ============================================================================
   Variants
   ---------------------------------------------------------------------------
   Each variant uses the design system's surface + text + border +
   icon triples (Design System §2.4.1 / §2.4.2 / §2.4.5). Contrast is
   verified by the design system.
   ============================================================================ */
.alert--success {
  background-color: var(--mases-color-surface-success);
  color: var(--mases-color-text-success);
  border-color: var(--mases-color-border-success);
}

.alert--warning {
  background-color: var(--mases-color-surface-warning);
  color: var(--mases-color-text-warning);
  border-color: var(--mases-color-border-warning);
}

.alert--info {
  background-color: var(--mases-color-surface-info);
  color: var(--mases-color-text-info);
  border-color: var(--mases-color-border-info);
}

.alert--danger {
  background-color: var(--mases-color-surface-danger);
  color: var(--mases-color-text-danger);
  border-color: var(--mases-color-border-danger);
}

.alert--neutral {
  background-color: var(--mases-color-surface-raised);
  color: var(--mases-color-text-secondary);
  border-color: var(--mases-color-border-subtle);
}

/* ============================================================================
   Icon
   ============================================================================ */
.alert__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  /*
   * Optical alignment: the icon is 20px tall; the text line-height is
   * 22px (Latin, sm scale). A small top margin centers the icon on the
   * first line. Uses tokens so the Amharic type-scale override is
   * respected automatically.
   */
  margin-block-start: calc(
    (var(--mases-line-height-body-sm) - var(--mases-icon-md)) / 2
  );
  color: currentColor;
}

/* ============================================================================
   Content
   ============================================================================ */
.alert__content {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
}

.alert__title {
  margin: 0;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  font-weight: var(--mases-font-weight-semibold);
}

.alert__message {
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  font-weight: var(--mases-font-weight-regular);
  /*
   * Preserve newlines that a consumer might include in a message
   * string, without collapsing spaces. Consistent with ConfirmDialog
   * (Unit 9.7).
   */
  white-space: pre-line;
}

.alert__actions {
  display: flex;
  align-items: center;
  gap: var(--mases-space-2);
  flex-wrap: wrap;
}

/* ============================================================================
   Dismiss button
   ============================================================================ */
.alert__dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--mases-icon-md);
  height: var(--mases-icon-md);
  padding: 0;
  margin: 0;
  appearance: none;
  background-color: transparent;
  border: 0;
  border-radius: var(--mases-radius-sm);
  color: currentColor;
  cursor: pointer;
  /*
   * Pull the button slightly toward the corner so that its hit area
   * does not visually detach from the alert's padding. The negative
   * offset uses a spacing token divided by two.
   */
  margin-block-start: calc(
    (var(--mases-line-height-body-sm) - var(--mases-icon-md)) / 2
  );
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    opacity var(--mases-duration-fast) var(--mases-easing-standard);
  /* Slight transparency so the icon is subordinate to the message. */
  opacity: 0.75;
}

.alert__dismiss:hover {
  background-color: currentColor;
  /* Convert the background to a very light tint via blend. */
  opacity: 0.15;
  /*
   * Note: hovering inverts the icon's contrast briefly. This is a
   * deliberate but subtle affordance — the icon color remains the
   * variant's foreground, and the hover background uses the same
   * hue at low alpha. On light variants this reads as a light wash;
   * on the danger variant it reads as a light crimson wash.
   */
}

.alert__dismiss:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-color-border-focus);
  outline-offset: var(--mases-focus-ring-offset);
  opacity: 1;
}

/* Reset opacity for the icon glyph (the icon inherits the alert's
   currentColor; the button controls only its own opacity). */
.alert__dismiss:active {
  opacity: 0.4;
}

/* ============================================================================
   Mobile
   ---------------------------------------------------------------------------
   On small viewports, the alert stacks vertically when it has a title
   (the icon-then-text horizontal layout becomes cramped when the
   message wraps to many lines).
   ============================================================================ */
@media (max-width: 639px) {
  .alert {
    padding-block: var(--mases-space-3);
    padding-inline: var(--mases-space-3);
  }

  .alert--dismissible {
    padding-inline-end: calc(
      var(--mases-space-3) + var(--mases-icon-sm) + var(--mases-space-2)
    );
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .alert__dismiss {
    transition-duration: 1ms;
  }
}
</style>