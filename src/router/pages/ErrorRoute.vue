<!--
=============================================================================
 CHANGE VERIFICATION — L-4.8
=============================================================================

 File:      mase_app/src/router/pages/ErrorRoute.vue  (AMEND)
 Unit:      L-4.8 — PageTitle adoption (error route)
 Delivery type:  Enhancement — adds document.title management to a
                 wrapper that had none. One import added, one
                 computed added, one element added to the template.
 Net lines:      +~65 docblock; +1 import; +14 lines computed;
                 +1 template element.

 Before (v1.0.2):
   The wrapper had NO document.title setter. Its <script setup>
   carried no onMounted hook and no `document.title = …` line. As a
   result, the three error states it renders (not-found,
   maintenance, access-denied) inherited whatever title the
   previously-visited route had left behind — or the entry HTML's
   pre-JS default `MASES` on a cold load directly at an error URL.

   The v1.0.2 docblock's §"No hardcoded user-facing string" noted
   that every visible string comes from @/router/error-labels, but
   the file did not surface a browser-tab title at all. That gap is
   the reason for this revision.

 After (v1.1.0):
   The wrapper sets document.title via <PageTitle>, bound to a
   computed that selects the variant-specific title. All three
   titles are read from the labels module the file already imports
   — no new label is created, no label value is changed.

   Observable behaviour:

     Variant              document.title (workspace build)
     ───────              ─────────────────────────────────
     not-found            "ገጹ አልተገኘም — MASES"
     maintenance          "በጊዜያዊነት አገልግሎት ላይ ነን — MASES"
     access-denied        "መዳረሻ ተከልክሏል — MASES"

   In the portal build, the suffix is "Maale Arna Portal" instead
   of "MASES".

   The composed strings use the same three titles the
   ErrorPage/AccessDeniedPage components already render as their
   <h1>. The browser tab and the page heading agree — the same
   convention every other route in the codebase follows.

   With VITE_APP_NAME empty or absent at runtime, PageTitle's
   guard omits the separator; the tab reads just the variant title.

   No other behaviour change. The variant dispatch, the three
   route-query readers (accessDeniedCode, accessDeniedFrom,
   requestId), the three action handlers (onNotFoundAction,
   onMaintenanceAction, onAccessDeniedLauncher), and every
   composed child (ErrorShell, ErrorPage, AccessDeniedPage) are
   byte-for-byte identical to v1.0.2.

 Dependency note:
   · No new label. The three titles used here — errorNotFoundTitle,
     errorMaintenanceTitle, errorAccessDeniedLabels.title — are
     already imported by this file (for the ErrorPage /
     AccessDeniedPage bindings) and are already rendered as the
     respective page headings.
   · No change to error-labels.ts. The file is consumed as
     delivered.
   · No change to AuthLayout, ErrorShell, ErrorPage,
     AccessDeniedPage, or PageTitle.
   · No change to routes-base.ts. The three error routes
     (/not-found, /maintenance, /access-denied) and the catch-all
     already point at this component; the title behaviour is added
     inside the component, not in the route records.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — ErrorRoute
