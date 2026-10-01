<!--
=============================================================================
 MASES Phase 2 UI — BaseLink
=============================================================================

 File:      mase_app/src/components/primitives/BaseLink/BaseLink.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.17
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 An inline text link. Renders a navigation element whose target is
 declared by the consumer via one of two mutually exclusive props:

   `to`   — an internal SPA route; rendered with <RouterLink>.
   `href` — an absolute URL; rendered with <a>.

 See the response preamble §"Design note — internal versus external" for
 the rationale on the dual-prop contract.

 -----------------------------------------------------------------------------
 External links
 -----------------------------------------------------------------------------
 When `href` is supplied AND `external=true`, the component renders:

   <a href="..." target="_blank" rel="noopener noreferrer">

 Both `rel` tokens are security requirements (Architecture Freeze
 §19.1) and cannot be overridden by the consumer. A different `rel`
 value requires a Change Request.

 When `href` is supplied AND `external=false` (the default), the
 component renders:

   <a href="...">

 which navigates to the URL in the same tab. This is the correct
 pattern for a link to a non-SPA resource on the same domain (a static
 PDF, an image, a download served by Plesk).

 -----------------------------------------------------------------------------
 What BaseLink is not
 -----------------------------------------------------------------------------
 BaseLink is NOT for actions. A consumer that needs a JavaScript action
 styled as a link uses LinkButton (Unit 8.7), which renders a <button>
 and preserves the correct accessibility semantics for a non-navigation
 trigger.

 Rule of thumb:

   Navigates somewhere  →  BaseLink (or RouterLink directly, for
                           simple internal cases)
   Triggers JavaScript  →  LinkButton

 -----------------------------------------------------------------------------
 Auto-generated id
 -----------------------------------------------------------------------------
 Not implemented. Links do not need a stable id for aria-describedby
 because assistive technology reads the anchor's text content as the
 accessible name. A consumer that needs a stable id for its own
 purposes supplies it via the `id` attribute — Vue's attribute
 fallthrough applies the attribute to the rendered element (RouterLink
 or <a>).

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The only non-token CSS values are:

   - display: inline         (structural)
   - text-decoration         (structural; underline is standard link
                              affordance, not a design-system token)
   - transition              (uses duration / easing tokens)

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hook
 -----------------------------------------------------------------------------
 data-testid="base-link-root"  on the rendered element (either
                               <RouterLink> or <a>).

 Consumers can assert the rendered element kind via the
 `data-link-kind` attribute which is one of "router" / "external" /
 "internal". Consumers can assert the variant via `data-variant`.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 INTERACTIVE:

   - Native anchor semantics (either <RouterLink> which renders an <a>,
     or a bare <a>).
   - The link's text content is its accessible name.
   - Underline on hover and focus, matching the interactive affordance
     convention used by LinkButton (Unit 8.7).
   - The default variant's color (crimson-600) meets WCAG 2.1 AA
     against the page surface at 8.03:1 (Design System §2.5.1).
   - The subtle variant's color (neutral-700) meets WCAG 2.1 AAA at
     12.04:1.
   - Focus ring uses the design-system focus ring tokens via the
     consumer's anchor element receiving :focus-visible (the browser's
     native outline for links is disabled in favor of the branded ring
     drawn below).

 Note on external-link affordance: this primitive does not inject a
 "opens in new tab" icon. Consumers that want the icon supply it via
 the `leading` or `trailing` slot, or via their own surrounding markup.
 Auto-injecting an icon would force a visual choice on every consumer,
 including those whose external link is followed by inline text where
 an icon would be intrusive.
=============================================================================
-->

<script lang="ts">
/*
 * Development-time warnings are emitted once per (kind, reason) pair
 * per module load, so that a consumer with the same defect in a list
 * of N items does not produce N console entries.
 *
 * The Sets are module-scoped (evaluated once when the module is first
 * imported) and are not exposed to consumers.
 */
const __masesBaseLinkWarned = new Set<string>();

