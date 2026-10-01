/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-LW3
 * =============================================================================
 *
 * File:      mase_app/src/features/loans/labels.ts  (AMEND)
 * Unit:      CR-LW3 — Workspace loan sub-resources (labels)
 * Delivery type:  Amendment — eight new interfaces, eight new consts,
 *                 five new fields on LoanDetailViewLabels, file-level
 *                 CR-LW3 change-verification block.
 * Net lines:      +8 interfaces; +8 consts; +5 interface fields on
 *                 LoanDetailViewLabels; +~310 docblock lines.
 *
 * Before (v1.1.0):
 *   The file declared ten interfaces and ten consts: the twelve-status
 *   vocabulary, the shared chrome labels, the list and detail page
 *   labels, and the six lifecycle-dialog label sets. It carried
 *   everything CR-LW1 and CR-LW2 needed. No label set existed for the
 *   loan schedule view, the loan statement view, the repayment dialog,
 *   the two collateral dialogs, or the product catalogue list.
 *
 * After (v1.2.0):
 *   Eight new dialog/view label interfaces and their consts are added:
 *
 *     · LoanScheduleViewLabels         — /loans/:id/schedule
 *     · LoanStatementViewLabels        — /loans/:id/statement
 *     · LoanRepaymentFormLabels        — the repayment dialog
 *     · LoanCollateralFormLabels       — the collateral register dialog
 *     · LoanCollateralReleaseFormLabels — the collateral release dialog
 *     · LoanProductListViewLabels      — /loan-products
 *
 *   Each extends `LoanSharedLabels`, so every view and dialog carries
 *   the shared chrome strings, the four error-banner categories, and
 *   the request-id prefix — the same shape the earlier label sets use.
 *
 *   `LoanDetailViewLabels` gains five new fields:
 *
 *     · `actionRepay`                 — the "Record repayment" button.
 *     · `scheduleLinkLabel`           — a link to the schedule view.
 *     · `statementLinkLabel`          — a link to the statement view.
 *     · `reconciliationLinkLabel`     — reserved for the deferred
 *                                       reconciliation view; declared
 *                                       so the label exists when that
 *                                       view ships.
 *     · `collateralsRegisterLabel`    — the "Register collateral"
 *                                       button in the collaterals
 *                                       section header.
 *
 *   And the collaterals section on the detail page adds thirteen new
 *   fields:
 *
 *     · `collateralsSectionTitle`     — the section card heading.
 *     · `collateralsEmpty`            — the section's empty message.
 *     · `collateralsColumnType`       — table column.
 *     · `collateralsColumnDescription` — table column.
 *     · `collateralsColumnValuation`  — table column.
 *     · `collateralsColumnStatus`     — table column.
 *     · `collateralsColumnActions`    — table column.
 *     · `collateralActionRelease`     — the row action.
 *     · `collateralRowActionsAriaLabel` — the row action's aria-label.
 *     · `collateralTypeExternal`      — the type display for `external`.
 *     · `collateralTypeShareholding`  — the type display for `shareholding`.
 *
 * =============================================================================
 * The reconciliation view is deferred
 * =============================================================================
 * The reconciliation report's composite sections (`loan_projected`,
 * `wallet_linked`, `contractual`, `wallet_payments`, `per_installment`,
 * `divergence`, `provenance`) are declared as `Record<string, unknown>`
 * in `features/loans/api.ts` — their precise shapes are documented on
 * the reconciler service, which the frontend has not read. A view that
 * renders them meaningfully would need typed accessors that a future
 * CR adds after reading the reconciler's `reconcile()` return shape.
 *
 * The `reconciliationLinkLabel` field is declared now so the labels
 * file is complete when that CR lands — the field is inert until the
 * view uses it.
 *
 * =============================================================================
 * Amharic values — origin and review
 * =============================================================================
 * Every value is Amharic, matching the register of the existing labels
 * in this file. The register choices worth noting:
 *
 *   · 'የመክፈያ መርሃግብር' — the schedule view's page title and the
 *     detail view's section title (already declared in CR-LW1). The
 *     two surfaces agree on the string.
 *
 *   · 'መግለጫ' — the statement view's page title, matching the wallet
 *     statement view's identical string.
 *
 *   · 'ዋስትና' — the term for collateral. The plural 'ዋስትናዎች' is the
 *     section heading; the singular is used in the dialog title.
 *
 *   · 'አስለቅ' — the imperative of 'ማስለቀቅ' (to release, as in
 *     discharging a security interest). Distinct from 'አስልፍ' (disburse,
 *     the loan-delivery verb) and 'አጥፋ' (write off).
 *
 *   · 'ውጫዊ' / 'የአክሲዮን ድርሻ' — the two collateral types: external and
 *     shareholding.
 *
 * All new strings are added to the native-speaker review list. The
 * financial and legal register admits more variance than the
 * shareholder vocabulary, and the collateral terms are new.
 *
 * =============================================================================
 * Native-speaker review — new candidates
 * =============================================================================
 * The following strings are added to the review list:
 *
 *   · 'ዋስትና' / 'ዋስትናዎች' (collateral) — the register's standard term for
 *     a security interest. Distinct from 'አስተማኝ' (guarantor) and
 *     'ተጠሪ' (voucher). The register's preference is not recorded in
 *     the codebase; the term is used here on the strength of its
 *     common usage in Ethiopian lending documents.
 *
 *   · 'አስለቅ' (release) — the imperative of 'ማስለቀቅ'. The perfective
 *     'ተለቋል' would be the state form; the imperative is the button
 *     form.
 *
 *   · 'የገቢና ወጪ መግለጫ' (statement of debits and credits) — the
 *     statement view's page description. The shorter 'መግለጫ' is the
 *     page title; the description elaborates.
 *
 *   · 'ማስታረቅ' (reconciliation) — the term for the reconciler's
 *     report. A reviewer may prefer 'እርቅ' (a shorter form) or
 *     'ማስተካከያ' (adjustment). The current form is the register's
 *     conventional verb for account reconciliation.
 *
 * =============================================================================
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-LW2
 * =============================================================================
 *
 * File:      mase_app/src/features/loans/labels.ts  (AMEND)
 * Unit:      CR-LW2 — Workspace loan dialogs (labels)
 * Delivery type:  Amendment — six new dialog-label interfaces, six new
 *                 consts, file-level change-verification block.
 * Net lines:      +6 interfaces; +6 consts; +~135 docblock lines.
 *
 * Before (v1.0.0):
 *   The file declared four interfaces — `LoanStatusLabels`,
 *   `LoanSharedLabels`, `LoanListViewLabels`, `LoanDetailViewLabels` —
 *   and their consts.
 *
 * After (v1.1.0):
 *   Six new dialog-label interfaces and their matching consts are
 *   added:
 *
 *     · LoanApplicationFormLabels      — the "new loan" dialog.
 *     · LoanApproveFormLabels          — the approval dialog.
 *     · LoanRejectFormLabels           — the rejection dialog.
 *     · LoanDisburseFormLabels         — the disbursement dialog.
 *     · LoanRestructureFormLabels      — the restructure dialog.
 *     · LoanWriteOffFormLabels         — the write-off dialog.
 *
 *   Each interface extends `LoanSharedLabels`. Each const spreads
 *   `shared` and adds the dialog-specific fields.
 *
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-LW1
 * =============================================================================
 *
 * File:      mase_app/src/features/loans/labels.ts  (NEW)
 * Unit:      CR-LW1 — Workspace loan views (labels)
 * Delivery type:  New file.
 *
 * After:
 *   A new feature-level labels module at `features/loans/labels.ts`
 *   that declares every label the workspace's loans pages require. It
 *   provides:
 *
 *     · `LoanStatusLabels` — the twelve C4 status display strings.
 *     · `LoanSharedLabels` — the shared chrome labels plus the twelve
 *       status labels.
 *     · `LoanListViewLabels` — the list page's interface.
 *     · `LoanDetailViewLabels` — the detail page's interface.
 *
 *   The twelve status strings moved here from
 *   `features/portal/labels.ts`, which now imports them.
 *
 * Files modified:  this file only (new)
 * =============================================================================
 */

