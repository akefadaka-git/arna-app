<!--
=============================================================================
 ARNA Phase 2 UI — NotificationsBell
=============================================================================

 File:      mase_app/src/layouts/AppShell/NotificationsBell/NotificationsBell.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.1.0
 Status:    ENHANCEMENT — forced-colors accessibility
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §24.19
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1, §20.2, §22

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 11, Unit 11.12)
 1.0.1  — import-path correction: all cross-tree imports now use the
          '@/' alias (primitives, stores) instead of the prior relative
          paths, which for primitives resolved to a non-existent
          src/layouts/primitives/ directory. The store path was
          previously correct but is switched to the alias for
          consistency. No logic, template, or style change.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The shell's notifications bell. Renders a bell icon, optionally with
 an unread-count badge, in AppHeader's `actions` slot.

 The notification routes are registered in arna-api main at
 84b53abb69c83e22bc9bdaccc64bdb3cf30e73ed. AppShell enables this bell
 and opens the in-shell NotificationsCenter. Route registration alone
 does not prove production migration or deployment status.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   BaseButton   (Unit  8.2)  — the bell button
   BaseIcon     (Unit  8.19) — the bell glyph
   BaseTooltip  (Unit  8.21) — the disabled-state tooltip

 Does not reimplement any of the above.

 -----------------------------------------------------------------------------
 The disabled state uses aria-disabled, not the native disabled attribute
 -----------------------------------------------------------------------------
 A native disabled <button> cannot show a tooltip on focus and is
 skipped by screen readers; aria-disabled keeps the button focusable so
 the tooltip and the disabled-reason text reach every user.

 -----------------------------------------------------------------------------
 Consumer contract for the enabled state
 -----------------------------------------------------------------------------
 When disabled is false, the bell is interactive and emits `open` on
 activation. The current AppShell consumer opens the in-shell
 NotificationsCenter; this component itself does not navigate.

 -----------------------------------------------------------------------------
 Badge sizing — pre-work for the 99+ case
 -----------------------------------------------------------------------------
 The badge's `min-width` was raised from --arna-space-4 (16px) to
 --arna-space-5 (20px). At Amharic caption size (13px), the previous
 16px square was a tight fit for the "99+" string, which is the
 widest badge the component can produce (see BADGE_MAX_DISPLAY). The
 badge's `height` is unchanged at --arna-space-4; a single-digit
 badge therefore remains circular, and a two-digit or "99+" badge
 becomes a horizontal pill.

 The bell is enabled in the current AppShell integration. The badge
 displays the tenant-scoped unread count, capped at 99+ for display;
 the backend remains authoritative for the full count.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The trigger's aria-label comes from `labels.triggerAriaLabel` or
 `labels.triggerAriaLabelWithUnread(count)`. The tooltip text comes
 from `labels.disabledReason`. The badge shows only a number (or the
 99+ cap). The component fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, position, inset, flex,
 align-items, justify-content, pointer-events, text-align, border-
 radius via a token, and the calc() expressions built from spacing
 tokens).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="notifications-bell-trigger"  on the BaseButton (falls
                                           through to the <button>)
 data-testid="notifications-bell-badge"    on the badge <span>
                                           (rendered only when
                                           !disabled && hasUnread)

 The <button> carries (via attribute fallthrough):
   data-disabled="true"   (present only when disabled is true)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + INTERACTIVE (when enabled):

   - The trigger is a native <button> via BaseButton.
   - When disabled: aria-disabled="true", focusable, BaseTooltip links
     the disabled reason via aria-describedby.
   - When enabled: standard button semantics; keyboard activation via
     Enter/Space inherited from BaseButton.
   - The badge is aria-hidden — the unread count is communicated via
     the button's accessible name.
   - Reduced motion: this file defines no animation.
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
 * Consumer-supplied, translated labels.
 *
 * Every user-facing string in the component comes from this object.
 */
export interface NotificationsBellLabels {
  /**
   * The trigger's aria-label when there are no unread notifications.
   * Typically a short phrase: "Notifications", "ማሳወቂያዎች".
   */
  readonly triggerAriaLabel: string;

