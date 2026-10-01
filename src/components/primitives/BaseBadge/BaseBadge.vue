<!--
=============================================================================
 MASES Phase 2 UI — BaseBadge
=============================================================================

 File:      mase_app/src/components/primitives/BaseBadge/BaseBadge.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.14
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A small pill-shaped indicator used to communicate a status, category, or
 tag. Renders consumer-supplied text inside a colored surface, with an
 optional leading dot for visual reinforcement.

 The six variants (neutral, success, warning, info, danger, accent)
 correspond to the Design System's semantic color roles (§2.4.1 surface
 tokens and §2.4.2 text tokens).

 -----------------------------------------------------------------------------
 Text carries meaning; color reinforces it
 -----------------------------------------------------------------------------
 Per Design System §11.7 and the component catalog's accessibility note
 for this primitive, the badge's meaning is carried by its TEXT. The
 variant's color reinforces the meaning but is never its sole carrier.

 Consumers must therefore supply meaningful text via the default slot.
 A badge that renders only a colored dot without text would violate the
 no-color-only-state rule and is not supported by this component. See
 the response preamble §"Design note — the dot indicator".

 -----------------------------------------------------------------------------
 The leading dot
 -----------------------------------------------------------------------------
 When the `dot` prop is true, a small circular indicator is rendered
 before the label. It is decorative (aria-hidden) and does not
 contribute to the badge's accessible name. Its size is derived from
 Tier 2 spacing tokens; see the response preamble for the derivation.

 The dot's color matches the badge's text color, so the badge reads as
 a single visual unit.

 -----------------------------------------------------------------------------
 Amharic-first typography
 -----------------------------------------------------------------------------
 The badge inherits the font-family stack from the surrounding document,
 which is Amharic-first (Design System §3.5 B2). The `text-transform`
 property is explicitly set to `none` so that a surrounding uppercase
 transform (from a parent element or a consumer's style) cannot convert
 Ethiopic syllables — Design System §3.5 B6 forbids uppercase
 transforms on any element that may contain Amharic.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css, except the dot diameter which is derived (see the response
 preamble). No hex value appears in this file. All six variant
 background and text colors trace to Design System §2.4.1 and §2.4.2.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="base-badge-root"  on the <span> wrapper
 data-testid="base-badge-dot"   on the leading dot (when dot=true)
 data-testid="base-badge-label" on the text span

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - Renders a <span> (inline element; contains no interactive content).
   - The dot is aria-hidden (decorative; text carries the meaning).
   - No focus, no keyboard interaction, no ARIA role — the badge is
     passive content, like text.
   - Consumers that need the badge to convey its status to a screen
     reader read it as part of the surrounding text; no additional
     attributes are needed.

 If a consumer uses a badge to convey a status that is ALSO conveyed by
 another element (e.g., a table cell whose value is "Active" and whose
 badge also reads "Active"), the badge is redundant for assistive
 technology and no change is needed. If a badge is the ONLY place a
 status appears visually, its text is already announced by the screen
 reader as part of the surrounding content.
=============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue';

type BadgeVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'
  | 'accent';

type BadgeSize = 'sm' | 'md';

interface Props {
  /**
   * Visual variant. Defaults to 'neutral'.
   *
   * Each variant maps to a semantic surface / text pair from the Design
   * System. See §2.4.1 (surfaces) and §2.4.2 (text roles).
   */
  variant?: BadgeVariant;

  /** Size. Defaults to 'sm'. */
  size?: BadgeSize;

  /**
   * When true, renders a small leading dot before the label.
   *
   * The dot is decorative (aria-hidden) and reinforces the variant's
   * color. It does not contribute to the badge's accessible name.
   * See the response preamble §"Design note".
   */
  dot?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'sm',
  dot: false,
});

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'badge',
  `badge--${props.variant}`,
  `badge--${props.size}`,
  {
    'badge--with-dot': props.dot,
  },
]);
</script>

