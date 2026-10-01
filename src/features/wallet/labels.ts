/*
 * =============================================================================
 * MASES Phase 2 UI — Wallet Feature Labels (Amharic)
 * =============================================================================
 *
 * File:      mase_app/src/features/wallet/labels.ts
 * Layer:     Features (Wallet domain)
 * Version:   1.1.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §9 (Localization)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
 *            Wallet Domain Step 7 v1.1.0 §A.1.1 (Permission slugs)
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The Wallet domain's user-facing strings, in Amharic. Consumed by the
 * Wallet feature's pages and dialogs once they are delivered.
 *
 * This file lands first, per the pattern established by the launcher
 * track (L-1, L-3, A-1 through A-4) and the Amharic-first fix (P-1
 * through P-3). The pages that consume these labels land in the units
 * that follow (WF-6 onward).
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery.
 *
 * 1.1.0  — shared status and payment-method labels:
 *          · Added five status labels to WalletSharedLabels so that
 *            consumers rendering a boolean status or a two-state
 *            filter can read the strings from the shared interface
 *            rather than hardcoding them in the component's template:
 *              - statusActiveLabel
 *              - statusInactiveLabel
 *              - filterAllLabel
 *              - obligationSettledLabel
 *              - obligationUnsettledLabel
 *          · Extracted the four payment-method labels (methodCash,
 *            methodBankTransfer, methodCheque, methodOther) from
 *            WalletPaymentFormLabels into WalletSharedLabels so that
 *            consumers rendering a payment's method — such as
 *            WalletDetailView's allocation-payment cell — can map
 *            the wire value to the localized label without importing
 *            the payment-form interface.
 *          · No existing label value changed. WalletPaymentFormLabels
 *            and its values object continue to expose the four
 *            method labels — now via interface inheritance and the
 *            existing `...shared` spread, respectively.
 *
 * -----------------------------------------------------------------------------
 * Interfaces are declared here
 * -----------------------------------------------------------------------------
 * Unlike features/files/labels.ts and features/shareholders/labels.ts —
 * where the interfaces live in the .vue files that consume them — this
 * file declares its own interfaces. The reason is delivery order: this
 * file lands before any of its consumers exist. When the pages land,
 * the interfaces may be relocated to the .vue files in a coordinated
 * CR; until then, declaring them here gives the interface and its
 * values a single home.
 *
 * This mirrors the pattern features/portal/labels.ts used when the
 * portal pages did not yet exist.
 *
 * -----------------------------------------------------------------------------
 * Vocabulary — anchored in P-2
 * -----------------------------------------------------------------------------
 * Every domain noun and verb in this file matches the Wallet permission
 * labels delivered in Unit P-2. The permission names an administrator
 * reads when configuring a role and the labels a user reads when using
 * the feature are the same vocabulary:
 *
 *     Wallet       → የገንዘብ ማስቀመጫ
 *     Obligation   → ግዴታ
 *     Payment      → ክፍያ
 *     Allocation   → ምደባ
 *     Statement    → መግለጫ
 *     Balance      → ቀሪ ሂሳብ
 *     Adjust       → ማስተካከል
 *     Open         → መክፈት
 *     Record       → መመዝገብ
 *     Reverse      → መመለስ
 *
 * New terms introduced by this file — owner, amount, due date, reason,
 * payment method, debit, credit, opening/closing balance — are chosen
 * to match the register the rest of the platform uses. A full list of
 * the choices, with rationale, is in the WF-1 delivery that introduced
 * them.
 *
 * -----------------------------------------------------------------------------
 * Shared status and payment-method labels (1.1.0)
 * -----------------------------------------------------------------------------
 * Two categories of label that were previously either hardcoded in a
 * consuming component's template or declared only on the form that
 * first introduced them are now carried by WalletSharedLabels:
 *
 *   1. Status labels — `statusActiveLabel`, `statusInactiveLabel`,
 *      `obligationSettledLabel`, `obligationUnsettledLabel`. These
 *      render a boolean field (`is_active`, `is_settled`) as a
 *      visible string. They are shared because the same boolean is
 *      rendered by two independent consumers (WalletListView's status
 *      chip, WalletDetailView's balance-list status row and
 *      obligations-table status cell) and the strings must agree.

 *   2. The "all" filter label — `filterAllLabel`. The WalletListView
 *      filter select has three options: all, active, inactive. The
 *      two status options reuse the status labels above; the "all"
 *      option is its own string.
 *
 *   3. Payment-method labels — `methodCash`, `methodBankTransfer`,
 *      `methodCheque`, `methodOther`. These map a `WalletPaymentMethod`
 *      wire value ('cash' | 'bank_transfer' | 'cheque' | 'other') to
 *      its localized display string. They were originally declared
 *      only on WalletPaymentFormLabels (the payment-record form's
 *      select options). WalletDetailView's allocation-payment cell
 *      needs the same mapping to render the method label instead of
 *      the raw wire value, but the cell does not import the payment
 *      form's label interface. Moving the four strings to
 *      WalletSharedLabels makes them available to every consumer.
 *
 * Consumers that already read a moved field by name continue to work:
 * WalletPaymentFormLabels extends WalletSharedLabels, so `labels.methodCash`
 * is still resolvable on any object typed `WalletPaymentFormLabels`.
 * The `walletPaymentFormLabels` values object still satisfies the
 * interface because the `...shared` spread carries the four values
 * from the shared constant.
 *
 * -----------------------------------------------------------------------------
 * Native-speaker review needed
 * -----------------------------------------------------------------------------
 * The Wallet domain introduces several terms that have not appeared in
 * earlier label files. The most likely review candidates are listed in
 * the delivery notes; none block delivery.
 *
 * The five status labels added in 1.1.0 — active / inactive / all /
 * settled / unsettled — match the register already used by the
 * Workspace's other status surfaces. A reviewer's decision on the
 * vocabulary applies here.
 *
 * -----------------------------------------------------------------------------
 * Shared labels
 * -----------------------------------------------------------------------------
 * `WalletSharedLabels` carries the loading/error/retry states, the
 * four error-banner categories every Wallet surface may render, the
 * five status strings introduced in 1.1.0, and the four payment-method
 * labels moved from the payment form in 1.1.0. Each page's interface
 * extends it, and each page's values object spreads the shared
 * constant. Adding a shared label is a one-line change here plus a
 * rebuild — no page edit.
 * =============================================================================
 */