  /**
   * The trigger's aria-label when there ARE unread notifications.
   * Receives the unread count and returns the translated string.
   *
   * A function (not a template string with a placeholder) so that the
   * consumer can use their i18n library's native interpolation.
   */
  readonly triggerAriaLabelWithUnread: (count: number) => string;

  /**
   * The tooltip text shown while the bell is disabled.
   * Typically: "Notifications coming soon", "ማሳወቂያዎች በቅርቡ ይመጣሉ".
   */
  readonly disabledReason: string;
}

/**
 * The cap at which the badge stops showing the exact unread count and
 * switches to "99+" instead.
 *
 * A presentation constant, not a translatable string.
 */
export const BADGE_MAX_DISPLAY = 99;
</script>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useNotificationsStore } from '@/stores/notifications';
import { fetchUnreadCount } from '@/features/notifications/api';
import BaseButton from '@/components/primitives/BaseButton';
import BaseIcon from '@/components/primitives/BaseIcon';
import BaseTooltip from '@/components/primitives/BaseTooltip';

interface Props {
  /**
   * Whether the bell is disabled. Defaults to false.
   *
   * The shell passes false now that the notification routes are
   * registered and the in-shell NotificationsCenter is integrated.
   * Production migration/deployment status is verified separately.
   *
   * When disabled, the component:
   *   - marks the button with aria-disabled="true"
   *   - wraps the button in a BaseTooltip showing labels.disabledReason
   *   - suppresses the unread badge
   *   - suppresses the @open emit
   */
  disabled?: boolean;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: NotificationsBellLabels;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  /**
   * Fires when the user activates the bell (only when disabled is
   * false). The consumer opens the notification center in response.
   */
  (event: 'open'): void;
}>();

// -----------------------------------------------------------------------------
// Store read
// -----------------------------------------------------------------------------
const notifications = useNotificationsStore();

const unreadCount = computed<number>(() => notifications.unreadCount);
const hasUnread = computed<boolean>(() => notifications.hasUnread);

onMounted(async () => {
  if (props.disabled) return;
  try {
    notifications.setUnreadCount(await fetchUnreadCount());
  } catch (error) {
    notifications.failFetch(error);
  }
});

// -----------------------------------------------------------------------------
// Derived presentation
// -----------------------------------------------------------------------------

/**
 * The badge is visible only when the bell is interactive AND there is
 * at least one unread notification. In the disabled state, no badge
 * is shown.
 */
const showBadge = computed<boolean>(
  () => !props.disabled && hasUnread.value,
);

/**
 * The badge text. Capped at 99+.
 */
const badgeText = computed<string>(() => {
  const n = unreadCount.value;
  if (n > BADGE_MAX_DISPLAY) return `${BADGE_MAX_DISPLAY}+`;
  return String(n);
});

/**
 * The trigger's aria-label, chosen by state.
 *
 * Disabled → the plain label (the disabled reason is announced via
 *            aria-describedby from BaseTooltip).
 * Enabled, no unread → the plain label.
 * Enabled, unread    → the consumer's formatted string.
 */
const triggerAriaLabel = computed<string>(() => {
  if (props.disabled) return props.labels.triggerAriaLabel;
  const n = unreadCount.value;
  if (n === 0) return props.labels.triggerAriaLabel;
  return props.labels.triggerAriaLabelWithUnread(n);
});

// -----------------------------------------------------------------------------
// Activation
// -----------------------------------------------------------------------------
function onClick(): void {
  // Guard: the button is not natively disabled (see the file header
  // comment §"The disabled state uses aria-disabled"), so clicks still
  // reach this handler. Returning early is the enforcement of the
  // disabled state.
  if (props.disabled) return;
  emit('open');
}
</script>

