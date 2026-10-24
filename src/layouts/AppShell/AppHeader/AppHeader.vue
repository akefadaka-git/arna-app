<!--
=============================================================================
 MASES Phase 2 UI — AppHeader
=============================================================================

 File:      mase_app/src/layouts/AppShell/AppHeader/AppHeader.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.2.0
 Status:    ENHANCEMENT — forced-colors accessibility
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.x (Layout)
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1, §22 STAGE 11

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 11, Unit 11.10).

 1.0.1  — import-path correction:
          · Primitives now imported via the '@/' alias
            ('@/components/primitives/...') instead of the prior
            relative paths ('../../primitives/...'), which resolved to
            a non-existent src/layouts/primitives/ directory.
          · No logic, template, or style change.

 1.0.2  — documentation-only PATCH (CR-DOCS1, item 1):
          · The Purpose section's reference to "the response preamble
            §'Design note — why this is a slot-based frame'" is
            replaced with an inline rationale. A "response preamble"
            is a chat-delivery artifact, not a document in the
            repository; the reference had no navigable target for a
            reader opening the source.
          · The inline rationale states:
              – why the frame is slot-based rather than prop-driven;
              – which controls AppShell composes into each slot;
              – where a future maintainer can find the current set of
                composed controls (AppShell.vue §"Composition").
          · A new §"Ownership" section documents the boundary between
            what this file owns and what consumers of the slot supply.
            It has no runtime consequence; it exists so a future
            reader can determine at a glance whether a proposed change
            belongs in this file or in a consumer of it.
          · No code lines changed. Script, template, and scoped
            styles are byte-for-byte identical to v1.0.1.
          · No consumer of AppHeader is affected. AppShell.vue
            v1.0.4, AuthenticatedLayout.vue v1.0.3, and
            PortalLayout.vue v1.1.0 continue to bind the same slots
            with the same content and receive identical DOM output.


 1.0.3  — accessible mobile-menu affordance:
          · The default mobile-menu button now declares
            aria-haspopup="dialog", indicating that activation opens
            the shell's native dialog drawer.
          · This is an additive accessibility hint; props, slots,
            emitted events, layout, and consumer contracts are unchanged.

 1.1.0  — ARNA brand palette alignment:
          · Header uses the semantic raised-surface role to establish
            a clear layer above the page canvas.
          · The lower divider uses the brand-border role and a slim
            gold top accent reinforces the ARNA palette without
            hardcoding colors.
          · Existing header dimensions, breakpoints, slots, props,
            events, and z-index behavior are unchanged.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The MASES AppShell header bar. Renders a sticky chrome frame with
 three horizontal regions:

   [brand]   [nav]   [actions]

 plus an optional mobile-menu toggle that is visible only at <640px.

 This is a FRAME. Every visible control in the header — the brand
 mark, the breadcrumbs, the notifications bell, the tenant switcher,
 the user menu, and any future control — is supplied by AppShell
 into one of this component's slots. AppHeader itself renders no
 store-driven content, no route-aware navigation, and no
 user-identity affordance.

 -----------------------------------------------------------------------------
 Why this file is slot-based, not prop-driven
 -----------------------------------------------------------------------------
 The design decision is deliberate, and it has three consequences
 that a future maintainer should understand before proposing a prop
 for any of the slot contents.

   1. THIS FILE'S DEPENDENCY SURFACE STAYS SMALL.
      The controls AppShell composes into the header today — the
      notifications bell, the tenant switcher, the user menu, the
      brand mark, and the eventual breadcrumbs — each depend on a
      store, the router, or per-page context that belongs to the
      consumer, not to a generic header. If AppHeader accepted a prop
      per control, this file would have to import each control's type
      (and, for anything more than a boolean, each control's data
      shape). That would couple the frame to every store the shell
      touches, and would make the frame impossible to reuse for a
      second product variant whose controls differ.

   2. THE FRAME STAYS GENERIC.
      AppHeader is imported by AppShell. AppShell is imported by both
      AuthenticatedLayout and PortalLayout — and will be imported by
      any future shell that wants the same chrome. A prop-driven
      design would force every shell to route its controls through
      the same interface; a slot-driven design lets each consumer
      compose whatever controls it has, and the frame forwards them.

   3. THE CONSUMER OWNS COMPOSITION.
      The header's visual output — which control sits where, what the
      bell shows, whether the tenant switcher renders for a given
      caller — is a composition decision. Composition belongs to the
      shell, not to the frame. This file decides the three-region
      skeleton; the shell decides what fills it. The current fill is
      documented in AppShell.vue's §"Composition": MASESBrand into
      #brand, breadcrumbs into #nav, and the notifications bell +
      tenant switcher + user menu into #actions. A future revision
      of that composition (reordering, adding a language selector)
      changes AppShell, not this file.

 The same reasoning applies to AppShell's own #brand, #breadcrumbs,
 #header-actions, and #footer regions: every one of them is a slot,
 and every one of them exists so that the shell's frame files stay
 layout primitives rather than aggregators of their consumers'
 dependencies.

 -----------------------------------------------------------------------------
 Ownership
 -----------------------------------------------------------------------------
 This file owns:
   · The <header role="banner"> element and its landmark semantics.
   · The three-region skeleton ([brand] [nav] [actions]) and its
     responsive behaviour (mobile-first, single column of regions
     resolved into a flex row at 640px and up).
   · The mobile-menu toggle's visibility rules (present when either
     a label or an override slot is supplied; hidden on desktop via
     CSS, so it does not enter the tab order there).
   · The sticky/relative variant, selected by the `sticky` prop, and
     the z-index token that variant consumes.
   · The optional default mobile-menu toggle, which composes
     BaseButton and BaseIcon rather than reimplementing either.
   · The scoped CSS that expresses the above.

 This file does NOT own:
   · Any user-facing string except the default toggle's aria-label,
     which is consumer-supplied via the `mobileMenuLabel` prop.
   · Any store reads, route reads, or user-identity affordances.
   · The decision of which controls render in each region. That is
     AppShell's composition decision (see its §"Composition").
   · The brand mark. When AppShell supplies MASESBrand into #brand,
     that component owns the brand strings; this file forwards
     whatever #brand receives.
   · Any navigation behaviour. A slot-rendered control that navigates
     (a RouterLink breadcrumb, a user-menu action) owns its own
     navigation; this file does not intercept it.

 A proposed change to this file should be evaluated against the
 ownership list above: if the change would add a store read, a route
 read, a user-facing string, or a composition decision, it belongs in
 AppShell (or in a consumer of AppShell), not here.

 -----------------------------------------------------------------------------
 z-index constraint (from Unit 11.1)
 -----------------------------------------------------------------------------
 Uses --mases-z-raised (10). Must be at or below that token so the
 SkipToContent link (--mases-z-sticky, 200) renders above the header
 when focused.

 The constraint is stated here because the header is the most likely
 surface for a future contributor to raise a z-index — a "the dropdown
 is behind the header" report, for example, that gets fixed by
 bumping this file's value instead of the dropdown's. Raising the
 header above --mases-z-sticky would break the skip link's visibility
 for keyboard users, which is a WCAG 2.4.1 concern. If a specific
 component needs to render above the header, that component's
 z-index token is the correct place to change.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   BaseButton (Unit 8.2)  — the default mobile-menu toggle
   BaseIcon   (Unit 8.19) — the toggle's hamburger glyph

 Does not reimplement either primitive.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The only user-facing string this component renders is the default
 toggle's aria-label, sourced from `mobileMenuLabel`. Every other
 visible string is slot content supplied by the consumer.

 The values `'menu'` (the BaseIcon name) and `'ghost'` / `'sm'` (the
 BaseButton variants) are not user-facing strings; they are component
 API identifiers.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, align-items,
 gap via tokens, padding via tokens, height via a token, position,
 flex-shrink, min-width, border-block-end width).

 No hex value appears in this file.

 The inline padding consumes --mases-shell-chrome-padding-inline-*,
 the shared chrome rhythm also used by AppFooter and SkipToContent
 (tokens.css v1.2.0 §"Shell chrome inline padding"). Selecting the
 mobile or tablet variant of that token pair is this file's choice;
 the values themselves are the token layer's.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="app-header-root"            on the <header>
 data-testid="app-header-mobile-toggle"   on the default toggle (only
                                          when the default branch is
                                          rendered — see §"Mobile
                                          toggle — a note on the
                                          override path" below)
 data-testid="app-header-brand"           on the brand region wrapper
 data-testid="app-header-nav"             on the nav region wrapper
 data-testid="app-header-actions"         on the actions region wrapper

 The <header> carries:
   data-sticky="true"  (present only when sticky is true)

 -----------------------------------------------------------------------------
 Mobile toggle — a note on the override path
 -----------------------------------------------------------------------------
 The toggle region renders when either (a) the consumer supplies a
 #mobile-menu-trigger slot, or (b) the consumer supplies a non-empty
 mobileMenuLabel prop. In case (a) the slot content wins and the
 default BaseButton is not rendered; in case (b) the default renders
 with the supplied label as its aria-label.

 When the override path is taken, the `data-testid="app-header-
 mobile-toggle"` hook is not present in the DOM, because the hook is
 bound on the default BaseButton. A test that asserts on the toggle's
 presence should therefore either assert on the outer
 `.app-header__mobile-toggle` wrapper (which is rendered in both
 cases) or supply a mobileMenuLabel and rely on the default branch.

 The alternative — moving the testid to the wrapper — was considered
 and rejected: it would change the hook's semantics from "the toggle
 button" to "the toggle's container", which is a different surface to
 test against and would confuse the reading of an existing test that
 expects a button element at that selector.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - <header role="banner"> — the page's banner landmark, set
     explicitly so it survives AppShell's wrapper element. HTML5's
     spec assigns an implicit banner role to a top-level <header>,
     but the implicit role is scoped to the element's ancestry and
     would be lost if the header were ever nested inside a <main> or
     an <article>. Setting the role explicitly decouples the
     landmark from that ancestry rule and makes the intent visible.
   - Consumers MUST NOT nest this component inside another banner
     landmark. A page has exactly one banner; a second header element
     in the same page would create a second one, and screen readers
     would announce both. If a feature page needs a header-like
     region (a card header, a section header), it uses a plain
     <header> without the role, or a <div>.
   - The default mobile toggle uses BaseButton with an explicit
     aria-label from mobileMenuLabel. The hamburger glyph inside it
     is decorative — BaseIcon defaults to aria-hidden="true" when no
     ariaLabel is supplied, which is the correct behaviour here
     because the button element already carries the accessible name.
   - The mobile toggle is hidden on desktop via CSS (display: none),
     so it does not appear in the tab order on desktop. A screen
     reader running on a desktop viewport does not encounter it.
   - The `brand`, `nav`, and `actions` regions carry no ARIA attributes
     of their own — their slot content owns its own semantics. A
     control that navigates is a RouterLink and is announced as a
     link; the user menu's trigger is a button with its own
     aria-label; a future breadcrumbs component placed into #nav
     would carry its own <nav> semantics. This file does not, and
     should not, apply an aria-label to any of the regions.
   - Reduced motion: this file defines no animation. A defensive
     no-op block is kept so a future revision that adds a transition
     has a documented place to gate it on the user's motion
     preference.
=============================================================================
-->

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import BaseButton from '@/components/primitives/BaseButton';
import BaseIcon from '@/components/primitives/BaseIcon';

interface Props {
  /**
   * Whether the header sticks to the top of the viewport when the page
   * scrolls. Defaults to true.
   *
   * When false, the header is position: relative and scrolls with the
   * content. Useful for shells that place the header inside a
   * fixed-height grid layout where only <main> scrolls.
   *
   * The sticky variant consumes --mases-z-raised (10). See the file
   * header §"z-index constraint" before changing this value's
   * companion token.
   */
  sticky?: boolean;

  /**
   * The aria-label for the default mobile-menu toggle. When supplied
   * and non-empty, the default toggle is rendered. When omitted, no
   * default toggle is rendered — but a `mobile-menu-trigger` slot can
   * still provide one.
   *
   * Consumer-supplied, translated. An empty or whitespace-only string
   * is treated the same as an omitted value: the default toggle does
   * not render, because a button without an accessible name is a
   * worse outcome than no button at all. See `hasLabel` below for the
   * precise predicate.
   */
  mobileMenuLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  sticky: true,
  mobileMenuLabel: undefined,
});

