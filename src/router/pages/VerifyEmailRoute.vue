<!--
=============================================================================
 CHANGE VERIFICATION — L-4.5
=============================================================================

 File:      mase_app/src/router/pages/VerifyEmailRoute.vue  (AMEND)
 Unit:      L-4.5 — PageTitle adoption (verify-email)
 Delivery type:  Refactor — declarative document.title via <PageTitle>.
                 One import added, one import removed, one hook removed,
                 one element added to the template.
 Net lines:      +~50 docblock; −10 lines in <script setup> (the
                 onMounted hook and its comments); +1 template element.

 Before (v1.2.0):
   The wrapper set the page title in an onMounted hook:

     onMounted(() => {
       const pageLabel = verifyEmailPanelLabels.verifyingTitle;
       const appName = import.meta.env.VITE_APP_NAME;
       if (typeof appName === 'string' && appName.length > 0) {
         document.title = `${pageLabel} — ${appName}`;
       } else {
         document.title = pageLabel;
       }
     });

   The page title used `verifyingTitle` — the label for the panel's
   INITIAL state ("ኢሜይልዎን በማረጋገጥ ላይ" / "Verifying your email") —
   regardless of the state the panel eventually resolves to. The
   v1.2.0 docblock records why: "the title remains stable across
   state transitions: the tab reads 'verifying' even after the
   state has moved to 'verified'. This is deliberate — the panel's
   own <h2> changes with the state, and a browser tab title that
   also changed would introduce a second, redundant state
   indicator."

   The same stable-title behaviour is preserved by the migration.
   PageTitle receives a fixed `:title` that does not depend on the
   panel's internal state; PageTitle re-runs only when its props
   change, and its props never change in this component's lifetime.

 After (v1.3.0):
   The wrapper delegates to <PageTitle>:

     <PageTitle
       :title="verifyEmailPanelLabels.verifyingTitle"
       :suffix="appName"
     />

   Observable behaviour on the route is identical:

     VITE_APP_NAME = "MASES"
       v1.2.0  →  document.title = "ኢሜይልዎን በማረጋገጥ ላይ — MASES"
       v1.3.0  →  document.title = "ኢሜይልዎን በማረጋገጥ ላይ — MASES"   (identical)

     VITE_APP_NAME = "" or absent at runtime
       v1.2.0  →  document.title = "ኢሜይልዎን በማረጋገጥ ላይ"
       v1.3.0  →  document.title = "ኢሜይልዎን በማረጋገጥ ላይ"           (identical)

   The behaviour on unmount differs in one respect: PageTitle
   restores the previous document.title when the route changes.
   In practice the next route's wrapper (or its absence) determines
   the visible title immediately after navigation, so the restore
   is transparent.

   No other behaviour change. All three emit handlers, the brand
   slot, the AuthLayout composition, the VerifyEmailPanel binding,
   and the scoped styles are byte-for-byte identical to v1.2.0.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — VerifyEmailRoute
