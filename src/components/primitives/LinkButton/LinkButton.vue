<!--
=============================================================================
 MASES Phase 2 UI — LinkButton
=============================================================================

 File:      mase_app/src/components/primitives/LinkButton/LinkButton.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.6
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A thin convenience wrapper over BaseButton with the visual variant fixed
 to "link". It exists so consumers can write:

     <LinkButton @click="forgotPassword">Forgot password?</LinkButton>

 instead of:

     <BaseButton variant="link" @click="forgotPassword">
       Forgot password?
     </BaseButton>

 -----------------------------------------------------------------------------
 Visual identity
 -----------------------------------------------------------------------------
 The link variant renders as inline text in the brand action color
 (--mases-color-action-link, resolving to crimson-600) with no
 background, no border, no padding, and no minimum height. It receives
 an underline on hover or focus. It is designed to be visually
 indistinguishable from a hyperlink, while remaining a real <button>
 element for the semantic and behavioral reasons described below.

 -----------------------------------------------------------------------------
 When to use it
 -----------------------------------------------------------------------------
 The link variant is reserved for actions that:

   - Trigger JavaScript behavior (not navigation).
   - Appear inline within prose, form labels, or card footers.
   - Are subordinate to a primary or secondary action on the same
     surface.

 Typical uses:
   - "Forgot password?" on the login form.
   - "Show more" / "Show less" disclosure toggles.
   - "Copy to clipboard" inline actions.
   - "Resend verification email" on the verification flow.
   - The destructive "Remove" action in a chip or tag list, where a
     DangerButton would carry disproportionate visual weight.

 It is NOT for:

   - Navigation to a route (use <RouterLink> or <BaseLink>).
   - Navigation to an external URL (use <BaseLink external>).
   - Primary or secondary actions (use PrimaryButton / SecondaryButton).
   - Destructive confirmations where the destructive verb must be
     prominent (use DangerButton).

 -----------------------------------------------------------------------------
 Why <button> and not <a>
 -----------------------------------------------------------------------------
 A link variant that triggers a JavaScript action must remain a
 <button> element, not an <a>. The reasons:

   1. Semantic correctness. <a> without a meaningful href is a misuse
      of the anchor element; assistive technology announces it as a
      link, which misleads screen-reader users about the expected
      behavior.

   2. Keyboard correctness. <a href="#"> requires preventDefault()
      handling and does not participate in the browser's Enter-key
      activation semantics the same way <button> does.

   3. Focus management. <button> is the correct primitive for an
      action. <a> is the correct primitive for a hyperlink.

 The component therefore keeps <button> semantics and mimics the link
 appearance. A consumer that needs actual navigation uses RouterLink or
 BaseLink.

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

 Note on size: the link variant in BaseButton has fixed inline padding
 (0) and inline height (auto). The `size` prop still controls font
 size and line height, so `size="sm"` and `size="lg"` remain meaningful
 for inline links in different contexts. `size="md"` is the default.

 -----------------------------------------------------------------------------
 Known limitation — fallthrough `variant`
 -----------------------------------------------------------------------------
 Same limitation as PrimaryButton (Unit 8.3), SecondaryButton (Unit 8.4),
 GhostButton (Unit 8.5), and DangerButton (Unit 8.6). Because `variant`
 is not declared as a prop on this component, an explicit `variant="..."`
 attribute passed by a consumer would fall through to BaseButton and
 override the hardcoded "link" binding.

 A consumer that needs a different variant uses BaseButton directly or
 the corresponding named wrapper. Defending against the fallthrough
 would require `inheritAttrs: false` plus manual attribute merging — a
 CR-worthy change if the need ever arises.

 -----------------------------------------------------------------------------
 Test hook
 -----------------------------------------------------------------------------
 data-testid="link-button-root" on the rendered <button>.

 BaseButton's own sub-element test ids (base-button-spinner,
 base-button-label, base-button-leading, base-button-trailing) remain
 on the child elements and are not rewritten.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 Unchanged from BaseButton (INTERACTIVE). This wrapper introduces no
 additional interactive surface.

 Two notes specific to the link variant:

   1. Color is not the sole indicator of interactivity. The link
      variant receives an underline on hover and focus, and the
      surrounding text context communicates its role.

   2. The link variant's contrast is verified in the Design System
      §2.5.1: --mases-color-action-link against --mases-color-
      surface-page is 8.03:1, comfortably above WCAG 2.1 AA for body
      text.
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

  /**
   * Stretches the button to fill its container.
   *
   * For the link variant, block=true renders the button as a block
   * element. This is occasionally useful in a stacked action list but
   * is rarely the right choice for an inline link — consumers should
   * verify that block layout matches the surrounding prose or label.
   */
  block?: boolean;

  /**
   * Renders the button with equal padding for a single icon.
   *
   * The link variant rarely uses iconOnly. When it does, the consumer
   * MUST supply `ariaLabel` — the requirement is enforced by
   * BaseButton's development-time warning (see Unit 8.2).
   */
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
    variant="link"
    :size="size"
    :type="type"
    :disabled="disabled"
    :loading="loading"
    :block="block"
    :icon-only="iconOnly"
    :aria-label="ariaLabel"
    data-testid="link-button-root"
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
 Freeze §16.4) and would risk drift between the link button rendered
 via BaseButton and the same button rendered via LinkButton.
-->