const emit = defineEmits<{
  /**
   * Fires when the user activates the mobile-menu toggle. The
   * consumer (AppShell) opens the drawer in response.
   *
   * Fires only from the default toggle. A consumer that supplies its
   * own #mobile-menu-trigger slot owns its own click handling and
   * should emit this event from its own component to reach AppShell.
   */
  (event: 'open-mobile-menu'): void;
}>();

/**
 * Slots.
 *
 * brand                 — the brand/logo region (left). Typically the
 *                         MASESBrand component; AppShell supplies it
 *                         as the fallback content when no consumer
 *                         overrides the slot.
 * nav                   — the navigation region (center). Typically
 *                         breadcrumbs; currently unpopulated in the
 *                         MASES shell (see shell-labels.ts §"Future
 *                         hooks — breadcrumbs aria label").
 * actions               — the actions region (right). AppShell
 *                         composes the notifications bell, the
 *                         tenant switcher, and the user menu into
 *                         this slot.
 * mobile-menu-trigger   — override for the default mobile toggle;
 *                         when supplied, the default is not rendered.
 *                         See the file header §"Mobile toggle — a
 *                         note on the override path" for the
 *                         consequence on the data-testid hook.
 */
defineSlots<{
  brand?(): unknown;
  nav?(): unknown;
  actions?(): unknown;
  'mobile-menu-trigger'?(): unknown;
}>();