=============================================================================

 File:      mase_app/src/router/pages/ErrorRoute.vue
 Layer:     Core (router page)
 Version:   1.1.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.4, §14.5
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §45, §46, §71
            L-4.8 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery.
 1.0.1  — ErrorSupportPanel labels alignment:
          · The support labels object was constructed with field names
            (title, fieldCode, fieldRequestId, fieldTimestamp) that
            predate ErrorSupportPanel's current contract. Updated to
            the composite's eight fields: toggle, errorCode, requestId,
            timestamp, occurredAt, copy, copied, copyFallbackInstruction.
          · This was the same i18n-gap exception flagged in the header
            comment — English constants pending migration. That
            exception is closed by the 1.0.2 revision below.

 1.0.2  — Amharic-first error labels (Unit A-5):
          · All inline English string objects are removed. The three
            error variants' user-facing strings are now imported from
            @/router/error-labels, which supplies them as Amharic
            constants matching the Amharic-first policy established by
            auth-labels.ts and applied to the shell, launcher, portal,
            files, shareholders, and error label files in this phase.
          · The `<script lang="ts">` block is removed. Its only
            purpose was importing the ErrorPageAction / ErrorPageLabels
            / AccessDeniedLabels types so the inline objects could be
            annotated. Once the objects move to error-labels.ts, the
            type imports are unused and would fail `noUnusedLocals`
            (TypeScript 5.7, tsconfig.json v1.0.1).
          · The six template-level string literals (`Not found`,
            `Page not found`, the 404 message, `Service unavailable`,
            `We are temporarily unavailable`, the 503 message) are now
            bound to the imported constants. The numeric status codes
            (404, 503) remain inline — they are language-neutral and
            are not translatable strings.
          · The route-query readers (accessDeniedCode,
            accessDeniedFrom, requestId) and the three handlers
            (onNotFoundAction, onMaintenanceAction,
            onAccessDeniedLauncher) are unchanged. They read URL
            parameters and dispatch navigation.
          · The header comment's "EXCEPTION FLAGGED" note is removed.
            The i18n gap that note documented is closed by this
            revision.
          · No behavior change: ErrorPage and AccessDeniedPage receive
            the same prop shapes they did before. The only observable
            difference is that the three error variants now render
            Amharic.

 1.1.0  — L-4.8. Adds document.title management to the error route.

          Prior to this revision, the wrapper set no document.title.
          The three error states it renders (not-found, maintenance,
          access-denied) inherited whatever title the previously
          visited route had left behind. On a cold load directly at
          an error URL, the tab showed the entry HTML's pre-JS
          default ("MASES") until the user navigated away.

          This revision binds a <PageTitle> to a computed that
          selects the variant-specific title. All three titles are
          read from the labels module the file already imports —
          no new label is created, no label value is changed.

          The composition matches the pattern L-4.1 through L-4.6
          established for the six auth route wrappers. Unlike those
          wrappers, this file had nothing to migrate: there was no
          `onMounted` hook and no `document.title = …` line to
          remove. The change is additive.

          The variant dispatch (`variant` computed), the three
          route-query readers, the three action handlers, and the
          three ErrorShell/ErrorPage/AccessDeniedPage compositions
          are byte-for-byte identical to v1.0.2.

          See the file docblock §"Why <PageTitle> is used" for the
          composition contract and §"Why this route had no title
          before" for the audit trail.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The page rendered by the three error routes and the catch-all:
   /not-found       →  404 presentation
   /maintenance     →  503 presentation
   /access-denied   →  403 presentation (via AccessDeniedPage)
   /:pathMatch(.*)* →  404 presentation (same as /not-found)

 A single component dispatches on `route.name`. Splitting it into
 three near-identical files whose only difference is a status code and
 a label set would be dishonest about the amount of code involved.

 -----------------------------------------------------------------------------
 Why this route had no title before
 -----------------------------------------------------------------------------
 The v1.0.0 – v1.0.2 deliveries focused on the error route's
 presentation: the shell composition (ErrorShell), the three
 variant components (ErrorPage, ErrorPage, AccessDeniedPage), the
 Amharic-first label migration, and the three navigation handlers.
 Document.title was not part of the scope of those deliveries, and
 no route in the codebase had yet established the pattern.

 The L-4 group introduced the pattern (PageTitle) and applied it to
 the six auth wrappers (L-4.1 – L-4.6). L-4.7 confirmed that
 LauncherRoute has no title migration to perform because it has no
 title setter. L-4.8 (this revision) addresses ErrorRoute, which
 was the second wrapper with no title setter and — unlike
 LauncherRoute — has a natural, zero-new-label fix available.

 The fix uses three titles that already exist:

   · errorNotFoundTitle      — 'ገጹ አልተገኘም'
   · errorMaintenanceTitle   — 'በጊዜያዊነት አገልግሎት ላይ ነን'
   · errorAccessDeniedLabels.title — 'መዳረሻ ተከልክሏል'

 Each is the exact string the corresponding ErrorPage or
 AccessDeniedPage renders as its <h1>. Binding <PageTitle> to the
 same label produces a document.title that agrees with the page
 heading — the convention every other route follows.

 -----------------------------------------------------------------------------
 Access-denied specifics
 -----------------------------------------------------------------------------
 The 403 presentation is the AccessDeniedPage pattern (Unit 10.15).
 It reads route.query.code (to detect the FILE_ACCESS_DENIED case)
 and route.query.from (for the diagnostic console log). Both are
 handled internally by that pattern.

 The three query readers below (accessDeniedCode, accessDeniedFrom,
 requestId) forward the route's user-supplied URL parameters into the
 pattern's props. They are not translatable strings and are not
 affected by the Amharic-first pass or by this title addition.

 -----------------------------------------------------------------------------
 Where the labels live now
 -----------------------------------------------------------------------------
 The three variant-specific titles used by this revision's
 PageTitle binding are the same three constants the template's
 ErrorPage and AccessDeniedPage bindings already read. No new
 import is required — the file already imports all of them:

     errorNotFoundTitle
     errorMaintenanceTitle
     errorAccessDeniedLabels

 The new PageTitle element and its computed binding reference these
 constants directly. See the file docblock §"Why <PageTitle> is
 used" for the composition contract.

 -----------------------------------------------------------------------------
 Why <PageTitle> is used
 -----------------------------------------------------------------------------
 PageTitle (v1.0.0, src/layouts/AppShell/PageTitle/) is the
 shell's canonical document.title manager. It composes the string
 from a title and an optional suffix separated by an em-dash (the
 default separator is ` — `), handles the empty-suffix case by
 omitting the separator, restores the previous document.title on
 unmount, and re-runs when its props change.

 The composition is declarative:

     <PageTitle
       :title="pageTitle"
       :suffix="appName"
     />

 where `pageTitle` is a computed that dispatches on the same
 `variant` value the template uses for its three branches:

     variant === 'maintenance'   → errorMaintenanceTitle
     variant === 'access-denied' → errorAccessDeniedLabels.title
     variant === 'not-found'     → errorNotFoundTitle

 Because both the pageTitle computed and the template's v-if/v-else-if/
 v-else chain read the same `variant` computed, the tab title and
 the rendered error page are guaranteed to agree. If a future
 revision adds a fourth variant to `variant`, the pageTitle computed
 and the template's branch structure must both be updated — the
 compiler will not enforce this, but the two are located within
 fifteen lines of each other in the same file, which is the closest
 form of co-location the composition permits.

 `appName` is read from `import.meta.env.VITE_APP_NAME`, matching
 every L-4 sibling.

 The separator PageTitle uses by default (` — `) matches the
 convention every other route in the codebase follows.

 -----------------------------------------------------------------------------
 The three route-query readers
 -----------------------------------------------------------------------------
 Unchanged by this revision.

 These readers forward user-supplied URL parameters into the
 AccessDeniedPage pattern's props. They are not translatable strings
 and are not affected by the Amharic-first pass or by this title
 addition.

 Each reader accepts only a non-empty string; a missing or array-
 valued parameter is treated as "not present". This is the same
 defensive posture the pattern's own prop types expect.

 -----------------------------------------------------------------------------
 The three action handlers
 -----------------------------------------------------------------------------
 Unchanged by this revision.

   · onNotFoundAction       — navigates to /launcher. The route
                              string is the one the shell's sidebar
                              labels as "መነሻ" and the one the 404
                              action label in error-labels.ts names
                              with the same term.

   · onMaintenanceAction    — reloads the page (window.location.reload()).
                              It does not navigate; the user is already
                              on the correct URL, and a fresh request
                              is what retries the service.

   · onAccessDeniedLauncher — navigates to /launcher. Same destination
                              and same rationale as the 404 action.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every user-facing string this file renders comes from
 @/router/error-labels. The component contributes no strings of its
 own. The only literals in this file are the numeric status codes
 (404, 503) and the query-parameter keys ('code', 'from',
 'request_id'), none of which are user-facing text.

 The new PageTitle binding reads the same three labels the template
 already reads — no new literal string is introduced.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 This file declares no styles. Every visual value is owned by the
 composed ErrorShell, ErrorPage, and AccessDeniedPage components.
 PageTitle renders nothing and declares no styles.

 -----------------------------------------------------------------------------
 Production readiness
 -----------------------------------------------------------------------------
 Browser features this file relies on:

   · `<script setup>`, `computed`         — build-time / runtime.
   · `import.meta.env`                    — Vite build-time.
   · Vue Router's `useRoute` / `useRouter` — runtime only.

 No feature below the target matrix floor is introduced here.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 The wrapper contributes no test hooks of its own. The ErrorShell,
 ErrorPage, and AccessDeniedPage it composes carry the test hooks
 those components declare.

 The PageTitle component also contributes no test hook — it renders
 nothing. A test that wants to verify the tab title asserts against
 `document.title` directly.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - The rendered error page carries its own <h1> — sourced from
     ErrorPage's or AccessDeniedPage's own heading element. This
     revision does not change that element's content; it only adds
     a matching document.title that agrees with it.

   - PageTitle renders nothing; it does not affect the accessibility
     tree.

   - No focus management is added. ErrorPage and AccessDeniedPage
     own their own focus behaviour, if any.

   - Reduced motion: this file defines no animation. The composed
     components own their motion contracts.
