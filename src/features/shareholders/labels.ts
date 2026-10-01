/*
 * =============================================================================
 * MASES Phase 2 UI — Shareholder Feature Labels (Amharic)
 * =============================================================================
 *
 * File:      mase_app/src/features/shareholders/labels.ts
 * Layer:     Features (Shareholder vertical)
 * Version:   1.1.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §9 (Localization)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (Stage 15). English constants. Seven
 *          exported label objects covering ShareholderListView,
 *          ShareholderDetailView, ShareholderForm, ShareClassListView,
 *          CertificateIssueForm, CertificateCancelDialog, and
 *          HoldingEntryForm.
 *
 * 1.1.0  — values changed from English to Amharic to satisfy the
 *          Amharic-first default (Unit A-3):
 *          · Every string VALUE changes from English to Amharic. The
 *            seven exported consts keep their names, their types, and
 *            every key. The seven interfaces they satisfy are declared
 *            in their respective .vue files and are byte-for-byte
 *            unchanged.
 *          · No consumer changes. Each of the seven components receives
 *            its labels through a `labels` prop and reads them as
 *            `labels.<key>`. Because the KEYS are unchanged, the
 *            components render the new Amharic values without any
 *            modification. The routes-workspace.ts entries that bind
 *            these objects to the page components are also unchanged.
 *          · MINOR version bump, matching the pattern
 *            router/auth-labels.ts set when it converted its values
 *            from English to Amharic (1.0.0 → 1.1.0). A value-only
 *            change is MINOR; a shape change is MAJOR.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The shareholder vertical's user-facing strings, in Amharic.
 * Consumed by:
 *
 *     features/shareholders/ShareholderListView/ShareholderListView.vue
 *     features/shareholders/ShareholderDetailView/ShareholderDetailView.vue
 *     features/shareholders/ShareholderForm/ShareholderForm.vue
 *     features/shareholders/ShareClassListView/ShareClassListView.vue
 *     features/shareholders/CertificateIssueForm/CertificateIssueForm.vue
 *     features/shareholders/CertificateCancelDialog/CertificateCancelDialog.vue
 *     features/shareholders/HoldingEntryForm/HoldingEntryForm.vue
 *
 * Each component declares its own labels interface and receives the
 * corresponding object below as a prop. The route tree
 * (router/routes-workspace.ts) supplies the objects from this file to
 * the route records' `props` fields.
 *
 * This file is the shareholder vertical's counterpart to
 * router/auth-labels.ts, router/launcher-labels.ts,
 * router/shell-labels.ts, features/portal/labels.ts, and
 * features/files/labels.ts. It follows the same pattern: every value
 * is Amharic, the keys remain English identifiers, and Latin script is
 * preserved only where a term is its own identity (see §"Terms handled
 * deliberately").
 *
 * -----------------------------------------------------------------------------
 * THE i18n GAP — resolved for this file
 * -----------------------------------------------------------------------------
 * Prior to 1.1.0, this file was listed alongside auth-labels.ts and
 * AuthenticatedLayout.vue as having English constants pending i18n
 * migration. The Amharic-first pass now covers the shareholder
 * vertical. When a full i18n service is introduced (a future CR), the
 * change is confined to this file — the seven components do not
 * change, and neither does routes-workspace.ts.
 *
 * -----------------------------------------------------------------------------
 * Terms handled deliberately
 * -----------------------------------------------------------------------------
 * "ባለአክሲዮን" (shareholder — singular) and "ባለአክሲዮኖች" (plural) match the
 * registry's own Amharic name for the Shareholder Portal row
 * ("የባለአክሲዮኖች ፖርታል") and the workspace shell's nav item label. Using
 * the same term across all three surfaces keeps the workspace and
 * portal consistent.
 *
 * "አክሲዮን" (share), "የአክሲዮን ክፍል" (share class), and "ምስክር ወረቀት"
 * (certificate — literally "witness paper") are the terms established
 * in features/portal/labels.ts. This file uses the same vocabulary so
 * a user moving between the portal and the workspace's shareholder
 * pages sees one vocabulary.
 *
 * "ይዞታ" (holding) and "ይዞታዎች" (holdings) are used for the share-
 * holding ledger rows. The word describes the state of possessing
 * something, which is the correct sense for a per-class quantity.
 *
 * "ግቤት" (entry) is used for a ledger entry — both as the section action
 * ("ግቤት ይመዝግቡ" — record an entry) and as the noun in the form's
 * fields.
 *
 * "ግለሰብ" (individual), "ኩባንያ" (company), "አደራ" (trust),
 * "ህብረት ስራ ማህበር" (cooperative), "መንግስት" (government), and
 * "ሃይማኖታዊ ድርጅት" (religious body) render the six shareholder types.
 * "አደራ" is used for "Trust" — the standard Amharic term for a trust
 * arrangement — and is flagged for review; see §"Native-speaker review
 * needed".
 *
 * "የድርጅት ስም" (entity name) is used for the non-individual name block.
 * It is composed from the word for "organization" — the closest native
 * Amharic term for any non-individual shareholder. It covers companies,
 * trusts, cooperatives, government bodies, and religious organizations
 * alike; the label's precision is bounded by the domain, not by the
 * translation.
 *
 * "የፊት ዋጋ" (par value — literally "face value") is used for the share
 * class's nominal value. The rendering matches how "face value" appears
 * in Ethiopian financial prose. Flagged for review; see §"Native-speaker
 * review needed".
 *
 * "ንቁ" (active) and "ንቁ ያልሆነ" (inactive) render the active/inactive
 * status. Both are consistent with the shell and launcher label sets.
 *
 * -----------------------------------------------------------------------------
 * Latin-script terms preserved on purpose
 * -----------------------------------------------------------------------------
 * Three fields in shareholderFormLabels remain in English:
 *
 *     firstNameEnLabel        "First name"
 *     fatherNameEnLabel       "Father's name"
 *     grandfatherNameEnLabel  "Grandfather's name"
 *
 * These are the labels of the English name block — the field accepts an
 * English-script name, so the label is in English. This is the same
 * deliberate preservation that auth-labels.ts documents for its own
 * three English-script name fields (§"Why the values are Amharic").
 * A reviewer who prefers to translate these labels should change both
 * files together; a single-place change would create an inconsistency
 * between the register and shareholder forms.
 *
 * There are no other Latin-script strings in this file. A future
 * reviewer who finds a term that should have been preserved on purpose
 * adds it here with a rationale, the way auth-labels.ts documents
 * "Caps Lock" and "spam".
 *
 * -----------------------------------------------------------------------------
 * Translation quality notes
 * -----------------------------------------------------------------------------
 * The Amharic below follows the register set by router/auth-labels.ts,
 * router/launcher-labels.ts, router/shell-labels.ts,
 * features/portal/labels.ts, and features/files/labels.ts:
 *
 *   · The loading messages use the present-progressive verbal-noun
 *     form ("በመጫን ላይ…", "በማስቀመጥ ላይ…", "በመሰረዝ ላይ…"). The trailing
 *     ellipsis is U+2026 (…), matching every prior label set.
 *
 *   · The retry label is the same "እንደገና ይሞክሩ" string used in every
 *     retry affordance across the auth batch, the launcher grid, the
 *     shell, the portal, and the files feature.
 *
 *   · Imperative voice is used for every actionable element — "ግባ",
 *     "አስተካክል", "አጥፋ", "ሰርዝ", "ተወው", "ስጥ", "ይመዝግቡ". This matches
 *     the auth batch's convention and treats commands as commands.
 *
 *   · The plural/respectful imperative is used selectively for actions
 *     with durable side effects — "ያጥፉ" in the delete confirmation
 *     titles, "ያስገቡ" in the typed-confirmation prompts, "ይምረጡ" in the
 *     select prompts. The singular imperative is used for the buttons
 *     that carry the same actions, because the dialog's title and its
 *     confirm button need not repeat the same register.
 *
 *   · The empty-state descriptions use the same two-sentence pattern as
 *     every other empty state in the codebase: a factual statement of
 *     the current situation, followed — only where the state might
 *     plausibly indicate a problem — by a conditional escalation
 *     ("… ይህ ስህተት ነው ብለው ካሰቡ፣ አስተዳዳሪዎን ያግኙ።"). The shareholders
 *     list's empty state carries an actionable suggestion instead
 *     ("create the first shareholder, or adjust your search"), because
 *     the user can act; the detail view's empty state carries the
 *     escalation because a missing record can indicate a data-entry
 *     problem.
 *
 *   · The error banner titles and messages use the exact pattern
 *     established by auth-labels.ts: a banner title that names the
 *     error class, and a message that tells the user what to do. The
 *     four error classes (conflict, network, generic, and the
 *     not-found / empty states) appear throughout the file with
 *     consistent phrasing.
 *
 *   · "ማጣቀሻ፦" (Reference:) is the same prefix used by auth-labels.ts
 *     for request-id display. It is preserved exactly.
 *
 * -----------------------------------------------------------------------------
 * Native-speaker review needed
 * -----------------------------------------------------------------------------
 * The following strings are the most likely candidates for adjustment
 * by a native Amharic reviewer. They are idiomatic as far as this
 * author can determine, but native review is the correct final gate:
 *
 *   · typeTrust: 'አደራ' — "trust". Amharic has no single established
 *     legal term for the Anglo-American "trust" concept. "አደራ" means
 *     custody/entrustment and is the closest native rendering; a
 *     reviewer may prefer the loanword "ትረስት", which is used in some
 *     Ethiopian legal texts, or a longer descriptive phrase. This
 *     affects both the list filter and the form's type dropdown; the
 *     two must remain consistent.
 *
 *   · typeReligiousBody: 'ሃይማኖታዊ ድርጅት' — "religious organization".
 *     The English source says "religious body". A reviewer may prefer
 *     "ሃይማኖታዊ ተቋም" ("religious institution"). Both are correct; the
 *     choice may depend on the legal classification the registry uses.
 *
 *   · columnParValue / metadataParValue (shareClassListViewLabels):
 *     'የፊት ዋጋ' — "face value". A reviewer may prefer the loanword
 *     "ፓር ቫልዩ" (used in some Ethiopian financial documents), or
 *     "የስም ዋጋ" ("nominal value"), which is more literally faithful
 *     to "par".
 *
 *   · certificateCancelDialogLabels.dismissLabel: 'ተወው' — the same
 *     string used for cancel buttons elsewhere. In this dialog, the
 *     primary action is itself a "cancel" (of the certificate), so the
 *     dismiss button carries a potentially confusable label. A
 *     reviewer may prefer 'ዝጋ' ("close") or 'አትቀጥል' ("do not continue"),
 *     which reads as a dialog-close rather than a second cancel.
 *
 *   · shareholderDetailViewLabels.holdingsNewLabel: 'ግቤት ይመዝግቡ' — "record
 *     an entry". A reviewer may prefer "አዲስ ግቤት" ("new entry") to
 *     parallel the certificates section's action ("ምስክር ወረቀት ስጥ" —
 *     "issue a certificate"), which is a noun-first construction.
 *     Consistency between the two section actions is worth reviewing
 *     together.
 *
 *   · certificateIssueFormLabels.certificateNumberHelper: 'አማራጭ። ቁጥሩ በኋላ
 *     የሚመደብ ከሆነ ባዶ ይተዉት።' — "Optional. Leave blank if the number will be
 *     assigned later." The plural imperative "ይተዉት" ("leave it") is
 *     used for consistency with other instructions; a reviewer may
 *     prefer the singular. The meaning is unambiguous either way.
 *
 *   · certificateCancelDialogLabels.confirmMessage — the paragraph is
 *     three sentences and carries the strongest warning in the file.
 *     A reviewer should confirm the register is suitably serious for a
 *     permanent action, and that the phrase "ወደኋላ መመለስ አይቻልም" ("it
 *     cannot be reversed") reads as intended.
 *
 * -----------------------------------------------------------------------------
 * Outstanding items
 * -----------------------------------------------------------------------------
 * 1. Native-speaker review of the six strings listed above. None of
 *    them block delivery; the review is a refinement.
 *
 * 2. The seven labels interfaces remain declared in their .vue files,
 *    matching the pattern the auth batch uses. This file imports them
 *    and does not redeclare them.
 *
 * 3. The shareholder routes' permission slugs — shareholder.view,
 *    shareholder.view_own, shareholder.create, shareholder.update,
 *    share_class.view, share_holding.entry, certificate.issue,
 *    certificate.cancel — are unchanged. They are not user-facing
 *    strings and are not translated.
 *
 * 4. The backend-translated labels (type_label, status_label,
 *    certificate.status_label, share_class.display_name,
 *    shareholder.display_name) are supplied by the API and rendered
 *    verbatim. They are not part of this file and are not affected by
 *    the Amharic-first pass on the frontend.
 * =============================================================================
 */

