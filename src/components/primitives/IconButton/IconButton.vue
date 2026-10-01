<!--
=============================================================================
 MASES Phase 2 UI — IconButton
=============================================================================

 File:      mase_app/src/components/primitives/IconButton/IconButton.vue
 Layer:     1 (Primitives)
 Version:   1.0.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.7
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Unit 8.7).
 1.0.1  — type-check fix:
          · The `icon` prop is typed `string` so consumers can pass
            arbitrary data (a nav config, a server payload) without a
            compile-time cast. BaseIcon's `name` prop is typed
            `IconName` (the frozen 56-icon registry union). The
            template's `:name="icon"` binding therefore failed
            vue-tsc with TS2322. Added an `iconName()` helper that
            performs a TypeScript-only narrowing at the binding point.
            BaseIcon's own runtime registry check still runs unchanged.
          · Matches the pattern used by DropdownMenu (Unit 9.11) for
            its MenuItem.icon field and by AppSidebar (Unit 11.16) for
            its NavLeaf / NavGroup icon fields.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A square, icon-only button. It renders exactly one icon and carries no
 visible text label. The accessible name is carried by the mandatory
 `ariaLabel` prop.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 IconButton composes two primitives:

   BaseButton (Unit 8.2)   — provides all button styling, states,
                             focus ring, disabled treatment, loading
                             behavior, and accessibility semantics.

   BaseIcon  (Unit 8.19)   — renders the Lucide SVG for the requested
                             icon name at the requested size.

 The only visual concern IconButton adds on top of BaseButton is the
 square aspect ratio (declared in this file's scoped style block).

 -----------------------------------------------------------------------------
 Visual identity — the four permitted variants
 -----------------------------------------------------------------------------
 IconButton supports a subset of BaseButton's variants:
   primary   — for the single most prominent icon action on a surface
   secondary — for a secondary icon action that still carries weight
   ghost     — DEFAULT. For inline and toolbar contexts where a solid
               background would be disproportionate.
   danger    — for destructive icon actions (delete, reverse, cancel).

 The `link` variant is deliberately excluded. An icon-only "link"
 button has no visual affordance that would communicate "link", and
 the variant exists in BaseButton to mimic inline hyperlink styling
 — which requires visible text to be meaningful.

 -----------------------------------------------------------------------------
 Sizes and hit areas
 -----------------------------------------------------------------------------
 The catalog specifies hit areas of 32 / 40 / 48 CSS pixels for
 sm / md / lg, matching BaseButton's min-height values. Because
 IconButton applies aspect-ratio: 1 / 1 to the rendered button, the
 width equals the min-height, producing square targets at all three
 sizes.

 On mobile (< 640px viewport), BaseButton's own CSS already clamps the
 sm and md sizes to a 44×44 minimum touch target (Design System §6.5).
 IconButton inherits this automatically; the aspect ratio remains 1 / 1
 because the aspect ratio derives from the clamped height.

 -----------------------------------------------------------------------------
 Icon size mapping
 -----------------------------------------------------------------------------
 The rendered icon's size is derived from the button's size:

   button size sm  →  icon size sm  (16px)
   button size md  →  icon size md  (20px)
   button size lg  →  icon size lg  (24px)

 The mapping is documented in the component's `iconSize` computed
 property. It is not overridable. Consumers that need a different
 icon-to-button ratio compose their own button from BaseButton and
 BaseIcon rather than using IconButton.

 -----------------------------------------------------------------------------
 Icon-name typing — see the revision history
 -----------------------------------------------------------------------------
 The `icon` prop is typed `string` so consumers can populate it from
 arbitrary data without a compile-time cast. The `iconName()` helper
 below performs a TypeScript-only narrowing at the binding point; the
 runtime registry check inside BaseIcon still guards against
 unregistered names and emits a deduplicated dev warning when one is
 supplied.

 This is the same pattern used across the codebase for user-supplied
 icon identifiers:
   · DropdownMenu  (Unit 9.11)  — MenuItem.icon
   · AppSidebar    (Unit 11.16) — NavLeaf.icon / NavGroup.icon

 -----------------------------------------------------------------------------
 The icon is decorative
 -----------------------------------------------------------------------------
 The icon receives no aria-label. It is passed to BaseIcon without an
 `ariaLabel` prop, which causes BaseIcon to render it with
 aria-hidden="true". The accessible name of the button is carried
 entirely by the button's own `aria-label` attribute (from the
 `ariaLabel` prop).

 This avoids the double-announcement problem: screen readers announce
 the button's accessible name once, without repeating the icon.

 -----------------------------------------------------------------------------
 Mandatory ariaLabel
 -----------------------------------------------------------------------------
 The `ariaLabel` prop is REQUIRED by the TypeScript interface. A
 consumer that omits it will receive a compile-time error.

 This is stricter than BaseButton, where ariaLabel is optional and
 enforced only by a runtime warning when iconOnly is true. IconButton
 tightens the constraint at the type level because every IconButton
 is icon-only by definition — there is no non-icon-only mode to
 relax into.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 This component declares NO design tokens. The only CSS rule it
 declares is `aspect-ratio: 1 / 1`, which is a layout constraint, not
 a design value. Every color, spacing, radius, duration, and easing
 is inherited from BaseButton, which itself consumes only Tier 2
 semantic tokens from tokens.css.

 -----------------------------------------------------------------------------
 Test hook
 -----------------------------------------------------------------------------
 data-testid="icon-button-root" on the rendered <button>.

 BaseButton's own sub-element test ids (base-button-spinner,
 base-button-label, base-button-leading, base-button-trailing) remain
 on the child elements. Since IconButton does not use slots, only
 base-button-root (now icon-button-root) and base-button-spinner (when
 loading) are rendered.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 INTERACTIVE — same contract as BaseButton. This component introduces
 no additional interactive surface and no additional focus target.

 Notes specific to IconButton:

   1. The button's accessible name comes exclusively from `ariaLabel`.
      There is no visible label. This is the WCAG-compliant pattern
      for icon-only controls.

   2. The icon is decorative (aria-hidden). It is not announced.

   3. The focus ring is inherited from BaseButton and respects
      :focus-visible (keyboard focus only).
