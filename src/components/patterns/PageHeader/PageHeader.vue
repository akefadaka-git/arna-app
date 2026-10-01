<!--
=============================================================================
 CHANGE VERIFICATION — professional enhancement
=============================================================================

 File:      mase_app/src/components/patterns/PageHeader/PageHeader.vue  (AMEND)
 Unit:      Enhance — eyebrow, variant, dividers, leading/title-trailing/
                 meta slots, aria-labelledby linkage, typography polish.
 Delivery type:  Enhancement — every addition is opt-in; existing props,
                 slots, testids, classes, and behaviors are unchanged.
 Net lines:      +~120 docblock; +1 module counter; +3 props; +4 slots;
                 +~40 template lines; +~55 CSS lines.

 Before (v1.0.1):
   The component accepted:
     · props: title, description, breadcrumbs, breadcrumbsAriaLabel,
       sticky
     · slots: default (alias for actions), actions, tabs

   It rendered an <h1> with no id, no aria-labelledby linkage between
   the landmark <header> and its heading, and no way for a caller to
   add a small pre-title caption, an inline trailing element (badge,
   chip), a leading icon/avatar, or a full-width metadata row.

   The visual density was fixed. Nested or secondary usages had no way
   to opt into a tighter layout without overriding CSS.

 After (v1.0.2):
   The component accepts the same props and slots as v1.0.1 plus:

     PROPS:
       · eyebrow?: string
           A small caption rendered above the title. Omitted when
           empty. Useful for "Section / Page" context. Amharic-
           friendly: no uppercase transform.

       · variant?: 'default' | 'compact'
           Vertical density. 'compact' tightens the header's internal
           gaps by one token step. The semantic heading level (h1)
           is unchanged.

       · dividers?: boolean
           When true and the header is not sticky, adds a bottom
           border and end padding, providing visual separation from
           the content below. The sticky variant already draws its
           own border; the two are mutually exclusive in effect.

     SLOTS:
       · #leading
           A region before the title column. Intended for a page-
           level icon or avatar. Rendered only when supplied.

       · #title-trailing
           Inline content after the title text. Intended for status
           badges, ID chips, and count pills that belong ON the same
           line as the title. Rendered only when supplied.

       · #meta
           A full-width row between the top-row and the tabs region.
           Intended for a metadata cluster (dates, IDs, breadcrumb-
           like inline facts). Rendered only when supplied.

     ACCESSIBILITY:
       · The <h1> now carries an auto-generated unique id.
       · The outer <header> now carries aria-labelledby pointing at
         that id, when the h1 is present. Screen-reader users
         navigating by landmark hear the page title as the landmark's
         name.

     TYPOGRAPHY:
       · overflow-wrap: anywhere on the title and description — a
         more robust fallback than break-word for pathological
         strings (very long identifiers, URLs embedded in titles).
       · text-wrap: balance on the title — a progressive enhancement
         that produces more even line breaks; ignored by browsers
         that do not support it.

 Backward compatibility:
   · Every existing prop, slot, testid, class, and behavior is
     preserved.
   · The default-slot alias for actions (added in v1.0.1) is preserved.
   · No existing consumer needs any change. The additions are all
     opt-in.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none