// =============================================================================
// Shared labels
// =============================================================================

/**
 * Labels every Wallet surface shares:
 *   - the four page-level states (loading, error, retry);
 *   - the four error-banner categories the domain's seeders' payloads
 *     produce (conflict, network, generic, request-id);
 *   - the five status strings that render a boolean or a filter value
 *     as a visible label (active, inactive, all, settled, unsettled);
 *   - the four payment-method labels that map a WalletPaymentMethod
 *     wire value to its localized display string.
 *
 * See the file header comment §"Shared status and payment-method
 * labels (1.1.0)" for the reasoning on the latter two groups.
 */
export interface WalletSharedLabels {
  /** Shown while a page's primary fetch is in flight. */
  readonly loadingMessage: string;

  /** Shown when a page's primary fetch fails for a non-identity reason. */
  readonly errorMessage: string;

  /** Retry button label for the error state. */
  readonly errorRetryLabel: string;

  /** Title of the conflict-error banner. */
  readonly conflictTitle: string;

  /** Message of the conflict-error banner. */
  readonly conflictMessage: string;

  /** Title of the network-error banner. */
  readonly networkErrorTitle: string;

  /** Message of the network-error banner. */
  readonly networkErrorMessage: string;

  /** Title of the generic-error banner. */
  readonly genericErrorTitle: string;

  /** Message of the generic-error banner. */
  readonly genericErrorMessage: string;

  /** Prefix shown before a request-id reference. */
  readonly requestIdPrefix: string;

  // ---------------------------------------------------------------------------
  // Status strings (1.1.0)
  // ---------------------------------------------------------------------------