import type { ShareholderListViewLabels } from './ShareholderListView';
import type { ShareholderDetailViewLabels } from './ShareholderDetailView';
import type { ShareholderFormLabels } from './ShareholderForm';
import type { ShareClassListViewLabels } from './ShareClassListView';
import type { CertificateIssueFormLabels } from './CertificateIssueForm';
import type { CertificateCancelDialogLabels } from './CertificateCancelDialog';
import type { HoldingEntryFormLabels } from './HoldingEntryForm';

// =============================================================================
// ShareholderListView
// =============================================================================
export const shareholderListViewLabels: ShareholderListViewLabels = {
  pageTitle: 'ባለአክሲዮኖች',
  pageDescription: 'የተቋሙ የተመዘገቡ ባለአክሲዮኖች።',
  newShareholderLabel: 'አዲስ ባለአክሲዮን',
  searchPlaceholder: 'በስም ይፈልጉ…',
  searchAriaLabel: 'ባለአክሲዮኖችን ይፈልጉ',
  typeFilterLabel: 'የዓይነት ማጣሪያ',
  typeFilterAll: 'ሁሉም ዓይነቶች',
  typeFilterIndividual: 'ግለሰብ',
  typeFilterCompany: 'ኩባንያ',
  typeFilterTrust: 'አደራ',
  typeFilterCooperative: 'ህብረት ስራ ማህበር',
  typeFilterGovernment: 'መንግስት',
  typeFilterReligiousBody: 'ሃይማኖታዊ ድርጅት',
  activeFilterLabel: 'የሁኔታ ማጣሪያ',
  activeFilterAll: 'ሁሉም ሁኔታዎች',
  activeFilterActive: 'ንቁ',
  activeFilterInactive: 'ንቁ ያልሆነ',
  columnName: 'ስም',
  columnType: 'ዓይነት',
  columnStatus: 'ሁኔታ',
  columnCreated: 'የተፈጠረበት',
  columnActions: 'ተግባራት',
  rowActionsAriaLabel: 'የረድፍ ተግባራት',
  actionView: 'ይመልከቱ',
  actionEdit: 'አስተካክል',
  loadingMessage: 'ባለአክሲዮኖችን በመጫን ላይ…',
  errorMessage: 'የባለአክሲዮኖች ዝርዝሩን ማምጣት አልቻልንም።',
  errorRetryLabel: 'እንደገና ይሞክሩ',
  emptyTitle: 'እስካሁን ምንም ባለአክሲዮኖች የሉም',
  emptyDescription:
    'የመጀመሪያውን ባለአክሲዮን ይፍጠሩ፣ ወይም ፍለጋዎን ያስተካክሉ።',
  paginationAriaLabel: 'የባለአክሲዮኖች ዝርዝር ገጽ አሰሳ',
  paginationPrevLabel: 'ቀዳሚ',
  paginationNextLabel: 'ቀጣይ',
};

