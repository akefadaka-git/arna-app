<!--
=============================================================================
 CHANGE VERIFICATION — portal back-to-workspace
=============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/UserMenu/UserMenu.vue  (AMEND)
 * Unit:      UserMenuItem — optional `permission` field, item filtering
 * Delivery type:  Amendment — one optional field on the public
 *                 `UserMenuItem` type, one computed property, one
 *                 template-binding change.
 * Net lines:      +~35 docblock; +6 code lines.
 *
 * Before (v1.0.2):
 *   UserMenuItem carried `id`, `label`, `icon?`, `variant?`. Every
 *   item supplied in `items` was rendered by DropdownMenu without
 *   filtering. The workspace's `masesUserMenuItems` and the portal's
 *   `masesUserMenuItems` were the same array; a portal-only item
 *   (such as a "back to workspace" affordance) could not be declared
 *   without also appearing in the workspace, where it makes no sense.
 *
 * After (v1.0.3):
 *   UserMenuItem gains an optional `permission` field. When present,
 *   the item is rendered only if the caller holds that permission
 *   (checked against the auth store's permission set — the same
 *   source PermissionGate reads). When absent, the item is always
 *   rendered.
 *
 *   A new `visibleItems` computed filters `props.items` through the
 *   auth store, and `dropdownItems` is re-derived from
 *   `visibleItems` rather than from `props.items`. No other change.
 *
 *   The filtering is UX-only, not a security boundary. The permission
 *   check is a presentation decision; the backend authorizes every
 *   request regardless. See the file header §"Why filtering is UX,
 *   not security".
 *
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — UserMenu
=============================================================================

 File:      mase_app/src/layouts/AppShell/UserMenu/UserMenu.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.1.0
 Status:    ENHANCEMENT — forced-colors accessibility
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §12.1
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1, §22 STAGE 11

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.3  — per-item permission filtering:
          · UserMenuItem gains an optional `permission: string` field.
            When present, the item is rendered only if the caller
            holds that permission (auth store check). When absent,
            the item is rendered unconditionally.
          · A new `visibleItems` computed performs the filter.
            `dropdownItems` is re-derived from `visibleItems`.
          · No change to the public item shape beyond the additive
            `permission` field. No change to the `select` event
            payload. Existing consumers (workspace `masesUserMenuItems`
            with just `logout`) are unaffected — `logout` carries no
            `permission` and continues to render for every
            authenticated caller.

 1.0.2  — API-drift corrections:
          · DropdownMenu now takes MenuItem[] (with a `key` field)
            rather than the previous shape. Added a `dropdownItems`
            computed that maps UserMenuItem.id → MenuItem.key so the
            public UserMenuItem interface stays stable for external
            consumers.
          · DropdownMenu now requires a controlled `open` prop
            (v1.0.0 of the composite). Added a local `isMenuOpen`
            ref, bound with v-model:open.
          · DropdownMenu exposes a `default` scoped slot, not a
            `trigger` named slot. The trigger button is now provided
            via the default slot with the id, aria-haspopup,
            aria-expanded, aria-controls, and toggle callback that the
            slot exposes.
          · BaseAvatar now requires an `alt` prop. Bound it to the
            user's display name.

 1.0.1  — import-path correction: all cross-tree imports now use the
          '@/' alias (primitives, composites, stores) instead of the
          prior relative paths. No logic, template, or style change.

 1.0.0  — initial delivery (Stage 11, Unit 11.11)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The shell's user menu: a trigger button showing the authenticated
 user's avatar and name, opening a dropdown of consumer-supplied
 actions (typically Profile, Preferences, Language, Security, Logout).

 Composed into AppHeader's `actions` slot by AppShell. Reads
 @/stores/auth for the user's name and permission set.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   BaseButton   (Unit  8.2)  — the trigger button
   BaseAvatar   (Unit  8.20) — the user avatar
   BaseIcon     (Unit  8.19) — the trailing chevron
   DropdownMenu (Unit  9.11) — the actions menu

 Does not reimplement any of the above.

 -----------------------------------------------------------------------------
 Consumer-supplied items, not a hardcoded list
 -----------------------------------------------------------------------------
 Catalog §12.1 lists expected items (Profile, Preferences, Language,
 Security, Logout). This component does NOT hardcode them. The
 workspace and the portal each declare their own arrays; the two
 share the `masesUserMenuItems` export (just `logout`) and the portal
 extends it with a "back to workspace" entry gated on
 `app.app.access`.

 -----------------------------------------------------------------------------
 Per-item permission — why filtering is UX, not security
 -----------------------------------------------------------------------------
 An item's optional `permission` field is checked against the auth
 store's permission set. The check is a PRESENTATION decision: it
 hides menu entries the caller cannot meaningfully use, so the menu
 shows only actionable items.

 It is NOT a security boundary. Every action the caller can trigger
 from the menu — including cross-domain navigation — is authorized
 on the destination side. The permission string here is the same
 string the destination's route guard checks; the two surfaces
 agree by construction.

 A caller who somehow sees an item they do not hold the permission
 for still cannot reach the destination: the route guard rejects the
 navigation and renders its own error state. The UX filter exists
 to keep the menu honest, not to prevent misuse.

 -----------------------------------------------------------------------------
 Public item type vs. DropdownMenu's item shape
 -----------------------------------------------------------------------------
 UserMenuItem (this file's public type) carries the stable identifier
 in a field named `id`. DropdownMenu's MenuItem requires the identifier
 in a field named `key`. Rather than couple the public contract to the
 composite's internal field name, this component translates between
 the two in a `dropdownItems` computed. External consumers continue to
 pass `UserMenuItem[]` with `id`.

 See the file header comment in DropdownMenu for the MenuItem shape.

 -----------------------------------------------------------------------------
 Menu open state — single-instance controlled state
 -----------------------------------------------------------------------------
 DropdownMenu is a controlled component: it requires an `open` prop and
 emits `update:open`. This is a single-instance menu (one per shell), so
 it is bound with `v-model:open` to a plain boolean ref.

 -----------------------------------------------------------------------------
 Chevron rotation — reflects menu open state
 -----------------------------------------------------------------------------
 The chevron's existing transform transition is driven by the wrapper's
 `data-menu-open` attribute, which reflects `isMenuOpen`. The rotation
 is 180° when the menu is open, matching the standard dropdown
 convention: a downward chevron rotates to point up when the menu is
 revealed. Under prefers-reduced-motion the transition is collapsed to
 1ms by the token substrate, so the rotation snaps rather than animates.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The trigger's aria-label comes from `labels.triggerAriaLabel`. Every
 menu item's label comes from `items[].label`. The user's display name
 comes from the auth store. The component fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, align-items,
 gap via tokens, max-width, white-space, text-overflow, overflow,
 transform). The chevron's transition duration is a token.

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="user-menu-root"      on the root <div>
 data-testid="user-menu-trigger"   on the BaseButton (falls through to
                                   the <button> element)
 data-testid="user-menu-name"      on the name <span>

 The root <div> carries:
   data-menu-open="true"           (present only when the menu is open)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - The trigger uses BaseButton (native <button>) with an explicit
     aria-label from labels.triggerAriaLabel.
   - The name span is hidden on mobile via display: none (removed from
     the accessibility tree); the aria-label on the trigger remains.
   - DropdownMenu (Unit 9.11) owns the menu's own accessibility
     (roving focus, Escape, click-outside). The scoped slot exposes
     the ARIA attributes and the trigger id; the button binds them.
   - The chevron is decorative. The BaseAvatar's `alt` is set to the
     display name; because the containing button carries its own
     aria-label, screen readers announce the button's label, not the
     avatar's.
   - The truncated name carries a `title` attribute; on browsers that
     surface title text, hovering the name shows the full string. The
     accessible name of the button is unaffected.
   - Reduced motion: the chevron's transition duration is a token,
     which the substrate collapses under prefers-reduced-motion.
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
 * The visual variant of a menu item. `'danger'` items are rendered by
 * DropdownMenu with destructive emphasis (used for Logout in most
 * deployments). The variant string is passed through to DropdownMenu;
 * this component does not interpret it.
 */