  /**
   * Rendered when a boolean field is true.
   *
   * Used by:
   *   - WalletListView's status chip (wallet.is_active).
   *   - WalletDetailView's balance-list status row (wallet.is_active).
   *   - The active option in WalletListView's filter select.
   */
  readonly statusActiveLabel: string;

  /**
   * Rendered when a boolean field is false.
   *
   * Used by the same three consumers as statusActiveLabel.
   */
  readonly statusInactiveLabel: string;

  /**
   * The "all" option in the WalletListView filter select. Distinct from
   * statusActiveLabel and statusInactiveLabel, which are the two
   * substantive filter options.
   */
  readonly filterAllLabel: string;

  /**
   * Rendered when an obligation's `is_settled` is true.
   *
   * Used by WalletDetailView's obligations-table status cell.
   */
  readonly obligationSettledLabel: string;

  /**
   * Rendered when an obligation's `is_settled` is false.
   *
   * Used by WalletDetailView's obligations-table status cell.
   */
  readonly obligationUnsettledLabel: string;

  // ---------------------------------------------------------------------------
  // Payment-method labels (1.1.0) — moved from WalletPaymentFormLabels
  // ---------------------------------------------------------------------------

  /**
   * The localized label for the 'cash' WalletPaymentMethod wire value.
   *
   * Consumed by:
   *   - WalletPaymentForm's method select options.
   *   - WalletDetailView's allocation-payment cell.
   *   - WalletAllocationReverseDialog's payment summary row.
   */
  readonly methodCash: string;

  /**
   * The localized label for the 'bank_transfer' WalletPaymentMethod
   * wire value.
   */
  readonly methodBankTransfer: string;

  /**
   * The localized label for the 'cheque' WalletPaymentMethod wire value.
   */
  readonly methodCheque: string;

  /**
   * The localized label for the 'other' WalletPaymentMethod wire value.
   */
  readonly methodOther: string;
}

/**
 * The shared values. Spread into each page's values object.
 */
const shared: WalletSharedLabels = {
  loadingMessage: 'በመጫን ላይ…',
  errorMessage: 'ይህን መረጃ ማምጣት አልቻልንም።',
  errorRetryLabel: 'እንደገና ይሞክሩ',
  conflictTitle: 'ግጭት ተፈጥሯል',
  conflictMessage:
    'የገንዘብ ማስቀመጫውን መረጃ ያረጋግጡና እንደገና ይሞክሩ።',
  networkErrorTitle: 'የኔትወርክ ስህተት',
  networkErrorMessage:
    'አገልጋዩን ማግኘት አልቻልንም። ግንኙነትዎን ያረጋግጡ እንደገና ይሞክሩ።',
  genericErrorTitle: 'የሆነ ችግር ተፈጥሯል',
  genericErrorMessage: 'እባክዎ በአጭር ጊዜ ውስጥ እንደገና ይሞክሩ።',
  requestIdPrefix: 'ማጣቀሻ፦',

  statusActiveLabel: 'ንቁ',
  statusInactiveLabel: 'ንቁ ያልሆነ',
  filterAllLabel: 'ሁሉም',
  obligationSettledLabel: 'የተከፈለ',
  obligationUnsettledLabel: 'ያልተከፈለ',

  methodCash: 'ጥሬ ገንዘብ',
  methodBankTransfer: 'የባንክ ዝውውር',
  methodCheque: 'ቼክ',
  methodOther: 'ሌላ',
};

// =============================================================================
// WalletListView — the /wallets page
// =============================================================================

export interface WalletListViewLabels extends WalletSharedLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  readonly openWalletLabel: string;

  readonly searchPlaceholder: string;
  readonly searchAriaLabel: string;

  readonly columnOwner: string;
  readonly columnBalance: string;
  readonly columnCurrency: string;
  readonly columnStatus: string;
  readonly columnCreated: string;
  readonly columnActions: string;

  readonly rowActionsAriaLabel: string;
  readonly actionView: string;
  readonly actionStatement: string;

  readonly emptyTitle: string;
  readonly emptyDescription: string;

  readonly paginationAriaLabel: string;
  readonly paginationPrevLabel: string;
  readonly paginationNextLabel: string;
}