=============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from '../BaseButton';
import BaseIcon from '../BaseIcon';
import type { IconName } from '../BaseIcon';
import type { ButtonSize, ButtonType } from '../BaseButton';

type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  /**
   * Lucide icon name. Rendered by BaseIcon.
   *
   * The icon is decorative; the button's accessible name comes from
   * `ariaLabel`, not from this prop.
   *
   * Typed `string` rather than `IconName` so consumers can populate
   * it from arbitrary data without a compile-time cast. See the file
   * header comment §"Icon-name typing" for the rationale.
   */
  icon: string;

  /**
   * Accessible name for the button. Required.
   *
   * This is the only source of the button's accessible name. A screen
   * reader announces this string when the button receives focus.
   */
  ariaLabel: string;

  /**
   * Visual variant. Defaults to 'ghost'.
   *
   * The 'link' variant is not supported. See the file header comment.
   */
  variant?: IconButtonVariant;

  /** Size. Defaults to 'md'. */
  size?: ButtonSize;

  /** Native button type. Defaults to 'button'. */
  type?: ButtonType;

  /** Disables the button. */
  disabled?: boolean;

  /** Shows a loading spinner and disables the button. */
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  (event: 'click', payload: MouseEvent): void;
}>();

/**
 * Icon size derived from button size. See the file header comment
 * "Icon size mapping" for the rationale.
 */
const iconSize = computed<'sm' | 'md' | 'lg'>(() => {
  if (props.size === 'sm') {
    return 'sm';
  }
  if (props.size === 'lg') {
    return 'lg';
  }
  return 'md';
});

/**
 * Narrow the consumer-supplied icon name to BaseIcon's `IconName`
 * union at the binding point.
 *
 * TypeScript-only: this compiles to nothing at runtime. BaseIcon's own
 * registry check still runs and emits a dev warning for unregistered
 * names, so an invalid value degrades gracefully (icon missing,
 * warning logged) rather than throwing.
 */
function iconName(value: string): IconName {
  return value as IconName;
}

function handleClick(event: MouseEvent): void {
  emit('click', event);
}
</script>

<template>
  <BaseButton
    :variant="variant"
    :size="size"
    :type="type"
    :disabled="disabled"
    :loading="loading"
    :icon-only="true"
    :aria-label="ariaLabel"
    class="icon-button"
    data-testid="icon-button-root"
    @click="handleClick"
  >
    <!--
      The icon is passed through BaseButton's default slot. Because
      BaseButton's icon-only mode renders the default slot directly
      (without a label wrapper), the icon fills the button content.

      The name is narrowed to IconName via the iconName() helper —
      TypeScript-only, so BaseIcon receives the same string it always
      did. BaseIcon's runtime registry check still runs.

      No ariaLabel is passed to BaseIcon: the icon is decorative, and
      the button's accessible name comes from the aria-label attribute
      rendered by BaseButton.
    -->
    <BaseIcon :name="iconName(icon)" :size="iconSize" />
  </BaseButton>
</template>

<style scoped>
/*
 * The only CSS rule this component declares. All variant colors,
 * sizes, states, and transitions are inherited from BaseButton.

 * The `.icon-button` class is forwarded by BaseButton to its root
 * <button> element via Vue's attribute inheritance (BaseButton does
 * not set inheritAttrs: false). Vue's SFC compiler applies this
 * component's scoped data attribute to the same root element, so the
 * selector matches without a :deep() combinator.

 * aspect-ratio: 1 / 1 makes the button square. Because BaseButton
 * enforces min-height per size (32 / 40 / 48), the width derives
 * from the height, producing square targets at all sizes and on all
 * viewports — including the mobile 44×44 minimum enforced by
 * BaseButton's own media query.
 */
.icon-button {
  aspect-ratio: 1 / 1;
}
</style>