<!--
=============================================================================
 CHANGE VERIFICATION — L-4.1
=============================================================================

 File:      mase_app/src/router/pages/LoginRoute.vue  (AMEND)
 Unit:      L-4.1 — PageTitle adoption (login)
 Delivery type:  Refactor — declarative document.title via <PageTitle>.
                 One import added, one import removed, one hook removed,
                 one element added to the template.
 Net lines:      +~55 docblock; −10 lines in <script setup> (the
                 onMounted hook and its comments); +1 template element.

 Before (v1.2.0):
   The wrapper set the page title in an onMounted hook:

     onMounted(() => {
       const pageLabel = loginFormLabels.formAriaLabel;
       const appName = import.meta.env.VITE_APP_NAME;
       if (typeof appName === 'string' && appName.length > 0) {
         document.title = `${pageLabel} — ${appName}`;
       } else {
         document.title = pageLabel;
       }
     });

   The v1.2.0 docblock explicitly anticipated this migration:

     "When a future revision introduces PageTitle (or confirms an
      existing one should be used here), the change is mechanical:
      replace the `onMounted` hook with a `<PageTitle :title="..."/>`
      element in the template. The behavior is identical."

   PageTitle v1.0.0 was delivered at Stage 11 but never adopted by
   any route wrapper.

 After (v1.3.0):
   The wrapper delegates to <PageTitle>:

     <PageTitle :title="loginFormLabels.formAriaLabel" :suffix="appName" />

   PageTitle owns the composition, the empty-suffix guard, and the
   unmount restore. The wrapper owns only the values to pass.

   Observable behaviour on the route is identical:

     VITE_APP_NAME = "MASES"
       v1.2.0  →  document.title = "ግባ — MASES"
       v1.3.0  →  document.title = "ግባ — MASES"   (identical)

     VITE_APP_NAME = "" or absent at runtime
       v1.2.0  →  document.title = "ግባ"
       v1.3.0  →  document.title = "ግባ"           (identical)

   The behaviour on unmount differs in one respect: PageTitle
   restores the previous document.title when the route changes,
   where v1.2.0 left the value in place. In practice the next route's
   wrapper (or its absence) determines the visible title immediately
   after navigation, so the restore is transparent.

   No other behaviour change. The session-expired query parameter,
   the two navigation handlers, the brand slot, the scoped styles,
   the AuthLayout composition, and the LoginForm contract are
   byte-for-byte identical to v1.2.0.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — LoginRoute
