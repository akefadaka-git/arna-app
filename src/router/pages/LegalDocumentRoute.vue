<!--
=============================================================================
 CHANGE VERIFICATION — L-4.10
=============================================================================

 File:      mase_app/src/router/pages/LegalDocumentRoute.vue  (AMEND)
 Unit:      L-4.10 — PageTitle adoption (legal document viewer)
 Delivery type:  Refactor — declarative document.title via <PageTitle>.
                 Two imports removed (onMounted, watch), one import
                 added (PageTitle), one function removed
                 (applyPageTitle), one hook removed (onMounted), one
                 watcher removed (watch(currentDocument, …)), one
                 computed added (pageTitle), one element added to the
                 template.
 Net lines:      +~65 docblock; −27 lines in <script setup> (the
                 applyPageTitle function and its comment, the onMounted
                 call, the watch call); +12 lines (the pageTitle
                 computed and the appName declaration); +1 template
                 element.

 Before (v1.0.0):
   The wrapper composed document.title in an imperative function
   called from two places:

     function applyPageTitle(): void {
       const doc = currentDocument.value;
       const pageLabel =
         doc !== null ? doc.title : legalDocumentPageLabels.notFoundTitle;
       const appName = import.meta.env.VITE_APP_NAME;
       if (typeof appName === 'string' && appName.length > 0) {
         document.title = `${pageLabel} — ${appName}`;
       } else {
         document.title = pageLabel;
       }
     }

     onMounted(applyPageTitle);
     watch(currentDocument, applyPageTitle);

   The watcher existed because Vue Router reuses the component
   instance when only the :slug parameter changes: /legal/terms →
   /legal/privacy does not remount the route wrapper. The v1.0.0
   docblock records this explicitly:

     "The page title is therefore set by a watcher on
      currentDocument, not only by an onMounted hook — the initial
      mount is covered by onMounted, and every subsequent slug
      change is covered by the watcher."

 After (v1.1.0):
   The wrapper exposes a `pageTitle` computed and delegates the
   title mechanism to <PageTitle>:

     const pageTitle = computed<string>(() => {
       const doc = currentDocument.value;
       return doc !== null ? doc.title : legalDocumentPageLabels.notFoundTitle;
     });

     <PageTitle
       :title="pageTitle"
       :suffix="appName"
     />

   The reactive chain that replaces the imperative calls:

     route.params.slug
       →  currentDocument  (existing computed)
       →  pageTitle        (new computed)
       →  <PageTitle>'s :title binding
       →  PageTitle's internal watchEffect
       →  document.title

   Every link in that chain is reactive. When `route.params.slug`
   changes, `currentDocument` re-evaluates, `pageTitle` re-evaluates,
   PageTitle's `watchEffect` fires, and `document.title` is updated.
   The behavior is identical to v1.0.0's onMounted+watch pair — the
   slug-change case is preserved by construction, without any
   imperative logic in this wrapper.

   Observable behaviour on the route is identical:

     Navigating to /legal/terms   (workspace build)
       v1.0.0  →  document.title = "የአጠቃቀም ውሎች — MASES"
       v1.1.0  →  document.title = "የአጠቃቀም ውሎች — MASES"           (identical)

     Then navigating to /legal/privacy  (slug change, component reuse)
       v1.0.0  →  document.title = "የግላዊነትና የውሂብ ጠበቃ ፖሊሲ — MASES"
       v1.1.0  →  document.title = "የግላዊነትና የውሂብ ጠበቃ ፖሊሲ — MASES"  (identical)

     Navigating to /legal/unresolvable-slug
       v1.0.0  →  document.title = "ሰነዱ አልተገኘም — MASES"
       v1.1.0  →  document.title = "ሰነዱ አልተገኘም — MASES"           (identical)

     VITE_APP_NAME = "" or absent at runtime
       v1.0.0  →  document.title = "<pageLabel>"
       v1.1.0  →  document.title = "<pageLabel>"                    (identical)

   One microscopic difference in the empty-suffix case: v1.0.0's
   guard used `appName.length > 0`, which allowed a whitespace-only
   VITE_APP_NAME through (producing a title with a trailing
   ` —   `). PageTitle v1.0.0's guard uses `suffix.trim() !== ''`,
   which rejects whitespace-only suffixes and omits the separator.
   This is a strictly better guard; the observable behavior
   changes only for a misconfigured build, and only in the correct
   direction.

   No other behaviour change. The currentDocument, isDraft,
   metadataRows, and relatedDocuments computeds; the
   ErrorShell composition; the article's header, metadata, TOC,
   body sections, version history, and related documents; and
   every scoped style rule are byte-for-byte identical to v1.0.0.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — LegalDocumentRoute