=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — PageHeader
=============================================================================

 File:      mase_app/src/components/patterns/PageHeader/PageHeader.vue
 Layer:     3 (Patterns)
 Version:   1.0.2
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.3
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Named `actions` and `tabs` slots only.

 1.0.1  — default-slot support. The default slot became an alias for
          the `actions` slot. See the 1.0.1 CR block in the git
          history for the full rationale.

 1.0.2  — professional enhancement. Added three props (eyebrow,
          variant, dividers), three slots (leading, title-trailing,
          meta), an auto-generated <h1> id, aria-labelledby linkage
          between the landmark <header> and its heading, and
          typography polish. Every addition is opt-in; no existing
          consumer is affected.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The standard page header inside the shell's content region. Renders:

   · an optional breadcrumb trail (Breadcrumbs, Unit 9.13);
   · an optional leading region (icon / avatar) — the #leading slot;
   · an optional eyebrow caption — the `eyebrow` prop;
   · a page title (<h1>) — the `title` prop;
   · optional inline trailing content after the title — the
     #title-trailing slot;
   · an optional description — the `description` prop;
   · an optional right-aligned actions region — the `actions` slot
     (or the default slot, which is an alias);
   · an optional full-width metadata row — the #meta slot;
   · an optional tabs region — the `tabs` slot.

 All regions are opt-in. An empty PageHeader renders only the <h1>.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES Breadcrumbs (Unit 9.13). Does not reimplement the trail.

 -----------------------------------------------------------------------------
 The breadcrumbsAriaLabel prop
 -----------------------------------------------------------------------------
 Breadcrumbs requires an `ariaLabel`. PageHeader exposes
 `breadcrumbsAriaLabel` as a companion prop. When `breadcrumbs` is
 supplied without a label, a deduplicated dev warning fires and the
 nav renders with aria-label="" (visible defect).

 -----------------------------------------------------------------------------
 The <h1> title and its auto-generated id
 -----------------------------------------------------------------------------
 The title is rendered as an <h1>, matching the design system's page-
 hierarchy expectation (Architecture Freeze §16.3, mirroring WCAG 1.3.1).
 Empty title suppresses the <h1> element entirely.

 When the <h1> is present, it carries an auto-generated unique id, and
 the outer <header> carries aria-labelledby pointing at that id. This
 gives screen-reader users navigating by landmark a named landmark —
 the standard pattern for a page-level <header> block inside a content
 region.

 When the <h1> is absent (empty title), the <header> carries no
 aria-labelledby (a link to a non-existent element would be worse than
 no link at all).

 This differs from ErrorHeader (Unit 9.24), whose <h1> carries
 tabindex="-1" for programmatic focus. PageHeader's <h1> is a static
 heading and is not focusable — it is not the target of any focus
 management contract.

 -----------------------------------------------------------------------------
 The `eyebrow` prop
 -----------------------------------------------------------------------------
 A short pre-title caption. Renders above the <h1> as a small, muted
 line. Intended uses:

   · a section / page trail ("Workspace / Loans");
   · a short category label ("Finance");
   · a state indicator that is not a badge ("Read-only view").

 Empty string suppresses the element. The eyebrow is NOT uppercased or
 letter-spaced: the platform is Amharic-first (Freeze §9.1), and
 upper-casing the Ethiopic script is not meaningful.

 -----------------------------------------------------------------------------
 The `variant` prop
 -----------------------------------------------------------------------------
   'default'  — the standard vertical rhythm.
   'compact'  — tightens the header's internal gaps by one token step.
                Useful for headers embedded inside a Card, a Modal, or
                a secondary region of the page.

 The semantic heading level (h1) is unchanged across variants. The
 variant affects only the vertical rhythm, not the typographic
 hierarchy.

 The variant is reflected as a `data-variant` attribute on the outer
 <header>, so tests can assert it and future CSS can extend it.

 -----------------------------------------------------------------------------
 The `dividers` prop
 -----------------------------------------------------------------------------
 When `dividers=true` and the header is not sticky, the component adds
 a bottom border and end padding, visually separating the header from
 the content below.

 The sticky variant already draws its own bottom border (see the
 §"Sticky" section). When `sticky=true`, the dividers prop is a no-op
 — the sticky border is the authoritative one.

 -----------------------------------------------------------------------------
 The `#leading` slot
 -----------------------------------------------------------------------------
 Renders before the title column. Intended for a page-level icon or
 avatar. The consumer supplies the visual; the component supplies only
 the flex layout and the gap.

 Rendered only when supplied.

 -----------------------------------------------------------------------------
 The `#title-trailing` slot
 -----------------------------------------------------------------------------
 Renders inline after the title text, within the same flex row as the
 <h1>. Intended for status badges, ID chips, and count pills that
 should appear on the same line as the title.

 The <h1> and the trailing content are wrapped in a flex container that
 aligns them on the baseline; the trailing slot wraps to a new line
 when the title is long.

 Rendered only when supplied.

 -----------------------------------------------------------------------------
 The `#meta` slot
 -----------------------------------------------------------------------------
 Renders as a full-width row between the top-row (title + actions) and
 the tabs region. Intended for a metadata cluster — key-value pairs,
 dates, IDs, inline facts.

 The component supplies only the flex container; the consumer supplies
 the content and its semantics.

 Rendered only when supplied.

 -----------------------------------------------------------------------------
 The two slot styles for the actions region
 -----------------------------------------------------------------------------
 The component accepts BOTH of the following, and they are treated as
 equivalent:

   NAMED (explicit):
     <PageHeader ...>
       <template #actions>
         <PrimaryButton>...</PrimaryButton>
       </template>
     </PageHeader>

   DEFAULT (implicit):
     <PageHeader ...>
       <PrimaryButton>...</PrimaryButton>
     </PageHeader>

 The default-slot form was added in v1.0.1 so that the workspace's
 existing call convention — which places action buttons directly
 inside the PageHeader's tags — renders correctly. When both forms are
 supplied, the named `actions` slot wins and the default slot is
 discarded, matching Vue's standard slot-fallback semantics.

 The `tabs` region is unaffected by this alias. A caller that needs
 tabs uses `<template #tabs>` explicitly.

 -----------------------------------------------------------------------------
 Sticky behavior
 -----------------------------------------------------------------------------
 When `sticky=true`, the header sticks to the top of its scroll
 container using position: sticky and --mases-z-sticky (200). A
 background-color is applied when sticky so that scrolled content does
 not show through the header. When not sticky, the background is
 transparent (the page surface shows through).

 -----------------------------------------------------------------------------
 Sticky mode — nested-container constraint
 -----------------------------------------------------------------------------
 Sticky mode assumes this component is a direct child of the main
 content column. The technique is:

   · position: sticky with a small padding and a matching negative
     margin, so the header's opaque background extends a few pixels
     past the header's content edges at the inline boundaries.
   · The result is that scrolled content does not show a thin strip of
     the underlying page surface between the header's content and the
     content column's own padding.

 The technique is correct inside the shell's content column, where the
 parent's inline padding is at least 4px on each side
 (--mases-shell-content-padding-desktop is 32px; -tablet is 24px;
 -mobile is 16px). It is unsafe inside a nested container whose own
 inline padding is smaller than 4px (a tightly-padded Card, a Modal
 body, a tooltip), because the negative margin would pull the
 header's background across the container's interior instead of the
 content region's edge.

 Use `sticky=false` for PageHeaders rendered inside a Card, a Modal,
 or any surface that is not the shell's main content column. The
 default `sticky=false` is the safe choice for nested usages; the
 sticky variant is opt-in and should only be enabled when the
 component is a direct child of the shell's content region.

 -----------------------------------------------------------------------------
 What this component deliberately does NOT do
 -----------------------------------------------------------------------------
   · It does NOT provide an auto-overflow menu for excessive actions.
     A page that has more actions than fit on one row is a page whose
     information architecture should be reconsidered — grouping the
     actions, moving some into a dropdown, or moving them into the
     content. The PageHeader provides the actions region and lets the
     consumer decide how to fill it.

   · It does NOT provide a back-button prop. A back affordance is a
     navigation concern and belongs to the caller (a RouterLink, or a
     small secondary action inside the actions region). Coupling the
     pattern to vue-router would make it unusable in non-routing
     contexts (Storybook, tests, future embedded views).

   · It does NOT provide a loading skeleton. Loading state is a shell
     concern — the shell decides whether to show a page-level skeleton,
     a header-level skeleton, or nothing at all. A PageHeader that
     renders a skeleton of itself would duplicate that decision.

   · It does NOT expose an avatar/icon prop. The #leading slot is the
     extension point; the consumer decides what visual to render and
     how.

   · It does NOT expose a "title is a link" prop. The consumer that
     wants a link puts the title text into a RouterLink inside the
     #title-trailing slot or handles the affordance in the actions
     region.

   · It does NOT accept a `headingLevel` prop. A PageHeader is a
     page-level header; its <h1> is the page's top-level heading. A
     nested usage inside a Card or Modal should use a different
     pattern (a Card header, a Modal header) rather than a PageHeader
     with a demoted heading level.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - `title` (consumer-supplied, translated);
   - `description` (consumer-supplied, translated);
   - `eyebrow` (consumer-supplied, translated);
   - `breadcrumbsAriaLabel` (consumer-supplied, translated) — passed
     to Breadcrumbs as its ariaLabel;
   - `breadcrumbs` items (consumer-supplied);
   - the leading, title-trailing, actions, meta, tabs, and default
     slot content (consumer-supplied).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, gap, positioning,
 sticky offset, border width).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="page-header-root"           on the outer <header>
 data-testid="page-header-breadcrumbs"    on the breadcrumbs wrapper
                                          (rendered only when
                                          breadcrumbs is supplied)
 data-testid="page-header-top-row"        on the title+actions row
 data-testid="page-header-leading"        on the leading wrapper
                                          (rendered only when the
                                          leading slot is supplied)
 data-testid="page-header-title"          on the <h1> (rendered only
                                          when title is non-empty)
 data-testid="page-header-eyebrow"        on the eyebrow <p> (rendered
                                          only when eyebrow is
                                          non-empty)
 data-testid="page-header-title-trailing" on the trailing wrapper
                                          (rendered only when the
                                          title-trailing slot is
                                          supplied)
 data-testid="page-header-description"    on the description <p>
                                          (rendered only when
                                          description is non-empty)
 data-testid="page-header-actions"        on the actions wrapper
                                          (rendered when either the
                                          `actions` slot or the
                                          default slot is supplied)
 data-testid="page-header-meta"           on the meta wrapper (rendered
                                          only when the meta slot is
                                          supplied)
 data-testid="page-header-tabs"           on the tabs wrapper (rendered
                                          only when the tabs slot is
                                          supplied)

 The outer <header> carries:
   data-sticky="true"      (present only when sticky)
   data-variant="default"  (always present; 'compact' when variant is
                            compact)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - The outer element is a native <header>. Note that <header> is
     only a banner landmark when it is NOT a descendant of <article>,
     <aside>, <main>, or <nav>. When PageHeader is used inside the
     shell's content region (<main>), the <header> is a "generic"
     element with no implicit role — it does not compete with the
     shell's own <header role="banner">. This is the intended
     behavior: the shell owns the page banner; the PageHeader is a
     page-level header block inside the content region.

   - The <h1> provides the page's top-level heading. When the <h1> is
     present, the <header> carries aria-labelledby pointing at its
     id, so assistive technology that reaches the landmark announces
     the page title.

   - The breadcrumbs nav (from Breadcrumbs) carries aria-label from
     `breadcrumbsAriaLabel`.

   - The eyebrow is a <p> of caption-level prose — plain text, no
     role.

   - The description is a <p> of body-level prose.

   - The leading, title-trailing, actions, meta, and tabs regions are
     plain containers; their content carries its own semantics
     (buttons, badges, links, tabs, etc.).

   - No focus, no keyboard interaction, no ARIA role beyond the native
     elements.

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