// =============================================================================
// ShareholderDetailView
// =============================================================================
export const shareholderDetailViewLabels: ShareholderDetailViewLabels = {
  loadingMessage: 'ባለአክሲዮኑን በመጫን ላይ…',
  errorMessage: 'ይህን ባለአክሲዮን ማምጣት አልቻልንም።',
  errorRetryLabel: 'እንደገና ይሞክሩ',
  emptyTitle: 'ባለአክሲዮኑ አልተገኘም',
  emptyDescription:
    'ባለአክሲዮኑ ተወግዶ ሊሆን ይችላል፣ ወይም የሌላ ተቋም ሊሆን ይችላል።',
  pageDescription: 'መለያ፣ ይዞታዎችና ምስክር ወረቀቶች።',
  editLabel: 'አስተካክል',
  identityTitle: 'መለያ',
  identityName: 'ስም',
  identityType: 'ዓይነት',
  identityStatus: 'ሁኔታ',
  identityUser: 'መለያ',
  identityRepresentative: 'ተወካይ',
  identityCreated: 'የተፈጠረበት',
  identityUpdated: 'መጨረሻ የተሻሻለበት',
  holdingsTitle: 'ይዞታዎች',
  holdingsEmpty: 'ለዚህ ባለአክሲዮን ምንም ይዞታዎች የሉም።',
  holdingsNewLabel: 'ግቤት ይመዝግቡ',
  holdingsColumnClass: 'የአክሲዮን ክፍል',
  holdingsColumnQuantity: 'ብዛት',
  certificatesTitle: 'ምስክር ወረቀቶች',
  certificatesEmpty: 'ምንም ምስክር ወረቀቶች አልተሰጡም።',
  certificatesNewLabel: 'ምስክር ወረቀት ስጥ',
  certificatesColumnNumber: 'ቁጥር',
  certificatesColumnClass: 'የአክሲዮን ክፍል',
  certificatesColumnStatus: 'ሁኔታ',
  certificatesColumnIssued: 'የተሰጠበት',
  certificatesColumnActions: 'ተግባራት',
  certificatesRowActionsAriaLabel: 'የምስክር ወረቀት ተግባራት',
  certificatesActionCancel: 'ምስክር ወረቀቱን ሰርዝ',
};

