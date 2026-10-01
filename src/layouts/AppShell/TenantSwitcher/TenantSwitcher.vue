<!--
=============================================================================
 MASES Phase 2 UI — TenantSwitcher
=============================================================================

 File:      mase_app/src/layouts/AppShell/TenantSwitcher/TenantSwitcher.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.0.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §12.5
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §8.5, §13.5, §15.1, §22

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery.
 1.0.1  — API-drift corrections:
          · DropdownMenu MenuItem.id → MenuItem.key (the menu item
            identifier field was renamed).
          · DropdownMenu now requires a controlled `open` prop
            (v1.0.0 of the composite). Added a local `isMenuOpen` ref,
            bound with v-model:open.
          · DropdownMenu exposes a `default` scoped slot, not a
            `trigger` named slot. The trigger button is now provided
            via the default slot with the id, aria-haspopup,
            aria-expanded, aria-controls, and toggle callback that the
            slot exposes.
          · Dropped the unused `const props = ` binding from the
            `defineProps` call (noUnusedLocals). The call is retained
            as a bare expression.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The shell's tenant switcher: a trigger showing the tenant currently in
 effect, opening a dropdown of the user's accessible tenants. Reads
 @/stores/tenant (Unit 11.5).

 Self-hides when hasMultipleTenants is false (the common case for the
 current single-tenant deployment). See the response preamble
 §"Design note — why the component self-hides".

 -----------------------------------------------------------------------------
 What the component does NOT do
 -----------------------------------------------------------------------------
   - It does NOT call tenantStore.setActiveTenant directly. It emits
     @select({ id }) and the shell calls the store. This is the same
     emit-intent contract used by UserMenu (11.11), LanguageSelector
     (11.13), DownloadButton (10.12), and AccessDeniedPage (10.15).
   - It does NOT invalidate tenant-scoped caches. Per Freeze §13.5,
     the app bootstrap subscribes to tenantStore.$onAction and clears
     the launcher and notifications stores when setActiveTenant or
     clearActiveTenant fires. That wiring lives at bootstrap, not here.
   - It does NOT send the X-Tenant-ID header. The API client (Stage 4
     services) reads tenantStore.effectiveTenantId for that.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   BaseButton   (Unit  8.2)  — the trigger button
   BaseIcon     (Unit  8.19) — the building glyph + trailing chevron
   DropdownMenu (Unit  9.11) — the tenant list

 Does not reimplement any of the above.

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
 The trigger's aria-label comes from labels.triggerAriaLabel. The
 visible tenant name comes from the store (already resolved by the
 backend to the request's locale — see the response preamble §"Design
 note — tenant name is single-string"). The component fabricates no
 strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, inline-flex, align-
 items, gap via tokens, max-width, white-space, overflow, text-
 overflow, transform, and the chevron transition property names).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="tenant-switcher-root"     on the root <div> (rendered
                                        only when hasMultipleTenants
                                        is true)
 data-testid="tenant-switcher-trigger"  on the BaseButton (falls
                                        through to the <button>)
 data-testid="tenant-switcher-name"     on the tenant-name <span>
                                        (rendered only when a name is
                                        available)

 The root <div> carries:
   data-menu-open="true"                (present only when the menu
                                        is open)

 Menu item test hooks are owned by DropdownMenu (Unit 9.11).

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + INTERACTIVE:

   - The trigger is a native <button> via BaseButton, with an
     aria-label from labels.triggerAriaLabel.
   - The building icon and the trailing chevron are decorative (no
     aria-label).
   - The dropdown's own accessibility (roving focus, Escape,
     click-outside, aria-haspopup, aria-expanded) is owned by
     DropdownMenu. The scoped slot exposes the ARIA attributes and
     the trigger id; the button binds them.
   - The active tenant is marked with a `check` icon in the menu
     (visual reinforcement of the trigger's own name).
   - The truncated name carries a `title` attribute; on browsers that
     surface title text, hovering the name shows the full string. The
     accessible name of the button is unaffected.
   - Reduced motion: the chevron's transform transition uses a token,
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
 * Consumer-supplied, translated labels for the component itself.
 *
 * The tenant names shown in the menu and the trigger are NOT here —
 * they come from the store, resolved by the backend. See the response
 * preamble §"Design note — tenant name is single-string".
 */
export interface TenantSwitcherLabels {
  /**
   * The trigger's aria-label. Typically a short phrase: "Select
   * tenant", "ተቋም ይምረጡ".
   */
  readonly triggerAriaLabel: string;
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTenantStore } from '@/stores/tenant';
import BaseButton from '@/components/primitives/BaseButton';
import BaseIcon from '@/components/primitives/BaseIcon';
import DropdownMenu from '@/components/composites/DropdownMenu';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: TenantSwitcherLabels;
}

/*
 * The `defineProps` call is retained as a bare expression (no `const`
 * binding) because the template accesses `labels` by bare name and Vue
 * unwraps props there. Dropping the binding satisfies `noUnusedLocals`
 * without changing the runtime.
 */
defineProps<Props>();

const emit = defineEmits<{
  /**
   * Fires when the user picks a tenant. The consumer (the shell)
   * calls tenantStore.setActiveTenant(id) in response. The bootstrap
   * $onAction subscription then invalidates tenant-scoped caches.
   */
  (event: 'select', payload: { id: number }): void;
}>();

// -----------------------------------------------------------------------------
// Store read
// -----------------------------------------------------------------------------
const tenant = useTenantStore();

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
// Render guard
// -----------------------------------------------------------------------------
/*
 * The switcher is meaningful only when the user has more than one
 * accessible tenant. See the response preamble §"Design note — why
 * the component self-hides".
 */
