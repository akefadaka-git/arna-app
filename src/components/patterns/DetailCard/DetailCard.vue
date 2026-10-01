<!--
=============================================================================
 MASES Phase 2 UI — DetailCard
=============================================================================

 File:      mase_app/src/components/patterns/DetailCard/DetailCard.vue
 Layer:     3 (Patterns)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.5
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A standard detail view with a title and a MetaList body. Renders a
 Card whose header carries the title, subtitle, and an optional actions
 area, and whose body carries the MetaList field grid and an optional
 extra region below it.

 -----------------------------------------------------------------------------
 Composition — see the response preamble
 -----------------------------------------------------------------------------
 COMPOSES Card (Unit 10.4) and MetaList (Unit 9.23). Does not
 reimplement the card chrome or the field-list layout.

 -----------------------------------------------------------------------------
 Heading level — see the response preamble
 -----------------------------------------------------------------------------
 The title is rendered as an <h2> at the heading-6 type scale.
 Rationale documented in the response preamble §"Design note — the
 heading level".

 -----------------------------------------------------------------------------
 Header visibility — see the response preamble
 -----------------------------------------------------------------------------
 The Card's header slot is passed only when there is header content:
 title, subtitle, or an actions slot. Prevents an empty header region
 from rendering.

 -----------------------------------------------------------------------------
 Hardcoded Card configuration — see the response preamble
 -----------------------------------------------------------------------------
 DetailCard hardcodes Card's variant to 'default' and padding to 'md'.
 The catalog does not declare these props; consumers who need a
 different configuration compose Card + MetaList directly.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - `title` (consumer-supplied, translated);
   - `subtitle` (consumer-supplied, translated);
   - `fields` (consumer-supplied; label and value are the consumer's
     translated/raw strings);
   - the actions and extra slot content (consumer-supplied).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, gap, margins).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="detail-card-root"       on the outer Card element
 data-testid="detail-card-header"     on the header <div> (rendered
                                      only when header content exists)
 data-testid="detail-card-title"      on the <h2> (rendered only when
                                      title is non-empty)
 data-testid="detail-card-subtitle"   on the subtitle <p> (rendered
                                      only when subtitle is non-empty)
 data-testid="detail-card-actions"    on the actions wrapper <div>
                                      (rendered only when the actions
                                      slot is supplied)
 data-testid="detail-card-fields"     on the MetaList instance
 data-testid="detail-card-extra"      on the extra <div> (rendered
                                      only when the extra slot is
                                      supplied)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - The outer element is the Card's root; Card's accessibility
     contract applies (a plain container, no role, no focus).
   - The title is a native <h2>; it participates in the document
     outline.
   - The subtitle is a <p>.
   - The actions region is a plain container; its content (typically
     buttons or a DropdownMenu) carries its own semantics.
   - The field grid is a MetaList, which renders a semantic <dl>.
   - The extra region is a plain container; its content carries its
     own semantics.
   - No focus, no keyboard interaction, no ARIA role beyond the
     heading's native semantics.
   - Reduced motion: no animation in this component (Card's own
     reduced-motion rules apply when the Card is clickable — DetailCard
     never renders a clickable Card).
=============================================================================
-->

<script lang="ts">
/*
 * Exported type.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import it from the barrel (index.ts).
 *
 * The MetaListItem type is used by the `fields` prop. It is defined in
 * Unit 9.23 and re-exported by DetailCard's barrel for ergonomic
 * consumption.
 */

/*
 * No module-level state or warnings are needed in this component; the
 * composed Card and MetaList own their own dev-time guards.
 */
</script>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import Card from '../Card';
import MetaList from '../../composites/MetaList';
import type { MetaListItem, MetaListColumns } from '../../composites/MetaList';

interface Props {
  /**
   * The card's title. Required.
   *
   * A translated string. Rendered as a semantic <h2> at the heading-6
   * type scale. An empty string suppresses the <h2> element; if no
   * subtitle or actions are supplied either, the header region is
   * suppressed entirely. See the response preamble §"Design note —
   * header visibility".
   */
  title: string;

  /**
   * Optional subtitle. A translated string.
   *
   * Rendered as a <p> below the title. An empty string suppresses the
   * element.
   */
  subtitle?: string;

  /**
   * The field rows. Required. May be empty.
   *
   * Rendered by the MetaList composite (Unit 9.23). Each item carries
   * a label, a value (string or null), and an optional span.
   */
  fields: ReadonlyArray<MetaListItem>;

  /**
   * Number of columns for the field grid. Defaults to 1.
   *
   * See MetaList (Unit 9.23) for the collapse behavior and layout.
   */
  columns?: MetaListColumns;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: undefined,
  columns: 1,
});

