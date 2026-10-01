<!--
=============================================================================
 MASES Phase 2 UI — Timeline
=============================================================================

 File:      mase_app/src/components/patterns/Timeline/Timeline.vue
 Layer:     3 (Patterns)
 Version:   1.0.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.9
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 10, Unit 10.9)
 1.0.1  — mobile icon-mode marker size correction:
          narrows the icon-mode marker visual from 32px to 24px at
          <640px, matching the marker column's mobile width. Prior
          version spilled 4px per side in icon mode on mobile.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A chronological event list. Renders an ordered vertical list of events,
 each with a colored marker on a shared spine, a timestamp, a title, and
 an optional description. Used for statement entries, audit trails,
 lifecycle histories (certificate issue/cancel/replace, wallet
 adjustments), and any other ordered-events UI.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES BaseIcon (Unit 8.19). Does not reimplement icon rendering.

 -----------------------------------------------------------------------------
 The <time> semantic markup and the isoTimestamp clarification
 -----------------------------------------------------------------------------
 The `timestamp` field is the DISPLAY string (consumer-formatted;
 respects locale + calendar policy).
 The optional `isoTimestamp` field, when supplied, becomes the <time>
 element's datetime attribute.

 -----------------------------------------------------------------------------
 Marker size duality
 -----------------------------------------------------------------------------
 icon absent   →  a 12px colored dot.
 icon supplied →  a 32px colored circle with a 16px Lucide glyph
                  (narrows to 24px at <640px — see version 1.0.1 note).

 The marker column is 32px wide on desktop/tablet and 24px on mobile,
 so the spine aligns across both modes at every breakpoint. The
 connecting line's start position depends on the marker size, driven
 by the --timeline-line-start CSS variable.

 -----------------------------------------------------------------------------
 The scoped default slot
 -----------------------------------------------------------------------------
 When supplied, the slot replaces the CONTENT region of every item. The
 marker column (dot/circle + spine) remains the pattern's responsibility.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - item titles, descriptions, and timestamps (consumer-supplied);
   - any slot content (consumer-supplied).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (grid layout, gap, positioning,
 line width, marker container width, dot diameter).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="timeline-root"           on the <ol>
 data-testid="timeline-item"           on each <li>
 data-testid="timeline-marker"         on the marker column <span>
 data-testid="timeline-marker-visual"  on the visible marker (dot or
                                       circle)
 data-testid="timeline-marker-icon"    on the BaseIcon inside the
                                       marker (rendered only when icon
                                       is supplied)
 data-testid="timeline-content"        on the content region <div>
                                       (NOT rendered when the default
                                       slot is supplied)
 data-testid="timeline-timestamp"      on the <time>/<span> (default
                                       content only)
 data-testid="timeline-title"          on the title <p> (default
                                       content only)
 data-testid="timeline-description"    on the description <p> (default
                                       content only; rendered only when
                                       description is non-empty)

 The <ol> carries:
   data-dense="true"   (present only when dense)

 Each <li> carries:
   data-item-key="<key>"
   data-variant="default" | "success" | "warning" | "danger"
   data-has-icon="true" | "false"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - Renders an <ol> (ordered list) — the correct semantic for a
     chronological sequence.
   - Each item is an <li>.
   - The marker column is aria-hidden — the visual spine is decorative.
   - The timestamp uses a <time> element when isoTimestamp is supplied;
     a plain <span> otherwise.
   - Variant color is not the sole signal of the variant's meaning:
     consumers express state through the title and description text.
     The color reinforces.
   - No focus, no keyboard interaction, no ARIA role beyond the
     <ol>'s native list semantics.
   - Reduced motion: no animation in this component.
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
 * The visual variant of a timeline item's marker.
 */
export type TimelineItemVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger';

/**
 * A single timeline event.
 */
export interface TimelineItem {
  /**
   * Stable identifier. Used as the Vue :key and exposed as a
   * data-item-key attribute for testing.
   */
  key: string;

  /**
   * The DISPLAY timestamp string. Required.
   *
   * Consumer-supplied. The consumer is responsible for formatting it
   * per the design system's localization and calendar policy — the
   * Timeline renders the string verbatim.
   */
  timestamp: string;

  /** The event title. Required. Consumer-supplied, translated. */
  title: string;

  /** An optional description. Consumer-supplied, translated. */
  description?: string;

  /**
   * The marker's visual variant. Defaults to 'default'.
   *
   * The variant's color reinforces the event's semantic; it is never
   * the sole signal — the title and description carry the meaning.
   */
  variant?: TimelineItemVariant;

  /**
   * An optional Lucide icon name. When supplied, the marker becomes a
   * 32px colored circle (24px at <640px) with the icon inside;
   * otherwise it is a 12px dot.
   */
  icon?: string;