/*
 * Note: BreadcrumbItem is re-exported by PageHeader's barrel for
 * consumer convenience (see index.ts). The type itself is defined in
 * Unit 9.13.
 */

/*
 * Module-level counter for auto-generated <h1> ids. Distinct prefix
 * from the ids generated by BaseInput, BaseSelect, and BaseTextarea,
 * so a document containing all four primitives never produces a
 * colliding id.
 */
let __masesPageHeaderIdCounter = 0;

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesPageHeaderWarned = new Set<string>();

function __masesPageHeaderWarnOnce(key: string, message: string): void {
  if (__masesPageHeaderWarned.has(key)) {
    return;
  }
  __masesPageHeaderWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import Breadcrumbs from '../../composites/Breadcrumbs';
import type { BreadcrumbItem } from '../../composites/Breadcrumbs';

// =============================================================================
// Public types
// =============================================================================

/**
 * The vertical density of the header.
 *
 *   'default'  — the standard rhythm.
 *   'compact'  — one token step tighter. Use for headers embedded in
 *                a Card, a Modal, or a secondary region.
 *
 * The semantic heading level (h1) is unchanged across variants.
 */
export type PageHeaderVariant = 'default' | 'compact';

// =============================================================================
// Props
// =============================================================================

interface Props {
  /**
   * The page title. Required.
   *
   * A translated string. Rendered as an <h1>. An empty string
   * suppresses the <h1> element entirely (and suppresses the
   * aria-labelledby linkage between the landmark <header> and the
   * heading).
   */
  title: string;

  /**
   * Optional eyebrow — a small caption rendered above the title.
   *
   * A translated string. Intended for a section/page trail or a
   * category label. An empty string suppresses the element.
   *
   * The eyebrow is NOT uppercased: the platform is Amharic-first
   * (Freeze §9.1), and upper-casing the Ethiopic script is not
   * meaningful.
   */
  eyebrow?: string;

  /**
   * Optional description. A translated string.
   *
   * Rendered as a <p> below the title. An empty string suppresses the
   * element.
   */
  description?: string;

  /**
   * Optional breadcrumb trail. Items are rendered by the Breadcrumbs
   * composite (Unit 9.13).
   */
  breadcrumbs?: ReadonlyArray<BreadcrumbItem>;

  /**
   * The accessible name for the breadcrumbs nav.
   *
   * Required when `breadcrumbs` is supplied. A translated string such
   * as "Breadcrumb" / "የገጽ ዱካ". When breadcrumbs are supplied
   * without this label, a deduplicated dev warning fires and the nav
   * renders with aria-label="" (visible defect).
   */
  breadcrumbsAriaLabel?: string;

  /**
   * Vertical density. Defaults to 'default'. See the exported
   * `PageHeaderVariant` type.
   */
  variant?: PageHeaderVariant;

  /**
   * When true, the header draws a bottom border and end padding,
   * visually separating it from the content below.
   *
   * A no-op when `sticky=true`: the sticky variant already draws its
   * own bottom border.
   */
  dividers?: boolean;

  /**
   * When true, the header sticks to the top of its scroll container.
   * Defaults to false.
   *
   * Sticky mode assumes this component is a direct child of the main
   * content column. See the file header comment §"Sticky mode —
   * nested-container constraint". Use `sticky=false` for PageHeaders
   * rendered inside a Card, a Modal, or any surface that is not the
   * shell's main content column.
   */
  sticky?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: undefined,
  description: undefined,
  breadcrumbs: undefined,
  breadcrumbsAriaLabel: undefined,
  variant: 'default',
  dividers: false,
  sticky: false,
});