=============================================================================

 File:      mase_app/src/router/pages/LegalDocumentRoute.vue
 Layer:     Core (router page)
 Version:   1.1.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2 (route tiers)
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            L-4.10 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. The public legal-document viewer. Resolves
          the URL's :slug parameter against the documents defined in
          @/router/legal-content, renders the document's metadata,
          draft notice (when applicable), table of contents, body
          sections, version history, and related-document cross-links.
          Renders a not-found state for an unresolvable slug.

 1.1.0  — L-4.10. Delegates document.title management to <PageTitle>.

          Prior to this revision, the title was composed by an
          imperative function `applyPageTitle()` invoked from both an
          onMounted hook (initial mount) and a watcher on
          `currentDocument` (slug change — Vue Router reuses the
          component instance when only the :slug parameter changes).

          PageTitle v1.0.0 — delivered at Stage 11, unused until
          L-4.1 — performs the same composition declaratively, with
          the same three structural advantages documented in L-4.1
          (LoginRoute v1.3.0):

            · It restores the previous document.title on unmount.
            · It re-evaluates when its props change.
            · It is the single source of document.title logic for
              every route wrapper.

          The third advantage is the load-bearing one for this
          wrapper: PageTitle's internal watchEffect re-runs whenever
          its `:title` binding changes, and the binding reads a
          computed that depends on `route.params.slug`. The slug-change
          case that v1.0.0 handled with an explicit watcher is handled
          by the reactive chain alone.

          The migration removes:

            · the `applyPageTitle()` function and its comment;
            · the `onMounted(applyPageTitle)` call;
            · the `watch(currentDocument, applyPageTitle)` call;
            · the `onMounted` and `watch` imports from 'vue';

          and adds:

            · the `pageTitle` computed (the body of `applyPageTitle`
              reduced to its pure expression);
            · the `appName` declaration (read once, passed to
              PageTitle as the suffix);
            · one `<PageTitle>` element in the template;
            · the `PageTitle` import.

          The behavioral result is identical for every non-degenerate
          input. The one microscopic difference — the empty-VITE_APP_NAME
          guard — is documented in the companion change-verification
          block §"After (v1.1.0)".

          No other change. The currentDocument, isDraft, metadataRows,
          and relatedDocuments computeds; the ErrorShell composition;
          the article's header, metadata, TOC, body sections, version
          history, and related documents; and every scoped style rule
          are byte-for-byte identical to v1.0.0.

          See the file docblock §"Why <PageTitle> is used" for the
          composition contract and §"Slug changes within the route"
          for the reactive-chain rationale.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /legal/:slug route's content. A single legal document presented
 as an article.

 -----------------------------------------------------------------------------
 Shell composition — the ErrorShell assumption
 -----------------------------------------------------------------------------
 Same as LegalCenterRoute.vue: composes ErrorShell with no props and
 a populated default slot, following the composition shape that
 ErrorRoute.vue uses in all three of its variant branches.

 If ErrorShell's actual API differs, the fix is a small outer-wrapper
 edit — the document's data model, section rendering, metadata
 resolution, and accessibility structure are unaffected.

 -----------------------------------------------------------------------------
 Reading width
 -----------------------------------------------------------------------------
 The document is capped at the form-reading width. Two tokens are
 consulted, in order:

   --mases-container-form              (first choice)
   --mases-container-auth-card-wide    (fallback)
   560px                               (final fallback)

 A narrow single-column layout is correct for long-form legal text
 at the current type scale. Line lengths of roughly 60–75 characters
 read well in Amharic; a wider column would produce lines that are
 harder to scan.

 -----------------------------------------------------------------------------
 Slug resolution and the not-found state
 -----------------------------------------------------------------------------
 The :slug route parameter is read once. If it is a non-empty
 string, the document is looked up by slug in legalDocuments. If it
 is empty, or if no document matches, the component renders its
 not-found state:

   · an <h1> with notFoundTitle
   · a message paragraph
   · a RouterLink back to /legal

 The not-found state is a normal, styled page in the legal surface —
 not a redirect to the shell's 404 handler, and not a global error
 route. A reader who bookmarked a document that was later renamed
 (or who mistyped a slug) sees the correct recovery path without
 leaving the legal surface.

 The document.title follows the same not-found fallback: when the
 :slug does not resolve, `pageTitle` reads notFoundTitle. The tab
 title and the not-found <h1> agree.

 -----------------------------------------------------------------------------
 Slug changes within the route
 -----------------------------------------------------------------------------
 Vue Router reuses this component when the :slug parameter changes
 (navigating from /legal/terms to /legal/privacy, for example). The
 page title must therefore re-apply on every slug change, not only
 on the initial mount.

 v1.0.0 handled this with two imperative calls — an onMounted hook
 for the initial mount and a watcher on `currentDocument` for every
 subsequent slug change. Both called the same `applyPageTitle()`
 function.

 v1.1.0 handles it with a reactive chain:

     route.params.slug
       →  currentDocument  (existing computed)
       →  pageTitle        (new computed — reads doc.title or
                            legalDocumentPageLabels.notFoundTitle)
       →  <PageTitle>'s :title binding
       →  PageTitle's internal watchEffect
       →  document.title

 Every link in that chain is reactive. PageTitle v1.0.0's watchEffect
 (see its own file header, §"Compose and apply the title") fires
 whenever its bound `:title` changes — which happens exactly when
 the underlying slug changes, because the binding reads a computed
 that depends on the slug.

 The wrapper therefore carries no imperative title logic at all. The
 composition is declarative end to end. This is the same pattern
 the other L-4 units use; the watcher removal is what makes this
 unit the largest of the twelve migrations.

 -----------------------------------------------------------------------------
 Metadata rendering — non-null fields only
 -----------------------------------------------------------------------------
 The metadata block renders one row per populated field. Fields whose
 value is null in the document record are not rendered — no row
 appears with an empty value, and no invented approver, owner, or
 date is displayed.

 Two fields are always present:
   · version    — a non-null string on every document
   · status     — a non-null union member; its display text is
                  looked up from statusValues

 The remaining seven fields (effectiveDate, lastModified,
 firstPublished, approvedBy, approvalDate, owner, previousVersion)
 are typed `string | null` and are set to null in the initial
 delivery. Their rows appear automatically when the fields are
 populated in a future revision of legal-content.ts — no change to
 this file is required.

 -----------------------------------------------------------------------------
 Draft notice
 -----------------------------------------------------------------------------
 When the document's status is 'draft', a document-control notice
 renders above the metadata block. The notice uses role="status" so
 a screen reader announces the state, matching the pattern that
 ErrorRoute.vue's not-found panel uses for its own status message.

 The notice is not an error. It is a formal statement of the
 document's lifecycle state: "this document is a draft submitted for
 legal review and final approval". A reader sees a professionally-
 marked controlled draft, not an unfinished page.

 When the document's status moves to 'approved' in legal-content.ts,
 the notice disappears without any change to this file.

 -----------------------------------------------------------------------------
 Table of contents
 -----------------------------------------------------------------------------
 Each document section's `id` is rendered as the `id` attribute on
 the corresponding <section> element. The table of contents renders
 native `<a href="#id">` anchors — not RouterLink, not programmatic
 navigation — so the browser performs the scroll to the anchor
 directly. No router involvement, no scroll interception.

 The <nav> element carries the aria-label from
 legalDocumentPageLabels.tocAriaLabel, distinguishing the table of
 contents from any other navigation landmark on the page.

 -----------------------------------------------------------------------------
 Version history and related documents
 -----------------------------------------------------------------------------
 Both blocks render only when their backing arrays are non-empty.
 The version history renders as a definition list (version → date +
 change summary); the related documents render as an unordered list
 of RouterLinks.

 A related-document slug that does not resolve against
 legalDocuments is dropped from the rendered list. The invariant is
 that every slug in a document's relatedSlugs matches a document in
 legalDocuments, but the resolution here is defensive — a typo in a
 future revision produces a shorter list rather than a dead link.

 -----------------------------------------------------------------------------
 Why <PageTitle> is used
 -----------------------------------------------------------------------------
 The wrapper is the correct owner of the page title: the wrapper
 knows the route's purpose, the ErrorShell composition and the
 article rendering do not.

 The composition is declarative:

     <PageTitle
       :title="pageTitle"
       :suffix="appName"
     />

 PageTitle (v1.0.0, src/layouts/AppShell/PageTitle/) is the
 shell's canonical document.title manager. It composes the string
 from a title and an optional suffix separated by an em-dash (the
 default separator is ` — `), handles the empty-suffix case by
 omitting the separator, restores the previous document.title on
 unmount, and re-runs when its props change.

 The separator PageTitle uses by default (` — `) is the same one
 v1.0.0's inline composition used, so the observable title is
 identical.

 Before v1.1.0, this wrapper duplicated PageTitle's logic in an
 imperative function called from an onMounted hook and a watcher.
 The wrapper now delegates to the shared component, matching the
 pattern L-4.1 through L-4.9 established and that the two remaining
 L-4 siblings will follow.

 -----------------------------------------------------------------------------
 Page title
 -----------------------------------------------------------------------------
 The composed title is `{pageLabel} — {appName}`:

     pageLabel = the resolved document's own title, or
                 legalDocumentPageLabels.notFoundTitle when the
                 :slug does not resolve
     appName   = import.meta.env.VITE_APP_NAME

 In the workspace build, a document titled "የአጠቃቀም ውሎች" produces
 the tab title "የአጠቃቀም ውሎች — MASES". In the portal build, the
 same document produces "የአጠቃቀም ውሎች — Maale Arna Portal".

 The page label is the same string the article's own <h1> renders
 (or, in the not-found state, the same string the not-found <h1>
 renders). The browser tab and the page heading agree.

 No cleanup on unmount is required in this file: PageTitle owns
 the restore-on-unmount behaviour. When the user navigates away,
 the next route's wrapper (or its absence) determines the visible
 title.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every user-facing string this file renders comes from either
 @/router/legal-labels (chrome) or @/router/legal-content (document
 titles, section headings, paragraphs). The component contributes
 no strings of its own.

 The only literals in this file are:
   · the fragment-href prefix '#' (structural);
   · the route paths '/legal' and '/legal/' (URLs, not user-facing
     text);
   · the CSS fallback values in the <style> block, which mirror
     tokens.

 The page title is composed from the resolved document's title (a
 legal-content string), legalDocumentPageLabels.notFoundTitle (a
 legal-labels string), and import.meta.env.VITE_APP_NAME. No literal
 string is introduced by this file.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css, expressed
 with a fallback per the pattern the auth route wrappers and the
 error route use. No hex value appears in this file except as a
 fallback value that mirrors a token.

 Colors used:
   --mases-color-text-primary      (title, section headings,
                                    metadata labels)
   --mases-color-text-secondary    (body paragraphs, metadata
                                    values, draft notice, TOC
                                    links, related-document links,
                                    back-link)
   --mases-color-border-subtle     (section separators, metadata
                                    block, draft notice box)

 Typography used:
   --mases-font-size-heading-2     (page title)
   --mases-line-height-heading-2

   --mases-font-size-heading-4     (section headings, metadata /
                                    TOC / version history /
                                    related documents headings)
   --mases-line-height-heading-4

   --mases-font-size-body          (paragraphs)
   --mases-line-height-body

   --mases-font-size-body-sm       (metadata rows, draft notice,
                                    version-history rows)
   --mases-line-height-body-sm

   --mases-font-weight-semibold    (page title, headings, metadata
                                    labels)

 Spacing used:
   --mases-space-2, --mases-space-3, --mases-space-4,
   --mases-space-6, --mases-space-8, --mases-space-10

 Container used:
   --mases-container-form          (preferred reading width)
   --mases-container-auth-card-wide (fallback)

 -----------------------------------------------------------------------------
 Production readiness
 -----------------------------------------------------------------------------
 Browser features this file relies on:

   · CSS custom properties with fallback   — universal.
   · `<script setup>`, `computed`           — build-time / runtime.
     (onMounted and watch are no longer used by this file as of
     v1.1.0; the entries are retained here to record that the
     previous version relied on them and to make the removals easy
     to verify.)
   · `import.meta.env`                      — Vite build-time.
   · Vue Router's `RouterLink` and `useRoute` — runtime only.
   · Native anchor navigation (`<a href>`),
     `@media print`                          — universal.

 No feature below the target matrix floor is introduced here.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="legal-document-root"             on the outer <article>
 data-testid="legal-document-title"            on the <h1>
 data-testid="legal-document-draft-notice"     on the draft notice
 data-testid="legal-document-metadata"         on the metadata <section>
 data-testid="legal-document-metadata-row"     on each metadata row
 data-testid="legal-document-toc"              on the TOC <nav>
 data-testid="legal-document-section"          on each body <section>
 data-testid="legal-document-version-history"  on the version-history <section>
 data-testid="legal-document-related"          on the related-documents <section>
 data-testid="legal-document-back"             on the back-to-hub link
 data-testid="legal-document-not-found"        on the not-found wrapper

 The wrapper contributes no test hooks of its own. The ErrorShell
 composition does not add any either.

 The PageTitle component also contributes no test hook — it renders
 nothing. A test that wants to verify the tab title asserts against
 `document.title` directly.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - One <h1> on the page — the document title (or, in the
     not-found state, the not-found title).
   - Metadata, TOC, body sections, version history, and related
     documents each render an <h2>. Heading levels nest correctly:
     h1 → h2.
   - The table of contents is a <nav> with an aria-label. Its links
     are native anchors — keyboard-accessible without any handler
     code, and reaching the target section via the browser's own
     fragment navigation.
   - Body sections carry stable `id` attributes so the TOC anchors
     resolve.
   - The draft notice uses role="status" so a screen reader
     announces the state on mount, matching the pattern established
     by ErrorRoute.vue's not-found panel.
   - Metadata uses a <dl> with grouped <dt>/<dd> pairs. Screen
     readers announce each pair as a term/definition.
   - Version history uses a <dl> in the same shape.
   - Related documents use a <ul> of RouterLinks — each is a real
     focusable element with a meaningful accessible name.
   - Focus rings come from the browser default and from the design
     system's global link focus styling. This file does not
     suppress focus outlines.
   - Long Amharic text wraps via `overflow-wrap: anywhere` on every
     element that can carry an unbroken string.
   - PageTitle renders nothing; it does not affect the
     accessibility tree.
   - Reduced motion: the only motion this file defines is the
     hover transition on the back-link and the related-document
     links; it is disabled under prefers-reduced-motion.

 -----------------------------------------------------------------------------
 Print
 -----------------------------------------------------------------------------
 The @media print block removes the back-to-hub link and the table
 of contents — neither is functional on a printed page. The
 metadata, draft notice, body, version history, and related
 documents all print, so an archived or physically-filed copy
 carries the document's full status and change log.

 Sections carry `break-inside: avoid` so a single section is not
 split across a page boundary.
