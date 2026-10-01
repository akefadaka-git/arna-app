/*
 * =============================================================================
 * MASES Phase 2 UI — Legal Center & Legal Document Labels (Amharic)
 * =============================================================================
 *
 * File:      mase_app/src/router/legal-labels.ts
 * Layer:     Core (router configuration)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §9 (Localization)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2 (route tiers)
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The user-facing chrome for the two public Legal Center surfaces:
 *
 *     /legal                →  the Legal Center hub
 *     /legal/:slug          →  an individual legal document
 *
 * This file is the legal surface's counterpart to router/error-labels.ts,
 * router/auth-labels.ts, and router/launcher-labels.ts. It follows the
 * same pattern: every value is Amharic, the key names remain English
 * identifiers describing the slot each value fills, and the file
 * contributes no legal body text.
 *
 * Consumed by:
 *   router/pages/LegalCenterRoute.vue     (L-4, the hub)
 *   router/pages/LegalDocumentRoute.vue   (L-5, the document viewer)
 *
 * -----------------------------------------------------------------------------
 * Split from legal-content.ts — deliberately
 * -----------------------------------------------------------------------------
 * The Legal Center's user-facing text is split across two files:
 *
 *   · THIS FILE — chrome labels. Page title, intro sentence, section
 *     headings, metadata field labels, status value labels, button and
 *     link text, generic notices. Every string is a fixed UI
 *     affordance that does not change per-document and does not
 *     constitute a legal statement.
 *
 *   · legal-content.ts (L-3) — the legal documents themselves. Each
 *     document's title, summary, sections, paragraphs, version
 *     history, and hub grouping. The content is policy text and is
 *     subject to corporate/legal approval.
 *
 * The split exists because the two have different ownership:
 * chrome labels are the frontend team's responsibility; legal
 * content is Maale Arna Share Company's legal and corporate
 * responsibility. A future CR that changes a legal clause
 * touches legal-content.ts only. A future CR that changes a
 * button label touches this file only.
 *
 * -----------------------------------------------------------------------------
 * What this file exports
 * -----------------------------------------------------------------------------
 * Two constants, one per surface:
 *
 *   legalCenterPageLabels: LegalCenterPageLabels
 *     The hub page's chrome — the page title, the intro sentence,
 *     the two hub group headings, the "draft" chip label used on
 *     document cards, and the back-to-login link at the bottom.
 *
 *   legalDocumentPageLabels: LegalDocumentPageLabels
 *     The document viewer's chrome — the metadata block labels,
 *     the status value labels, the draft notice, the table-of-
 *     contents heading and aria-label, the version history
 *     heading, the related documents heading, the back-to-legal-
 *     center link, and the not-found state's title and message.
 *
 * -----------------------------------------------------------------------------
 * Draft-status lifecycle
 * -----------------------------------------------------------------------------
 * The Legal Center uses a document-control status model. In Stage 1
 * every document ships with status 'draft' — its legal text has
 * been authored but has not yet received final corporate/legal
 * approval. The document viewer renders the value from
 * `statusValues.draft` ("ረቂቅ") and the notice from `draftNotice`
 * whenever the document's status is 'draft'.
 *
 * The status values ('draft', 'approved', 'superseded', 'archived')
 * are the four states the UI can render. Stage 1 exercises only the
 * first two; the other two are present so the label set does not
 * have to be reissued when the lifecycle expands.
 *
 * The `draftNotice` wording is deliberate: "this document is a
 * draft submitted for legal review and final approval". It reads
 * like an enterprise document-control notice, not an error or a
 * placeholder warning. A reader sees a professionally-marked
 * controlled draft, not an unfinished page.
 *
 * -----------------------------------------------------------------------------
 * Terms handled deliberately
 * -----------------------------------------------------------------------------
 * "ሕጋዊ መረጃ" (legal information) is the hub page's <h1> and the
 * target of the footer's legal link. The same string is used by the
 * back-to-legal-center link so that the destination's name is
 * consistent across the two surfaces.
 *
 * "የሕጋዊ መረጃ ማዕከል" (Legal Information Center) names the hub in the
 * intro sentence. "ማዕከል" (center) is the standard Amharic term
 * for a curated collection of related content.
 *
 * "በቀጥታ የሚያስፈልጉ ሰነዶች" (documents needed directly / essential
 * documents) is the first hub group's heading. It contains the
 * three documents a user is most likely to look for: terms of use,
 * privacy & data protection, and the cookie/technology notice.
 * The wording is descriptive, not a legal claim — it tells the
 * reader where to start.
 *
 * "ሌሎች ሕጋዊ መረጃዎች" (other legal information) is the second hub
 * group's heading. It contains the remaining five documents. The
 * grouping is navigation, not legal hierarchy.
 *
 * "የሰነድ መረጃ" (document information) is the metadata block's
 * heading. It precedes the version/status/date rows.
 *
 * "ረቂቅ" (draft) is the document-control status for a document
 * that has not yet been approved. It is one word, matching the
 * register of the other status values.
 *
 * "ጸድቋል" (has been approved) is the status value for an approved
 * document. The perfective third-person form is the standard
 * Amharic convention for a document status that is a completed
 * state.
 *
 * "ተተክቷል" (has been replaced) is the status value for a document
 * that has been superseded by a newer approved version. Reserved
 * for a future lifecycle stage.
 *
 * "ተቀምጧል" (has been placed/archived) is the status value for a
 * historical document retained for reference. Reserved for a
 * future lifecycle stage.
 *
 * "ያጸደቀው" (the one who approved it) is the metadata field label
 * for the approving authority. The value is left empty until an
 * actual approver is known — the field renders only when populated,
 * so no invented approver is ever displayed.
 *
 * "የሰነዱ ኃላፊ" (the document's responsible party / owner) is the
 * metadata field label for the department or role responsible for
 * the document. The value is left empty until a real owner is
 * known, for the same reason as the approver field.
 *
 * "የመጨረሻ ማሻሻያ ቀን" (last modification date) and "የመጀመሪያ ህትመት ቀን"
 * (first publication date) are the two metadata date fields that
 * most documents will populate once they enter the approval
 * workflow. The `ቀን` suffix ("date") is present on all four
 * date-related metadata fields so their type is unambiguous.
 *
 * "ይዘት" (contents) is the table-of-contents heading. "የሰነዱ ይዘት"
 * (the document's contents) is the <nav>'s aria-label — the fuller
 * form is used for the screen-reader-only accessible name so a
 * screen-reader user hears which surface the nav belongs to.
 *
 * "የለውጥ ታሪክ" (change history) is the version-history section's
 * heading. The same string is used by convention across MASES
 * documentation surfaces.
 *
 * "ተዛማጅ ሰነዶች" (related documents) is the cross-reference
 * section's heading at the bottom of each document.
 *
 * "ወደ ሕጋዊ መረጃ ይመለሱ" (return to legal information) is the
 * back-to-hub link. The plural imperative "ይመለሱ" is used to match
 * the register of the auth label set's back-to-login link
 * ("ወደ መግቢያ ይመለሱ"), so the two "return to" affordances across
 * the public surface read consistently.
 *
 * "ወደ መግቢያ ይመለሱ" (return to login) is the hub page's
 * back-to-login link. It is the same string that error-labels.ts
 * and the six auth labels use for the same destination, so a user
 * who moves between the legal hub, the login page, and an error
 * page sees one consistent name for the login surface.
 *
 * -----------------------------------------------------------------------------
 * Amharic-first rule
 * -----------------------------------------------------------------------------
 * Every value in this file is Amharic. There is no English
 * user-facing string. The one Latin-script term that appears
 * anywhere in the Legal Center's user-facing text is the corporate
 * brand mark ("MASES" in the shell's brand slot; "ማሴስ" in the
 * Amharic-script brand labels). This file does not render the
 * brand — that is the shell's responsibility — so no Latin-script
 * string appears here at all.
 *
 * -----------------------------------------------------------------------------
 * No legal body text
 * -----------------------------------------------------------------------------
 * This file contains no legal clause, no policy statement, no
 * jurisdictional claim, no data-processing description, no
 * retention period, no third-party provider name, and no
 * regulatory citation. All of those belong to legal-content.ts
 * and are subject to corporate/legal approval before publication.
 *
 * The strings here are UI affordances: page chrome, section
 * headings, field labels, status value labels, and generic
 * navigation text. A future maintainer should not add legal body
 * text to this file — it belongs in legal-content.ts.
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery. Amharic chrome labels for the two
 *          Legal Center surfaces. Legal body content is delivered
 *          separately by legal-content.ts (L-3); this file
 *          contributes no legal text.
 *
 * -----------------------------------------------------------------------------
 * Native-speaker review needed
 * -----------------------------------------------------------------------------
 * The following strings are the most likely candidates for
 * adjustment by a native Amharic reviewer. They are idiomatic as
 * far as this author can determine, but native review is the
 * correct final gate:
 *
 *   · legalCenterPageLabels.pageIntro — "የማሌ ዓርና አክሲዮን ማኅበር
 *     የሕጋዊ መረጃ ማዕከል።" — a single-sentence introduction. A reviewer
 *     may prefer a construction that names the platform
 *     explicitly, or a slightly longer form that explains what the
 *     reader will find on the page. The current form is deliberately
 *     short.
 *
 *   · legalCenterPageLabels.hubGroups.essential — "በቀጥታ
 *     የሚያስፈልጉ ሰነዶች". A reviewer may prefer "ዋና ሰነዶች" ("main
 *     documents") or "በተደጋጋሚ የሚጠየቁ ሰነዶች" ("frequently requested
 *     documents"). The current form was chosen to convey "the
 *     documents a reader most often needs directly" without
 *     implying legal priority.
 *
 *   · legalCenterPageLabels.hubGroups.additional — "ሌሎች ሕጋዊ
 *     መረጃዎች". A reviewer may prefer "ተጨማሪ ሕጋዊ መረጃዎች" ("additional
 *     legal information"). Either is correct.
 *
 *   · legalDocumentPageLabels.statusValues.superseded —
 *     "ተተክቷል". The perfective form of "to be replaced". A
 *     reviewer may prefer a construction that names the replacing
 *     document explicitly, e.g. "በአዲስ ስሪት ተተክቷል" ("replaced by a
 *     new version"). The shorter form was chosen for the metadata
 *     row, which already displays the previous version's
 *     identifier separately.
 *
 *   · legalDocumentPageLabels.statusValues.archived — "ተቀምጧል".
 *     Literally "has been placed". Used in the MASES register for
 *     a document retained for reference. A reviewer may prefer
 *     "ተመዝግቧል" ("has been recorded") or "ወደ ማህደር ገብቷል" ("has
 *     entered the archive"). The latter is clearer but longer.
 *
 *   · legalDocumentPageLabels.metadataFields.approvedBy —
 *     "ያጸደቀው" ("the one who approved it"). A reviewer may prefer
 *     "ያጸደቀው አካል" ("the approving body") or "ያጸደቀው ኃላፊ" ("the
 *     approving officer"). The bare relative form was chosen to
 *     work for both a person and a body.
 *
 *   · legalDocumentPageLabels.metadataFields.owner — "የሰነዱ ኃላፊ"
 *     ("the document's responsible party"). A reviewer may prefer
 *     "የሰነዱ ባለቤት" ("the document's owner"), which is more literal
 *     but implies a stronger ownership claim. The current form
 *     conveys stewardship rather than property.
 *
 *   · legalDocumentPageLabels.draftNotice — "ይህ ሰነድ ለሕጋዊ ግምገማና
 *     ለመጨረሻ ማጽደቅ የቀረበ ረቂቅ ሰነድ ነው።" A reviewer should confirm the
 *     register is right for a public-facing document-control
 *     notice. The wording was chosen to read as a formal state, not
 *     an error.
 *
 *   · legalDocumentPageLabels.notFoundTitle — "ሰነዱ አልተገኘም" and
 *     legalDocumentPageLabels.notFoundMessage — "ይህ ሕጋዊ ሰነድ
 *     አልተገኘም።". The two strings are very close. A reviewer may
 *     prefer a message that adds recovery guidance, e.g.
 *     "…እባክዎ ወደ ሕጋዊ መረጃ ተመልሰው ከተዘረዘሩት ሰነዶች አንዱን ይምረጡ።". The
 *     current short form relies on the always-present back-to-hub
 *     link to communicate the recovery path.
 *
 * None of these strings block delivery; the review is a
 * refinement. The legal body content — which lands in
 * legal-content.ts — will require its own separate review, both
 * for Amharic register and for legal accuracy.
 *
 * -----------------------------------------------------------------------------
 * Outstanding items
 * -----------------------------------------------------------------------------
 * 1. Native-speaker review of the eight strings listed above.
 *
 * 2. The Legal Center's legal body content requires corporate/legal
 *    approval. That approval is tracked at the content layer
 *    (legal-content.ts), not here. This file is complete and does
 *    not change when the content moves from 'draft' to 'approved'.
 *
 * 3. The footer's legal link — "ሕጋዊ መረጃ" — is not defined here.
 *    It belongs to the footer integration CR (L-8), which adds
 *    `masesFooterLabels` to shell-labels.ts. This file supplies
 *    the label for the destination page's <h1>, which the footer's
 *    link label will match by convention.
 * =============================================================================
 */