// =============================================================================
// LoanStatusLabels — the twelve C4 status strings
// =============================================================================

/**
 * The twelve LoanStatus display strings.
 *
 * The LoanResource (backend) emits the loan's `status` as the raw C4
 * backing value; it does NOT emit a `status_label`. Every frontend
 * surface that renders a loan status maps the raw value to its
 * localized string through this set of labels.
 *
 * The vocabulary is closed at twelve. A future CR that extends the
 * backend enum extends this interface and its values in the same
 * change.
 *
 * This interface is exported so `features/portal/labels.ts` can extend
 * it without redeclaring the twelve fields.
 */
export interface LoanStatusLabels {
  readonly statusDraft: string;
  readonly statusSubmitted: string;
  readonly statusUnderReview: string;
  readonly statusApproved: string;
  readonly statusRejected: string;
  readonly statusDisbursed: string;
  readonly statusActive: string;
  readonly statusInArrears: string;
  readonly statusRestructured: string;
  readonly statusWrittenOff: string;
  readonly statusSettled: string;
  readonly statusClosed: string;
}

/**
 * The twelve values. Exported so `features/portal/labels.ts` can spread
 * this const into its own page label objects without redeclaring the
 * strings.
 */
export const loanStatusLabels: LoanStatusLabels = {
  statusDraft:        'ረቂቅ',
  statusSubmitted:    'የቀረበ',
  statusUnderReview:  'በግምገማ ላይ',
  statusApproved:     'የጸደቀ',
  statusRejected:     'ውድቅ የሆነ',
  statusDisbursed:    'የተለቀቀ',
  statusActive:       'ንቁ',
  statusInArrears:    'በእዳ ላይ',
  statusRestructured: 'የተስተካከለ',
  statusWrittenOff:   'የተሰረዘ',
  statusSettled:      'የተከፈለ',
  statusClosed:       'ተዘግቷል',
};

// =============================================================================
// LoanSharedLabels — the workspace-wide shared labels
// =============================================================================

/**
 * Labels every workspace loans page shares: the four page-level states,
 * the four error-banner categories, the request-id prefix, the
 * filter-all string, and — inherited from `LoanStatusLabels` — the
 * twelve status strings.
 */
export interface LoanSharedLabels extends LoanStatusLabels {
  readonly loadingMessage: string;
  readonly errorMessage: string;
  readonly errorRetryLabel: string;

  readonly conflictTitle: string;
  readonly conflictMessage: string;
  readonly networkErrorTitle: string;
  readonly networkErrorMessage: string;
  readonly genericErrorTitle: string;
  readonly genericErrorMessage: string;
  readonly requestIdPrefix: string;

  readonly filterAllLabel: string;
}

const shared: LoanSharedLabels = {
  ...loanStatusLabels,

  loadingMessage: 'በመጫን ላይ…',
  errorMessage: 'ይህን መረጃ ማምጣት አልቻልንም።',
  errorRetryLabel: 'እንደገና ይሞክሩ',

  conflictTitle: 'ግጭት ተፈጥሯል',
  conflictMessage:
    'የብድሩን መረጃ ያረጋግጡና እንደገና ይሞክሩ።',
  networkErrorTitle: 'የኔትወርክ ስህተት',
  networkErrorMessage:
    'አገልጋዩን ማግኘት አልቻልንም። ግንኙነትዎን ያረጋግጡ እንደገና ይሞክሩ።',
  genericErrorTitle: 'የሆነ ችግር ተፈጥሯል',
  genericErrorMessage: 'እባክዎ በአጭር ጊዜ ውስጥ እንደገና ይሞክሩ።',
  requestIdPrefix: 'ማጣቀሻ፦',

  filterAllLabel: 'ሁሉም',
};

// =============================================================================
// LoanListViewLabels — the /loans page
// =============================================================================

export interface LoanListViewLabels extends LoanSharedLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  readonly newLoanLabel: string;

  readonly columnLoan: string;
  readonly columnPrincipal: string;
  readonly columnOutstanding: string;
  readonly columnStatus: string;
  readonly columnApplied: string;
  readonly columnActions: string;

  readonly statusFilterLabel: string;
  readonly activeFilterLabel: string;
  readonly activeFilterAll: string;
  readonly activeFilterOnly: string;
  readonly inArrearsFilterLabel: string;
  readonly inArrearsFilterAll: string;
  readonly inArrearsFilterOnly: string;

  readonly rowActionsAriaLabel: string;
  readonly actionView: string;

  readonly emptyTitle: string;
  readonly emptyDescription: string;

  readonly paginationAriaLabel: string;
  readonly paginationPrevLabel: string;
  readonly paginationNextLabel: string;
}

