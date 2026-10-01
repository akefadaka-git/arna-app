/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-LW1
 * =============================================================================
 *
 * File:      mase_app/src/features/loans/api.ts  (AMEND)
 * Unit:      CR-LW1 — Workspace loan views (API contract)
 * Delivery type:  Amendment — new types, new endpoint functions.
 * Net lines:      +~900 lines
 *
 * Before (v1.0.1):
 *   The module declared the portal's self-service surface only: the
 *   `Loan`, `LoanInstallment`, `LoanProductSummary`, `LoanBorrowerSummary`
 *   types; `LoanStatus` and `LoanInstallmentStatus` unions; the
 *   `MyLoansResponse` two-outcome contract; and two functions —
 *   `getMyLoans()` (GET /api/loans/me) and `getLoan(id)` (GET /api/loans/{loan}).
 *
 *   The workspace's administrative surface was not represented. None of
 *   the sixteen frozen endpoints' payload shapes had a TypeScript type.
 *
 * After (v1.1.0):
 *   The module declares the full Loan-domain surface. Three categories:
 *
 *     1. EXPANDED AGGREGATE.
 *        `Loan` now declares the additional optional relations that
 *        the show endpoint eager-loads — `borrower`,
 *        `frozen_policy_version`, the three actor summaries,
 *        `collaterals`, `restructurings`, `write_off`, and
 *        `status_histories` — plus the four actor FK ids
 *        (`approved_by`, `disbursed_by`, `created_by`,
 *        `frozen_policy_version_id`) and `frozen_policy_version_id`
 *        that were previously undeclared. Every relation is optional;
 *        the portal's /me endpoint still omits them all.
 *
 *     2. NEW TYPES.
 *        `LoanProduct` (the full product resource), `LoanCollateral`,
 *        `LoanStatusHistory`, `LoanRestructuring`, `LoanWriteOff`,
 *        `LoanSchedule`, `LoanStatement`, `LoanReconciliation`, and
 *        their supporting summary/line/balance types. Plus
 *        `CollateralType` and `CollateralStatus` enums, the actor and
 *        policy-version summaries, and the pledged-shareholding
 *        summary.
 *
 *     3. NEW ENDPOINT FUNCTIONS.
 *        The fourteen workspace endpoints:
 *          · listLoans / createLoan
 *          · approveLoan / rejectLoan / disburseLoan / restructureLoan /
 *            writeOffLoan
 *          · listLoanProducts
 *          · getLoanSchedule
 *          · getLoanStatement
 *          · getLoanReconciliation
 *          · repayLoan
 *          · listLoanCollaterals / storeLoanCollateral /
 *            releaseLoanCollateral
 *        Plus the query and payload types each consumes.
 *
 *   `LoanProductSummary` is retained as a deprecated type alias for
 *   `LoanProduct` — the wire emits the full product shape when the
 *   `product` relation is loaded, so the narrower interface was
 *   understating what the backend produces. Existing consumers
 *   importing the name continue to compile.
 *
 * Public surface delta:
 *   · Two new enums (CollateralType, CollateralStatus).
 *   · Fourteen new exported interfaces.
 *   · Fourteen new exported endpoint functions.
 *   · The `Loan` interface was widened with optional fields only.
 *   · `LoanProductSummary` became a type alias; no consumer breaks.
 *
 * Dependency note:
 *   · Depends on `@/core/api/client` (v1.2.0, deployed) — unchanged.
 *   · Depends on the CR-L1 backend endpoint (deployed) and the CR-L2
 *     `_display` fields across the six Loan resources (deployed).
 *   · No config change, no Composer step. The file is a TypeScript
 *     module consumed by the frontend build.
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * MASES Phase 2 UI — Loan API Module
 * =============================================================================
 *
 * File:      mase_app/src/features/loans/api.ts
 * Layer:     Features (Loan domain)
 * Version:   1.1.0
 * Status:    FROZEN
 * Authority: Loan domain Routes/api.php (verified against source)
 *            Loan domain LoanResource.php (verified against source)
 *            Loan domain LoanInstallmentResource.php (verified against source)
 *            Loan domain LoanCollateralResource.php (verified against source)
 *            Loan domain LoanProductResource.php (verified against source)
 *            Loan domain LoanStatusHistoryResource.php (verified against source)
 *            Loan domain LoanScheduleResource.php (verified against source)
 *            Loan domain LoanStatementResource.php (verified against source)
 *            Loan domain LoanReconciliationResource.php (verified against source)
 *            Loan domain MyLoanController.php (CR-L1, verified against source)
 *            Loan domain the nine FormRequests (A.60–A.68, verified against source)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §12 (API client)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.1.0  — full workspace surface (CR-LW1).
 *
 *          The module's coverage expands from the portal's self-service
 *          subset to the full Loan-domain surface. Two endpoint
 *          functions existed before; sixteen now do (fourteen new).
 *          The `Loan` interface is widened with the optional relations
 *          the show endpoint eager-loads. Nine new top-level types
 *          describe the administrative resources the workspace
 *          renders.
 *
 *          `LoanProductSummary` was an understated declaration — the
 *          wire emits the full `LoanProductResource` shape when the
 *          product relation loads. The name is retained as a deprecated
 *          alias for `LoanProduct` so the portal's service layer
 *          (CR-L3 file 2) continues to compile without modification.
 *
 *          No existing type changed incompatibly. No existing function
 *          signature changed.
 *
 * 1.0.1  — `Loan.currency` widened to `string | null` (CR-L3 revision).
 *          The schema column is nullable and the LoanResource does not
 *          cast the value to string, so a pre-disbursement loan can
 *          emit `currency: null`. Follow-up: MyLoansPage.vue
 *          revision 1.0.1 added the matching defensive reads.
 *
 * 1.0.0  — initial delivery (CR-L3). The portal's self-service
 *          surface: the two `/me` and `/{loan}` reads.
 *
 * -----------------------------------------------------------------------------
 * Endpoint coverage
 * -----------------------------------------------------------------------------
 *   GET    /api/loans                                           listLoans         (workspace)
 *   POST   /api/loans                                           createLoan        (workspace)
 *   GET    /api/loans/me                                        getMyLoans        (portal)
 *   GET    /api/loans/products                                  listLoanProducts  (workspace)
 *   GET    /api/loans/{loan}                                    getLoan
 *   POST   /api/loans/{loan}/approve                            approveLoan
 *   POST   /api/loans/{loan}/reject                             rejectLoan
 *   POST   /api/loans/{loan}/disburse                           disburseLoan
 *   POST   /api/loans/{loan}/restructure                        restructureLoan
 *   POST   /api/loans/{loan}/writeoff                           writeOffLoan
 *   POST   /api/loans/{loan}/repay                              repayLoan
 *   GET    /api/loans/{loan}/schedule                           getLoanSchedule
 *   GET    /api/loans/{loan}/statement                          getLoanStatement
 *   GET    /api/loans/{loan}/reconciliation                     getLoanReconciliation
 *   GET    /api/loans/{loan}/collateral                         listLoanCollaterals
 *   POST   /api/loans/{loan}/collateral                         storeLoanCollateral
 *   POST   /api/loans/{loan}/collateral/{collateral}/release    releaseLoanCollateral
 *
 * -----------------------------------------------------------------------------
 * Response shapes — the sources
 * -----------------------------------------------------------------------------
 * Every type below is derived from the corresponding Resource class or
 * controller method, not proposed. The sources:
 *
 *   · LoanResource (A.69, amended by CR-L2) — the `Loan` type, its
 *     embedded actor/policy/borrower summaries, and the two inline
 *     summaries (restructurings, write_off).
 *   · LoanInstallmentResource (A.71, CR-L2) — `LoanInstallment`.
 *   · LoanCollateralResource (A.72, CR-L2) — `LoanCollateral`.
 *   · LoanProductResource (A.70, CR-L2) — `LoanProduct`.
 *   · LoanStatusHistoryResource (A.76, CR-L2) — `LoanStatusHistory`.
 *   · LoanScheduleResource (A.73, CR-L2) — `LoanSchedule`.
 *   · LoanStatementResource (A.74) — `LoanStatement`.
 *   · LoanReconciliationResource (A.75) — `LoanReconciliation`.
 *   · LoanController::respondWithLoans (A.77) — the nested
 *     `meta.pagination` shape on the list endpoint. This differs from
 *     the flat pagination meta the wallet module expects: the loan
 *     list wraps pagination inside a `pagination` object, matching
 *     `respondWithLoans`'s emitted structure.
 *
 * -----------------------------------------------------------------------------
 * Monetary amounts
 * -----------------------------------------------------------------------------
 * Every amount field is a decimal string at scale 4 (DECIMAL(20,4)),
 * never a number. The frontend never performs arithmetic on a monetary
 * string; it renders through `formatAmount()` (re-exported by
 * `features/loans/service.ts` from the wallet service).
 *
 * -----------------------------------------------------------------------------
 * Dates and the `_display` siblings
 * -----------------------------------------------------------------------------
 * Every date field carries an ISO 8601 string sibling and a localized
 * `_display` sibling, per the CR-L2 amendments. A nullable ISO field
 * has a nullable `_display` sibling — the two agree on which rows
 * carry a value.
 *
 * -----------------------------------------------------------------------------
 * The status vocabularies
 * -----------------------------------------------------------------------------
 *   LoanStatus            — twelve frozen C4 values.
 *   LoanInstallmentStatus — five frozen A.5 values.
 *   CollateralType        — two values (external | shareholding).
 *   CollateralStatus      — two values (registered | released).
 *
 * The LoanResource emits `status` as the raw C4 backing value — it does
 * NOT emit a `status_label`. The frontend maps each value to a display
 * string through `features/loans/labels.ts`'s `LoanSharedLabels`.
 *
 * =============================================================================
 */