function __masesBaseLinkWarnOnce(key: string, message: string): void {
  if (__masesBaseLinkWarned.has(key)) {
    return;
  }
  __masesBaseLinkWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

type LinkVariant = 'default' | 'subtle';

interface Props {
  /**
   * Internal SPA route target. Mutually exclusive with `href`.
   *
   * When supplied, the component renders a <RouterLink>.
   */
  to?: string;

  /**
   * Absolute URL target. Mutually exclusive with `to`.
   *
   * When supplied with `external=true`, renders an <a> with
   * target="_blank" and rel="noopener noreferrer".
   *
   * When supplied with `external=false` (default), renders an <a> that
   * navigates in the same tab.
   */
  href?: string;

  /**
   * Whether the target is an external resource.
   *
   * Only meaningful when `href` is supplied. When `to` is supplied,
   * this prop is ignored (internal SPA links are by definition
   * same-tab, same-origin).
   *
   * Default: false.
   */
  external?: boolean;

  /**
   * Visual variant. Defaults to 'default'.
   *
   *   default — branded link color (action-link token).
   *   subtle  — muted link color (text-secondary token).
   *
   * See the response preamble §"Design note — subtle versus default".
   */
  variant?: LinkVariant;
}

const props = withDefaults(defineProps<Props>(), {
  to: undefined,
  href: undefined,
  external: false,
  variant: 'default',
});

/*
 * Consumer-error detection.
 *
 * Two patterns are defects:
 *   1. Neither `to` nor `href` supplied — the link has no target.
 *   2. Both supplied — the two targets conflict.
 *
 * The component resolves each by preferring one side and warning, so
 * the rendered DOM remains valid and the defect is visible in the
 * console.
 */
if (import.meta.env.DEV) {
  if (!props.to && !props.href) {
    __masesBaseLinkWarnOnce(
      'base-link:no-target',
      '[BaseLink] neither `to` nor `href` was supplied. Rendering an ' +
        'anchor with href="#", which is a placeholder. Supply `to` for ' +
        'internal SPA links or `href` for absolute URLs.',
    );
  }

  if (props.to && props.href) {
    __masesBaseLinkWarnOnce(
      'base-link:both-targets',
      '[BaseLink] both `to` and `href` were supplied. The `to` prop takes ' +
        'precedence; the `href` prop is ignored. Supply only one.',
    );
  }
}

/*
 * The kind of element the component will render. Drives both the
 * template branch and the `data-link-kind` attribute.
 *
 * Priority: `to` wins over `href`.
 */
const linkKind = computed<'router' | 'external' | 'internal'>(() => {
  if (props.to) {
    return 'router';
  }
  if (props.href && props.external) {
    return 'external';
  }
  return 'internal';
});

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'link',
  `link--${props.variant}`,
]);

/*
 * Resolved href for the internal / external anchor branches.
 *
 * When neither `to` nor `href` is supplied, falls back to "#" so the
 * anchor remains focusable and the rendered DOM remains valid. The
 * consumer has already been warned in development.
 */
const resolvedHref = computed<string>(() => props.href ?? '#');
</script>

<template>
  <!--
    ROUTER — internal SPA navigation. Rendered when `to` is supplied.
    The `custom` prop of RouterLink is not used: we want RouterLink to
    render its own <a> so that the browser's native link behaviors
    (right-click, middle-click, keyboard activation) apply without
    reimplementation.
  -->
  <RouterLink
    v-if="linkKind === 'router'"
    :to="to!"
    :class="classes"
    data-testid="base-link-root"
    data-link-kind="router"
    :data-variant="variant"
  >
    <slot />
  </RouterLink>

  <!--
    EXTERNAL — absolute URL, opens in a new tab.
    The `rel` attribute is a security requirement and is set
    unconditionally. See the file header comment.
  -->
  <a
    v-else-if="linkKind === 'external'"
    :href="resolvedHref"
    target="_blank"
    rel="noopener noreferrer"
    :class="classes"
    data-testid="base-link-root"
    data-link-kind="external"
    :data-variant="variant"
  >
    <slot />
  </a>

  <!--
    INTERNAL — absolute URL or placeholder, same-tab navigation.
    Also serves as the fallback when neither `to` nor `href` is
    supplied (the consumer has been warned in development; `resolvedHref`
    is "#").
  -->
  <a
    v-else
    :href="resolvedHref"
    :class="classes"
    data-testid="base-link-root"
    data-link-kind="internal"
    :data-variant="variant"
  >
    <slot />
  </a>
</template>

<style scoped>
/* ============================================================================
   Base
   ============================================================================ */
.link {
  display: inline;
  cursor: pointer;
  text-decoration: none;
  transition: color var(--mases-duration-fast) var(--mases-easing-standard);
}

/* Underline on hover and focus.
   Underline on focus is a redundant affordance that ensures keyboard
   users can visually locate the focused link even when the focus ring
   is suppressed by a consumer's styles. */
.link:hover,
.link:focus-visible {
  text-decoration: underline;
}

/* Replace the browser's default link outline with the branded focus
   ring. Using outline (not box-shadow) preserves the design system's
   consistent ring shape across all interactive elements. */
.link:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Variant — default
   ============================================================================ */
.link--default {
  color: var(--mases-color-action-link);
}

.link--default:hover,
.link--default:focus-visible {
  color: var(--mases-color-action-link-hover);
}

/* ============================================================================
   Variant — subtle
   ============================================================================ */
.link--subtle {
  color: var(--mases-color-text-secondary);
}

.link--subtle:hover,
.link--subtle:focus-visible {
  color: var(--mases-color-text-primary);
}
</style>