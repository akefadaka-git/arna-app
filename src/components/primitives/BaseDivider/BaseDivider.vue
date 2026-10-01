<!--
=============================================================================
 MASES Phase 2 UI — BaseDivider
=============================================================================

 File:      mase_app/src/components/primitives/BaseDivider/BaseDivider.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.16
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A horizontal or vertical separator line. Used inside cards, between
 form sections, between a list and its action row, and anywhere a subtle
 visual break is needed between content regions.

 -----------------------------------------------------------------------------
 Rendering — different elements per orientation
 -----------------------------------------------------------------------------
 Horizontal:
     <hr>            when decorative=false (native separator role)
     <hr role="presentation">  when decorative=true (default)

 Vertical:
     <div role="separator" aria-orientation="vertical">  when
                                                        decorative=false
     <div aria-hidden="true">                            when
                                                        decorative=true
                                                        (default)

 See the response preamble §"Design note — two orientations" for the
 rationale on the asymmetry between the two orientations.

 -----------------------------------------------------------------------------
 The `decorative` prop
 -----------------------------------------------------------------------------
 Defaults to true. The catalog describes the divider as "decorative
 unless it separates labelled regions". The default matches the common
 case; consumers that use the divider as a genuine semantic separator
 set `decorative=false` and take responsibility for ensuring the
 surrounding regions are labelled.

 See the response preamble §"Design note — decorative versus semantic".

 -----------------------------------------------------------------------------
 The `spaced` prop
 -----------------------------------------------------------------------------
 Applies the corresponding margin for the active orientation:

     horizontal + spaced →  margin-block:  var(--mases-space-4)
     vertical   + spaced →  margin-inline: var(--mases-space-4)

 Default is false (no margin). Consumers add spacing via the parent's
 layout (gap, padding) or via this prop when the divider is directly
 inside a flow context.

 See the response preamble §"Design note — the spaced prop".

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The only non-token CSS values are:

   - width / height / border / display / align-self  (structural)

 No hex value appears in this file.

 For the horizontal orientation, the divider's line is expressed as a
 `border-top` on the <hr> element with the <hr>'s own height collapsed
 to zero. This avoids the browser's default <hr> styling (an inset
 bevel) which is not appropriate for the enterprise palette.

 -----------------------------------------------------------------------------
 Test hook
 -----------------------------------------------------------------------------
 data-testid="base-divider-root"  on the rendered element (either <hr>
                                  or <div>)

 Consumers can assert orientation via the `data-orientation` attribute
 which the component always emits. Consumers can assert decoration
 status via the presence or absence of the `data-decorative` attribute.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   Horizontal + decorative=true  (default)
       <hr role="presentation">. Removed from the accessibility tree.

   Horizontal + decorative=false
       <hr>. Native separator role. Announced by assistive technology
       as a thematic break.

   Vertical + decorative=true    (default)
       <div aria-hidden="true">. Removed from the accessibility tree.

   Vertical + decorative=false
       <div role="separator" aria-orientation="vertical">. Announced
       as a vertical separator.

   The decorative variants are removed from the accessibility tree
   entirely. This is the correct treatment: a decorative rule conveys
   nothing to assistive technology and should not be announced.
=============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue';

type DividerOrientation = 'horizontal' | 'vertical';

interface Props {
  /**
   * Divider orientation. Defaults to 'horizontal'.
   *
   * Horizontal dividers stack between rows of content; vertical
   * dividers sit between columns or between inline elements in a row.
   */
  orientation?: DividerOrientation;

  /**
   * Whether the divider is purely visual (true) or carries semantic
   * meaning as a separator between labelled regions (false).
   *
   * Defaults to true. See the response preamble §"Design note".
   */
  decorative?: boolean;

  /**
   * Whether to apply the standard margin for the active orientation.
   *
   *   horizontal + spaced →  margin-block:  var(--mases-space-4)
   *   vertical   + spaced →  margin-inline: var(--mases-space-4)
   *
   * Defaults to false.
   */
  spaced?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  decorative: true,
  spaced: false,
});

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'divider',
  `divider--${props.orientation}`,
  {
    'divider--spaced': props.spaced,
  },
]);

/*
 * ARIA attributes for the vertical orientation.
 *
 * When decorative is true, the element is aria-hidden and needs no
 * role. When decorative is false, the element is role="separator"
 * with an explicit orientation.
 *
 * Horizontal orientation does not use this computed property — <hr>
 * carries its own native separator semantics (or `role="presentation"`
 * when decorative).
 */
const verticalAria = computed<Record<string, string | undefined>>(() => {
  if (props.decorative) {
    return { 'aria-hidden': 'true' };
  }
  return {
    role: 'separator',
    'aria-orientation': 'vertical',
  };
});
</script>

<template>
  <!--
    HORIZONTAL — native <hr>, either semantic (default) or decorative.
    The role attribute is only set to "presentation" when decorative is
    true; otherwise the browser's native separator role applies.
  -->
  <hr
    v-if="orientation === 'horizontal'"
    :class="classes"
    :role="decorative ? 'presentation' : undefined"
    data-testid="base-divider-root"
    data-orientation="horizontal"
    :data-decorative="decorative ? '' : undefined"
  />

  <!--
    VERTICAL — no native element exists for a vertical thematic break.
    The <div> receives role + aria-orientation (semantic) or
    aria-hidden (decorative). See the response preamble for the
    rationale.
  -->
  <div
    v-else
    :class="classes"
    v-bind="verticalAria"
    data-testid="base-divider-root"
    data-orientation="vertical"
    :data-decorative="decorative ? '' : undefined"
  />
</template>

<style scoped>
/* ============================================================================
   Base
   ============================================================================ */
.divider {
  border: 0;
  background-color: var(--mases-color-border-subtle);
}

/* ============================================================================
   Horizontal
   ---------------------------------------------------------------------------
   The <hr> element is collapsed to a zero-height line via the standard
   reset (border: 0) plus an explicit height. The visual line is drawn
   by the background color. This produces a crisp 1px rule without the
   browser's default inset bevel.
   ============================================================================ */
.divider--horizontal {
  display: block;
  width: 100%;
  height: 1px;
}

/* ============================================================================
   Vertical
   ---------------------------------------------------------------------------
   The vertical <div> stretches to its container's cross-axis. The
   consumer is responsible for giving the container a height (e.g., via
   align-items: stretch on a flex row).
   ============================================================================ */
.divider--vertical {
  display: inline-block;
  width: 1px;
  align-self: stretch;
  /* A minimum height keeps the vertical divider visible even in
     containers without an explicit cross-axis size. */
  min-height: var(--mases-space-4);
}

/* ============================================================================
   Spaced
   ============================================================================ */
.divider--horizontal.divider--spaced {
  margin-block: var(--mases-space-4);
}

.divider--vertical.divider--spaced {
  margin-inline: var(--mases-space-4);
}
</style>