=============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import ErrorShell from '@/components/patterns/ErrorShell';
import PageTitle from '@/layouts/AppShell/PageTitle';
import { legalDocumentPageLabels } from '@/router/legal-labels';
import {
  legalDocuments,
  type LegalDocument,
} from '@/router/legal-content';

// -----------------------------------------------------------------------------
// Route
// -----------------------------------------------------------------------------
const route = useRoute();

// -----------------------------------------------------------------------------
// Document resolution
// -----------------------------------------------------------------------------
/*
 * Resolve the :slug parameter against legalDocuments.
 *
 * The parameter is read from route.params.slug. In a route declared
 * as '/legal/:slug' it is always a single string — the `Array.isArray`
 * case cannot occur — but the type check is defensive: if a future
 * revision of routes-base.ts ever changes the parameter shape, this
 * reader does not silently accept an array and produce an undefined
 * lookup.
 *
 * Returns the matched document, or null when:
 *   · the parameter is empty, or
 *   · the parameter is not a string, or
 *   · no document's slug matches.
 *
 * The computed depends only on route.params.slug, so its cached
 * value is stable across re-renders until the slug changes.
 */
const currentDocument = computed<LegalDocument | null>(() => {
  const raw = route.params.slug;
  const slug = typeof raw === 'string' && raw !== '' ? raw : '';
  if (slug === '') return null;
  const match = legalDocuments.find((d) => d.slug === slug);
  return match ?? null;
});