// =============================================================================
// Slots
// =============================================================================

/**
 * Slots.
 *
 * default         — an ALIAS for `actions`. Action buttons placed
 *                   directly inside `<PageHeader>...</PageHeader>`
 *                   render in the actions region. The named
 *                   `actions` slot takes precedence when both are
 *                   supplied. Added in v1.0.1.
 * leading         — a region before the title column, for a page-
 *                   level icon or avatar. Added in v1.0.2.
 * title-trailing  — inline content after the title text, for status
 *                   badges, ID chips, and count pills. Added in
 *                   v1.0.2.
 * actions         — the canonical named slot for right-aligned
 *                   actions.
 * meta            — a full-width metadata row between the top-row
 *                   and the tabs region. Added in v1.0.2.
 * tabs            — the tab navigation for the page's sub-views.
 *                   Rendered below the meta region, above the
 *                   content.
 */
defineSlots<{
  default(): unknown;
  leading(): unknown;
  'title-trailing'(): unknown;
  actions(): unknown;
  meta(): unknown;
  tabs(): unknown;
}>();

const slots = useSlots();

// =============================================================================
// Slot detection
// =============================================================================

/*
 * `hasActionsSlot` is true when EITHER the named `actions` slot or the
 * default slot is supplied. See the file header comment §"The two
 * slot styles for the actions region".
 */