export const loanListViewLabels: LoanListViewLabels = {
  ...shared,

  pageTitle: 'ብድሮች',
  pageDescription: 'የአሁኑ ተቋም ብድሮች።',

  newLoanLabel: 'አዲስ ብድር',

  columnLoan:        'ብድር',
  columnPrincipal:   'ዋና ገንዘብ',
  columnOutstanding: 'ቀሪ ሂሳብ',
  columnStatus:      'ሁኔታ',
  columnApplied:     'የተጠየቀበት',
  columnActions:     'ተግባራት',

  statusFilterLabel:    'የሁኔታ ማጣሪያ',
  activeFilterLabel:    'የንቁነት ማጣሪያ',
  activeFilterAll:      'ሁሉም',
  activeFilterOnly:     'ንቁ ብቻ',
  inArrearsFilterLabel: 'የእዳ ማጣሪያ',
  inArrearsFilterAll:   'ሁሉም',
  inArrearsFilterOnly:  'በእዳ ላይ ያሉ',

  rowActionsAriaLabel: 'የረድፍ ተግባራት',
  actionView:          'ይመልከቱ',

  emptyTitle: 'ምንም ብድሮች የሉም',
  emptyDescription:
    'የመጀመሪያውን ብድር ይፍጠሩ፣ ወይም ማጣሪያዎችን ያስተካክሉ።',

  paginationAriaLabel: 'የብድሮች ዝርዝር ገጽ አሰሳ',
  paginationPrevLabel: 'ቀዳሚ',
  paginationNextLabel: 'ቀጣይ',
};

// =============================================================================
// LoanDetailViewLabels — the /loans/:id page
// =============================================================================

export interface LoanDetailViewLabels extends LoanSharedLabels {
  readonly pageDescription: string;

  readonly notFoundTitle: string;
  readonly notFoundDescription: string;

  readonly loanSectionTitle: string;
  readonly productLabel: string;
  readonly statusLabel: string;
  readonly principalLabel: string;
  readonly termLabel: string;
  readonly outstandingTotalLabel: string;
  readonly purposeLabel: string;
  readonly applicationDateLabel: string;
  readonly decisionDateLabel: string;
  readonly disbursementDateLabel: string;
  readonly maturityDateLabel: string;
  readonly closedAtLabel: string;

  readonly scheduleSectionTitle: string;
  readonly scheduleEmpty: string;
  readonly scheduleColumnNumber: string;
  readonly scheduleColumnDueDate: string;
  readonly scheduleColumnExpected: string;
  readonly scheduleColumnSettled: string;
  readonly scheduleColumnRemaining: string;

  // ---------------------------------------------------------------------------
  // Lifecycle action buttons — CR-LW2.
  // ---------------------------------------------------------------------------
  readonly actionApprove: string;
  readonly actionReject: string;
  readonly actionDisburse: string;
  readonly actionRestructure: string;
  readonly actionWriteOff: string;

  // ---------------------------------------------------------------------------
  // Sub-resource navigation and repayment — CR-LW3.
  //
  // `scheduleLinkLabel` and `statementLinkLabel` are the header buttons
  // that navigate to the two sub-resource views. `reconciliationLinkLabel`
  // is reserved for the deferred reconciliation view (see the CR-LW3
  // change-verification block §"The reconciliation view is deferred").
  // `actionRepay` opens the repayment dialog.
  // ---------------------------------------------------------------------------
  readonly actionRepay: string;
  readonly scheduleLinkLabel: string;
  readonly statementLinkLabel: string;
  readonly reconciliationLinkLabel: string;

  // ---------------------------------------------------------------------------
  // Collaterals section — CR-LW3.
  //
  // A section card rendered below the schedule card, with a table of
  // the loan's collateral records and a per-row release action.
  // ---------------------------------------------------------------------------
  readonly collateralsSectionTitle: string;
  readonly collateralsEmpty: string;
  readonly collateralsRegisterLabel: string;
  readonly collateralsColumnType: string;
  readonly collateralsColumnDescription: string;
  readonly collateralsColumnValuation: string;
  readonly collateralsColumnStatus: string;
  readonly collateralsColumnActions: string;
  readonly collateralActionRelease: string;
  readonly collateralRowActionsAriaLabel: string;
  readonly collateralTypeExternal: string;
  readonly collateralTypeShareholding: string;
  readonly collateralStatusRegistered: string;
  readonly collateralStatusReleased: string;
}

export const loanDetailViewLabels: LoanDetailViewLabels = {
  ...shared,

  pageDescription:
    'የብድሩ ማጠቃለያና የመክፈያ መርሃግብሩ።',

  notFoundTitle: 'ብድሩ አልተገኘም',
  notFoundDescription:
    'ይህ ብድር አልተገኘም ወይም የማየት ፈቃድ የለዎትም።',

  loanSectionTitle:      'የብድር መረጃ',
  productLabel:          'የብድር ዓይነት',
  statusLabel:           'ሁኔታ',
  principalLabel:        'ዋና ገንዘብ',
  termLabel:             'የብድር ጊዜ',
  outstandingTotalLabel: 'ቀሪ ሂሳብ',
  purposeLabel:          'ዓላማ',
  applicationDateLabel:  'የተጠየቀበት',
  decisionDateLabel:     'የተወሰነበት',
  disbursementDateLabel: 'የተለቀቀበት',
  maturityDateLabel:     'የሚያልቅበት',
  closedAtLabel:         'የተዘጋበት',

  scheduleSectionTitle:    'የመክፈያ መርሃግብር',
  scheduleEmpty:           'ምንም የመክፈያ መርሃግብር የለም።',
  scheduleColumnNumber:    'ቁጥር',
  scheduleColumnDueDate:   'የመክፈያ ቀን',
  scheduleColumnExpected:  'የሚከፈል',
  scheduleColumnSettled:   'የተከፈለ',
  scheduleColumnRemaining: 'ቀሪ',

  actionApprove:     'ጸድቅ',
  actionReject:      'ውድቅ አድርግ',
  actionDisburse:    'አስልፍ',
  actionRestructure: 'አስተካክል',
  actionWriteOff:    'አጥፋ',

  actionRepay:               'ክፍያ መዝግብ',
  scheduleLinkLabel:         'የመክፈያ መርሃግብር',
  statementLinkLabel:        'መግለጫ',
  reconciliationLinkLabel:   'ማስታረቅ',

  collateralsSectionTitle:      'ዋስትናዎች',
  collateralsEmpty:             'ምንም ዋስትናዎች የሉም።',
  collateralsRegisterLabel:     'ዋስትና መዝግብ',
  collateralsColumnType:        'ዓይነት',
  collateralsColumnDescription: 'መግለጫ',
  collateralsColumnValuation:   'ዋጋ',
  collateralsColumnStatus:      'ሁኔታ',
  collateralsColumnActions:     'ተግባራት',
  collateralActionRelease:      'አስለቅ',
  collateralRowActionsAriaLabel:'የዋስትና ተግባራት',
  collateralTypeExternal:       'ውጫዊ',
  collateralTypeShareholding:   'የአክሲዮን ድርሻ',
  collateralStatusRegistered:   'የተመዘገበ',
  collateralStatusReleased:     'የተለቀቀ',
};