const slots = useSlots();

// -----------------------------------------------------------------------------
// Toggle visibility
// -----------------------------------------------------------------------------

/**
 * Whether a consumer-supplied override for the mobile toggle is
 * present. Vue's `useSlots()` returns a record whose keys exist only
 * for the slots that were actually passed; a slot that was declared
 * in `defineSlots` but not supplied by the consumer is `undefined`.
 */
const hasToggleSlot = computed<boolean>(
  () => slots['mobile-menu-trigger'] !== undefined,
);

/**
 * Whether a usable `mobileMenuLabel` was supplied.
 *
 * The predicate is `!== undefined && trim() !== ''` rather than a
 * simple truthiness check because a whitespace-only string would
 * produce a button with a visually-blank aria-label — a state that
 * fails a screen reader's accessible-name computation and would be
 * caught by an axe scan on the rendered page. Rejecting whitespace
 * here means the default toggle simply does not render in that case,
 * which is the more graceful failure.
 */
const hasLabel = computed<boolean>(() => {
  const l = props.mobileMenuLabel;
  return l !== undefined && l.trim() !== '';
});

/*
 * The toggle region renders when EITHER a consumer-supplied override
 * is present OR a usable label is provided for the default toggle.
 * The two cases are mutually exclusive in effect: when the override
 * slot is present, the slot wins (see the template's <slot> fallback
 * below), and `hasLabel` is not consulted for rendering decisions.
 *
 * The computed exists as a single source of truth for the outer
 * wrapper's v-if, so the wrapper's presence cannot disagree with the
 * template's internal slot fallback. Without it, a reader would have
 * to trace both branches to determine when the wrapper renders.
 */
