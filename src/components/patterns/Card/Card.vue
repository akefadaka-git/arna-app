<!--
=============================================================================
 MASES Phase 2 UI — Card
=============================================================================

 File:      mase_app/src/components/patterns/Card/Card.vue
 Layer:     3 (Patterns)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.4
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A content card with optional header and footer. Three visual variants
 (default, raised, outlined), four body padding sizes, and an optional
 clickable mode.

 -----------------------------------------------------------------------------
 The clickable mode — see the response preamble
 -----------------------------------------------------------------------------
 When clickable=true, the card is a <div role="button" tabindex="0">
 with Enter/Space activation. Nested interactive elements are exempt
 from the click delegation.

 When clickable=false (default), the card is a plain <div> with no
 role, no tabindex, and no click handler.

 -----------------------------------------------------------------------------
 Slots
 -----------------------------------------------------------------------------
 header   — the header region. Rendered only when supplied.
 default  — the card body. Always rendered.
 footer   — the footer region. Rendered only when supplied.

 -----------------------------------------------------------------------------
 Radius — deliberate divergence from Modal and AuthLayout
 -----------------------------------------------------------------------------
 Card uses --mases-radius-md (8px). Modal.vue and AuthLayout.vue use
 --mases-radius-lg (12px). The divergence is intentional:

   · A Card is a repeated, structural surface. Many cards appear in
     a list or a grid, and a smaller radius reads as "one of many."

   · A Modal is a singular, transient, focal surface. The larger
     radius reads as "this is the one thing on screen."

   · The AuthLayout card is likewise singular — it is the only card
     on an auth page — and shares the modal's visual role.

 Do not align these three without a design decision. A change to
 Card's radius affects every content page in the application.

 -----------------------------------------------------------------------------
 Elevation — deliberate relationship with AuthLayout
 -----------------------------------------------------------------------------
 The Card's `raised` variant uses --mases-shadow-elevation-1;
 AuthLayout's card uses --mases-shadow-elevation-2. The difference
 is intentional: the auth card is the sole focal point of its page
 and sits one elevation step above the generic raised card, which is
 typically one of several surfaces on a content page.

 Do not promote `raised` to elevation-2; the hierarchy would flatten
 and the auth card would lose its distinctness.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders only the slot content (consumer-supplied).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, borders between
 regions, positioning, cursor).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="card-root"      on the outer element (a <div>, with
                              role="button" when clickable)
 data-testid="card-header"    on the header region <div> (rendered
                              only when the header slot is supplied)
 data-testid="card-body"      on the body <div>
 data-testid="card-footer"    on the footer region <div> (rendered
                              only when the footer slot is supplied)

 The root carries:
   data-variant="default" | "raised" | "outlined"
   data-padding="none" | "sm" | "md" | "lg"
   data-clickable="true"   (present only when clickable)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC (default mode):

   - Renders a plain <div>. No role, no focus, no keyboard interaction.
   - Any interactive content inside the slots carries its own
     semantics.

 INTERACTIVE (clickable mode):

   - role="button" on the root, tabindex="0" for keyboard reach.
   - Enter and Space activate, matching native <button> behavior.
   - :focus-visible receives the standard design-system focus ring.
   - The click delegation skips nested interactive elements (button,
     a, input, select, textarea, [role=button], [role=link],
     [data-no-card-click]).
   - No aria-disabled is set; the consumer controls disabled state by
     rendering clickable=false and applying their own treatment.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */

/**
 * Visual variant of the card surface.
 */
export type CardVariant = 'default' | 'raised' | 'outlined';

