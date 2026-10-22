<!--
=============================================================================
 CHANGE VERIFICATION — L-4.2
=============================================================================

 File:      mase_app/src/router/pages/RegisterRoute.vue  (AMEND)
 Unit:      L-4.2 — PageTitle adoption (register)
 Delivery type:  Refactor — declarative document.title via <PageTitle>.
                 One import added, one import removed, one hook removed,
                 one element added to the template.
 Net lines:      +~50 docblock; −10 lines in <script setup> (the
                 onMounted hook and its comments); +1 template element.

 Before (v1.3.0):
   The wrapper set the page title in an onMounted hook:

     onMounted(() => {
       const pageLabel = registerFormLabels.formAriaLabel;
       const appName = import.meta.env.VITE_APP_NAME;
       if (typeof appName === 'string' && appName.length > 0) {
         document.title = `${pageLabel} — ${appName}`;
       } else {
         document.title = pageLabel;
       }
     });

   The v1.3.0 docblock did not explicitly anticipate this migration,
   but the pattern applied here matches the one L-4.1 established for
   LoginRoute. The mechanism (onMounted) was identical; the reason
   it existed was identical.

 After (v1.4.0):
   The wrapper delegates to <PageTitle>:

     <PageTitle
       :title="registerFormLabels.formAriaLabel"
       :suffix="appName"
     />

   Observable behaviour on the route is identical:

     VITE_APP_NAME = "MASES"
       v1.3.0  →  document.title = "መለያ ይፍጠሩ — MASES"
       v1.4.0  →  document.title = "መለያ ይፍጠሩ — MASES"   (identical)

     VITE_APP_NAME = "" or absent at runtime
       v1.3.0  →  document.title = "መለያ ይፍጠሩ"
       v1.4.0  →  document.title = "መለያ ይፍጠሩ"           (identical)

   The behaviour on unmount differs in one respect: PageTitle
   restores the previous document.title when the route changes,
   where v1.3.0 left the value in place. In practice the next route's
   wrapper (or its absence) determines the visible title immediately
   after navigation, so the restore is transparent.

   The :deep() card-width override and its documentation are
   byte-for-byte identical to v1.3.0. The single emit handler, the
   AuthLayout composition, the brand slot, the RegisterForm binding,
   and the scoped styles are also byte-for-byte identical.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — RegisterRoute