// =============================================================================
// LoanApplicationFormLabels — the "new loan" dialog (CR-LW2)
// =============================================================================

export interface LoanApplicationFormLabels extends LoanSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;

  readonly borrowerLabel: string;
  readonly borrowerPlaceholder: string;
  readonly productLabel: string;
  readonly productPlaceholder: string;
  readonly principalAmountLabel: string;
  readonly principalAmountHelper: string;
  readonly termMonthsLabel: string;
  readonly termMonthsHelper: string;
  readonly purposeLabel: string;
  readonly purposeHelper: string;
  readonly externalReferenceLabel: string;
  readonly externalReferenceHelper: string;

  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;

  readonly borrowerRequired: string;
  readonly productRequired: string;
  readonly principalAmountRequired: string;
  readonly principalAmountMustBePositive: string;
  readonly principalAmountPrecision: string;
  readonly termMonthsRequired: string;
  readonly termMonthsMustBePositive: string;

  readonly borrowersLoadErrorTitle: string;
  readonly borrowersLoadErrorMessage: string;
  readonly productsLoadErrorTitle: string;
  readonly productsLoadErrorMessage: string;
  readonly loadErrorRetryLabel: string;
}

export const loanApplicationFormLabels: LoanApplicationFormLabels = {
  ...shared,

  dialogTitle: 'አዲስ ብድር',
  closeLabel: 'መስኮቱን ዝጋ',

  borrowerLabel: 'ተበዳሪ',
  borrowerPlaceholder: 'ተበዳሪ ይምረጡ…',

  productLabel: 'የብድር ዓይነት',
  productPlaceholder: 'የብድር ዓይነት ይምረጡ…',

  principalAmountLabel: 'ዋና ገንዘብ',
  principalAmountHelper:
    'የሚበደረው ዋና ገንዘብ። ከፍተኛ የአስርዮሽ ቦታ አራት።',
  termMonthsLabel: 'የብድር ጊዜ (በወራት)',
  termMonthsHelper: 'የብድሩ ጊዜ በወራት ብቻ።',

  purposeLabel: 'ዓላማ',
  purposeHelper: 'አማራጭ። የብድሩ አጭር ማብራሪያ።',
  externalReferenceLabel: 'የውጭ ማጣቀሻ',
  externalReferenceHelper:
    'አማራጭ። የወረቀት ፋይል ቁጥር ወይም ሌላ የውጭ መለያ።',

  submitLabel: 'ብድር ፍጠር',
  submittingLabel: 'በመፍጠር ላይ…',
  cancelLabel: 'ተወው',

  borrowerRequired: 'እባክዎ አንድ ተበዳሪ ይምረጡ።',
  productRequired: 'እባክዎ የብድር ዓይነት ይምረጡ።',
  principalAmountRequired: 'ዋና ገንዘብ ያስፈልጋል።',
  principalAmountMustBePositive:
    'ዋና ገንዘቡ አዎንታዊ ቁጥር መሆን አለበት።',
  principalAmountPrecision:
    'ከአራት የአስርዮሽ ቦታ በላይ መሆን አይችልም።',
  termMonthsRequired: 'የብድር ጊዜ ያስፈልጋል።',
  termMonthsMustBePositive:
    'የብድር ጊዜው አዎንታዊ ቁጥር መሆን አለበት።',

  borrowersLoadErrorTitle: 'ተበዳሪዎችን ማምጣት አልቻልንም',
  borrowersLoadErrorMessage:
    'የተበዳሪዎች ዝርዝር ማግኘት አልቻልንም። እንደገና ይሞክሩ፣ ወይም መስኮቱን ዘግተው በኋላ ይሞክሩ።',
  productsLoadErrorTitle: 'የብድር ዓይነቶችን ማምጣት አልቻልንም',
  productsLoadErrorMessage:
    'የብድር ዓይነቶችን ማግኘት አልቻልንም። እንደገና ይሞክሩ፣ ወይም መስኮቱን ዘግተው በኋላ ይሞክሩ።',
  loadErrorRetryLabel: 'እንደገና ይሞክሩ',
};

// =============================================================================
// LoanApproveFormLabels — the approval dialog (CR-LW2)
// =============================================================================

export interface LoanApproveFormLabels extends LoanSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;
  readonly reasonLabel: string;
  readonly reasonHelper: string;
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;
}

export const loanApproveFormLabels: LoanApproveFormLabels = {
  ...shared,
  dialogTitle: 'ብድሩን ጸድቅ',
  closeLabel: 'መስኮቱን ዝጋ',
  reasonLabel: 'ምክንያት',
  reasonHelper:
    'አማራጭ። ከማጽደቁ ጋር ለኦዲት ዱካ የሚመዘገብ አጭር ማብራሪያ።',
  submitLabel: 'ጸድቅ',
  submittingLabel: 'በማጽደቅ ላይ…',
  cancelLabel: 'ተወው',
};

// =============================================================================
// LoanRejectFormLabels — the rejection dialog (CR-LW2)
// =============================================================================

export interface LoanRejectFormLabels extends LoanSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;
  readonly reasonLabel: string;
  readonly reasonHelper: string;
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;
  readonly reasonRequired: string;
}

export const loanRejectFormLabels: LoanRejectFormLabels = {
  ...shared,
  dialogTitle: 'ብድሩን ውድቅ አድርግ',
  closeLabel: 'መስኮቱን ዝጋ',
  reasonLabel: 'ምክንያት',
  reasonHelper:
    'የማይወገድ። ለምን ውድቅ እንደተደረገ ለማብራራት የሚያገለግል አጭር ማብራሪያ።',
  submitLabel: 'ውድቅ አድርግ',
  submittingLabel: 'ውድቅ በማድረግ ላይ…',
  cancelLabel: 'ተወው',
  reasonRequired: 'ምክንያት ያስፈልጋል።',
};

// =============================================================================
// LoanDisburseFormLabels — the disbursement dialog (CR-LW2)
// =============================================================================

export interface LoanDisburseFormLabels extends LoanSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;
  readonly descriptionLabel: string;
  readonly descriptionHelper: string;
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;
}