import { api } from '@/core/api/client';

// =============================================================================
// Status vocabularies
// =============================================================================

/**
 * The twelve frozen LoanStatus values (Phase 2C Decision C4).
 *
 * Mirrors the `LoanStatus` enum's backed values on the backend. The
 * vocabulary is closed at twelve; a future CR that extends the enum
 * extends this union in the same change.
 */
export type LoanStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'disbursed'
  | 'active'
  | 'in_arrears'
  | 'restructured'
  | 'written_off'
  | 'settled'
  | 'closed';

/**
 * The five frozen InstallmentStatus values (Phase 2C Decision A.5).
 *
 * Mirrors the `InstallmentStatus` enum's backed values on the backend.
 */
export type LoanInstallmentStatus =
  | 'pending'
  | 'partial'
  | 'settled'
  | 'overdue'
  | 'superseded';

/**
 * The two collateral types (Phase 2C Decision A.4).
 *
 * `external`     — a non-shareholding asset (real estate, vehicle, etc.).
 * `shareholding` — a pledge against the borrower's own shareholding.
 */
export type CollateralType = 'external' | 'shareholding';

/**
 * The two collateral statuses (Phase 2C Decision A.3).
 *
 * `registered` — the security is held.
 * `released`   — the security has been discharged.
 */