const hasMultipleTenants = computed<boolean>(() => tenant.hasMultipleTenants);

// -----------------------------------------------------------------------------
// The tenant currently in effect (active if switched, default otherwise)
// -----------------------------------------------------------------------------
/*
 * Computed locally. See the response preamble §"Design note — why
 * activeTenant is computed locally, not from the store".
 */
const effectiveTenant = computed(() => {
  const id = tenant.effectiveTenantId;
  if (id === null) return null;
  return tenant.availableTenants.find((t) => t.id === id) ?? null;
});

const effectiveTenantName = computed<string | null>(
  () => effectiveTenant.value?.name ?? null,
);

const effectiveTenantId = computed<number | null>(
  () => effectiveTenant.value?.id ?? null,
);

// -----------------------------------------------------------------------------
// Menu items, derived from the store's availableTenants
// -----------------------------------------------------------------------------
/*
 * Each menu item's identifier is passed as `key`, matching
 * DropdownMenu's MenuItem contract.
 *
 * Menu keys are strings (DropdownMenu's contract); tenant ids are
 * numbers, so each key is the id stringified. See the response
 * preamble §"Design note — menu item keys".
 */
const menuItems = computed(() =>
  tenant.availableTenants.map((t) => ({
    key: String(t.id),
    label: t.name,
    icon: t.id === effectiveTenantId.value ? 'check' : undefined,
  })),
);

// -----------------------------------------------------------------------------
// Selection forwarding
// -----------------------------------------------------------------------------
function onSelect(key: string): void {
  /*
   * DropdownMenu emits a string key. Parse it back to a number with
   * Number.parseInt (not Number()) — see the response preamble
   * §"Design note — menu item keys". Guard against NaN.
   */
  const numericId = Number.parseInt(key, 10);
  if (!Number.isFinite(numericId)) return;
  emit('select', { id: numericId });
}
</script>

<template>
  <div
    v-if="hasMultipleTenants"
    class="tenant-switcher"
    :data-menu-open="isMenuOpen ? 'true' : undefined"
    data-testid="tenant-switcher-root"
  >
    <!--
      Tenant menu.

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
      :items="menuItems"
      @select="onSelect"
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
          type="button"
          variant="ghost"
          size="sm"
          :aria-haspopup="ariaHaspopup"
          :aria-expanded="ariaExpanded"
          :aria-controls="ariaControls"
          :aria-label="labels.triggerAriaLabel"
          data-testid="tenant-switcher-trigger"
          @click="toggle"
        >
          <span class="tenant-switcher__trigger-content">
            <BaseIcon
              name="building"
              size="sm"
              class="tenant-switcher__icon"
            />
            <span
              v-if="effectiveTenantName"
              class="tenant-switcher__name"
              :title="effectiveTenantName"
              data-testid="tenant-switcher-name"
            >{{ effectiveTenantName }}</span>
            <BaseIcon
              name="chevron-down"
              size="xs"
              class="tenant-switcher__chevron"
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
   A neutral wrapper. DropdownMenu owns the menu positioning relative
   to the trigger.

   data-menu-open drives the chevron's rotation (see the chevron rules
   below). It reflects the local isMenuOpen ref, not the DropdownMenu's
   internal state.
   ============================================================================ */
.tenant-switcher {
  display: inline-flex;
  align-items: center;
}

/* ============================================================================
   Trigger content
   ---------------------------------------------------------------------------
   A flex row inside the BaseButton. The button owns the padding and
   chrome; this wrapper owns the inter-element spacing.
   ============================================================================ */
.tenant-switcher__trigger-content {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2);
  min-width: 0;
}

/* ============================================================================
   Building icon
   ============================================================================ */
.tenant-switcher__icon {
  color: var(--mases-color-icon-secondary);
}

/* ============================================================================
   Tenant name
   ---------------------------------------------------------------------------
   MOBILE BASE: hidden. The trigger shows the building icon and chevron
   only. Consistent with UserMenu (Unit 11.11). Tablet and up restore
   the name at the min-width breakpoint below.

   Truncated with an ellipsis when the header is crowded. Same
   truncation rationale as UserMenu: the header has a fixed height
   (--mases-shell-header-height, 64px), and wrapping the tenant name
   would push it taller. The full name is available in the switcher's
   dropdown menu and via the title attribute.

   The max-width is expressed in rem (not px) so the cap scales with
   the root font-size. At the default 16px root the value is 160px —
   the same computed cap the previous revision used. This is a
   pre-work change; verify against a long Amharic tenant name at the
   mobile breakpoint before considering an alternative value. See the
   layout enhancement proposal §R1.2.
   ============================================================================ */
.tenant-switcher__name {
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
  .tenant-switcher__name {
    display: inline;
  }
}

/* ============================================================================
   Chevron
   ---------------------------------------------------------------------------
   A small directional hint. The transition duration is a token; the
   substrate collapses it under prefers-reduced-motion. The transform
   is set by the [data-menu-open='true'] rule below — before this
   revision the transition was declared but never exercised, because
   no rule ever set a transform.
   ============================================================================ */
.tenant-switcher__chevron {
  color: var(--mases-color-icon-secondary);
  transition: transform var(--mases-duration-fast) var(--mases-easing-standard);
}

.tenant-switcher[data-menu-open='true'] .tenant-switcher__chevron {
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
  .tenant-switcher {
    /* no-op placeholder — see comment above */
  }
}
</style>