const hasActionsSlot = computed<boolean>(
  () => slots.actions !== undefined || slots.default !== undefined,
);

const hasLeadingSlot = computed<boolean>(
  () => slots.leading !== undefined,
);

const hasTitleTrailingSlot = computed<boolean>(
  () => slots['title-trailing'] !== undefined,
);

const hasMetaSlot = computed<boolean>(
  () => slots.meta !== undefined,
);

const hasTabsSlot = computed<boolean>(() => slots.tabs !== undefined);

// =============================================================================
// Development-time guards
// =============================================================================

if (
  import.meta.env.DEV &&
  props.breadcrumbs !== undefined &&
  props.breadcrumbs.length > 0 &&
  (props.breadcrumbsAriaLabel === undefined ||
    props.breadcrumbsAriaLabel.trim() === '')
) {
  __masesPageHeaderWarnOnce(
    'page-header:missing-breadcrumbs-aria-label',
    '[PageHeader] breadcrumbs are supplied but `breadcrumbsAriaLabel` ' +
      'is missing or empty. The breadcrumbs nav will render with ' +
      'aria-label="" which is an accessibility defect. Supply a ' +
      'translated string such as "Breadcrumb".',
  );
}

// =============================================================================
// Computed — content presence
// =============================================================================

const hasTitle = computed<boolean>(() => props.title.trim().length > 0);

