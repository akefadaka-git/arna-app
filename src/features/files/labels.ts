/*
 * =============================================================================
 * MASES Phase 2 UI — File Feature Labels (Amharic)
 * =============================================================================
 *
 * File:      mase_app/src/features/files/labels.ts
 * Layer:     Features (File Management vertical)
 * Version:   1.1.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §9 (Localization)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (Stage 14). English constants.
 *
 * 1.0.1  — ConfirmDeleteDialog label additions:
 *          · filesListViewLabels  — added deleteDialogEntityLabel,
 *                                   deleteDialogConfirmationPrompt,
 *                                   deleteDialogConfirmationMismatch.
 *          · fileDetailViewLabels — added the same three keys for the
 *                                   soft-delete dialog, plus three
 *                                   matching keys for the force-delete
 *                                   dialog (forceDialogEntityLabel,
 *                                   forceDialogConfirmationPrompt,
 *                                   forceDialogConfirmationMismatch).
 *          · No existing string changed.
 *
 * 1.1.0  — values changed from English to Amharic to satisfy the
 *          Amharic-first default (Unit A-2):
 *          · Every string VALUE changes from English to Amharic. The
 *            two exported consts — filesListViewLabels and
 *            fileDetailViewLabels — keep their names, their types,
 *            and every key. The two interfaces they satisfy are
 *            declared in FilesListView.vue and FileDetailView.vue
 *            and are byte-for-byte unchanged.
 *          · No consumer changes. The two file pages receive their
 *            strings through `labels` props and read them as
 *            `labels.<key>`. Because the KEYS are unchanged, the
 *            pages render the new Amharic values without any
 *            modification. The routes-workspace.ts entries that
 *            bind these objects to the page components are also
 *            unchanged.
 *          · The three ConfirmDeleteDialog interpolation tokens
 *            ({entityLabel}, {entityName}, {confirmationText}) are
 *            preserved unchanged in every prompt string that carries
 *            them. Only the surrounding prose is translated. The
 *            dialog's interpolation logic is unchanged.
 *          · MINOR version bump, matching the pattern
 *            router/auth-labels.ts set when it converted its values
 *            from English to Amharic (1.0.0 → 1.1.0). A value-only
 *            change is MINOR; a shape change is MAJOR.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The file-management feature's user-facing strings, in Amharic.
 * Consumed by:
 *
 *     features/files/FilesListView/FilesListView.vue
 *     features/files/FileDetailView/FileDetailView.vue
 *
 * Each page declares its own labels interface and receives the
 * corresponding object below as a prop. The route tree
 * (router/routes-workspace.ts) supplies the objects from this file to
 * the route records' `props` fields.
 *
 * This file is the file-management counterpart to router/auth-labels.ts,
 * router/launcher-labels.ts, router/shell-labels.ts, and
 * features/portal/labels.ts. It follows the same pattern: every value
 * is Amharic, the keys remain English identifiers, and the Latin
 * script is preserved only where a term is its own identity (see
 * §"Terms handled deliberately").
 *
 * -----------------------------------------------------------------------------
 * The interfaces live in the .vue files, not here
 * -----------------------------------------------------------------------------
 * Unlike features/portal/labels.ts — where the interfaces and values
 * are declared together, because the portal labels file landed before
 * the pages it labels — this file follows the standard pattern used by
 * the auth label set: the interface is declared by the component that
 * consumes it (FilesListView.vue, FileDetailView.vue), and this file
 * imports it and annotates the exported const.
 *
 * That is why this file has no `export interface` statement. The
 * contract travels with the component; the values travel here.
 *
 * -----------------------------------------------------------------------------
 * Terms handled deliberately
 * -----------------------------------------------------------------------------
 * "ሰነድ" (document/file — singular) and "ሰነዶች" (plural) are used for
 * files. This matches the workspace shell's sidebar label (Unit L-3)
 * and the registry's own Amharic descriptions, which use "ሰነድ" for
 * document storage. A reviewer who prefers the loanword "ፋይል" should
 * change this file, shell-labels.ts, and the registry descriptions
 * together; a single-place change would create a visible inconsistency
 * between the sidebar and the page it links to.
 *
 * "ስቀል" (upload) is used for the upload action and the upload-modal
 * title. It is the standard Amharic verb for placing a file into a
 * system, and it appears as both the button label ("ስቀል") and the
 * modal title noun ("ሰነድ ስቀል" — literally "upload a document").
 *
 * "አውርድ" (download) is used for the download action. The verb derives
 * from "to descend", the standard Amharic verb for fetching a file to
 * the local device.
 *
 * "አጥፋ" (destroy/delete) is used for the delete actions, and "በቋሚነት
 * አጥፋ" (delete permanently) for the force-delete. The distinction
 * between the two is expressed by the adverbial "በቋሚነት" (permanently),
 * which mirrors the English source's "Delete" vs "Delete permanently".
 *
 * "ማህደር" (archive) is used for the archived status. It is the standard
 * Amharic term for a long-term storage location and pairs naturally
 * with the prepositional form "በማህደር የተቀመጠ" (stored in the archive).
 *
 * "ተወው" (leave it / abandon) is used for the cancel action. This is
 * the standard Amharic UI term for cancelling a modal or a form. It is
 * deliberately distinct from "አጥፋ" (delete), so a user reading a
 * confirmation dialog with two buttons sees two clearly different
 * verbs.
 *
 * "ቅጂ" (copy/version) is used for a file version. This is the standard
 * Amharic term for a duplicated instance of a document.
 *
 * The Latin-script term "PDF" is preserved in previewPdfFallback. It
 * is the name of a file format, not a translatable word, and users
 * universally recognize it as-is. This is the only Latin-script term
 * in the file.
 *
 * -----------------------------------------------------------------------------
 * The ConfirmDeleteDialog interpolation tokens
 * -----------------------------------------------------------------------------
 * The ConfirmDeleteDialog composite interpolates three tokens into
 * its title, message, and confirmationPrompt strings:
 *
 *   {entityLabel}        — the entity type        (now "ሰነድ")
 *   {entityName}         — the specific entity    (a file name)
 *   {confirmationText}   — the string to type     (= entityName)
 *
 * Unrecognized tokens pass through verbatim. The token names are
 * English identifiers, not user-facing text, and are preserved
 * unchanged from the English source. Only the surrounding prose in
 * deleteDialogConfirmationPrompt and forceDialogConfirmationPrompt is
 * translated.
 *
 * The tokens' positions within the sentences may differ from English
 * word order. In Amharic, the confirmation instruction places the
 * value-typed-before-the-verb ("… ያስገቡ" — "type …"). The prompts in
 * this file place {confirmationText} before the verb, which is the
 * natural Amharic order.
 *
 * -----------------------------------------------------------------------------
 * Translation quality notes
 * -----------------------------------------------------------------------------
 * The Amharic below follows the register set by router/auth-labels.ts,
 * router/launcher-labels.ts, router/shell-labels.ts, and
 * features/portal/labels.ts:
 *
 *   · The loading message uses the same present-progressive
 *     verbal-noun form ("በመጫን ላይ…", "በመስቀል ላይ…"). The trailing
 *     ellipsis is U+2026 (…), matching every prior label set.
 *
 *   · The retry label is the same "እንደገና ይሞክሩ" string used
 *     everywhere else in the localized surface. There is one retry
 *     string in the codebase and this file uses it.
 *
 *   · Imperative voice is used for every actionable element —
 *     "ስቀል", "አውርድ", "አጥፋ", "ተወው", "አስወግድ", "ያስሱ". This matches the
 *     auth batch's convention ("ግባ" for login, "ይመዝገቡ" for register)
 *     and treats commands as commands.
 *
 *   · The plural/respectful imperative is used selectively for
 *     actions with durable side effects: "ይስቀሉ" (upload — the file
 *     is persisted), "ያጥፉ" in the dialog titles (delete — the file
 *     is removed), "ያስገቡ" (type to confirm). The singular imperative
 *     is used for the buttons that carry the same actions, because
 *     the dialog's title and its confirm button need not repeat the
 *     same register.
 *
 *   · Empty-state descriptions use the same two-sentence pattern as
 *     every other empty state in the codebase: a factual statement of
 *     the current situation, followed — only where the state might
 *     plausibly indicate a problem — by a conditional escalation.
 *     "No files yet" carries an actionable suggestion ("upload a file
 *     to get started") rather than an administrator escalation,
 *     because the user can act. "File not found" does not escalate,
 *     because the state is terminal.
 *
 * -----------------------------------------------------------------------------
 * Native-speaker review needed
 * -----------------------------------------------------------------------------
 * The following strings are the most likely candidates for adjustment
 * by a native Amharic reviewer. They are idiomatic as far as this
 * author can determine, but native review is the correct final gate:
 *
 *   · uploadDropLabel: 'ሰነድ እዚህ ይጣሉ' — "drop a document here". The
 *     verb "ይጣሉ" is the plural/respectful imperative of "ጣለ" (to
 *     throw/drop). A reviewer may prefer the singular "ጣል" for a
 *     drag-and-drop affordance, or a construction that names the
 *     drag action explicitly ("ሰነድ እዚህ ይጎትቱ" — "drag a document
 *     here"). Both are idiomatic in Ethiopian software; the plural
 *     was chosen for consistency with the upload button's register.
 *
 *   · actionView: 'ይመልከቱ' — "view". This is the plural imperative
 *     of "መልከት" (to watch/look at). A reviewer may prefer the
 *     singular "ተመልከት" or the simpler "ክፈት" ("open"), since the
 *     action navigates to the detail page rather than merely
 *     displaying information in place. "ክፈት" might in fact be more
 *     accurate to the underlying behavior; the choice depends on
 *     whether the reviewer wants the label to describe the user's
 *     intent ("view") or the system's response ("open").
 *
 *   · paginationPrevLabel / paginationNextLabel: 'ቀዳሚ' / 'ቀጣይ' —
 *     "previous" / "next". Both are standard and unambiguous in a
 *     pagination context. A reviewer may prefer "ቀዳሚ ገጽ" / "ቀጣይ ገጽ"
 *     ("previous page" / "next page") if the buttons' aria-labels
 *     need the explicit noun. The current forms match the English
 *     source's brevity.
 *
 *   · uploadStatusPending: 'በመጠበቅ ላይ' — "waiting". This is the
 *     present-progressive form of "ጠበቀ" (to wait). A reviewer may
 *     prefer "ያልተጀመረ" ("not yet started") for a state that has not
 *     even begun, since "በመጠበቅ ላይ" implies active waiting. The
 *     current choice matches the English source ("Pending") and is
 *     brief enough for a status chip.
 *
 *   · deleteDialogMessage: 'ሰነዱ ወደ የተጣሉ ሰነዶች ዝርዝር ይዛወራል፣ በኋላም
 *     መመለስ ይችላል።' — "the document will be moved to the deleted-
 *     documents list and can be restored later." The phrase "መመለስ
 *     ይችላል" is grammatically ambiguous as to WHO can restore it —
 *     the user, or the system. In the English source the ambiguity
 *     is also present. A reviewer may prefer a passive construction
 *     ("በኋላ ሊመለስ ይችላል" — "can be restored later") that removes
 *     the agent entirely and reads as more natural Amharic. This
 *     change is recommended but not required; the current form is
 *     clear in context.
 *
 * -----------------------------------------------------------------------------
 * Outstanding items
 * -----------------------------------------------------------------------------
 * 1. Native-speaker review of the five strings listed above. None of
 *    them block delivery; the review is a refinement.
 *
 * 2. The two labels interfaces remain declared in their .vue files
 *    (FilesListView.vue, FileDetailView.vue), matching the pattern the
 *    auth batch uses. This file imports them and does not redeclare
 *    them.
 *
 * 3. The files routes' permission slugs — file.view, file.upload,
 *    file.delete, file.force_delete — are unchanged. They are not
 *    user-facing strings and are not translated.
 * =============================================================================
 */

