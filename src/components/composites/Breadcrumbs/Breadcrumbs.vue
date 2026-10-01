<!--
=============================================================================
 MASES Phase 2 UI — Breadcrumbs
=============================================================================

 File:      mase_app/src/components/composites/Breadcrumbs/Breadcrumbs.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.13
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A hierarchical navigation trail. Renders an ordered list of crumbs
 inside a labelled <nav> element. The trail ends at the current page
 (rendered as text, not a link).

 -----------------------------------------------------------------------------
 The required ariaLabel prop — see the response preamble
 -----------------------------------------------------------------------------
 The nav element's aria-label comes from the required `ariaLabel` prop.
 The component does not fabricate an English "Breadcrumb" default.

 -----------------------------------------------------------------------------
 The collapse algorithm — see the response preamble
 -----------------------------------------------------------------------------
 When items.length > maxItems (and maxItems >= 3), the middle items are
 collapsed into an ellipsis. The slot layout is:

     [first item] [ellipsis] [last (maxItems - 2) items]

 When items.length <= maxItems OR maxItems < 3, no collapse occurs.
 Default maxItems = 5.

 -----------------------------------------------------------------------------
 The last item is always non-interactive — see the response preamble
 -----------------------------------------------------------------------------
 Even if the last item carries a `to` value, it renders as
 <span aria-current="page"> (not a link). A dev warning fires once per
 module load when the last item has `to`.

 -----------------------------------------------------------------------------
 Truncation strategy — character-boundary ellipsis, not word-wrap
 -----------------------------------------------------------------------------
 Long labels are truncated with `text-overflow: ellipsis` (rendered as
 U+2026). The truncation is character-boundary-based: `white-space:
 nowrap` prevents the label from wrapping, and when the label exceeds
 the element's `max-width`, the browser clips the visible text at the
 nearest character boundary and appends an ellipsis.

 This is NOT the same mechanism as the `overflow-wrap: break-word`
 policy applied shell-wide in Session B.1. That policy governs how
 text wraps to a new line when a word is too long; it has no effect on
 an element with `white-space: nowrap`, because wrapping is disabled
 there. Amharic text that gets truncated here is clipped mid-syllable
 at the character boundary, not at the Ethiopic word space (U+1361).

 The `:title` attribute on each truncated element surfaces the full
 label on hover (where the platform provides a hover affordance). This
 is the fallback for the mid-syllable truncation: the visible text is
 clipped, but the accessible name and the tooltip carry the full label.

 The `max-width` caps (20rem on links and intermediate text, 24rem on
 the current item) are sized to accommodate the longest Amharic labels
 the shell currently produces without frequent truncation. Removing
 the caps entirely was considered and rejected: without a cap, a very
 long label becomes wider than its flex container and is clipped by
 the header's own `overflow: hidden` without an ellipsis, which
 produces a worse user-visible result than the ellipsis path.

 A future CR that wants word-boundary truncation for Amharic should
 replace the truncation strategy entirely — for example with a
 two-line `-webkit-line-clamp` — rather than adjusting the `max-width`.
 That change is out of scope for the current pass.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - item labels (from the items prop, consumer-supplied, translated);
   - `ariaLabel` (consumer-supplied, translated);
   - a typographic ellipsis (U+2026) when collapsing, which is not a
     translatable string.
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, list reset,
 padding, gap).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="breadcrumbs-root"      on the <nav>
 data-testid="breadcrumbs-list"      on the <ol>
 data-testid="breadcrumbs-item"      on each <li>
 data-testid="breadcrumbs-link"      on each interactive crumb
                                     (rendered only for items with `to`
                                     that are NOT the last item)
 data-testid="breadcrumbs-current"   on the last item's <span>
                                     (aria-current="page")
 data-testid="breadcrumbs-separator" on each separator span
                                     (rendered on every item except
                                     the first; also rendered before
                                     the ellipsis)
 data-testid="breadcrumbs-ellipsis"  on the ellipsis <span>
                                     (rendered only when the trail is
                                     collapsed)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - <nav> with aria-label from the required `ariaLabel` prop.
   - <ol> inside the nav (an ordered list is the correct semantic for a
     breadcrumb trail).
   - Intermediate crumbs with `to` render as RouterLink → <a>.
     Without `to` they render as plain <span>.
   - The last item renders as <span aria-current="page">.
   - Separators and the ellipsis are aria-hidden; screen readers
     announce only the item labels.
   - No additional roles: the nav + ol + li + aria-current structure is
     the entire contract.
   - Reduced motion: the link hover transition becomes effectively
     instant.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types and helpers.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */

/**
 * A single breadcrumb entry.
 */
export interface BreadcrumbItem {
  /** Visible label. Consumer-supplied, translated. */
  label: string;

  /**
   * Target route. When supplied on an intermediate item, the crumb
   * renders as a RouterLink. When absent, the crumb renders as plain
   * text.
   *
   * Ignored on the last item: the last item is always rendered as
   * non-interactive text with aria-current="page". See the response
   * preamble §"Design note — the last item is always non-interactive".
   */
  to?: string;
}

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesBreadcrumbsWarned = new Set<string>();

function __masesBreadcrumbsWarnOnce(key: string, message: string): void {
  if (__masesBreadcrumbsWarned.has(key)) {
    return;
  }
  __masesBreadcrumbsWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/**
 * The collapse minimum. Below this value, the collapse is disabled
 * and a dev warning fires. See the response preamble §"Design note —
 * the collapse algorithm".
 */
const MIN_COLLAPSE_SLOTS = 3;
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import BaseIcon from '../../primitives/BaseIcon';

interface Props {
  /**
   * The trail items, in order. Required.
   *
   * The first item is typically the workspace or a top-level
   * destination; the last item is the current page.
   */
  items: ReadonlyArray<BreadcrumbItem>;

  /**
   * The nav element's aria-label. Required.
   *
   * A translated string from the consumer's translation layer
   * ("Breadcrumb" / "የገጽ ዱካ" / etc.). See the response preamble
   * §"Design note — the ariaLabel prop".
   */
  ariaLabel: string;

  /**
   * Maximum number of slots to render when collapsing. Defaults to 5.
   *
   * When `items.length > maxItems` AND `maxItems >= 3`, the trail is
   * collapsed as:
   *
   *     [first item] [ellipsis] [last (maxItems - 2) items]
   *
   * When `items.length <= maxItems` OR `maxItems < 3`, no collapse
   * occurs. See the response preamble §"Design note — the collapse
   * algorithm".
   */
  maxItems?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxItems: 5,
});

// -----------------------------------------------------------------------------
// Development-time guards
// -----------------------------------------------------------------------------

/**
 * Guard: maxItems < MIN_COLLAPSE_SLOTS.
 * Falls back to no collapse. Warn once per module load.
 */
if (import.meta.env.DEV && props.maxItems < MIN_COLLAPSE_SLOTS) {
  __masesBreadcrumbsWarnOnce(
    'breadcrumbs:max-items-below-minimum',
    `[Breadcrumbs] maxItems=${props.maxItems} is below the minimum of ` +
      `${MIN_COLLAPSE_SLOTS}. Collapse is disabled and every item will ` +
      `be rendered. Increase maxItems to ${MIN_COLLAPSE_SLOTS} or more ` +
      `to enable collapsing.`,
  );
}

/**
 * Guard: empty items list. A breadcrumb with no items is a caller
 * defect — an empty nav element adds noise to the DOM with no
 * navigational value.
 */
if (import.meta.env.DEV && props.items.length === 0) {
  __masesBreadcrumbsWarnOnce(
    'breadcrumbs:empty-items',
    '[Breadcrumbs] items is empty. The component will render an empty ' +
      '<nav> element. Either supply at least one item or conditionally ' +
      'render the Breadcrumbs.',
  );
}

