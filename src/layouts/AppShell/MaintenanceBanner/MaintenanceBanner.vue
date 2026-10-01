<!--
=============================================================================
 MASES Phase 2 UI — MaintenanceBanner
=============================================================================

 File:      mase_app/src/layouts/AppShell/MaintenanceBanner/MaintenanceBanner.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.0.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.x (Layout)
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1, §22 STAGE 11

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 11, Unit 11.3)
 1.0.1  — import-path correction: primitives now imported via the
          '@/' alias ('@/components/primitives/...') instead of the
          prior relative paths ('../../primitives/...'), which
          resolved to a non-existent src/layouts/primitives/
          directory. No logic, template, or style change.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A shell-wide announcement banner. Used to communicate scheduled
 maintenance, degraded service, read-only mode, or any other
 shell-level condition that affects every page in the session.

 Rendered by AppShell above the header region. Not used inside feature
 pages — a feature-page-level alert is the Alert composite (Unit 9.12).

 -----------------------------------------------------------------------------
 Why this does not compose Alert (Unit 9.12)
 -----------------------------------------------------------------------------
 Alert.vue was not available for inspection in this session. Composing
 a composite whose API is unknown risks inheriting chrome that does not
 fit the shell context (edge-to-edge, sits above the header). A later
 CR may reconcile the two; no other delivered file imports this unit
 yet, so the refactor remains local.

 -----------------------------------------------------------------------------
 Dismiss behaviour — deliberately snap-out
 -----------------------------------------------------------------------------
 When `dismissible=true` and the user activates the dismiss button,
 the component emits `@dismiss` and the consumer removes the banner
 from the DOM. The shell's layout closes the gap immediately — the
 shell's column reflows synchronously, so the header moves up to
 where the banner was. No exit animation is provided, and no space is
 reserved after dismissal.

 This is a deliberate choice: a dismissed notice should get out of the
 way, and the shell's vertical rhythm should not carry the ghost of a
 banner the user has explicitly closed. A future revision that wants
 a collapse animation must (a) introduce a `closing` state, (b)
 coordinate with the consumer's `v-if` (the banner cannot animate out
 after it has been removed from the DOM), and (c) update this note.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   BaseButton (Unit 8.2)  — the action link and the dismiss button
   BaseIcon   (Unit 8.19) — the variant glyph and the close glyph

 Does not reimplement either primitive.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from consumer props:
   - title         (optional)
   - message       (required)
   - actionLabel   (optional)
   - dismissLabel  (required only when dismissible is true)

 The component fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction,
 align-items, gap via tokens, padding via tokens, flex-shrink,
 min-width, border-block-end width, overflow-wrap).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="maintenance-banner-root"    on the outer <div>
 data-testid="maintenance-banner-icon"    on the variant BaseIcon
 data-testid="maintenance-banner-title"   on the title <p> (rendered
                                          only when title is supplied)
 data-testid="maintenance-banner-message" on the message <p>
 data-testid="maintenance-banner-action"  on the action BaseButton
                                          (rendered only when
                                          actionLabel is supplied)
 data-testid="maintenance-banner-dismiss" on the dismiss BaseButton
                                          (rendered only when
                                          dismissible is true AND
                                          dismissLabel is non-empty)

 The inner content wrapper (title + message only) carries the
 live-region role. The root <div> carries only presentational
 attributes:
   data-variant="info|warning|danger"
   data-dismissible="true"  (present only when dismissible is true)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 ALERT (variant='danger') or BASIC + live region (variant='info' | 'warning'):

   - role="status" for info and warning variants (polite announcement).
   - role="alert"  for the danger variant (assertive announcement).
     Mapping is documented in the response preamble §"Design note —
     why role=status for info/warning and role=alert for danger".
   - The role is applied to the inner content wrapper that contains
     ONLY the title and message — never the icon, never the action
     button, never the dismiss button. Putting a live region around
     interactive controls is a mild anti-pattern: some screen readers
     treat the whole region as a single announcement unit, which can
     interfere with navigating to the buttons inside. Moving the role
     inward preserves the announcement for the text while leaving the
     buttons as ordinary focusable controls.
   - The variant BaseIcon is decorative (no aria-label). The message
     text carries the meaning; the icon reinforces.
   - The dismiss button uses BaseButton with an explicit aria-label
     sourced from `dismissLabel`.
   - The action link uses BaseButton with a visible label
     (`actionLabel`), which is the accessible name.
   - Reduced motion: this file defines no animation.

   - Initial-render caveat. A live region fires when content is
     INSERTED INTO an already-present live region, not when the live
     region itself is created. Vue renders the banner (region +
     content) as a single commit, so most screen readers will:
       · for role="status" — stay silent at page load (correct for a
         static notice; the user encounters it on the next read
         through);
       · for role="alert"  — announce it as the banner appears,
         including at initial page load.
     Both behaviours are defensible. The banner remains reachable via
     ordinary document navigation regardless of whether the live
     region announces on insert. If a future revision displays the
     banner after user interaction (e.g. a runtime notice), the same
     role behaves as a conventional live region and fires.
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
 * Visual variant. Determines background, foreground, icon, and live-
 * region role.
 */