export const walletListViewLabels: WalletListViewLabels = {
  ...shared,

  pageTitle: 'የገንዘብ ማስቀመጫዎች',
  pageDescription: 'የአሁኑ ተቋም የገንዘብ ማስቀመጫዎች።',

  openWalletLabel: 'አዲስ የገንዘብ ማስቀመጫ',

  searchPlaceholder: 'በባለቤት ስም ይፈልጉ…',
  searchAriaLabel: 'የገንዘብ ማስቀመጫዎችን ይፈልጉ',

  columnOwner: 'ባለቤት',
  columnBalance: 'ቀሪ ሂሳብ',
  columnCurrency: 'ገንዘብ',
  columnStatus: 'ሁኔታ',
  columnCreated: 'የተፈጠረበት',
  columnActions: 'ተግባራት',

  rowActionsAriaLabel: 'የረድፍ ተግባራት',
  actionView: 'ይመልከቱ',
  actionStatement: 'መግለጫ',

  emptyTitle: 'ምንም የገንዘብ ማስቀመጫዎች የሉም',
  emptyDescription:
    'የመጀመሪያውን የገንዘብ ማስቀመጫ ይክፈቱ፣ ወይም ፍለጋዎን ያስተካክሉ።',

  paginationAriaLabel: 'የገንዘብ ማስቀመጫዎች ዝርዝር ገጽ አሰሳ',
  paginationPrevLabel: 'ቀዳሚ',
  paginationNextLabel: 'ቀጣይ',
};

// =============================================================================
// WalletDetailView — the /wallets/:id page
// =============================================================================

export interface WalletDetailViewLabels extends WalletSharedLabels {
  readonly pageDescription: string;

  readonly notFoundTitle: string;
  readonly notFoundDescription: string;

  /* Balance card */
  readonly balanceSectionTitle: string;
  readonly balanceLabel: string;
  readonly ownerLabel: string;
  readonly currencyLabel: string;
  readonly statusLabel: string;
  readonly createdLabel: string;
  readonly updatedLabel: string;

  /* Header actions */
  readonly adjustLabel: string;
  readonly statementLabel: string;

  /* Obligations section */
  readonly obligationsSectionTitle: string;
  readonly obligationsEmpty: string;
  readonly obligationsNewLabel: string;
  readonly obligationsColumnDescription: string;
  readonly obligationsColumnAmount: string;
  readonly obligationsColumnDueDate: string;
  readonly obligationsColumnStatus: string;

  /* Payments section */
  readonly paymentsSectionTitle: string;
  readonly paymentsEmpty: string;
  readonly paymentsNewLabel: string;
  readonly paymentsColumnMethod: string;
  readonly paymentsColumnAmount: string;
  readonly paymentsColumnReference: string;
  readonly paymentsColumnDate: string;

  /* Allocations section */
  readonly allocationsSectionTitle: string;
  readonly allocationsEmpty: string;
  readonly allocationsNewLabel: string;
  readonly allocationsColumnPayment: string;
  readonly allocationsColumnObligation: string;
  readonly allocationsColumnAmount: string;
  readonly allocationsColumnDate: string;
  readonly allocationsColumnActions: string;
  readonly allocationsRowActionsAriaLabel: string;
  readonly allocationsActionReverse: string;

  /* Entries ledger */
  readonly entriesSectionTitle: string;
  readonly entriesEmpty: string;
  readonly entriesColumnDate: string;
  readonly entriesColumnDescription: string;
  readonly entriesColumnDebit: string;
  readonly entriesColumnCredit: string;
  readonly entriesColumnBalance: string;
}

