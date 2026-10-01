<!--
=============================================================================
 MASES Phase 2 UI — BaseAvatar
=============================================================================

 File:      mase_app/src/components/primitives/BaseAvatar/BaseAvatar.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.18
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Renders a circular (or rounded-square) visual representation of a
 person, entity, or tenant. Three render branches, selected in order of
 preference:

   1. Image       — when `src` is supplied AND has not failed to load.
   2. Initials    — when `src` is absent or has failed, and `initials`
                    is supplied.
   3. Fallback    — a generic user icon, when neither image nor
                    initials is available.

 The accessible name is ALWAYS the value of the required `alt` prop,
 regardless of which branch renders. See the file header comment
 §"The `alt` prop is required".

 -----------------------------------------------------------------------------
 Render branches and the DOM shape
 -----------------------------------------------------------------------------
 Image branch:
     <img src="..." alt="<alt>" />

 Initials branch:
     <span role="img" aria-label="<alt>">
       <span aria-hidden="true">AA</span>
     </span>

 Fallback branch:
     <span role="img" aria-label="<alt>">
       <BaseIcon name="user" aria-hidden="true" />
     </span>

 The initials and icon branches wrap their visible content in an
 inner aria-hidden element so that screen readers announce only the
 avatar's accessible name, not the visible characters. Without the
 aria-hidden wrapper, a screen reader would announce "Akefa Ayele Daka,
 AA" (name + initials), which is redundant.

 -----------------------------------------------------------------------------
 The `alt` prop is required
 -----------------------------------------------------------------------------
 `alt` has no default. Omitting it is a compile-time error. See the
 file header comment §"The `alt` prop is required" for the rationale.

 -----------------------------------------------------------------------------
 The `initials` prop
 -----------------------------------------------------------------------------
 Consumer-supplied. Not derived from `alt`. See the response preamble
 §"Design note — the `alt` prop is required, and why".

 The component renders the value verbatim. It does not:
   - uppercase the string (Design System §3.5 B6 forbids uppercase
     transforms on any element that may contain Ethiopic script);
   - truncate it to a maximum length;
   - insert periods, spaces, or any separator.

 The consumer's string is rendered exactly as supplied.

 -----------------------------------------------------------------------------
 Image load fallback
 -----------------------------------------------------------------------------
 An `error` event on the <img> flips a local `imageFailed` ref, which
 switches the component to the initials (or fallback icon) branch. The
 ref resets when `src` changes. See the response preamble §"Design note
 — image load fallback".

 -----------------------------------------------------------------------------
 Size mapping and stroke consistency
 -----------------------------------------------------------------------------
 Sizes (per Component Catalog §2.18):

     xs  = 24px  =  --mases-icon-lg
     sm  = 32px  =  --mases-icon-xl
     md  = 40px  =  --mases-space-10
     lg  = 56px  =  calc(--mases-space-12 + --mases-space-2)

 The 56px value is derived from two spacing tokens on the 4px scale;
 no arbitrary literal pixel appears in the CSS.

 Font sizes (initials) and icon sizes (fallback) scale proportionally
 with the avatar's diameter:

     avatar size    initials font              fallback icon size
     ───────────    ───────────────────────    ──────────────────
     xs  (24px)     caption      (12px)        sm  (16px)
     sm  (32px)     body-sm      (14px)        md  (20px)
     md  (40px)     body         (16px)        lg  (24px)
     lg  (56px)     body-lg      (18px)        xl  (32px)

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css, except the derived 56px height (documented above). No hex
 value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="base-avatar-root"       on the outer element (the img, or
                                      the wrapping span in the other
                                      two branches)
 data-testid="base-avatar-image"      on the <img> in the image branch
 data-testid="base-avatar-initials"   on the initials text span
 data-testid="base-avatar-fallback"   on the fallback icon in the
                                      fallback branch

 The outer element also carries:
   data-avatar-branch="image" | "initials" | "fallback"
   data-size="xs" | "sm" | "md" | "lg"
   data-shape="circle" | "rounded"
 for consumer assertions in tests.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - The avatar's accessible name is the `alt` prop, in all three
     branches.
   - The image branch uses the native <img alt="..."> mechanism.
   - The initials and fallback branches use role="img" +
     aria-label="..." on a wrapping span, with the visible content
     aria-hidden so that screen readers announce only the name (not
     "name + initials").
   - The component is not focusable and not interactive.

 There is no focus-visible treatment. If a consumer wraps the avatar in
 a link or a button (an unusual pattern, but one that appears in some
 user menus), the wrapping element is the focus target and receives the
 focus ring; the avatar itself remains passive.
=============================================================================
-->

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BaseIcon from '../BaseIcon';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
type AvatarShape = 'circle' | 'rounded';

interface Props {
  /**
   * Image URL. When supplied and successfully loaded, the avatar
   * renders as an <img> with this URL.
   *
   * When the URL fails to load, the component falls back to initials
   * (or the icon).
   */
  src?: string;

  /**
   * Initials or short label. Consumer-supplied; not derived from `alt`.
   *
   * Rendered verbatim when the image branch is not active. The
   * consumer is responsible for casing, length, and formatting.
   */
  initials?: string;

  /**
   * Accessible name of the avatar. Required.
   *
   * Usually the full name of the person or entity the avatar represents.
   * See the file header comment §"The `alt` prop is required".
   */
  alt: string;

  /** Size. Defaults to 'md'. */
  size?: AvatarSize;

  /** Shape. Defaults to 'circle'. */
  shape?: AvatarShape;
}

const props = withDefaults(defineProps<Props>(), {
  src: undefined,
  initials: undefined,
  size: 'md',
  shape: 'circle',
});