/**
 * Guard: the last item carries `to`. The last item is the current
 * page and is rendered as non-interactive text regardless. Warn once
 * per module load.
 */
if (import.meta.env.DEV) {
  const lastItem = props.items[props.items.length - 1];
  if (lastItem !== undefined && lastItem.to !== undefined) {
    __masesBreadcrumbsWarnOnce(
      'breadcrumbs:last-item-has-to',
      `[Breadcrumbs] the last item ("${lastItem.label}") carries a ` +
        `'to' value, but the last item is always rendered as ` +
        `non-interactive text (aria-current="page"). The 'to' value ` +
        `will be ignored. Remove it to silence this warning.`,
    );
  }
}

// -----------------------------------------------------------------------------
// Collapse computation
// -----------------------------------------------------------------------------

/**
 * Whether the trail collapses.
 *
 * True when items.length > maxItems AND maxItems >= MIN_COLLAPSE_SLOTS.
 */
const shouldCollapse = computed<boolean>(() => {
  if (props.maxItems < MIN_COLLAPSE_SLOTS) {
    return false;
  }
  return props.items.length > props.maxItems;
});

/**
 * The sliced trail after collapse.
 *
 * Two cases:
 *   - No collapse: the full list.
 *   - Collapse:    [first item, ellipsis-marker, ...last (maxItems - 2) items]
 *
 * The ellipsis is represented by a synthetic item with a special
 * marker; the template uses the marker to render an ellipsis instead
 * of a crumb.
 */
type RenderedEntry =
  | { kind: 'item'; index: number; item: BreadcrumbItem }
  | { kind: 'ellipsis' };

const renderedEntries = computed<RenderedEntry[]>(() => {
  if (!shouldCollapse.value) {
    return props.items.map((item, index) => ({ kind: 'item', index, item }));
  }

  const first = props.items[0];
  const tailCount = props.maxItems - 2; // 1 leading + 1 ellipsis
  const tailStart = props.items.length - tailCount;

  const entries: RenderedEntry[] = [
    { kind: 'item', index: 0, item: first },
    { kind: 'ellipsis' },
  ];

  for (let i = tailStart; i < props.items.length; i++) {
    entries.push({ kind: 'item', index: i, item: props.items[i] });
  }

  return entries;
});

/**
 * The index of the last rendered item.
 *
 * Used to decide whether a rendered item is the "current page" (the
 * last one), regardless of collapse.
 */
const lastIndex = computed<number>(() => props.items.length - 1);

/**
 * Whether a rendered item at the given original index is the last
 * (current) item.
 */
function isLastItem(originalIndex: number): boolean {
  return originalIndex === lastIndex.value;
}

/**
 * Whether a rendered item is the first rendered item. The first item
 * has no separator.
 */
function isFirstRendered(renderedPosition: number): boolean {
  return renderedPosition === 0;
}
</script>

