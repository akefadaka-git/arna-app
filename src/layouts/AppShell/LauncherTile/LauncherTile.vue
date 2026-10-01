<!--
=============================================================================
 MASES Phase 2 UI — LauncherTile
=============================================================================

 File:      mase_app/src/layouts/AppShell/LauncherTile/LauncherTile.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.1.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §7.4
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.5, §15.1, §20.1, §22

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. A single application tile: bilingual name and
          description, an icon, a cross-domain <a href> to the
          application's domain, and a disabled state driven by
          application.is_active.

 1.1.0  — lifecycle-safe rendering and per-application icon (Unit L-13):
          · The launchability rule is now `is_active && is_frontend_ready`.
            Prior to this revision, the tile rendered a clickable link
            whenever `is_active === true`, ignoring `is_frontend_ready`.
            Since the endpoint (Unit L-11) filters on both flags, no live
            request produces a row where the two diverge — this change is
            DEFENSIVE. It makes the tile correct even if a future CR
            relaxes the endpoint's filter or a test constructs a row
            directly.
          · The disabled state now covers both `is_active === false` and
            `is_frontend_ready === false`. The visual treatment is
            unchanged — no href, aria-disabled, click.prevent, lock icon.
            No new label material was added; the two causes are
            visually indistinguishable, matching the existing pattern.
          · The tile's icon now prefers `application.icon_key` when
            non-null. The `icon` prop remains as an override (used by
            the grid's `iconForSlug` resolver); the `'layout-grid'`
            default remains as the final fallback. Precedence:
                application.icon_key > props.icon > 'layout-grid'
          · `category` and `display_order` are carried on the
            application object but not acted on by the tile. The
            endpoint returns rows already ordered; a future grid
            revision that renders category sections consumes both.
          · MINOR version bump. The primary code path is unchanged —
            the endpoint only returns rows where both flags are true,
            and for those rows the tile's behavior is identical to
            1.0.0. The change is additive defense and additive icon
            resolution.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A single application tile in the launcher grid. Renders the
 application's bilingual name and description, an icon, and — when the
 application is launchable — a cross-domain <a href> to the
 application's domain. When the application is not launchable, the
 tile renders a disabled state with a lock icon and no link.

 Composed by LauncherGrid (Unit 11.19).

 -----------------------------------------------------------------------------
 Cross-domain <a>, not <RouterLink>
 -----------------------------------------------------------------------------
 The destination is on a different origin (e.g. portal.maalearna.com.et
 from app.maalearna.com.et). This is not an SPA route change; the
 element is a plain <a href>.

 -----------------------------------------------------------------------------
 The launchability rule
 -----------------------------------------------------------------------------
 The tile is launchable — rendered as an <a> with an href — when and
 only when BOTH of these are true:

     application.is_active          — registered on the platform
     application.is_frontend_ready  — a build exists at the domain

 When either is false, the tile renders the disabled state: no href,
 aria-disabled="true", click prevented, and the trailing lock icon.
 The two causes are visually indistinguishable by design; the
 distinction is administrative and the tile does not surface it.

 The endpoint (Unit L-11) filters on both flags, so a live response
 never contains a non-launchable row. The tile's rule is therefore
 defensive: it protects against a future endpoint revision that
 relaxes the filter, and against tests that construct a row directly.

 -----------------------------------------------------------------------------
 Icon resolution
 -----------------------------------------------------------------------------
 The tile's glyph comes from the application's own data when the
 registry supplies one. The precedence is:

     1. application.icon_key  — the value from GET /api/launcher
     2. props.icon            — the grid's per-slug resolver, if
                                 supplied
     3. 'layout-grid'         — the tile's default

 The middle precedence exists so that a grid with a client-side icon
 resolver (via its `iconForSlug` prop) can still override the
 registry's value. In practice the endpoint now supplies `icon_key`
 for most rows, so the grid's resolver is rarely needed.

 An icon_key value that is not in the frontend's 56-icon registry
 produces a deduplicated dev warning from BaseIcon and renders no
 glyph; the tile falls back to the default. See BaseIcon (Unit 8.19).

 -----------------------------------------------------------------------------
 Bilingual resolution (Freeze §9.5)
 -----------------------------------------------------------------------------
 Reads useLocaleStore().locale and picks name_am / name_en (and
 description_am / description_en) at render time, with a fallback to
 the other language when the primary is empty.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES BaseIcon (Unit 8.19). Does not reimplement icon rendering.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The tile's visible text comes from the application data (bilingual
 fields). The tile's accessible name is its own visible text. No
 labels prop is needed — no string is fabricated by this component.

 The disabled state introduces no text: the lock icon is decorative
 and the visible content is unchanged from the launchable state.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction, gap
 via tokens, padding via tokens, border-radius via a token, grid,
 min-height, overflow, text-overflow, position, transition
 properties, transform).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="launcher-tile-root"         on the <a> (or the <div>
                                          that replaces it in the
                                          disabled state)
 data-testid="launcher-tile-icon"         on the leading BaseIcon
 data-testid="launcher-tile-name"         on the name <p>
 data-testid="launcher-tile-description"  on the description <p>
 data-testid="launcher-tile-lock-icon"    on the trailing lock
                                          BaseIcon (rendered only
                                          when the tile is not
                                          launchable)

 The tile root carries:
   data-available="true" | "false"   — replaces the 1.0.0 `data-active`
   data-slug="<application.slug>"
   data-reason="inactive|frontend-pending"  — present only when the
                                             tile is not launchable;
                                             the discriminating
                                             attribute for tests and
                                             a future badge CR

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + INTERACTIVE:

   - When launchable: the tile is an <a href> — keyboard reachable,
     Enter activates, browser navigates.
   - When not launchable: rendered as a <div> with aria-disabled="true".
     The tile is not focusable (a non-link should not be in the tab
     order), and the lock icon and the tile's visible text communicate
     the state.
   - The accessible name is the tile's own visible text (name +
     description).
   - The leading icon and the trailing lock icon are decorative
     (BaseIcon is rendered without an aria-label).
   - On target="_blank", rel="noopener" is set (Freeze §19.1).
   - Reduced motion: transitions use token durations; the substrate
     collapses them under prefers-reduced-motion.
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
 * The navigation target. `_self` (default) navigates in the same tab;
 * `_blank` opens a new tab.
 */
