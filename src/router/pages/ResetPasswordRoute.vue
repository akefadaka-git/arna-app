<!--
=============================================================================
 CHANGE VERIFICATION — L-4.4
=============================================================================

 File:      mase_app/src/router/pages/ResetPasswordRoute.vue  (AMEND)
 Unit:      L-4.4 — PageTitle adoption (reset-password)
 Delivery type:  Refactor — declarative document.title via <PageTitle>.
                 One import added, one import removed, one hook removed,
                 one element added to the template.
 Net lines:      +~45 docblock; −10 lines in <script setup> (the
                 onMounted hook and its comments); +1 template element.

 Before (v1.2.0):
   The wrapper set the page title in an onMounted hook:

     onMounted(() => {
       const pageLabel = resetPasswordFormLabels.formAriaLabel;
       const appName = import.meta.env.VITE_APP_NAME;
       if (typeof appName === 'string' && appName.length > 0) {
         document.title = `${pageLabel} — ${appName}`;
       } else {
         document.title = pageLabel;
       }
     });

   The v1.2.0 docblock did not explicitly anticipate this migration,
   but the mechanism (onMounted) is identical to the one L-4.1
   removed from LoginRoute.

 After (v1.3.0):
   The wrapper delegates to <PageTitle>:

     <PageTitle
       :title="resetPasswordFormLabels.formAriaLabel"
       :suffix="appName"
     />

   Observable behaviour on the route is identical:

     VITE_APP_NAME = "MASES"
       v1.2.0  →  document.title = "የይለፍ ቃልዎን ያስጀምሩ — MASES"
       v1.3.0  →  document.title = "የይለፍ ቃልዎን ያስጀምሩ — MASES"   (identical)

     VITE_APP_NAME = "" or absent at runtime
       v1.2.0  →  document.title = "የይለፍ ቃልዎን ያስጀምሩ"
       v1.3.0  →  document.title = "የይለፍ ቃልዎን ያስጀምሩ"           (identical)

   The behaviour on unmount differs in one respect: PageTitle
   restores the previous document.title when the route changes.
   In practice the next route's wrapper (or its absence) determines
   the visible title immediately after navigation, so the restore
   is transparent.

   No other behaviour change. Both emit handlers, the brand slot,
   the AuthLayout composition, the ResetPasswordForm binding, and
   the scoped styles are byte-for-byte identical to v1.2.0.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — ResetPasswordRoute