export const loanDisburseFormLabels: LoanDisburseFormLabels = {
  ...shared,
  dialogTitle: 'ብድሩን አስልፍ',
  closeLabel: 'መስኮቱን ዝጋ',
  descriptionLabel: 'መግለጫ',
  descriptionHelper:
    'አማራጭ። ካልተሰጠ ለቦርሳው ግዴታ ነባሪ መግለጫ ይወሰዳል።',
  submitLabel: 'አስልፍ',
  submittingLabel: 'በማስለፍ ላይ…',
  cancelLabel: 'ተወው',
};

// =============================================================================
// LoanRestructureFormLabels — the restructure dialog (CR-LW2)
// =============================================================================

export interface LoanRestructureFormLabels extends LoanSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;
  readonly newPrincipalAmountLabel: string;
  readonly newPrincipalAmountHelper: string;
  readonly newTermMonthsLabel: string;
  readonly newTermMonthsHelper: string;
  readonly newPolicyVersionIdLabel: string;
  readonly newPolicyVersionIdHelper: string;
  readonly reasonLabel: string;
  readonly reasonHelper: string;
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;
  readonly newPrincipalAmountRequired: string;
  readonly newPrincipalAmountMustBePositive: string;
  readonly newPrincipalAmountPrecision: string;
  readonly newTermMonthsRequired: string;
  readonly newTermMonthsMustBePositive: string;
  readonly newPolicyVersionIdRequired: string;
  readonly newPolicyVersionIdMustBePositive: string;
  readonly reasonRequired: string;
}

export const loanRestructureFormLabels: LoanRestructureFormLabels = {
  ...shared,

  dialogTitle: 'ብድሩን አስተካክል',
  closeLabel: 'መስኮቱን ዝጋ',

  newPrincipalAmountLabel: 'አዲስ ዋና ገንዘብ',
  newPrincipalAmountHelper:
    'የተስተካከለው ብድር የሚሸከመው ዋና ገንዘብ። ከፍተኛ የአስርዮሽ ቦታ አራት።',
  newTermMonthsLabel: 'አዲስ የብድር ጊዜ (በወራት)',
  newTermMonthsHelper: 'የተስተካከለው ብድር የሚሸከመው ጊዜ።',
  newPolicyVersionIdLabel: 'አዲስ የፖሊሲ ቅጂ መለያ',
  newPolicyVersionIdHelper:
    'የተስተካከለውን ብድር የሚመራው የ loan_product_rules ፖሊሲ ቅጂ መለያ ቁጥር።',
  reasonLabel: 'ምክንያት',
  reasonHelper:
    'የማይወገድ። ለምን እንደተስተካከለ ለማብራራት የሚያገለግል አጭር ማብራሪያ።',

  submitLabel: 'አስተካክል',
  submittingLabel: 'በማስተካከል ላይ…',
  cancelLabel: 'ተወው',

  newPrincipalAmountRequired: 'አዲስ ዋና ገንዘብ ያስፈልጋል።',
  newPrincipalAmountMustBePositive:
    'አዲሱ ዋና ገንዘብ አዎንታዊ ቁጥር መሆን አለበት።',
  newPrincipalAmountPrecision:
    'ከአራት የአስርዮሽ ቦታ በላይ መሆን አይችልም።',
  newTermMonthsRequired: 'አዲስ የብድር ጊዜ ያስፈልጋል።',
  newTermMonthsMustBePositive:
    'አዲሱ የብድር ጊዜ አዎንታዊ ቁጥር መሆን አለበት።',
  newPolicyVersionIdRequired: 'የፖሊሲ ቅጂ መለያ ያስፈልጋል።',
  newPolicyVersionIdMustBePositive:
    'የፖሊሲ ቅጂ መለያው አዎንታዊ ቁጥር መሆን አለበት።',
  reasonRequired: 'ምክንያት ያስፈልጋል።',
};

// =============================================================================
// LoanWriteOffFormLabels — the write-off dialog (CR-LW2)
// =============================================================================

export interface LoanWriteOffFormLabels extends LoanSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;
  readonly confirmMessage: string;
  readonly reasonLabel: string;
  readonly reasonHelper: string;
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly dismissLabel: string;
  readonly reasonRequired: string;
}

export const loanWriteOffFormLabels: LoanWriteOffFormLabels = {
  ...shared,
  dialogTitle: 'ብድሩን አጥፋ',
  closeLabel: 'መስኮቱን ዝጋ',
  confirmMessage:
    'ብድሩን ማጥፋት የማይመለስ ነው። ቀሪው ሂሳብ በሙሉ እንደ ኪሳራ ይመዘገባል። ከታች አማራጭ ምክንያት ይስጡ።',
  reasonLabel: 'ምክንያት',
  reasonHelper:
    'የማይወገድ። ለምን እንደተጣለ ለማብራራት የሚያገለግል አጭር ማብራሪያ።',
  submitLabel: 'አጥፋ',
  submittingLabel: 'በማጥፋት ላይ…',
  dismissLabel: 'ተወው',
  reasonRequired: 'ምክንያት ያስፈልጋል።',
};

// =============================================================================
// LoanScheduleViewLabels — the /loans/:id/schedule page (CR-LW3)
// =============================================================================

/**
 * Labels for the loan schedule view.
 *
 * The view renders:
 *   · a summary card with the loan's schedule-summary columns
 *     (monthly installment, total scheduled interest, total scheduled
 *     repayment, maturity date),
 *   · a schedule table with the loan's installments.
 *
 * The schedule endpoint's resource is a narrow projection over the
 * loan aggregate — it emits the loan's identity and terms plus the
 * installments collection and a totals block. The view renders the
 * terms in a compact summary and the installments as a table.
 */
export interface LoanScheduleViewLabels extends LoanSharedLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  readonly notFoundTitle: string;
  readonly notFoundDescription: string;

  readonly summarySectionTitle: string;
  readonly summaryMonthlyInstallmentLabel: string;
  readonly summaryTotalInterestLabel: string;
  readonly summaryTotalRepaymentLabel: string;
  readonly summaryMaturityDateLabel: string;

  readonly scheduleSectionTitle: string;
  readonly scheduleEmpty: string;
  readonly scheduleColumnNumber: string;
  readonly scheduleColumnDueDate: string;
  readonly scheduleColumnExpected: string;
  readonly scheduleColumnSettled: string;
  readonly scheduleColumnRemaining: string;
  readonly scheduleColumnStatus: string;

  readonly backToLoanLabel: string;
}