export type CollateralStatus = 'registered' | 'released';

// =============================================================================
// Loan — the aggregate root
// =============================================================================

/**
 * The Loan Resource shape (A.69, amended by CR-L2).
 *
 * The aggregate root of the Loan domain. The interface declares the
 * loan's own columns plus the optional relations the controller
 * eager-loads on the show endpoint. Every relation is present only
 * when the controller eager-loaded it (via `whenLoaded`); the
 * portal's `/me` list endpoint loads none, the show endpoint loads
 * all nine.
 *
 * All monetary fields are decimal strings at scale 4.
 */
export interface Loan {
  // ---------------------------------------------------------------------------
  // Identity.
  // ---------------------------------------------------------------------------
  readonly id: number;
  readonly tenant_id: number;
  readonly borrower_shareholder_id: number;
  readonly loan_product_id: number;

  // ---------------------------------------------------------------------------
  // Lifecycle status.
  // ---------------------------------------------------------------------------
  readonly status: LoanStatus;

  // ---------------------------------------------------------------------------
  // Contractual terms.
  // ---------------------------------------------------------------------------
  /** Decimal string at scale 4. */
  readonly principal_amount: string;
  readonly term_months: number;
  /**
   * The loan's ISO 4217 currency code, or null.
   *
   * The `loans` table declares the column as nullable, and the
   * LoanResource emits it without casting — a pre-disbursement draft
   * loan emits `currency: null`. Every formatAmount call site must
   * read this field defensively (`loan.currency ?? ''`).
   */
  readonly currency: string | null;
  readonly purpose: string | null;
  readonly external_reference: string | null;

  // ---------------------------------------------------------------------------
  // Persisted projections and their computed sum.
  // ---------------------------------------------------------------------------
  readonly settled_amount: string;
  readonly outstanding_principal: string | null;
  readonly outstanding_interest: string | null;
  readonly outstanding_penalty: string;
  readonly outstanding_total: string;

  // ---------------------------------------------------------------------------
  // Schedule summary (nullable before disbursement).
  // ---------------------------------------------------------------------------
  readonly monthly_installment_amount: string | null;
  readonly total_scheduled_interest: string | null;
  readonly total_scheduled_repayment: string | null;

  // ---------------------------------------------------------------------------
  // Lifecycle dates — ISO + localized display siblings, paired.  (CR-L2)
  // ---------------------------------------------------------------------------
  readonly application_date: string;
  readonly application_date_display: string;
  readonly decision_date: string | null;
  readonly decision_date_display: string | null;
  readonly disbursement_date: string | null;
  readonly disbursement_date_display: string | null;
  readonly maturity_date: string | null;
  readonly maturity_date_display: string | null;
  readonly closed_at: string | null;
  readonly closed_at_display: string | null;
  readonly created_at: string;
  readonly created_at_display: string;
  readonly updated_at: string;
  readonly updated_at_display: string;

  // ---------------------------------------------------------------------------
  // Actor FK ids (always present).
  // ---------------------------------------------------------------------------
  readonly approved_by: number | null;
  readonly disbursed_by: number | null;
  readonly created_by: number | null;

  // ---------------------------------------------------------------------------
  // Policy freeze.
  // ---------------------------------------------------------------------------
  readonly frozen_policy_version_id: number | null;
  readonly frozen_policy_version?: LoanPolicyVersionSummary;

  // ---------------------------------------------------------------------------
  // Optional relations, present only when the controller eager-loaded them.
  //
  // The show endpoint (GET /api/loans/{loan}) eager-loads all nine; the
  // portal's /me endpoint eager-loads none.
  // ---------------------------------------------------------------------------
  readonly borrower?: LoanBorrowerSummary;
  readonly product?: LoanProduct;
  readonly approved_by_user?: LoanActorSummary | null;
  readonly disbursed_by_user?: LoanActorSummary | null;
  readonly created_by_user?: LoanActorSummary | null;
  readonly installments?: readonly LoanInstallment[];
  readonly collaterals?: readonly LoanCollateral[];
  readonly restructurings?: readonly LoanRestructuring[];
  readonly write_off?: LoanWriteOff | null;
  readonly status_histories?: readonly LoanStatusHistory[];
}

/**
 * The response shape of GET /api/loans/me (CR-L1).
 *
 * Mirrors the Shareholder module's MyShareholderResponse and the Wallet
 * module's MyWalletResponse in structure, with `loans` (a collection)
 * in place of `shareholder` / `wallet` (a single object or null).
 *
 * The `linked: false` outcome collapses every reason the caller has no
 * loans into a single shape. No distinguishing signal is returned.
 * The list is NOT paginated.
 */