export type UserMenuItemVariant = 'default' | 'danger';

/**
 * A single user-menu item.
 *
 * The public identifier field is named `id`. DropdownMenu's own
 * MenuItem uses `key`; this component translates between the two in
 * its `dropdownItems` computed.
 */
export interface UserMenuItem {
  /**
   * Stable identifier. Included in the `select` event payload so the
   * consumer can route without relying on label matching.
   */
  readonly id: string;

  /**
   * Translated, user-facing label.
   */
  readonly label: string;

  /**
   * Optional Lucide icon name. Must be one of the frozen 56-icon
   * registry keys (Unit 8.19). Passed through to DropdownMenu.
   */
  readonly icon?: string;

  /**
   * Optional visual variant. Defaults to DropdownMenu's own default
   * (typically 'default').
   */
  readonly variant?: UserMenuItemVariant;

  /**
   * Optional permission slug. When present, the item is rendered only
   * if the authenticated caller holds the permission (checked against
   * the auth store's permission set — the same source PermissionGate
   * reads). When absent, the item is always rendered.
   *
   * This is a UX filter, not a security boundary. See the file header
   * §"Per-item permission — why filtering is UX, not security".
   *
   * Added in v1.0.3 to support a portal-only "back to workspace" item
   * gated on `app.app.access`.
   */
  readonly permission?: string;
}