=============================================================================
-->

<script setup lang="ts">
import PublicSiteLayout from '@/layouts/PublicSiteLayout.vue';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ErrorShell from '@/components/patterns/ErrorShell';
import ErrorPage from '@/components/patterns/ErrorPage';
import AccessDeniedPage from '@/components/patterns/AccessDeniedPage';
import PageTitle from '@/layouts/AppShell/PageTitle';

import {
  errorNotFoundStatusLabel,
  errorNotFoundTitle,
  errorNotFoundMessage,
  errorNotFoundPageLabels,
  errorNotFoundActions,
  errorMaintenanceStatusLabel,
  errorMaintenanceTitle,
  errorMaintenanceMessage,
  errorMaintenancePageLabels,
  errorMaintenanceActions,
  errorAccessDeniedLabels,
} from '@/router/error-labels';

const route = useRoute();
const router = useRouter();

// -----------------------------------------------------------------------------
// Variant dispatch
// -----------------------------------------------------------------------------
type Variant = 'not-found' | 'maintenance' | 'access-denied';

const variant = computed<Variant>(() => {
  switch (route.name) {
    case 'maintenance':
      return 'maintenance';
    case 'access-denied':
      return 'access-denied';
    case 'not-found':
    case 'catch-all':
    default:
      return 'not-found';
  }
});

