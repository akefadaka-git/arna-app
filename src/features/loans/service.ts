/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-LW1
 * =============================================================================
 *
 * File:      mase_app/src/features/loans/service.ts  (AMEND)
 * Unit:      CR-LW1 — Workspace loan views (service layer)
 * Delivery type:  Amendment — fifteen added pass-through wrappers; the
 *                 existing composite fetcher and two wrappers preserved.
 * Net lines:      +~470 lines
 *
 * Before (v1.0.0):
 *   The service exposed the portal's surface only: `getMyLoans()`,
 *   `getLoan(id)`, the composite `fetchLoanDetail(id)`, and a
 *   re-export of `formatAmount` from the wallet service. Three
 *   functions plus the monetary helper re-export.
 *
 * After (v1.1.0):
 *   Eighteen exported functions plus the `LoanDetail` interface plus
 *   the `formatAmount` re-export. The fifteen new pass-through
 *   wrappers cover every workspace endpoint the loan feature consumes:
 *
 *     Reads (6):
 *       listLoans               GET /api/loans
 *       listLoanProducts        GET /api/loans/products
 *       getLoanSchedule         GET /api/loans/{loan}/schedule
 *       getLoanStatement        GET /api/loans/{loan}/statement
 *       getLoanReconciliation   GET /api/loans/{loan}/reconciliation
 *       listLoanCollaterals     GET /api/loans/{loan}/collateral
 *
 *     Writes (9):
 *       createLoan              POST /api/loans
 *       approveLoan             POST /api/loans/{loan}/approve
 *       rejectLoan              POST /api/loans/{loan}/reject
 *       disburseLoan            POST /api/loans/{loan}/disburse
 *       restructureLoan         POST /api/loans/{loan}/restructure
 *       writeOffLoan            POST /api/loans/{loan}/writeoff
 *       repayLoan               POST /api/loans/{loan}/repay
 *       storeLoanCollateral     POST /api/loans/{loan}/collateral
 *       releaseLoanCollateral   POST /api/loans/{loan}/collateral/{id}/release
 *
 *   Every wrapper is a thin delegate to the corresponding function in
 *   `./api`. The service does not compose, cache, or hold state for any
 *   of them — the pages own their list state per Freeze §13.3.
 *
 *   The existing composite fetcher `fetchLoanDetail(id)` is preserved
 *   byte-for-byte. Its purpose — unwrapping the aggregate's optional
 *   `product` and `installments` fields into stable values — remains
 *   correct after the api.ts widening.
 *
 * Public surface delta:
 *   · Fifteen new exported functions.
 *   · The `LoanDetail` interface is unchanged; its `product` field
 *     still resolves to `LoanProductSummary` (now a type alias of
 *     `LoanProduct`), so no consumer breaks.
 *
 * Dependency note:
 *   · Depends on `./api` (CR-LW1 file 1, v1.1.0) for the fifteen new
 *     endpoint functions and their payload/return types.
 *   · Depends on `@/features/wallet/service` (v1.0.4, deployed) for
 *     the `formatAmount` re-export.
 *   · No config change, no Composer step.
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * MASES Phase 2 UI — Loan Feature Service
 * =============================================================================
 *
 * File:      mase_app/src/features/loans/service.ts
 * Layer:     Features (Loan domain)
 * Version:   1.1.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §12.5  Service-layer orchestration
 *              §13.3  Feature state lives in the feature module
 *            Loan domain MyLoanController.php (CR-L1, verified against source)
 *            Loan domain Routes/api.php (verified against source)
 *            Loan domain the nine FormRequests (A.60–A.68, verified against source)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.1.0  — workspace surface (CR-LW1). Fifteen new pass-through
 *          wrappers added; the existing composite fetcher and the two
 *          portal wrappers preserved.
 *
 * 1.0.0  — initial delivery (CR-L3). The portal's self-service
 *          surface: `getMyLoans`, `getLoan`, `fetchLoanDetail`, and
 *          the `formatAmount` re-export.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The orchestration layer between the loan API module (`./api`) and
 * the loan pages (both the portal's and the workspace's). It provides:
 *
 *   1. One composite fetcher — `fetchLoanDetail(id)` — that unwraps
 *      the aggregate's optional `product` and `installments` fields
 *      into stable values.
 *
 *   2. Eighteen thin pass-through wrappers over the API module's
 *      functions, so pages import one module rather than two.
 *
 *   3. A re-export of `formatAmount()` from the wallet service.
 *
 * -----------------------------------------------------------------------------
 * The composite fetcher is ONE call, not two
 * -----------------------------------------------------------------------------
 * The Loan domain's read surface for a single loan is the aggregate
 * endpoint `GET /loans/{loan}`. The controller eager-loads every
 * relation the portal's detail page consumes; a single request
 * therefore carries everything. Unlike the wallet service's composite
 * fetcher — which fans out to two endpoints — this one issues a single
 * request and does not need an all-or-nothing error semantic.
 *
 * The fetcher's only transformation is the `?? null` / `?? []` defaults
 * on the two optional fields, so the page reads a stable shape. See
 * the interface docblock below.
 *
 * -----------------------------------------------------------------------------
 * The `formatAmount` re-export
 * -----------------------------------------------------------------------------
 * The loan pages render monetary fields — principal amounts,
 * outstanding projections, installment amounts, schedule totals —
 * through the same fixed two-decimal formatter the wallet pages use.
 * Rather than duplicate the helper, this module re-exports the wallet
 * service's function. See the wallet service's docblock for the full
 * semantics (nullish guard, truncation discipline, float-avoidance).
 *
 * -----------------------------------------------------------------------------
 * What this service does NOT do
 * -----------------------------------------------------------------------------
 *   - It does not own list state. Per §13.3, a list used by one page
 *     lives in that page's `ref`. This service is stateless.
 *
 *   - It does not read the auth store. Permission gating is the page's
 *     responsibility via `PermissionGate` (Unit 10.7). The backend
 *     authorizes every request regardless.
 *
 *   - It does not classify errors. `NormalizedApiError` propagates
 *     unchanged; pages map the category (Freeze §11.4/§11.5).
 *
 *   - It does not navigate. Pages own their own navigation.
 *
 *   - It does not persist anything. No storage adapter, no cache.
 *
 *   - It does not perform monetary arithmetic. Every amount is a
 *     decimal string; the helper only reformats the display.
 *
 * =============================================================================
 */