/**
 * Body padding scale.
 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesCardWarned = new Set<string>();

function ___masesCardWarnOnce(key: string, message: string): void {
  if (__masesCardWarned.has(key)) {
    return;
  }
  __masesCardWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

interface Props {
  /**
   * Visual variant. Defaults to 'default'.
   *
   *   'default'   →  surface-page + border-subtle (a neutral container)
   *   'raised'    →  surface-page + elevation-1 (a card that visually
   *                  floats above the page)
   *   'outlined'  →  transparent background + border-strong (a
   *                  low-emphasis container whose border carries the
   *                  structure)
   */
  variant?: CardVariant;

  /**
   * Body padding. Defaults to 'md'.
   *
   *   'none'  →  0 (consumer supplies its own padding, e.g. for a
   *              full-bleed table or image)
   *   'sm'    →  space-3 (12px)
   *   'md'    →  space-4 (16px)
   *   'lg'    →  space-6 (24px)
   *
   * See the response preamble §"Design note — the header / body /
   * footer structure" for how this interacts with the header and
   * footer regions.
   */
  padding?: CardPadding;

  /**
   * Whether the card is interactive. Defaults to false.
   *
   * When true: role="button", tabindex="0", Enter/Space activation,
   * click delegation that skips nested interactive elements.
   * See the response preamble.
   */
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  clickable: false,
});

const emit = defineEmits<{
  (event: 'click', payload: MouseEvent): void;
}>();

/**
 * Slots.
 *
 * header   — the card header (optional).
 * default  — the card body (always rendered).
 * footer   — the card footer (optional).
 */
defineSlots<{
  header(): unknown;
  default(): unknown;
  footer(): unknown;
}>();

const slots = useSlots();

// -----------------------------------------------------------------------------
// Slot presence
// -----------------------------------------------------------------------------
const hasHeaderSlot = computed<boolean>(() => slots.header !== undefined);
const hasFooterSlot = computed<boolean>(() => slots.footer !== undefined);

// -----------------------------------------------------------------------------
// Development-time guards
// -----------------------------------------------------------------------------

/*
 * Guard: clickable=false is the safe default; clickable=true is a
 * deliberate choice. No warning is needed for either. This comment
 * exists as a placeholder should a future CR add a warning for a
 * specific combination of props (e.g. clickable=true + padding='none'
 * + no header/footer).
 */

// -----------------------------------------------------------------------------
// Click handler with nested-interactive delegation
// -----------------------------------------------------------------------------
/**
 * Emit `click` only when the click's target is not inside an
 * interactive descendant.
 *
 * See the response preamble §"Design note — why not a native <button>
 * when clickable".
 */
function onRootClick(event: MouseEvent): void {
  if (!props.clickable) return;

  const target = event.target as HTMLElement | null;
  if (target === null) return;

  if (
    target.closest(
      'button, a, input, select, textarea, ' +
        '[role="button"], [role="link"], [role="checkbox"], [role="menuitem"], ' +
        '[data-no-card-click]',
    ) !== null
  ) {
    return;
  }

  emit('click', event);
}

// -----------------------------------------------------------------------------
// Keyboard handler for clickable mode
// -----------------------------------------------------------------------------
/**
 * Enter and Space activate the card, mirroring native <button>
 * behavior. preventDefault on Space prevents the page from scrolling.
 */
function onRootKeydown(event: KeyboardEvent): void {
  if (!props.clickable) return;
  if (event.key !== 'Enter' && event.key !== ' ') return;

  event.preventDefault();

  /*
   * Synthesize a click event so the emit payload type is consistent
   * across mouse and keyboard activation. `currentTarget` is the
   * card's root element.
   */
  const target = event.currentTarget as HTMLElement | null;
  if (target === null) return;

  emit('click', new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  }));
}

// -----------------------------------------------------------------------------
// Classes
// -----------------------------------------------------------------------------
const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'card',
  `card--${props.variant}`,
  `card--padding-${props.padding}`,
  {
    'card--clickable': props.clickable,
  },
]);

void ___masesCardWarnOnce;
</script>

