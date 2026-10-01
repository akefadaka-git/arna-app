/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-LW1
 * =============================================================================
 *
 * File:      mase_app/src/features/portal/labels.ts  (AMEND)
 * Unit:      CR-LW1 — Workspace loan views (labels refactor)
 * Delivery type:  Amendment — the twelve LoanStatus display strings
 *                 move out of this file to `features/loans/labels.ts`;
 *                 the interface and const are imported back and
 *                 re-exported for backward compatibility. Net lines:
 *                 -52 lines (removed interface + const, including
 *                 docblocks); +~50 lines (imports + re-export + this
 *                 change-verification block); the CR-L3 block gains one
 *                 NOTE paragraph.
 *
 * Before (v2.3.0):
 *   The twelve LoanStatus display strings were declared inside this
 *   file — a `LoanStatusLabels` interface with twelve fields and a
 *   `loanStatusLabels` const with twelve values — because CR-L3
 *   delivered the portal's loans pages before the loans feature
 *   directory existed.
 *
 *   `MyLoansPageLabels` and `MyLoanDetailPageLabels` extended the
 *   local `LoanStatusLabels` interface; the two portal loans pages
 *   were the only consumers of the twelve strings.
 *
 * After (v2.4.0):
 *   The twelve strings now live in `features/loans/labels.ts`
 *   (CR-LW1 file 3) as the single source of truth for the status
 *   vocabulary across BOTH feature directories — the workspace's
 *   `LoanListView` and `LoanDetailView`, and the portal's
 *   `MyLoansPage` and `MyLoanDetailPage`.
 *
 *   This file imports both the interface and the const from
 *   `@/features/loans/labels`, and re-exports the interface for
 *   backward compatibility. Every existing consumer that imports
 *   `LoanStatusLabels` from `@/features/portal/labels` continues to
 *   resolve the name.
 *
 *   `MyLoansPageLabels` and `MyLoanDetailPageLabels` keep their
 *   `extends LoanStatusLabels` clauses — the name now resolves through
 *   the import. The two `myLoansPageLabels` / `myLoanDetailPageLabels`
 *   consts keep their `...loanStatusLabels` spreads — the const now
 *   resolves through the import.
 *
 *   The twelve Amharic strings are byte-for-byte identical to the
 *   values that were previously declared here. The refactor is a
 *   source-location move only; no value changed.
 *
 * Why this move, and why now:
 *   The workspace's loans list and detail pages render the same
 *   twelve statuses the portal's pages render. Two feature directories
 *   declaring the same twelve strings would let them drift — a future
 *   CR that adjusts a status's phrasing would have to touch both
 *   files, and would eventually miss one. Consolidating them in the
 *   domain's own feature directory makes the single-source-of-truth
 *   contract explicit.
 *
 *   The pattern matches `features/wallet/labels.ts`'s
 *   `WalletSharedLabels`, which carries the wallet domain's shared
 *   strings for the same reason.
 *
 * Dependency note:
 *   · Depends on `features/loans/labels.ts` (CR-LW1 file 3, v1.0.0)
 *     for the `LoanStatusLabels` type and the `loanStatusLabels`
 *     value.
 *   · No config change, no Composer step. The file is a TypeScript
 *     module consumed by the frontend build.
 *   · Every existing consumer of this file continues to compile. The
 *     public surface is unchanged: the four page-label interfaces and
 *     their four consts are byte-for-byte identical (minus the twelve
 *     strings that were already declared elsewhere after the import
 *     resolves); `PortalSharedLabels` is unchanged.
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-L3
 * =============================================================================
 *
 * File:      mase_app/src/features/portal/labels.ts
 * Unit:      CR-L3 — Portal self-service loans pages (labels)
 * Delivery type:  Amendment
 * Net lines:      +1 shared interface (LoanStatusLabels, 12 fields);
 *                 +1 shared const (loanStatusLabels);
 *                 +2 page interfaces (MyLoansPageLabels,
 *                   MyLoanDetailPageLabels);
 *                 +2 page consts (myLoansPageLabels,
 *                   myLoanDetailPageLabels);
 *                 +2 interface fields (PortalHomePageLabels);
 *                 +2 value assignments (portalHomePageLabels);
 *                 +1 typo correction (myWalletPageLabels);
 *                 +~85 docblock lines
 *
 * Before:
 *   Five portal label sets: PortalHomePage, MyShareholdingsPage,
 *   MyCertificatesPage, MyWalletPage. There was no label set for a
 *   loans list or a loan detail page — those pages did not exist. The
 *   PortalHomePage's quick-link grid carried three link-label pairs
 *   (holdings, certificates, wallet); it had no loans tile.
 *
 *   The myWalletPageLabels.updatedAtLabel value was 'መጨሻ የተሻሻለበት' —
 *   a typo. The correct spelling is 'መጨረሻ የተሻሻለበት' (the home page's
 *   identityUpdated carries the same string with the correct ረ).
 *
 * After:
 *   Two new page label sets are added — MyLoansPageLabels and
 *   MyLoanDetailPageLabels — plus their matching consts. Two new
 *   fields are added to PortalHomePageLabels and their values to
 *   portalHomePageLabels, for the fourth quick-link tile on the home
 *   page.
 *
 *   A new shared interface — LoanStatusLabels — is introduced to hold
 *   the twelve LoanStatus display labels. Both loans page interfaces
 *   extend it, and both page consts spread the single
 *   `loanStatusLabels` constant. This avoids duplicating twelve strings
 *   across two pages while keeping the two pages' label objects
 *   independently readable.
 *
 *   The myWalletPageLabels.updatedAtLabel typo is corrected. No other
 *   string in the wallet, holdings, or certificates label sets changes.
 *
 * =============================================================================
 * The twelve LoanStatus labels
 * =============================================================================
 * The LoanResource (backend) emits the loan's `status` as the raw C4
 * backing value — it does NOT emit a `status_label`, unlike the
 * ShareholderResource and ShareCertificateResource. The frontend
 * therefore maps each status to a display string, and this file holds
 * the twelve mappings.
 *
 * The vocabulary is closed at twelve:
 *
 *     draft, submitted, under_review, approved, rejected, disbursed,
 *     active, in_arrears, restructured, written_off, settled, closed
 *
 * The mapping is exhaustive. A future CR that extends the backend
 * enum extends this interface and its values in the same change; the
 * page's TypeScript will fail to compile if the map becomes
 * non-exhaustive.
 *
 * The label choices are flagged for native-speaker review (see the
 * §"Native-speaker review — new candidates" section below) — the
 * financial register has more variance than the shareholder
 * vocabulary, and several of the twelve terms admit alternative
 * renderings.
 *
 * =============================================================================
 * PortalHomePageLabels extensions
 * =============================================================================
 * The home page's quick-link grid gains a fourth tile, for the loans
 * list page. Two fields are added:
 *
 *     loansLinkLabel        — the tile's visible title
 *     loansLinkDescription  — the tile's secondary description line
 *
 * The pattern matches the existing three tiles: the label mirrors the
 * destination page's own page title (`ብድሮቼ` — the same string as
 * MyLoansPageLabels.pageTitle), and the description is a short noun
 * phrase describing what the destination shows.
 *
 * =============================================================================
 * Amharic values
 * =============================================================================
 * The new strings, with the terms already used by sibling pages noted
 * where they overlap:
 *
 *   Page chrome:
 *     'ብድሮቼ' (my loans)           — possessive-suffix form, matching
 *                                    'አክሲዮኖቼ' and 'ምስክር ወረቀቶቼ'.
 *     'የብድር ዝርዝር' (loan details) — the detail page's title.
 *
 *   Table columns:
 *     'ዋና ገንዘብ' (principal)         — the standard term for the
 *                                    borrowed amount.
 *     'ቀሪ ሂሳብ' (remaining balance)  — the same monetary-balance term
 *                                    the wallet page uses.
 *     'ሁኔታ' (status)                — matches the existing usage.
 *     'የተጠየቀበት' (applied on)        — parallels 'የተከፈተበት' (opened on)
 *                                    and 'የተሰጠበት' (issued on) from
 *                                    the other pages.
 *     'የመክፈያ ቀን' (payment due date).
 *     'የሚከፈል' (to be paid)          — the expected amount column.
 *     'የተከፈለ' (paid).
 *     'ቀሪ' (remaining).
 *
 *   Loan card row labels:
 *     'የብድር ዓይነት' (loan type)     — the product label.
 *     'የብድር ጊዜ' (loan term)         — the term label.
 *     'ዓላማ' (purpose)               — matches standard usage.
 *     'የተወሰነበት' (decided on)       — parallels the application-date
 *                                    form.
 *     'የተለቀቀበት' (disbursed on)     — parallels 'የተከፈተበት'.
 *     'የሚያልቅበት' (matures on)      — parallels the same pattern.
 *     'የተዘጋበት' (closed on)         — matches the wallet page's
 *                                    closedAtLabel.
 *
 *   Status labels (twelve):
 *     'ረቂቅ' (draft)
 *     'የቀረበ' (submitted)
 *     'በግምገማ ላይ' (under review)
 *     'የጸደቀ' (approved)
 *     'ውድቅ የሆነ' (rejected)
 *     'የተለቀቀ' (disbursed)
 *     'ንቁ' (active)                  — matches the wallet and
 *                                    shareholder pages' term.
 *     'በእዳ ላይ' (in arrears)
 *     'የተስተካከለ' (restructured)
 *     'የተሰረዘ' (written off)
 *     'የተከፈለ' (settled)
 *     'ተዘግቷል' (closed)              — matches the wallet page's
 *                                    statusClosedLabel exactly.
 *
 * =============================================================================
 * Native-speaker review — new candidates
 * =============================================================================
 * Twelve status labels and seven row labels are added to the review
 * list. The financial register admits more variance than the
 * shareholder vocabulary. Specific candidates a reviewer may wish to
 * adjudicate:
 *
 *   · 'በእዳ ላይ' (in arrears) — literarily "in debt". The English term
 *     "arrears" carries a stronger sense of overdue-ness than "debt".
 *     Alternatives include 'ያልተከፈለ' ("unpaid") or a fuller
 *     'ጊዜው ያለፈበት ክፍያ' ("overdue payment").
 *
 *   · 'የተስተካከለ' (restructured) — "adjusted/amended". The word
 *     `የተሻሻለ` ("revised") is another candidate but risks ambiguity
 *     with the "updated" sense already used by the wallet page's
 *     updatedAtLabel. Both are grammatical; the register's preference
 *     is not recorded in this file.
 *
 *   · 'የተሰረዘ' (written off) — "cancelled". The banking term for a
 *     loan write-off is sometimes rendered with a longer form
 *     ('እንደ ኪሳራ የተመዘገበ' — "recorded as loss"). The short form is
 *     used here for column-width reasons.
 *
 *   · 'ውድቅ የሆነ' (rejected) — "became rejected/refused". An
 *     alternative is 'የተከለከለ' but that means "prevented/blocked",
 *     which is not the same concept.
 *
 * =============================================================================
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 * =============================================================================
 *
 * NOTE (CR-LW1): The `LoanStatusLabels` interface and the
 * `loanStatusLabels` const that this CR-L3 revision declared locally
 * have since moved to `features/loans/labels.ts`, where they are the
 * single source of truth for both feature directories. This file now
 * imports them. See the CR-LW1 change-verification block at the top of
 * this file for the full reasoning. Every value, every key, and every
 * docblock section of the original CR-L3 delivery is preserved
 * verbatim elsewhere in this file or in the loans-feature labels
 * module.
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-W2
 * =============================================================================
 *
 * File:      mase_app/src/features/portal/labels.ts
 * Unit:      CR-W2 — Portal self-service wallet page (labels)
 * Delivery type:  Amendment
 * Net lines:      +1 interface (MyWalletPageLabels, 15 fields);
 *                 +1 const (myWalletPageLabels);
 *                 +2 interface fields (PortalHomePageLabels);
 *                 +2 value assignments (portalHomePageLabels);
 *                 +~50 docblock lines
 *
 * Before:
 *   Three portal pages carried label objects: PortalHomePage,
 *   MyShareholdingsPage, MyCertificatesPage. There was no label set
 *   for a wallet page — the page did not exist. The PortalHomePage's
 *   quick-link grid carried two link-label pairs (holdings,
 *   certificates); it had no wallet tile.
 *
 * After:
 *   A fourth page's label set is added — MyWalletPageLabels — plus a
 *   matching `myWalletPageLabels` export. Two new fields are added to
 *   PortalHomePageLabels and their values to portalHomePageLabels, for
 *   the third quick-link tile on the home page.
 *
 *   The fifteen MyWalletPageLabels fields cover:
 *
 *     · Page chrome:  pageTitle, pageDescription
 *
 *     · The wallet card:
 *         walletCardTitle
 *         balanceLabel, currencyLabel, statusLabel
 *         openedAtLabel, closedAtLabel
 *         createdAtLabel, updatedAtLabel
 *
 *     · Three status-badge labels the page derives from the wallet's
 *       `is_closed` and `is_active` booleans:
 *         statusActiveLabel, statusInactiveLabel, statusClosedLabel
 *
 *     · A distinct no-wallet state:
 *         noWalletTitle, noWalletDescription
 *
 *   The three status labels exist because the WalletResource does not
 *   emit a `status_label` the way the ShareholderResource does. The
 *   Shareholder identity card renders the backend-supplied
 *   `shareholder.status_label` directly; the wallet card cannot, so the
 *   page derives the label from the two booleans and reads it from this
 *   file.
 *
 *   The no-wallet state is distinct from the shared `unlinked` state
 *   (A2). The `unlinked` state means "the caller has no shareholder
 *   record"; the `no-wallet` state means "the caller has a shareholder
 *   record but no wallet". The two states render different copy.
 *
 * =============================================================================
 * PortalHomePageLabels extensions
 * =============================================================================
 * The home page's quick-link grid gains a third tile, for the wallet
 * page. Two fields are added:
 *
 *     walletLinkLabel        — the tile's visible title
 *     walletLinkDescription  — the tile's secondary description line
 *
 * The pattern matches the existing holdings and certificates tiles:
 * the label mirrors the destination page's own page title
 * (`ቦርሳዬ` — the same string as MyWalletPageLabels.pageTitle), and the
 * description is a short noun phrase describing what the destination
 * shows.
 *
 * =============================================================================
 * Amharic values
 * =============================================================================
 * Every value is Amharic, matching the register of the existing three
 * label sets.
 *
 *   pageTitle                'ቦርሳዬ'
 *     The possessive-suffix form ('…ዬ' — my), matching 'አክሲዮኖቼ' and
 *     'ምስክር ወረቀቶቼ'. The word 'ቦርሳ' is the register's term for the
 *     member's wallet.
 *
 *   balanceLabel             'ቀሪ ሂሳብ'
 *     The monetary-balance term. Deliberately distinct from 'ቀሪ ብዛት'
 *     (remaining quantity), used in MyShareholdingsPageLabels for the
 *     share ledger's running-balance column. The two terms are the
 *     same in concept but different in domain — money versus quantity —
 *     and the Amharic distinguishes them. This is the same distinction
 *     the holdings file records in its own comment.
 *
 *   statusActiveLabel        'ንቁ'
 *   statusInactiveLabel      'ንቁ ያልሆነ'
 *   statusClosedLabel        'ተዘግቷል'
 *     The three statuses the wallet page derives. 'ንቁ' is the same
 *     positive-status term the Shareholder resource's status_label
 *     uses for an active shareholder; the wallet page reuses it so the
 *     two pages' status semantics read consistently.
 *
 *   noWalletTitle            'ቦርሳ አልተከፈተም'
 *   noWalletDescription      'እስካሁን የአክሲዮን ቦርሳ አልተከፈተም። ቦርሳ ሲከፈት እዚህ ይታያል።'
 *     The no-wallet state's copy. Phrased as a state, not an error —
 *     the caller has a shareholder record, but no wallet has been
 *     opened for them yet. The escalation is deliberately absent: this
 *     is a normal state for a newly-registered shareholder.
 *
 * All seven new strings (five MyWalletPage-specific, two
 * PortalHomePage-specific) are added to this file's native-speaker
 * review list.
 *
 * =============================================================================
 * Native-speaker review — new candidates
 * =============================================================================
 * The following strings are added to the review list:
 *
 *   · 'ቦርሳ' / 'ቦርሳዬ' — the term for the member's wallet. The
 *     workspace build's nav uses 'የገንዘብ ማስቀመጫዎች' (money
 *     depositories) for the same domain. The portal's shorter register
 *     uses the possessive form; whether 'ቦርሳ' reads as the right noun
 *     for a share-related account is a native-speaker call.
 *
 *   · 'ተዘግቷል' (closed) — the perfective form. Alternative candidates
 *     include 'የተዘጋ' (the participial form). Both are grammatical; the
 *     register's existing preference is not recorded in this file.
 *
 *   · 'ቦርሳ አልተከፈተም' (wallet not opened) — the negative perfective
 *     form for the no-wallet state title. The construction 'አልተከፈተም'
 *     is unambiguous; a reviewer may prefer a shorter or more formal
 *     alternative.
 *
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — P3 · Unit 1 · File 1 of 2
 * =============================================================================
 *
 * File:      mase_app/src/features/portal/labels.ts
 * Unit:      P3 · Unit 1 — holdings-history drill-down (labels)
 * Delivery type:  Amendment
 * Net lines:      +1 interface extension (17 fields);
 *                 +17 value assignments; +~35 docblock lines
 *
 * Before:
 *   MyShareholdingsPageLabels carried the six fields needed by a
 *   two-column (class, quantity) list view: pageTitle, pageDescription,
 *   columnClass, columnQuantity, emptyTitle, emptyDescription — plus
 *   the five shared fields spread in from PortalSharedLabels.
 *
 * After:
 *   The interface and its value object gain seventeen fields, grouped
 *   as follows:
 *
 *     · Four ledger-chrome labels (loading / empty / error / retry).
 *     · Four ledger column headers (date / type / quantity / balance).
 *     · Two toggle aria-labels (show / hide) for the row-level
 *       disclosure control.
 *     · One column-header label for the actions column that carries
 *       the toggle.
 *     · Six entry-type labels matching the D16-R8 vocabulary
 *       (subscription, transfer_in, transfer_out, allocation,
 *       adjustment, reversal).
 *
 *   The five fields on PortalSharedLabels (loadingMessage, errorMessage,
 *   errorRetryLabel, unlinkedTitle, unlinkedDescription) are unchanged.
 *   The two other page-label objects (portalHomePageLabels,
 *   myCertificatesPageLabels) are byte-for-byte identical to the
 *   previous revision.
 *
 * =============================================================================
 * The six entry-type labels
 * =============================================================================
 * The wire values written by ShareHoldingController into each entry's
 * `entry_type` field are the D16-R8 controlled vocabulary:
 *
 *     subscription, transfer_in, transfer_out, allocation,
 *     adjustment, reversal
 *
 * Five of the six Amharic labels are byte-for-byte identical to the
 * corresponding labels already declared in
 * features/shareholders/labels.ts under entryTypeSubscription,
 * entryTypeTransferIn, entryTypeTransferOut, entryTypeAllocation, and
 * entryTypeAdjustment. The two files must stay in sync: a future CR
 * that adjusts either set of strings is a coordinated two-file change.
 *
 * The sixth label — entryTypeReversal — is new. The workspace's
 * HoldingEntryForm does not expose a `reversal` entry type (reversal
 * has its own endpoint, and the form does not call it), so no
 * corresponding label exists in features/shareholders/labels.ts. The
 * portal's ledger view displays reversal entries because the ledger is
 * append-only and every reversal is a row; the label is declared here
 * for the first time.
 *
 * =============================================================================
 * Ordering sub-decision recorded
 * =============================================================================
 * The wire order of ShareHolding.entries is chronological ascending
 * (oldest first), because the ShareHolding model's `entries()` relation
 * orders by `occurred_at ASC, id ASC`. For the shareholder-facing
 * ledger view, the newer entries are typically of more interest, so
 * the page displays them reversed — newest first. The reversal is a
 * client-side presentation choice; the wire order is not changed.
 *
 * If a future CR decides the wire order should be reversed, that is a
 * backend change to ShareHolding::entries() and would affect every
 * consumer of the relation, including the workspace's
 * ShareholderDetailView holdings panel. It is not done in this unit.
 *
 * =============================================================================
 * Version-chain correction
 * =============================================================================
 * The file's header declared "Version: 1.1.0" while the §"Revision
 * history" section recorded entries up to 2.0.0 (the Amharic-first
 * conversion). The header was stale; this revision advances it to
 * 2.1.0 to match the history. No historical entry is altered.
 *
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 * =============================================================================
 */