/*
 * Tracks whether the image has failed to load.
 * Reset when `src` changes; see the file header comment §"Image load
 * fallback".
 */
const imageFailed = ref<boolean>(false);

watch(
  () => props.src,
  () => {
    imageFailed.value = false;
  },
);

/**
 * The render branch the component will emit this tick.
 *
 * Priority:
 *   1. image       — src is present and has not failed
 *   2. initials    — no usable image, but initials are supplied
 *   3. fallback    — no image and no initials
 */
const branch = computed<'image' | 'initials' | 'fallback'>(() => {
  if (props.src !== undefined && !imageFailed.value) {
    return 'image';
  }
  if (props.initials !== undefined) {
    return 'initials';
  }
  return 'fallback';
});

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'avatar',
  `avatar--${props.size}`,
  `avatar--${props.shape}`,
]);

/*
 * Icon size for the fallback branch, derived from the avatar size.
 * See the file header comment §"Size mapping".
 */
const fallbackIconSize = computed<'sm' | 'md' | 'lg' | 'xl'>(() => {
  switch (props.size) {
    case 'xs':
      return 'sm';
    case 'sm':
      return 'md';
    case 'md':
      return 'lg';
    case 'lg':
    default:
      return 'xl';
  }
});

function onImageError(): void {
  imageFailed.value = true;
}
</script>

<template>
  <!--
    IMAGE BRANCH
    Renders a native <img> with the consumer-supplied alt as the
    accessible name. The image is lazily loaded by the browser's native
    loading="lazy" attribute; the design system does not specify eager
    loading, and lazy loading is the correct default for a list of
    avatars.
  -->
  <img
    v-if="branch === 'image'"
    :src="src"
    :alt="alt"
    :class="classes"
    loading="lazy"
    decoding="async"
    data-testid="base-avatar-root"
    data-avatar-branch="image"
    :data-size="size"
    :data-shape="shape"
    @error="onImageError"
  />

  <!--
    INITIALS BRANCH
    The outer span carries the accessible name via role="img" +
    aria-label. The inner span carries the visible initials and is
    aria-hidden so that screen readers do not announce them twice.
  -->
  <span
    v-else-if="branch === 'initials'"
    role="img"
    :aria-label="alt"
    :class="classes"
    data-testid="base-avatar-root"
    data-avatar-branch="initials"
    :data-size="size"
    :data-shape="shape"
  >
    <span
      class="avatar__initials"
      aria-hidden="true"
      data-testid="base-avatar-initials"
    >
      {{ initials }}
    </span>
  </span>

  <!--
    FALLBACK BRANCH
    Same wrapper treatment as the initials branch. The inner BaseIcon
    is decorative; the outer span's aria-label is the accessible name.
  -->
  <span
    v-else
    role="img"
    :aria-label="alt"
    :class="classes"
    data-testid="base-avatar-root"
    data-avatar-branch="fallback"
    :data-size="size"
    :data-shape="shape"
  >
    <BaseIcon
      name="user"
      :size="fallbackIconSize"
      class="avatar__fallback-icon"
      data-testid="base-avatar-fallback"
    />
  </span>
</template>

<style scoped>
/* ============================================================================
   Base
   ============================================================================ */
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  vertical-align: middle;
  background-color: var(--mases-color-surface-sunken);
  color: var(--mases-color-text-secondary);
  user-select: none;
}

/* The image branch needs object-fit so that a non-square image is
   cropped rather than distorted inside a square or circular avatar.
   The initials and fallback branches inherit the base styles. */
img.avatar {
  object-fit: cover;
  /* Ensure the image fills the container even when the source's
     intrinsic size differs from the rendered size. */
  width: 100%;
  height: 100%;
}

/* ============================================================================
   Shape variants
   ============================================================================ */
.avatar--circle {
  border-radius: var(--mases-radius-full);
}

.avatar--rounded {
  border-radius: var(--mases-radius-md);
}

/* ============================================================================
   Size variants
   ---------------------------------------------------------------------------
   Four discrete sizes. See the file header comment §"Size mapping" for
   the token derivations.
   ============================================================================ */
.avatar--xs {
  width: var(--mases-icon-lg);
  height: var(--mases-icon-lg);
  font-size: var(--mases-font-size-caption);
  line-height: 1;
}

.avatar--sm {
  width: var(--mases-icon-xl);
  height: var(--mases-icon-xl);
  font-size: var(--mases-font-size-body-sm);
  line-height: 1;
}

.avatar--md {
  width: var(--mases-space-10);
  height: var(--mases-space-10);
  font-size: var(--mases-font-size-body);
  line-height: 1;
}

.avatar--lg {
  width: calc(var(--mases-space-12) + var(--mases-space-2));
  height: calc(var(--mases-space-12) + var(--mases-space-2));
  font-size: var(--mases-font-size-body-lg);
  line-height: 1;
}

/* ============================================================================
   Initials
   ============================================================================ */
.avatar__initials {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* Font weight is set to medium so that the initials read as a
     deliberate label rather than as a text fallback. */
  font-weight: var(--mases-font-weight-medium);
  /* Letter spacing normal; Amharic never uses tracking (Design System
     §3.5 B4). */
  letter-spacing: var(--mases-letter-spacing-normal);
  /* No text-transform; see the file header comment §"The `initials`
     prop" for the rationale. */
}

/* ============================================================================
   Fallback icon
   ============================================================================ */
.avatar__fallback-icon {
  /* Inherits the wrapper's color via BaseIcon's default currentColor
     resolution. The icon is aria-hidden by BaseIcon's own default
     (ariaLabel is not supplied by this component). */
  color: inherit;
}
</style>