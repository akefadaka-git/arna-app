<!--
=============================================================================
 MASES Phase 2 UI — MASESFooterContent
=============================================================================

 File:      mase_app/src/layouts/AppShell/MASESFooterContent/MASESFooterContent.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.1.0
 Status:    ENHANCEMENT — forced-colors accessibility
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.x (Layout)
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1
            CR-FOOTER1 (this delivery)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (CR-FOOTER1). Renders the copyright line
          (with the current Ethiopian calendar year substituted at
          render time) and the footer's link row (legal hub + support
          mailto). Consumes `masesFooterLabels` from
          @/router/shell-labels (the companion change in the same CR).
          Rendered by AppShell as the default content of the `#footer`
          forwarding slot; a consumer of AppShell may override it.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The shell footer's content composition. Renders:

   · The copyright line — a corporate-approved template with the
     current Ethiopian calendar year substituted into the {year}
     placeholder.
   · A row of links: the Legal Center hub (internal, via RouterLink)
     and the support mailto address (external, via a plain <a>).

 The component is deliberately a composition, not a frame. It does
 not draw its own borders, set its own background, or manage its own
 vertical rhythm — the surrounding AppFooter owns all of that. This
 file contributes only what is inside the footer's middle region.

 -----------------------------------------------------------------------------
 What this component does NOT do
 -----------------------------------------------------------------------------
   - It does NOT render the corporate brand mark. The header's
     MASESBrand component carries the brand; the footer's copyright
     line names the entity in text. Repeating the two-line wordmark
     here would be visual noise for an authenticated application
     whose header already establishes identity. A future CR may
     revisit this if a design review asks for it.
   - It does NOT render social links. BaseIcon (v2.0.0) carries only
     Lucide generic icons — Lucide does not ship brand logos — so
     icon-based social links require a new BrandIcon primitive first.
     Text-only social links are possible but the official URLs and
     the Amharic label forms are not yet confirmed. Both are deferred
     to a future CR. See the CR-FOOTER1 block in shell-labels.ts for
     the full rationale.
   - It does NOT render the version string. AppFooter's `version`
     prop already renders it in the footer's end region; the layout
     passes the value through AppShell. See §"Version — why this
     component does not render it" below.
   - It does NOT accept props, emit events, or provide slots. The
     content is fixed; the layout is fixed; the strings come from
     shell-labels.ts. A future variation (a configurable link list,
     a compact variant) is a separate CR.
   - It does NOT navigate programmatically. The legal link is a
     RouterLink; the support link is a mailto; both are declarative.

 -----------------------------------------------------------------------------
 Version — why this component does not render it
 -----------------------------------------------------------------------------
 The version string is a placeholder today ('v0.1.0') and a build-
 time injected value is a future CR unrelated to footer content (see
 AuthenticatedLayout.vue and PortalLayout.vue §"Outstanding items").
 Until that CR lands, the version lives with the layouts and flows
 through AppShell's `footerVersion` prop to AppFooter's `version`
 region at the footer's far right.

 When the version becomes build-time metadata, the decision to move
 it into this component (so that the entire footer content is in one
 place) or leave it as an AppFooter prop (so that the frame owns the
 version and this composition owns the content) is deferred to that
 CR. For now, the split is: AppFooter renders the version; this
 component renders copyright + links.

 -----------------------------------------------------------------------------
 Copyright year computation
 -----------------------------------------------------------------------------
 The copyright template carries a {year} placeholder rather than a
 hard-coded current year. This component substitutes the current
 Ethiopian calendar year at render time via
 `Intl.DateTimeFormat('en-US-u-ca-ethiopic', { year: 'numeric' })`.

 The substitution is not reactive. The page open duration of a single
 session is hours at most; a year rollover mid-session is a
 hypothetical that does not warrant a timer. A full page reload
 recomputes the value, which is sufficient.

 Fallback if `Intl` refuses the ethiopic calendar extension: the
 current Gregorian year is used instead. It is not the correct value,
 but it is a real year rather than a blank, and the failure is
 silent — logging in a shell component for a rare degradation is
 more noise than signal. A comment on the fallback branch records the
 intent.

 -----------------------------------------------------------------------------
 External vs. internal links — security posture
 -----------------------------------------------------------------------------
 Two links are rendered, and their security postures differ by design:

   · Legal (/legal) — INTERNAL, same origin, same tab.
     Rendered as <RouterLink>. Vue Router performs an in-SPA
     navigation; the browser does not open a new tab; no `target`
     or `rel` attributes apply. The route exists (routes-base.ts
     v1.2.0, name 'legal', path '/legal') and is public — it carries
     no `meta.requiresAuth`, `meta.permission`, or `meta.guestOnly`.

   · Support (mailto:support@maalearna.com.et) — EXTERNAL, mail
     client, no web navigation.
     Rendered as a plain <a> with an `href` beginning "mailto:".
     `target="_blank"` is deliberately NOT set — the mailto scheme
     hands off to the OS-configured mail client on most platforms,
     and forcing a blank tab would produce a visible phantom tab on
     UAs that treat mailto as a navigation. `rel="noopener
     noreferrer"` does not apply to non-HTTP schemes.

 When the footer gains social links (a future CR), those WILL be
 HTTP(S) external links and will carry
 `target="_blank" rel="noopener noreferrer"`. The pattern is
 documented here so the future CR does not have to rediscover it.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Both visible strings come from `masesFooterLabels` in
 @/router/shell-labels:
   · The copyright line (template → substituted string).
   · The legal and support link labels.

 The mailto address is not user-facing text; it is topology, and it
 lives in this file's `SUPPORT_EMAIL` const. The same convention
 PortalLayout.vue establishes for `WORKSPACE_URL`.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css (v1.2.0):

     Color ........ --mases-color-text-tertiary
                     --mases-color-action-link
                     --mases-color-action-link-hover
     Spacing ...... --mases-space-2
                     --mases-space-4
     Type ......... --mases-font-size-caption
                     --mases-line-height-caption

 No hex value appears in this file. No new token is declared.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="mases-footer-content-root"        on the root <div>
 data-testid="mases-footer-content-copyright"   on the copyright <span>
 data-testid="mases-footer-content-links"       on the links <ul>
 data-testid="mases-footer-content-legal-link"  on the legal <a>
 data-testid="mases-footer-content-support-link" on the support <a>

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
   · The root is a <div>. No landmark role — the enclosing <footer
     role="contentinfo"> already provides the contentinfo landmark,
     and a nested landmark would be redundant.
   · The link group is a <ul role="list">. The explicit role
     preserves list semantics even when `list-style: none` removes
     the visual marker; without it, some screen readers stop
     announcing the group as a list.
   · Each link's accessible name is its visible text. Neither link
     is icon-only, so no aria-label is required.
   · Focus states are delegated to the browser and to the global
     focus-ring rules in tokens.css. The hover state (underline +
     color shift) is duplicated on `:focus-visible` for keyboard
     parity.
   · The copyright text is plain text, no role, no heading level —
     footer attribution is not a heading.