import type { FilesListViewLabels } from './FilesListView';
import type { FileDetailViewLabels } from './FileDetailView';

// =============================================================================
// FilesListView
// =============================================================================
export const filesListViewLabels: FilesListViewLabels = {
  pageTitle: 'ሰነዶች',
  pageDescription: 'የአሁኑ ተቋም ሰነዶችና አባሪዎች።',

  uploadLabel: 'ስቀል',

  searchPlaceholder: 'ሰነዶችን ይፈልጉ…',
  searchAriaLabel: 'ሰነዶችን ይፈልጉ',
  statusFilterLabel: 'የሁኔታ ማጣሪያ',
  statusFilterAll: 'ሁሉም ሁኔታዎች',
  statusFilterPublished: 'የታተመ',
  statusFilterArchived: 'በማህደር የተቀመጠ',

  columnName: 'ስም',
  columnType: 'ዓይነት',
  columnSize: 'መጠን',
  columnUploaded: 'የተሰቀለበት',
  columnActions: 'ተግባራት',

  rowActionsAriaLabel: 'የረድፍ ተግባራት',
  actionView: 'ይመልከቱ',
  actionDownload: 'አውርድ',
  actionDelete: 'አጥፋ',

  loadingMessage: 'ሰነዶችን በመጫን ላይ…',
  errorMessage: 'የሰነዶች ዝርዝሩን ማምጣት አልቻልንም።',
  errorRetryLabel: 'እንደገና ይሞክሩ',
  emptyTitle: 'እስካሁን ምንም ሰነዶች የሉም',
  emptyDescription:
    'ለመጀመር አንድ ሰነድ ይስቀሉ፣ ወይም ፍለጋዎን ያስተካክሉ።',

  paginationAriaLabel: 'የሰነዶች ዝርዝር ገጽ አሰሳ',
  paginationPrevLabel: 'ቀዳሚ',
  paginationNextLabel: 'ቀጣይ',

  uploadModalTitle: 'ሰነድ ስቀል',
  uploadModalCloseLabel: 'የመስቀያ መስኮት ዝጋ',
  uploadDropLabel: 'ሰነድ እዚህ ይጣሉ',
  uploadBrowseLabel: 'ያስሱ',
  uploadRetryLabel: 'እንደገና ይሞክሩ',
  uploadRemoveLabel: 'አስወግድ',
  uploadCancelLabel: 'ተወው',
  uploadStatusPending: 'በመጠበቅ ላይ',
  uploadStatusUploading: 'በመስቀል ላይ',
  uploadStatusSuccess: 'ተሰቀሏል',
  uploadStatusError: 'መስቀል አልተሳካም',
  uploadStatusCancelled: 'ተሰርዟል',

  deleteDialogTitle: 'ሰነዱን ያጥፉ?',
  deleteDialogMessage:
    'ሰነዱ ወደ የተጣሉ ሰነዶች ዝርዝር ይዛወራል፣ በኋላም መመለስ ይችላል።',
  deleteConfirmLabel: 'አጥፋ',
  deleteCancelLabel: 'ተወው',
  deleteDialogEntityLabel: 'ሰነድ',
  deleteDialogConfirmationPrompt:
    'ለማረጋገጥ {confirmationText} ያስገቡ',
  deleteDialogConfirmationMismatch: 'የተጻፈው ጽሑፍ አይመሳሰልም።',
};

