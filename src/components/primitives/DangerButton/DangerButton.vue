<!--
=============================================================================
 MASES Phase 2 UI — DangerButton
=============================================================================

 File:      mase_app/src/components/primitives/DangerButton/DangerButton.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.5
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A thin convenience wrapper over BaseButton with the visual variant fixed
 to "danger". It exists so consumers can write:

     <DangerButton @click="confirmDelete">Delete</DangerButton>

 instead of:

     <BaseButton variant="danger" @click="confirmDelete">Delete</BaseButton>

 -----------------------------------------------------------------------------
 Visual identity
 -----------------------------------------------------------------------------
 The danger variant renders with the darkest crimson surface
 (--mases-color-action-danger, resolving to crimson-700). It is visually
 distinct from the primary button's crimson-600 surface, so a
 confirmation dialog with "Save" (primary) and "Delete" (danger) does
 not present two identical-looking buttons.

 -----------------------------------------------------------------------------
 When to use it
 -----------------------------------------------------------------------------
 The danger variant is reserved for actions whose primary effect is
 destructive, irreversible, or financially risky:

   - Delete, force-delete, restore-from-archive confirmations.
   - Wallet allocation reversals.
   - Certificate cancellations.
   - Shareholder deactivations.
   - Any action where the user must perceive that the operation is not
     routine.

 It is NOT for:
   - Cancel buttons on non-destructive forms (use SecondaryButton).
   - Dismiss buttons on alerts (use GhostButton).
   - Navigation to a "dangerous-looking" page (use LinkButton or a
     regular link).

 Overuse of the danger variant dilutes its signal. Reserve it.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 This component declares NO design tokens and defines NO CSS. Every
 visual value is inherited from BaseButton, which itself consumes only
 Tier 2 semantic tokens from tokens.css. There is no <style> block in
 this file by design.

 -----------------------------------------------------------------------------
 What is forwarded
 -----------------------------------------------------------------------------
 - Every declared prop of BaseButton except `variant` is declared here
   and passed explicitly to BaseButton.
 - Every slot of BaseButton (default, leading, trailing) is forwarded
   conditionally: a named slot is only passed to BaseButton when the
   consumer supplies it. This preserves BaseButton's `v-if="$slots.X"`
   logic so that no empty wrapper element is rendered.
 - The `click` emit is re-emitted through the wrapper so consumers
   receive it with a stable TypeScript contract.

 -----------------------------------------------------------------------------
 Known limitation — fallthrough `variant`
 -----------------------------------------------------------------------------
 Same limitation as PrimaryButton (Unit 8.3), SecondaryButton (Unit 8.4),
 and GhostButton (Unit 8.5). Because `variant` is not declared as a prop
 on this component, an explicit `variant="..."` attribute passed by a
 consumer would fall through to BaseButton and override the hardcoded
 "danger" binding.

 A consumer that needs a different variant uses BaseButton directly or
 the corresponding named wrapper. Defending against the fallthrough
 would require `inheritAttrs: false` plus manual attribute merging — a
 CR-worthy change if the need ever arises.

 -----------------------------------------------------------------------------
 Test hook
 -----------------------------------------------------------------------------
 data-testid="danger-button-root" on the rendered <button>.

 BaseButton's own sub-element test ids (base-button-spinner,
 base-button-label, base-button-leading, base-button-trailing) remain
 on the child elements and are not rewritten.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 Unchanged from BaseButton (INTERACTIVE). This wrapper introduces no
 additional interactive surface.

 Note on color-only danger signaling: the danger variant's color is
 NEVER the sole indicator of destructiveness. Any surface that uses a
 DangerButton pairs it with an explicit verb ("Delete", "Reverse",
 "Cancel certificate") and, in modal confirmations, an explanatory
 message. The design system forbids color-only state (Design System
 §11.7), and this component's consumers are expected to comply.
=============================================================================
-->

<script setup lang="ts">
import BaseButton from '../BaseButton';
import type { ButtonSize, ButtonType } from '../BaseButton';

interface Props {
  /** Size. Defaults to 'md'. */
  size?: ButtonSize;

  /** Native button type. Defaults to 'button'. */
  type?: ButtonType;

  /** Disables the button. */
  disabled?: boolean;

  /** Shows a loading spinner and disables the button. */
  loading?: boolean;

  /** Stretches the button to fill its container. */
  block?: boolean;

  /** Renders the button with equal padding for a single icon. */
  iconOnly?: boolean;

  /**
   * Accessible name. Required when iconOnly is true.
   */
  ariaLabel?: string;
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
  iconOnly: false,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  (event: 'click', payload: MouseEvent): void;
}>();

function handleClick(event: MouseEvent): void {
  emit('click', event);
}
</script>

<template>
  <BaseButton
    variant="danger"
    :size="size"
    :type="type"
    :disabled="disabled"
    :loading="loading"
    :block="block"
    :icon-only="iconOnly"
    :aria-label="ariaLabel"
    data-testid="danger-button-root"
    @click="handleClick"
  >
    <!--
      Forward the `leading` slot only when the consumer actually supplies
      it. See Unit 8.3 for the rationale (avoids rendering an empty
      wrapper <span> inside BaseButton).
    -->
    <template v-if="$slots.leading" #leading>
      <slot name="leading" />
    </template>

    <!-- Default slot (label, or icon in icon-only mode). -->
    <slot />

    <!-- Same conditional rule as `leading`. -->
    <template v-if="$slots.trailing" #trailing>
      <slot name="trailing" />
    </template>
  </BaseButton>
</template>

<!--
 No <style> block.
 All styling is owned by BaseButton and by the shared design tokens.
 Adding styles here would violate the design-system rule (Architecture
 Freeze §16.4) and would risk drift between the danger button rendered
 via BaseButton and the same button rendered via DangerButton.
-->