<template>
  <div
    :class="classes"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    :data-variant="variant"
    :data-padding="padding"
    :data-clickable="clickable ? 'true' : undefined"
    data-testid="card-root"
    @click="onRootClick"
    @keydown="onRootKeydown"
  >
    <!-- ==================================================================
         Header
         ================================================================== -->
    <div
      v-if="hasHeaderSlot"
      class="card__header"
      data-testid="card-header"
    >
      <slot name="header" />
    </div>

    <!-- ==================================================================
         Body
         ================================================================== -->
    <div
      class="card__body"
      data-testid="card-body"
    >
      <slot />
    </div>

    <!-- ==================================================================
         Footer
         ================================================================== -->
    <div
      v-if="hasFooterSlot"
      class="card__footer"
      data-testid="card-footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.card {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: inherit;
  color: var(--mases-color-text-primary);
  /*
   * The radius and overflow: hidden ensure child regions (header,
   * footer, body) clip to the card's rounded corners, so a header's
   * border-bottom does not extend past the top-left and top-right
   * curves.
   *
   * --mases-radius-md is deliberate. See the file header comment
   * §"Radius — deliberate divergence from Modal and AuthLayout".
   */
  border-radius: var(--mases-radius-md);
  overflow: hidden;
}

/* ============================================================================
   Variants
   ============================================================================ */
.card--default {
  background-color: var(--mases-color-surface-page);
  border: 1px solid var(--mases-color-border-subtle);
}

.card--raised {
  background-color: var(--mases-color-surface-page);
  border: 1px solid var(--mases-color-border-subtle);
  /*
   * elevation-1 (not elevation-2). AuthLayout's card sits one
   * elevation step higher because it is the sole focal point of its
   * page. See the file header comment §"Elevation — deliberate
   * relationship with AuthLayout".
   */
  box-shadow: var(--mases-shadow-elevation-1);
}

.card--outlined {
  background-color: transparent;
  border: 1px solid var(--mases-color-border-default);
}

/* ============================================================================
   Clickable
   ============================================================================ */
.card--clickable {
  cursor: pointer;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard),
    box-shadow var(--mases-duration-fast) var(--mases-easing-standard);
}

.card--clickable:hover {
  border-color: var(--mases-color-border-strong);
}

.card--clickable.card--raised:hover {
  box-shadow: var(--mases-shadow-elevation-2);
}

.card--clickable:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Body padding
   ---------------------------------------------------------------------------
   The body's padding is controlled by the padding prop. Header and
   footer use their own fixed padding (below).
   ============================================================================ */
.card--padding-none .card__body {
  padding: 0;
}

.card--padding-sm .card__body {
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-3);
}

.card--padding-md .card__body {
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-4);
}

.card--padding-lg .card__body {
  padding-block: var(--mases-space-6);
  padding-inline: var(--mases-space-6);
}

/* ============================================================================
   Header
   ---------------------------------------------------------------------------
   Header padding is fixed — independent of the padding prop — so the
   header rhythm is consistent across cards with different body
   densities. The block padding is space-4, matching the default
   (padding="md") body block padding. The inline padding is space-4,
   matching the default body inline padding. A consumer that needs a
   specific header density supplies their own padding inside the slot.
   ============================================================================ */
.card__header {
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-4);
  /*
   * A subtle rule separates the header from the body. Only drawn when
   * the header renders, which is guaranteed by the v-if on the
   * template side.
   */
  border-block-end: 1px solid var(--mases-color-border-subtle);
  /*
   * The header's typography baseline: consumers typically render an
   * <h2> or a small row of controls. The header does not impose a
   * font-size, so the header's content controls its own typography.
   */
  color: var(--mases-color-text-primary);
}

/* ============================================================================
   Footer
   ---------------------------------------------------------------------------
   Footer padding is fixed, matching the header's — independent of the
   padding prop. The block padding is space-4 (aligned with the default
   body block padding); the inline padding is space-4 (aligned with the
   default body inline padding).
   ============================================================================ */
.card__footer {
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-4);
  border-block-start: 1px solid var(--mases-color-border-subtle);
  color: var(--mases-color-text-secondary);
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .card--clickable {
    transition-duration: 1ms;
  }
}
</style>