const hasEyebrow = computed<boolean>(() => {
  const e = props.eyebrow;
  return e !== undefined && e.trim().length > 0;
});

const hasDescription = computed<boolean>(() => {
  const d = props.description;
  return d !== undefined && d.trim().length > 0;
});

const hasBreadcrumbs = computed<boolean>(
  () =>
    props.breadcrumbs !== undefined &&
    props.breadcrumbs.length > 0,
);

// =============================================================================
// Computed — id linkage
// =============================================================================

/*
 * A unique id for this instance's <h1>, generated once per component
 * instance. Only emitted to the template (and only linked via
 * aria-labelledby) when the title is non-empty.
 */
const titleId = `mases-page-header-title-${++__masesPageHeaderIdCounter}`;

// =============================================================================
// Computed — classes
// =============================================================================

const rootClasses = computed<Array<string | Record<string, boolean>>>(() => [
  'page-header',
  {
    'page-header--sticky': props.sticky,
    'page-header--compact': props.variant === 'compact',
  },
]);
</script>

<template>
  <header
    :class="rootClasses"
    :data-sticky="sticky ? 'true' : undefined"
    :data-variant="variant"
    :data-dividers="dividers ? 'true' : undefined"
    :aria-labelledby="hasTitle ? titleId : undefined"
    data-testid="page-header-root"
  >
    <!-- ==================================================================
         Breadcrumbs
         ================================================================== -->
    <div
      v-if="hasBreadcrumbs"
      class="page-header__breadcrumbs"
      data-testid="page-header-breadcrumbs"
    >
      <Breadcrumbs
        :items="breadcrumbs ?? []"
        :ariaLabel="breadcrumbsAriaLabel ?? ''"
      />
    </div>

    <!-- ==================================================================
         Top row: (leading?) title/description (actions?)
         ================================================================== -->
    <div
      class="page-header__top-row"
      data-testid="page-header-top-row"
    >
      <!-- Leading region (icon / avatar) -->
      <div
        v-if="hasLeadingSlot"
        class="page-header__leading"
        data-testid="page-header-leading"
      >
        <slot name="leading" />
      </div>

      <!-- Title column -->
      <div class="page-header__title-column">
        <!-- Eyebrow -->
        <p
          v-if="hasEyebrow"
          class="page-header__eyebrow"
          data-testid="page-header-eyebrow"
        >{{ eyebrow }}</p>

        <!-- Title row: <h1> + optional trailing content -->
        <div
          v-if="hasTitle || hasTitleTrailingSlot"
          class="page-header__title-row"
        >
          <h1
            v-if="hasTitle"
            :id="titleId"
            class="page-header__title"
            data-testid="page-header-title"
          >{{ title }}</h1>

          <div
            v-if="hasTitleTrailingSlot"
            class="page-header__title-trailing"
            data-testid="page-header-title-trailing"
          >
            <slot name="title-trailing" />
          </div>
        </div>

        <!-- Description -->
        <p
          v-if="hasDescription"
          class="page-header__description"
          data-testid="page-header-description"
        >{{ description }}</p>
      </div>

      <!-- Actions region (named `actions` slot wins; default slot is
           the fallback) -->
      <div
        v-if="hasActionsSlot"
        class="page-header__actions"
        data-testid="page-header-actions"
      >
        <slot name="actions">
          <slot />
        </slot>
      </div>
    </div>

    <!-- ==================================================================
         Meta region (full-width metadata row)
         ================================================================== -->
    <div
      v-if="hasMetaSlot"
      class="page-header__meta"
      data-testid="page-header-meta"
    >
      <slot name="meta" />
    </div>

    <!-- ==================================================================
         Tabs region
         ================================================================== -->
    <div
      v-if="hasTabsSlot"
      class="page-header__tabs"
      data-testid="page-header-tabs"
    >
      <slot name="tabs" />
    </div>
  </header>