export interface MyLoansResponse {
  readonly linked: boolean;
  readonly loans: readonly Loan[];
}

// =============================================================================
// Loan — embedded summaries
// =============================================================================

/**
 * The policy-version summary the LoanResource embeds under
 * `frozen_policy_version` when the relation is eager-loaded.
 *
 * The emitted fields identify the version without exposing its
 * payload. The `version` field is a string in the schema but the
 * resource casts neither way; declaring it as `string | number | null`
 * matches what the wire can carry.
 */
export interface LoanPolicyVersionSummary {
  readonly id: number;
  readonly policy_type: string;
  readonly version: string | number | null;
}

/**
 * The actor summary the LoanResource emits for `approved_by_user`,
 * `disbursed_by_user`, and `created_by_user`.
 */
export interface LoanActorSummary {
  readonly id: number;
  readonly email: string | null;
  readonly name: string | null;
}

/**
 * The borrower summary the LoanResource embeds under `borrower` when
 * the relation is eager-loaded.
 *
 * The Loan domain's borrower summary is deliberately thin: three
 * identifying columns, no composed name.
 */
export interface LoanBorrowerSummary {
  readonly id: number;
  readonly tenant_id: number;
  readonly user_id: number | null;
}

// =============================================================================
// Loan Product
// =============================================================================

/**
 * The Loan Product Resource shape (A.70, amended by CR-L2).
 *
 * The full product catalogue entry. Emitted by the catalogue endpoint
 * (GET /api/loans/products) and embedded under `Loan.product` when
 * the product relation is eager-loaded.
 *
 * All monetary bounds are decimal strings at scale 4. The term bounds
 * are integers.
 */
export interface LoanProduct {
  readonly id: number;
  readonly tenant_id: number;
  readonly code: string;
  readonly name_am: string | null;
  readonly name_en: string | null;
  readonly display_name: string;
  readonly description_am: string | null;
  readonly description_en: string | null;
  readonly purpose: string | null;
  readonly currency: string;
  readonly min_principal: string;
  readonly max_principal: string;
  readonly min_term_months: number;
  readonly max_term_months: number;
  readonly default_installment_frequency: string;
  readonly product_rules_policy_version_id: number | null;
  readonly has_policy_version: boolean;
  readonly is_active: boolean;
  readonly created_at: string;
  readonly created_at_display: string;
  readonly updated_at: string;
  readonly updated_at_display: string;
}

/**
 * @deprecated Use `LoanProduct` instead. The wire emits the full
 * product resource shape when the relation is loaded; this name was
 * an understated declaration from CR-L3. Retained as an alias so the
 * portal's service layer (CR-L3 file 2) continues to compile without
 * modification.
 */
export type LoanProductSummary = LoanProduct;

// =============================================================================
// Loan Installment
// =============================================================================

/**
 * One installment of the loan's contractual schedule.
 *
 * Mirrors `LoanInstallmentResource` (A.71, CR-L2). All nine monetary
 * fields are decimal strings at scale 4; the three `remaining_*`
 * fields are computed server-side by bcmath helpers and floor at zero.
 */
export interface LoanInstallment {
  readonly id: number;
  readonly loan_id: number;
  readonly installment_number: number;

  /** ISO 8601 date (midnight) + localized display sibling. */
  readonly due_date: string | null;
  readonly due_date_display: string | null;

  // Expected triple (immutable).
  readonly expected_principal: string;
  readonly expected_interest: string;
  readonly expected_total: string;

  // Settled triple (mutable).
  readonly settled_principal: string;
  readonly settled_interest: string;
  readonly settled_amount: string;

  // Remaining triple (computed server-side, floored at zero).
  readonly remaining_principal: string;
  readonly remaining_interest: string;
  readonly remaining_total: string;

  readonly status: LoanInstallmentStatus;

  readonly created_at: string;
  readonly created_at_display: string;
  readonly updated_at: string;
  readonly updated_at_display: string;
}

// =============================================================================
// Loan Collateral
// =============================================================================

/**
 * The Loan Collateral Resource shape (A.72, amended by CR-L2).
 *
 * Both pledge linkage columns and both valuation triples are emitted
 * unconditionally; the type field determines which is meaningful.
 */
export interface LoanCollateral {
  readonly id: number;
  readonly loan_id: number;
  readonly collateral_type: CollateralType;
  readonly description: string;
  readonly external_reference: string | null;

  // Pledge linkage (populated for shareholding-typed collateral).
  readonly pledged_shareholding_id: number | null;
  readonly pledged_quantity: string | null;

  // Valuation triple (required for external-typed; optional for shareholding-typed).
  readonly valuation_amount: string | null;
  readonly valuation_currency: string | null;
  readonly valuation_date: string | null;
  readonly valuation_date_display: string | null;

  // Lifecycle.
  readonly status: CollateralStatus;
  readonly registered_at: string | null;
  readonly registered_at_display: string | null;
  readonly registered_by: number | null;
  readonly released_at: string | null;
  readonly released_at_display: string | null;
  readonly release_reason: string | null;
  readonly released_by: number | null;