const showToggle = computed<boolean>(
  () => hasToggleSlot.value || hasLabel.value,
);

// -----------------------------------------------------------------------------
// Event forwarding
// -----------------------------------------------------------------------------
/**
 * Forward the default toggle's click as the component's
 * `open-mobile-menu` emit. The consumer (AppShell) reacts by opening
 * the mobile drawer.
 *
 * The handler is intentionally a one-line forwarder — it performs no
 * state mutation, no store write, and no navigation. All of that is
 * the consumer's responsibility. Keeping it thin here means a future
 * consumer that wants different toggle behaviour (a route-aware
 * toggle, an analytics hook) can either supply its own
 * #mobile-menu-trigger slot or wrap this component; it does not have
 * to modify this file.
 */
function onToggleClick(): void {
  emit('open-mobile-menu');
}
</script>

<template>
  <header
    class="app-header"
    role="banner"
    :data-sticky="sticky ? 'true' : undefined"
    data-testid="app-header-root"
  >
    <!-- ============================================================
         Mobile menu toggle

         Rendered only when the consumer has signalled — by supplying
         a non-empty mobileMenuLabel, or by supplying a
         #mobile-menu-trigger slot — that it wants a toggle present.
         An unconfigured AppHeader renders no toggle; the region is
         omitted from the DOM entirely rather than rendered empty.
         ============================================================ -->
    <div
      v-if="showToggle"
      class="app-header__mobile-toggle"
    >
      <slot name="mobile-menu-trigger">
        <BaseButton
          variant="ghost"
          size="sm"
          :aria-label="mobileMenuLabel"
          aria-haspopup="dialog"
          data-testid="app-header-mobile-toggle"
          @click="onToggleClick"
        >
          <BaseIcon name="menu" size="md" />
        </BaseButton>
      </slot>
    </div>

    <!-- ============================================================
         Brand region

         Left-anchored, does not shrink. AppShell supplies MASESBrand
         as its fallback content; a consumer of AppShell that wants a
         different brand supplies its own #brand and this region
         receives that instead. See the file header §"Ownership" for
         what this region does and does not own.
         ============================================================ -->
    <div
      class="app-header__brand"
      data-testid="app-header-brand"
    >
      <slot name="brand" />
    </div>

    <!-- ============================================================
         Navigation region

         Center-anchored, absorbs free space, shrinks under pressure.
         The flex rules on this region are the reason a long
         breadcrumb trail or a wide tenant name does not push the
         actions region off the trailing edge — see the scoped style
         block below for the specific properties and their reasoning.
         ============================================================ -->
    <div
      class="app-header__nav"
      data-testid="app-header-nav"
    >
      <slot name="nav" />
    </div>

    <!-- ============================================================
         Actions region

         Right-anchored, does not shrink. AppShell composes the
         notifications bell (disabled until §20.2 endpoints exist),
         the tenant switcher, and the user menu here. A future
         language selector would be added between the tenant switcher
         and the user menu — see AppShell.vue §"Composition" for the
         current set and its ordering.
         ============================================================ -->
    <div
      class="app-header__actions"
      data-testid="app-header-actions"
    >
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
/* ============================================================================
   Root <header>
   ---------------------------------------------------------------------------
   MOBILE BASE: a horizontal flex row with mobile gap and the shared
   shell-chrome inline padding. The nav region absorbs free space so
   the actions region is pushed to the trailing edge.

   TABLET AND UP: the gap widens and the inline padding increases at
   the min-width breakpoint below, matching the wider spacing rhythm
   of --mases-shell-chrome-padding-inline-tablet. The header does not
   reflow its regions — it stays a single row at every viewport; the
   mobile drawer, not a wrapped header, is how MASES handles the
   mobile navigation surface.

   The inline padding consumes --mases-shell-chrome-padding-inline-*,
   the shared chrome rhythm used by AppFooter and SkipToContent. See
   tokens.css v1.2.0 for the value provenance; the header widens by
   one spacing step on desktop relative to its own pre-1.2.0 value as
   part of that extraction.
   ============================================================================ */