export const walletDetailViewLabels: WalletDetailViewLabels = {
  ...shared,

  pageDescription:
    'የገንዘብ ማስቀመጫው ቀሪ ሂሳብ፣ ግዴታዎች፣ ክፍያዎችና ምደባዎች።',

  notFoundTitle: 'የገንዘብ ማስቀመጫው አልተገኘም',
  notFoundDescription:
    'የገንዘብ ማስቀመጫው ተወግዶ ሊሆን ይችላል፣ ወይም የሌላ ተቋም ሊሆን ይችላል።',

  balanceSectionTitle: 'ቀሪ ሂሳብ',
  balanceLabel: 'የአሁኑ ቀሪ ሂሳብ',
  ownerLabel: 'ባለቤት',
  currencyLabel: 'ገንዘብ',
  statusLabel: 'ሁኔታ',
  createdLabel: 'የተፈጠረበት',
  updatedLabel: 'መጨረሻ የተሻሻለበት',

  adjustLabel: 'ቀሪ ሂሳብ አስተካክል',
  statementLabel: 'መግለጫ ይመልከቱ',

  obligationsSectionTitle: 'ግዴታዎች',
  obligationsEmpty: 'ምንም ግዴታዎች የሉም።',
  obligationsNewLabel: 'ግዴታ ይመዝግቡ',
  obligationsColumnDescription: 'መግለጫ',
  obligationsColumnAmount: 'መጠን',
  obligationsColumnDueDate: 'የመክፈያ ቀን',
  obligationsColumnStatus: 'ሁኔታ',

  paymentsSectionTitle: 'ክፍያዎች',
  paymentsEmpty: 'ምንም ክፍያዎች የሉም።',
  paymentsNewLabel: 'ክፍያ ይመዝግቡ',
  paymentsColumnMethod: 'የክፍያ ዘዴ',
  paymentsColumnAmount: 'መጠን',
  paymentsColumnReference: 'ማጣቀሻ',
  paymentsColumnDate: 'ቀን',

  allocationsSectionTitle: 'ምደባዎች',
  allocationsEmpty: 'ምንም ምደባዎች የሉም።',
  allocationsNewLabel: 'ምደባ ይመዝግቡ',
  allocationsColumnPayment: 'ክፍያ',
  allocationsColumnObligation: 'ግዴታ',
  allocationsColumnAmount: 'መጠን',
  allocationsColumnDate: 'ቀን',
  allocationsColumnActions: 'ተግባራት',
  allocationsRowActionsAriaLabel: 'የምደባ ተግባራት',
  allocationsActionReverse: 'ምደባውን መልስ',

  entriesSectionTitle: 'የገንዘብ እንቅስቃሴ',
  entriesEmpty: 'ምንም የገንዘብ እንቅስቃሴ የለም።',
  entriesColumnDate: 'ቀን',
  entriesColumnDescription: 'መግለጫ',
  entriesColumnDebit: 'ወጪ',
  entriesColumnCredit: 'ገቢ',
  entriesColumnBalance: 'ቀሪ ሂሳብ',
};

// =============================================================================
// WalletOpenForm — the "open a new wallet" dialog
// =============================================================================

export interface WalletOpenFormLabels extends WalletSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;

  readonly shareholderLabel: string;
  readonly shareholderPlaceholder: string;
  readonly currencyLabel: string;
  readonly currencyPlaceholder: string;
  readonly currencyHelper: string;

  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;

  readonly shareholderRequired: string;
  readonly currencyRequired: string;

  readonly shareholdersLoadErrorTitle: string;
  readonly shareholdersLoadErrorMessage: string;
  readonly loadErrorRetryLabel: string;
}

export const walletOpenFormLabels: WalletOpenFormLabels = {
  ...shared,

  dialogTitle: 'አዲስ የገንዘብ ማስቀመጫ ይክፈቱ',
  closeLabel: 'መስኮቱን ዝጋ',

  shareholderLabel: 'ባለአክሲዮን',
  shareholderPlaceholder: 'ባለአክሲዮን ይምረጡ…',
  currencyLabel: 'ገንዘብ',
  currencyPlaceholder: 'የገንዘብ ዓይነት ይምረጡ…',
  currencyHelper: 'የገንዘብ ማስቀመጫው የገንዘብ ዓይነት።',

  submitLabel: 'የገንዘብ ማስቀመጫ ክፈት',
  submittingLabel: 'በመክፈት ላይ…',
  cancelLabel: 'ተወው',

  shareholderRequired: 'እባክዎ አንድ ባለአክሲዮን ይምረጡ።',
  currencyRequired: 'እባክዎ የገንዘብ ዓይነት ይምረጡ።',

  shareholdersLoadErrorTitle: 'ባለአክሲዮኖችን ማምጣት አልቻልንም',
  shareholdersLoadErrorMessage:
    'የባለአክሲዮኖች ዝርዝር ማግኘት አልቻልንም። እንደገና ይሞክሩ፣ ወይም መስኮቱን ዘግተው በኋላ ይሞክሩ።',
  loadErrorRetryLabel: 'እንደገና ይሞክሩ',
};