export type LauncherTileTarget = '_self' | '_blank';
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { useLocaleStore } from '@/stores/locale';
import type { LauncherApplication } from '@/stores/launcher';
import BaseIcon from '@/components/primitives/BaseIcon';
import type { IconName } from '@/components/primitives/BaseIcon';

interface Props {
  /**
   * The application to render. Required. Typically an element of the
   * launcher store's applications array (Unit L-12, shape from
   * Architecture Freeze §20.1 and its L-11 endpoint).
   */
  application: LauncherApplication;

  /**
   * The leading icon. Used only when the application's own
   * `icon_key` is null. Defaults to 'layout-grid' from the frozen
   * icon registry (Unit 8.19).
   */
  icon?: IconName;

  /**
   * The navigation target. Defaults to '_self'.
   */
  destinationTarget?: LauncherTileTarget;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'layout-grid',
  destinationTarget: '_self',
});

// -----------------------------------------------------------------------------
// Locale store read
// -----------------------------------------------------------------------------
const locale = useLocaleStore();

// -----------------------------------------------------------------------------
// Bilingual resolution (Freeze §9.5)
// -----------------------------------------------------------------------------
/*
 * Pick the primary language by active locale, falling back to the
 * other language when the primary is empty.
 */
const displayName = computed<string>(() => {
  const am = props.application.name_am;
  const en = props.application.name_en;
  if (locale.locale === 'am') {
    return am !== '' ? am : en;
  }
  return en !== '' ? en : am;
});

const displayDescription = computed<string>(() => {
  const am = props.application.description_am;
  const en = props.application.description_en;
  if (locale.locale === 'am') {
    return am !== '' ? am : en;
  }
  return en !== '' ? en : am;
});

// -----------------------------------------------------------------------------
// Launchability
// -----------------------------------------------------------------------------
/*
 * A tile is launchable only when BOTH flags are true. See the file
 * header comment §"The launchability rule".
 */
const isAvailable = computed<boolean>(
  () => props.application.is_active && props.application.is_frontend_ready,
);

/*
 * The reason the tile is not launchable, for test discrimination and
 * a future badge CR. Returns null when the tile is launchable.
 *
 * The two reasons are not surfaced as text today — the disabled
 * state renders the same visual treatment for both. The attribute
 * is on the root element so a future revision that distinguishes
 * the two causes can read it without a schema change.
 */
