<!--
=============================================================================
 MASES Phase 2 UI — LanguageSelector
=============================================================================

 File:      mase_app/src/layouts/AppShell/LanguageSelector/LanguageSelector.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.0.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §14.1
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9, §15.1, §20.3, §22

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery.
 1.0.1  — API-drift corrections:
          · DropdownMenu MenuItem.id → MenuItem.key (the menu item
            identifier field was renamed).
          · DropdownMenu now requires a controlled `open` prop
            (v1.0.0 of the composite). Added a local `isMenuOpen`
            ref, bound with v-model:open.
          · DropdownMenu exposes a `default` scoped slot, not a
            `trigger` named slot. The trigger button is now provided
            via the default slot with the id, aria-haspopup,
            aria-expanded, aria-controls, and toggle callback that the
            slot exposes.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The shell's language selector: a trigger (globe icon) opening a
 dropdown of the two frozen locales. Reads the active locale and the
 available-locales catalogue from @/stores/locale (Unit 11.6).

 Does NOT set the locale itself. Emits @select({ code }) so the
 consumer (the shell) can call localeStore.setLocale(code) and,
 once the endpoint exists, also call the localization service which
 POSTs to /api/locale.

 -----------------------------------------------------------------------------
 RENDERING IS DEFERRED (§9.3 / §20.3)
 -----------------------------------------------------------------------------
 The freeze's two relevant sections both require that this selector is
 NOT rendered until POST /api/locale exists. The component is delivered
 now, ready for that endpoint, but the shell must not compose it into
 AppHeader yet.

 Consequence: there is NO disabled prop. See the response preamble
 §"Notice 2".

 -----------------------------------------------------------------------------
 The menu items come from the store, not from props
 -----------------------------------------------------------------------------
 LanguageSelector, unlike UserMenu (Unit 11.11), takes no `items` prop.
 The two locale entries are the frozen §9.1 catalogue, exposed by the
 locale store on availableLocales. Rendering them from the store does
 not violate the design system's "no hardcoded user-facing strings"
 rule: the freeze (§1.2 authority hierarchy) explicitly authorizes the
 two labels as data.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   BaseButton   (Unit  8.2)  — the trigger button
   BaseIcon     (Unit  8.19) — the globe glyph
   DropdownMenu (Unit  9.11) — the locale list

 Does not reimplement any of the above.

 -----------------------------------------------------------------------------
 Menu open state — single-instance controlled state
 -----------------------------------------------------------------------------
 DropdownMenu is a controlled component: it requires an `open` prop and
 emits `update:open`. This is a single-instance menu (one per shell), so
 it is bound with `v-model:open` to a plain boolean ref.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The only consumer-supplied user-facing string is the trigger's
 aria-label (labels.triggerAriaLabel). The menu item labels come from
 the store's frozen §9.1 catalogue.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Not applicable — this file contains no CSS. Every visual value comes
 from the composed primitives (BaseButton's chrome, BaseIcon's sizing
 and colour, DropdownMenu's menu surface).

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="language-selector-trigger"  on the BaseButton (falls
                                          through to the <button>)

 Menu item test hooks are owned by DropdownMenu (Unit 9.11).

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + INTERACTIVE:

   - The trigger is a native <button> via BaseButton, with an
     aria-label from labels.triggerAriaLabel.
   - The globe icon is decorative (no aria-label on BaseIcon).
   - The dropdown's own accessibility (roving focus, Escape,
     click-outside, aria-haspopup, aria-expanded) is owned by
     DropdownMenu (Unit 9.11). The scoped slot exposes the ARIA
     attributes and the trigger id; the button binds them.
   - The active locale is marked with a `check` icon if DropdownMenu
     renders item icons; this is a visual reinforcement, not a
     semantic requirement (the user learns the active locale from
     the surrounding page content).
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
 * Consumer-supplied, translated labels for the component itself.
 *
 * The menu-item labels are NOT here — they come from the frozen
 * locale store catalogue. See the file header comment §"The menu items
 * come from the store".
 */
export interface LanguageSelectorLabels {
  /**
   * The trigger's aria-label. Typically a short phrase: "Select
   * language", "ቋንቋ ይምረጡ".
   */
  readonly triggerAriaLabel: string;
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLocaleStore, isSupportedLocale } from '@/stores/locale';
import type { SupportedLocale } from '@/stores/locale';
import BaseButton from '@/components/primitives/BaseButton';
import BaseIcon from '@/components/primitives/BaseIcon';
import DropdownMenu from '@/components/composites/DropdownMenu';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LanguageSelectorLabels;
}

defineProps<Props>();

const emit = defineEmits<{
  /**
   * Fires when the user picks a locale. The consumer (the shell)
   * calls localeStore.setLocale(code) in response, and — once the
   * localization service exists — also calls it to POST to
   * /api/locale.
   */
  (event: 'select', payload: { code: SupportedLocale }): void;
}>();

// -----------------------------------------------------------------------------
// Store read
// -----------------------------------------------------------------------------
const locale = useLocaleStore();

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
// Menu items, derived from the frozen catalogue
// -----------------------------------------------------------------------------
/*
 * Each menu item's identifier is passed as `key`, matching
 * DropdownMenu's MenuItem contract.
 *
 * The active locale is marked with a `check` icon (from the frozen
 * icon registry, Unit 8.19). Inactive entries have no icon.
 */
const menuItems = computed(() =>
  locale.availableLocales.map((entry) => ({
    key: entry.code,
    label: entry.label,
    icon: entry.code === locale.locale ? 'check' : undefined,
  })),
);

// -----------------------------------------------------------------------------
// Selection forwarding
// -----------------------------------------------------------------------------
function onSelect(key: string): void {
  /*
   * Narrow the incoming key back to SupportedLocale. DropdownMenu
   * emits a string; isSupportedLocale (from Unit 11.6) is the
   * authoritative runtime guard. If the menu ever emits an unexpected
   * key (e.g. a future DropdownMenu feature adds a non-locale action),
   * this silently ignores it rather than emitting an invalid code.
   */
  if (!isSupportedLocale(key)) return;
  emit('select', { code: key });
}
</script>

<template>
  <!--
    Language menu.

    DropdownMenu is controlled: `v-model:open` binds both the `open`
    prop and the `update:open` emit to `isMenuOpen`. This is a
    single-instance menu, so no per-row state coordination is needed.

    The trigger element is supplied via the `#default` scoped slot. The
    slot exposes the trigger's id, its ARIA attributes, and the toggle
    function; the BaseButton binds them all so the menu's
    aria-labelledby resolves, the aria-expanded state reflects `open`,
    and clicks toggle the menu.
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
        size="md"
        :aria-haspopup="ariaHaspopup"
        :aria-expanded="ariaExpanded"
        :aria-controls="ariaControls"
        :aria-label="labels.triggerAriaLabel"
        data-testid="language-selector-trigger"
        @click="toggle"
      >
        <BaseIcon name="globe" size="md" />
      </BaseButton>
    </template>
  </DropdownMenu>
</template>

<!--
  No <style> block.

  Every visual value in this component is owned by the composed
  primitives:
    - BaseButton owns the trigger's chrome, focus ring, hover, and
      size.
    - BaseIcon owns the glyph's size, stroke, and colour.
    - DropdownMenu owns the menu's surface, item layout, and
      transitions.

  Adding a scoped style block here would either duplicate one of those
  responsibilities or introduce a token-less value. Neither is
  acceptable under the design system.
-->