// =============================================================================
// Imports — the loan status vocabulary
// =============================================================================
/*
 * The twelve LoanStatus display strings live in
 * `features/loans/labels.ts` as the single source of truth for the
 * status vocabulary. Both the portal's loans pages (which extend
 * `LoanStatusLabels`) and the workspace's loans pages (which extend
 * `LoanSharedLabels`, which itself extends `LoanStatusLabels`) consume
 * the same twelve strings.
 *
 * The interface is imported for two reasons:
 *   · The two portal loans interfaces' `extends` clauses need the
 *     type bound in this module's scope.
 *   · The re-export at the bottom of this import block preserves the
 *     public surface — any consumer that previously imported
 *     `LoanStatusLabels` from `@/features/portal/labels` continues to
 *     resolve the name.
 *
 * The const is imported for the `...loanStatusLabels` spreads in the
 * two portal loans page consts.
 */
import { loanStatusLabels } from '@/features/loans/labels';
import type { LoanStatusLabels } from '@/features/loans/labels';

export type { LoanStatusLabels };

// =============================================================================
// Shared across all portal pages
// =============================================================================

/**
 * Labels shared by every portal page — the four states the pages can
 * be in, plus the shared error retry copy.
 *
 * Every page's component signature extends this interface. The page
 * labels objects below spread the shared fields in, so a single
 * `labels` prop carries every string each page needs.
 *
 * The interface is unchanged from the English v1.0.0 source. Only the
 * values in the `shared` constant below have changed.
 */