  /**
   * An optional ISO 8601 timestamp. When supplied, the timestamp is
   * rendered inside a <time datetime="{isoTimestamp}"> element
   * instead of a plain <span>.
   *
   * Catalog clarification.
   */
  isoTimestamp?: string;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../../primitives/BaseIcon';
import type { IconName } from '../../primitives/BaseIcon';

interface Props {
  /**
   * The timeline items, in chronological order. Required.
   *
   * The component does not sort the items; the consumer supplies them
   * in the intended order.
   */
  items: ReadonlyArray<TimelineItem>;

  /**
   * Whether to render in compact density. Defaults to false.
   *
   * Reduces the vertical gap between items and the description's line
   * spacing.
   */
  dense?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  dense: false,
});

/**
 * Scoped default slot.
 *
 * When supplied, replaces the CONTENT region of every item. The marker
 * column remains the pattern's responsibility.
 */
defineSlots<{
  default(props: { item: TimelineItem }): unknown;
}>();

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function hasIcon(item: TimelineItem): boolean {
  return item.icon !== undefined && item.icon.trim() !== '';
}

function iconName(item: TimelineItem): IconName {
  return item.icon as IconName;
}

function variantOf(item: TimelineItem): TimelineItemVariant {
  return item.variant ?? 'default';
}

function hasDescription(item: TimelineItem): boolean {
  const d = item.description;
  return d !== undefined && d.trim() !== '';
}

function hasIsoTimestamp(item: TimelineItem): boolean {
  const t = item.isoTimestamp;
  return t !== undefined && t.trim() !== '';
}

// -----------------------------------------------------------------------------
// Root classes
// -----------------------------------------------------------------------------
const rootClasses = computed<Array<string | Record<string, boolean>>>(() => [
  'timeline',
  {
    'timeline--dense': props.dense,
  },
]);
</script>

<template>
  <ol
    :class="rootClasses"
    :data-dense="dense ? 'true' : undefined"
    data-testid="timeline-root"
  >
    <li
      v-for="item in items"
      :key="item.key"
      class="timeline__item"
      :data-item-key="item.key"
      :data-variant="variantOf(item)"
      :data-has-icon="hasIcon(item) ? 'true' : 'false'"
      data-testid="timeline-item"
    >
      <!-- ============================================================
           Marker column
           ============================================================ -->
      <span
        class="timeline__marker"
        aria-hidden="true"
        data-testid="timeline-marker"
      >
        <span
          class="timeline__marker-visual"
          data-testid="timeline-marker-visual"
        >
          <BaseIcon
            v-if="hasIcon(item)"
            :name="iconName(item)"
            size="sm"
            data-testid="timeline-marker-icon"
          />
        </span>
      </span>

      <!-- ============================================================
           Content column
           ============================================================ -->
      <div
        v-if="!$slots.default"
        class="timeline__content"
        data-testid="timeline-content"
      >
        <!-- Timestamp -->
        <time
          v-if="hasIsoTimestamp(item)"
          class="timeline__timestamp"
          :datetime="item.isoTimestamp"
          data-testid="timeline-timestamp"
        >{{ item.timestamp }}</time>

        <span
          v-else
          class="timeline__timestamp"
          data-testid="timeline-timestamp"
        >{{ item.timestamp }}</span>

        <!-- Title -->
        <p
          class="timeline__title"
          data-testid="timeline-title"
        >{{ item.title }}</p>

        <!-- Description -->
        <p
          v-if="hasDescription(item)"
          class="timeline__description"
          data-testid="timeline-description"
        >{{ item.description }}</p>
      </div>

      <!-- ============================================================
           Consumer-supplied content override
           ============================================================ -->
      <div
        v-else
        class="timeline__content"
      >
        <slot :item="item" />
      </div>
    </li>
  </ol>
</template>

<style scoped>
/* ============================================================================
   Root <ol>
   ============================================================================ */
.timeline {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  font-family: inherit;
  /*
   * The gap between items is the vertical space the connector line must
   * span. It is referenced by the marker's ::after rule via the same
   * --timeline-gap variable.
   */
  --timeline-gap: var(--mases-space-4);
  gap: var(--timeline-gap);
}

.timeline--dense {
  --timeline-gap: var(--mases-space-3);
}

/* ============================================================================
   Item <li>
   ---------------------------------------------------------------------------
   A two-column grid: marker column (fixed 32px) + content column
   (fills). The marker column is always 32px wide so the vertical spine
   aligns across both dot-only and icon-mode items.
   ============================================================================ */
.timeline__item {
  display: grid;
  grid-template-columns: var(--mases-space-8) minmax(0, 1fr);
  column-gap: var(--mases-space-3);
  align-items: start;
  position: relative;
}

/*
 * The line's start position depends on whether the marker is a 12px
 * dot or a 32px circle.
 */