  // Computed predicates.
  readonly is_external: boolean;
  readonly is_shareholding: boolean;
  readonly is_registered: boolean;
  readonly is_released: boolean;
  readonly has_pledge: boolean;
  readonly has_valuation: boolean;

  // Optional embedded summaries.
  readonly pledged_share_holding?: LoanPledgedShareHoldingSummary | null;
  readonly registered_by_user?: LoanActorSummary | null;
  readonly released_by_user?: LoanActorSummary | null;

  readonly created_at: string;
  readonly created_at_display: string;
  readonly updated_at: string;
  readonly updated_at_display: string;
}

/** The pledged-shareholding summary embedded under a shareholding-typed collateral. */
export interface LoanPledgedShareHoldingSummary {
  readonly id: number;
  readonly shareholder_id: number;
  readonly share_class_id: number;
  readonly current_quantity: string;
}

// =============================================================================
// Loan Status History
// =============================================================================

/**
 * One row of a loan's append-only lifecycle log (A.76, CR-L2).
 *
 * The initial-creation row carries `from_status = null`; every
 * subsequent row carries a non-null `from_status`. The three computed
 * predicates let a client branch without inspecting the raw values.
 */
export interface LoanStatusHistory {
  readonly id: number;
  readonly loan_id: number;
  readonly from_status: LoanStatus | null;
  readonly to_status: LoanStatus;
  readonly transition_reason: string | null;
  readonly actor_user_id: number | null;
  readonly actor_user?: LoanActorSummary | null;
  readonly occurred_at: string;
  readonly occurred_at_display: string;
  readonly created_at: string | null;
  readonly created_at_display: string | null;
  readonly was_automatic: boolean;
  readonly is_initial_creation: boolean;
  readonly is_transition: boolean;
}

// =============================================================================
// Loan Restructuring
// =============================================================================

/**
 * One restructuring-history entry, emitted inline by
 * `LoanResource::restructuringSummary()` (A.69, CR-L2).
 *
 * No dedicated resource class exists in the Phase 2C manifest; the
 * payload is built inline. Every monetary field is a decimal string
 * at scale 4.
 */
export interface LoanRestructuring {
  readonly id: number;

  readonly previous_policy_version_id: number | null;
  readonly previous_outstanding_principal: string;
  readonly previous_outstanding_interest: string;
  readonly previous_outstanding_penalty: string;
  readonly previous_installment_count: number;
  readonly previous_maturity_date: string | null;
  readonly previous_maturity_date_display: string | null;

  readonly new_policy_version_id: number | null;
  readonly new_principal_amount: string;
  readonly new_term_months: number;
  readonly new_installment_count: number;
  readonly new_maturity_date: string | null;
  readonly new_maturity_date_display: string | null;
  readonly new_total_scheduled_repayment: string;

  readonly reason: string;
  readonly restructured_at: string | null;
  readonly restructured_at_display: string | null;
  readonly restructured_by: number | null;

  readonly created_at: string;
  readonly created_at_display: string;
  readonly updated_at: string;
  readonly updated_at_display: string;
}

// =============================================================================
// Loan Write-Off
// =============================================================================

/**
 * The write-off record, emitted inline by
 * `LoanResource::writeOffSummary()` (A.69, CR-L2).
 *
 * A loan may be written off at most once; the `write_off` field on
 * `Loan` is null until that happens.
 */
export interface LoanWriteOff {
  readonly id: number;
  readonly write_off_amount: string;
  readonly outstanding_principal_at_writeoff: string;
  readonly outstanding_interest_at_writeoff: string;
  readonly outstanding_penalty_at_writeoff: string;
  readonly reason: string;
  readonly written_off_at: string | null;
  readonly written_off_at_display: string | null;
  readonly written_off_by: number | null;
  readonly created_at: string;
  readonly created_at_display: string;
  readonly updated_at: string;
  readonly updated_at_display: string;
}

// =============================================================================
// Loan Schedule
// =============================================================================

/**
 * The Loan Schedule Resource shape (A.73, CR-L2).
 *
 * A narrow projection over the loan aggregate: identity + terms +
 * schedule-summary columns + the `totals` block + the installments
 * collection. The `totals` and `installments` fields are both present
 * only when the controller eager-loaded the installments relation.
 */
export interface LoanSchedule {
  readonly loan_id: number;
  readonly tenant_id: number;
  readonly borrower_shareholder_id: number;
  readonly loan_product_id: number;
  readonly status: LoanStatus;
  readonly currency: string | null;
  readonly principal_amount: string;
  readonly term_months: number;
  readonly monthly_installment_amount: string | null;
  readonly total_scheduled_interest: string | null;
  readonly total_scheduled_repayment: string | null;
  readonly maturity_date: string | null;
  readonly maturity_date_display: string | null;
  readonly totals?: LoanScheduleTotals;
  readonly installments?: readonly LoanInstallment[];
}

/**
 * The aggregate totals over a loan's active installments.
 *
 * Monetary sums are decimal strings at scale 4, computed with BCMath.
 * The counts section reports every status separately, including
 * superseded.
 */
export interface LoanScheduleTotals {
  readonly installment_count: number;
  readonly active_installment_count: number;
  readonly pending_count: number;
  readonly partial_count: number;
  readonly settled_count: number;
  readonly overdue_count: number;
  readonly superseded_count: number;