export interface PortalSharedLabels {
  /** Shown while the identity composable is resolving. */
  readonly loadingMessage: string;

  /** Shown when a page's data fetch fails for a non-identity reason. */
  readonly errorMessage: string;

  /** Retry button label for the error state. */
  readonly errorRetryLabel: string;

  /**
   * Title shown when the authenticated user has no own shareholder
   * record (the identity contract's `linked: false` case).
   */
  readonly unlinkedTitle: string;

  /**
   * Description shown in the same case. Explains that the account is
   * not linked and what to do next, without implying an error.
   */
  readonly unlinkedDescription: string;
}

// =============================================================================
// PortalHomePage
// =============================================================================

/**
 * Labels for the portal landing page.
 *
 * Extends `PortalSharedLabels` so that a single prop carries every
 * string the page needs. The page reads `labels.loadingMessage`,
 * `labels.unlinkedTitle`, etc., without a second prop.
 *
 * The interface is unchanged from the English v1.0.0 source EXCEPT for
 * the four quick-link field pairs added across revisions 2.2.0 (CR-W2:
 * wallet) and 2.3.0 (CR-L3: loans). See the file-level
 * change-verification blocks for the additions.
 */
export interface PortalHomePageLabels extends PortalSharedLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  /** Identity summary card */
  readonly identityTitle: string;
  readonly identityName: string;
  readonly identityType: string;
  readonly identityStatus: string;
  readonly identityUser: string;
  readonly identityRepresentative: string;
  readonly identityCreated: string;
  readonly identityUpdated: string;

  /** Inactive-shareholder notice (rendered only when is_active === false). */
  readonly inactiveNotice: string;

  /** Quick links to the other portal pages. */
  readonly holdingsLinkLabel: string;
  readonly holdingsLinkDescription: string;
  readonly certificatesLinkLabel: string;
  readonly certificatesLinkDescription: string;

  /**
   * The third quick-link tile, added in revision 2.2.0 (CR-W2). Points
   * at the wallet page. The label mirrors the destination page's own
   * page title; the description is a short noun phrase describing the
   * destination, matching the pattern of the other two tiles.
   */
  readonly walletLinkLabel: string;
  readonly walletLinkDescription: string;

  /**
   * The fourth quick-link tile, added in revision 2.3.0 (CR-L3). Points
   * at the loans list page. Same pattern as the three tiles above.
   */
  readonly loansLinkLabel: string;
  readonly loansLinkDescription: string;
}

