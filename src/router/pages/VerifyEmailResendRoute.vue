<!--
=============================================================================
 CHANGE VERIFICATION — L-4.6
=============================================================================

 File:      mase_app/src/router/pages/VerifyEmailResendRoute.vue  (AMEND)
 Unit:      L-4.6 — PageTitle adoption (verify-email/resend)
 Delivery type:  Refactor — declarative document.title via <PageTitle>.
                 One import added, one import removed, one hook removed,
                 one element added to the template.
 Net lines:      +~45 docblock; −10 lines in <script setup> (the
                 onMounted hook and its comments); +1 template element.

 Before (v1.2.0):
   The wrapper set the page title in an onMounted hook:

     onMounted(() => {
       const pageLabel = verifyEmailResendLabels.formAriaLabel;
       const appName = import.meta.env.VITE_APP_NAME;
       if (typeof appName === 'string' && appName.length > 0) {
         document.title = `${pageLabel} — ${appName}`;
       } else {
         document.title = pageLabel;
       }
     });

   The v1.2.0 docblock did not explicitly anticipate this migration,
   but the mechanism (onMounted) is identical to the one L-4.1
   removed from LoginRoute and L-4.3 removed from
   ForgotPasswordRoute.

 After (v1.3.0):
   The wrapper delegates to <PageTitle>:

     <PageTitle
       :title="verifyEmailResendLabels.formAriaLabel"
       :suffix="appName"
     />

   Observable behaviour on the route is identical:

     VITE_APP_NAME = "MASES"
       v1.2.0  →  document.title = "የማረጋገጫ ኢሜይል እንደገና ላክ — MASES"
       v1.3.0  →  document.title = "የማረጋገጫ ኢሜይል እንደገና ላክ — MASES"   (identical)

     VITE_APP_NAME = "" or absent at runtime
       v1.2.0  →  document.title = "የማረጋገጫ ኢሜይል እንደገና ላክ"
       v1.3.0  →  document.title = "የማረጋገጫ ኢሜይል እንደገና ላክ"           (identical)

   The behaviour on unmount differs in one respect: PageTitle
   restores the previous document.title when the route changes.
   In practice the next route's wrapper (or its absence) determines
   the visible title immediately after navigation, so the restore
   is transparent.

   No other behaviour change. The single emit handler, the brand
   slot, the AuthLayout composition, the VerifyEmailResend
   binding, and the scoped styles are byte-for-byte identical to
   v1.2.0.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — VerifyEmailResendRoute
