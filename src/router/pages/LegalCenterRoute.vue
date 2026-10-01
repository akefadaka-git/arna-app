<!--
=============================================================================
 CHANGE VERIFICATION — L-4.9
=============================================================================

 File:      mase_app/src/router/pages/LegalCenterRoute.vue  (AMEND)
 Unit:      L-4.9 — PageTitle adoption (legal center hub)
 Delivery type:  Refactor — declarative document.title via <PageTitle>.
                 One import added, one import removed, one hook removed,
                 one element added to the template.
 Net lines:      +~50 docblock; −13 lines in <script setup> (the
                 onMounted hook and its comments); +1 template element.

 Before (v1.0.0):
   The wrapper set the page title in an onMounted hook:

     onMounted(() => {
       const pageLabel = legalCenterPageLabels.pageTitle;
       const appName = import.meta.env.VITE_APP_NAME;

       if (typeof appName === 'string' && appName.length > 0) {
         document.title = `${pageLabel} — ${appName}`;
       } else {
         document.title = pageLabel;
       }
     });

   The v1.0.0 docblock did not explicitly anticipate this migration,
   but the mechanism (onMounted) is identical to the one L-4.1
   removed from LoginRoute and L-4.3 removed from
   ForgotPasswordRoute.

 After (v1.1.0):
   The wrapper delegates to <PageTitle>:

     <PageTitle
       :title="legalCenterPageLabels.pageTitle"
       :suffix="appName"
     />

   Observable behaviour on the route is identical:

     VITE_APP_NAME = "MASES"
       v1.0.0  →  document.title = "ሕጋዊ መረጃ — MASES"
       v1.1.0  →  document.title = "ሕጋዊ መረጃ — MASES"           (identical)

     VITE_APP_NAME = "" or absent at runtime
       v1.0.0  →  document.title = "ሕጋዊ መረጃ"
       v1.1.0  →  document.title = "ሕጋዊ መረጃ"                   (identical)

   The behaviour on unmount differs in one respect: PageTitle
   restores the previous document.title when the route changes.
   In practice the next route's wrapper (or its absence) determines
   the visible title immediately after navigation, so the restore
   is transparent.

   No other behaviour change. The grouped-documents computed, the
   headingForGroup helper, the ErrorShell composition, the
   legal-center card list, and the scoped styles are byte-for-byte
   identical to v1.0.0.

 Structural note — this wrapper composes ErrorShell, not AuthLayout:
   The six wrappers migrated in L-4.1 through L-4.6 compose
   AuthLayout. LegalCenterRoute composes ErrorShell, the public
   non-auth shell. The PageTitle adoption is orthogonal to the
   shell choice: PageTitle renders nothing and is placed as a
   sibling to the shell composition. The migration is
   structurally identical.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — LegalCenterRoute