<template>
  <span
    :class="classes"
    data-testid="base-badge-root"
  >
    <!--
      Leading dot.
      Decorative reinforcement of the variant color. aria-hidden so that
      screen readers announce only the label text.
    -->
    <span
      v-if="dot"
      class="badge__dot"
      aria-hidden="true"
      data-testid="base-badge-dot"
    />

    <!-- Text label. The primary carrier of the badge's meaning. -->
    <span
      class="badge__label"
      data-testid="base-badge-label"
    >
      <slot />
    </span>
  </span>
</template>

<style scoped>
/* ============================================================================
   Base badge
   ============================================================================ */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-1);
  vertical-align: middle;
  white-space: nowrap;
  border-radius: var(--mases-radius-full);
  font-family: inherit;
  font-weight: var(--mases-font-weight-medium);
  /* Amharic syllables must never be uppercased.
     Design System §3.5 B6. */
  text-transform: none;
  letter-spacing: normal;
}

/* ============================================================================
   Sizes
   ============================================================================ */
.badge--sm {
  padding-block: var(--mases-space-1);
  padding-inline: var(--mases-space-2);
  font-size: var(--mases-font-size-caption);
  line-height: 1;
}

.badge--md {
  padding-block: var(--mases-space-1);
  padding-inline: var(--mases-space-3);
  font-size: var(--mases-font-size-body-sm);
  line-height: 1;
}

/* Slightly larger horizontal padding when the dot is present, so that
   the pill's internal rhythm does not feel crowded. Applied only when
   dot=true. */
.badge--with-dot.badge--sm {
  padding-inline-start: var(--mases-space-2);
  padding-inline-end: var(--mases-space-3);
}

.badge--with-dot.badge--md {
  padding-inline-start: var(--mases-space-3);
  padding-inline-end: var(--mases-space-4);
}

/* ============================================================================
   Leading dot
   ---------------------------------------------------------------------------
   The dot's diameter is derived from Tier 2 spacing tokens:
     sm  →  calc(--mases-space-1 * 1.5)  =  6px
     md  →  --mases-space-2              =  8px
   See the response preamble §"Design note" for the derivation rationale.
   ============================================================================ */
.badge__dot {
  display: inline-block;
  flex-shrink: 0;
  border-radius: var(--mases-radius-full);
  background-color: currentColor;
}

.badge--sm .badge__dot {
  width: calc(var(--mases-space-1) * 1.5);
  height: calc(var(--mases-space-1) * 1.5);
}

.badge--md .badge__dot {
  width: var(--mases-space-2);
  height: var(--mases-space-2);
}

/* ============================================================================
   Variants — Neutral
   ============================================================================ */
.badge--neutral {
  background-color: var(--mases-color-surface-raised);
  color: var(--mases-color-text-secondary);
}

/* ============================================================================
   Variants — Success
   ============================================================================ */
.badge--success {
  background-color: var(--mases-color-surface-success);
  color: var(--mases-color-text-success);
}

/* ============================================================================
   Variants — Warning
   ============================================================================ */
.badge--warning {
  background-color: var(--mases-color-surface-warning);
  color: var(--mases-color-text-warning);
}

/* ============================================================================
   Variants — Info
   ============================================================================ */
.badge--info {
  background-color: var(--mases-color-surface-info);
  color: var(--mases-color-text-info);
}

/* ============================================================================
   Variants — Danger
   ============================================================================ */
.badge--danger {
  background-color: var(--mases-color-surface-danger);
  color: var(--mases-color-text-danger);
}

/* ============================================================================
   Variants — Accent (gold)
   ============================================================================ */
.badge--accent {
  background-color: var(--mases-color-surface-accent);
  color: var(--mases-color-text-accent);
}

/* ============================================================================
   Label
   ============================================================================ */
.badge__label {
  display: inline-block;
}
</style>