=============================================================================

 File:      mase_app/src/router/pages/RegisterRoute.vue
 Layer:     Core (router page)
 Version:   1.4.0
 Status:    FROZEN
 Authority: Stage 12 · Unit 12.7 §"Consumed by"
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            L-4.2 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Composes AuthLayout with RegisterForm and
          wires the form's single emit (login) to a router
          navigation.

 1.2.0  — brand, card width, and title enhancements. Logo passed to
          AuthLayout; the card widened to 560px via a scoped
          `:deep()` override; document.title set on mount.

 1.3.0  — CSS custom property fallbacks. Every var() reference in
          this file now carries a fallback value:

              var(--token-name, fallback-value)

          The fallback is used when the custom property is
          undefined or invalid.

          WHY: The `:deep()` override that widens the register
          card references `--mases-container-auth-card-wide`. With
          no fallback, an undefined token makes the whole
          declaration invalid and the browser drops it — the
          register card collapses to AuthLayout's default 448px,
          which crowds the six bilingual name fields. The
          fallback (560px) is the exact value the token resolves
          to in tokens.css, so the register card stays wide
          whether the token is present or not.

          The same fallback pattern is applied to the heading
          styles.

          No change to the template, script, props, slots, or the
          `:deep()` mechanism.

 1.4.0  — L-4.2. Delegates document.title management to <PageTitle>.

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
          `.register-route__wide-card` wrapper div.

          Every other concern this file owns is unchanged:

            · the :deep() card-width override (v1.2.0, refactored
              for fallbacks in v1.3.0) — preserved byte-for-byte;
            · the single `onLogin` emit handler — byte-for-byte;
            · the AuthLayout composition with logoSrc="/logo.png"
              — byte-for-byte;
            · the brand slot's <h1> — byte-for-byte;
            · the RegisterForm binding with its one prop and one
              emit — byte-for-byte;
            · every scoped style rule and every fallback value
              within it — byte-for-byte.

          See the file docblock §"Why <PageTitle> is used" for the
          composition contract and §"Why the card width is the
          wrapper's job" for the concern this file still owns.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The route wrapper for /register. Composes AuthLayout (Unit 12.1
 v1.3.0) with RegisterForm (Unit 12.7 v2.0.0) and handles the
 form's single navigation emit.

 The form handles its own submission; this wrapper only provides
 the page frame, the title, and the routing.

 -----------------------------------------------------------------------------
 Why the card width is the wrapper's job
 -----------------------------------------------------------------------------
 AuthLayout's docblock is explicit: the card chrome is the
 layout's responsibility, not the form's. That invariant is
 correct for the login, forgot-password, reset-password, and
 verification pages — each of those forms fits comfortably in
 the 448px default.

 The register form is the exception. It carries:

   · six bilingual Ethiopian name fields (first / father /
     grandfather, in Amharic and English);
   · email;
   · password;
   · password confirmation.

 At 448px, the three Amharic name inputs stack on top of each
 other with visible tightness, and the three English inputs
 below them produce a scrollable form with very little
 breathing room. At 560px — the
 `--mases-container-auth-card-wide` token — the fieldsets have
 adequate horizontal space and the form's vertical rhythm is
 preserved.

 Three options were available for expressing this:

   1. Make the form set its own width. Rejected — the form is a
      pure content component; it should not know about viewport
      sizing, and any width it set would conflict with the
      layout's `max-width` anyway.

   2. Add a `maxWidth` prop to AuthLayout. Cleaner long-term, but
      AuthLayout is already delivered and frozen. Adding a prop
      is a coordinated change that touches the layout, its
      docblock, and every existing consumer's interface. It
      should be done via a CR when a second wrapper needs the
      same override.

   3. Reach into the layout from the wrapper via `:deep()`. The
      wrapper is the composition point — it is the only element
      that knows both "which form am I rendering" and "what does
      that form need". A single scoped CSS override expresses
      that relationship without changing the layout's API.

 Option 3 is what this file does. It is the ONE place in the
 auth batch where a wrapper reaches into the layout's internals.
 The `:deep()` selector is deliberate, scoped, and documented.

 When AuthLayout gains a `maxWidth` prop (a future CR), this
 file changes one line — the `:deep()` rule is removed and the
 prop is passed instead. The wrapper's template change is
 mechanical.

 -----------------------------------------------------------------------------
 The :deep() selector
 -----------------------------------------------------------------------------
 Vue's scoped CSS adds a hash attribute to every element in a
 component's own template and rewrites every selector to require
 that hash. A component cannot normally style an element
 rendered by a child component.

 `:deep(...)` is the escape hatch — it removes the hash
 requirement from the part of the selector inside the
 parentheses, so the parent can style a descendant that was
 rendered by a child.

 In this file:

     .register-route__wide-card :deep(.auth-layout__main) { ... }

 The `.register-route__wide-card` class is applied to a wrapper
 <div> that this component renders. Its hash attribute ensures
 the rule only fires when this wrapper is the ancestor — the
 rule does not leak to any other use of AuthLayout.

 The specificity is:

     .register-route__wide-card[data-v-hash] .auth-layout__main

 which is higher than the layout's own

     .auth-layout__main

 so the override wins. No `!important` is needed and none is
 used.

 The selector is intentionally the only one in this file's
 <style> block that uses `:deep()`. A second use would be a
 signal that this wrapper's relationship with the layout is
 becoming more complex than a single composition.

 -----------------------------------------------------------------------------
 Why <PageTitle> is used
 -----------------------------------------------------------------------------
 The wrapper is the correct owner of the page title: the wrapper
 knows the route's purpose, the form it composes does not.

 The composition is declarative:

     <PageTitle
       :title="registerFormLabels.formAriaLabel"
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
 v1.3.0's inline composition used, so the observable title is
 identical.

 Before v1.4.0, this wrapper duplicated PageTitle's logic in an
 onMounted hook — the same duplication LoginRoute carried before
 L-4.1. The wrapper now delegates to the shared component,
 matching the pattern L-4.1 established and that the remaining
 L-4 siblings will follow.

 -----------------------------------------------------------------------------
 Page title
 -----------------------------------------------------------------------------
 The composed title is `{pageLabel} — {appName}`:

     pageLabel = registerFormLabels.formAriaLabel  ("መለያ ይፍጠሩ")
     appName   = import.meta.env.VITE_APP_NAME

 In the workspace build, the title reads "መለያ ይፍጠሩ — MASES"; in
 the portal build, "መለያ ይፍጠሩ — Maale Arna Portal".

 No cleanup on unmount is required in this file: PageTitle owns
 the restore-on-unmount behaviour. When the user navigates away,
 the next route's wrapper (or its absence) determines the
 visible title.

 -----------------------------------------------------------------------------
 Logo
 -----------------------------------------------------------------------------
 AuthLayout renders the logo when `logoSrc` is a non-empty
 string. The wrapper passes `/logo.png`, served by Vite from the
 frontend project's `public/` directory.

 The logo's alt text defaults to `VITE_APP_NAME`. The visible
 <h1> in the brand slot announces the page's purpose
 ("መለያ ይፍጠሩ" / "Create account"), so the product name and the
 page name are announced separately and correctly.

 -----------------------------------------------------------------------------
 Brand slot
 -----------------------------------------------------------------------------
 The brand slot renders the page's <h1>. The heading text is
 `registerFormLabels.formAriaLabel` — "መለያ ይፍጠሩ" (Create
 account). The heading level is h1, and it is the page's only
 h1, matching the accessibility convention that every page has
 exactly one.

 The heading style matches LoginRoute's — see the shared
 `.register-route__title` rule. The two headings use the same
 typography so that a user moving between /login and /register
 perceives the two pages as siblings, not as unrelated surfaces.

 -----------------------------------------------------------------------------
 The single emit handler
 -----------------------------------------------------------------------------
 RegisterForm emits one intent event:

   · `login` — the user has an account and wants to switch to
     the login page. Handled by navigating to /login.

 Uses `router.push` (not replace) so pressing Back returns the
 user to the register page — the correct behavior for a
 user-initiated navigation.

 Declared `async` and awaited to surface any navigation
 rejection as a rejected promise rather than an unhandled one.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The only visible string this file contributes is the page
 title, which is composed from
 `registerFormLabels.formAriaLabel` and
 `import.meta.env.VITE_APP_NAME`. No literal string appears in
 this file except the em-dash separator (now owned by PageTitle,
 not this file).

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

 Sizing used:
   --mases-container-auth-card-wide  (the card's max-width
                                      override)
     fallback: 560px — the resolved value of the token.

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
     (onMounted is no longer used by this file as of v1.4.0; the
     entry is retained here to record that the previous version
     relied on it and to make the removal easy to verify.)
   · `import.meta.env`                      — Vite build-time.
   · Vue Router's `useRouter`               — runtime only.
   · Vue's `:deep()` scoped-CSS combinator  — build-time
                                               (PostCSS
                                               transform),
                                               no runtime
                                               requirement.

 No feature below the target matrix floor is introduced here.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 The wrapper contributes no test hooks of its own. The
 AuthLayout and RegisterForm it composes carry the test hooks
 those components declare.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - The page's single <h1> is rendered in the brand slot. It
     names the page ("መለያ ይፍጠሩ" / "Create account").
   - The logo carries alt text (the application name).
   - No focus management on mount — AuthLayout does not steal
     focus, and RegisterForm manages its own auto-focus on the
     first Amharic name input.
   - PageTitle renders nothing; it does not affect the
     accessibility tree.
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script setup lang="ts">
import PublicSiteLayout from '@/layouts/PublicSiteLayout.vue';
import { useRouter } from 'vue-router';