=============================================================================

 File:      mase_app/src/router/pages/LegalCenterRoute.vue
 Layer:     Core (router page)
 Version:   1.1.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2 (route tiers)
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            L-4.9 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. The public Legal Center hub. Renders the
          eight documents defined in @/router/legal-content, grouped
          into "essential" and "additional" sections per
          legalHubGroups. Labels come from @/router/legal-labels.

 1.1.0  — L-4.9. Delegates document.title management to <PageTitle>.

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
          ErrorShell composition.

          No other change. The `resolvedGroups` computed, the
          `headingForGroup` helper, the ErrorShell composition, the
          legal-center card list with its group sections, and every
          scoped style rule are byte-for-byte identical to v1.0.0.

          See the file docblock §"Why <PageTitle> is used" for the
          composition contract.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /legal route's content. The public Legal Center hub — the
 reader's entry point to the eight legal documents.

 -----------------------------------------------------------------------------
 Shell composition — the ErrorShell assumption
 -----------------------------------------------------------------------------
 This page composes ErrorShell — the public shell used by
 /not-found, /maintenance, and /access-denied. The composition
 shape is taken from ErrorRoute.vue, which is the only other
 caller of ErrorShell in the delivered code:

     <ErrorShell>
       <content />
     </ErrorShell>

 That is: no props, default slot populated. Every one of
 ErrorRoute.vue's three variant branches follows this shape.

 ErrorShell is used rather than AuthLayout because AuthLayout is a
 focused, narrow (448px/560px) form card with a "Powered by ARNA
 AI" attribution — wrong for a hub page listing eight documents.
 ErrorShell is the shell the app uses for public, non-auth,
 non-form pages; the Legal Center is exactly that.

 If ErrorShell's actual API turns out to differ from what
 ErrorRoute.vue's usage demonstrates (e.g. it requires a prop, or
 it exposes a named slot for the page title), the only change
 required is to this file's <template> outer wrapper. The page's
 content, data model, and accessibility structure are unaffected.

 -----------------------------------------------------------------------------
 Reading width
 -----------------------------------------------------------------------------
 The hub renders inside a container capped at the form-reading
 width. Two tokens are consulted, in order:

   --mases-container-form              (first choice)
   --mases-container-auth-card-wide    (fallback)
   560px                               (final fallback)

 The form-reading width keeps the card list scannable. A wider
 container would spread the cards horizontally and slow reading;
 the legal hub is a navigation surface, and a navigation surface
 reads better in a single column than in a wide two-column grid.

 The cards therefore stack vertically at every viewport width.
 The desktop layout does not introduce a multi-column grid — one
 column with comfortable spacing is the correct presentation for
 eight navigation targets.

 -----------------------------------------------------------------------------
 The draft chip
 -----------------------------------------------------------------------------
 A card whose document has status 'draft' renders a small chip
 with the label from legalCenterPageLabels.draftChipLabel. The
 chip is informational, not a warning — it tells the reader that
 the document exists and is a controlled draft, matching the
 document-control notice the document viewer renders when a
 document is opened.

 A document with status 'approved' renders no chip. The absence
 of a chip is the correct signal; a reader who wants the
 document's full status opens it and sees the metadata block.

 -----------------------------------------------------------------------------
 Why <PageTitle> is used
 -----------------------------------------------------------------------------
 The wrapper is the correct owner of the page title: the wrapper
 knows the route's purpose, the composed ErrorShell and card list
 do not.

 The composition is declarative:

     <PageTitle
       :title="legalCenterPageLabels.pageTitle"
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
 v1.0.0's inline composition used, so the observable title is
 identical.

 Before v1.1.0, this wrapper duplicated PageTitle's logic in an
 onMounted hook — the same duplication every auth wrapper carried
 before its L-4 migration. The wrapper now delegates to the shared
 component, matching the pattern L-4.1 through L-4.6 established
 and that the remaining L-4 siblings will follow.

 -----------------------------------------------------------------------------
 Page title
 -----------------------------------------------------------------------------
 The composed title is `{pageLabel} — {appName}`:

     pageLabel = legalCenterPageLabels.pageTitle   ("ሕጋዊ መረጃ")
     appName   = import.meta.env.VITE_APP_NAME

 In the workspace build, the title reads "ሕጋዊ መረጃ — MASES"; in
 the portal build, "ሕጋዊ መረጃ — Maale Arna Portal".

 The page label is the same string the hub's own <h1> renders
 (legalCenterPageLabels.pageTitle is bound to both). The browser
 tab and the page heading agree.

 No cleanup on unmount is required in this file: PageTitle owns
 the restore-on-unmount behaviour. When the user navigates away,
 the next route's wrapper (or its absence) determines the visible
 title.

 -----------------------------------------------------------------------------
 Grouped documents
 -----------------------------------------------------------------------------
 Resolve each hub group's slugs against the document list. A slug
 that does not resolve is dropped rather than rendered as a dead
 card. The invariant is that no such slug exists — every slug in
 legalHubGroups[].slugs matches a document in legalDocuments —
 but the resolution here is defensive: if a slug is ever typo'd in
 the future, the page degrades gracefully instead of rendering a
 broken card.

 The computed returns a new array of `{ group, documents }` so the
 template can iterate once per group and once per document within
 the group, without needing to look anything up inline.

 -----------------------------------------------------------------------------
 Group heading lookup
 -----------------------------------------------------------------------------
 Map a LegalHubGroup's `id` ('essential' | 'additional') to the
 corresponding Amharic heading from legalCenterPageLabels. The
 labels file owns the heading text; this file owns which group
 gets which heading. The mapping is exhaustive over the union, so
 a new group id added to LegalHubGroup in a future revision will
 produce a TypeScript error at this function until it is handled.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every user-facing string this file renders comes from either
 @/router/legal-labels (chrome) or @/router/legal-content
 (document titles and summaries). The component contributes no
 strings of its own.

 The only literals in this file are:
   · the route-path prefix '/legal/' (a URL, not user-facing
     text);
   · the /login path in the back-to-login RouterLink (a URL);
   · the CSS fallback values in the <style> block, which mirror
     tokens.

 The page title is composed from legalCenterPageLabels.pageTitle
 and import.meta.env.VITE_APP_NAME. Both are supplied by the
 environment or the label set — no literal string appears in this
 file except the em-dash separator (now owned by PageTitle, not
 this file).

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css, expressed
 with a fallback per the pattern the auth route wrappers and the
 error route use. No hex value appears in this file except as a
 fallback value that mirrors a token.

 Colors used:
   --mases-color-text-primary      (page title, group headings,
                                    card titles)
   --mases-color-text-secondary    (intro, card summaries, draft
                                    chip text)
   --mases-color-border-subtle     (card border, chip border)

 Typography used:
   --mases-font-size-heading-4     (page title)
   --mases-line-height-heading-4
   --mases-font-weight-semibold

   --mases-font-size-body          (intro, group headings, card
                                    titles)
   --mases-line-height-body

   --mases-font-size-body-sm       (card summaries, draft chip,
                                    back-to-login link)
   --mases-line-height-body-sm

 Spacing used:
   --mases-space-2, --mases-space-3, --mases-space-4,
   --mases-space-6, --mases-space-8, --mases-space-10

 Container used:
   --mases-container-form          (preferred hub width)
   --mases-container-auth-card-wide (fallback)

 -----------------------------------------------------------------------------
 Production readiness
 -----------------------------------------------------------------------------
 Browser features this file relies on:

   · CSS custom properties with fallback   — universal.
   · `<script setup>`, `computed`, `onMounted` — build-time /
                                                runtime.
     (onMounted is no longer used by this file as of v1.1.0; the
     entry is retained here to record that the previous version
     relied on it and to make the removal easy to verify.)
   · `import.meta.env`                      — Vite build-time.
   · Vue Router's `RouterLink`              — runtime only.

 No feature below the target matrix floor is introduced here.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="legal-center-root"           on the outer <article>
 data-testid="legal-center-title"          on the <h1>
 data-testid="legal-center-group"          on each group <section>
 data-testid="legal-center-group-heading"  on each group's <h2>
 data-testid="legal-center-card"           on each card <RouterLink>
 data-testid="legal-center-card-chip"      on a card's draft chip
 data-testid="legal-center-back"           on the back-to-login link

 The wrapper contributes no test hooks of its own. The ErrorShell
 composition does not add any either.

 The PageTitle component also contributes no test hook — it
 renders nothing. A test that wants to verify the tab title
 asserts against `document.title` directly.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - One <h1> on the page — the page title.
   - Each group is a <section> with an <h2> heading. Heading
     levels nest correctly: h1 → h2 → h3.
   - Each card is a <RouterLink> (an <a>) containing the card's
     <h3>, summary paragraph, and optional chip. The link's
     accessible name comes from its contents — a screen reader
     announces the document title followed by the summary.
   - Keyboard navigation uses the browser's natural Tab order:
     the page's h1, then the first card, then each subsequent
     card, then the back-to-login link.
   - Focus rings come from the browser default and from any
     global link focus styling the design system applies. This
     file does not suppress focus outlines.
   - The draft chip is text, not a color-only signal — a reader
     who cannot distinguish the chip's border still reads the
     word "ረቂቅ".
   - Long Amharic text wraps via `overflow-wrap: anywhere` on
     every element that can carry a long title or summary.
   - PageTitle renders nothing; it does not affect the
     accessibility tree.
   - Reduced motion: this file defines no animation. The media
     query block at the end is a defensive placeholder.