/**
 * Consumer-supplied, translated labels for the component itself (as
 * distinct from the menu items' labels).
 */
export interface UserMenuLabels {
  /**
   * The trigger button's aria-label. Typically a short phrase such as
   * "User menu" or "የተጠቃሚ ምናሌ".
   */
  readonly triggerAriaLabel: string;
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/primitives/BaseButton';
import BaseAvatar from '@/components/primitives/BaseAvatar';
import BaseIcon from '@/components/primitives/BaseIcon';
import DropdownMenu from '@/components/composites/DropdownMenu';

interface Props {
  /**
   * The menu items. Required. Consumer-supplied — see the file header
   * comment §"Consumer-supplied items, not a hardcoded list".
   *
   * Items that declare a `permission` field are filtered against the
   * caller's permission set (see `visibleItems` below). Items without
   * a `permission` field are rendered unconditionally.
   */
  items: ReadonlyArray<UserMenuItem>;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: UserMenuLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /**
   * Fires when a menu item is activated. The payload carries the
   * item's `id` — the same value the consumer supplied in `items`.
   */
  (event: 'select', payload: { id: string }): void;
}>();

// -----------------------------------------------------------------------------
// Auth store read
// -----------------------------------------------------------------------------
const auth = useAuthStore();

/*
 * Defensive guard for the template's v-if. If the user is null
 * (unauthenticated), the component renders nothing.
 */
const user = computed(() => auth.user);
const displayName = computed<string>(() => auth.userName ?? '');

// -----------------------------------------------------------------------------
// Menu open state (single-instance controlled state)
// -----------------------------------------------------------------------------
/*
 * DropdownMenu is a controlled component: it requires an `open` prop
 * and emits `update:open`. This is a single-instance menu, so it is
 * bound with `v-model:open` to a plain boolean ref.
 */
const isMenuOpen = ref<boolean>(false);

// -----------------------------------------------------------------------------
// Permission filtering
// -----------------------------------------------------------------------------
/*
 * The visible subset of `props.items`:
 *
 *   · Items WITHOUT a `permission` field are always visible.
 *   · Items WITH a `permission` field are visible only if the caller
 *     holds that permission (auth store check).
 *
 * The filter is a presentation decision, not a security boundary.
 * See the file header §"Per-item permission — why filtering is UX,
 * not security".
 *
 * The filter re-evaluates whenever the caller's permission set
 * changes (auth store reactivity) — e.g. after a tenant switch or a
 * session restore that installs a fresh user object.
 */
const visibleItems = computed<readonly UserMenuItem[]>(() =>
  props.items.filter((item) => {
    if (item.permission === undefined) return true;
    return auth.hasPermission(item.permission);
  }),
);

// -----------------------------------------------------------------------------
// Dropdown items — the public UserMenuItem shape mapped to MenuItem
// -----------------------------------------------------------------------------
/*
 * DropdownMenu requires its items to carry the identifier in a `key`
 * field; the public UserMenuItem type carries it in `id`. This computed
 * performs the translation so the public interface stays stable.
 *
 * The mapping is derived from `visibleItems` (not `props.items`), so
 * items filtered out by the permission check are never passed to the
 * dropdown.
 *
 * See the file header comment §"Public item type vs. DropdownMenu's
 * item shape".
 */
const dropdownItems = computed(() =>
  visibleItems.value.map((item) => ({
    key: item.id,
    label: item.label,
    icon: item.icon,
    variant: item.variant,
  })),
);

// -----------------------------------------------------------------------------
// Event forwarding
// -----------------------------------------------------------------------------
/*
 * DropdownMenu emits the item's `key` (which equals the UserMenuItem's
 * `id` thanks to the mapping above). We re-emit under the public
 * `{ id }` payload shape.
 */
function onMenuSelect(key: string): void {
  emit('select', { id: key });
}
</script>

<template>
  <div
    v-if="user"
    class="user-menu"
    :data-menu-open="isMenuOpen ? 'true' : undefined"
    data-testid="user-menu-root"
  >
    <!--
      User menu.

