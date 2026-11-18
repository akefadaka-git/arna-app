/*
 * =============================================================================
 * MASES Phase 2 UI — Legal Center Content
 * =============================================================================
 *
 * File:      mase_app/src/router/legal-content.ts
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
 * The eight public Legal Center documents as a static, typed
 * TypeScript module. Consumed by:
 *
 *   router/pages/LegalCenterRoute.vue      (L-4, the hub)
 *   router/pages/LegalDocumentRoute.vue    (L-5, the document viewer)
 *
 * The hub iterates `legalDocuments` to render cards. The viewer
 * looks up a document by slug, renders its metadata, its table of
 * contents (from `sections`), its body (from each section's
 * `paragraphs`), its version history, and its related-document
 * links.
 *
 * -----------------------------------------------------------------------------
 * Content state — every document is a controlled draft
 * -----------------------------------------------------------------------------
 * Every document in this file ships with `status: 'draft'`.
 *
 * The Amharic text below is delivered from Maale Arna Share
 * Company's own legal-content draft. It has been authored but has
 * not yet received final corporate/legal approval. The document
 * viewer renders a document-control notice above the body whenever
 * the status is `'draft'`, so a reader always sees the current
 * state.
 *
 * When legal review completes for a given document, its `status`
 * field changes to `'approved'` and the notice disappears. No
 * structural change to the module is required — one field per
 * document.
 *
 * -----------------------------------------------------------------------------
 * What this file does NOT contain
 * -----------------------------------------------------------------------------
 * The following content has NOT been fabricated and does NOT
 * appear in this file:
 *
 *   · Registration numbers, tax identification numbers, or any
 *     company identifier other than the approved legal name and
 *     head-office address.
 *   · Telephone numbers, additional email addresses, or any
 *     contact channel beyond the approved general company email.
 *   · Names of legal officers, data-protection officers, or any
 *     individual responsible for a policy.
 *   · Statutory citation of specific laws (Commercial Code
 *     proclamation numbers, personal-data-protection statutes,
 *     AML/CFT regulations, etc.). The legal-notice document
 *     names categories of law that are relevant; it does not
 *     cite specific instruments.
 *   · Specific data-retention periods. Retention is described
 *     as policy-governed, not as a fixed number of years.
 *   · Names of third-party service providers. The third-party
 *     section describes the framework; it does not name vendors.
 *   · Specific security certifications or audit attestations.
 *   · Specific cookie categories, cookie names, or cookie
 *     providers. The cookie document describes the purpose of
 *     browser storage at a policy level; the operator must
 *     confirm the actual inventory against the running
 *     implementation before the document's status moves to
 *     'approved'.
 *   · Specific ARNA model names, third-party AI providers, or
 *     data-processing guarantees. ARNA's section describes its
 *     role and limits; it does not claim a specific technical
 *     architecture.
 *
 * Fields whose values would require any of the above are set to
 * `null` in the document records below. The document viewer
 * renders a metadata row only when its value is non-null, so no
 * empty or invented value is ever displayed.
 *
 * -----------------------------------------------------------------------------
 * The eight documents
 * -----------------------------------------------------------------------------
 *   slug                     title
 *   ────                     ─────
 *   terms                    የአጠቃቀም ውሎች
 *   privacy                  የግላዊነትና የውሂብ ጥበቃ ፖሊሲ
 *   cookies                  የኩኪ እና የቴክኖሎጂ አጠቃቀም ማሳወቂያ
 *   security                 የመረጃ ደህንነት ማሳወቂያ
 *   electronic-records       የኤሌክትሮኒክ መዝገብ ፖሊሲ
 *   intellectual-property    የኢንተሌክቹዋል ንብረት እና የቅጂ መብት ማሳወቂያ
 *   arna-ai                  የARNA AI አጠቃቀም ማሳወቂያ
 *   legal-notice             ሕጋዊ ማሳሰቢያ እና የሕጋዊ ጥያቄ ሂደት
 *
 * The hub groups them:
 *
 *   በቀጥታ የሚያስፈልጉ ሰነዶች  →  terms, privacy, cookies
 *   ሌሎች ሕጋዊ መረጃዎች          →  security, electronic-records,
 *                              intellectual-property, arna-ai,
 *                              legal-notice
 *
 * -----------------------------------------------------------------------------
 * Cross-references (relatedSlugs)
 * -----------------------------------------------------------------------------
 * Each document declares `relatedSlugs` — the slugs of documents a
 * reader is most likely to want next. The viewer renders them as a
 * small list at the bottom of the document.
 *
 * The relations are bidirectional in intent (if A lists B, B
 * usually lists A), but the data is directional — each document's
 * array is authored independently, so a future revision can
 * change one direction without the other if a specific relation
 * needs to be asymmetric.
 *
 * -----------------------------------------------------------------------------
 * Version history (versionHistory)
 * -----------------------------------------------------------------------------
 * Each document carries a `versionHistory` array. In Stage 1 every
 * document has exactly one entry: version 1.0, no date, change
 * summary "የመጀመሪያ ረቂቅ" (initial draft).
 *
 * Dates are `null` because the drafts have not yet been formally
 * published. When legal review completes, the reviewer fills the
 * date on the 1.0 entry and may add a subsequent entry for any
 * change that occurred between draft and approval.
 *
 * -----------------------------------------------------------------------------
 * Slug stability
 * -----------------------------------------------------------------------------
 * The `slug` field determines both the URL (`/legal/<slug>`) and
 * the anchor used by cross-references. Slugs are stable
 * identifiers and should not be changed once a document is
 * published — a URL that a reader has bookmarked or a search
 * engine has indexed must not break.
 *
 * If a document's title changes, the title field changes; the
 * slug does not.
 *
 * -----------------------------------------------------------------------------
 * Section ids
 * -----------------------------------------------------------------------------
 * Each section carries an `id` used as a fragment anchor. TOC
 * links in the viewer are `<a href="#id">` and the section
 * elements carry `id="id"`. Section ids are stable within a
 * document; adding or removing a section is a content change that
 * bumps the document version.
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery. Eight documents, all marked
 *          'draft'. Amharic legal text as supplied by Maale Arna
 *          Share Company. No dates, no approver, no owner — those
 *          fields are null pending corporate/legal review.
 *
 * -----------------------------------------------------------------------------
 * Outstanding items
 * -----------------------------------------------------------------------------
 * 1. Corporate/legal approval of the Amharic text in each of the
 *    eight documents. When approval lands, the reviewer flips each
 *    document's `status` field from 'draft' to 'approved'. No
 *    other code change is required.
 *
 * 2. When the reviewer completes approval, they also fill in
 *    `effectiveDate`, `approvalDate`, `approvedBy`, and
 *    `firstPublished` where applicable, and add a second entry to
 *    `versionHistory` documenting the approval.
 *
 * 3. The cookie document's body reflects policy intent rather
 *    than a confirmed cookie inventory. Before approving it, the
 *    operator must reconcile the body against the running
 *    implementation (cookies, localStorage, sessionStorage,
 *    third-party embeds). This is a legal/operational review
 *    item, not a code change.
 *
 * 4. The privacy document does not cite specific retention
 *    periods, cross-border transfer arrangements, or named
 *    sub-processors. Those details require confirmation from
 *    operations and legal counsel and are additive — they do not
 *    require structural changes to this module.
 * =============================================================================
 */