.timeline__item[data-has-icon='false'] {
  --timeline-line-start: calc(var(--mases-space-3) + var(--mases-space-1));
  /*
   * 12px (dot) + 4px (gap) = 16px, which is --mases-space-4. Written
   * above as space-3 + space-1 for readability in the source; the
   * compiled value is 12 + 4 = 16.
   */
}

.timeline__item[data-has-icon='true'] {
  --timeline-line-start: var(--mases-space-8);
}

/* ============================================================================
   Marker column
   ============================================================================ */
.timeline__marker {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: var(--mases-space-8);
  /*
   * The marker column stretches to the full height of the row (grid
   * default). This is what allows the connector line to span from the
   * marker down to the next item.
   */
  align-self: stretch;
  /*
   * A small top margin aligns the marker's vertical center with the
   * first content line (the timestamp).
   */
  padding-block-start: var(--mases-space-1);
}

/* ============================================================================
   Connector line
   ---------------------------------------------------------------------------
   Drawn as a pseudo-element on the marker column. Extends from
   --timeline-line-start (just below the visible marker) down past the
   item's own bottom edge, covering the ol's gap to the next item's
   marker.
   ============================================================================ */
.timeline__marker::after {
  content: '';
  position: absolute;
  top: var(--timeline-line-start);
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  /*
   * 100% = marker column's height (which equals the item's content
   * height due to grid stretch). The extra var(--timeline-gap) extends
   * the line down through the ol's gap to the next item.
   */
  height: calc(100% - var(--timeline-line-start) + var(--timeline-gap));
  background-color: var(--mases-color-border-subtle);
  pointer-events: none;
}

/* No connector on the last item — the spine ends at the final marker. */
.timeline__item:last-child .timeline__marker::after {
  display: none;
}

/* ============================================================================
   Marker visual — the dot or circle
   ============================================================================ */
.timeline__marker-visual {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--mases-space-3); /* 12px — the dot's diameter */
  height: var(--mases-space-3);
  border-radius: var(--mases-radius-full);
  /*
   * The default variant uses a border-strong colored dot. Other
   * variants override the background-color below.
   */
  background-color: var(--mases-color-border-strong);
  color: var(--mases-color-text-inverse);
  transition: background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

/* Icon mode: the visual becomes a 32px colored circle with the icon
   inside. */
.timeline__item[data-has-icon='true'] .timeline__marker-visual {
  width: var(--mases-space-8);
  height: var(--mases-space-8);
}

/* ============================================================================
   Variant palettes
   ---------------------------------------------------------------------------
   The default variant uses border-strong (a muted neutral) so it does
   not compete with the semantic variants. The three semantic variants
   use their Design System §2.4 token (success-500, warning-500,
   crimson-500).
   ============================================================================ */
.timeline__item[data-variant='default'] .timeline__marker-visual {
  background-color: var(--mases-color-border-strong);
}

.timeline__item[data-variant='success'] .timeline__marker-visual {
  background-color: var(--mases-color-success-500);
}

.timeline__item[data-variant='warning'] .timeline__marker-visual {
  background-color: var(--mases-color-warning-500);
}

.timeline__item[data-variant='danger'] .timeline__marker-visual {
  background-color: var(--mases-color-crimson-500);
}

/* ============================================================================
   Content column
   ============================================================================ */
.timeline__content {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  min-width: 0;
  /*
   * A small top padding aligns the content's first line with the
   * marker's visual center, matching the marker column's padding-block-
   * start logic.
   */
  padding-block-start: var(--mases-space-1);
}

/* ============================================================================
   Timestamp
   ============================================================================ */
.timeline__timestamp {
  display: block;
  color: var(--mases-color-text-tertiary);
  font-family: inherit;
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-medium);
  /*
   * Amharic truncation uses word-boundary wrapping
   * (Design System §3.7 W4).
   */
  overflow-wrap: anywhere;
}

/* ============================================================================
   Title
   ============================================================================ */
.timeline__title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Description
   ============================================================================ */
.timeline__description {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* Compact density reduces the title font scale. The gap change is
   expressed via the ol's --timeline-gap; no per-item rule is needed. */
.timeline--dense .timeline__title {
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
}

/* ============================================================================
   Mobile (<640px)
   ---------------------------------------------------------------------------
   The marker column narrows from 32px (space-8) to 24px (space-6) to
   save horizontal space. In icon mode the marker visual narrows with
   it — otherwise the 32px circle spills 4px on each side of the 24px
   column. See the file's revision history note (v1.0.1).
   ============================================================================ */
@media (max-width: 639px) {
  .timeline__item {
    grid-template-columns: var(--mases-space-6) minmax(0, 1fr);
  }

  .timeline__marker {
    width: var(--mases-space-6);
  }

  .timeline__item[data-has-icon='true'] .timeline__marker-visual {
    width: var(--mases-space-6);
    height: var(--mases-space-6);
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .timeline__marker-visual {
    transition-duration: 1ms;
  }
}
</style>