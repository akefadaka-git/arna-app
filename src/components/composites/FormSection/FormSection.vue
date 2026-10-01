<!--
=============================================================================
 MASES Phase 2 UI — FormSection
=============================================================================

 File:      mase_app/src/components/composites/FormSection/FormSection.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Groups a set of related form fields under a common heading and optional
 description. Always renders <fieldset> + <legend>. See the response
 preamble §"Design note — fieldset + legend, always".

 -----------------------------------------------------------------------------
 Structure
 -----------------------------------------------------------------------------
 The component renders:

     <fieldset aria-describedby="<id>">         (only when description)
       <legend>Title</legend>
       <p id="<id>">Description</p>              (only when description)
       <div>                                     (body)
         <slot />                                (consumer's fields)
       </div>
       <div>                                     (actions row)
         <slot name="actions" />                 (only when supplied)
       </div>
     </fieldset>

 -----------------------------------------------------------------------------
 The `spacing` prop
 -----------------------------------------------------------------------------
 Two modes:

   default  →  gap between children = var(--mases-space-4)   (16px)
   compact  →  gap between children = var(--mases-space-2)   (8px)

 The gap applies between:

   - the <legend> and the description (when present);
   - the description and the body;
   - the body and the actions row (when present);
   - each direct child of the body (so multiple FormField children
     stack with the section's gap).

 The consumer's placement of FormSections in a parent layout (grid,
 flex column, etc.) determines the gap BETWEEN sections; the `spacing`
 prop only affects the internal rhythm of one section.

 -----------------------------------------------------------------------------
 The `description` prop
 -----------------------------------------------------------------------------
 When supplied (non-empty after trimming):
   - rendered as a paragraph below the legend;
   - assigned a stable id, generated once per component instance;
   - referenced by the fieldset's aria-describedby.

 When absent or empty: no paragraph is rendered, no aria-describedby is
 set.

 See the response preamble §"Design note — the description and
 aria-describedby".

 -----------------------------------------------------------------------------
 The `actions` slot
 -----------------------------------------------------------------------------
 Rendered when the consumer supplies the slot; hidden otherwise. Right-
 aligned by default. See the response preamble §"Design note — the
 actions slot at the bottom".

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders only what the consumer supplies via the `title`
 and `description` props and the two slots. It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The only non-token CSS values are:

   - display, flex-*, list reset   (structural)
   - min-inline-size: auto          (browser reset on fieldset)

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="form-section-root"     on the <fieldset>
 data-testid="form-section-legend"   on the <legend>
 data-testid="form-section-description"
                                     on the description <p> (rendered
                                     only when description is supplied)
 data-testid="form-section-body"     on the body <div>
 data-testid="form-section-actions"  on the actions row (rendered only
                                     when the actions slot is supplied)

 The <fieldset> also carries:
   data-spacing="default" | "compact"
   aria-describedby="<id>"    (only when description is supplied)
 for consumer assertions in tests.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC (per the catalog):

   - Native <fieldset> + <legend> semantics. Screen readers announce
     the legend as the accessible name of the group.
   - When a description is present, aria-describedby references it so
     that screen readers announce the description when focus enters
     the group.
   - No focus target on the fieldset itself; the fields inside are the
     interactive elements.
   - The title renders with the design system's `heading-6` typographic
     scale (18px / 26px Latin, 20px / 30px Amharic). It is not an <h2>
     — the section heading is a label for a form group, not a page
     heading. Consumers that need a heading hierarchy for a long form
     can compose their own <h2> above the FormSection.
=============================================================================
-->

<script lang="ts">
/*
 * Module-level counter for auto-generated description ids.
 * Distinct prefix from the primitives' counters so no collision is
 * possible in a document that uses both.
 */
let __masesFormSectionIdCounter = 0;
</script>

<script setup lang="ts">
import { computed } from 'vue';

type FormSectionSpacing = 'compact' | 'default';

interface Props {
  /**
   * The section title. Required.
   *
   * A translated string from the consumer's translation layer. Renders
   * inside <legend>.
   */
  title: string;

  /**
   * Optional descriptive paragraph. A translated string.
   *
   * When supplied (non-empty), rendered below the legend and referenced
   * by the fieldset's aria-describedby.
   */
  description?: string;

  /**
   * Internal spacing. Defaults to 'default'.
   *
   *   default  →  var(--mases-space-4)  (16px)
   *   compact  →  var(--mases-space-2)  ( 8px)
   */
  spacing?: FormSectionSpacing;
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  spacing: 'default',
});