=============================================================================

 File:      mase_app/src/router/pages/ResetPasswordRoute.vue
 Layer:     Core (router page)
 Version:   1.3.0
 Status:    FROZEN
 Authority: Stage 12 · Unit 12.9 §"Consumed by"
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            L-4.4 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Composes AuthLayout with
          ResetPasswordForm.

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

          No change to the template, script, emit handlers,
          route contract, logo, or title composition. Visual
          result is byte-for-byte identical when tokens load
          correctly.

 1.3.0  — L-4.4. Delegates document.title management to <PageTitle>.

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

          No other change. The two emit handlers (`onRequestNewLink`
          and `onBackToLogin`), the AuthLayout composition with
          logoSrc="/logo.png", the brand slot's <h1>, the
          ResetPasswordForm binding with its one prop and two emits,
          and every scoped style rule with its fallback value are
          byte-for-byte identical to v1.2.0.

          See the file docblock §"Why <PageTitle> is used" for the
          composition contract.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The route wrapper for /reset-password/:token. Composes
 AuthLayout (Unit 12.1 v1.3.0) with ResetPasswordForm (Unit 12.9
 v2.1.0) and handles the form's two navigation emits.

 -----------------------------------------------------------------------------
 Route contract
 -----------------------------------------------------------------------------
 The route must be declared with the `:token` path parameter. The
 form reads it from useRoute().params.token. The route is also
 expected to be visited with an `?email=<address>` query
 parameter; without it, ResetPasswordForm renders its invalid-link
 panel instead of the form. See that file's docblock §"Route
 contract".

 The route is declared in ./routes-base.ts (the 1.1.0 revision of
 that file points this path at THIS wrapper, not at the form
 component). The wrapper assumes the route exists and reads the
 URL as given.

 The wrapper does not read the `:token` or `?email` values
 itself; the form owns both. This is unchanged by the L-4.4
 migration.

 -----------------------------------------------------------------------------
 Emit wiring
 -----------------------------------------------------------------------------
 ResetPasswordForm emits two intent events:

   · `request-new-link` — emitted from the invalid-link panel
     (when the token or email is missing from the URL). The user
     wants to restart the reset flow. Handled by navigating to
     /forgot-password.

   · `back-to-login` — emitted from the invalid-link panel and
     from the success panel. Handled by navigating to /login.

 Both use router.push (not replace) so the browser's Back button
 returns the user to the reset page. The reasoning is the same as
 in LoginRoute; see that file's docblock §"The two emit
 handlers".

 -----------------------------------------------------------------------------
 Why <PageTitle> is used
 -----------------------------------------------------------------------------
 The wrapper is the correct owner of the page title: the wrapper
 knows the route's purpose, the form it composes does not.

 The composition is declarative:

     <PageTitle
       :title="resetPasswordFormLabels.formAriaLabel"
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
 component, matching the pattern L-4.1 through L-4.3 established
 and that the remaining L-4 siblings will follow.

 -----------------------------------------------------------------------------
 Page title
 -----------------------------------------------------------------------------
 The composed title is `{pageLabel} — {appName}`:

     pageLabel = resetPasswordFormLabels.formAriaLabel
                 ("የይለፍ ቃልዎን ያስጀምሩ" / "Reset your password")
     appName   = import.meta.env.VITE_APP_NAME

 In the workspace build, the title reads
 "የይለፍ ቃልዎን ያስጀምሩ — MASES"; in the portal build,
 "የይለፍ ቃልዎን ያስጀምሩ — Maale Arna Portal".

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
 `resetPasswordFormLabels.formAriaLabel` and
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
 AuthLayout and ResetPasswordForm it composes carry the test
 hooks those components declare.

 The PageTitle component also contributes no test hook — it
 renders nothing. A test that wants to verify the tab title
 asserts against `document.title` directly.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - The page's single <h1> is rendered in the brand slot. It
     names the page ("የይለፍ ቃልዎን ያስጀምሩ" / "Reset your password").
   - The logo carries alt text (the application name).
   - No focus management on mount — AuthLayout does not steal
     focus, and ResetPasswordForm manages its own auto-focus on
     the new-password input (or renders the invalid-link panel
     without any focus target when the URL is malformed).
   - PageTitle renders nothing; it does not affect the
     accessibility tree.
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script setup lang="ts">
import { useRouter } from 'vue-router';

import AuthLayout from '@/features/auth/AuthLayout';
import ResetPasswordForm from '@/features/auth/ResetPasswordForm';
import PageTitle from '@/layouts/AppShell/PageTitle';
import { resetPasswordFormLabels } from '@/router/auth-labels';

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
// Navigation handlers
// -----------------------------------------------------------------------------
/*
 * Both use router.push (not replace) so the browser's Back button
 * returns the user to the reset page.
 */

async function onRequestNewLink(): Promise<void> {
  await router.push('/forgot-password');
}

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
    :title="resetPasswordFormLabels.formAriaLabel"
    :suffix="appName"
  />

  <AuthLayout logoSrc="/logo.png">
    <template #brand>
      <h1 class="reset-password-route__title">
        {{ resetPasswordFormLabels.formAriaLabel }}
      </h1>
    </template>

    <ResetPasswordForm
      :labels="resetPasswordFormLabels"
      @request-new-link="onRequestNewLink"
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
.reset-password-route__title {
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