export const loanScheduleViewLabels: LoanScheduleViewLabels = {
  ...shared,

  pageTitle: 'የመክፈያ መርሃግብር',
  pageDescription: 'የብድሩ ሙሉ የመክፈያ መርሃግብር።',

  notFoundTitle: 'ብድሩ አልተገኘም',
  notFoundDescription:
    'ይህ ብድር አልተገኘም ወይም የማየት ፈቃድ የለዎትም።',

  summarySectionTitle:                'የመርሃግብር ማጠቃለያ',
  summaryMonthlyInstallmentLabel:     'ወርሃዊ ክፍያ',
  summaryTotalInterestLabel:          'ጠቅላላ ወለድ',
  summaryTotalRepaymentLabel:         'ጠቅላላ ክፍያ',
  summaryMaturityDateLabel:           'የሚያልቅበት ቀን',

  scheduleSectionTitle:      'ክፍያዎች',
  scheduleEmpty:             'ምንም ክፍያዎች የሉም።',
  scheduleColumnNumber:      'ቁጥር',
  scheduleColumnDueDate:     'የመክፈያ ቀን',
  scheduleColumnExpected:    'የሚከፈል',
  scheduleColumnSettled:     'የተከፈለ',
  scheduleColumnRemaining:   'ቀሪ',
  scheduleColumnStatus:      'ሁኔታ',

  backToLoanLabel: 'ወደ ብድሩ ተመለስ',
};

// =============================================================================
// LoanStatementViewLabels — the /loans/:id/statement page (CR-LW3)
// =============================================================================

/**
 * Labels for the loan statement view.
 *
 * The view renders:
 *   · a header summarising the loan's identity,
 *   · a period filter (from / to) matching the wallet statement
 *     view's pattern — but the loan statement endpoint does not accept
 *     period parameters, so this CR does not render a filter. The
 *     labels below are declared for a future CR that adds period
 *     filtering.
 *   · the four totals: opening balance, closing balance, total debit,
 *     total credit.
 *   · the statement lines (movements).
 */
export interface LoanStatementViewLabels extends LoanSharedLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  readonly notFoundTitle: string;
  readonly notFoundDescription: string;

  readonly openingBalanceLabel: string;
  readonly closingBalanceLabel: string;
  readonly totalDebitLabel: string;
  readonly totalCreditLabel: string;

  readonly linesSectionTitle: string;
  readonly linesEmpty: string;
  readonly linesColumnDate: string;
  readonly linesColumnType: string;
  readonly linesColumnDescription: string;
  readonly linesColumnDebit: string;
  readonly linesColumnCredit: string;
  readonly linesColumnBalance: string;

  readonly lineTypeDisbursement: string;
  readonly lineTypeInterestAccrual: string;
  readonly lineTypePenaltyAccrual: string;
  readonly lineTypeRepayment: string;
  readonly lineTypeRestructure: string;
  readonly lineTypeWriteOff: string;
  readonly lineTypeCollateralRelease: string;
  readonly lineTypeStatusChange: string;

  readonly backToLoanLabel: string;
}

export const loanStatementViewLabels: LoanStatementViewLabels = {
  ...shared,

  pageTitle: 'መግለጫ',
  pageDescription: 'የብድሩ የገቢና ወጪ መግለጫ።',

  notFoundTitle: 'ብድሩ አልተገኘም',
  notFoundDescription:
    'ይህ ብድር አልተገኘም ወይም የማየት ፈቃድ የለዎትም።',

  openingBalanceLabel: 'የመጀመሪያ ቀሪ ሂሳብ',
  closingBalanceLabel: 'የመጨረሻ ቀሪ ሂሳብ',
  totalDebitLabel:     'ጠቅላላ ወጪ',
  totalCreditLabel:    'ጠቅላላ ገቢ',

  linesSectionTitle:      'የገንዘብ እንቅስቃሴ',
  linesEmpty:             'ምንም የገንዘብ እንቅስቃሴ የለም።',
  linesColumnDate:        'ቀን',
  linesColumnType:        'ዓይነት',
  linesColumnDescription: 'መግለጫ',
  linesColumnDebit:       'ወጪ',
  linesColumnCredit:      'ገቢ',
  linesColumnBalance:     'ቀሪ ሂሳብ',

  lineTypeDisbursement:      'የተለቀቀ',
  lineTypeInterestAccrual:   'ወለድ',
  lineTypePenaltyAccrual:    'ቅጣት',
  lineTypeRepayment:         'ክፍያ',
  lineTypeRestructure:       'ማስተካከል',
  lineTypeWriteOff:          'የተሰረዘ',
  lineTypeCollateralRelease: 'ዋስትና መልቀቅ',
  lineTypeStatusChange:      'የሁኔታ ለውጥ',

  backToLoanLabel: 'ወደ ብድሩ ተመለስ',
};

// =============================================================================
// LoanRepaymentFormLabels — the repayment dialog (CR-LW3)
// =============================================================================

/**
 * Labels for the loan repayment dialog.
 *
 * The dialog collects the fields `StoreRepaymentRequest` (A.64)
 * accepts: `amount` (required), an ordered list of `allocations`
 * (required, non-empty), and four optional fields (`received_at`,
 * `reference_type`, `reference_id`, `description`).
 *
 * The allocations section is the dialog's distinguishing feature.
 * Each instruction is a `{ obligation_id, amount }` pair. The dialog
 * does not fetch the loan's obligations — that would require an
 * endpoint the Phase 2C surface does not provide. The operator
 * supplies each obligation's id and the amount to allocate to it.
 *
 * The dialog client-side validates that the sum of the instruction
 * amounts equals the top-level amount, mirroring
 * `StoreRepaymentRequest`'s `withValidator()` check.
 */
export interface LoanRepaymentFormLabels extends LoanSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;

  readonly amountLabel: string;
  readonly amountHelper: string;

  readonly receivedAtLabel: string;
  readonly receivedAtHelper: string;
  readonly referenceTypeLabel: string;
  readonly referenceTypeHelper: string;
  readonly referenceIdLabel: string;
  readonly referenceIdHelper: string;
  readonly descriptionLabel: string;
  readonly descriptionHelper: string;

  readonly allocationsSectionTitle: string;
  readonly allocationsSectionHelper: string;
  readonly allocationsEmpty: string;
  readonly allocationObligationIdLabel: string;
  readonly allocationObligationIdPlaceholder: string;
  readonly allocationAmountLabel: string;
  readonly allocationAmountPlaceholder: string;
  readonly allocationAddLabel: string;
  readonly allocationRemoveAriaLabel: string;

  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;

  readonly amountRequired: string;
  readonly amountMustBePositive: string;
  readonly amountPrecision: string;
  readonly allocationsRequired: string;
  readonly allocationObligationIdRequired: string;
  readonly allocationObligationIdMustBePositive: string;
  readonly allocationAmountRequired: string;
  readonly allocationAmountMustBePositive: string;
  readonly allocationsSumMismatch: string;
}