.app-header {
  display: flex;
  align-items: center;
  gap: var(--mases-space-2);
  width: 100%;
  height: var(--mases-shell-header-height);
  padding-inline: var(--mases-shell-chrome-padding-inline-mobile);
  /*
   * A single subtle rule separates the header from the content below.
   * Matches the rule treatment used by MaintenanceBanner (Unit 11.3).
   * The rule is drawn on the header, not as a border on the content,
   * so a page whose content begins without a border still gets a
   * clean transition under the header.
   */
  border-block-start: 3px solid var(--mases-color-gold-500);
  border-block-end: 1px solid var(--mases-color-border-brand);
  background-color: var(--mases-color-surface-raised);
  color: var(--mases-color-text-primary);
  font-family: inherit;
}

/* Tablet and up: the wider desktop chrome rhythm. */
@media (min-width: 640px) {
  .app-header {
    gap: var(--mases-space-4);
    padding-inline: var(--mases-shell-chrome-padding-inline-tablet);
  }
}

/* ---------------------------------------------------------------------------
   Sticky variant
   ---------------------------------------------------------------------------
   Uses --mases-z-raised (10) — see the file header §"z-index
   constraint". The value must remain at or below this token so the
   SkipToContent link (--mases-z-sticky, 200) renders above the header
   when focused. Raising it above --mases-z-sticky would put the header
   above the skip link and hide the link from keyboard users, which is
   a WCAG 2.4.1 concern.

   The `position: sticky; top: 0` combination with a fixed height
   makes the header occupy exactly its own height in the normal flow
   and then remain pinned during scroll. The sibling <main> in
   AppShell is unaffected — it flows underneath as if the header were
   not sticky, which is the correct behaviour for a two-dimensional
   scroll model.
   --------------------------------------------------------------------------- */