// =============================================================================
// WalletAdjustForm — the privileged balance-adjustment dialog
// =============================================================================

export interface WalletAdjustFormLabels extends WalletSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;

  readonly amountLabel: string;
  readonly amountHelper: string;
  readonly directionLabel: string;
  readonly directionCredit: string;
  readonly directionDebit: string;
  readonly reasonLabel: string;
  readonly reasonHelper: string;

  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;

  readonly amountRequired: string;
  readonly amountMustBePositive: string;
}

export const walletAdjustFormLabels: WalletAdjustFormLabels = {
  ...shared,

  dialogTitle: 'ቀሪ ሂሳብ አስተካክል',
  closeLabel: 'መስኮቱን ዝጋ',

  amountLabel: 'መጠን',
  amountHelper: 'የማስተካከያው መጠን። አዎንታዊ ቁጥር ብቻ።',
  directionLabel: 'አቅጣጫ',
  directionCredit: 'ጭማሪ',
  directionDebit: 'ቅናሽ',
  reasonLabel: 'ምክንያት',
  reasonHelper:
    'አማራጭ። ከማስተካከያው ጋር ለኦዲት ዱካ የሚመዘገብ አጭር ማብራሪያ።',

  submitLabel: 'አስተካክል',
  submittingLabel: 'በማስተካከል ላይ…',
  cancelLabel: 'ተወው',

  amountRequired: 'መጠን ያስፈልጋል።',
  amountMustBePositive: 'መጠኑ አዎንታዊ ቁጥር መሆን አለበት።',
};

// =============================================================================
// WalletObligationForm — the "record an obligation" dialog
// =============================================================================

export interface WalletObligationFormLabels extends WalletSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;

  readonly descriptionLabel: string;
  readonly descriptionPlaceholder: string;
  readonly amountLabel: string;
  readonly dueDateLabel: string;
  readonly dueDateHelper: string;

  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;

  readonly descriptionRequired: string;
  readonly amountRequired: string;
  readonly amountMustBePositive: string;
}

export const walletObligationFormLabels: WalletObligationFormLabels = {
  ...shared,

  dialogTitle: 'ግዴታ ይመዝግቡ',
  closeLabel: 'መስኮቱን ዝጋ',

  descriptionLabel: 'መግለጫ',
  descriptionPlaceholder: 'የግዴታው አጭር መግለጫ',
  amountLabel: 'መጠን',
  dueDateLabel: 'የመክፈያ ቀን',
  dueDateHelper: 'አማራጭ። ግዴታው የሚከፈልበት ቀን።',

  submitLabel: 'ግዴታ ይመዝግቡ',
  submittingLabel: 'በመመዝገብ ላይ…',
  cancelLabel: 'ተወው',

  descriptionRequired: 'መግለጫ ያስፈልጋል።',
  amountRequired: 'መጠን ያስፈልጋል።',
  amountMustBePositive: 'መጠኑ አዎንታዊ ቁጥር መሆን አለበት።',
};

// =============================================================================
// WalletPaymentForm — the "record a payment" dialog
// =============================================================================

export interface WalletPaymentFormLabels extends WalletSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;

  readonly amountLabel: string;
  readonly methodLabel: string;
  readonly methodPlaceholder: string;
  /*
   * The four method* option labels (methodCash, methodBankTransfer,
   * methodCheque, methodOther) moved to WalletSharedLabels in 1.1.0.
   * They remain accessible on this interface via inheritance, and on
   * `walletPaymentFormLabels` via the `...shared` spread below.
   */
  readonly referenceLabel: string;
  readonly referenceHelper: string;
  readonly occurredAtLabel: string;
  readonly occurredAtHelper: string;

  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;

  readonly amountRequired: string;
  readonly amountMustBePositive: string;
  readonly methodRequired: string;
}