</template>

<style scoped>
/* ============================================================================
   Header
   ---------------------------------------------------------------------------
   MOBILE BASE: mobile gap. Tablet and desktop widen at the min-width
   breakpoint below.

   COMPACT: one token step tighter at each breakpoint. See the file
   header comment §"The `variant` prop".
   ============================================================================ */
.page-header {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  width: 100%;
  font-family: inherit;
}

@media (min-width: 640px) {
  .page-header {
    gap: var(--mases-space-4);
  }
}

.page-header--compact {
  gap: var(--mases-space-2);
}

@media (min-width: 640px) {
  .page-header--compact {
    gap: var(--mases-space-3);
  }
}

/* ============================================================================
   Dividers
   ---------------------------------------------------------------------------
   When dividers=true and the header is NOT sticky, draw a bottom
   border and end padding. The sticky variant draws its own border; the
   two are mutually exclusive in effect.
   ============================================================================ */
.page-header[data-dividers='true']:not(.page-header--sticky) {
  padding-block-end: var(--mases-space-4);
  border-block-end: 1px solid var(--mases-color-border-subtle);
}

.page-header[data-dividers='true']:not(.page-header--sticky).page-header--compact {
  padding-block-end: var(--mases-space-3);
}

/* ============================================================================
   Sticky
   ---------------------------------------------------------------------------
   The header sticks to the top of its scroll container. Uses the
   design system's --mases-z-sticky token (200).

   Sticky mode assumes this component is a direct child of the main
   content column. The negative-margin/padding trick below extends the
   header's opaque background a few pixels past the header's content
   edges; inside a nested container with smaller inline padding than
   the trick's 4px, the background would pull across the container's
   interior instead of the content region's edge. Use `sticky=false`
   for PageHeaders rendered inside a Card, a Modal, or any surface
   that is not the shell's main content column.
   ============================================================================ */