// =============================================================================
// ShareholderForm
// =============================================================================
export const shareholderFormLabels: ShareholderFormLabels = {
  createTitle: 'አዲስ ባለአክሲዮን',
  editTitle: 'ባለአክሲዮን አስተካክል',
  pageDescription:
    'ባለአክሲዮን በኩባንያው መዝገብ ውስጥ የተመዘገበ ተፈጥሯዊ ሰው ወይም ህጋዊ አካል ነው።',

  sectionTypeStatus: 'ዓይነትና ሁኔታ',
  sectionName: 'ስም',
  sectionNameAm: 'ስም በአማርኛ',
  sectionNameEn: 'ስም በእንግሊዝኛ',
  sectionEntityName: 'የድርጅት ስም',
  sectionAccess: 'የመለያ አገናኞች',

  typeLabel: 'የባለአክሲዮን ዓይነት',
  typeIndividual: 'ግለሰብ',
  typeCompany: 'ኩባንያ',
  typeTrust: 'አደራ',
  typeCooperative: 'ህብረት ስራ ማህበር',
  typeGovernment: 'መንግስት',
  typeReligiousBody: 'ሃይማኖታዊ ድርጅት',

  activeLabel: 'ንቁ',
  activeHelper:
    'ንቁ ያልሆኑ ባለአክሲዮኖች በመዝገቡ ውስጥ ይቆያሉ ነገር ግን ከንቁ ዝርዝሮች ይገለላሉ።',

  firstNameAmLabel: 'የመጀመሪያ ስም',
  fatherNameAmLabel: 'የአባት ስም',
  grandfatherNameAmLabel: 'የአያት ስም',
  /*
   * The three English-script name labels are preserved in English by
   * design — the field accepts an English-script name, so the label is
   * in English. This matches the precedent documented in
   * auth-labels.ts §"Why the values are Amharic".
   */
  firstNameEnLabel: 'First name',
  fatherNameEnLabel: "Father's name",
  grandfatherNameEnLabel: "Grandfather's name",

  entityNameAmLabel: 'የድርጅት ስም (በአማርኛ)',
  entityNameEnLabel: 'የድርጅት ስም (በእንግሊዝኛ)',

  userLabel: 'የተገናኘ መለያ',
  userHelper: 'ከዚህ ግለሰብ ጋር የተያያዘው የተጠቃሚ መለያ ቁጥር።',
  representativeLabel: 'የተወካይ መለያ',
  representativeHelper:
    'የተመደበው ተወካይ የተጠቃሚ መለያ ቁጥር። ለህጋዊ አካላት ያስፈልጋል።',

  atLeastOneNameRequired:
    'ቢያንስ አንድ ስም ያስገቡ — በአማርኛ ወይም በእንግሊዝኛ።',
  representativeRequired:
    'ለህጋዊ ያልሆነ ባለአክሲዮን ተወካይ ያስፈልጋል።',
  userRequired: 'ለግለሰብ ባለአክሲዮን የተገናኘ መለያ ያስፈልጋል።',

  submitCreateLabel: 'ባለአክሲዮን ፍጠር',
  submitEditLabel: 'ለውጦችን አስቀምጥ',
  submittingLabel: 'በማስቀመጥ ላይ…',
  cancelLabel: 'ተወው',

  loadingMessage: 'ባለአክሲዮኑን በመጫን ላይ…',
  loadErrorMessage: 'ይህን ባለአክሲዮን ማምጣት አልቻልንም።',
  loadErrorRetryLabel: 'እንደገና ይሞክሩ',
  notFoundTitle: 'ባለአክሲዮኑ አልተገኘም',
  notFoundDescription:
    'ባለአክሲዮኑ ተወግዶ ሊሆን ይችላል፣ ወይም የሌላ ተቋም ሊሆን ይችላል።',

  conflictTitle: 'ይህን ባለአክሲዮን ማስቀመጥ አልቻልንም',
  conflictMessage:
    'የመለያና የተወካይ አገናኞችን ያረጋግጡና እንደገና ይሞክሩ። ስርዓቱ ከነባር መዝገብ ጋር ግጭት አግኝቷል።',

  networkErrorTitle: 'የኔትወርክ ስህተት',
  networkErrorMessage:
    'አገልጋዩን ማግኘት አልቻልንም። ግንኙነትዎን ያረጋግጡ እንደገና ይሞክሩ።',

  genericErrorTitle: 'የሆነ ችግር ተፈጥሯል',
  genericErrorMessage: 'እባክዎ በአጭር ጊዜ ውስጥ እንደገና ይሞክሩ።',
  requestIdPrefix: 'ማጣቀሻ፦',
};