// =============================================================================
// Hub page types
// =============================================================================

/**
 * The two group headings the Legal Center hub renders.
 *
 * The hub is not a flat grid. It splits the eight documents into
 * a "start here" group and an "everything else" group so that a
 * reader who only needs the terms, the privacy notice, or the
 * cookie disclosure reaches them without scanning the full list.
 *
 * Both headings are user-facing and Amharic. The order in this
 * interface matches the order the hub renders them.
 */
export interface LegalHubGroupLabels {
  /**
   * The first group's heading. Contains the three documents a
   * reader most often needs: terms of use, privacy & data
   * protection, and the cookie/technology notice.
   */
  readonly essential: string;

  /**
   * The second group's heading. Contains the remaining five
   * documents: security, electronic records, intellectual property,
   * the ARNA AI notice, and the legal notice.
   */
  readonly additional: string;
}

/**
 * The Legal Center hub page's chrome labels.
 *
 * Consumed by router/pages/LegalCenterRoute.vue.
 */
export interface LegalCenterPageLabels {
  /**
   * The page's <h1> and the label composed into document.title.
   * Matches the visible label of the footer's legal link (defined
   * in the footer integration CR), so the link and its destination
   * agree on the term.
   */
  readonly pageTitle: string;

  /**
   * A single sentence below the <h1> that introduces the page.
   * Rendered as a paragraph. Deliberately short — the hub's card
   * structure communicates what the page contains.
   */
  readonly pageIntro: string;