=============================================================================

 File:      mase_app/src/router/pages/VerifyEmailRoute.vue
 Layer:     Core (router page)
 Version:   1.3.0
 Status:    FROZEN
 Authority: Stage 12 · Unit 12.10 §"Consumed by"
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            L-4.5 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Composes AuthLayout with
          VerifyEmailPanel.

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

          No change to the template, script, emit handlers, route
          contract, logo, or title composition. Visual result is
          byte-for-byte identical when tokens load correctly.

 1.3.0  — L-4.5. Delegates document.title management to <PageTitle>.

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

          The state-independent page title behaviour documented in
          v1.2.0 (§"Page title") is preserved — PageTitle receives
          a fixed `:title` that does not depend on the panel's
          internal state, and its props never change during the
          component's lifetime.

          No other change. All three emit handlers (`onContinue`,
          `onRequestNewLink`, `onBackToLogin`), the AuthLayout
          composition with logoSrc="/logo.png", the brand slot's
          <h1>, the VerifyEmailPanel binding with its one prop and
          three emits, and every scoped style rule with its fallback
          value are byte-for-byte identical to v1.2.0.

          See the file docblock §"Why <PageTitle> is used" for the
          composition contract.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The route wrapper for /verify-email/:id/:hash. Composes
 AuthLayout (Unit 12.1 v1.3.0) with VerifyEmailPanel (Unit 12.10
 v1.2.0) and handles the panel's three navigation emits.

 -----------------------------------------------------------------------------
 Route contract
 -----------------------------------------------------------------------------
 The route is declared in ./routes-base.ts with two path
 parameters, `:id` and `:hash`. The panel reads them from
 useRoute().params and calls the verify endpoint once on mount.
 See VerifyEmailPanel's docblock §"Read-once contract".

 The route is declared AFTER `/verify-email/resend` in
 routes-base.ts — the order matters because the literal path
 must be matched before the parameterized path. See that file's
 docblock §"Email verification" for the full reasoning.

 The wrapper does not read the `:id` or `:hash` values itself;
 the panel owns both. This is unchanged by the L-4.5 migration.

 -----------------------------------------------------------------------------
 Emit wiring
 -----------------------------------------------------------------------------
 VerifyEmailPanel emits three intent events:

   · `continue` — emitted from the verified and already-verified
     panels. The user's email is now verified; the next action
     is to log in. Handled by navigating to /login.

   · `request-new-link` — emitted from the failed panel. The
     token was expired, already used, or invalid; the user
     needs a fresh verification email. Handled by navigating to
     /verify-email/resend.

   · `back-to-login` — emitted from every state. Handled by
     navigating to /login.

 All three use router.push (not replace) so the browser's Back
 button returns the user to the verify page. The reasoning is the
 same as in LoginRoute; see that file's docblock §"The two emit
 handlers".

 -----------------------------------------------------------------------------
 Why <PageTitle> is used
 -----------------------------------------------------------------------------
 The wrapper is the correct owner of the page title: the wrapper
 knows the route's purpose, the form it composes does not.

 The composition is declarative:

     <PageTitle
       :title="verifyEmailPanelLabels.verifyingTitle"
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
 component, matching the pattern L-4.1 through L-4.4 established
 and that the remaining L-4 siblings will follow.

 -----------------------------------------------------------------------------
 Page title
 -----------------------------------------------------------------------------
 The VerifyEmailPanel has no single "page title" — it has four
 state-specific titles (verifying, verified, already-verified,
 failed). The route wrapper cannot compose a dynamic title from
 a form label the way the other wrappers do, because there is no
 single form label.

 This wrapper therefore uses
 `verifyEmailPanelLabels.verifyingTitle` — the label for the
 panel's initial state ("ኢሜይልዎን በማረጋገጥ ላይ" / "Verifying your
 email"). The title remains stable across state transitions: the
 tab reads "verifying" even after the state has moved to
 "verified". This is deliberate — the panel's own <h2> changes
 with the state, and a browser tab title that also changed would
 introduce a second, redundant state indicator.

 In the workspace build, the title reads
 "ኢሜይልዎን በማረጋገጥ ላይ — MASES"; in the portal build,
 "ኢሜይልዎን በማረጋገጥ ላይ — Maale Arna Portal".

 No cleanup on unmount is required in this file: PageTitle owns
 the restore-on-unmount behaviour. When the user navigates away,
 the next route's wrapper (or its absence) determines the
 visible title.

 A future revision that wants a distinct, state-independent page
 title should add a `pageTitle` key to verifyEmailPanelLabels.
 The wrapper would then read that key instead. That is a
 label-set change, not a wrapper change — the wrapper's structure
 is unaffected.

 -----------------------------------------------------------------------------
 Logo and brand slot
 -----------------------------------------------------------------------------
 Same pattern as the other wrappers. The brand slot renders the
 page's <h1> with the verifying title — the same string the
 panel's own <h2> uses in the verifying state. When the panel
 transitions to verified or failed, the panel's <h2> changes but
 the wrapper's <h1> does not; the two are different elements at
 different levels of the document outline, and only the panel's
 <h2> reflects the current state.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The only visible string this file contributes is the page
 title, which is composed from
 `verifyEmailPanelLabels.verifyingTitle` and
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
 AuthLayout and VerifyEmailPanel it composes carry the test hooks
 those components declare.

 The PageTitle component also contributes no test hook — it
 renders nothing. A test that wants to verify the tab title
 asserts against `document.title` directly.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - The page's single <h1> is rendered in the brand slot. It
     names the page ("ኢሜይልዎን በማረጋገጥ ላይ" / "Verifying your
     email").
   - The logo carries alt text (the application name).
   - No focus management on mount — AuthLayout does not steal
     focus, and VerifyEmailPanel is read-only (it has nothing to
     focus until the outcome state renders).
   - PageTitle renders nothing; it does not affect the
     accessibility tree.
   - Reduced motion: this file defines no animation. The panel's
     own verifying spinner is disabled under
     prefers-reduced-motion by the panel's own stylesheet.
=============================================================================
-->

<script setup lang="ts">
import { useRouter } from 'vue-router';

import AuthLayout from '@/features/auth/AuthLayout';
import VerifyEmailPanel from '@/features/auth/VerifyEmailPanel';
import PageTitle from '@/layouts/AppShell/PageTitle';
import { verifyEmailPanelLabels } from '@/router/auth-labels';

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
 * All three use router.push (not replace) so the browser's Back
 * button returns the user to the verify page.
 */

async function onContinue(): Promise<void> {
  await router.push('/login');
}

async function onRequestNewLink(): Promise<void> {
  await router.push('/verify-email/resend');
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

    The title is deliberately state-independent: it uses the
    panel's initial-state label (`verifyingTitle`) and does not
    change as the panel transitions between states. See the file
    docblock §"Page title".
  -->
  <PageTitle
    :title="verifyEmailPanelLabels.verifyingTitle"
    :suffix="appName"
  />

  <AuthLayout logoSrc="/logo.png">
    <template #brand>
      <h1 class="verify-email-route__title">
        {{ verifyEmailPanelLabels.verifyingTitle }}
      </h1>
    </template>

    <VerifyEmailPanel
      :labels="verifyEmailPanelLabels"
      @continue="onContinue"
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
.verify-email-route__title {
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