// =============================================================================
// MyShareholdingsPage
// =============================================================================

/**
 * Labels for the "My shareholdings" page.
 *
 * The interface is unchanged from the English v1.0.0 source EXCEPT for
 * the seventeen fields added in revision 2.1.0 to support the
 * holdings-history drill-down. See the file-level change-verification
 * block for the full list of additions and the rationale.
 */
export interface MyShareholdingsPageLabels extends PortalSharedLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  readonly columnClass: string;
  readonly columnQuantity: string;

  /**
   * Header for the trailing actions column that carries the ledger
   * disclosure toggle. Matches the same-named field on the workspace's
   * ShareholderListView, so the two tables render an identical
   * trailing column.
   */
  readonly columnActions: string;

  /**
   * Aria-label for the toggle button when the ledger is collapsed.
   * The button's own aria-expanded reflects the state; this label
   * conveys the action the button will perform.
   */
  readonly actionShowLedger: string;

  /**
   * Aria-label for the toggle button when the ledger is expanded.
   */
  readonly actionHideLedger: string;

  /**
   * Ledger drill-down — chrome.
   *
   * The four states the nested ledger section can be in. The
   * `ledgerErrorRetryLabel` is repeated here (rather than reused from
   * PortalSharedLabels.errorRetryLabel) so that a future CR can vary
   * the retry phrasing for the nested context independently of the
   * page-level retry, if the two ever need to diverge. Today both
   * values are the same string.
   */
  readonly ledgerLoadingMessage: string;
  readonly ledgerEmptyMessage: string;
  readonly ledgerErrorMessage: string;
  readonly ledgerErrorRetryLabel: string;

  /**
   * Ledger drill-down — column headers.
   *
   * Four columns: date, entry-type, quantity, and running balance. See
   * the file-level change-verification block §"Four columns" for the
   * column rationale; `direction`, `balance_before`, and the internal
   * ledger mechanics are not shown.
   */
  readonly ledgerColumnDate: string;
  readonly ledgerColumnType: string;
  readonly ledgerColumnQuantity: string;
  readonly ledgerColumnBalanceAfter: string;

  /**
   * Ledger drill-down — entry-type labels.
   *
   * The six D16-R8 wire values, in Amharic. Five of the six are
   * byte-for-byte identical to the same-named labels in
   * features/shareholders/labels.ts; the two files must stay in sync.
   * The sixth (entryTypeReversal) is new — see the file-level
   * change-verification block.
   */
  readonly entryTypeSubscription: string;
  readonly entryTypeTransferIn: string;
  readonly entryTypeTransferOut: string;
  readonly entryTypeAllocation: string;
  readonly entryTypeAdjustment: string;
  readonly entryTypeReversal: string;

  readonly emptyTitle: string;
  readonly emptyDescription: string;
}