  /**
   * The two group headings the hub uses to split its documents.
   */
  readonly hubGroups: LegalHubGroupLabels;

  /**
   * The small chip rendered on a hub card when the document's
   * status is 'draft'. Same value as
   * legalDocumentPageLabels.statusValues.draft, kept separately so
   * the hub and the document viewer can diverge if the chip ever
   * needs different wording from the metadata row.
   */
  readonly draftChipLabel: string;

  /**
   * The "return to login" link at the bottom of the hub page. A
   * public-visitor convenience — a reader who arrived from a
   * marketing email or a bookmark can go to the login page without
   * editing the URL.
   *
   * An already-authenticated user who activates this link is
   * caught by the router guard's guestOnly branch (guards.ts) and
   * redirected to their session, so the same link is correct for
   * both audiences without conditional logic.
   */
  readonly backToLoginLabel: string;
}

// =============================================================================
// Document page types
// =============================================================================

/**
 * The labels for the nine metadata rows a legal document can
 * display.
 *
 * Each field's value is rendered only when the corresponding
 * document property is non-null. A field whose label is defined
 * here but whose value is empty on a given document is not shown —
 * the row does not render. This rule prevents invented approvers,
 * invented owners, and invented dates.
 *
 * The metadata block's heading and the status value labels live
 * on LegalDocumentPageLabels, not here, because they are not
 * fields of a single key/value row.
 */