// =============================================================================
// Types
// =============================================================================

/**
 * A legal document's document-control status.
 *
 * Stage 1 exercises only `'draft'` and `'approved'`. The other two
 * values exist in the union so the type does not have to change
 * when the lifecycle expands.
 *
 * The UI's display label for each value is supplied by
 * `legalDocumentPageLabels.statusValues` in legal-labels.ts — this
 * type carries the identifier, the labels file carries the
 * Amharic text.
 */
export type LegalDocumentStatus =
  | 'draft'
  | 'approved'
  | 'superseded'
  | 'archived';

/**
 * A single section within a legal document.
 *
 * A section is the smallest navigable unit of a document. Each
 * section has an anchor `id` (used by the table of contents and by
 * direct fragment navigation), a heading (rendered as `<h2>`), and
 * a body consisting of one or more paragraphs.
 *
 * The `paragraphs` array preserves reading order. A bulleted list
 * in the source content is represented as one paragraph per
 * bullet, with the list's introduction as a preceding paragraph.
 * The viewer renders each entry as its own `<p>`; no nested list
 * structure is used, so a future revision can re-flow paragraphs
 * without needing to change the interface.
 */
export interface LegalSection {
  /**
   * Stable fragment identifier. Lowercase, hyphen-separated.
   * Used as the `id` attribute on the rendered `<section>` and as
   * the target of the table of contents' anchor links.
   */
  readonly id: string;

  /**
   * The section's heading, rendered as `<h2>`. Includes the
   * section's ordinal (e.g. "1. መግቢያ") — the numbering is part
   * of the source content, not a rendered decoration.
   */
  readonly heading: string;

  /**
   * The section's body, in reading order. One `<p>` per entry.
   */
  readonly paragraphs: ReadonlyArray<string>;
}

/**
 * A single entry in a document's version history.
 *
 * Stage 1 renders the version identifier and the change summary.
 * The date renders only when populated; in the initial delivery
 * every date is null because the drafts have not yet been
 * published.
 */
export interface LegalVersionEntry {
  /**
   * The version identifier, e.g. "1.0" or "1.1". Matches the
   * document's current `version` field for the most recent entry.
   */
  readonly version: string;

  /**
   * The date this version took effect, in ISO 8601 form
   * (`YYYY-MM-DD`). Null for a version that has not yet been
   * formally published.
   */
  readonly date: string | null;

  /**
   * A one-line description of what changed in this version.
   */
  readonly changeSummary: string;
}

/**
 * A complete legal document.
 *
 * Fields that would require information not yet approved (dates,
 * approver, owner) are typed `string | null` and are set to
 * `null` in the initial delivery. The viewer renders a metadata
 * row only when its value is non-null; the null fields are not
 * displayed, and no empty or invented value ever reaches the DOM.
 */
export interface LegalDocument {
  /**
   * Stable URL identifier. Used as the `:slug` route parameter
   * and as the key for cross-document references. Lowercase,
   * hyphen-separated. Do not change once published.
   */
  readonly slug: string;

  /**
   * The document's full title, rendered as the page's `<h1>` and
   * used as the visible label on the hub page's card.
   */
  readonly title: string;