// =============================================================================
// FileDetailView
// =============================================================================
export const fileDetailViewLabels: FileDetailViewLabels = {
  pageDescription: 'የሰነድ ዝርዝር መረጃና የቅጂ ታሪክ።',

  loadingMessage: 'ሰነዱን በመጫን ላይ…',
  errorMessage: 'ይህን ሰነድ ማምጣት አልቻልንም።',
  errorRetryLabel: 'እንደገና ይሞክሩ',
  emptyTitle: 'ሰነዱ አልተገኘም',
  emptyDescription: 'ሰነዱ ተጥፎ ወይም ተዛውሮ ሊሆን ይችላል።',

  metadataTitle: 'ዝርዝር መረጃ',
  metadataName: 'ስም',
  metadataType: 'ዓይነት',
  metadataSize: 'መጠን',
  metadataUploaded: 'የተሰቀለበት',
  metadataUpdated: 'መጨረሻ የተሻሻለበት',
  metadataStatus: 'ሁኔታ',

  statusPublished: 'የታተመ',
  statusArchived: 'በማህደር የተቀመጠ',
  statusDeleted: 'የተጣለ',

  previewTitle: 'ቅድመ እይታ',
  previewLoading: 'ቅድመ እይታን በመጫን ላይ…',
  previewError: 'ቅድመ እይታ አይገኝም',
  previewUnsupported: 'ለዚህ የሰነድ ዓይነት ቅድመ እይታ አይገኝም።',
  previewPdfFallback:
    'አሳሽዎ ይህን PDF ማሳየት አይችልም። ለመመልከት ያውርዱት።',

  downloadLabel: 'አውርድ',
  downloadSuccessLabel: 'ተወርዷል',
  downloadErrorLabel: 'ማውረድ አልተሳካም',
  downloadRetryLabel: 'እንደገና ይሞክሩ',
  actionsTriggerLabel: 'ተጨማሪ ተግባራት',
  actionDelete: 'አጥፋ',
  actionForceDelete: 'በቋሚነት አጥፋ',

  versionsTitle: 'የቅጂ ታሪክ',
  versionsEmptyMessage: 'ቀደም ያሉ ቅጂዎች የሉም።',
  versionLabel: 'ቅጂ',
  versionCurrentLabel: 'የአሁኑ',

  deleteDialogTitle: 'ሰነዱን ያጥፉ?',
  deleteDialogMessage:
    'ሰነዱ ወደ የተጣሉ ሰነዶች ዝርዝር ይዛወራል፣ በኋላም መመለስ ይችላል።',
  deleteConfirmLabel: 'አጥፋ',
  deleteCancelLabel: 'ተወው',
  deleteDialogEntityLabel: 'ሰነድ',
  deleteDialogConfirmationPrompt:
    'ለማረጋገጥ {confirmationText} ያስገቡ',
  deleteDialogConfirmationMismatch: 'የተጻፈው ጽሑፍ አይመሳሰልም።',

  forceDialogTitle: 'ሰነዱን በቋሚነት ያጥፉ?',
  forceDialogMessage:
    'ይህ መመለስ አይቻልም። ሰነዱና ሁሉም ቅጂዎቹ በቋሚነት ይወገዳሉ።',
  forceConfirmLabel: 'በቋሚነት አጥፋ',
  forceCancelLabel: 'ተወው',
  forceDialogEntityLabel: 'ሰነድ',
  forceDialogConfirmationPrompt:
    'ይህን ሰነድ በቋሚነት ለማጥፋት {confirmationText} ያስገቡ',
  forceDialogConfirmationMismatch: 'የተጻፈው ጽሑፍ አይመሳሰልም።',
};