export interface LegalMetadataFieldLabels {
  /**
   * The document's version identifier, e.g. "1.0.0". The label is
   * the row's field name; the value comes from legal-content.ts.
   */
  readonly version: string;

  /**
   * The document's status. The value rendered is looked up from
   * LegalStatusValueLabels by the document's status field, not
   * stored as a free string.
   */
  readonly status: string;

  /**
   * The date the document takes effect. Populated only when the
   * document is approved and an effective date has been set.
   */
  readonly effectiveDate: string;

  /**
   * The date of the most recent modification to the document.
   * Populated when a change history exists.
   */
  readonly lastModified: string;

  /**
   * The date the document was first published under its current
   * title. Populated for documents that have been through at least
   * one publication cycle.
   */
  readonly firstPublished: string;

  /**
   * The person or body that approved the document. Populated only
   * when corporate approval has occurred. An empty value means the
   * row does not render — no invented approver is displayed.
   */
  readonly approvedBy: string;

  /**
   * The date approval was granted. Populated together with
   * `approvedBy`; if either is empty, neither renders.
   */
  readonly approvalDate: string;

  /**
   * The department or role responsible for maintaining the
   * document. Populated only when an owner has been assigned. An
   * empty value means the row does not render.
   */
  readonly owner: string;

  /**
   * The identifier of the document's immediately preceding
   * version, e.g. "0.9.0". Populated only when the document has
   * been revised at least once under its current title.
   */
  readonly previousVersion: string;
}