=============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import { masesFooterLabels } from '@/router/shell-labels';
import { formatCalendarDate } from '@/core/dates/calendar';

// -----------------------------------------------------------------------------
// Support destination
// -----------------------------------------------------------------------------
/*
 * The support contact address. Carried here, not in shell-labels.ts —
 * addresses and URLs are topology, not user-facing labels. Matches the
 * convention PortalLayout.vue establishes for `WORKSPACE_URL`.
 *
 * A future CR that establishes an in-app support route (a `/support`
 * page) would change this to a route target and the anchor below to a
 * RouterLink. The label string in shell-labels.ts ('ድጋፍ') is unchanged
 * by that migration.
 */
const SUPPORT_EMAIL = 'support@maalearna.com.et';

// -----------------------------------------------------------------------------
// Copyright year — Ethiopian calendar
// -----------------------------------------------------------------------------
/**
 * Return the current year in the Ethiopian calendar as a string of
 * ASCII digits (e.g. "2019"), or fall back to the Gregorian year if
 * the ethiopic calendar extension is unavailable in the current
 * `Intl` implementation.
 *
 * The fallback is not silent by accident — it is deliberate. This is
 * a shell component; failing to log a rare degradation is preferable
 * to spamming the console on every render of the footer. The value
 * remains a real year, and the string remains readable.
 */
function resolveCurrentCalendarYear(): string {
  return formatCalendarDate(new Date(), { year: 'numeric' });
}

/**
 * The copyright line with the {year} placeholder substituted.
 *
 * Computed once at setup. The value does not change reactively — a
 * year rollover mid-session would require a page reload to pick up,
 * which is acceptable for a footer attribution line.
 */
const copyrightText = computed(() => masesFooterLabels.copyrightTemplate.replace(
  '{year}',
  resolveCurrentCalendarYear(),
));
</script>