export const walletPaymentFormLabels: WalletPaymentFormLabels = {
  ...shared,

  dialogTitle: 'ክፍያ ይመዝግቡ',
  closeLabel: 'መስኮቱን ዝጋ',

  amountLabel: 'መጠን',
  methodLabel: 'የክፍያ ዘዴ',
  methodPlaceholder: 'የክፍያ ዘዴ ይምረጡ…',
  /*
   * The four method* values (methodCash, methodBankTransfer,
   * methodCheque, methodOther) are provided by the `...shared`
   * spread above. They are not repeated here — see the file header
   * comment §"Shared status and payment-method labels (1.1.0)".
   */
  referenceLabel: 'ማጣቀሻ',
  referenceHelper:
    'አማራጭ። የባንክ ማጣቀሻ ቁጥር ወይም ሌላ ማረጋገጫ።',
  occurredAtLabel: 'የተከፈለበት ቀን',
  occurredAtHelper: 'አማራጭ። ካልተሰጠ የአሁኑ ጊዜ ይወሰዳል።',

  submitLabel: 'ክፍያ ይመዝግቡ',
  submittingLabel: 'በመመዝገብ ላይ…',
  cancelLabel: 'ተወው',

  amountRequired: 'መጠን ያስፈልጋል።',
  amountMustBePositive: 'መጠኑ አዎንታዊ ቁጥር መሆን አለበት።',
  methodRequired: 'የክፍያ ዘዴ ያስፈልጋል።',
};

// =============================================================================
// WalletAllocationForm — the "record an allocation" dialog
// =============================================================================

export interface WalletAllocationFormLabels extends WalletSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;

  readonly paymentLabel: string;
  readonly paymentPlaceholder: string;
  readonly obligationLabel: string;
  readonly obligationPlaceholder: string;
  readonly amountLabel: string;
  readonly amountHelper: string;

  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;

  readonly paymentRequired: string;
  readonly obligationRequired: string;
  readonly amountRequired: string;
  readonly amountMustBePositive: string;

  readonly paymentsLoadErrorTitle: string;
  readonly paymentsLoadErrorMessage: string;
  readonly obligationsLoadErrorTitle: string;
  readonly obligationsLoadErrorMessage: string;
  readonly loadErrorRetryLabel: string;
}

export const walletAllocationFormLabels: WalletAllocationFormLabels = {
  ...shared,

  dialogTitle: 'ምደባ ይመዝግቡ',
  closeLabel: 'መስኮቱን ዝጋ',

  paymentLabel: 'ክፍያ',
  paymentPlaceholder: 'ክፍያ ይምረጡ…',
  obligationLabel: 'ግዴታ',
  obligationPlaceholder: 'ግዴታ ይምረጡ…',
  amountLabel: 'መጠን',
  amountHelper: 'ከክፍያው ለዚህ ግዴታ የሚመደብ መጠን።',

  submitLabel: 'ምደባ ይመዝግቡ',
  submittingLabel: 'በመመዝገብ ላይ…',
  cancelLabel: 'ተወው',

  paymentRequired: 'ክፍያ ያስፈልጋል።',
  obligationRequired: 'ግዴታ ያስፈልጋል።',
  amountRequired: 'መጠን ያስፈልጋል።',
  amountMustBePositive: 'መጠኑ አዎንታዊ ቁጥር መሆን አለበት።',

  paymentsLoadErrorTitle: 'ክፍያዎችን ማምጣት አልቻልንም',
  paymentsLoadErrorMessage:
    'የክፍያ ዝርዝር ማግኘት አልቻልንም። እንደገና ይሞክሩ።',
  obligationsLoadErrorTitle: 'ግዴታዎችን ማምጣት አልቻልንም',
  obligationsLoadErrorMessage:
    'የግዴታ ዝርዝር ማግኘት አልቻልንም። እንደገና ይሞክሩ።',
  loadErrorRetryLabel: 'እንደገና ይሞክሩ',
};