  readonly total_expected_principal: string;
  readonly total_expected_interest: string;
  readonly total_expected_repayment: string;

  readonly total_settled_principal: string;
  readonly total_settled_interest: string;
  readonly total_settled_amount: string;

  readonly total_remaining_principal: string;
  readonly total_remaining_interest: string;
  readonly total_remaining_total: string;
}

// =============================================================================
// Loan Statement
// =============================================================================

/**
 * The Loan Statement Resource shape (A.74).
 *
 * A composite serialization assembled by `LoanStatementController` from
 * every monetary-movement source on the loan. The resource is a pure
 * serializer; the controller performs the aggregation.
 */
export interface LoanStatement {
  readonly loan: LoanStatementHeader;
  readonly period: LoanStatementPeriod;
  readonly opening_balance: LoanStatementBalance;
  readonly lines: readonly LoanStatementLine[];
  readonly closing_balance: LoanStatementBalance;
  readonly totals: LoanStatementTotals;
}

/** The loan's schedule-relevant identity, per the statement header. */
export interface LoanStatementHeader {
  readonly id: number;
  readonly tenant_id: number;
  readonly borrower_shareholder_id: number;
  readonly loan_product_id: number;
  readonly status: LoanStatus;
  readonly currency: string | null;
  readonly principal_amount: string;
  readonly term_months: number;
  readonly application_date: string | null;
  readonly decision_date: string | null;
  readonly disbursement_date: string | null;
  readonly maturity_date: string | null;
  readonly closed_at: string | null;
}

/** The chronological range the statement covers. */
export interface LoanStatementPeriod {
  readonly from: string | null;
  readonly to: string | null;
}

/** A four-component balance at the opening, closing, or per-line level. */
export interface LoanStatementBalance {
  readonly principal: string | null;
  readonly interest: string | null;
  readonly penalty: string | null;
  readonly total: string | null;
}

/**
 * One chronological line of the statement.
 *
 * The `type` is one of: `disbursement`, `interest_accrual`,
 * `penalty_accrual`, `repayment`, `restructure`, `write_off`,
 * `collateral_release`, `status_change`. The `meta` block carries
 * type-specific detail.
 */
export interface LoanStatementLine {
  readonly occurred_at: string | null;
  readonly type: string | null;
  readonly description: string | null;
  readonly principal_delta: string | null;
  readonly interest_delta: string | null;
  readonly penalty_delta: string | null;
  readonly total_delta: string | null;
  readonly running_balance: LoanStatementBalance;
  readonly reference_type: string | null;
  readonly reference_id: number | null;
  readonly meta: Record<string, unknown> | null;
}

/** The six aggregate-movement buckets the statement totals carry. */
export interface LoanStatementTotals {
  readonly total_disbursed: string | null;
  readonly total_interest_accrued: string | null;
  readonly total_penalty_accrued: string | null;
  readonly total_repaid: string | null;
  readonly total_restructured: string | null;
  readonly total_written_off: string | null;
}

// =============================================================================
// Loan Reconciliation
// =============================================================================

/**
 * The Loan Reconciliation Resource shape (A.75).
 *
 * A near-passthrough over the reconciler's report array. The composite
 * sections (`loan_projected`, `wallet_linked`, `contractual`,
 * `wallet_payments`, `per_installment`, `divergence`, `provenance`)
 * are emitted verbatim from the reconciler; their precise shapes are
 * documented on the service, not on this resource. The one typed field
 * is `is_balanced` — the SINGLE authoritative boolean derived from the
 * aggregate invariant check.
 */
export interface LoanReconciliation {
  readonly loan_id: number;
  readonly currency: string | null;
  readonly status: LoanStatus | null;
  readonly reconciled_at: string | null;
  readonly loan_projected: Record<string, unknown>;
  readonly wallet_linked: Record<string, unknown>;
  readonly contractual: Record<string, unknown>;
  readonly wallet_payments: Record<string, unknown>;
  readonly per_installment: readonly Record<string, unknown>[];
  readonly divergence: Record<string, unknown>;
  readonly is_balanced: boolean;
  readonly provenance: Record<string, unknown>;
}

// =============================================================================
// Pagination
// =============================================================================

/**
 * The nested pagination meta the loan list endpoint emits.
 *
 * LoanController::respondWithLoans wraps pagination inside a
 * `pagination` object. This differs from the flat pagination meta the
 * wallet module declares — the two endpoints' controllers use
 * different envelope shapes.
 */
export interface LoansPaginationMeta {
  readonly current_page: number;
  readonly per_page: number;
  readonly total: number;
  readonly last_page: number;
  readonly from: number | null;
  readonly to: number | null;
}

/** The list endpoint's return shape. */
export interface PaginatedLoans {
  readonly items: readonly Loan[];
  readonly meta: {
    readonly pagination?: LoansPaginationMeta;
  };
}

// =============================================================================
// Query types
// =============================================================================

/**
 * Query parameters accepted by the loans index.
 *
 * The five filters mirror `LoanController::resolveIndexFilters()` (A.77).
 * There is no `search` parameter — the backend does not support one.
 */