// =============================================================================
// MyCertificatesPage
// =============================================================================

/**
 * Labels for the "My certificates" page.
 *
 * The interface is unchanged from the English v1.0.0 source.
 */
export interface MyCertificatesPageLabels extends PortalSharedLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  readonly columnNumber: string;
  readonly columnClass: string;
  readonly columnStatus: string;
  readonly columnIssued: string;

  readonly emptyTitle: string;
  readonly emptyDescription: string;
}

// =============================================================================
// MyWalletPage
// =============================================================================

/**
 * Labels for the "My wallet" page.
 *
 * Extends `PortalSharedLabels` so that a single prop carries every
 * string the page needs — the four shared states (`loadingMessage`,
 * `errorMessage`, `errorRetryLabel`, `unlinkedTitle`,
 * `unlinkedDescription`) plus the fifteen page-specific fields
 * declared below.
 *
 * See the CR-W2 change-verification block §"The status labels — why
 * this page has three" and §"The no-wallet state — distinct from the
 * shared unlinked state" for the reasoning behind the page's status
 * labels and its no-wallet copy.
 */
export interface MyWalletPageLabels extends PortalSharedLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  /**
   * The wallet card's heading, rendered in the Card's `#header` slot.
   * Matches the pattern of `identityTitle` on PortalHomePageLabels.
   */
  readonly walletCardTitle: string;

  /**
   * The wallet card's row labels, rendered as `<dt>` elements in the
   * card's `<dl>`. One per visible field on the wallet resource.
   *
   * `balanceLabel` uses the monetary term `ቀሪ ሂሳብ` — deliberately
   * distinct from `ቀሪ ብዛት` (remaining quantity), which
   * MyShareholdingsPageLabels uses for its share-ledger running-
   * balance column. The two terms are the same in concept but
   * different in domain; the Amharic distinguishes them.
   *
   * `closedAtLabel` is the label for a row rendered only when the
   * wallet has a non-null `closed_at`. Phase 2B does not produce such
   * wallets; the label is declared so the row is correctly labelled
   * the day the closure workflow ships.
   */
  readonly balanceLabel: string;
  readonly currencyLabel: string;
  readonly statusLabel: string;
  readonly openedAtLabel: string;
  readonly closedAtLabel: string;
  readonly createdAtLabel: string;
  readonly updatedAtLabel: string;

  /**
   * The wallet's status badge labels.
   *
   * Derived by the page from the wallet's two booleans — see the
   * interface docblock §"The status labels" for the derivation.
   *
   * The page renders these through the shared StatusBadge component;
   * the badge's `variant` is chosen alongside the label. The label
   * and variant pair is:
   *
   *     statusActiveLabel    + 'success'
   *     statusInactiveLabel  + 'neutral'
   *     statusClosedLabel    + 'neutral'
   */
  readonly statusActiveLabel: string;
  readonly statusInactiveLabel: string;
  readonly statusClosedLabel: string;

  /**
   * The no-wallet state's title and description.
   *
   * Distinct from the shared `unlinkedTitle` / `unlinkedDescription`.
   * See the interface docblock §"The no-wallet state" for the
   * distinction and the CR-W2 change-verification block for the A2
   * decision.
   */
  readonly noWalletTitle: string;
  readonly noWalletDescription: string;
}

// =============================================================================
// MyLoansPage
// =============================================================================

/**
 * Labels for the "My loans" page.
 *
 * Extends both `PortalSharedLabels` (the four shared states) and
 * `LoanStatusLabels` (the twelve status display strings). The latter
 * is imported from `@/features/loans/labels` — see the file-level
 * §"Imports — the loan status vocabulary".
 *
 * The page reads `labels.loadingMessage`, `labels.unlinkedTitle`,
 * `labels.statusActive`, etc., from a single prop.
 *
 * The page renders the caller's own loans in a four-column table:
 * principal, outstanding balance, status, and application date. The
 * principal cell is a RouterLink to the loan detail page — there is
 * no separate actions column.
 */