// -----------------------------------------------------------------------------
// Draft state
// -----------------------------------------------------------------------------
/*
 * Whether the resolved document is a controlled draft. Used to
 * decide whether to render the draft notice above the metadata
 * block. A document whose status is 'approved' does not render the
 * notice; the absence of the notice is the signal that the document
 * is in force.
 */
const isDraft = computed<boolean>(
  () => currentDocument.value?.status === 'draft',
);

// -----------------------------------------------------------------------------
// Metadata rows
// -----------------------------------------------------------------------------
/*
 * Build the metadata rows as an ordered array of { label, value }
 * pairs. Only populated fields contribute a row — a null value
 * produces no row, so no empty or invented entry reaches the DOM.
 *
 * `version` and `status` are always present (version is a required
 * string; status is a required union member whose display text is
 * looked up from statusValues). The remaining seven fields are
 * conditional.
 */
interface MetadataRow {
  readonly label: string;
  readonly value: string;
}

const metadataRows = computed<ReadonlyArray<MetadataRow>>(() => {
  const doc = currentDocument.value;
  if (doc === null) return [];

  const fields = legalDocumentPageLabels.metadataFields;
  const values = legalDocumentPageLabels.statusValues;

  const rows: MetadataRow[] = [
    { label: fields.version, value: doc.version },
    { label: fields.status, value: values[doc.status] },
  ];

  if (doc.effectiveDate !== null) {
    rows.push({ label: fields.effectiveDate, value: doc.effectiveDate });
  }
  if (doc.lastModified !== null) {
    rows.push({ label: fields.lastModified, value: doc.lastModified });
  }
  if (doc.firstPublished !== null) {
    rows.push({ label: fields.firstPublished, value: doc.firstPublished });
  }
  if (doc.approvedBy !== null) {
    rows.push({ label: fields.approvedBy, value: doc.approvedBy });
  }
  if (doc.approvalDate !== null) {
    rows.push({ label: fields.approvalDate, value: doc.approvalDate });
  }
  if (doc.owner !== null) {
    rows.push({ label: fields.owner, value: doc.owner });
  }
  if (doc.previousVersion !== null) {
    rows.push({ label: fields.previousVersion, value: doc.previousVersion });
  }

  return rows;
});