export type MaintenanceBannerVariant = 'info' | 'warning' | 'danger';

/*
 * Module-level Set for deduplicated development warnings.
 * See design-system rule 8.
 */
const __masesMaintenanceBannerWarned = new Set<string>();

function __masesMaintenanceBannerWarnOnce(key: string, message: string): void {
  if (__masesMaintenanceBannerWarned.has(key)) return;
  __masesMaintenanceBannerWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from '@/components/primitives/BaseButton';
import BaseIcon from '@/components/primitives/BaseIcon';
import type { IconName } from '@/components/primitives/BaseIcon';

interface Props {
  /**
   * Visual variant. Defaults to 'info'.
   *
   * Also determines the live-region role: 'danger' → role="alert";
   * 'info' and 'warning' → role="status".
   */
  variant?: MaintenanceBannerVariant;

  /**
   * Optional short title. When supplied, it renders above the message
   * with the banner's emphasized font weight. Consumer-supplied,
   * translated.
   */
  title?: string;

  /**
   * The message body. Required. Consumer-supplied, translated.
   */
  message: string;

  /**
   * Optional action label. When supplied, a link-style button is
   * rendered at the banner's trailing edge. The pattern emits
   * `@action` on activation; the consumer is responsible for the
   * destination.
   */
  actionLabel?: string;

  /**
   * Whether the banner can be dismissed. Defaults to false.
   *
   * When true, `dismissLabel` MUST be a non-empty string; otherwise
   * the dismiss button is not rendered.
   */
  dismissible?: boolean;

  /**
   * The accessible name of the dismiss button. Required only when
   * `dismissible` is true. Consumer-supplied, translated.
   */
  dismissLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  title: undefined,
  actionLabel: undefined,
  dismissible: false,
  dismissLabel: undefined,
});

const emit = defineEmits<{
  /** Fires when the user activates the action button. */
  (event: 'action'): void;

  /** Fires when the user activates the dismiss button. */
  (event: 'dismiss'): void;
}>();

// -----------------------------------------------------------------------------
// Derived render decisions
// -----------------------------------------------------------------------------
const hasTitle = computed<boolean>(() => {
  const t = props.title;
  return t !== undefined && t.trim() !== '';
});

const hasAction = computed<boolean>(() => {
  const a = props.actionLabel;
  return a !== undefined && a.trim() !== '';
});

/*
 * The dismiss button is rendered only when BOTH `dismissible` is true
 * AND a non-empty `dismissLabel` was supplied.
 */
const hasDismiss = computed<boolean>(() => {
  if (!props.dismissible) return false;
  const l = props.dismissLabel;
  return l !== undefined && l.trim() !== '';
});

// -----------------------------------------------------------------------------
// Development guard — dismissible without dismissLabel
// -----------------------------------------------------------------------------
if (import.meta.env.DEV && props.dismissible && !hasDismiss.value) {
  __masesMaintenanceBannerWarnOnce(
    'dismissible-without-label',
    '[MaintenanceBanner] `dismissible` is true but `dismissLabel` is ' +
      'missing or empty. The dismiss button will not be rendered. ' +
      'Supply a translated `dismissLabel` to enable dismissal.',
  );
}

// -----------------------------------------------------------------------------
// Live-region role
// -----------------------------------------------------------------------------
const bannerRole = computed<'status' | 'alert'>(() =>
  props.variant === 'danger' ? 'alert' : 'status',
);

// -----------------------------------------------------------------------------
// Variant → icon mapping
// -----------------------------------------------------------------------------
const iconName = computed<IconName>(() => {
  switch (props.variant) {
    case 'warning':
      return 'alert-triangle';
    case 'danger':
      return 'alert-circle';
    case 'info':
    default:
      return 'info';
  }
});

// -----------------------------------------------------------------------------
// Action forwarding
// -----------------------------------------------------------------------------
function onAction(): void {
  emit('action');
}