/**
 * Slots.
 *
 * actions  — the header's right-hand actions region (buttons,
 *            DropdownMenu). Rendered only when supplied.
 * extra    — additional content below the fields, inside the card
 *            body. Rendered only when supplied.
 */
defineSlots<{
  actions(): unknown;
  extra(): unknown;
}>();

const slots = useSlots();

// -----------------------------------------------------------------------------
// Slot presence
// -----------------------------------------------------------------------------
const hasActionsSlot = computed<boolean>(() => slots.actions !== undefined);
const hasExtraSlot = computed<boolean>(() => slots.extra !== undefined);

// -----------------------------------------------------------------------------
// Content presence
// -----------------------------------------------------------------------------
const hasTitle = computed<boolean>(() => props.title.trim().length > 0);

const hasSubtitle = computed<boolean>(() => {
  const s = props.subtitle;
  return s !== undefined && s.trim().length > 0;
});

/**
 * Whether the header region renders at all.
 * See the response preamble §"Design note — header visibility".
 */
const hasHeaderContent = computed<boolean>(
  () => hasTitle.value || hasSubtitle.value || hasActionsSlot.value,
);
</script>

<template>
  <Card
    variant="default"
    padding="md"
    data-testid="detail-card-root"
  >
    <!-- ==================================================================
         Header
         ================================================================== -->
    <template
      v-if="hasHeaderContent"
      #header
    >
      <div
        class="detail-card__header"
        data-testid="detail-card-header"
      >
        <div class="detail-card__title-block">
          <h2
            v-if="hasTitle"
            class="detail-card__title"
            data-testid="detail-card-title"
          >{{ title }}</h2>

          <p
            v-if="hasSubtitle"
            class="detail-card__subtitle"
            data-testid="detail-card-subtitle"
          >{{ subtitle }}</p>
        </div>

        <div
          v-if="hasActionsSlot"
          class="detail-card__actions"
          data-testid="detail-card-actions"
        >
          <slot name="actions" />
        </div>
      </div>
    </template>

    <!-- ==================================================================
         Body — the field grid
         ================================================================== -->
    <MetaList
      :items="fields"
      :columns="columns"
      data-testid="detail-card-fields"
    />

    <!-- ==================================================================
         Extra — additional content below the fields
         ================================================================== -->
    <div
      v-if="hasExtraSlot"
      class="detail-card__extra"
      data-testid="detail-card-extra"
    >
      <slot name="extra" />
    </div>
  </Card>
</template>

<style scoped>
/* ============================================================================
   Header
   ---------------------------------------------------------------------------
   The card's header region already provides padding (space-3 vertical,
   space-4 horizontal) and a bottom border. This rule only lays out the
   title block and the actions row within that region.
   ============================================================================ */
.detail-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--mases-space-3);
  flex-wrap: wrap;
}

/* ============================================================================
   Title block — title + subtitle stacked
   ============================================================================ */
.detail-card__title-block {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  /*
   * The title block grows to fill available width; the actions row
   * takes only as much as its content requires (see below).
   */
  flex: 1 1 auto;
  min-width: 0;
}

/* ============================================================================
   Title
   ============================================================================ */
.detail-card__title {
  margin: 0;
  max-width: 40em;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-heading-6);
  line-height: var(--mases-line-height-heading-6);
  font-weight: var(--mases-font-weight-semibold);
  /*
   * Amharic truncation uses word-boundary wrapping
   * (Design System §3.7 W4).
   */
  overflow-wrap: anywhere;
}

/* ============================================================================
   Subtitle
   ============================================================================ */
.detail-card__subtitle {
  margin: 0;
  max-width: 60em;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Actions
   ============================================================================ */
.detail-card__actions {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2);
  flex-wrap: wrap;
  flex-shrink: 0;
  /*
   * Push actions to the trailing edge of the header row.
   */
  margin-inline-start: auto;
}

/* ============================================================================
   Extra — additional content below the fields
   ============================================================================ */
.detail-card__extra {
  /*
   * A gap between the field grid and the extra content. Space-4 (16px)
   * matches the Card body's own padding, so the extra region reads as
   * a distinct sub-region rather than being squeezed against the
   * fields.
   */
  margin-block-start: var(--mases-space-4);
}

/* ============================================================================
   Mobile
   ============================================================================ */
@media (max-width: 639px) {
  .detail-card__header {
    /*
     * Stack title block above actions on mobile. The title owns the
     * full width; actions sit below, left-aligned, in their own row.
     */
    flex-direction: column;
    align-items: stretch;
  }

  .detail-card__actions {
    margin-inline-start: 0;
    align-self: flex-start;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================
   No transitions in this component. The composed Card and MetaList
   each apply their own reduced-motion rules where applicable.
   ============================================================================ */
</style>