export interface MyLoansPageLabels
  extends PortalSharedLabels, LoanStatusLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  /**
   * The four table column headers.
   *
   * `columnPrincipal` and `columnOutstanding` are both monetary and
   * rendered through `formatAmount` (re-exported from the loans
   * service). `columnApplied` renders the loan's
   * `application_date_display`; the frontend does no date formatting.
   */
  readonly columnPrincipal: string;
  readonly columnOutstanding: string;
  readonly columnStatus: string;
  readonly columnApplied: string;

  /**
   * The empty state's title and description.
   *
   * The `empty` state is distinct from the shared `unlinked` state:
   * `unlinked` means "no shareholder record at all", `empty` means
   * "a shareholder record exists but no loans have been issued". The
   * two render different copy. See the CR-L3 change-verification
   * block for the reasoning.
   */
  readonly emptyTitle: string;
  readonly emptyDescription: string;
}

// =============================================================================
// MyLoanDetailPage
// =============================================================================

/**
 * Labels for the "Loan detail" page.
 *
 * Extends both `PortalSharedLabels` (the four shared states) and
 * `LoanStatusLabels` (the twelve status display strings).
 *
 * The page renders two sections:
 *
 *   · A loan card — a definition list with the loan's own fields
 *     (product, status, principal, term, outstanding total, purpose,
 *     and the four lifecycle dates).
 *
 *   · A schedule card — the loan's installment schedule as a table.
 *
 * The page also has a distinct 404 state (`notFoundTitle` /
 * `notFoundDescription`), matching the wallet detail page's pattern:
 * a 404 (the loan does not exist or belongs to another tenant) is
 * distinguished from a generic fetch failure.
 */
export interface MyLoanDetailPageLabels
  extends PortalSharedLabels, LoanStatusLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  /**
   * The loan card's heading, rendered in the Card's `#header` slot.
   */
  readonly loanSectionTitle: string;

  /**
   * The loan card's row labels, rendered as `<dt>` elements in the
   * card's `<dl>`.
   *
   * The nullable lifecycle dates (`decisionDateLabel`,
   * `disbursementDateLabel`, `maturityDateLabel`, `closedAtLabel`)
   * label rows that render only when the corresponding `_display`
   * field is non-null.
   */
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

  /**
   * The schedule card's heading and empty message.
   */
  readonly scheduleSectionTitle: string;
  readonly scheduleEmpty: string;

  /**
   * The schedule table's five column headers.
   *
   * `columnExpected`, `columnSettled`, and `columnRemaining` are all
   * monetary and rendered through `formatAmount`. `columnDueDate`
   * renders the installment's `due_date_display`.
   */
  readonly scheduleColumnNumber: string;
  readonly scheduleColumnDueDate: string;
  readonly scheduleColumnExpected: string;
  readonly scheduleColumnSettled: string;
  readonly scheduleColumnRemaining: string;

  /**
   * The 404 state's title and description. Distinct from the shared
   * `unlinked` panel; a not-found loan is a different condition from
   * an unlinked account.
   */
  readonly notFoundTitle: string;
  readonly notFoundDescription: string;
}

// =============================================================================
// Values
// =============================================================================

/**
 * The shared strings, expanded into each page's labels object below.
 *
 * Kept as a separate constant so the five values stay in sync across
 * the six portal pages. If a future CR changes one, all six pages
 * inherit the change without any page-level edit.
 */
const shared: PortalSharedLabels = {
  /**
   * Loading affordance. Same string pattern as the launcher grid and
   * the auth forms' submitting labels. Trailing ellipsis is U+2026.
   */
  loadingMessage: 'በመጫን ላይ…',

  /**
   * Generic fetch failure. Follows the same phrasing family as the
   * launcher grid's error and the auth forms' generic errors.
   */
  errorMessage: 'ይህን መረጃ ማምጣት አልቻልንም።',

  /**
   * Retry button. Identical to the retry string used everywhere else
   * in the localized surface — there is one and only one retry string.
   */
  errorRetryLabel: 'እንደገና ይሞክሩ',

  /**
   * Unlinked-state title. Shown when the current account has no own
   * shareholder record. Phrased as a state, not an error: the account
   * exists, it is simply not linked.
   */
  unlinkedTitle: 'ይህ መለያ ከባለአክሲዮን ጋር አልተገናኘም',

  /**
   * Unlinked-state description. The escalation is conditional — the
   * common case for this state is that the user genuinely has no
   * shareholder record, and they should not be told to contact an
   * administrator unless they think the state is unexpected.
   */
  unlinkedDescription:
    'ይህ ስህተት ነው ብለው ካሰቡ፣ አስተዳዳሪዎን ያግኙ።',
};

// -----------------------------------------------------------------------------
// PortalHomePage labels
// -----------------------------------------------------------------------------
export const portalHomePageLabels: PortalHomePageLabels = {
  ...shared,

  pageTitle: 'የእኔ መለያ',
  pageDescription: 'የባለአክሲዮን መረጃዎ በአንድ እይታ።',

  identityTitle: 'የእኔ መረጃ',
  identityName: 'ስም',
  identityType: 'ዓይነት',
  identityStatus: 'ሁኔታ',
  identityUser: 'መለያ',
  identityRepresentative: 'ተወካይ',
  identityCreated: 'የተፈጠረበት',
  identityUpdated: 'መጨረሻ የተሻሻለበት',

  inactiveNotice:
    'ይህ የባለአክሲዮን መዝገብ ንቁ አይደለም። አንዳንድ ባህሪያት ላይገኙ ይችላሉ።',

  holdingsLinkLabel: 'አክሲዮኖቼ',
  holdingsLinkDescription: 'በእያንዳንዱ የአክሲዮን ክፍል የያዙት አክሲዮኖች።',
  certificatesLinkLabel: 'ምስክር ወረቀቶቼ',
  certificatesLinkDescription: 'ለእርስዎ የተሰጡ ምስክር ወረቀቶች።',

  /*
   * The third quick-link tile, added in revision 2.2.0 (CR-W2). Points
   * at the wallet page. The label mirrors the destination page's own
   * page title (MyWalletPageLabels.pageTitle — byte-for-byte the same
   * string). The description is a short noun phrase matching the
   * register of the two existing tiles.
   */
  walletLinkLabel: 'ቦርሳዬ',
  walletLinkDescription: 'የቦርሳዎ ሁኔታ።',

  /*
   * The fourth quick-link tile, added in revision 2.3.0 (CR-L3). Points
   * at the loans list page. Same pattern as the three tiles above.
   */
  loansLinkLabel: 'ብድሮቼ',
  loansLinkDescription: 'የያዙት ብድሮች።',
};