import AuthLayout from '@/features/auth/AuthLayout';
import RegisterForm from '@/features/auth/RegisterForm';
import PageTitle from '@/layouts/AppShell/PageTitle';
import { registerFormLabels } from '@/router/auth-labels';

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
 * returns the user to the register page.
 */
async function onLogin(): Promise<void> {
  await router.push('/login');
}
</script>

<template>
  <PublicSiteLayout>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to the wrapper div so that its lifetime matches the route's
    lifetime.
  -->
  <PageTitle
    :title="registerFormLabels.formAriaLabel"
    :suffix="appName"
  />

  <div class="register-route__wide-card">
    <AuthLayout logoSrc="/logo.png">
      <template #brand>
        <h1 class="register-route__title">{{ registerFormLabels.formAriaLabel }}</h1>
      </template>

      <RegisterForm
        :labels="registerFormLabels"
        @login="onLogin"
      />
    </AuthLayout>
  </div>
  </PublicSiteLayout>
</template>

<style scoped>
/* ============================================================================
   Wide card override
   ---------------------------------------------------------------------------
   This is the one place in the auth batch where a wrapper reaches
   into AuthLayout's internals. It exists because the register form
   carries more fields than the layout's default card width can
   comfortably hold. See the file docblock §"Why the card width is
   the wrapper's job".

   The selector is scoped to this component by Vue's scoped-CSS
   hash on `.register-route__wide-card`, so the rule only fires
   when this wrapper is the ancestor. No other use of AuthLayout
   is affected.

   The fallback value (560px) is the exact value that
   --mases-container-auth-card-wide resolves to in tokens.css. If
   the token is present, the token's value is used and the
   fallback is never consulted. If the token is absent for any
   reason, the fallback keeps the register card wide.

   When AuthLayout gains a `maxWidth` prop (a future CR), this
   rule is removed and the prop is passed instead.
   ============================================================================ */
.register-route__wide-card :deep(.auth-layout__main) {
  max-width: var(--mases-container-auth-card-wide, 560px);
}

/* ============================================================================
   Page heading (rendered in AuthLayout's brand slot)
   ---------------------------------------------------------------------------
   Same typography as LoginRoute's heading. The two are siblings,
   not unrelated surfaces, and the visual weight should match so a
   user moving between them perceives a consistent page.

   Every var() reference carries a fallback per the file docblock
   §"CSS variable fallbacks". The fallback values are the exact
   resolved values from tokens.css, so the visual result is
   identical whether the tokens load or not.
   ============================================================================ */
.register-route__title {
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
   * Amharic-safe wrapping. A long translation of "Create account"
   * must break across lines rather than overflow the card's
   * width.
   */
  overflow-wrap: anywhere;
}
</style>