export type ListLoansQuery = {
  readonly page?: number;
  readonly per_page?: number;
  readonly status?: LoanStatus;
  readonly borrower_shareholder_id?: number;
  readonly loan_product_id?: number;
  readonly in_arrears?: boolean;
  readonly active_only?: boolean;
  readonly [key: string]: string | number | boolean | undefined;
};

/**
 * Query parameters accepted by the loan-products index.
 *
 * `active_only` restricts the catalogue to products currently offered
 * for new applications.
 */
export type ListLoanProductsQuery = {
  readonly active_only?: boolean;
  readonly [key: string]: string | number | boolean | undefined;
};

// =============================================================================
// Request payloads
// =============================================================================

/**
 * Payload for `POST /api/loans` (StoreLoanRequest, A.60).
 *
 * The service resolves the borrower and product; the frontend supplies
 * their numeric ids. `principal_amount` is a decimal string; the
 * backend is authoritative for its precision and range.
 */
export interface StoreLoanPayload {
  readonly borrower_shareholder_id: number;
  readonly loan_product_id: number;
  readonly principal_amount: string;
  readonly term_months: number;
  readonly purpose?: string | null;
  readonly external_reference?: string | null;
}

/**
 * Payload for `POST /api/loans/{loan}/approve` (ApproveLoanRequest, A.61).
 *
 * `reason` is OPTIONAL — approval is not a reason-required transition.
 */
export interface ApproveLoanPayload {
  readonly reason?: string | null;
}

/**
 * Payload for `POST /api/loans/{loan}/reject` (RejectLoanRequest, A.62).
 *
 * `reason` is REQUIRED — rejection is a reason-required transition.
 */
export interface RejectLoanPayload {
  readonly reason: string;
}

/**
 * Payload for `POST /api/loans/{loan}/disburse` (DisburseLoanRequest, A.63).
 *
 * `description` is OPTIONAL; the service generates a default when
 * omitted.
 */
export interface DisburseLoanPayload {
  readonly description?: string | null;
}

/**
 * Payload for `POST /api/loans/{loan}/restructure` (StoreRestructureRequest, A.65).
 *
 * The three `new_*` fields describe the terms the restructured loan
 * will carry. `new_policy_version_id` refers to a versioned
 * `loan_product_rules` policy; the service validates its existence and
 * product compatibility.
 */
export interface StoreRestructurePayload {
  readonly new_principal_amount: string;
  readonly new_term_months: number;
  readonly new_policy_version_id: number;
  readonly reason: string;
}

/**
 * Payload for `POST /api/loans/{loan}/writeoff` (StoreWriteOffRequest, A.66).
 *
 * `reason` is REQUIRED — all three write-off transitions are
 * reason-required.
 */
export interface StoreWriteOffPayload {
  readonly reason: string;
}

/**
 * One allocation instruction inside a repayment payload.
 *
 * The service resolves each `obligation_id` through the loan-linked
 * Wallet obligations and applies the instruction in order.
 */
export interface StoreRepaymentAllocation {
  readonly obligation_id: number;
  readonly amount: string;
}

/**
 * Payload for `POST /api/loans/{loan}/repay` (StoreRepaymentRequest, A.64).
 *
 * The allocation instructions must sum EXACTLY to `amount`. The
 * request performs the sum check at the HTTP boundary with BCMath at
 * scale 4; the service re-checks for programmatic callers.
 */
export interface StoreRepaymentPayload {
  readonly amount: string;
  readonly allocations: readonly StoreRepaymentAllocation[];
  readonly received_at?: string | null;
  readonly reference_type?: string | null;
  readonly reference_id?: string | null;
  readonly description?: string | null;
}

/**
 * Payload for `POST /api/loans/{loan}/collateral` (StoreCollateralRequest, A.67).
 *
 * The per-type conditional requirements (external requires valuation
 * triple and forbids pledge linkage; shareholding requires pledge
 * linkage and permits the valuation triple all-or-none) are enforced
 * server-side. The payload type declares every field optional at the
 * type level; the caller supplies what the type requires.
 */
export interface StoreCollateralPayload {
  readonly collateral_type: CollateralType;
  readonly description: string;
  readonly external_reference?: string | null;
  readonly pledged_shareholding_id?: number | null;
  readonly pledged_quantity?: string | null;
  readonly valuation_amount?: string | null;
  readonly valuation_currency?: string | null;
  readonly valuation_date?: string | null;
}

/**
 * Payload for
 * `POST /api/loans/{loan}/collateral/{collateral}/release`
 * (ReleaseCollateralRequest, A.68).
 *
 * `reason` is REQUIRED — a collateral release is not state-machine
 * gated, but the frozen A10 decision requires an operator-supplied
 * justification.
 */
export interface ReleaseCollateralPayload {
  readonly reason: string;
}

// =============================================================================
// Endpoints — reads
// =============================================================================

/**
 * GET /loans — list the tenant's loans.
 *
 * The response set is scope-narrowed by the caller's permissions; a
 * caller holding only `loan.view_own` sees only their own loans. The
 * pagination meta is nested under `meta.pagination`.
 */
export async function listLoans(
  query: ListLoansQuery = {},
): Promise<PaginatedLoans> {
  const response = await api.getWithMeta<readonly Loan[]>(
    '/api/loans',
    { params: query },
  );
  const rawMeta = (response.meta ?? {}) as { pagination?: LoansPaginationMeta };
  return {
    items: response.data,
    meta: { pagination: rawMeta.pagination },
  };
}