// -----------------------------------------------------------------------------
// Page title (L-4.8)
// -----------------------------------------------------------------------------
/*
 * The document.title for the active variant. Reads the same three
 * labels the template's ErrorPage and AccessDeniedPage bindings
 * already read, so the tab title and the page heading agree.
 *
 * The switch mirrors the `variant` computed above. If a fourth
 * variant is ever added, both switches must be updated in the same
 * commit; the two are located within fifteen lines of each other
 * for exactly that reason.
 */
const pageTitle = computed<string>(() => {
  switch (variant.value) {
    case 'maintenance':
      return errorMaintenanceTitle;
    case 'access-denied':
      return errorAccessDeniedLabels.title;
    case 'not-found':
    default:
      return errorNotFoundTitle;
  }
});

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
 */
const appName: string = import.meta.env.VITE_APP_NAME;

// -----------------------------------------------------------------------------
// Route query (from access-denied)
// -----------------------------------------------------------------------------
/*
 * These readers forward user-supplied URL parameters into the
 * AccessDeniedPage pattern's props. They are not translatable strings
 * and are not affected by the Amharic-first pass.
 *
 * Each reader accepts only a non-empty string; a missing or array-
 * valued parameter is treated as "not present". This is the same
 * defensive posture the pattern's own prop types expect.
 */
const accessDeniedCode = computed<string | undefined>(() => {
  const raw = route.query.code;
  return typeof raw === 'string' && raw !== '' ? raw : undefined;
});

const accessDeniedFrom = computed<string | undefined>(() => {
  const raw = route.query.from;
  return typeof raw === 'string' && raw !== '' ? raw : undefined;
});

const requestId = computed<string | undefined>(() => {
  const raw = route.query.request_id;
  return typeof raw === 'string' && raw !== '' ? raw : undefined;
});

// -----------------------------------------------------------------------------
// Action handling
// -----------------------------------------------------------------------------
/*
 * The 404 action navigates to /launcher. The route string is the one
 * the shell's sidebar labels as "መነሻ" (router/shell-labels.ts) and the
 * one the 404 action label in router/error-labels.ts names with the
 * same term. The three sites agree: the user returns to the same
 * destination the sidebar calls home.
 */
function onNotFoundAction(): void {
  void router.push('/launcher');
}

/*
 * The 503 action reloads the page. It does not navigate; the user is
 * already on the correct URL, and a fresh request is what retries the
 * service.
 */
function onMaintenanceAction(): void {
  window.location.reload();
}

/*
 * The 403 action navigates to /launcher. Same destination and same
 * rationale as the 404 action above.
 */
function onAccessDeniedLauncher(): void {
  void router.push('/launcher');
}
</script>

<template>
  <PublicSiteLayout>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to the three ErrorShell branches so that its lifetime matches the
    route's lifetime and its binding reflects the active variant.

    The `:title` binding reads the `pageTitle` computed, which
    dispatches on the same `variant` value the three branches below
    use. Tab title and page heading agree by construction.
  -->
  <PageTitle
    :title="pageTitle"
    :suffix="appName"
  />

  <!-- ============================================================
       Not-found (404)
       ============================================================ -->
  <ErrorShell v-if="variant === 'not-found'">
    <ErrorPage
      :status="404"
      :status-label="errorNotFoundStatusLabel"
      :title="errorNotFoundTitle"
      :message="errorNotFoundMessage"
      :actions="errorNotFoundActions"
      :labels="errorNotFoundPageLabels"
      @action="onNotFoundAction"
    />
  </ErrorShell>

  <!-- ============================================================
       Maintenance (503)
       ============================================================ -->
  <ErrorShell v-else-if="variant === 'maintenance'">
    <ErrorPage
      :status="503"
      :status-label="errorMaintenanceStatusLabel"
      :title="errorMaintenanceTitle"
      :message="errorMaintenanceMessage"
      :actions="errorMaintenanceActions"
      :labels="errorMaintenancePageLabels"
      @action="onMaintenanceAction"
    />
  </ErrorShell>

  <!-- ============================================================
       Access-denied (403)
       ============================================================ -->
  <ErrorShell v-else>
    <AccessDeniedPage
      :code="accessDeniedCode"
      :from="accessDeniedFrom"
      :request-id="requestId"
      :labels="errorAccessDeniedLabels"
      @launcher="onAccessDeniedLauncher"
    />
  </ErrorShell>
  </PublicSiteLayout>
</template>