/**
 * Named slots.
 *
 * default  — the section's fields.
 * actions  — section-level context actions, right-aligned, at the
 *            bottom.
 */
defineSlots<{
  default(): unknown;
  actions(): unknown;
}>();

/*
 * Generated id — evaluated once per component instance.
 */
const descriptionId = `mases-form-section-desc-${++__masesFormSectionIdCounter}`;

/*
 * Whether the description should render.
 * Empty or whitespace-only strings are treated as absent.
 */
const hasDescription = computed<boolean>(
  () => props.description !== undefined && props.description.trim().length > 0,
);

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'form-section',
  `form-section--${props.spacing}`,
]);
</script>

<template>
  <fieldset
    :class="classes"
    :aria-describedby="hasDescription ? descriptionId : undefined"
    :data-spacing="spacing"
    data-testid="form-section-root"
  >
    <!--
      Legend.
      Renders the section title. Styled as a `heading-6` type scale
      (see CSS). Must be the first child of <fieldset> for correct
      screen-reader association.
    -->
    <legend
      class="form-section__legend"
      data-testid="form-section-legend"
    >
      {{ title }}
    </legend>

    <!--
      Description.
      Rendered only when the consumer supplied non-empty text. The
      fieldset's aria-describedby references this paragraph's id.
    -->
    <p
      v-if="hasDescription"
      :id="descriptionId"
      class="form-section__description"
      data-testid="form-section-description"
    >
      {{ description }}
    </p>

    <!--
      Body.
      Hosts the consumer's fields. The body uses a flex column with
      the section's gap, so multiple FormField children stack with the
      section's internal rhythm.
    -->
    <div
      class="form-section__body"
      data-testid="form-section-body"
    >
      <slot />
    </div>

    <!--
      Actions.
      Rendered only when the consumer supplies the slot. Right-aligned.
    -->
    <div
      v-if="$slots.actions"
      class="form-section__actions"
      data-testid="form-section-actions"
    >
      <slot name="actions" />
    </div>
  </fieldset>
</template>

<style scoped>
/* ============================================================================
   Fieldset reset
   ---------------------------------------------------------------------------
   Removes browser defaults (border, padding, margin, min-inline-size)
   so that the fieldset behaves as a neutral layout element. See the
   response preamble §"Design note — browser reset".
   ============================================================================ */
.form-section {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  /*
   * Fieldsets default to `min-inline-size: min-content`, which can
   * introduce unexpected horizontal scrolling inside narrow containers
   * (a flex column, a mobile viewport, a small card). Resetting it to
   * `auto` restores normal block-element behavior.
   */
  min-inline-size: auto;
}

/* ============================================================================
   Spacing variants
   ============================================================================ */
.form-section--default {
  gap: var(--mases-space-4);
}

.form-section--compact {
  gap: var(--mases-space-2);
}

/* ============================================================================
   Legend reset and typographic treatment
   ---------------------------------------------------------------------------
   The legend is reset to behave as a normal block. Its typographic
   style uses the design system's heading-6 scale: semibold weight,
   18px / 26px Latin (20px / 30px Amharic via the html[lang="am"]
   override in tokens.css).
   ============================================================================ */
.form-section__legend {
  display: block;
  float: none;
  width: 100%;
  margin: 0;
  padding: 0;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-heading-6);
  line-height: var(--mases-line-height-heading-6);
  font-weight: var(--mases-font-weight-semibold);
}

/* ============================================================================
   Description
   ============================================================================ */
.form-section__description {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
}

/* ============================================================================
   Body
   ---------------------------------------------------------------------------
   The body is a flex column with the section's gap. Its direct
   children (typically FormField composites or other grouped content)
   stack with the section's internal rhythm.

   The gap value is inherited from the parent fieldset's gap via a
   wrapper div; the CSS does not need to redefine it. The body wrapper
   exists so that the fieldset's flex column treats the body as a
   single element, and the body's own flex column manages the fields
   inside.
   ============================================================================ */
.form-section__body {
  display: flex;
  flex-direction: column;
  /*
   * The body's own gap between fields. Uses the same value as the
   * section's gap so that the visual rhythm inside the section is
   * uniform (fields spaced the same way as header-to-body). This is
   * deliberate: a section's internal rhythm is a single spacing value,
   * not two different ones.
   */
  gap: inherit;
}

/* ============================================================================
   Actions
   ---------------------------------------------------------------------------
   Right-aligned row at the bottom of the section. See the response
   preamble §"Design note — the actions slot at the bottom".
   ============================================================================ */
.form-section__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--mases-space-2);
  flex-wrap: wrap;
}
</style>