export const loanRepaymentFormLabels: LoanRepaymentFormLabels = {
  ...shared,

  dialogTitle: 'ክፍያ ይመዝግቡ',
  closeLabel: 'መስኮቱን ዝጋ',

  amountLabel: 'የክፍያ መጠን',
  amountHelper:
    'አጠቃላይ የክፍያ መጠን። ከፍተኛ የአስርዮሽ ቦታ አራት።',

  receivedAtLabel: 'የተከፈለበት ቀን',
  receivedAtHelper: 'አማራጭ። ካልተሰጠ የአሁኑ ጊዜ ይወሰዳል።',
  referenceTypeLabel: 'የማጣቀሻ ዓይነት',
  referenceTypeHelper: 'አማራጭ። የውጭ ማጣቀሻ አይነት።',
  referenceIdLabel: 'የማጣቀሻ መለያ',
  referenceIdHelper: 'አማራጭ። የውጭ ማጣቀሻ መለያ ቁጥር።',
  descriptionLabel: 'መግለጫ',
  descriptionHelper: 'አማራጭ። ለክፍያው የሚሰጥ አጭር ማብራሪያ።',

  allocationsSectionTitle: 'የምደባ መመሪያዎች',
  allocationsSectionHelper:
    'የክፍያውን መጠን ለየትኞቹ ግዴታዎች እንደሚመደብ ይወስኑ። የሁሉም ምደባዎች ድምር ከክፍያው መጠን ጋር እኩል መሆን አለበት።',
  allocationsEmpty:
    'እስካሁን ምንም ምደባ አልተጨመረም።',
  allocationObligationIdLabel: 'የግዴታ መለያ',
  allocationObligationIdPlaceholder: 'የግዴታውን መለያ ቁጥር ያስገቡ…',
  allocationAmountLabel: 'የምደባ መጠን',
  allocationAmountPlaceholder: 'ለዚህ ግዴታ የሚመደብ መጠን…',
  allocationAddLabel: 'ምደባ ጨምር',
  allocationRemoveAriaLabel: 'ምደባውን አስወግድ',

  submitLabel: 'ክፍያ ይመዝግቡ',
  submittingLabel: 'በመመዝገብ ላይ…',
  cancelLabel: 'ተወው',

  amountRequired: 'የክፍያ መጠን ያስፈልጋል።',
  amountMustBePositive: 'የክፍያው መጠን አዎንታዊ ቁጥር መሆን አለበት።',
  amountPrecision: 'ከአራት የአስርዮሽ ቦታ በላይ መሆን አይችልም።',
  allocationsRequired: 'ቢያንስ አንድ ምደባ ያስፈልጋል።',
  allocationObligationIdRequired: 'የግዴታ መለያ ያስፈልጋል።',
  allocationObligationIdMustBePositive:
    'የግዴታ መለያው አዎንታዊ ቁጥር መሆን አለበት።',
  allocationAmountRequired: 'የምደባ መጠን ያስፈልጋል።',
  allocationAmountMustBePositive:
    'የምደባው መጠን አዎንታዊ ቁጥር መሆን አለበት።',
  allocationsSumMismatch:
    'የምደባዎቹ ድምር ከአጠቃላይ የክፍያ መጠን ጋር እኩል መሆን አለበት።',
};

// =============================================================================
// LoanCollateralFormLabels — the collateral register dialog (CR-LW3)
// =============================================================================

/**
 * Labels for the collateral register dialog.
 *
 * The dialog collects the fields `StoreCollateralRequest` (A.67)
 * accepts: `collateral_type` (required), `description` (required),
 * and six optional attribute fields whose required-ness depends on the
 * selected type.
 *
 * The per-type conditional rules:
 *
 *   · `external`      — requires the valuation triple
 *     (`valuation_amount`, `valuation_currency`, `valuation_date`);
 *     forbids the pledge linkage (`pledged_shareholding_id`,
 *     `pledged_quantity`).
 *
 *   · `shareholding`  — requires the pledge linkage; permits the
 *     valuation triple but if any part is supplied, all three must be.
 *
 * The dialog mirrors the request's per-type rules client-side and
 * marks the fields' required state dynamically. The server re-validates.
 */
export interface LoanCollateralFormLabels extends LoanSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;

  readonly collateralTypeLabel: string;
  readonly collateralTypeExternal: string;
  readonly collateralTypeShareholding: string;

  readonly descriptionLabel: string;
  readonly descriptionPlaceholder: string;
  readonly externalReferenceLabel: string;
  readonly externalReferenceHelper: string;

  readonly pledgeSectionTitle: string;
  readonly pledgedShareholdingIdLabel: string;
  readonly pledgedShareholdingIdHelper: string;
  readonly pledgedQuantityLabel: string;
  readonly pledgedQuantityHelper: string;

  readonly valuationSectionTitle: string;
  readonly valuationAmountLabel: string;
  readonly valuationAmountHelper: string;
  readonly valuationCurrencyLabel: string;
  readonly valuationCurrencyHelper: string;
  readonly valuationDateLabel: string;
  readonly valuationDateHelper: string;

  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;

  readonly collateralTypeRequired: string;
  readonly descriptionRequired: string;
  readonly pledgedShareholdingIdRequired: string;
  readonly pledgedShareholdingIdMustBePositive: string;
  readonly pledgedQuantityRequired: string;
  readonly pledgedQuantityMustBePositive: string;
  readonly valuationAmountRequired: string;
  readonly valuationAmountMustBePositive: string;
  readonly valuationCurrencyRequired: string;
  readonly valuationCurrencyFormat: string;
  readonly valuationDateRequired: string;
  readonly valuationTripleIncomplete: string;
}