function onDismiss(): void {
  emit('dismiss');
}
</script>

<template>
  <div
    class="maintenance-banner"
    :data-variant="variant"
    :data-dismissible="dismissible ? 'true' : undefined"
    data-testid="maintenance-banner-root"
  >
    <!-- ============================================================
         Variant icon (decorative)
         ============================================================ -->
    <BaseIcon
      :name="iconName"
      size="md"
      class="maintenance-banner__icon"
      data-testid="maintenance-banner-icon"
    />

    <!-- ============================================================
         Content (title + message)
         ------------------------------------------------------------
         The live-region role (status / alert) is applied here, on the
         wrapper that contains ONLY the title and message. The icon
         above and the action / dismiss buttons below are outside the
         live region — see the file header comment §"Accessibility".
         ============================================================ -->
    <div
      class="maintenance-banner__content"
      :role="bannerRole"
    >
      <p
        v-if="hasTitle"
        class="maintenance-banner__title"
        data-testid="maintenance-banner-title"
      >{{ title }}</p>
      <p
        class="maintenance-banner__message"
        data-testid="maintenance-banner-message"
      >{{ message }}</p>
    </div>

    <!-- ============================================================
         Actions (action + dismiss)
         ============================================================ -->
    <div
      v-if="hasAction || hasDismiss"
      class="maintenance-banner__actions"
    >
      <BaseButton
        v-if="hasAction"
        variant="link"
        size="sm"
        data-testid="maintenance-banner-action"
        @click="onAction"
      >{{ actionLabel }}</BaseButton>

      <BaseButton
        v-if="hasDismiss"
        variant="ghost"
        size="sm"
        :aria-label="dismissLabel"
        data-testid="maintenance-banner-dismiss"
        @click="onDismiss"
      >
        <BaseIcon name="close" size="sm" />
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ---------------------------------------------------------------------------
   MOBILE BASE: mobile padding. Tablet and desktop widen at the
   min-width breakpoint below. Edge-to-edge; no border-radius; sits
   directly above the header in the shell's vertical flow.
   ============================================================================ */
.maintenance-banner {
  display: flex;
  align-items: center;
  gap: var(--mases-space-3);
  width: 100%;
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  /*
   * A single subtle rule separates the banner from the header or
   * content immediately below it.
   */
  border-block-end: 1px solid var(--mases-color-border-subtle);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  /*
   * Amharic-safe wrapping on the message and title (inherited).
   */
  overflow-wrap: break-word;
  word-break: normal;
}

/* Tablet and up: the wider chrome rhythm. */
@media (min-width: 640px) {
  .maintenance-banner {
    padding-inline: var(--mases-space-4);
  }
}

/* ============================================================================
   Variant palettes
   ============================================================================ */
.maintenance-banner[data-variant='info'] {
  background-color: var(--mases-color-surface-info);
  color: var(--mases-color-text-info);
}

.maintenance-banner[data-variant='warning'] {
  background-color: var(--mases-color-surface-warning);
  color: var(--mases-color-text-warning);
}

.maintenance-banner[data-variant='danger'] {
  background-color: var(--mases-color-surface-danger);
  color: var(--mases-color-text-danger);
}

/* ============================================================================
   Variant icon
   ---------------------------------------------------------------------------
   Inherits the variant's foreground color via currentColor.
   ============================================================================ */
.maintenance-banner__icon {
  flex-shrink: 0;
}

/* ============================================================================
   Content (title + message)
   ---------------------------------------------------------------------------
   The inner content wrapper carries the live-region role — the title
   and message are the announced text; the icon, the action button,
   and the dismiss button sit outside the region. See the file header
   comment §"Accessibility".
   ============================================================================ */
.maintenance-banner__content {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  flex: 1 1 auto;
  min-width: 0;
}

.maintenance-banner__title {
  margin: 0;
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: break-word;
  word-break: normal;
}

.maintenance-banner__message {
  margin: 0;
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Actions (action + dismiss)
   ---------------------------------------------------------------------------
   flex-shrink: 0 ensures the buttons are never compressed by a long
   message. The message absorbs the free space; the actions stay at
   their natural width.
   ============================================================================ */
.maintenance-banner__actions {
  display: flex;
  align-items: center;
  gap: var(--mases-space-2);
  flex-shrink: 0;
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   No animation is defined in this file. A defensive no-op block is
   kept for future revisions that might add one.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .maintenance-banner {
    /* no-op placeholder — see comment above */
  }
}
</style>