  /**
   * A one-line description, rendered on the hub card below the
   * title and (on the document viewer) nowhere else — the
   * document's own first paragraph serves as its introduction.
   */
  readonly summary: string;

  /**
   * The current version identifier, e.g. "1.0".
   */
  readonly version: string;

  /**
   * The document-control status. Drives whether the draft notice
   * renders above the body.
   */
  readonly status: LegalDocumentStatus;

  /**
   * The date the document takes effect, in ISO 8601 form. Null
   * until the document has been approved and an effective date
   * has been set.
   */
  readonly effectiveDate: string | null;

  /**
   * The date the document was first published under its current
   * title, in ISO 8601 form. Null for a document that has never
   * been published.
   */
  readonly firstPublished: string | null;

  /**
   * The date of the most recent modification, in ISO 8601 form.
   * Null for a document whose only version is its initial draft.
   */
  readonly lastModified: string | null;

  /**
   * The date corporate approval was granted, in ISO 8601 form.
   * Null until approval has occurred.
   */
  readonly approvalDate: string | null;

  /**
   * The person or body that approved the document. Null until
   * approval has occurred — the viewer renders the row only when
   * a value is present, so no invented approver is ever shown.
   */
  readonly approvedBy: string | null;

  /**
   * The department or role responsible for maintaining the
   * document. Null until an owner has been assigned.
   */
  readonly owner: string | null;

  /**
   * The identifier of the document's immediately preceding
   * version. Null for a document that has never been revised.
   */
  readonly previousVersion: string | null;

  /**
   * The document's sections, in reading order. The viewer
   * iterates this array to build the table of contents and to
   * render the body. At least one section is required.
   */
  readonly sections: ReadonlyArray<LegalSection>;

  /**
   * The slugs of documents a reader is most likely to want next.
   * The viewer resolves each slug against `legalDocuments` and
   * renders a link to it. A slug that does not resolve is not
   * rendered — the viewer never renders a dead link.
   */
  readonly relatedSlugs: ReadonlyArray<string>;

  /**
   * The document's version history, newest first or oldest first
   * depending on the viewer's rendering choice. Stage 1 renders
   * the entries in array order; the array is authored oldest-
   * first so the change log reads chronologically.
   */
  readonly versionHistory: ReadonlyArray<LegalVersionEntry>;
}

/**
 * A grouping of documents on the Legal Center hub.
 *
 * The hub splits its document set into two groups — the "start
 * here" group and the "everything else" group — so that a reader
 * who only needs the terms, privacy, or cookie information does
 * not have to scan the full list.
 *
 * The group's `id` maps to the corresponding label in
 * `legalCenterPageLabels.hubGroups` (in legal-labels.ts): `'essential'`
 * → `hubGroups.essential`, `'additional'` → `hubGroups.additional`.
 * The labels file owns the Amharic heading text; this file owns
 * which documents belong in which group.
 */
export interface LegalHubGroup {
  /**
   * Which label to render above the group. Matches a key on
   * `legalCenterPageLabels.hubGroups`.
   */
  readonly id: 'essential' | 'additional';

  /**
   * The slugs of the documents in this group, in the order the
   * hub renders them. Every slug here must resolve to a document
   * in `legalDocuments`; the hub does not render a card for a
   * slug that does not resolve.
   */
  readonly slugs: ReadonlyArray<string>;
}

// =============================================================================
// Data
// =============================================================================

/**
 * The eight Legal Center documents, in a stable order.
 *
 * The order of this array is not the display order on the hub —
 * the hub uses `legalHubGroups` to decide what to show in what
 * order. This array is the lookup table the viewer uses and the
 * source the hub consults when it needs a document's title or
 * summary. Authors adding a new document should append to the end
 * of this array and then add its slug to the appropriate hub
 * group.
 */