=============================================================================

 File:      mase_app/src/router/pages/VerifyEmailResendRoute.vue
 Layer:     Core (router page)
 Version:   1.3.0
 Status:    FROZEN
 Authority: Stage 12 · Unit 12.11 §"Consumed by"
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            L-4.6 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Composes AuthLayout with
          VerifyEmailResend.

 1.1.0  — brand and title:
          · logoSrc="/logo.png" passed to AuthLayout.
          · document.title set on mount.

 1.2.0  — CSS custom property fallbacks. Every var() reference in
          this file's title rule now carries a fallback value:

              var(--token-name, fallback-value)

          The fallback is used when the custom property is
          undefined or invalid.

          WHY: The heading styles reference
          --mases-color-text-primary,
          --mases-font-size-heading-4,
          --mases-line-height-heading-4, and
          --mases-font-weight-semibold. With no fallbacks, an
          undefined token makes the individual declaration
          invalid and the browser drops it — the heading renders
          with the browser's default font size, color, and line
          height rather than the design-system values.

          The fallbacks are the exact values the tokens resolve
          to in tokens.css, so the heading looks identical
          whether the tokens load or not. The fallbacks are
          never consulted in the normal case.

          No change to the template, script, emit handler, route
          contract, logo, or title composition. Visual result is
          byte-for-byte identical when tokens load correctly.

 1.3.0  — L-4.6. Delegates document.title management to <PageTitle>.

          Prior to this revision, the title was composed and applied
          in an onMounted hook. PageTitle v1.0.0 — delivered at
          Stage 11, unused until L-4.1 — performs the same
          composition declaratively, with the same three structural
          advantages documented in L-4.1 (LoginRoute v1.3.0):

            · It restores the previous document.title on unmount.
            · It re-evaluates when its props change.
            · It is the single source of document.title logic for
              every route wrapper.

          The migration removes the `onMounted` import and the
          `onMounted(() => { … })` hook; it adds the `PageTitle`
          import and one `<PageTitle>` element as a sibling of the
          AuthLayout.

          No other change. The single `onBackToLogin` emit handler,
          the AuthLayout composition with logoSrc="/logo.png", the
          brand slot's <h1>, the VerifyEmailResend binding with its
          one prop and one emit, and every scoped style rule with
          its fallback value are byte-for-byte identical to v1.2.0.

          See the file docblock §"Why <PageTitle> is used" for the
          composition contract.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The route wrapper for /verify-email/resend. Composes AuthLayout
 (Unit 12.1 v1.3.0) with VerifyEmailResend (Unit 12.11 v1.2.0)
 and handles the form's single navigation emit.

 -----------------------------------------------------------------------------
 Route contract
 -----------------------------------------------------------------------------
 The route is declared in ./routes-base.ts. It is declared BEFORE
 the parameterized /verify-email/:id/:hash route, because Vue
 Router's static-segment preference works most reliably when the
 literal path is unambiguous. See routes-base.ts's docblock
 §"Email verification" for the full reasoning.

 The wrapper assumes the route exists and reads the URL as given.

 -----------------------------------------------------------------------------
 Emit wiring
 -----------------------------------------------------------------------------
 VerifyEmailResend emits one intent event:

   · `back-to-login` — emitted from every state (form, sent,
     already-verified). Handled by navigating to /login.

 Uses router.push (not replace) so the browser's Back button
 returns the user to the resend page.

 Note: VerifyEmailResend does NOT emit a "try another email"
 event. Its "try another email" link is a local state transition
 within the panel (it switches the panel back to the form state
 without navigating). That is by design — the "try another
 email" action is not a navigation, and routing it through the
 wrapper would be a mistake. See VerifyEmailResend's docblock for
 the full reasoning.

 -----------------------------------------------------------------------------
 Why <PageTitle> is used
 -----------------------------------------------------------------------------
 The wrapper is the correct owner of the page title: the wrapper
 knows the route's purpose, the form it composes does not.

 The composition is declarative:

     <PageTitle
       :title="verifyEmailResendLabels.formAriaLabel"
       :suffix="appName"
     />

 PageTitle (v1.0.0, src/layouts/AppShell/PageTitle/) is the
 shell's canonical document.title manager. It composes the
 string from a title and an optional suffix separated by an
 em-dash (the default separator is ` — `), handles the
 empty-suffix case by omitting the separator, restores the
 previous document.title on unmount, and re-runs when its props
 change.

 The separator PageTitle uses by default (` — `) is the same one
 v1.2.0's inline composition used, so the observable title is
 identical.

 Before v1.3.0, this wrapper duplicated PageTitle's logic in an
 onMounted hook. The wrapper now delegates to the shared
 component, matching the pattern L-4.1 through L-4.5 established
 and that the remaining L-4 siblings will follow.

 -----------------------------------------------------------------------------
 Page title
 -----------------------------------------------------------------------------
 The composed title is `{pageLabel} — {appName}`:

     pageLabel = verifyEmailResendLabels.formAriaLabel
                 ("የማረጋገጫ ኢሜይል እንደገና ላክ" / "Resend verification email")
     appName   = import.meta.env.VITE_APP_NAME

 In the workspace build, the title reads
 "የማረጋገጫ ኢሜይል እንደገና ላክ — MASES"; in the portal build,
 "የማረጋገጫ ኢሜይል እንደገና ላክ — Maale Arna Portal".

 No cleanup on unmount is required in this file: PageTitle owns
 the restore-on-unmount behaviour. When the user navigates away,
 the next route's wrapper (or its absence) determines the
 visible title.

 -----------------------------------------------------------------------------
 Logo and brand slot
 -----------------------------------------------------------------------------
 Same pattern as the other wrappers — /logo.png, alt text from
 VITE_APP_NAME, h1 in the brand slot. The heading string is the
 same one the page title uses, so the browser tab and the page
 heading agree.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The only visible string this file contributes is the page
 title, which is composed from
 `verifyEmailResendLabels.formAriaLabel` and
 `import.meta.env.VITE_APP_NAME`. Both are supplied by the
 environment or the label set — no literal string appears in this
 file except the em-dash separator (now owned by PageTitle, not
 this file).

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css, expressed
 with a fallback. No hex value appears in this file except as a
 fallback value that mirrors a token.

 Colors used:
   --mases-color-text-primary   (h1 text color)
     fallback: #141009 — the resolved value of
     --mases-color-neutral-900, which is what the token
     resolves to.

 Typography used:
   --mases-font-size-heading-4        fallback: 24px
   --mases-line-height-heading-4      fallback: 32px
   --mases-font-weight-semibold       fallback: 600

 -----------------------------------------------------------------------------
 Production readiness
 -----------------------------------------------------------------------------
 Browser features this file relies on:

   · CSS custom properties with fallback   — universal.
   · `<script setup>`, `onMounted`          — build-time / runtime.
     (onMounted is no longer used by this file as of v1.3.0; the
     entry is retained here to record that the previous version
     relied on it and to make the removal easy to verify.)
   · `import.meta.env`                      — Vite build-time.
   · Vue Router's `useRouter`               — runtime only.

 No feature below the target matrix floor is introduced here.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 The wrapper contributes no test hooks of its own. The
 AuthLayout and VerifyEmailResend it composes carry the test
 hooks those components declare.

 The PageTitle component also contributes no test hook — it
 renders nothing. A test that wants to verify the tab title
 asserts against `document.title` directly.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - The page's single <h1> is rendered in the brand slot. It
     names the page ("የማረጋገጫ ኢሜይል እንደገና ላክ" / "Resend
     verification email").
   - The logo carries alt text (the application name).
   - No focus management on mount — AuthLayout does not steal
     focus, and VerifyEmailResend manages its own auto-focus on
     the email input.
   - PageTitle renders nothing; it does not affect the
     accessibility tree.
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script setup lang="ts">
import { useRouter } from 'vue-router';

import AuthLayout from '@/features/auth/AuthLayout';
import VerifyEmailResend from '@/features/auth/VerifyEmailResend';
import PageTitle from '@/layouts/AppShell/PageTitle';
import { verifyEmailResendLabels } from '@/router/auth-labels';

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------
const router = useRouter();

// -----------------------------------------------------------------------------
// Page title suffix
// -----------------------------------------------------------------------------
/*
 * The application name, injected at build time by Vite from
 * VITE_APP_NAME. The variable is declared non-optional in
 * vite-env.d.ts (v1.1.0), so the assignment is a plain string, not
 * `string | undefined`.
 *
 * The value is set per build mode:
 *   workspace  →  "MASES"
 *   portal     →  "Maale Arna Portal"
 *
 * Passed to <PageTitle> as the title's suffix. PageTitle's own
 * guard handles an empty-string suffix by omitting the separator;
 * see the file docblock §"Why <PageTitle> is used".
 */
const appName: string = import.meta.env.VITE_APP_NAME;

// -----------------------------------------------------------------------------
// Navigation handler
// -----------------------------------------------------------------------------
/*
 * Uses router.push (not replace) so the browser's Back button
 * returns the user to the resend page.
 */
async function onBackToLogin(): Promise<void> {
  await router.push('/login');
}
</script>

<template>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to AuthLayout so that its lifetime matches the route's lifetime.
  -->
  <PageTitle
    :title="verifyEmailResendLabels.formAriaLabel"
    :suffix="appName"
  />

  <AuthLayout logoSrc="/logo.png">
    <template #brand>
      <h1 class="verify-email-resend-route__title">
        {{ verifyEmailResendLabels.formAriaLabel }}
      </h1>
    </template>

    <VerifyEmailResend
      :labels="verifyEmailResendLabels"
      @back-to-login="onBackToLogin"
    />
  </AuthLayout>
</template>

<style scoped>
/* ============================================================================
   Page heading (rendered in AuthLayout's brand slot)
   ---------------------------------------------------------------------------
   Same typography as the other auth route headings. Every var()
   reference carries a fallback per the file docblock §"Revision
   history" (the 1.2.0 entry). The fallback values are the exact
   resolved values from tokens.css, so the visual result is
   identical whether the tokens load or not.
   ============================================================================ */
.verify-email-resend-route__title {
  margin: 0;

  /*
   * Fallback #141009 is the resolved value of
   * --mases-color-neutral-900, which is what
   * --mases-color-text-primary resolves to.
   */
  color: var(--mases-color-text-primary, #141009);

  font-family: inherit;

  /* Fallback 24px matches --mases-font-size-heading-4. */
  font-size: var(--mases-font-size-heading-4, 24px);

  /* Fallback 32px matches --mases-line-height-heading-4. */
  line-height: var(--mases-line-height-heading-4, 32px);

  /* Fallback 600 matches --mases-font-weight-semibold. */
  font-weight: var(--mases-font-weight-semibold, 600);

  text-align: center;

  /*
   * Amharic-safe wrapping. A long translation of the page
   * heading must break across lines rather than overflow the
   * card's width.
   */
  overflow-wrap: anywhere;
}
</style>