.app-header[data-sticky='true'] {
  position: sticky;
  top: 0;
  z-index: var(--mases-z-raised);
}

/* ============================================================================
   Regions
   ============================================================================ */

/* ---------------------------------------------------------------------------
   Mobile toggle
   ---------------------------------------------------------------------------
   Visible on mobile, hidden on desktop. `display: none` at the
   tablet-and-up breakpoint removes the button from the tab order —
   the alternative (visibility: hidden) would keep it focusable and
   produce a keyboard trap-like effect where Tab lands on an
   invisible element.
   --------------------------------------------------------------------------- */
.app-header__mobile-toggle {
  display: inline-flex;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .app-header__mobile-toggle {
    display: none;
  }
}

/* ---------------------------------------------------------------------------
   Brand region
   ---------------------------------------------------------------------------
   Left-anchored. `flex-shrink: 0` reserves the brand's intrinsic
   width so a long nav or a wide actions cluster cannot squeeze it;
   `min-width: 0` is retained as a defensive declaration in case a
   future revision changes the shrink policy. At current MASES brand
   widths the region fits within the mobile budget without overflow;
   the smoke test at 375px and 320px confirmed this.
   --------------------------------------------------------------------------- */
.app-header__brand {
  display: flex;
  align-items: center;
  gap: var(--mases-space-2);
  flex-shrink: 0;
  min-width: 0;
}

/* ---------------------------------------------------------------------------
   Nav region
   ---------------------------------------------------------------------------
   Center-anchored, the only region that absorbs free space.
   `flex: 1 1 auto` lets it grow to fill the space between the brand
   and the actions cluster; `min-width: 0` is load-bearing — without
   it, a long unbreakable child (a wide tenant name, a full breadcrumb
   trail) forces horizontal overflow of the entire header, which is
   the classic flexbox min-content trap. `overflow: hidden` clips
   anything that still exceeds the region's box after shrinking; the
   alternative (letting it overflow visibly) would paint slot content
   over the actions cluster.
   --------------------------------------------------------------------------- */
.app-header__nav {
  display: flex;
  align-items: center;
  gap: var(--mases-space-2);
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

/* ---------------------------------------------------------------------------
   Actions region
   ---------------------------------------------------------------------------
   Right-anchored, does not shrink. The three current controls
   (notifications bell, tenant switcher, user menu) each reserve
   their own intrinsic width, so the cluster's width is the sum of
   those plus two gaps. `flex-shrink: 0` keeps the cluster at its
   natural size and forces the nav region to yield instead — the
   correct priority order for chrome: identity and actions are fixed,
   navigation is elastic.
   --------------------------------------------------------------------------- */
.app-header__actions {
  display: flex;
  align-items: center;
  gap: var(--mases-space-2);
  flex-shrink: 0;
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   No animation is defined in this file. A defensive no-op block is
   kept, matching the convention in AppFooter.vue, SkipToContent.vue,
   and AppShell.vue, so a future revision that adds a transition has a
   documented place to gate it on the user's motion preference.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .app-header {
    /* no-op placeholder — see comment above */
  }
}
/* ============================================================================
   Windows High Contrast / forced-colors
   ---------------------------------------------------------------------------
   Retain a clear header boundary and legible text when brand tokens are
   overridden by the user's operating-system contrast settings.
   ============================================================================ */
@media (forced-colors: active) {
  .app-header {
    color: CanvasText;
    border-block-start-color: Highlight;
    border-block-end-color: CanvasText;
  }
}

</style>