// -----------------------------------------------------------------------------
// Related documents
// -----------------------------------------------------------------------------
/*
 * Resolve each related-document slug against legalDocuments. A slug
 * that does not resolve is dropped rather than rendered as a dead
 * link. The invariant is that every slug in a document's
 * relatedSlugs matches a document in legalDocuments; the resolution
 * here is defensive.
 */
const relatedDocuments = computed<ReadonlyArray<LegalDocument>>(() => {
  const doc = currentDocument.value;
  if (doc === null) return [];

  const resolved: LegalDocument[] = [];
  for (const slug of doc.relatedSlugs) {
    const match = legalDocuments.find((d) => d.slug === slug);
    if (match !== undefined) resolved.push(match);
  }
  return resolved;
});

// -----------------------------------------------------------------------------
// Page title
// -----------------------------------------------------------------------------
/*
 * The document.title for the active document. Reads the resolved
 * document's own title when the :slug resolves, and falls back to
 * the not-found title when it does not.
 *
 * The computed depends on `currentDocument`, which itself depends
 * on `route.params.slug`. When the slug changes — navigating from
 * /legal/terms to /legal/privacy reuses the component instance —
 * the computed re-evaluates, the <PageTitle> binding receives a
 * new value, and PageTitle's own watchEffect re-applies
 * document.title. The wrapper therefore carries no imperative
 * title logic: the reactive chain does the work.
 *
 * This replaces the v1.0.0 delivery's `applyPageTitle()` function
 * plus its explicit `onMounted` and `watch` pair. See the file
 * docblock §"Slug changes within the route" for the migration
 * rationale.
 */