<template>
  <!-- ============================================================
       Disabled state — wrapped in a tooltip
       ============================================================ -->
  <BaseTooltip
    v-if="disabled"
    :content="labels.disabledReason"
  >
    <BaseButton
      type="button"
      variant="ghost"
      size="md"
      :aria-label="triggerAriaLabel"
      aria-disabled="true"
      data-disabled="true"
      data-testid="notifications-bell-trigger"
      @click="onClick"
    >
      <span class="notifications-bell__icon-wrapper">
        <BaseIcon name="bell" size="md" />
      </span>
    </BaseButton>
  </BaseTooltip>

  <!-- ============================================================
       Enabled state
       ============================================================ -->
  <BaseButton
    v-else
    type="button"
    variant="ghost"
    size="md"
    :aria-label="triggerAriaLabel"
    data-testid="notifications-bell-trigger"
    @click="onClick"
  >
    <span class="notifications-bell__icon-wrapper">
      <BaseIcon name="bell" size="md" />
      <span
        v-if="showBadge"
        class="notifications-bell__badge"
        aria-hidden="true"
        data-testid="notifications-bell-badge"
      >{{ badgeText }}</span>
    </span>
  </BaseButton>
</template>

<style scoped>
/* ============================================================================
   Icon wrapper
   ---------------------------------------------------------------------------
   Positions the badge relative to the bell glyph. The wrapper's size is
   exactly the icon's size, so the badge's top-right corner aligns with
   the glyph's top-right corner regardless of the button's padding.
   ============================================================================ */
.notifications-bell__icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ============================================================================
   Badge
   ---------------------------------------------------------------------------
   A compact count pill positioned at the top-trailing corner of the
   icon. Uses logical properties so an eventual RTL locale places it on
   the top-left without any change here.

   Sizing: the badge's height is --arna-space-4 (16px). Its
   min-width is --arna-space-5 (20px), giving the "99+" string room
   at the caption font size. A single-digit badge stretches to the
   20px minimum width but is centred, so it remains visually a pill;
   a two-digit badge or "99+" fills the 20px minimum and grows
   beyond it if needed. The height stays 16px in every case.

   The badge is active when unread notifications exist and the bell is
   enabled. The sizing supports the component's 99+ display cap.
   ============================================================================ */
.notifications-bell__badge {
  position: absolute;
  /*
   * -4px offsets pull the badge slightly outside the icon's bounds so
   * it overlaps the bell's top-trailing corner without covering the
   * glyph. calc(-1 * var(--arna-space-1)) is used instead of a
   * negative literal so the token scale remains the source of truth.
   */
  inset-block-start: calc(-1 * var(--arna-space-1));
  inset-inline-end: calc(-1 * var(--arna-space-1));
  min-width: var(--arna-space-5);
  height: var(--arna-space-4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--arna-radius-full);
  background-color: var(--arna-color-action-primary);
  color: var(--arna-color-text-inverse);
  font-family: inherit;
  font-size: var(--arna-font-size-caption);
  font-weight: var(--arna-font-weight-semibold);
  /*
   * The badge is a visual indicator only — pointer-events: none lets
   * clicks pass through to the surrounding button. Combined with
   * aria-hidden="true" on the span, this makes the badge purely
   * decorative.
   */
  pointer-events: none;
}

/* ============================================================================
   Disabled visual treatment
   ---------------------------------------------------------------------------
   The button is not natively disabled (aria-disabled only), so the
   browser does not apply its disabled styling. Reduced opacity is
   applied here so the visual state matches the semantic state.
   ============================================================================ */
[data-disabled='true'] {
  opacity: 0.5;
}

/* ============================================================================
   Forced colors
   ---------------------------------------------------------------------------
   Do not let the reduced-opacity disabled treatment make the focusable
   aria-disabled trigger illegible. Use system colors for the unread
   badge so its count remains distinct in high-contrast environments.
   ============================================================================ */
@media (forced-colors: active) {
  [data-disabled='true'] {
    opacity: 1;
    color: GrayText;
    border: 1px solid GrayText;
  }

  .notifications-bell__badge {
    background-color: Highlight;
    color: HighlightText;
    border: 1px solid HighlightText;
    forced-color-adjust: none;
  }
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   No animation is defined in this file. A defensive no-op block is
   kept for future revisions that might add one.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .notifications-bell__badge {
    /* no-op placeholder */
  }
}
</style>