/**
 * The four document-control states the UI can render.
 *
 * Stage 1 exercises only `draft` and `approved`. `superseded` and
 * `archived` are reserved for a future lifecycle expansion; they
 * exist here so the label set does not need to be reissued when
 * the workflow gains those states.
 */
export interface LegalStatusValueLabels {
  /**
   * The document is a controlled draft and has not yet received
   * final corporate/legal approval. Rendered with the notice
   * from `draftNotice`.
   */
  readonly draft: string;

  /**
   * The document has been approved and is in force. The draft
   * notice does not render for this state.
   */
  readonly approved: string;

  /**
   * The document has been replaced by a newer approved version.
   * Reserved for a future lifecycle stage; not reachable in
   * Stage 1.
   */
  readonly superseded: string;

  /**
   * The document has been retained for historical reference. Not
   * reachable in Stage 1.
   */
  readonly archived: string;
}

/**
 * The document viewer page's chrome labels.
 *
 * Consumed by router/pages/LegalDocumentRoute.vue.
 */
export interface LegalDocumentPageLabels {
  /**
   * The heading above the metadata block. Rendered as an <h2>.
   * The block itself is a definition list of label/value rows.
   */
  readonly metadataHeading: string;

  /**
   * The nine metadata field labels. Each label is a row's field
   * name; the value comes from legal-content.ts.
   */
  readonly metadataFields: LegalMetadataFieldLabels;

  /**
   * The four status value labels. The document viewer looks up the
   * display value by the document's status field.
   */
  readonly statusValues: LegalStatusValueLabels;

  /**
   * The notice rendered whenever the document's status is 'draft'.
   * Placed near the top of the document, above the metadata block,
   * so a reader sees the state before reading the body.
   *
   * The wording is a document-control statement, not an error. A
   * reader sees a professionally-marked controlled draft, not an
   * unfinished page.
   */
  readonly draftNotice: string;

  /**
   * The heading above the table of contents. Rendered as an <h2>
   * immediately above the <nav>.
   */
  readonly tocHeading: string;