const unavailableReason = computed<'inactive' | 'frontend-pending' | null>(() => {
  if (props.application.is_active === false) return 'inactive';
  if (props.application.is_frontend_ready === false) return 'frontend-pending';
  return null;
});

// -----------------------------------------------------------------------------
// Icon resolution
// -----------------------------------------------------------------------------
/*
 * The application's own icon_key when non-null; the grid's `icon`
 * prop otherwise. See the file header comment §"Icon resolution".
 *
 * The cast to IconName uses the same pattern as AppSidebar (Unit
 * 11.16): the registry check inside BaseIcon still runs at runtime
 * and logs a dev warning for unregistered names; the cast is a
 * TypeScript-only narrowing at the binding point.
 */
function iconName(value: string): IconName {
  return value as IconName;
}

const resolvedIcon = computed<IconName>(() => {
  const key = props.application.icon_key;
  if (key !== null && key !== '') {
    return iconName(key);
  }
  return props.icon;
});

// -----------------------------------------------------------------------------
// Destination
// -----------------------------------------------------------------------------
/*
 * The href is set only when the application is launchable. When not
 * launchable, href is undefined (Vue omits the attribute) and the
 * tile renders as a <div> without a link.
 */
const destinationUrl = computed<string>(
  () => `https://${props.application.domain}`,
);

const href = computed<string | null>(
  () => (isAvailable.value ? destinationUrl.value : null),
);

const rel = computed<string | null>(() => {
  if (!isAvailable.value) return null;
  return props.destinationTarget === '_blank' ? 'noopener' : null;
});

const target = computed<LauncherTileTarget | null>(() => {
  if (!isAvailable.value) return null;
  return props.destinationTarget;
});

// -----------------------------------------------------------------------------
// Activation guard
// -----------------------------------------------------------------------------
/*
 * Defensive: if a click ever reaches the disabled tile (should not,
 * because the disabled state renders a <div> without a link), the
 * handler prevents any default behavior.
 */
function onClick(event: MouseEvent): void {
  if (!isAvailable.value) {
    event.preventDefault();
  }
}
</script>

<template>
  <!-- ============================================================
       Launchable state — rendered as an <a>
       ============================================================ -->
  <a
    v-if="isAvailable"
    class="launcher-tile"
    :href="href ?? undefined"
    :target="target ?? undefined"
    :rel="rel ?? undefined"
    :data-available="'true'"
    :data-slug="application.slug"
    data-testid="launcher-tile-root"
    @click="onClick"
  >
    <!-- ============================================================
         Leading icon
         ============================================================ -->
    <span class="launcher-tile__icon-wrapper">
      <BaseIcon
        :name="resolvedIcon"
        size="lg"
        class="launcher-tile__icon"
        data-testid="launcher-tile-icon"
      />
    </span>

    <!-- ============================================================
         Content (name + description)
         ============================================================ -->
    <span class="launcher-tile__content">
      <span
        class="launcher-tile__name"
        data-testid="launcher-tile-name"
      >{{ displayName }}</span>
      <span
        v-if="displayDescription"
        class="launcher-tile__description"
        data-testid="launcher-tile-description"
      >{{ displayDescription }}</span>
    </span>
  </a>

  <!-- ============================================================
       Non-launchable state — rendered as a <div>
       ============================================================
       No href, no link semantics, not focusable. The lock icon and
       the tile's visible text communicate the state. The
       data-reason attribute discriminates the two causes for tests
       and a future badge CR; today the visual treatment is the same
       for both.
       -->
  <div
    v-else
    class="launcher-tile"
    :data-available="'false'"
    :data-reason="unavailableReason ?? undefined"
    :data-slug="application.slug"
    :aria-disabled="'true'"
    data-testid="launcher-tile-root"
  >
    <!-- ============================================================
         Leading icon
         ============================================================ -->
    <span class="launcher-tile__icon-wrapper">
      <BaseIcon
        :name="resolvedIcon"
        size="lg"
        class="launcher-tile__icon"
        data-testid="launcher-tile-icon"
      />
    </span>

    <!-- ============================================================
         Content (name + description)
         ============================================================ -->
    <span class="launcher-tile__content">
      <span
        class="launcher-tile__name"
        data-testid="launcher-tile-name"
      >{{ displayName }}</span>
      <span
        v-if="displayDescription"
        class="launcher-tile__description"
        data-testid="launcher-tile-description"
      >{{ displayDescription }}</span>
    </span>

    <!-- ============================================================
         Trailing lock icon (non-launchable only)
         ============================================================ -->
    <BaseIcon
      name="lock"
      size="sm"
      class="launcher-tile__lock-icon"
      data-testid="launcher-tile-lock-icon"
    />
  </div>