import * as loanApi from './api';
import type {
  // Existing (portal) types.
  Loan,
  LoanInstallment,
  LoanProduct,
  MyLoansResponse,

  // Workspace types.
  LoanCollateral,
  LoanReconciliation,
  LoanSchedule,
  LoanStatement,

  // Query types.
  ListLoanProductsQuery,
  ListLoansQuery,

  // Payload types.
  ApproveLoanPayload,
  DisburseLoanPayload,
  PaginatedLoans,
  RejectLoanPayload,
  ReleaseCollateralPayload,
  StoreCollateralPayload,
  StoreLoanPayload,
  StoreRepaymentPayload,
  StoreRestructurePayload,
  StoreWriteOffPayload,
} from './api';

// Re-export the shared monetary presentation helper. See the file
// header §"The formatAmount re-export".
export { formatAmount } from '@/features/wallet/service';

// =============================================================================
// Public types
// =============================================================================

/**
 * The result of a composite loan-detail fetch.
 *
 * The `loan` field is the aggregate as returned by GET /api/loans/{loan}.
 * The `product` field is the loan's product, or `null` when the relation
 * was not eager-loaded (which does not occur on the show endpoint, but
 * is a defensible default). The `installments` field is the loan's
 * schedule, defaulted to an empty array when absent.
 *
 * The detail page reads `loan`, `product`, and `installments` from this
 * object. Any other relation the payload might carry (collaterals,
 * restructurings, write_off, status_histories, actor summaries) is
 * accessible through `loan` directly — the composite fetcher does not
 * unwrap them, because the pages that consume those relations already
 * have direct access via the raw aggregate.
 */
export interface LoanDetail {
  readonly loan: Loan;
  readonly product: LoanProduct | null;
  readonly installments: readonly LoanInstallment[];
}

// =============================================================================
// Composite fetch — the detail page's single read
// =============================================================================

/**
 * Fetch a loan's detail: the aggregate, its product, and its
 * installment schedule.
 *
 * Issues a single request — GET /api/loans/{loan} — which the backend
 * controller eager-loads with every relation the portal and the
 * workspace detail views read. The function unwraps the aggregate's
 * optional `product` and `installments` fields into stable values:
 * `product` defaults to `null`, `installments` defaults to an empty
 * array.
 *
 * @param id  the loan's primary key
 */
export async function fetchLoanDetail(id: number): Promise<LoanDetail> {
  const loan = await loanApi.getLoan(id);

  return {
    loan,
    product: loan.product ?? null,
    installments: loan.installments ?? [],
  };
}

// =============================================================================
// Pass-through wrappers — loan aggregate reads
// =============================================================================

/**
 * List the authenticated tenant's loans.
 *
 * The response set is scope-narrowed by the caller's permissions; a
 * caller holding only `loan.view_own` sees only their own loans. The
 * pagination meta is nested under `meta.pagination`.
 */
export function listLoans(
  query: ListLoansQuery = {},
): Promise<PaginatedLoans> {
  return loanApi.listLoans(query);
}

/**
 * List the authenticated caller's own loans.  (portal)
 *
 * Returns the two-outcome identity contract:
 *
 *     { linked: true,  loans: [ <LoanResource>, … ] }
 *     { linked: false, loans: [] }
 */
export function getMyLoans(): Promise<MyLoansResponse> {
  return loanApi.getMyLoans();
}

/**
 * Fetch a single loan's aggregate.
 *
 * Prefer `fetchLoanDetail()` when the page consumes the loan's
 * embedded product and installments; use this when only the loan row
 * itself is required.
 */