// =============================================================================
// ShareClassListView
// =============================================================================
export const shareClassListViewLabels: ShareClassListViewLabels = {
  pageTitle: 'የአክሲዮን ክፍሎች',
  pageDescription:
    'በኩባንያው የሚሰጡ የአክሲዮን ክፍሎችን የሚገልጽ ማጣቀሻ መረጃ።',
  columnCode: 'ኮድ',
  columnName: 'ስም',
  columnParValue: 'የፊት ዋጋ',
  columnFlags: 'ምልክቶች',
  columnActive: 'ሁኔታ',
  flagFounder: 'መስራቾች',
  flagDefault: 'ነባሪ',
  statusActive: 'ንቁ',
  statusInactive: 'ንቁ ያልሆነ',
  loadingMessage: 'የአክሲዮን ክፍሎችን በመጫን ላይ…',
  errorMessage: 'የአክሲዮን ክፍሎችን ማምጣት አልቻልንም።',
  errorRetryLabel: 'እንደገና ይሞክሩ',
  emptyTitle: 'ምንም የአክሲዮን ክፍሎች የሉም',
  emptyDescription:
    'ለዚህ ተቋም ምንም የአክሲዮን ክፍሎች አልተዋቀሩም።',
};

// =============================================================================
// CertificateIssueForm
// =============================================================================
export const certificateIssueFormLabels: CertificateIssueFormLabels = {
  dialogTitle: 'ምስክር ወረቀት ስጥ',
  closeLabel: 'መስኮቱን ዝጋ',
  shareClassLabel: 'የአክሲዮን ክፍል',
  shareClassPlaceholder: 'አንድ ክፍል ይምረጡ…',
  certificateNumberLabel: 'የምስክር ወረቀት ቁጥር',
  certificateNumberHelper:
    'አማራጭ። ቁጥሩ በኋላ የሚመደብ ከሆነ ባዶ ይተዉት።',
  notesLabel: 'ማስታወሻዎች',
  notesHelper: 'አማራጭ። ከምስክር ወረቀቱ ጋር የሚመዘገብ ተጨማሪ መረጃ።',
  submitLabel: 'ምስክር ወረቀት ስጥ',
  submittingLabel: 'በመስጠት ላይ…',
  cancelLabel: 'ተወው',
  shareClassRequired: 'እባክዎ አንድ የአክሲዮን ክፍል ይምረጡ።',
  classesLoadErrorTitle: 'የአክሲዮን ክፍሎችን ማምጣት አልቻልንም',
  classesLoadErrorMessage:
    'የአክሲዮን ክፍሎች ዝርዝር ማግኘት አልቻልንም። እንደገና ይሞክሩ፣ ወይም መስኮቱን ዘግተው በኋላ ይሞክሩ።',
  classesLoadErrorRetryLabel: 'እንደገና ይሞክሩ',
  conflictTitle: 'ይህን ምስክር ወረቀት መስጠት አልቻልንም',
  conflictMessage:
    'ስርዓቱ ግጭት አግኝቷል። የምስክር ወረቀቱን ቁጥር ያረጋግጡና እንደገና ይሞክሩ።',
  networkErrorTitle: 'የኔትወርክ ስህተት',
  networkErrorMessage:
    'አገልጋዩን ማግኘት አልቻልንም። ግንኙነትዎን ያረጋግጡ እንደገና ይሞክሩ።',
  genericErrorTitle: 'የሆነ ችግር ተፈጥሯል',
  genericErrorMessage: 'እባክዎ በአጭር ጊዜ ውስጥ እንደገና ይሞክሩ።',
  requestIdPrefix: 'ማጣቀሻ፦',
};