</template>

<style scoped>
/* ============================================================================
   Root — the <a> in the launchable state, the <div> in the disabled state
   ---------------------------------------------------------------------------
   Both share this class; the box model is identical. The interaction
   styles below are scoped to [data-available='true'] so the disabled
   state never picks up hover, focus, or cursor styling.
   ============================================================================ */
.launcher-tile {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  position: relative;
  min-height: 140px;
  padding-block: var(--mases-space-5);
  padding-inline: var(--mases-space-5);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-lg);
  background-color: var(--mases-color-surface-page);
  color: var(--mases-color-text-primary);
  text-decoration: none;
  font-family: inherit;
  /*
   * A soft hover lift. The transition duration is a token; the
   * substrate collapses it under prefers-reduced-motion.
   */
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard),
    box-shadow var(--mases-duration-fast) var(--mases-easing-standard),
    transform var(--mases-duration-fast) var(--mases-easing-standard);
}

/* ---------------------------------------------------------------------------
   Launchable state
   --------------------------------------------------------------------------- */
.launcher-tile[data-available='true'] {
  cursor: pointer;
}

.launcher-tile[data-available='true']:hover {
  border-color: var(--mases-color-border-strong);
  box-shadow: var(--mases-shadow-elevation-2);
  transform: translateY(-1px);
}

.launcher-tile[data-available='true']:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ---------------------------------------------------------------------------
   Non-launchable state
   ---------------------------------------------------------------------------
   Muted surface and foreground. The lock icon carries the semantic;
   the reduced opacity reinforces it.
   --------------------------------------------------------------------------- */
.launcher-tile[data-available='false'] {
  background-color: var(--mases-color-surface-sunken);
  color: var(--mases-color-text-tertiary);
  cursor: not-allowed;
  opacity: 0.7;
}

/* ============================================================================
   Leading icon
   ============================================================================ */
.launcher-tile__icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--mases-space-10);
  height: var(--mases-space-10);
  border-radius: var(--mases-radius-md);
  background-color: var(--mases-color-surface-accent);
  color: var(--mases-color-icon-accent);
  flex-shrink: 0;
}

.launcher-tile__icon {
  /* owned by BaseIcon; the wrapper provides the visual surround */
}

/* ============================================================================
   Content
   ============================================================================ */
.launcher-tile__content {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  min-width: 0;
}

.launcher-tile__name {
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-semibold);
  /*
   * Amharic-safe wrapping — application names can be long in Ethiopic.
   * Two-line clamp so a very long name does not make one tile much
   * taller than its neighbors. The clamp uses -webkit-line-clamp which
   * is supported by all modern browsers; older browsers simply show
   * the full name wrapped.
   */
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.launcher-tile__description {
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  color: var(--mases-color-text-secondary);
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* In the non-launchable state, the description inherits the muted
   foreground from the root's color rule above. */
.launcher-tile[data-available='false'] .launcher-tile__description {
  color: var(--mases-color-text-tertiary);
}

/* ============================================================================
   Trailing lock icon (non-launchable only)
   ---------------------------------------------------------------------------
   Positioned at the tile's top-trailing corner so it does not compete
   with the name / description flow.
   ============================================================================ */
.launcher-tile__lock-icon {
  position: absolute;
  inset-block-start: var(--mases-space-3);
  inset-inline-end: var(--mases-space-3);
  color: var(--mases-color-icon-secondary);
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   The hover lift's transition duration comes from a token, which the
   substrate shortens to 1ms under prefers-reduced-motion. The lift
   transform itself is not disabled here — a 1px lift is not
   vestibular-triggering and its quick suppression by the token
   substrate is sufficient.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .launcher-tile {
    /* no-op placeholder — see comment above */
  }
}
</style>