export function getLoan(id: number): Promise<Loan> {
  return loanApi.getLoan(id);
}

// =============================================================================
// Pass-through wrappers — loan aggregate writes
// =============================================================================

/**
 * Create a new loan in the `draft` state.
 */
export function createLoan(payload: StoreLoanPayload): Promise<Loan> {
  return loanApi.createLoan(payload);
}

/**
 * Record an approval decision on a loan.
 *
 * The `reason` field is optional — approval is not a reason-required
 * transition on the C4 state machine. An operator MAY supply context,
 * but no rejection-style justification is enforced.
 */
export function approveLoan(
  id: number,
  payload: ApproveLoanPayload = {},
): Promise<Loan> {
  return loanApi.approveLoan(id, payload);
}

/**
 * Record a rejection decision on a loan.
 *
 * The `reason` field is REQUIRED — the `under_review → rejected`
 * transition is in the frozen reason-required set.
 */
export function rejectLoan(
  id: number,
  payload: RejectLoanPayload,
): Promise<Loan> {
  return loanApi.rejectLoan(id, payload);
}

/**
 * Disburse an approved loan.
 *
 * The `description` field is optional; when omitted, the service
 * generates a default description for the Wallet principal obligation.
 */
export function disburseLoan(
  id: number,
  payload: DisburseLoanPayload = {},
): Promise<Loan> {
  return loanApi.disburseLoan(id, payload);
}

/**
 * Restructure a loan.
 *
 * The three `new_*` fields describe the terms the restructured loan
 * will carry. `new_policy_version_id` refers to a versioned
 * `loan_product_rules` policy; the service validates its existence and
 * product compatibility.
 */
export function restructureLoan(
  id: number,
  payload: StoreRestructurePayload,
): Promise<Loan> {
  return loanApi.restructureLoan(id, payload);
}

/**
 * Write off a loan.
 *
 * The `reason` field is REQUIRED — all three write-off transitions are
 * reason-required. The amount forgiven is derived by the service from
 * the loan's outstanding projections; the caller cannot supply it.
 */
export function writeOffLoan(
  id: number,
  payload: StoreWriteOffPayload,
): Promise<Loan> {
  return loanApi.writeOffLoan(id, payload);
}

// =============================================================================
// Pass-through wrappers — loan products
// =============================================================================

/**
 * List the tenant's loan product catalogue.
 *
 * The response is not paginated. Pass `{ active_only: true }` to
 * restrict to products currently offered for new applications.
 */
export function listLoanProducts(
  query: ListLoanProductsQuery = {},
): Promise<readonly LoanProduct[]> {
  return loanApi.listLoanProducts(query);
}

// =============================================================================
// Pass-through wrappers — schedule, statement, reconciliation
// =============================================================================

/**
 * Fetch a loan's contractual schedule.
 *
 * The controller eager-loads the installments relation, so both
 * `totals` and `installments` are present on the response.
 */
export function getLoanSchedule(id: number): Promise<LoanSchedule> {
  return loanApi.getLoanSchedule(id);
}

/**
 * Fetch a loan's statement view.
 */
export function getLoanStatement(id: number): Promise<LoanStatement> {
  return loanApi.getLoanStatement(id);
}

/**
 * Fetch a loan's reconciliation report.
 *
 * The report's `is_balanced` boolean is the authoritative verdict;
 * every other section is informational. See the api.ts docblock for
 * the composite sections' typing posture.
 */
export function getLoanReconciliation(id: number): Promise<LoanReconciliation> {
  return loanApi.getLoanReconciliation(id);
}

// =============================================================================
// Pass-through wrappers — repayment
// =============================================================================

/**
 * Record a repayment against a loan.
 *
 * The `allocations` array carries ordered instructions attributing
 * slices of the payment to specific Wallet obligations. The sum of the
 * instruction amounts must equal `amount` exactly.
 */
export function repayLoan(
  id: number,
  payload: StoreRepaymentPayload,
): Promise<Loan> {
  return loanApi.repayLoan(id, payload);
}

// =============================================================================
// Pass-through wrappers — collateral
// =============================================================================

/**
 * List a loan's collateral records.
 *
 * The response includes both registered and released collaterals — the
 * full security history. Not paginated.
 */
export function listLoanCollaterals(id: number): Promise<readonly LoanCollateral[]> {
  return loanApi.listLoanCollaterals(id);
}

/**
 * Register a new collateral against a loan.
 */
export function storeLoanCollateral(
  id: number,
  payload: StoreCollateralPayload,
): Promise<LoanCollateral> {
  return loanApi.storeLoanCollateral(id, payload);
}

/**
 * Release a collateral.
 *
 * The `reason` field is REQUIRED — a release is not state-machine
 * gated, but the frozen A10 decision requires an operator-supplied
 * justification.
 */
export function releaseLoanCollateral(
  loanId: number,
  collateralId: number,
  payload: ReleaseCollateralPayload,
): Promise<LoanCollateral> {
  return loanApi.releaseLoanCollateral(loanId, collateralId, payload);
}