=============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import ErrorShell from '@/components/patterns/ErrorShell';
import PageTitle from '@/layouts/AppShell/PageTitle';
import { legalCenterPageLabels } from '@/router/legal-labels';
import {
  legalDocuments,
  legalHubGroups,
  type LegalDocument,
  type LegalHubGroup,
} from '@/router/legal-content';

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
// Grouped documents
// -----------------------------------------------------------------------------
/*
 * Resolve each hub group's slugs against the document list. A slug
 * that does not resolve is dropped rather than rendered as a dead
 * card. The invariant is that no such slug exists — every slug in
 * legalHubGroups[].slugs matches a document in legalDocuments —
 * but the resolution here is defensive: if a slug is ever typo'd in
 * the future, the page degrades gracefully instead of rendering a
 * broken card.
 *
 * The computed returns a new array of `{ group, documents }` so the
 * template can iterate once per group and once per document within
 * the group, without needing to look anything up inline.
 */
interface ResolvedGroup {
  readonly group: LegalHubGroup;
  readonly documents: ReadonlyArray<LegalDocument>;
}

const resolvedGroups = computed<ReadonlyArray<ResolvedGroup>>(() => {
  return legalHubGroups.map((group) => {
    const documents: LegalDocument[] = [];
    for (const slug of group.slugs) {
      const doc = legalDocuments.find((d) => d.slug === slug);
      if (doc !== undefined) {
        documents.push(doc);
      }
    }
    return { group, documents };
  });
});