      DropdownMenu is controlled: `v-model:open` binds both the `open`
      prop and the `update:open` emit to `isMenuOpen`. This is a
      single-instance menu, so no per-row state coordination is needed.

      The trigger element is supplied via the `#default` scoped slot.
      The slot exposes the trigger's id, its ARIA attributes, and the
      toggle function; the BaseButton binds them all so the menu's
      aria-labelledby resolves, the aria-expanded state reflects
      `open`, and clicks toggle the menu.
    -->
    <DropdownMenu
      v-model:open="isMenuOpen"
      :items="dropdownItems"
      @select="onMenuSelect"
    >
      <template
        #default="{
          triggerId,
          toggle,
          ariaHaspopup,
          ariaExpanded,
          ariaControls,
        }"
      >
        <BaseButton
          :id="triggerId"
          variant="ghost"
          size="sm"
          :aria-haspopup="ariaHaspopup"
          :aria-expanded="ariaExpanded"
          :aria-controls="ariaControls"
          :aria-label="labels.triggerAriaLabel"
          data-testid="user-menu-trigger"
          @click="toggle"
        >
          <span class="user-menu__trigger-content">
            <BaseAvatar
              :name="displayName"
              :alt="displayName"
              size="sm"
            />
            <span
              class="user-menu__name"
              :title="displayName"
              data-testid="user-menu-name"
            >{{ displayName }}</span>
            <BaseIcon
              name="chevron-down"
              size="xs"
              class="user-menu__chevron"
            />
          </span>
        </BaseButton>
      </template>
    </DropdownMenu>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ---------------------------------------------------------------------------
   A neutral wrapper. The DropdownMenu (composed) owns the positioning
   of the menu relative to the trigger.

   data-menu-open drives the chevron's rotation (see the chevron rules
   below). It reflects the local isMenuOpen ref, not the DropdownMenu's
   internal state.
   ============================================================================ */
.user-menu {
  display: inline-flex;
  align-items: center;
}

/* ============================================================================
   Trigger content
   ---------------------------------------------------------------------------
   A flex row inside the BaseButton. The button itself owns the padding
   and chrome; this wrapper owns the inter-element spacing.
   ============================================================================ */
.user-menu__trigger-content {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2);
  min-width: 0;
}

/* ============================================================================
   Name
   ---------------------------------------------------------------------------
   MOBILE BASE: hidden. The trigger shows avatar + chevron only. The
   trigger's aria-label remains, so its accessible name is unchanged.
   Tablet and up restore the name at the min-width breakpoint below.

   Truncated with an ellipsis when the header is crowded. This is a
   deliberate departure from the design system's wrap-first rule: the
   header has a fixed height (--mases-shell-header-height, 64px) and
   wrapping the name would push it taller. The full name is available
   on the profile page and via the title attribute; the trigger is
   chrome.

   The max-width is expressed in rem (not px) so the cap scales with
   the root font-size. At the default 16px root the value is 160px —
   the same computed cap the previous revision used. This is a
   pre-work change; verify against a long Amharic display name at the
   mobile breakpoint before considering an alternative value. See the
   layout enhancement proposal §R1.2.
   ============================================================================ */
.user-menu__name {
  display: none;
  max-width: 10rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  color: var(--mases-color-text-primary);
}

/* Tablet and up: show the name. */
@media (min-width: 640px) {
  .user-menu__name {
    display: inline;
  }
}

/* ============================================================================
   Chevron
   ---------------------------------------------------------------------------
   A small directional hint. The transition duration is a token; the
   substrate collapses it under prefers-reduced-motion. The transform
   is set by the [data-menu-open='true'] rule below.
   ============================================================================ */
.user-menu__chevron {
  color: var(--mases-color-icon-secondary);
  transition: transform var(--mases-duration-fast) var(--mases-easing-standard);
}

.user-menu[data-menu-open='true'] .user-menu__chevron {
  transform: rotate(180deg);
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   The chevron's transition duration comes from a token, which the
   substrate shortens to 1ms under prefers-reduced-motion. This block
   is a defensive no-op placeholder for any future revision that adds
   a non-token animation.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .user-menu {
    /* no-op placeholder — see comment above */
  }
}
/* ============================================================================
   Windows High Contrast / forced-colors
   ---------------------------------------------------------------------------
   Explicit system colors keep the user identity and disclosure affordance
   legible when authored token colors are suppressed.
   ============================================================================ */
@media (forced-colors: active) {
  .user-menu__name {
    color: CanvasText;
  }

  .user-menu__chevron {
    color: ButtonText;
  }
}

</style>