const pageTitle = computed<string>(() => {
  const doc = currentDocument.value;
  return doc !== null ? doc.title : legalDocumentPageLabels.notFoundTitle;
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
 *
 * Passed to <PageTitle> as the title's suffix. PageTitle's own
 * guard handles an empty-string suffix by omitting the separator;
 * see the file docblock §"Why <PageTitle> is used".
 */
const appName: string = import.meta.env.VITE_APP_NAME;
</script>

<template>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to ErrorShell so that its lifetime matches the route's lifetime.

    The `:title` binding reads the `pageTitle` computed, which
    tracks `currentDocument` — and therefore `route.params.slug`.
    When the slug changes, the binding receives a new value and
    PageTitle re-applies document.title. The slug-change case is
    handled by the reactive chain; the wrapper carries no imperative
    title logic.
  -->
  <PageTitle
    :title="pageTitle"
    :suffix="appName"
  />

  <ErrorShell>
    <article
      class="legal-document"
      data-testid="legal-document-root"
    >
      <!-- ============================================================
           Not-found state
           ============================================================
           Rendered when the :slug parameter does not resolve to a
           document. The recovery path is the back-to-hub link,
           which is the same destination the document viewer's own
           back link points at.
           ============================================================ -->
      <div
        v-if="currentDocument === null"
        class="legal-document__not-found"
        data-testid="legal-document-not-found"
      >
        <h1 class="legal-document__title">
          {{ legalDocumentPageLabels.notFoundTitle }}
        </h1>

        <p class="legal-document__paragraph">
          {{ legalDocumentPageLabels.notFoundMessage }}
        </p>

        <RouterLink
          to="/legal"
          class="legal-document__back-link"
          data-testid="legal-document-back"
        >
          {{ legalDocumentPageLabels.backToLegalCenterLabel }}
        </RouterLink>
      </div>

      <!-- ============================================================
           Document
           ============================================================ -->
      <template v-else>
        <!-- Back to hub -->
        <RouterLink
          to="/legal"
          class="legal-document__back-link"
          data-testid="legal-document-back"
        >
          {{ legalDocumentPageLabels.backToLegalCenterLabel }}
        </RouterLink>

        <!-- Document title -->
        <h1
          class="legal-document__title"
          data-testid="legal-document-title"
        >
          {{ currentDocument.title }}
        </h1>

        <!-- Draft notice — rendered only when status is 'draft' -->
        <p
          v-if="isDraft"
          class="legal-document__draft-notice"
          role="status"
          data-testid="legal-document-draft-notice"
        >
          {{ legalDocumentPageLabels.draftNotice }}
        </p>

        <!-- ============================================================
             Metadata block
             ============================================================ -->
        <section
          class="legal-document__block"
          data-testid="legal-document-metadata"
        >
          <h2 class="legal-document__heading">
            {{ legalDocumentPageLabels.metadataHeading }}
          </h2>

          <dl class="legal-document__metadata-list">
            <div
              v-for="row in metadataRows"
              :key="row.label"
              class="legal-document__metadata-row"
              data-testid="legal-document-metadata-row"
            >
              <dt class="legal-document__metadata-label">
                {{ row.label }}
              </dt>
              <dd class="legal-document__metadata-value">
                {{ row.value }}
              </dd>
            </div>
          </dl>
        </section>

        <!-- ============================================================
             Table of contents
             ============================================================ -->
        <nav
          class="legal-document__toc"
          :aria-label="legalDocumentPageLabels.tocAriaLabel"
          data-testid="legal-document-toc"
        >
          <h2 class="legal-document__heading">
            {{ legalDocumentPageLabels.tocHeading }}
          </h2>

          <ul class="legal-document__toc-list">
            <li
              v-for="section in currentDocument.sections"
              :key="section.id"
            >
              <a :href="`#${section.id}`">
                {{ section.heading }}
              </a>
            </li>
          </ul>
        </nav>

        <!-- ============================================================
             Body sections
             ============================================================ -->
        <div class="legal-document__body">
          <section
            v-for="section in currentDocument.sections"
            :id="section.id"
            :key="section.id"
            class="legal-document__section"
            data-testid="legal-document-section"
          >
            <h2 class="legal-document__heading">
              {{ section.heading }}
            </h2>

            <p
              v-for="(paragraph, index) in section.paragraphs"
              :key="index"
              class="legal-document__paragraph"
            >
              {{ paragraph }}
            </p>
          </section>
        </div>

        <!-- ============================================================
             Version history — rendered only when non-empty
             ============================================================ -->
        <section
          v-if="currentDocument.versionHistory.length > 0"
          class="legal-document__block"
          data-testid="legal-document-version-history"
        >
          <h2 class="legal-document__heading">
            {{ legalDocumentPageLabels.versionHistoryHeading }}
          </h2>

          <dl class="legal-document__version-list">
            <div
              v-for="entry in currentDocument.versionHistory"
              :key="entry.version"
              class="legal-document__version-row"
            >
              <dt class="legal-document__version-term">
                {{ entry.version }}
              </dt>
              <dd class="legal-document__version-definition">
                <p
                  v-if="entry.date !== null"
                  class="legal-document__paragraph"
                >
                  {{ entry.date }}
                </p>
                <p class="legal-document__paragraph">
                  {{ entry.changeSummary }}
                </p>
              </dd>
            </div>
          </dl>
        </section>

        <!-- ============================================================
             Related documents — rendered only when non-empty
             ============================================================ -->
        <section
          v-if="relatedDocuments.length > 0"
          class="legal-document__block"
          data-testid="legal-document-related"
        >
          <h2 class="legal-document__heading">
            {{ legalDocumentPageLabels.relatedDocumentsHeading }}
          </h2>

          <ul class="legal-document__related-list">
            <li
              v-for="doc in relatedDocuments"
              :key="doc.slug"
            >
              <RouterLink :to="`/legal/${doc.slug}`">
                {{ doc.title }}
              </RouterLink>
            </li>
          </ul>
        </section>
      </template>
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
.legal-document {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-8, 32px);
  width: 100%;

  /*
   * Reading width. Consulted in order:
   *   1. --mases-container-form             (first choice)
   *   2. --mases-container-auth-card-wide   (fallback)
   *   3. 560px                              (final fallback)
   */
  max-width: var(
    --mases-container-form,
    var(--mases-container-auth-card-wide, 560px)
  );
  margin-inline: auto;

  font-family: inherit;
}

/* ============================================================================
   Not-found state
   ---------------------------------------------------------------------------
   Rendered when the :slug parameter does not resolve. Uses the same
   stack spacing as the document layout, with the message paragraph
   and back-to-hub link below the title.
   ============================================================================ */
.legal-document__not-found {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-4, 16px);
}