<template>
  <div
    class="mases-footer-content"
    data-testid="mases-footer-content-root"
  >
    <!-- ================================================================
         Copyright line
         ================================================================ -->
    <span
      class="mases-footer-content__copyright"
      data-testid="mases-footer-content-copyright"
    >{{ copyrightText }}</span>

    <!-- ================================================================
         Link row

         A <ul role="list"> rather than a bare set of <a> elements.
         The explicit role preserves list semantics when
         `list-style: none` removes the visual marker.

         Each link is a <li> child. The legal link is a RouterLink
         (in-SPA navigation); the support link is a plain <a> with a
         mailto href.
         ================================================================ -->
    <ul
      class="mases-footer-content__links"
      role="list"
      data-testid="mases-footer-content-links"
    >
      <li>
        <RouterLink
          :to="{ name: 'legal' }"
          class="mases-footer-content__link"
          data-testid="mases-footer-content-legal-link"
        >{{ masesFooterLabels.legalLinkLabel }}</RouterLink>
      </li>
      <li>
        <a
          :href="`mailto:${SUPPORT_EMAIL}`"
          class="mases-footer-content__link"
          data-testid="mases-footer-content-support-link"
        >{{ masesFooterLabels.supportLinkLabel }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ---------------------------------------------------------------------------
   MOBILE BASE: a vertical stack. The copyright sits above the links,
   both flush-left. This is the standard mobile footer order — the
   attribution line first, actionable links below it.

   TABLET AND UP: a horizontal row. The copyright goes to the left
   edge, the links to the right edge, with the remaining space
   between them. This matches the reading order of a wide footer
   (attribution — links — version) without needing AppFooter's own
   three-region machinery for this composition.

   `width: 100%` lets the component fill AppFooter's middle region
   regardless of how that region sizes itself (it uses
   `flex: 0 0 auto` at mobile and `flex: 1 1 auto` at tablet+). The
   explicit width guarantees the same layout behaviour in both cases.
   ============================================================================ */
.mases-footer-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--mases-space-2);
  width: 100%;
  min-width: 0;
}

@media (min-width: 640px) {
  .mases-footer-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: var(--mases-space-4);
  }
}

/* ============================================================================
   Copyright
   ---------------------------------------------------------------------------
   Tertiary text — deliberately recessive. The copyright is attribution,
   not a call to action; it should recede in the visual hierarchy.

   `min-width: 0` allows the text to shrink and wrap rather than push
   the link row off the row. `overflow-wrap: break-word` handles the
   Amharic-word-with-punctuation case where a single long word (the
   corporate name with its trailing Ethiopic full stop) would
   otherwise overflow a narrow container.
   ============================================================================ */
.mases-footer-content__copyright {
  min-width: 0;
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: break-word;
}

/* ============================================================================
   Links
   ---------------------------------------------------------------------------
   A horizontal row of links, wrapping to a second line if the
   container is too narrow for both. The gap uses the layout scale:
   space-2 between links (8px) and space-4 between the two rows of
   links if they wrap (16px).

   `flex-shrink: 0` prevents the link row from being compressed when
   the copyright text is long. The copyright shrinks instead (via its
   own `min-width: 0`), keeping the link text fully readable.
   ============================================================================ */
.mases-footer-content__links {
  display: flex;
  flex-wrap: wrap;
  flex-shrink: 0;
  gap: var(--mases-space-2) var(--mases-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ============================================================================
   Individual link
   ---------------------------------------------------------------------------
   Link-colored (crimson). Underline is off by default and applied on
   hover and keyboard focus — matching the AppFooter family's
   restraint, and matching the design system's convention that
   inline links in chrome are not persistently underlined.

   The :focus-visible selector duplicates the hover state so keyboard
   users get the same affordance.
   ============================================================================ */
.mases-footer-content__link {
  color: var(--mases-color-action-link);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  text-decoration: none;
}

.mases-footer-content__link:hover,
.mases-footer-content__link:focus-visible {
  color: var(--mases-color-action-link-hover);
  text-decoration: underline;
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   No animation is defined in this file. A defensive no-op block is
   kept, matching the convention in AppHeader.vue, AppFooter.vue, and
   AppShell.vue, so a future revision that adds a transition has a
   documented place to gate it on the user's motion preference.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .mases-footer-content {
    /* no-op placeholder — see comment above */
  }
}
/* ============================================================================
   Windows High Contrast / forced-colors
   ---------------------------------------------------------------------------
   Preserve clear link affordances when authored palette tokens are suppressed.
   ============================================================================ */
@media (forced-colors: active) {
  .mases-footer-content__copyright {
    color: CanvasText;
  }

  .mases-footer-content__link {
    color: LinkText;
    text-decoration: underline;
  }

  .mases-footer-content__link:hover,
  .mases-footer-content__link:focus-visible {
    color: ActiveText;
  }
}

</style>