/**
 * GET /loans/me — the authenticated caller's own loans.
 *
 * Returns the two-outcome identity contract described on
 * `MyLoansResponse`. Takes no arguments; the backend resolves the
 * caller's own loans server-side.
 */
export function getMyLoans(): Promise<MyLoansResponse> {
  return api.get<MyLoansResponse>('/api/loans/me');
}

/**
 * GET /loans/{loan} — a single loan aggregate.
 *
 * The controller eager-loads the borrower, product, policyVersion,
 * installments, collaterals, restructurings, writeOff, and
 * statusHistories relations; every one is optional on the `Loan`
 * interface.
 */
export function getLoan(id: number): Promise<Loan> {
  return api.get<Loan>(`/api/loans/${id}`);
}

/**
 * GET /loans/products — the tenant's loan product catalogue.
 *
 * The response is NOT paginated — the catalogue is a bounded set.
 * Pass `{ active_only: true }` to restrict to currently-offered
 * products.
 */
export function listLoanProducts(
  query: ListLoanProductsQuery = {},
): Promise<readonly LoanProduct[]> {
  return api.get<readonly LoanProduct[]>('/api/loans/products', { params: query });
}

/**
 * GET /loans/{loan}/schedule — the loan's contractual schedule.
 *
 * The controller eager-loads the installments relation; both `totals`
 * and `installments` are present on the response.
 */
export function getLoanSchedule(id: number): Promise<LoanSchedule> {
  return api.get<LoanSchedule>(`/api/loans/${id}/schedule`);
}

/**
 * GET /loans/{loan}/statement — the loan's statement view.
 */
export function getLoanStatement(id: number): Promise<LoanStatement> {
  return api.get<LoanStatement>(`/api/loans/${id}/statement`);
}

/**
 * GET /loans/{loan}/reconciliation — the reconciliation report.
 */
export function getLoanReconciliation(id: number): Promise<LoanReconciliation> {
  return api.get<LoanReconciliation>(`/api/loans/${id}/reconciliation`);
}

/**
 * GET /loans/{loan}/collateral — the loan's collateral records.
 *
 * The response includes both registered and released collaterals — the
 * full security history. Not paginated.
 */
export function listLoanCollaterals(id: number): Promise<readonly LoanCollateral[]> {
  return api.get<readonly LoanCollateral[]>(`/api/loans/${id}/collateral`);
}

// =============================================================================
// Endpoints — writes
// =============================================================================

/**
 * POST /loans — create a new loan in the `draft` state.
 */
export function createLoan(payload: StoreLoanPayload): Promise<Loan> {
  return api.post<Loan>('/api/loans', payload);
}

/**
 * POST /loans/{loan}/approve — record an approval decision.
 */
export function approveLoan(
  id: number,
  payload: ApproveLoanPayload = {},
): Promise<Loan> {
  return api.post<Loan>(`/api/loans/${id}/approve`, payload);
}

/**
 * POST /loans/{loan}/reject — record a rejection decision.
 */
export function rejectLoan(
  id: number,
  payload: RejectLoanPayload,
): Promise<Loan> {
  return api.post<Loan>(`/api/loans/${id}/reject`, payload);
}

/**
 * POST /loans/{loan}/disburse — disburse an approved loan.
 */
export function disburseLoan(
  id: number,
  payload: DisburseLoanPayload = {},
): Promise<Loan> {
  return api.post<Loan>(`/api/loans/${id}/disburse`, payload);
}

/**
 * POST /loans/{loan}/restructure — restructure a loan.
 */
export function restructureLoan(
  id: number,
  payload: StoreRestructurePayload,
): Promise<Loan> {
  return api.post<Loan>(`/api/loans/${id}/restructure`, payload);
}

/**
 * POST /loans/{loan}/writeoff — write off a loan.
 */
export function writeOffLoan(
  id: number,
  payload: StoreWriteOffPayload,
): Promise<Loan> {
  return api.post<Loan>(`/api/loans/${id}/writeoff`, payload);
}

/**
 * POST /loans/{loan}/repay — record a repayment against a loan.
 *
 * The response is the refreshed loan, eager-loaded with the
 * installments relation so the client sees the per-installment
 * settlement effect of the repayment.
 */
export function repayLoan(
  id: number,
  payload: StoreRepaymentPayload,
): Promise<Loan> {
  return api.post<Loan>(`/api/loans/${id}/repay`, payload);
}

/**
 * POST /loans/{loan}/collateral — register a new collateral.
 */
export function storeLoanCollateral(
  id: number,
  payload: StoreCollateralPayload,
): Promise<LoanCollateral> {
  return api.post<LoanCollateral>(`/api/loans/${id}/collateral`, payload);
}

/**
 * POST /loans/{loan}/collateral/{collateral}/release — release a
 * collateral.
 */
export function releaseLoanCollateral(
  loanId: number,
  collateralId: number,
  payload: ReleaseCollateralPayload,
): Promise<LoanCollateral> {
  return api.post<LoanCollateral>(
    `/api/loans/${loanId}/collateral/${collateralId}/release`,
    payload,
  );
}