// -----------------------------------------------------------------------------
// Group heading lookup
// -----------------------------------------------------------------------------
/*
 * Map a LegalHubGroup's `id` ('essential' | 'additional') to the
 * corresponding Amharic heading from legalCenterPageLabels. The
 * labels file owns the heading text; this file owns which group
 * gets which heading. The mapping is exhaustive over the union, so
 * a new group id added to LegalHubGroup in a future revision will
 * produce a TypeScript error at this function until it is handled.
 */
function headingForGroup(group: LegalHubGroup): string {
  switch (group.id) {
    case 'essential':
      return legalCenterPageLabels.hubGroups.essential;
    case 'additional':
      return legalCenterPageLabels.hubGroups.additional;
  }
}
</script>

<template>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to ErrorShell so that its lifetime matches the route's lifetime.
  -->
  <PageTitle
    :title="legalCenterPageLabels.pageTitle"
    :suffix="appName"
  />

  <ErrorShell>
    <article
      class="legal-center"
      data-testid="legal-center-root"
    >
      <!-- ============================================================
           Header — page title and intro
           ============================================================ -->
      <header class="legal-center__header">
        <h1
          class="legal-center__title"
          data-testid="legal-center-title"
        >
          {{ legalCenterPageLabels.pageTitle }}
        </h1>

        <p class="legal-center__intro">
          {{ legalCenterPageLabels.pageIntro }}
        </p>
      </header>

      <!-- ============================================================
           Groups — one section per hub group
           ============================================================
           The computed `resolvedGroups` yields an ordered array of
           { group, documents } objects. The template iterates once
           per group and once per document within the group.

           A group whose `documents` array is empty is not rendered
           — an empty group produces no heading and no cards. This
           is defensive: the current data has no empty groups, but
           a future revision that moves a slug out without
           replacing it would degrade gracefully rather than
           rendering an empty heading.
           ============================================================ -->
      <section
        v-for="entry in resolvedGroups"
        v-show="entry.documents.length > 0"
        :key="entry.group.id"
        class="legal-center__group"
        data-testid="legal-center-group"
      >
        <h2
          class="legal-center__group-heading"
          data-testid="legal-center-group-heading"
        >
          {{ headingForGroup(entry.group) }}
        </h2>

        <ul class="legal-center__cards">
          <li
            v-for="doc in entry.documents"
            :key="doc.slug"
            class="legal-center__card-item"
          >
            <!--
              The whole card is the link. An <a> may contain block
              content in HTML5; the card's accessible name is
              composed from its contents — the <h3> title and the
              summary paragraph. RouterLink is used (not a bare
              <a>) so the SPA handles the navigation.
            -->
            <RouterLink
              :to="`/legal/${doc.slug}`"
              class="legal-center__card"
              data-testid="legal-center-card"
            >
              <h3 class="legal-center__card-title">
                {{ doc.title }}
              </h3>

              <p class="legal-center__card-summary">
                {{ doc.summary }}
              </p>

              <!--
                The draft chip. Rendered only when the document's
                status is 'draft'. Text-only — the word itself
                conveys the state; the border is decoration.
              -->
              <span
                v-if="doc.status === 'draft'"
                class="legal-center__card-chip"
                data-testid="legal-center-card-chip"
              >
                {{ legalCenterPageLabels.draftChipLabel }}
              </span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <!-- ============================================================
           Footer — back-to-login link
           ============================================================
           A convenience for a public visitor. An authenticated
           user who activates it is redirected by the router
           guard's guestOnly branch (guards.ts) to their session,
           so the same link is correct for both audiences.
           ============================================================ -->
      <footer class="legal-center__footer">
        <RouterLink
          to="/login"
          class="legal-center__back-link"
          data-testid="legal-center-back"
        >
          {{ legalCenterPageLabels.backToLoginLabel }}
        </RouterLink>
      </footer>
    </article>
  </ErrorShell>