.page-header--sticky {
  position: sticky;
  top: 0;
  z-index: var(--mases-z-sticky);
  background-color: var(--mases-color-surface-page);
  margin-inline: calc(var(--mases-space-1) * -1);
  padding-inline: var(--mases-space-1);
  padding-block: var(--mases-space-1);
  border-block-end: 1px solid var(--mases-color-border-subtle);
}

/* ============================================================================
   Breadcrumbs
   ============================================================================ */
.page-header__breadcrumbs {
  display: block;
}

/* ============================================================================
   Top row — leading + title column + actions
   ---------------------------------------------------------------------------
   MOBILE BASE: stacked. The title column sits above the actions, both
   full-width. Tablet and desktop switch to a horizontal row at the
   min-width breakpoint below.
   ============================================================================ */
.page-header__top-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--mases-space-3);
  flex-wrap: wrap;
}

@media (min-width: 640px) {
  .page-header__top-row {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--mases-space-4);
  }
}

.page-header--compact .page-header__top-row {
  gap: var(--mases-space-2);
}

@media (min-width: 640px) {
  .page-header--compact .page-header__top-row {
    gap: var(--mases-space-3);
  }
}

/* ============================================================================
   Leading (icon / avatar)
   ============================================================================ */
.page-header__leading {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  align-self: flex-start;
}

/* ============================================================================
   Title column
   ============================================================================ */
.page-header__title-column {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  /*
   * The title column is the primary region; the actions column
   * occupies only as much width as its content needs.
   */
  flex: 1 1 auto;
  min-width: 0;
}

/* ============================================================================
   Eyebrow
   ---------------------------------------------------------------------------
   A small caption above the title. Uses caption-level typography. NOT
   uppercased — the platform is Amharic-first.
   ============================================================================ */
.page-header__eyebrow {
  margin: 0;
  color: var(--mases-color-text-tertiary);
  font-family: inherit;
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Title row — <h1> + optional trailing
   ============================================================================ */
.page-header__title-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--mases-space-2);
  min-width: 0;
}

.page-header__title-trailing {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--mases-space-2);
  min-width: 0;
}

/* ============================================================================
   Title
   ============================================================================ */
.page-header__title {
  margin: 0;
  max-width: 40em;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-heading-3);
  line-height: var(--mases-line-height-heading-3);
  font-weight: var(--mases-font-weight-semibold);
  /*
   * Amharic truncation uses word-boundary wrapping (Design System
   * §3.7 W4). `anywhere` is a stronger fallback for pathological
   * strings (long identifiers, URLs embedded in the title); it does
   * not affect ordinary text.
   */
  overflow-wrap: anywhere;
  word-break: normal;
  /*
   * Progressive enhancement: browsers that support `text-wrap:
   * balance` produce more even line breaks on multi-line titles.
   * Unsupported browsers fall back to the default wrapping behavior.
   */
  text-wrap: balance;
}

/* ============================================================================
   Description
   ============================================================================ */
.page-header__description {
  margin: 0;
  max-width: 60em;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
  word-break: normal;
}

/* ============================================================================
   Actions
   ---------------------------------------------------------------------------
   MOBILE BASE: actions stack below the title and are left-aligned;
   `margin-inline-start` is reset so the group does not push to the
   trailing edge. Tablet and desktop restore the trailing-edge push
   at the min-width breakpoint below.
   ============================================================================ */
.page-header__actions {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2);
  flex-wrap: wrap;
  flex-shrink: 0;
  margin-inline-start: 0;
  align-self: flex-start;
}

@media (min-width: 640px) {
  .page-header__actions {
    margin-inline-start: auto;
    align-self: auto;
  }
}

/* ============================================================================
   Meta (full-width metadata row)
   ============================================================================ */
.page-header__meta {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--mases-space-3);
  width: 100%;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
}

/* ============================================================================
   Tabs region
   ============================================================================ */
.page-header__tabs {
  display: block;
  width: 100%;
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
/* No transitions in this component; nothing to disable under
   prefers-reduced-motion. The rule is intentionally omitted. */
</style>