=============================================================================

 File:      mase_app/src/router/pages/LoginRoute.vue
 Layer:     Core (router page)
 Version:   1.3.0
 Status:    FROZEN
 Authority: Stage 12 · Unit 12.6 §"Consumed by"
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            L-4.1 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Composes AuthLayout with LoginForm and
          wires the two form emits to router navigations.

 1.2.0  — brand, session-expired, and title enhancements:

          · Logo. `logoSrc="/logo.png"` is now passed to AuthLayout.
            The login page shows the brand mark above the card,
            centered. The file lives in the frontend project's
            `public/` directory and is served from the site root
            by Vite. See workspace-entry/index.html §"Why
            href='/favicon.png' uses an absolute path" for the
            reasoning — the same applies to /logo.png.

          · Session-expired detection. The wrapper reads the
            `?session=expired` query parameter and forwards it to
            LoginForm as the `sessionExpired` boolean prop. When
            true, the form renders an informational notice above
            the fields. This is the correct layering — the wrapper
            owns the URL, the form owns the presentation.

          · Page title. On mount, `document.title` is set to
            "{formAriaLabel} — {appName}" where `formAriaLabel` is
            the login form's accessible name and `appName` is
            `import.meta.env.VITE_APP_NAME`. In the workspace
            build, the title reads "ግባ — MASES"; in the portal
            build, "ግባ — Maale Arna Portal".

          · No changes to the two emit handlers, the brand slot,
            or the styles.

 1.3.0  — L-4.1. Delegates document.title management to <PageTitle>.

          Prior to this revision, the title was composed and applied
          in an onMounted hook. PageTitle v1.0.0 — delivered at
          Stage 11, unused until now — performs the same composition
          declaratively, with three structural advantages:

            · It restores the previous document.title on unmount,
              so a route with no PageTitle of its own inherits a
              coherent title rather than a stale one.
            · It re-evaluates when its props change, where the
              onMounted hook ran exactly once.
            · It is the single source of document.title logic for
              every route wrapper, so the L-4 group (this unit
              plus eleven siblings) applies one pattern rather than
              twelve near-identical onMounted hooks.

          None of the three advantages is observable on the login
          route specifically — the title's inputs are static for
          the component's lifetime — but the pattern is the correct
          one and it is what the remaining wrappers will adopt.

          The migration removes the `onMounted` import and the
          `onMounted(() => { … })` hook; it adds the `PageTitle`
          import and one `<PageTitle>` element at the top of the
          template. The `computed` import is retained for
          `sessionExpired`. The two navigation handlers, the brand
          slot, and the scoped styles are byte-for-byte identical
          to v1.2.0.

          See the file header's §"Why <PageTitle> is used" for the
          composition contract, and the companion change-verification
          block at the top of this file for the behaviour comparison
          against v1.2.0.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The route wrapper for /login. Composes AuthLayout (Unit 12.1
 v1.2.0) with LoginForm (Unit 12.6 v2.1.0) and handles the form's
 two navigation emits.

 Why a wrapper:
   LoginForm is a pure form component. It emits `forgot-password`
   and `register` intents but does not navigate or provide the
   page frame. The frame (centered card, page background, logo,
   brand mark, ARNA AI attribution) is AuthLayout's responsibility.
   This wrapper is the composition point.

 The same pattern is used for the other five auth routes
 (RegisterRoute, ForgotPasswordRoute, ResetPasswordRoute,
 VerifyEmailRoute, VerifyEmailResendRoute).

 -----------------------------------------------------------------------------
 Why the wrapper reads the query
 -----------------------------------------------------------------------------
 The wrapper reads `?session=expired` from the URL and passes the
 boolean result to LoginForm as the `sessionExpired` prop.

 Two concerns are separated by this arrangement:

   · The WRAPPER knows the route, its query parameters, and its
     place in the navigation graph. It answers "was the user
     redirected here from somewhere that wanted to show a
     notice?" — a routing question.

   · The FORM knows how to render a notice when it is told to. It
     does not need to know why. The form is a pure presentational
     component with respect to the notice — it renders it or it
     does not, based on a boolean prop.

 If a future navigation flow uses a different parameter name
 (say `?reason=session`), only the wrapper changes. The form's
 API is untouched.

 The query value is compared with strict equality to the string
 'expired'. A URL like `?session=foo` sets sessionExpired to
 false — an unrecognized value is treated as no notice, which is
 the conservative default. An array-valued query parameter (from
 a URL like `?session=a&session=b`) also evaluates to false,
 because the comparison is against a single string.

 -----------------------------------------------------------------------------
 Why <PageTitle> is used
 -----------------------------------------------------------------------------
 The wrapper is the correct owner of the page title: the wrapper
 knows the route's purpose, the form it composes does not.

 The composition is declarative:

     <PageTitle
       :title="loginFormLabels.formAriaLabel"
       :suffix="appName"
     />

 PageTitle (v1.0.0, src/layouts/AppShell/PageTitle/) is the
 shell's canonical document.title manager. It:

   · composes the string from a title and an optional suffix
     separated by an em-dash (the default separator is ` — `,
     space-em-dash-space);
   · handles the empty-suffix case by omitting the separator;
   · restores the previous document.title on unmount;
   · re-runs when its props change;
   · renders nothing (its template is empty — a document-level
     side effect with no DOM footprint).

 The separator PageTitle uses by default (` — `) is the same one
 v1.2.0's inline composition used, so the observable title is
 identical.

 Before v1.3.0, this wrapper (and every sibling auth wrapper)
 duplicated PageTitle's logic in an `onMounted` hook. The wrapper
 now delegates to the shared component, matching the pattern
 that the L-4 group applies uniformly to the twelve route
 wrappers.

 -----------------------------------------------------------------------------
 Logo
 -----------------------------------------------------------------------------
 AuthLayout renders the logo when `logoSrc` is a non-empty string.
 The wrapper passes `/logo.png`, which Vite serves from the
 frontend project's `public/` directory.

 The logo's alt text defaults to `VITE_APP_NAME`, which is the
 correct behavior for a login page — a screen reader announces the
 product name when the image is encountered, and the visible <h1>
 in the brand slot announces the page's purpose.

 If a future revision wants the logo marked decorative (because
 the h1 or a surrounding context already announces the product),
 the wrapper passes `logo-alt=""` to AuthLayout. That is a
 one-line change.

 -----------------------------------------------------------------------------
 Brand slot
 -----------------------------------------------------------------------------
 The brand slot renders the page's <h1>. The heading text is
 `loginFormLabels.formAriaLabel` — "ግባ" (Log in). The heading
 level is h1, matching the accessibility convention that each page
 has exactly one h1 and it names the page's purpose.

 The heading is not "Log in to MASES" or similar. Two reasons:

   · The logo above the card already announces the product name.
     A heading that repeated it would produce a redundant
     announcement for screen reader users.

   · The form's accessible name (via aria-label) is already the
     same string. Keeping the h1 and the form's label identical
     produces a consistent page structure.

 -----------------------------------------------------------------------------
 The two emit handlers
 -----------------------------------------------------------------------------
 LoginForm emits two intent events:

   · `forgot-password` — the user wants to recover a forgotten
     password. Handled by navigating to /forgot-password.

   · `register` — the user wants to create an account. Handled by
     navigating to /register.

 Both use `router.push()`. Neither uses `router.replace()`. Push
 is the correct choice because the user's action is a navigation,
 not a redirect — pressing Back should return them to the login
 page, which is what push preserves.

 The handlers are declared `async` because router.push returns a
 promise. The promise is awaited so that a navigation failure
 (rare — an unhandled guard, a dynamic import failure) surfaces
 as a rejected promise rather than an unhandled one. In practice
 the promise resolves immediately; the `async` keyword is a
 defensive choice, not a functional requirement.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The only visible string this file contributes is the page title,
 which is composed from `loginFormLabels.formAriaLabel` and
 `import.meta.env.VITE_APP_NAME`. Both are supplied by the
 environment or the label set — no literal string appears in this
 file except the em-dash separator (now owned by PageTitle, not
 this file) and the query parameter key.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 styles this file declares are for the h1 inside the brand slot —
 see the `.login-route__title` rule below. No hex value, no
 `color-mix()`, no `calc()` on colors.

 Colors used:
   --mases-color-text-primary       (h1 text color)
   --mases-font-size-heading-4
   --mases-line-height-heading-4
   --mases-font-weight-semibold

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Production readiness
 -----------------------------------------------------------------------------
 Browser features this file relies on, all inside the effective
 target matrix (bound by BaseInput's `:has()`, Firefox 121+):

   · CSS custom properties                      — universal.
   · `<script setup>`, `defineProps`,
     `computed`                                  — build-time /
                                                    runtime.
   · `import.meta.env`                           — Vite build-time.
   · Vue Router's `useRouter` / `useRoute`       — runtime only.

 No feature below that floor is introduced here.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 The wrapper contributes no test hooks of its own. The AuthLayout
 and LoginForm it composes carry the test hooks those components
 declare. A test that needs to verify the login page renders
 should target `[data-testid="auth-layout-root"]` and
 `[data-testid="login-form-root"]`.

 The PageTitle component also contributes no test hook — it renders
 nothing. A test that wants to verify the tab title asserts against
 `document.title` directly.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - The page's single <h1> is rendered in the brand slot. It
     names the page ("ግባ" / "Log in"), matching the form's
     aria-label.
   - The logo carries alt text (the application name), so a screen
     reader announces the product name when the image is
     encountered.
   - The session-expired notice (when rendered) is announced
     politely — its role="status" is owned by LoginForm, not by
     this wrapper.
   - No focus management on mount — AuthLayout does not steal
     focus, and LoginForm manages its own auto-focus on the
     identifier field.
   - PageTitle renders nothing; it does not affect the accessibility
     tree.
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script setup lang="ts">
import PublicSiteLayout from '@/layouts/PublicSiteLayout.vue';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AuthLayout from '@/features/auth/AuthLayout';
import LoginForm from '@/features/auth/LoginForm';
import PageTitle from '@/layouts/AppShell/PageTitle';
import { loginFormLabels } from '@/router/auth-labels';

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------
const route = useRoute();
const router = useRouter();

// -----------------------------------------------------------------------------
// Session-expired detection
// -----------------------------------------------------------------------------
/*
 * The wrapper reads `?session=expired` from the URL and passes the
 * boolean result to LoginForm. See the file docblock §"Why the
 * wrapper reads the query" for the layering reasoning.
 *
 * The strict equality check against the string 'expired' treats any
 * other value — including an array-valued parameter — as
 * "no notice". This is the conservative default.
 */
const sessionExpired = computed<boolean>(
  () => route.query.session === 'expired',
);

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
 * Both handlers use router.push (not replace) so the browser's Back
 * button returns the user to the login page. See the file docblock
 * §"The two emit handlers".
 */
async function onForgotPassword(): Promise<void> {
  await router.push('/forgot-password');
}

async function onRegister(): Promise<void> {
  await router.push('/register');
}
</script>

<template>
  <PublicSiteLayout>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to AuthLayout so that its lifetime matches the route's lifetime.
  -->
  <PageTitle
    :title="loginFormLabels.formAriaLabel"
    :suffix="appName"
  />

  <AuthLayout logoSrc="/logo.png">
    <template #brand>
      <h1 class="login-route__title">{{ loginFormLabels.formAriaLabel }}</h1>
    </template>

    <LoginForm
      :labels="loginFormLabels"
      :session-expired="sessionExpired"
      @forgot-password="onForgotPassword"
      @register="onRegister"
    />
  </AuthLayout>
  </PublicSiteLayout>
</template>

<style scoped>
/* ============================================================================
   Page heading (rendered in AuthLayout's brand slot)
   ---------------------------------------------------------------------------
   The h1 that names the page. Positioned below the logo and above
   the card. Uses heading-4 typography — slightly larger than the
   card's own content but smaller than a display heading, so the
   page reads as a single composition rather than as two competing
   focal points.
   ============================================================================ */
.login-route__title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-heading-4);
  line-height: var(--mases-line-height-heading-4);
  font-weight: var(--mases-font-weight-semibold);
  text-align: center;
  /*
   * Amharic-safe wrapping. A long translation of "Log in" (if the
   * label ever changes) must break across lines rather than
   * overflow the card's width.
   */
  overflow-wrap: anywhere;
}
</style>