// -----------------------------------------------------------------------------
// MyShareholdingsPage labels
// -----------------------------------------------------------------------------
export const myShareholdingsPageLabels: MyShareholdingsPageLabels = {
  ...shared,

  pageTitle: 'አክሲዮኖቼ',
  pageDescription: 'በአሁኑ ጊዜ የያዙት አክሲዮኖች፣ በአክሲዮን ክፍል።',

  columnClass: 'የአክሲዮን ክፍል',
  columnQuantity: 'ብዛት',
  columnActions: 'ተግባራት',

  /*
   * The disclosure toggle's two labels. The button toggles between
   * collapsed and expanded states; each state gets its own label so
   * that a screen reader announces the action the next click will
   * perform, rather than describing the current state (which the
   * button's own aria-expanded conveys).
   */
  actionShowLedger: 'የመዝገብ ግቤቶችን አሳይ',
  actionHideLedger: 'የመዝገብ ግቤቶችን ደብቅ',

  /*
   * The ledger drill-down's four chrome strings. The retry string is
   * deliberately a separate field from PortalSharedLabels.errorRetryLabel
   * — see the interface docblock.
   */
  ledgerLoadingMessage: 'የመዝገብ ግቤቶችን በመጫን ላይ…',
  ledgerEmptyMessage: 'ምንም የመዝገብ ግቤቶች የሉም።',
  ledgerErrorMessage: 'የመዝገብ ግቤቶችን ማምጣት አልቻልንም።',
  ledgerErrorRetryLabel: 'እንደገና ይሞክሩ',

  /*
   * The four column headers of the nested ledger table.
   *
   * `ledgerColumnBalanceAfter` is the running quantity after each
   * entry. The Amharic term `ቀሪ ብዛት` ("remaining quantity") is
   * deliberately distinct from the monetary-balance term `ቀሪ ሂሳብ`,
   * because the ledger records share quantity, not currency. Flagged
   * for native-speaker review.
   */
  ledgerColumnDate: 'ቀን',
  ledgerColumnType: 'ዓይነት',
  ledgerColumnQuantity: 'ብዛት',
  ledgerColumnBalanceAfter: 'ቀሪ ብዛት',

  /*
   * The six entry-type labels.
   *
   * Five of the six are byte-for-byte identical to the same-named
   * fields in features/shareholders/labels.ts. If either file's
   * strings are changed by a future CR, both must change together.
   *
   * `entryTypeReversal` has no counterpart in the shareholder feature
   * — the HoldingEntryForm does not expose reversal, because reversal
   * is a distinct endpoint. The portal displays reversals because the
   * ledger is append-only and every reversal is a row. This is the
   * first declaration of the label.
   */
  entryTypeSubscription: 'ምዝገባ',
  entryTypeTransferIn: 'የዝውውር ግቤት',
  entryTypeTransferOut: 'የዝውውር ውጤት',
  entryTypeAllocation: 'ምደባ',
  entryTypeAdjustment: 'ማስተካከያ',
  entryTypeReversal: 'መመለስ',

  emptyTitle: 'ምንም አክሲዮኖች የሉም',
  emptyDescription:
    'በአሁኑ ጊዜ ምንም አክሲዮኖች አልያዙም። ወደፊት አክሲዮኖችን ካገኙ ይህ ሊለወጥ ይችላል።',
};

// -----------------------------------------------------------------------------
// MyCertificatesPage labels
// -----------------------------------------------------------------------------
export const myCertificatesPageLabels: MyCertificatesPageLabels = {
  ...shared,

  pageTitle: 'ምስክር ወረቀቶቼ',
  pageDescription: 'ለእርስዎ የተሰጡ የአክሲዮን ምስክር ወረቀቶች።',

  columnNumber: 'ቁጥር',
  columnClass: 'የአክሲዮን ክፍል',
  columnStatus: 'ሁኔታ',
  columnIssued: 'የተሰጠበት',

  emptyTitle: 'ምንም ምስክር ወረቀቶች የሉም',
  emptyDescription:
    'ምንም የአክሲዮን ምስክር ወረቀቶች ለእርስዎ አልተሰጡም። ይህ ስህተት ነው ብለው ካሰቡ፣ አስተዳዳሪዎን ያግኙ።',
};

// -----------------------------------------------------------------------------
// MyWalletPage labels
// -----------------------------------------------------------------------------
export const myWalletPageLabels: MyWalletPageLabels = {
  ...shared,

  /*
   * Page chrome. The title uses the possessive-suffix form ('…ዬ' — my),
   * matching 'አክሲዮኖቼ' and 'ምስክር ወረቀቶቼ'. The description describes what
   * the page shows: the wallet's summary plus its remaining balance.
   */
  pageTitle: 'ቦርሳዬ',
  pageDescription: 'የቦርሳዎ ማጠቃለያ እና ቀሪ ሂሳብ።',

  /*
   * The wallet card's heading, in the Card's #header slot. Matches the
   * pattern of identityTitle on PortalHomePageLabels.
   */
  walletCardTitle: 'የቦርሳ ዝርዝር',

  /*
   * Row labels for the wallet card's <dl>.
   *
   * `balanceLabel` uses the monetary term `ቀሪ ሂሳብ`, deliberately
   * distinct from `ቀሪ ብዛት` (remaining quantity) used in
   * myShareholdingsPageLabels for the share-ledger running-balance
   * column. The two are the same in concept but different in domain —
   * money versus quantity — and the Amharic distinguishes them.
   *
   * `openedAtLabel`, `createdAtLabel`, and `updatedAtLabel` mirror the
   * same-named labels on portalHomePageLabels (`የተፈጠረበት`, `መጨረሻ
   * የተሻሻለበት`) where the two overlap. `closedAtLabel` has no
   * counterpart elsewhere.
   */
  balanceLabel: 'ቀሪ ሂሳብ',
  currencyLabel: 'ገንዘብ',
  statusLabel: 'ሁኔታ',
  openedAtLabel: 'የተከፈተበት',
  closedAtLabel: 'የተዘጋበት',
  createdAtLabel: 'የተፈጠረበት',
  /*
   * Corrected in revision 2.3.0 (CR-L3): the value was 'መጨሻ
   * የተሻሻለበት' — a typo. The correct spelling uses 'መጨረሻ' (with ረ),
   * matching the same label on portalHomePageLabels under
   * identityUpdated. No other field changed.
   */
  updatedAtLabel: 'መጨረሻ የተሻሻለበት',

  /*
   * The wallet's status badge labels.
   *
   * The WalletResource does not emit a `status_label` the way the
   * ShareholderResource does, so the page derives the label from the
   * wallet's two booleans. See the interface docblock §"The status
   * labels" for the derivation.
   *
   * `statusActiveLabel` reuses the same positive-status term ('ንቁ')
   * the Shareholder resource's status_label uses for an active
   * shareholder, so the two pages' status semantics read consistently.
   *
   * Phase 2B does not produce closed wallets, so `statusClosedLabel`
   * is not rendered in the current deployment. It is declared so the
   * page renders correctly the day the closure workflow ships.
   */
  statusActiveLabel: 'ንቁ',
  statusInactiveLabel: 'ንቁ ያልሆነ',
  statusClosedLabel: 'ተዘግቷል',

  /*
   * The no-wallet state.
   *
   * Distinct from the shared unlinkedTitle / unlinkedDescription.
   * The shared pair means "the caller has no shareholder record at
   * all"; this pair means "the caller has a shareholder record but no
   * wallet has been opened for them." The two are genuinely different
   * states, and the page renders them with distinct copy.
   *
   * Phrased as a state, not an error — a newly-registered shareholder
   * without a wallet is a normal, expected state, not a failure. The
   * copy does not escalate to "contact an administrator."
   */
  noWalletTitle: 'ቦርሳ አልተከፈተም',
  noWalletDescription:
    'እስካሁን የአክሲዮን ቦርሳ አልተከፈተም። ቦርሳ ሲከፈት እዚህ ይታያል።',
};