export const loanCollateralFormLabels: LoanCollateralFormLabels = {
  ...shared,

  dialogTitle: 'ዋስትና መዝግብ',
  closeLabel: 'መስኮቱን ዝጋ',

  collateralTypeLabel: 'የዋስትና ዓይነት',
  collateralTypeExternal: 'ውጫዊ',
  collateralTypeShareholding: 'የአክሲዮን ድርሻ',

  descriptionLabel: 'መግለጫ',
  descriptionPlaceholder: 'የዋስትናው አጭር መግለጫ',
  externalReferenceLabel: 'የውጭ ማጣቀሻ',
  externalReferenceHelper:
    'አማራጭ። የውጭ ግምገማ ወይም ምዝገባ ማጣቀሻ።',

  pledgeSectionTitle: 'የብድር ማረጋገጫ ዝርዝር',
  pledgedShareholdingIdLabel: 'የተያዘው አክሲዮን መለያ',
  pledgedShareholdingIdHelper:
    'የተያዘው የአክሲዮን ድርሻ መለያ ቁጥር።',
  pledgedQuantityLabel: 'የተያዘው ብዛት',
  pledgedQuantityHelper:
    'የተያዘው የአክሲዮን ብዛት። ከአራት የአስርዮሽ ቦታ በላይ መሆን አይችልም።',

  valuationSectionTitle: 'የዋጋ ግምት',
  valuationAmountLabel: 'የዋጋ መጠን',
  valuationAmountHelper:
    'የዋስትናው የዋጋ ግምት። ከአራት የአስርዮሽ ቦታ በላይ መሆን አይችልም።',
  valuationCurrencyLabel: 'የዋጋ ገንዘብ',
  valuationCurrencyHelper:
    'የ ISO 4217 ሶስት-ፊደል የገንዘብ ኮድ።',
  valuationDateLabel: 'የዋጋ ግምት ቀን',
  valuationDateHelper: 'የዋጋ ግምቱ የተሰጠበት ቀን።',

  submitLabel: 'ዋስትና መዝግብ',
  submittingLabel: 'በመመዝገብ ላይ…',
  cancelLabel: 'ተወው',

  collateralTypeRequired: 'የዋስትና ዓይነት ያስፈልጋል።',
  descriptionRequired: 'መግለጫ ያስፈልጋል።',
  pledgedShareholdingIdRequired:
    'ለዚህ ዓይነት የተያዘው አክሲዮን መለያ ያስፈልጋል።',
  pledgedShareholdingIdMustBePositive:
    'የተያዘው አክሲዮን መለያ አዎንታዊ ቁጥር መሆን አለበት።',
  pledgedQuantityRequired:
    'ለዚህ ዓይነት የተያዘው ብዛት ያስፈልጋል።',
  pledgedQuantityMustBePositive:
    'የተያዘው ብዛት አዎንታዊ ቁጥር መሆን አለበት።',
  valuationAmountRequired:
    'ለዚህ ዓይነት የዋጋ መጠን ያስፈልጋል።',
  valuationAmountMustBePositive:
    'የዋጋው መጠን አዎንታዊ ቁጥር መሆን አለበት።',
  valuationCurrencyRequired:
    'ለዚህ ዓይነት የዋጋ ገንዘብ ያስፈልጋል።',
  valuationCurrencyFormat:
    'የገንዘብ ኮዱ ሶስት አቢይ ፊደላት መሆን አለበት (ምሳሌ፦ ETB)።',
  valuationDateRequired:
    'ለዚህ ዓይነት የዋጋ ግምት ቀን ያስፈልጋል።',
  valuationTripleIncomplete:
    'የዋጋ ግምቱ ሶስቱም ክፍሎች አብረው መሰጠት አለባቸው።',
};

// =============================================================================
// LoanCollateralReleaseFormLabels — the collateral release dialog (CR-LW3)
// =============================================================================

/**
 * Labels for the collateral release dialog.
 *
 * The dialog collects the single REQUIRED field
 * `ReleaseCollateralRequest` (A.68) accepts: `reason`. A collateral
 * release is not state-machine gated (it does not change the LOAN's
 * status, only the COLLATERAL's), but the frozen A10 decision requires
 * an operator-supplied justification.
 */
export interface LoanCollateralReleaseFormLabels extends LoanSharedLabels {
  readonly dialogTitle: string;
  readonly closeLabel: string;
  readonly confirmMessage: string;
  readonly reasonLabel: string;
  readonly reasonHelper: string;
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly dismissLabel: string;
  readonly reasonRequired: string;
}

export const loanCollateralReleaseFormLabels: LoanCollateralReleaseFormLabels = {
  ...shared,

  dialogTitle: 'ዋስትናውን አስለቅ',
  closeLabel: 'መስኮቱን ዝጋ',

  confirmMessage:
    'ይህን ዋስትና ማስለቀቅ የማይመለስ ነው። የተያዘው ዋስትና ከብድሩ ላይ ይነሳል። ከታች ምክንያት ይስጡ።',

  reasonLabel: 'ምክንያት',
  reasonHelper:
    'የማይወገድ። ለምን እንደተለቀቀ ለማብራራት የሚያገለግል አጭር ማብራሪያ።',

  submitLabel: 'አስለቅ',
  submittingLabel: 'በማስለቀቅ ላይ…',
  dismissLabel: 'ተወው',

  reasonRequired: 'ምክንያት ያስፈልጋል።',
};

// =============================================================================
// LoanProductListViewLabels — the /loan-products page (CR-LW3)
// =============================================================================

/**
 * Labels for the loan product catalogue view.
 *
 * The view renders a read-only table of the tenant's loan product
 * catalogue. The endpoint accepts one query parameter
 * (`active_only`), which the view surfaces as a filter select.
 *
 * Products are the reference data the loan application dialog selects
 * from; this view is the administrative read of that catalogue.
 */
export interface LoanProductListViewLabels extends LoanSharedLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  readonly activeFilterLabel: string;
  readonly activeFilterAll: string;
  readonly activeFilterOnly: string;

  readonly columnCode: string;
  readonly columnName: string;
  readonly columnCurrency: string;
  readonly columnPrincipalRange: string;
  readonly columnTermRange: string;
  readonly columnStatus: string;

  readonly statusActive: string;
  readonly statusInactive: string;

  readonly emptyTitle: string;
  readonly emptyDescription: string;
}

export const loanProductListViewLabels: LoanProductListViewLabels = {
  ...shared,

  pageTitle: 'የብድር ዓይነቶች',
  pageDescription: 'የአሁኑ ተቋም የብድር ዓይነቶች።',

  activeFilterLabel: 'የንቁነት ማጣሪያ',
  activeFilterAll:   'ሁሉም',
  activeFilterOnly:  'ንቁ ብቻ',

  columnCode:           'ኮድ',
  columnName:           'ስም',
  columnCurrency:       'ገንዘብ',
  columnPrincipalRange: 'የዋና ገንዘብ ገደብ',
  columnTermRange:      'የጊዜ ገደብ (በወራት)',
  columnStatus:         'ሁኔታ',

  statusActive:   'ንቁ',
  statusInactive: 'ንቁ ያልሆነ',

  emptyTitle: 'ምንም የብድር ዓይነቶች የሉም',
  emptyDescription:
    'የአሁኑ ተቋም ምንም የብድር ዓይነት የለውም።',
};