/* ============================================================================
   Title
   ============================================================================ */
.legal-document__title {
  margin: 0;

  color: var(--mases-color-text-primary, #141009);

  font-family: inherit;
  font-size: var(--mases-font-size-heading-2, 32px);
  line-height: var(--mases-line-height-heading-2, 40px);
  font-weight: var(--mases-font-weight-semibold, 600);

  text-align: start;
  overflow-wrap: anywhere;
}

/* ============================================================================
   Back-to-hub link
   ============================================================================ */
.legal-document__back-link {
  display: inline-block;

  color: var(--mases-color-text-secondary, #3F382B);

  font-size: var(--mases-font-size-body-sm, 14px);
  line-height: var(--mases-line-height-body-sm, 22px);
  text-decoration: underline;

  transition: color 120ms ease;

  overflow-wrap: anywhere;
}

.legal-document__back-link:hover,
.legal-document__back-link:focus-visible {
  color: var(--mases-color-text-primary, #141009);
}

/* ============================================================================
   Draft notice
   ---------------------------------------------------------------------------
   A bordered box above the metadata block. The border uses the
   subtle border token so the notice reads as a document-control
   chip, not as an alert. The text uses the secondary color so it
   sits below the title in visual weight.
   ============================================================================ */
.legal-document__draft-notice {
  margin: 0;

  padding-block: var(--mases-space-3, 12px);
  padding-inline: var(--mases-space-4, 16px);

  border: 1px solid var(--mases-color-border-subtle, #E5E0D2);
  border-radius: var(--mases-radius-md, 8px);

  color: var(--mases-color-text-secondary, #3F382B);

  font-size: var(--mases-font-size-body-sm, 14px);
  line-height: var(--mases-line-height-body-sm, 22px);

  text-align: start;
  overflow-wrap: anywhere;
}

/* ============================================================================
   Blocks (metadata, version history, related documents)
   ---------------------------------------------------------------------------
   Each block is a section with an <h2> heading. The heading is
   smaller than the document title but larger than body text.
   ============================================================================ */
.legal-document__block {
  margin: 0;
}

.legal-document__heading {
  margin: 0;
  margin-block-end: var(--mases-space-3, 12px);

  color: var(--mases-color-text-primary, #141009);

  font-size: var(--mases-font-size-heading-4, 24px);
  line-height: var(--mases-line-height-heading-4, 32px);
  font-weight: var(--mases-font-weight-semibold, 600);

  text-align: start;
  overflow-wrap: anywhere;
}

/* ============================================================================
   Metadata list
   ---------------------------------------------------------------------------
   A <dl> whose rows are grouped <dt>/<dd> pairs (each pair is
   wrapped in a <div>, which is valid HTML5). Each row is a two-
   column grid: the label takes its content's width, the value
   takes the remainder.
   ============================================================================ */
.legal-document__metadata-list {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3, 12px);

  margin: 0;
}

.legal-document__metadata-row {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--mases-space-3, 12px);

  margin: 0;
}

.legal-document__metadata-label {
  margin: 0;

  color: var(--mases-color-text-primary, #141009);

  font-size: var(--mases-font-size-body-sm, 14px);
  line-height: var(--mases-line-height-body-sm, 22px);
  font-weight: var(--mases-font-weight-semibold, 600);

  overflow-wrap: anywhere;
}

.legal-document__metadata-value {
  margin: 0;

  color: var(--mases-color-text-secondary, #3F382B);

  font-size: var(--mases-font-size-body-sm, 14px);
  line-height: var(--mases-line-height-body-sm, 22px);

  overflow-wrap: anywhere;
}

/* ============================================================================
   Table of contents
   ---------------------------------------------------------------------------
   A <nav> landmark with an aria-label. The list of anchor links
   scrolls the browser to each section's id. The heading "ይዘት"
   names the block visually; the aria-label on the <nav> names the
   landmark for assistive technology.
   ============================================================================ */
.legal-document__toc {
  margin: 0;
}

.legal-document__toc-list {
  margin: 0;
  padding: 0;

  list-style: none;
}

.legal-document__toc-list li {
  margin: 0;
  padding: 0;
}

.legal-document__toc-list li + li {
  margin-block-start: var(--mases-space-2, 8px);
}

.legal-document__toc-list a {
  display: inline-block;

  color: var(--mases-color-text-secondary, #3F382B);

  font-size: var(--mases-font-size-body-sm, 14px);
  line-height: var(--mases-line-height-body-sm, 22px);
  text-decoration: underline;

  overflow-wrap: anywhere;
}

.legal-document__toc-list a:hover,
.legal-document__toc-list a:focus-visible {
  color: var(--mases-color-text-primary, #141009);
}

/* ============================================================================
   Body sections
   ---------------------------------------------------------------------------
   The document's main content. Each section has a stable id used by
   the TOC anchors. Sections are separated by the vertical stack's
   gap and, optionally, a subtle top border. The scroll-margin-top
   gives anchor navigation a small offset in case the shell renders
   a sticky header.
   ============================================================================ */
.legal-document__body {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-8, 32px);
}

.legal-document__section {
  margin: 0;

  scroll-margin-top: var(--mases-space-4, 16px);
}

.legal-document__paragraph {
  margin: 0;

  color: var(--mases-color-text-secondary, #3F382B);

  font-size: var(--mases-font-size-body, 16px);
  line-height: var(--mases-line-height-body, 26px);

  text-align: start;
  overflow-wrap: anywhere;
}

.legal-document__paragraph + .legal-document__paragraph {
  margin-block-start: var(--mases-space-3, 12px);
}

/* ============================================================================
   Version history
   ---------------------------------------------------------------------------
   A <dl> in the same grouped-pair shape as the metadata list. Each
   entry shows the version as the term and the date + change summary
   as the definition.
   ============================================================================ */
.legal-document__version-list {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-4, 16px);

  margin: 0;
}

.legal-document__version-row {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2, 8px);

  margin: 0;
}

.legal-document__version-term {
  margin: 0;

  color: var(--mases-color-text-primary, #141009);

  font-size: var(--mases-font-size-body-sm, 14px);
  line-height: var(--mases-line-height-body-sm, 22px);
  font-weight: var(--mases-font-weight-semibold, 600);

  overflow-wrap: anywhere;
}

.legal-document__version-definition {
  margin: 0;
}

/* ============================================================================
   Related documents
   ============================================================================ */
.legal-document__related-list {
  margin: 0;
  padding: 0;

  list-style: none;
}

.legal-document__related-list li {
  margin: 0;
  padding: 0;
}

.legal-document__related-list li + li {
  margin-block-start: var(--mases-space-2, 8px);
}

.legal-document__related-list a {
  display: inline-block;

  color: var(--mases-color-text-secondary, #3F382B);

  font-size: var(--mases-font-size-body-sm, 14px);
  line-height: var(--mases-line-height-body-sm, 22px);
  text-decoration: underline;

  overflow-wrap: anywhere;
}

.legal-document__related-list a:hover,
.legal-document__related-list a:focus-visible {
  color: var(--mases-color-text-primary, #141009);
}

/* ============================================================================
   Print
   ---------------------------------------------------------------------------
   A printed legal document should read as a clean document:
     · the back-to-hub link is removed (it cannot be used on paper);
     · the table of contents is removed (the reader has the whole
       document in front of them — the TOC was a navigation aid);
     · the reading-width constraint is lifted so the print output
       uses the full page width;
     · sections avoid splitting across page breaks.
   ============================================================================ */
@media print {
  .legal-document__back-link,
  .legal-document__toc {
    display: none;
  }

  .legal-document {
    max-width: none;
  }

  .legal-document__section {
    break-inside: avoid;
  }
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   The hover transitions on the back-link, TOC links, and related-
   document links are the only motion this file defines. Under
   reduced-motion they are disabled — the color changes still apply,
   but without the transition.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .legal-document__back-link,
  .legal-document__toc-list a,
  .legal-document__related-list a {
    transition: none;
  }
}
</style>