// -----------------------------------------------------------------------------
// MyLoansPage labels
// -----------------------------------------------------------------------------
export const myLoansPageLabels: MyLoansPageLabels = {
  ...shared,
  ...loanStatusLabels,

  /*
   * Page chrome. The title uses the possessive-suffix form ('…ቼ' — my),
   * matching 'አክሲዮኖቼ', 'ምስክር ወረቀቶቼ', and 'ቦርሳዬ'. The description
   * describes what the page shows: the loans the caller currently
   * holds.
   */
  pageTitle: 'ብድሮቼ',
  pageDescription: 'የያዙት ብድሮችና የእያንዳንዳቸው ሁኔታ።',

  /*
   * The four table column headers.
   *
   * `columnPrincipal` and `columnOutstanding` are monetary and rendered
   * through the shared `formatAmount` helper (re-exported from the
   * loans service). `columnApplied` renders the loan's
   * `application_date_display` directly.
   */
  columnPrincipal: 'ዋና ገንዘብ',
  columnOutstanding: 'ቀሪ ሂሳብ',
  columnStatus: 'ሁኔታ',
  columnApplied: 'የተጠየቀበት',

  /*
   * The empty-state pair.
   *
   * The `empty` state is distinct from the shared `unlinked` state:
   * `unlinked` covers the identity contract's `linked: false` branch,
   * meaning the caller has no own shareholder record. `empty` covers
   * the case where the identity is linked and the loans endpoint
   * returned an empty array — the caller has a shareholder record but
   * no loans have been issued. The two conditions render different
   * copy, matching the CR-L3 decision.
   */
  emptyTitle: 'ምንም ብድሮች የሉም',
  emptyDescription:
    'በአሁኑ ጊዜ ምንም ብድሮች አልተሰጡዎትም። ብድር ሲሰጥ እዚህ ይታያል።',
};

// -----------------------------------------------------------------------------
// MyLoanDetailPage labels
// -----------------------------------------------------------------------------
export const myLoanDetailPageLabels: MyLoanDetailPageLabels = {
  ...shared,
  ...loanStatusLabels,

  /*
   * Page chrome. The title is a static descriptive string — a loan
   * does not carry a "display name" the way a shareholder or wallet
   * does. The user sees the product name and loan id in the page body.
   */
  pageTitle: 'የብድር ዝርዝር',
  pageDescription: 'የብድሩ ማጠቃለያና የመክፈያ መርሃግብሩ።',

  /*
   * The two section card headings.
   */
  loanSectionTitle: 'የብድር መረጃ',
  scheduleSectionTitle: 'የመክፈያ መርሃግብር',

  /*
   * The loan card's row labels.
   *
   * The four lifecycle dates (`applicationDateLabel`,
   * `decisionDateLabel`, `disbursementDateLabel`, `maturityDateLabel`,
   * `closedAtLabel`) label rows that render the corresponding
   * `_display` value; the last four are null until the event has
   * occurred and their rows are rendered conditionally by the page.
   */
  productLabel: 'የብድር ዓይነት',
  statusLabel: 'ሁኔታ',
  principalLabel: 'ዋና ገንዘብ',
  termLabel: 'የብድር ጊዜ',
  outstandingTotalLabel: 'ቀሪ ሂሳብ',
  purposeLabel: 'ዓላማ',
  applicationDateLabel: 'የተጠየቀበት',
  decisionDateLabel: 'የተወሰነበት',
  disbursementDateLabel: 'የተለቀቀበት',
  maturityDateLabel: 'የሚያልቅበት',
  closedAtLabel: 'የተዘጋበት',

  /*
   * The schedule card's empty message, shown when the installments
   * collection is empty (a pre-disbursement loan has no schedule
   * yet).
   */
  scheduleEmpty: 'ምንም የመክፈያ መርሃግብር የለም።',

  /*
   * The schedule table's column headers.
   */
  scheduleColumnNumber: 'ቁጥር',
  scheduleColumnDueDate: 'የመክፈያ ቀን',
  scheduleColumnExpected: 'የሚከፈል',
  scheduleColumnSettled: 'የተከፈለ',
  scheduleColumnRemaining: 'ቀሪ',

  /*
   * The 404 state's title and description. Distinct from the shared
   * `unlinkedTitle` / `unlinkedDescription`. A not-found loan is a
   * different condition from an unlinked account: the caller's
   * shareholder record exists (otherwise the page would be in the
   * unlinked state), but the loan id in the URL does not correspond
   * to a loan the caller may see.
   */
  notFoundTitle: 'ብድሩ አልተገኘም',
  notFoundDescription:
    'ይህ ብድር አልተገኘም ወይም የማየት ፈቃድ የለዎትም።',
};