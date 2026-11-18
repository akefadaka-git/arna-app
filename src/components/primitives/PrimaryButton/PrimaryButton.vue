<!--
=============================================================================
 MASES Phase 2 UI — PrimaryButton
=============================================================================

 File:      mase_app/src/components/primitives/PrimaryButton/PrimaryButton.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A thin convenience wrapper over BaseButton with the visual variant fixed
 to "primary". It exists so consumers can write:

     <PrimaryButton @click="submit">Save</PrimaryButton>

 instead of:

     <BaseButton variant="primary" @click="submit">Save</BaseButton>

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
 Because `variant` is not declared as a prop on this component, an
 explicit `variant="..."` attribute passed by a consumer would fall
 through to BaseButton and override the hardcoded "primary" binding.

 In practice this does not occur: a consumer that chooses
 <PrimaryButton> has already selected the primary variant. A consumer
 that needs a different variant uses BaseButton or the corresponding
 named wrapper. This is documented here rather than defended against,
 to keep the wrapper thin. Adding defense would require `inheritAttrs:
 false` plus manual attribute merging — a CR-worthy change if the need
 ever arises.

 -----------------------------------------------------------------------------
 Test hook
 -----------------------------------------------------------------------------
 data-testid="primary-button-root" on the rendered <button>.

 BaseButton's own sub-element test ids (base-button-spinner,
 base-button-label, base-button-leading, base-button-trailing) remain
 on the child elements and are not rewritten. A consumer that needs to
 reach the spinner or the label uses BaseButton's sub-element id.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 Unchanged from BaseButton (INTERACTIVE). This wrapper introduces no
 additional interactive surface.
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
    variant="primary"
    :size="size"
    :type="type"
    :disabled="disabled"
    :loading="loading"
    :block="block"
    :icon-only="iconOnly"
    :aria-label="ariaLabel"
    data-testid="primary-button-root"
    @click="handleClick"
  >
    <!--
      Forward the `leading` slot only when the consumer actually supplies
      it. The conditional `v-if` on the <template #slot> block prevents
      BaseButton from receiving an empty leading slot (which would cause
      its wrapper <span> to render with no content, producing a stray
      gap between the leading region and the label).
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
 Freeze §16.4) and would risk drift between the primary button rendered
 via BaseButton and the same button rendered via PrimaryButton.
-->