  /**
   * The <nav>'s accessible name, announced by screen readers as
   * the name of the navigation landmark. The fuller form is used
   * so the reader hears which surface the nav belongs to when
   * multiple nav landmarks are present on the page.
   */
  readonly tocAriaLabel: string;

  /**
   * The heading above the version history block. Rendered as an
   * <h2> only when the document has a non-empty version history
   * array.
   */
  readonly versionHistoryHeading: string;

  /**
   * The heading above the related documents block. Rendered as an
   * <h2> only when the document's relatedSlugs array is non-empty
   * and resolves to at least one other document.
   */
  readonly relatedDocumentsHeading: string;

  /**
   * The link at the top of the document viewer that returns the
   * reader to the Legal Center hub. The destination's name is the
   * same string used as the hub page's <h1>, so a reader who
   * returns to the hub sees the term they just followed.
   */
  readonly backToLegalCenterLabel: string;

  /**
   * The <h1> rendered when the URL's :slug parameter does not
   * match any document in legal-content.ts. The document viewer
   * renders this state in place of the normal layout; the page's
   * chrome (metadata, TOC, sections) is not rendered.
   */
  readonly notFoundTitle: string;

  /**
   * The explanatory paragraph rendered below the not-found title.
   * The recovery path is the back-to-legal-center link, which is
   * rendered below the message.
   */
  readonly notFoundMessage: string;
}

// =============================================================================
// Exports
// =============================================================================

/**
 * The Legal Center hub page's chrome labels, in Amharic.
 *
 * See the file header §"Terms handled deliberately" for the
 * register choices, and §"Native-speaker review needed" for the
 * strings awaiting review.
 */
export const legalCenterPageLabels: LegalCenterPageLabels = {
  pageTitle: 'ሕጋዊ መረጃ',
  pageIntro: 'የማሌ ዓርና አክሲዮን ማኅበር የሕጋዊ መረጃ ማዕከል።',
  hubGroups: {
    essential: 'በቀጥታ የሚያስፈልጉ ሰነዶች',
    additional: 'ሌሎች ሕጋዊ መረጃዎች',
  },
  draftChipLabel: 'ረቂቅ',
  backToLoginLabel: 'ወደ መግቢያ ይመለሱ',
};

/**
 * The Legal Document viewer page's chrome labels, in Amharic.
 *
 * See the file header §"Terms handled deliberately" for the
 * register choices, and §"Native-speaker review needed" for the
 * strings awaiting review.
 */
export const legalDocumentPageLabels: LegalDocumentPageLabels = {
  metadataHeading: 'የሰነድ መረጃ',
  metadataFields: {
    version: 'የሰነድ ስሪት',
    status: 'የሰነድ ሁኔታ',
    effectiveDate: 'የሚተገበርበት ቀን',
    lastModified: 'የመጨረሻ ማሻሻያ ቀን',
    firstPublished: 'የመጀመሪያ ህትመት ቀን',
    approvedBy: 'ያጸደቀው',
    approvalDate: 'የማጽደቂያ ቀን',
    owner: 'የሰነዱ ኃላፊ',
    previousVersion: 'የቀድሞ ስሪት',
  },
  statusValues: {
    draft: 'ረቂቅ',
    approved: 'ጸድቋል',
    superseded: 'ተተክቷል',
    archived: 'ተቀምጧል',
  },
  draftNotice:
    'ይህ ሰነድ ለሕጋዊ ግምገማና ለመጨረሻ ማጽደቅ የቀረበ ረቂቅ ሰነድ ነው።',
  tocHeading: 'ይዘት',
  tocAriaLabel: 'የሰነዱ ይዘት',
  versionHistoryHeading: 'የለውጥ ታሪክ',
  relatedDocumentsHeading: 'ተዛማጅ ሰነዶች',
  backToLegalCenterLabel: 'ወደ ሕጋዊ መረጃ ይመለሱ',
  notFoundTitle: 'ሰነዱ አልተገኘም',
  notFoundMessage: 'ይህ ሕጋዊ ሰነድ አልተገኘም።',
};