// =============================================================================
// CertificateCancelDialog
// =============================================================================
export const certificateCancelDialogLabels: CertificateCancelDialogLabels = {
  dialogTitle: 'ምስክር ወረቀት ሰርዝ',
  closeLabel: 'መስኮቱን ዝጋ',
  numberLabel: 'ቁጥር',
  classLabel: 'የአክሲዮን ክፍል',
  statusLabel: 'የአሁኑ ሁኔታ',
  confirmMessage:
    'ይህን ምስክር ወረቀት መሰረዝ የማይመለስ ነው። ወደኋላ መመለስ አይቻልም። ከታች ያለውን ምስክር ወረቀት ያረጋግጡ፣ ከዚያም አማራጭ ምክንያት ይስጡ።',
  reasonLabel: 'ምክንያት',
  reasonHelper:
    'አማራጭ። ከምስክር ወረቀቱ ጋር ለኦዲት ዱካ የሚመዘገብ አጭር ማብራሪያ።',
  submitLabel: 'ምስክር ወረቀት ሰርዝ',
  submittingLabel: 'በመሰረዝ ላይ…',
  dismissLabel: 'ተወው',
  conflictTitle: 'ይህን ምስክር ወረቀት መሰረዝ አልቻልንም',
  conflictMessage:
    'ምስክር ወረቀቱ ቀድሞውኑ ተሰርዞ ወይም ተተክቶ ሊሆን ይችላል። አድስና እንደገና ይሞክሩ።',
  networkErrorTitle: 'የኔትወርክ ስህተት',
  networkErrorMessage:
    'አገልጋዩን ማግኘት አልቻልንም። ግንኙነትዎን ያረጋግጡ እንደገና ይሞክሩ።',
  genericErrorTitle: 'የሆነ ችግር ተፈጥሯል',
  genericErrorMessage: 'እባክዎ በአጭር ጊዜ ውስጥ እንደገና ይሞክሩ።',
  requestIdPrefix: 'ማጣቀሻ፦',
};