</template>

<style scoped>
/* ============================================================================
   Root <article>
   ---------------------------------------------------------------------------
   A left-aligned vertical stack. The article is capped at the
   form-reading width and centered within the shell's content
   region.
   ============================================================================ */
.legal-center {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-8, 32px);
  width: 100%;

  /*
   * Reading width. Consulted in order:
   *   1. --mases-container-form             (first choice)
   *   2. --mases-container-auth-card-wide   (fallback)
   *   3. 560px                              (final fallback)
   *
   * The nested var() chain is standard CSS: if the outer token is
   * undefined, the fallback expression is evaluated; the inner
   * token is then consulted, and 560px is used only if the inner
   * token is also undefined.
   */
  max-width: var(
    --mases-container-form,
    var(--mases-container-auth-card-wide, 560px)
  );
  margin-inline: auto;

  font-family: inherit;
}

/* ============================================================================
   Header
   ============================================================================ */
.legal-center__header {
  margin: 0;
}

.legal-center__title {
  margin: 0;

  color: var(--mases-color-text-primary, #141009);

  font-family: inherit;
  font-size: var(--mases-font-size-heading-4, 24px);
  line-height: var(--mases-line-height-heading-4, 32px);
  font-weight: var(--mases-font-weight-semibold, 600);

  text-align: start;
  overflow-wrap: anywhere;
}

.legal-center__intro {
  margin: 0;
  margin-block-start: var(--mases-space-3, 12px);

  color: var(--mases-color-text-secondary, #3F382B);

  font-size: var(--mases-font-size-body, 16px);
  line-height: var(--mases-line-height-body, 26px);

  text-align: start;
  overflow-wrap: anywhere;
}

/* ============================================================================
   Group sections
   ============================================================================ */
.legal-center__group {
  margin: 0;
}

.legal-center__group-heading {
  margin: 0;
  margin-block-end: var(--mases-space-3, 12px);

  color: var(--mases-color-text-primary, #141009);

  font-size: var(--mases-font-size-body, 16px);
  line-height: var(--mases-line-height-body, 26px);
  font-weight: var(--mases-font-weight-semibold, 600);

  text-align: start;
  overflow-wrap: anywhere;
}

/* ============================================================================
   Card list
   ---------------------------------------------------------------------------
   A vertical stack of cards. No grid — the hub is a reading surface
   and a single column is the correct presentation. The list is
   rendered as a real <ul> so a screen reader announces the number
   of items.
   ============================================================================ */
.legal-center__cards {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3, 12px);

  margin: 0;
  padding: 0;

  list-style: none;
}

.legal-center__card-item {
  margin: 0;
  padding: 0;
}

/* ============================================================================
   Card
   ---------------------------------------------------------------------------
   The whole card is an anchor. A bordered, padded block with the
   title, summary, and optional chip stacked vertically.
   ============================================================================ */
.legal-center__card {
  display: block;

  padding-block: var(--mases-space-4, 16px);
  padding-inline: var(--mases-space-4, 16px);

  border: 1px solid var(--mases-color-border-subtle, #E5E0D2);
  border-radius: var(--mases-radius-md, 8px);

  color: inherit;
  text-decoration: none;

  /*
   * The transition is on border-color and background-color only —
   * no motion, no transform. A future revision that wants a hover
   * lift must gate it behind the reduced-motion media query.
   */
  transition:
    border-color 120ms ease,
    background-color 120ms ease;
}

.legal-center__card:hover,
.legal-center__card:focus-visible {
  border-color: var(--mases-color-text-secondary, #3F382B);
}

.legal-center__card-title {
  margin: 0;

  color: var(--mases-color-text-primary, #141009);

  font-size: var(--mases-font-size-body, 16px);
  line-height: var(--mases-line-height-body, 26px);
  font-weight: var(--mases-font-weight-semibold, 600);

  text-align: start;
  overflow-wrap: anywhere;
}

.legal-center__card-summary {
  margin: 0;
  margin-block-start: var(--mases-space-2, 8px);

  color: var(--mases-color-text-secondary, #3F382B);

  font-size: var(--mases-font-size-body-sm, 14px);
  line-height: var(--mases-line-height-body-sm, 22px);

  text-align: start;
  overflow-wrap: anywhere;
}

.legal-center__card-chip {
  display: inline-block;

  margin-block-start: var(--mases-space-3, 12px);
  padding-block: var(--mases-space-2, 8px);
  padding-inline: var(--mases-space-3, 12px);

  border: 1px solid var(--mases-color-border-subtle, #E5E0D2);
  border-radius: var(--mases-radius-md, 8px);

  color: var(--mases-color-text-secondary, #3F382B);

  font-size: var(--mases-font-size-body-sm, 14px);
  line-height: var(--mases-line-height-body-sm, 22px);

  overflow-wrap: anywhere;
}

/* ============================================================================
   Footer — back-to-login link
   ============================================================================ */
.legal-center__footer {
  margin: 0;
  padding-block-start: var(--mases-space-6, 24px);

  border-block-start: 1px solid var(--mases-color-border-subtle, #E5E0D2);
}

.legal-center__back-link {
  display: inline-block;

  color: var(--mases-color-text-secondary, #3F382B);

  font-size: var(--mases-font-size-body-sm, 14px);
  line-height: var(--mases-line-height-body-sm, 22px);
  text-decoration: underline;

  overflow-wrap: anywhere;
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   The card's hover transition is the only motion this file
   defines. Under reduced-motion it is disabled — the border
   change still applies, but without the transition.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .legal-center__card {
    transition: none;
  }
}
</style>