// =============================================================================
// WalletAllocationReverseDialog — the privileged reverse dialog
// =============================================================================

export interface WalletAllocationReverseDialogLabels extends WalletSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;

  readonly confirmMessage: string;

  readonly paymentLabel: string;
  readonly obligationLabel: string;
  readonly amountLabel: string;
  readonly statusLabel: string;

  readonly reasonLabel: string;
  readonly reasonHelper: string;

  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly dismissLabel: string;
}

export const walletAllocationReverseDialogLabels: WalletAllocationReverseDialogLabels = {
  ...shared,

  dialogTitle: 'ምደባውን መልስ',
  closeLabel: 'መስኮቱን ዝጋ',

  confirmMessage:
    'ይህን ምደባ መመለስ የማይመለስ ነው። ወደኋላ መመለስ አይቻልም። ከታች ያለውን ምደባ ያረጋግጡ፣ ከዚያም አማራጭ ምክንያት ይስጡ።',

  paymentLabel: 'ክፍያ',
  obligationLabel: 'ግዴታ',
  amountLabel: 'መጠን',
  statusLabel: 'የአሁኑ ሁኔታ',

  reasonLabel: 'ምክንያት',
  reasonHelper:
    'አማራጭ። ከምደባው ጋር ለኦዲት ዱካ የሚመዘገብ አጭር ማብራሪያ።',

  submitLabel: 'ምደባውን መልስ',
  submittingLabel: 'በመመለስ ላይ…',
  dismissLabel: 'ተወው',
};

// =============================================================================
// WalletStatementView — the /wallets/:id/statement page
// =============================================================================

export interface WalletStatementViewLabels extends WalletSharedLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  readonly fromLabel: string;
  readonly toLabel: string;
  readonly filterApplyLabel: string;
  readonly filterClearLabel: string;

  readonly openingBalanceLabel: string;
  readonly closingBalanceLabel: string;
  readonly totalDebitLabel: string;
  readonly totalCreditLabel: string;

  readonly entriesSectionTitle: string;
  readonly entriesEmpty: string;
  readonly entriesColumnDate: string;
  readonly entriesColumnDescription: string;
  readonly entriesColumnDebit: string;
  readonly entriesColumnCredit: string;
  readonly entriesColumnBalance: string;

  readonly notFoundTitle: string;
  readonly notFoundDescription: string;
}

export const walletStatementViewLabels: WalletStatementViewLabels = {
  ...shared,

  pageTitle: 'መግለጫ',
  pageDescription: 'የገንዘብ ማስቀመጫው የጊዜ ወቅት መግለጫ።',

  fromLabel: 'ከ',
  toLabel: 'እስከ',
  filterApplyLabel: 'ተግብር',
  filterClearLabel: 'አጽዳ',

  openingBalanceLabel: 'የመጀመሪያ ቀሪ ሂሳብ',
  closingBalanceLabel: 'የመጨረሻ ቀሪ ሂሳብ',
  totalDebitLabel: 'ጠቅላላ ወጪ',
  totalCreditLabel: 'ጠቅላላ ገቢ',

  entriesSectionTitle: 'የገንዘብ እንቅስቃሴ',
  entriesEmpty: 'በዚህ ጊዜ ወቅት ውስጥ ምንም የገንዘብ እንቅስቃሴ የለም።',
  entriesColumnDate: 'ቀን',
  entriesColumnDescription: 'መግለጫ',
  entriesColumnDebit: 'ወጪ',
  entriesColumnCredit: 'ገቢ',
  entriesColumnBalance: 'ቀሪ ሂሳብ',

  notFoundTitle: 'የገንዘብ ማስቀመጫው አልተገኘም',
  notFoundDescription:
    'የገንዘብ ማስቀመጫው ተወግዶ ሊሆን ይችላል፣ ወይም የሌላ ተቋም ሊሆን ይችላል።',
};