export const legalDocuments: ReadonlyArray<LegalDocument> = [
  // ===========================================================================
  // 1. የአጠቃቀም ውሎች
  // ===========================================================================
  {
    slug: 'terms',
    title: 'የአጠቃቀም ውሎች',
    summary: 'MASESን ስለመጠቀም የሚመለከቱ ውሎች።',
    version: '1.0',
    status: 'draft',
    effectiveDate: null,
    firstPublished: null,
    lastModified: null,
    approvalDate: null,
    approvedBy: null,
    owner: null,
    previousVersion: null,
    sections: [
      {
        id: 'intro',
        heading: '1. መግቢያ',
        paragraphs: [
          'እነዚህ የአጠቃቀም ውሎች የማሌ ዓርና አክሲዮን ማኅበር የሚያስተዳድረውን MASES – Maale Arna Smart Enterprise Ecosystem የመረጃ፣ የአስተዳደር፣ የውስጥ አገልግሎትና የዲጂታል መድረክ አጠቃቀም ይመለከታሉ።',
          'MASES የኩባንያውን የተፈቀዱ የውስጥና የውጭ ዲጂታል አገልግሎቶች ለተፈቀዱ ተጠቃሚዎች ለማቅረብ የተዘጋጀ የቴክኖሎጂ መድረክ ነው።',
        ],
      },
      {
        id: 'acceptance',
        heading: '2. ውሎቹን መቀበል',
        paragraphs: [
          'MASESን በመጠቀም፣ መለያ በመፍጠር፣ ወደ የተፈቀደ አገልግሎት በመግባት ወይም በሌላ መልኩ መድረኩን በመጠቀም ተጠቃሚው በተጠቃሚው ላይ ተፈጻሚ የሆኑትን ውሎች፣ ፖሊሲዎችና የደህንነት መመሪያዎች ለመከተል ይስማማል።',
        ],
      },
      {
        id: 'account-responsibility',
        heading: '3. የመለያ ኃላፊነት',
        paragraphs: [
          'ተጠቃሚው የሚከተሉትን ኃላፊነቶች ይወጣል፦',
          'የመግቢያ መረጃውን በሚስጥር መጠበቅ፤',
          'መለያውን ለሌላ ሰው አለመስጠት፤',
          'የተጠረጠረ ያልተፈቀደ መዳረሻ ካለ ወዲያውኑ ማሳወቅ፤',
          'ትክክለኛና የተሟላ መረጃ ማቅረብ፤',
          'ከሚሰጠው የፍቃድ ደረጃ ውጭ መረጃ ለመድረስ አለመሞከር።',
        ],
      },
      {
        id: 'prohibited-use',
        heading: '4. የተከለከሉ አጠቃቀሞች',
        paragraphs: [
          'MASESን ለሚከተሉት ዓላማዎች መጠቀም አይፈቀድም፦',
          'ያልተፈቀደ መዳረሻ ለማግኘት፤',
          'የደህንነት መከላከያዎችን ለማለፍ፤',
          'የሌላ ተጠቃሚ መለያ ለመጠቀም፤',
          'ሐሰተኛ መረጃ ለማስገባት፤',
          'የስርዓቱን መደበኛ አሠራር ለማደናቀፍ፤',
          'ተንኮል-አዘል ፕሮግራም ለማስገባት፤',
          'ሌሎችን ተጠቃሚዎች ለመጉዳት፤',
          'ያልተፈቀደ መረጃ ለማውጣት፤',
          'ማንኛውንም የሕግ መስፈርት ለመጣስ።',
        ],
      },
      {
        id: 'service-suspension',
        heading: '5. የአገልግሎት ማቋረጥ',
        paragraphs: [
          'ማሌ ዓርና አክሲዮን ማኅበር ለደህንነት፣ ለጥገና፣ ለሕጋዊ ግዴታ ወይም ለሌላ ተገቢ ምክንያት የMASES አገልግሎትን በጊዜያዊነት ሊያቋርጥ ወይም ሊገድብ ይችላል።',
        ],
      },
      {
        id: 'communications',
        heading: '6. የማስታወቂያና የመገናኛ ማሳወቂያ',
        paragraphs: [
          'MASES በሚከተሉት ዓይነቶች ማሳወቂያ ሊልክ ይችላል፦',
          'የደህንነት ማሳወቂያ፤',
          'የመለያ ማሳወቂያ፤',
          'የስርዓት ማሳወቂያ፤',
          'የስብሰባ ማሳወቂያ፤',
          'የድርጅት ግንኙነት፤',
          'የአገልግሎት ለውጥ፤',
          'ሌሎች በፈቃድ የሚላኩ መገናኛዎች።',
          'የደህንነትና የመለያ አስፈላጊ ማሳወቂያዎች ተጠቃሚው ከመረጃ ማሳወቂያ ዝርዝር መውጣት ቢፈልግም ሊቀጥሉ ይችላሉ።',
        ],
      },
      {
        id: 'terms-changes',
        heading: '7. የውሎች ለውጥ',
        paragraphs: [
          'የአጠቃቀም ውሎች ሊሻሻሉ ይችላሉ። ለውጡ አስፈላጊ ከሆነ በMASES በኩል ተገቢው ማሳወቂያ ይሰጣል።',
        ],
      },
    ],
    relatedSlugs: ['privacy', 'intellectual-property', 'arna-ai'],
    versionHistory: [
      {
        version: '1.0',
        date: null,
        changeSummary: 'የመጀመሪያ ረቂቅ።',
      },
    ],
  },

  // ===========================================================================
  // 2. የግላዊነትና የውሂብ ጥበቃ ፖሊሲ
  // ===========================================================================
  {
    slug: 'privacy',
    title: 'የግላዊነትና የውሂብ ጥበቃ ፖሊሲ',
    summary: 'የግል መረጃ አጠቃቀምን፣ ጥበቃንና የተጠቃሚ መብቶችን ይመለከታል።',
    version: '1.0',
    status: 'draft',
    effectiveDate: null,
    firstPublished: null,
    lastModified: null,
    approvalDate: null,
    approvedBy: null,
    owner: null,
    previousVersion: null,
    sections: [
      {
        id: 'overview',
        heading: '1. አጠቃላይ እይታ',
        paragraphs: [
          'MASES የተጠቃሚዎችን ግላዊና የድርጅት መረጃ በኃላፊነት ለመያዝ፣ ለመጠቀምና ለመጠበቅ ይጥራል።',
        ],
      },
      {
        id: 'data-collected',
        heading: '2. የምንሰበስበው መረጃ',
        paragraphs: [
          'እንደ አገልግሎቱ ባህሪ የሚከተሉት ሊሰበሰቡ ይችላሉ፦',
          'ስም፤',
          'የመገናኛ መረጃ፤',
          'የመለያ መረጃ፤',
          'የተጠቃሚ ሚናና ፈቃድ፤',
          'የድርጅት/ተቋም ግንኙነት፤',
          'የአገልግሎት አጠቃቀም መዝገቦች፤',
          'የደህንነት እና ኦዲት መዝገቦች፤',
          'ተጠቃሚው በሕጋዊ መንገድ ያስገባው ሰነድና መረጃ።',
        ],
      },
      {
        id: 'data-purpose',
        heading: '3. የመረጃ አጠቃቀም ዓላማ',
        paragraphs: [
          'መረጃው ለሚከተሉት ዓላማዎች ሊውል ይችላል፦',
          'የMASES አገልግሎቶችን ለማቅረብ፤',
          'ተጠቃሚን ለመለየትና ፈቃድ ለመቆጣጠር፤',
          'የደህንነት ክስተቶችን ለመመርመር፤',
          'ኦዲትና የቁጥጥር መስፈርቶችን ለማሟላት፤',
          'አገልግሎቱን ለማሻሻል፤',
          'ሕጋዊ ግዴታዎችን ለመፈጸም።',
        ],
      },
      {
        id: 'data-principles',
        heading: '4. የውሂብ ጥበቃ መርሆዎች',
        paragraphs: [
          'MASES የግል መረጃን ሲሰበስብ፣ ሲያስቀምጥ፣ ሲያስተላልፍ ወይም ሲያስኬድ የሚከተሉትን ተገቢ የውሂብ ጥበቃ መርሆዎች ይከተላል፦',
          'ሕጋዊነት፤',
          'ፍትሃዊነት፤',
          'ግልጽነት፤',
          'ዓላማ መወሰን፤',
          'የመረጃ መጠን መገደብ፤',
          'ትክክለኛነት፤',
          'የማከማቻ ጊዜ መገደብ፤',
          'ሚስጥራዊነት፤',
          'ተጠያቂነት።',
        ],
      },
      {
        id: 'user-rights',
        heading: '5. የተጠቃሚ መብቶች',
        paragraphs: [
          'በሚመለከተው ሕግ መሠረት ተጠቃሚው የራሱን የግል መረጃ ለማወቅ፣ ለማረም ወይም በሕግ በተፈቀደ መጠን ሌሎች መብቶችን ለመጠቀም ጥያቄ ሊያቀርብ ይችላል።',
        ],
      },
    ],
    relatedSlugs: ['cookies', 'security', 'arna-ai'],
    versionHistory: [
      {
        version: '1.0',
        date: null,
        changeSummary: 'የመጀመሪያ ረቂቅ።',
      },
    ],
  },

  // ===========================================================================
  // 3. የኩኪ እና የቴክኖሎጂ አጠቃቀም ማሳወቂያ
  // ===========================================================================
  {
    slug: 'cookies',
    title: 'የኩኪ እና የቴክኖሎጂ አጠቃቀም ማሳወቂያ',
    summary: 'የመለያ ሁኔታንና የአገልግሎት አሠራርን ለማስቻል ስለሚውሉ ኩኪዎች።',
    version: '1.0',
    status: 'draft',
    effectiveDate: null,
    firstPublished: null,
    lastModified: null,
    approvalDate: null,
    approvedBy: null,
    owner: null,
    previousVersion: null,
    sections: [
      {
        id: 'purpose',
        heading: '1. የኩኪዎች አገልግሎት',
        paragraphs: [
          'MASES የመግቢያ ሁኔታን፣ የደህንነት ቁጥጥርን፣ የተጠቃሚ ምርጫዎችን እና የመድረኩን መሠረታዊ አሠራር ለማስቻል ኩኪዎች ወይም ተመሳሳይ ቴክኖሎጂዎችን ሊጠቀም ይችላል።',
        ],
      },
      {
        id: 'control',
        heading: '2. የኩኪ ቁጥጥር',
        paragraphs: [
          'ተጠቃሚው በአሳሹ ቅንብሮች በኩል አንዳንድ ኩኪዎችን መገደብ ቢችልም አንዳንድ መሠረታዊ ኩኪዎችን መዝጋት የMASES አንዳንድ አገልግሎቶች እንዳይሰሩ ሊያደርግ ይችላል።',
        ],
      },
    ],
    relatedSlugs: ['privacy', 'security'],
    versionHistory: [
      {
        version: '1.0',
        date: null,
        changeSummary: 'የመጀመሪያ ረቂቅ።',
      },
    ],
  },

  // ===========================================================================
  // 4. የመረጃ ደህንነት ማሳወቂያ
  // ===========================================================================
  {
    slug: 'security',
    title: 'የመረጃ ደህንነት ማሳወቂያ',
    summary: 'የመረጃ ደህንነትን፣ የቁጥጥር እርምጃዎችንና የተጠቃሚ ሚናን ይመለከታል።',
    version: '1.0',
    status: 'draft',
    effectiveDate: null,
    firstPublished: null,
    lastModified: null,
    approvalDate: null,
    approvedBy: null,
    owner: null,
    previousVersion: null,
    sections: [
      {
        id: 'overview',
        heading: '1. አጠቃላይ እይታ',
        paragraphs: [
          'MASES መረጃን ከያልተፈቀደ መዳረሻ፣ ለውጥ፣ መጥፋት ወይም መጠቀም ለመጠበቅ ተገቢ የቴክኒክና የአስተዳደር ቁጥጥሮችን ሊጠቀም ይችላል።',
        ],
      },
      {
        id: 'controls',
        heading: '2. የሚጠቀሙ ቁጥጥሮች',
        paragraphs: [
          'እነዚህ ሊያካትቱ ይችላሉ፦',
          'የመለያ ማረጋገጫ፤',
          'የፈቃድ ቁጥጥር፤',
          'የኦዲት መዝገብ፤',
          'የደህንነት ክስተት መከታተያ፤',
          'የመረጃ ምትኬ፤',
          'የፋይል መዳረሻ ቁጥጥር፤',
          'የስርዓት ክፍል-በ-ክፍል ፈቃድ።',
        ],
      },
      {
        id: 'user-role',
        heading: '3. የተጠቃሚ ሚና',
        paragraphs: [
          'ተጠቃሚዎችም የራሳቸውን የመግቢያ መረጃ በሚስጥር በመጠበቅ የደህንነት ሂደቱ አካል ይሆናሉ።',
        ],
      },
    ],
    relatedSlugs: ['privacy', 'electronic-records', 'arna-ai'],
    versionHistory: [
      {
        version: '1.0',
        date: null,
        changeSummary: 'የመጀመሪያ ረቂቅ።',
      },
    ],
  },

  // ===========================================================================
  // 5. የኤሌክትሮኒክ መዝገብ ፖሊሲ
  // ===========================================================================
  {
    slug: 'electronic-records',
    title: 'የኤሌክትሮኒክ መዝገብ ፖሊሲ',
    summary: 'በኤሌክትሮኒክ መልክ ስለሚፈጠሩና ስለሚቀመጡ መዝገቦች።',
    version: '1.0',
    status: 'draft',
    effectiveDate: null,
    firstPublished: null,
    lastModified: null,
    approvalDate: null,
    approvedBy: null,
    owner: null,
    previousVersion: null,
    sections: [
      {
        id: 'overview',
        heading: '1. አጠቃላይ እይታ',
        paragraphs: [
          'MASES በኤሌክትሮኒክ መልክ የሚፈጠሩ፣ የሚቀመጡ ወይም የሚላኩ መረጃዎችንና መዝገቦችን ሊይዝ ይችላል።',
        ],
      },
      {
        id: 'records-types',
        heading: '2. የኤሌክትሮኒክ መዝገቦች ዓይነቶች',
        paragraphs: [
          'የኤሌክትሮኒክ መዝገቦች እንደሚከተሉት ሊካተቱ ይችላሉ፦',
          'የግብይት መዝገቦች፤',
          'የስርዓት ክስተት መዝገቦች፤',
          'የኦዲት መዝገቦች፤',
          'የማመልከቻ መረጃ፤',
          'የማረጋገጫ መዝገቦች፤',
          'የፋይል ስሪቶች።',
        ],
      },
      {
        id: 'user-responsibility',
        heading: '3. የተጠቃሚ ኃላፊነት',
        paragraphs: [
          'ተጠቃሚው የሚያስገባው መረጃ ትክክለኛነትና ሕጋዊነት የተጠቃሚው ኃላፊነት ነው።',
        ],
      },
    ],
    relatedSlugs: ['security', 'privacy', 'terms'],
    versionHistory: [
      {
        version: '1.0',
        date: null,
        changeSummary: 'የመጀመሪያ ረቂቅ።',
      },
    ],
  },

  // ===========================================================================
  // 6. የኢንተሌክቹዋል ንብረት እና የቅጂ መብት ማሳወቂያ
  // ===========================================================================
  {
    slug: 'intellectual-property',
    title: 'የኢንተሌክቹዋል ንብረት እና የቅጂ መብት ማሳወቂያ',
    summary: 'የንብረት መብቶችን፣ የቅጂ መብትንና የተጠቃሚ ይዘትን ይመለከታል።',
    version: '1.0',
    status: 'draft',
    effectiveDate: null,
    firstPublished: null,
    lastModified: null,
    approvalDate: null,
    approvedBy: null,
    owner: null,
    previousVersion: null,
    sections: [
      {
        id: 'ip-rights',
        heading: '1. የኢንተሌክቹዋል ንብረት መብት',
        paragraphs: [
          'MASES፣ የስርዓቱ ዲዛይን፣ የተጠቃሚ በይነገጽ፣ ሎጎዎች፣ ጽሑፎች፣ ግራፊክሶች፣ የሶፍትዌር ኮድ፣ የውሂብ መዋቅሮችና ተዛማጅ የፈጠራ ሥራዎች የሚመለከታቸው የንብረት መብቶች እንደተጠበቁ ይቆያሉ።',
        ],
      },
      {
        id: 'prohibited',
        heading: '2. የተከለከሉ ተግባራት',
        paragraphs: [
          'ያልተፈቀደ መቅዳት፣ ማሻሻል፣ ማሰራጨት፣ መሸጥ ወይም ለሌላ ዓላማ መጠቀም አይፈቀድም።',
        ],
      },
      {
        id: 'user-content',
        heading: '3. የተጠቃሚ ይዘት',
        paragraphs: [
          'ተጠቃሚው ወደ MASES የሚያስገባው መረጃ፣ ሰነድ ወይም ይዘት በሕግ የተፈቀደ መሆኑን እና ይዘቱን ለማስገባት ተገቢ መብት እንዳለው ማረጋገጥ ይኖርበታል።',
          'የሌላ ሰው የግል መረጃ፣ የቅጂ መብት ያለው ሰነድ ወይም ሚስጥራዊ መረጃ ያለተገቢ ፈቃድ ማስገባት አይፈቀድም።',
        ],
      },
    ],
    relatedSlugs: ['terms', 'arna-ai'],
    versionHistory: [
      {
        version: '1.0',
        date: null,
        changeSummary: 'የመጀመሪያ ረቂቅ።',
      },
    ],
  },

  // ===========================================================================
  // 7. የARNA AI አጠቃቀም ማሳወቂያ
  // ===========================================================================
  {
    slug: 'arna-ai',
    title: 'የARNA AI አጠቃቀም ማሳወቂያ',
    summary: 'የARNA የAI ረዳትን አገልግሎት፣ ወሰንና ኃላፊነት ይመለከታል።',
    version: '1.0',
    status: 'draft',
    effectiveDate: null,
    firstPublished: null,
    lastModified: null,
    approvalDate: null,
    approvedBy: null,
    owner: null,
    previousVersion: null,
    sections: [
      {
        id: 'purpose',
        heading: '1. የARNA አገልግሎት',
        paragraphs: [
          'MASES ውስጥ የሚገኘው ARNA የAI ረዳት ለመረጃ ፍለጋ፣ ማብራሪያ፣ ማጠቃለያ እና ሌሎች የተፈቀዱ የዲጂታል ድጋፍ ተግባራት ሊውል ይችላል።',
        ],
      },
      {
        id: 'limitations',
        heading: '2. የARNA ውጤቶች ወሰን',
        paragraphs: [
          'ARNA የሚያቀርበው ውጤት፦',
          'ሁልጊዜ ፍጹም ወይም ሙሉ ሊሆን አይችልም፤',
          'ሕጋዊ፣ የፋይናንስ፣ የሕክምና ወይም ሌላ ሙያዊ ውሳኔን በራሱ አይተካም፤',
          'ከተፈቀደው የመዳረሻ ወሰን ውጭ የግል ወይም ሚስጥራዊ መረጃ ለመግለጽ አይፈቀድለትም።',
        ],
      },
      {
        id: 'human-responsibility',
        heading: '3. የሰው ኃላፊነት',
        paragraphs: [
          'ተጠቃሚው አስፈላጊ ውሳኔ ከመውሰዱ በፊት ተገቢውን የሰው ሙያዊ ማረጋገጫ ማድረግ ይገባዋል።',
        ],
      },
    ],
    relatedSlugs: ['privacy', 'security', 'terms'],
    versionHistory: [
      {
        version: '1.0',
        date: null,
        changeSummary: 'የመጀመሪያ ረቂቅ።',
      },
    ],
  },

  // ===========================================================================
  // 8. ሕጋዊ ማሳሰቢያ እና የሕጋዊ ጥያቄ ሂደት
  // ===========================================================================
  {
    slug: 'legal-notice',
    title: 'ሕጋዊ ማሳሰቢያ እና የሕጋዊ ጥያቄ ሂደት',
    summary: 'የድርጅቱን ሕጋዊ መለያ፣ የሥልጣን ወሰንና የጥያቄ ሂደት ይመለከታል።',
    version: '1.0',
    status: 'draft',
    effectiveDate: null,
    firstPublished: null,
    lastModified: null,
    approvalDate: null,
    approvedBy: null,
    owner: null,
    previousVersion: null,
    sections: [
      {
        id: 'company-identity',
        heading: '1. የድርጅቱ ሕጋዊ መለያ',
        paragraphs: [
          'MASES በማሌ ዓርና አክሲዮን ማኅበር የሚያስተዳደር ዲጂታል መድረክ ነው።',
          'የሕጋዊ ድርጅት ስም፦ ማሌ ዓርና አክሲዮን ማኅበር',
          'የእንግሊዝኛ ስም፦ MAALE ARNA S.C.',
          'ዋና መሥሪያ ቤት፦ ኮይቤ ከተማ፣ ማሌ ወረዳ፣ ደቡብ ኦሞ ዞን፣ ደቡብ ኢትዮጵያ',
          'ኢሜይል፦ info@maalearna.com.et',
          'ድረ-ገጽ፦ www.maalearna.com.et',
          'በMASES ላይ የሚቀርበው መረጃ በሚመለከተው የኩባንያው ሥርዓት፣ ውሎች፣ የድርጅት ሰነዶችና ተፈጻሚ ሕጎች መሠረት መተርጎም አለበት።',
        ],
      },
      {
        id: 'governing-law',
        heading: '2. የሕግ እና የሥልጣን ወሰን',
        paragraphs: [
          'MASES በኢትዮጵያ ተፈጻሚ በሆኑ ሕጎችና ተገቢ የቁጥጥር መስፈርቶች መሠረት ይተዳደራል።',
          'በተለይም እንደ አግባብነቱ የሚከተሉት ሊመለከቱት ይችላሉ፦',
          'የኢትዮጵያ የንግድ ሕግ፤',
          'የግል መረጃ ጥበቃ ሕጎች፤',
          'የኤሌክትሮኒክ ግብይትና የኤሌክትሮኒክ መረጃ ሕጎች፤',
          'የፀረ-ሽርሽር እና የሕገ-ወጥ ገንዘብ ማስተላለፍ መከላከያ ሕጎች፤',
          'ተገቢ የድርጅትና የአክሲዮን ሕጎች።',
        ],
      },
      {
        id: 'shareholder-services',
        heading: '3. የባለአክሲዮን እና የውስጥ አገልግሎት ማሳሰቢያ',
        paragraphs: [
          'MASES የባለአክሲዮን፣ የቦርድ፣ የኮሚቴ፣ የሰራተኛ፣ የአስተዳደር እና ሌሎች የተፈቀዱ ተጠቃሚዎች የውስጥ አገልግሎቶችን ሊያቀርብ ይችላል።',
          'የሚታየው መረጃ በተጠቃሚው ሚና፣ የአባልነት ሁኔታና በተሰጠው ፈቃድ መሠረት ብቻ መሆን አለበት።',
          'የመተግበሪያ ማየት ወይም ከLauncher ላይ መታየት በራሱ የመረጃ መዳረሻ ፈቃድ አይሆንም።',
        ],
      },
      {
        id: 'third-party',
        heading: '4. የሶስተኛ ወገን አገልግሎቶች',
        paragraphs: [
          'MASES አንዳንድ ተግባራትን ለማቅረብ ከሶስተኛ ወገን አገልግሎቶች ጋር ሊገናኝ ይችላል።',
          'የሶስተኛ ወገን አገልግሎት በራሱ የአጠቃቀም ውሎችና የግላዊነት ፖሊሲ ሊኖረው ይችላል።',
          'ተጠቃሚው እንዲህ ያሉ አገልግሎቶችን ሲጠቀም ተገቢውን የሶስተኛ ወገን ውሎች ማንበብ ይገባዋል።',
        ],
      },
      {
        id: 'legal-requests',
        heading: '5. ሕጋዊ ጥያቄዎችና ቅሬታዎች',
        paragraphs: [
          'የግላዊነት፣ የውሂብ ጥበቃ፣ የመለያ፣ የደህንነት ወይም ሌላ ሕጋዊ ጉዳይ ካለ ተጠቃሚው በተመደበው የMASES የግንኙነት መንገድ ማሳወቅ ይችላል።',
          'ቅሬታው ከተቻለ የሚከተሉትን ሊያካትት ይገባል፦',
          'የጉዳዩን አይነት፤',
          'ተዛማጅ የመለያ/ጉዳይ መረጃ፤',
          'የተከሰተበትን ጊዜ፤',
          'ተዛማጅ ማስረጃ።',
        ],
      },
      {
        id: 'policy-changes',
        heading: '6. የሰነድ ለውጦች',
        paragraphs: [
          'MASES የሕጋዊ ሰነዶችን ከሕግ፣ ከድርጅታዊ ለውጥ፣ ከቴክኖሎጂ ወይም ከአገልግሎት ለውጥ ጋር በተያያዘ ሊያዘምን ይችላል።',
          'እያንዳንዱ ሰነድ የሚከተሉትን መረጃዎች በግልጽ ያሳያል፦',
          'የሰነድ ስም፤',
          'ስሪት፤',
          'የመጨረሻ ማሻሻያ፤',
          'የሚተገበርበት ቀን።',
        ],
      },
      {
        id: 'review-notice',
        heading: '7. የሕጋዊ ግምገማ ማስታወሻ',
        paragraphs: [
          'ይህ የMASES የሕጋዊ ይዘት መሠረታዊ የድርጅት ረቂቅ ነው፤ ከመጨረሻ ሕጋዊ ማጽደቅ በፊት በኩባንያው የሕግ አማካሪ/ባለሙያ መመርመር ይገባል።',
        ],
      },
    ],
    relatedSlugs: ['terms', 'privacy', 'intellectual-property'],
    versionHistory: [
      {
        version: '1.0',
        date: null,
        changeSummary: 'የመጀመሪያ ረቂቅ።',
      },
    ],
  },
];

/**
 * The Legal Center hub's grouping of the documents above.
 *
 * The hub renders the "essential" group first and the
 * "additional" group second. The heading text for each group is
 * supplied by `legalCenterPageLabels.hubGroups` in legal-labels.ts;
 * this file supplies only the group ids and their document slugs.
 *
 * Every slug listed here must resolve to a document in
 * `legalDocuments`. The hub skips an unresolvable slug rather than
 * rendering a dead card, but the invariant is: no unresolvable
 * slug should ever be added. A future test or lint rule can
 * enforce the invariant; a runtime guard inside the hub is a
 * defence, not the primary mechanism.
 */
export const legalHubGroups: ReadonlyArray<LegalHubGroup> = [
  {
    id: 'essential',
    slugs: ['terms', 'privacy', 'cookies'],
  },
  {
    id: 'additional',
    slugs: [
      'security',
      'electronic-records',
      'intellectual-property',
      'arna-ai',
      'legal-notice',
    ],
  },
];