// =============================================================================
// HoldingEntryForm
// =============================================================================
export const holdingEntryFormLabels: HoldingEntryFormLabels = {
  dialogTitle: 'የይዞታ ግቤት ይመዝግቡ',
  closeLabel: 'መስኮቱን ዝጋ',
  shareClassLabel: 'የአክሲዮን ክፍል',
  shareClassPlaceholder: 'አንድ ክፍል ይምረጡ…',
  entryTypeLabel: 'የግቤት ዓይነት',
  entryTypeSubscription: 'ምዝገባ',
  entryTypeTransferIn: 'የዝውውር ግቤት',
  entryTypeTransferOut: 'የዝውውር ውጤት',
  entryTypeAllocation: 'ምደባ',
  entryTypeAdjustment: 'ማስተካከያ',
  directionLabel: 'አቅጣጫ',
  directionIn: 'ጭማሪ',
  directionOut: 'ቅናሽ',
  directionAutoHelper: 'በግቤት ዓይነት ይወሰናል።',
  directionManualHelper:
    'ይዞታው እንዲጨምር ወይም እንዲቀንስ ይምረጡ።',
  quantityLabel: 'ብዛት',
  quantityHelper: 'ሙሉ የአክሲዮን ብዛት። ክፍልፋይ አክሲዮኖች አይፈቀዱም።',
  descriptionLabel: 'መግለጫ',
  descriptionHelper:
    'አማራጭ። ከግቤቱ ጋር የሚመዘገብ ተጨማሪ አውድ።',
  submitLabel: 'ግቤት ይመዝግቡ',
  submittingLabel: 'በመመዝገብ ላይ…',
  cancelLabel: 'ተወው',
  shareClassRequired: 'እባክዎ አንድ የአክሲዮን ክፍል ይምረጡ።',
  quantityRequired: 'ብዛት ያስፈልጋል።',
  quantityMustBePositiveInteger:
    'ብዛቱ አወንታዊ ሙሉ ቁጥር መሆን አለበት።',
  classesLoadErrorTitle: 'የአክሲዮን ክፍሎችን ማምጣት አልቻልንም',
  classesLoadErrorMessage:
    'የአክሲዮን ክፍሎች ዝርዝር ማግኘት አልቻልንም። እንደገና ይሞክሩ፣ ወይም መስኮቱን ዘግተው በኋላ ይሞክሩ።',
  classesLoadErrorRetryLabel: 'እንደገና ይሞክሩ',
  conflictTitle: 'ይህን ግቤት መመዝገብ አልቻልንም',
  conflictMessage:
    'ስርዓቱ ግጭት አግኝቷል። ባለአክሲዮኑን አድስና እንደገና ይሞክሩ።',
  networkErrorTitle: 'የኔትወርክ ስህተት',
  networkErrorMessage:
    'አገልጋዩን ማግኘት አልቻልንም። ግንኙነትዎን ያረጋግጡ እንደገና ይሞክሩ።',
  genericErrorTitle: 'የሆነ ችግር ተፈጥሯል',
  genericErrorMessage: 'እባክዎ በአጭር ጊዜ ውስጥ እንደገና ይሞክሩ።',
  requestIdPrefix: 'ማጣቀሻ፦',
};