<template>
  <nav
    :aria-label="ariaLabel"
    class="breadcrumbs"
    data-testid="breadcrumbs-root"
  >
    <ol
      class="breadcrumbs__list"
      data-testid="breadcrumbs-list"
    >
      <li
        v-for="(entry, renderedPosition) in renderedEntries"
        :key="entry.kind === 'ellipsis' ? `ellipsis-${renderedPosition}` : `item-${entry.index}`"
        class="breadcrumbs__item"
        data-testid="breadcrumbs-item"
      >
        <!--
          Separator.
          Rendered on every entry except the first rendered entry
          (which has no preceding item).
        -->
        <span
          v-if="!isFirstRendered(renderedPosition)"
          class="breadcrumbs__separator"
          aria-hidden="true"
          data-testid="breadcrumbs-separator"
        >
          <BaseIcon name="chevron-right" size="xs" />
        </span>

        <!--
          Ellipsis entry — a non-interactive span with a typographic
          ellipsis character.
        -->
        <span
          v-if="entry.kind === 'ellipsis'"
          class="breadcrumbs__ellipsis"
          aria-hidden="true"
          data-testid="breadcrumbs-ellipsis"
        >…</span>

        <!--
          Last item — always rendered as non-interactive text with
          aria-current="page".
        -->
        <span
          v-else-if="isLastItem(entry.index)"
          class="breadcrumbs__current"
          aria-current="page"
          :title="entry.item.label"
          data-testid="breadcrumbs-current"
        >{{ entry.item.label }}</span>

        <!--
          Intermediate item with `to` — a RouterLink. The `title`
          attribute surfaces the full label when the visible text is
          truncated by the max-width cap.
        -->
        <RouterLink
          v-else-if="entry.item.to !== undefined"
          :to="entry.item.to"
          class="breadcrumbs__link"
          :title="entry.item.label"
          data-testid="breadcrumbs-link"
        >{{ entry.item.label }}</RouterLink>

        <!--
          Intermediate item without `to` — plain text.
        -->
        <span
          v-else
          class="breadcrumbs__text"
          :title="entry.item.label"
        >{{ entry.item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
/* ============================================================================
   Nav
   ============================================================================ */
.breadcrumbs {
  display: block;
  width: 100%;
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
}

/* ============================================================================
   Ordered list
   ============================================================================ */
.breadcrumbs__list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--mases-space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

/* ============================================================================
   List item
   ============================================================================ */
.breadcrumbs__item {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2);
  /*
   * No min-width: items shrink with content. Long labels truncate via
   * the link/span rules below when needed.
   */
}

/* ============================================================================
   Separator
   ============================================================================ */
.breadcrumbs__separator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--mases-color-icon-secondary);
}

/* ============================================================================
   Link (intermediate items with `to`)
   ---------------------------------------------------------------------------
   Truncation is character-boundary-based via `text-overflow: ellipsis`
   with `white-space: nowrap`. This is NOT the same as the shell-wide
   `overflow-wrap: break-word` policy from Session B.1 — that policy
   has no effect on an element with `white-space: nowrap`. See the
   file header comment §"Truncation strategy".

   The `max-width` cap (20rem) is sized for the longest Amharic labels
   the shell currently produces. It is deliberately larger than the
   pre-Session-D value (16rem) so Amharic labels truncate less often.
   The `title` attribute on the element surfaces the full label on
   hover.
   ============================================================================ */
.breadcrumbs__link {
  color: var(--mases-color-action-link);
  text-decoration: none;
  max-width: 20rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--mases-duration-fast) var(--mases-easing-standard);
}

.breadcrumbs__link:hover {
  color: var(--mases-color-action-link-hover);
  text-decoration: underline;
}

.breadcrumbs__link:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Current page (last item)
   ---------------------------------------------------------------------------
   Same truncation strategy as `.breadcrumbs__link`, with a slightly
   larger cap (24rem) because the current item is typically the longest
   crumb (a page title or a leaf identifier).
   ============================================================================ */
.breadcrumbs__current {
  color: var(--mases-color-text-primary);
  font-weight: var(--mases-font-weight-medium);
  max-width: 24rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================================================
   Plain text (intermediate items without `to`)
   ---------------------------------------------------------------------------
   Same truncation strategy as `.breadcrumbs__link`, with the same
   20rem cap.
   ============================================================================ */
.breadcrumbs__text {
  color: var(--mases-color-text-secondary);
  max-width: 20rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================================================
   Ellipsis
   ============================================================================ */
.breadcrumbs__ellipsis {
  color: var(--mases-color-text-tertiary);
  font-weight: var(--mases-font-weight-regular);
  /* Prevent the ellipsis from collapsing to nothing on very narrow
     layouts. */
  min-width: 1ch;
  text-align: center;
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .breadcrumbs__link {
    transition-duration: 1ms;
  }
}
</style>