/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-W2
 * =============================================================================
 *
 * File:      mase_app/src/features/wallet/service.ts  (AMEND)
 * Unit:      CR-W2 — Portal self-service wallet page (service pass-through)
 * Delivery type:  Amendment — one added type import, one added
 *                 pass-through wrapper, revision history, version bump.
 * Net lines:      +1 import; +13 lines function + docblock; ~25 lines
 *                 revision history entry.
 *
 * Before:
 *   The service exposed nine pass-through wrappers, one for every
 *   function in ./api as of v1.0.1 of that module. There was no
 *   wrapper for a self-service wallet read — the endpoint did not exist.
 *
 *   Consumers of the service that needed the caller's own wallet had no
 *   path: the existing getWallet(id) requires an id the caller cannot
 *   know, and the composite fetchWalletDetail(id) requires the same.
 *
 * After:
 *   A tenth pass-through wrapper is added:
 *
 *       getMyWallet(): Promise<MyWalletResponse>
 *
 *   It delegates to walletApi.getMyWallet() (./api v1.0.2), which calls
 *   GET /api/wallets/me — the CR-W1 self-service endpoint. The response
 *   is the two-outcome identity contract: { linked: true, wallet } or
 *   { linked: false, wallet: null }.
 *
 *   The wrapper is a pure pass-through, matching the shape of the nine
 *   existing wrappers in this file. No composition, no caching, no
 *   state — those concerns belong to the page (per Freeze §13.3) or to
 *   a future composite fetcher if one is ever needed for the /me path.
 *
 *   The import list gains MyWalletResponse from ./api. It is a
 *   type-only import, consistent with every other type imported from
 *   that module.
 *
 * Dependency note:
 *   · Depends on getMyWallet() and MyWalletResponse in ./api (CR-W2
 *     file 1, api v1.0.2). Until that file is deployed, this wrapper
 *     will not compile.
 *   · Depends on the CR-W1 backend endpoint GET /api/wallets/me at
 *     runtime. Until CR-W1 files 1 and 2 are deployed, a call to
 *     getMyWallet() will 404. The wrapper is written to the target
 *     contract; the transient runtime 404 is documented in ./api's
 *     deployment note.
 *
 *   · No new dependency, no config change, no Composer step. The file
 *     is a TypeScript module consumed by the frontend build.
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * MASES Phase 2 UI — Wallet Feature Service
 * =============================================================================
 *
 * File:      mase_app/src/features/wallet/service.ts
 * Layer:     Features (Wallet domain)
 * Version:   1.0.4
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §12.5  Service-layer orchestration
 *              §13.3  Feature state lives in the feature module
 *            Wallet domain Step 7 v1.1.0 §C.1 (Route surface)
 *            Wallet domain Step 7 v1.1.0 §C.6 (Tenant scoping order)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.4  — self-service pass-through wrapper (CR-W1 / CR-W2).
 *
 *          Adds getMyWallet(), a thin pass-through over the new
 *          GET /api/wallets/me endpoint delivered by CR-W1. The
 *          endpoint resolves the authenticated caller's own wallet
 *          and returns the two-outcome identity contract
 *          { linked, wallet } — mirroring the Shareholder domain's
 *          /api/shareholders/me contract.
 *
 *          The MyWalletResponse type is added to the import list from
 *          ./api. It is the return type of the new wrapper.
 *
 *          No existing function changed. No existing type changed. No
 *          signature of any of the nine prior pass-through wrappers,
 *          the composite fetcher, or the two monetary helpers changed.
 *
 * 1.0.3  — composite fetcher supplies the statement's required period.
 *
 *          The wallet-domain `/wallets/{wallet}/statement` controller
 *          requires both `from` and `to` on the request. The 1.0.2
 *          composite fetcher called the statement endpoint with an
 *          empty query, expecting the controller to apply a default
 *          period. That expectation was wrong: the controller returns
 *          422 VALIDATION_ERROR when either parameter is absent, and
 *          because `fetchWalletDetail` fans out via `Promise.all`,
 *          the statement's 422 rejected the whole composite — leaving
 *          WalletDetailView on its error state even though the wallet
 *          aggregate itself fetched successfully.
 *
 *          The fetcher now fills both parameters with defaults when
 *          the caller does not supply them:
 *
 *            from = today minus ten years (YYYY-MM-DD)
 *            to   = today            (YYYY-MM-DD)
 *
 *          A ten-year window is wide enough to include every entry a
 *          wallet on this platform can realistically have produced.
 *          A caller that wants a specific period passes it as
 *          `statementQuery` — the spread operator at the end of the
 *          resolution ensures an explicit caller value wins over the
 *          default. WalletStatementView (WF-14) is the sole caller
 *          that does this.
 *
 *          Two small date helpers are introduced to keep the ISO
 *          formatting in one place. They use the browser's local time,
 *          not UTC, because the controller's own date validation does
 *          not depend on timezone — it reads the string form.
 *
 *          No other function changed. `formatAmount`,
 *          `formatSignedAmount`, the nine pass-through wrappers, and
 *          every public type are byte-for-byte identical to 1.0.2.
 *
 * 1.0.2  — null/undefined guard on the monetary helpers.
 *
 *          The 1.0.1 `formatAmount` began with:
 *
 *              if (decimal === '') return decimal;
 *
 *          That check caught the empty-string case but let `null`
 *          and `undefined` through to `decimal.indexOf('.')`, which
 *          threw `TypeError: can't access property "indexOf", t is
 *          undefined`. The behaviour was exposed in production when
 *          the WalletListView balance cell called
 *          `formatAmount(row.balance, ...)` on a row whose `balance`
 *          field was `undefined` — the API emits the balance under
 *          `current_balance`, a name mismatch the `api.ts` interface
 *          also carried at the time (both fixed in FIX-3 / FIX-3a).
 *
 *          The blast radius was larger than the one cell: the
 *          DataTable renders all cells inside one Vue render pass,
 *          so a single throw prevented every data row from painting.
 *          The fix removes the entire class of trigger rather than
 *          the one instance — a future field-name drift now renders
 *          an empty cell, not a blank table.
 *
 *          Both helpers widen their `decimal` parameter to
 *          `string | null | undefined` and return `''` for nullish
 *          input. `formatSignedAmount` delegates to `formatAmount`
 *          first and skips the sign prefix when the magnitude is
 *          empty (which is what `formatAmount` returns for a nullish
 *          input), so the sign is never attached to nothing.
 *
 *          No other change. Function signatures widen (a superset of
 *          the previous types); existing string-typed call sites
 *          remain assignable without modification.
 *
 * 1.0.1  — production hardening:
 *          · Removed the unused `WalletEntry` import. The 1.0.0 file
 *            imported it but never referenced it; the type-check
 *            reported TS6196 at deployment time.
 *          · Fixed the `paddedPaddedFractional` typo in `formatAmount`.
 *            The 1.0.0 return statement referenced an identifier that
 *            was never declared; every non-empty call would have
 *            thrown `ReferenceError` at runtime. The type-check
 *            reported TS2552.
 *          · The composite fetcher's show-response cast now uses a
 *            named `WalletWithChildren` intersection type. The shape
 *            is documented once rather than inline at the call site.
 *            No runtime change.
 *          · Added `formatSignedAmount` — a companion to `formatAmount`
 *            that prefixes the display with `-` for debits and `+` for
 *            credits. Not consumed by any page today (the ledgers
 *            render debit and credit in separate columns), but the
 *            helper is delivered so a future CR that wants a single
 *            "amount" column has it ready.
 *          · Explicit return-type annotations on every exported
 *            function.
 *
 * 1.0.0  — initial delivery (WF-3). The orchestration layer between the
 *          wallet API module (WF-2) and the wallet pages: one composite
 *          detail fetcher, nine pass-through wrappers, one monetary
 *          presentation helper.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The orchestration layer between the wallet API module (WF-2) and the
 * wallet pages (WF-6, WF-9, WF-14; plus the portal's MyWalletPage,
 * CR-W2). It provides:
 *
 *   1. A composite detail fetcher — `fetchWalletDetail(id)` — that
 *      loads the wallet and its statement in parallel and bundles the
 *      wallet's three embedded child collections (obligations,
 *      payments, allocations) into a single `WalletDetail` object.
 *
 *   2. Thin pass-through wrappers over every function in `./api`, so
 *      pages import one module rather than two. Ten wrappers as of
 *      v1.0.4 — the original nine plus `getMyWallet()`.
 *
 *   3. Two monetary presentation helpers — `formatAmount` and
 *      `formatSignedAmount` — that render the backend's decimal
 *      strings at a fixed two-decimal precision with the currency
 *      code appended.
 *
 * -----------------------------------------------------------------------------
 * The composite fetcher is two calls, not five
 * -----------------------------------------------------------------------------
 * The Wallet domain's route surface exposes exactly TWO read endpoints
 * for a single wallet:
 *
 *     GET /wallets/{wallet}            — the wallet aggregate
 *     GET /wallets/{wallet}/statement  — the ledger projection
 *
 * There is no GET route for a wallet's obligations, payments, or
 * allocations. Those three entities have only write endpoints; they
 * are read through the wallet's show response. The composite fetcher
 * therefore fans out to the two available endpoints, not to five. The
 * three child collections come from the show response itself, if the
 * backend's `WalletController::show()` embeds them.
 *
 * The fetcher's all-or-nothing error semantic matches the shareholders
 * service's composite fetcher: if either request rejects, the whole
 * call rejects with the corresponding `NormalizedApiError`. The pages
 * render the same error state they would for a failed top-level fetch.
 *
 * -----------------------------------------------------------------------------
 * The statement period default (revision 1.0.3)
 * -----------------------------------------------------------------------------
 * The statement controller validates `from` and `to` as required. The
 * composite fetcher's job is "give me the wallet and its ledger", not
 * "give me a specific period", so it supplies a wide window when the
 * caller does not. See the 1.0.3 revision entry for the reasoning and
 * the exact defaults.
 *
 * -----------------------------------------------------------------------------
 * The self-service path (revision 1.0.4)
 * -----------------------------------------------------------------------------
 * The composite fetcher and the id-addressed wrappers all require a
 * wallet id the caller already knows — typically supplied by an
 * administrative page that obtained it from a list endpoint. The
 * portal's wallet page is different: the caller does not know their
 * own wallet's id, and even if they did, the endpoint would be
 * inappropriate (the portal's identity contract resolves the caller's
 * own record, not an id-addressed one).
 *
 * getMyWallet() is the portal path. It takes no arguments and returns
 * the two-outcome contract the /api/wallets/me endpoint produces. It
 * is a pure pass-through; it does not compose, cache, or hold state.
 *
 * There is deliberately no self-service composite fetcher (a
 * `fetchMyWalletDetail()` returning the wallet plus its statement).
 * The portal's wallet page shows a summary, not a ledger; a future CR
 * that wants the ledger on the portal would add such a fetcher then.
 *
 * -----------------------------------------------------------------------------
 * The cast on the show response
 * -----------------------------------------------------------------------------
 * The `Wallet` interface in `./api` does not declare `obligations`,
 * `payments`, or `allocations`. Its shape was proposed from the routes
 * file and the migration filenames; the exact response surface of the
 * show endpoint is not yet verified against a Resource class.
 *
 * The `WalletWithChildren` intersection type declared below names the
 * three optional children. The fetcher reads them via the intersection
 * and defaults each to an empty array when absent.
 *
 * When the Wallet domain's `WalletResource` is supplied, the `Wallet`
 * interface in `./api` gains the three fields as optional properties,
 * and `WalletWithChildren` collapses to a plain alias — a value-only
 * change with no signature change here or at any call site.
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
 *   - It does not read a translation layer. The backend emits
 *     `method_label` and similar localized strings server-side; this
 *     service passes them through unchanged.
 *
 *   - It does not persist anything. No storage adapter, no cache.
 *
 *   - It does not perform monetary arithmetic. Every amount is a
 *     decimal string.
 *
 * -----------------------------------------------------------------------------
 * The monetary presentation helpers
 * -----------------------------------------------------------------------------
 * The backend emits wallet balances, obligation amounts, payment
 * amounts, allocation amounts, and entry amounts as decimal strings at
 * the wallet's currency precision — never floats. The convention is
 * the same one the Shareholder domain uses for share quantities, with
 * one difference: money is displayed at a FIXED precision (two
 * decimals), not at a trimmed precision.
 *
 *     formatAmount('145',       'ETB') → '145.00 ETB'
 *     formatAmount('145.5',     'ETB') → '145.50 ETB'
 *     formatAmount('145.5000',  'ETB') → '145.50 ETB'
 *     formatAmount('1234.567',  'ETB') → '1234.56 ETB'
 *     formatAmount('',          'ETB') → ''
 *     formatAmount(null,        'ETB') → ''      ← 1.0.2
 *     formatAmount(undefined,   'ETB') → ''      ← 1.0.2
 *
 *     formatSignedAmount('145',      'debit',  'ETB') → '-145.00 ETB'
 *     formatSignedAmount('145',      'credit', 'ETB') → '+145.00 ETB'
 *     formatSignedAmount('145.5',    'debit',  'ETB') → '-145.50 ETB'
 *     formatSignedAmount('',         'debit',  'ETB') → ''
 *     formatSignedAmount(null,       'debit',  'ETB') → ''      ← 1.0.2
 *     formatSignedAmount(undefined,  'debit',  'ETB') → ''      ← 1.0.2
 *
 * Both helpers perform no rounding in the mathematical sense —
 * they TRUNCATE the fractional part to two digits, padding with zeros
 * when shorter. Truncation rather than rounding is deliberate: the
 * backend is authoritative for the value, and the frontend's job is to
 * render it at the display precision, not to alter it.
 *
 * Neither helper converts the string to a JavaScript `number`.
 * Monetary values must never pass through the float pipeline; both
 * helpers operate on the string directly.
 *
 * The trailing currency code is appended as-is. The platform's
 * `config/mases.php` declares a `currency_symbol` (`Br`) and a
 * `currency_position` (`before`); a future CR that wants locale-aware
 * currency formatting renders the symbol per the config. Until then,
 * the code (e.g. `ETB`) is appended after a single space — a
 * convention that reads unambiguously in both Amharic and English.
 * =============================================================================
 */

import * as walletApi from './api';
import type {
  AdjustWalletPayload,
  ListWalletsQuery,
  MyWalletResponse,
  PaginatedWallets,
  ReverseAllocationPayload,
  StoreAllocationPayload,
  StoreObligationPayload,
  StorePaymentPayload,
  StoreWalletPayload,
  Wallet,
  WalletAllocation,
  WalletObligation,
  WalletPayment,
  WalletStatement,
  WalletStatementQuery,
  WalletEntryDirection,
} from './api';

// =============================================================================
// Public types
// =============================================================================

/**
 * The result of a composite wallet-detail fetch.
 *
 * The `wallet` field is the aggregate root. The three child collections
 * are the wallet's embedded relations, defaulted to empty arrays when
 * the backend's show response does not carry them.
 *
 * The `statement` field is the wallet's ledger projection over the
 * period resolved by the fetcher (see its docblock, revision 1.0.3).
 */
export interface WalletDetail {
  readonly wallet: Wallet;
  readonly obligations: readonly WalletObligation[];
  readonly payments: readonly WalletPayment[];
  readonly allocations: readonly WalletAllocation[];
  readonly statement: WalletStatement;
}

/**
 * The intersection type the composite fetcher casts the show response
 * to. The three child collections are optional because the backend's
 * `WalletController::show()` may or may not embed them; when absent,
 * the fetcher defaults each to an empty array.
 */
type WalletWithChildren = Wallet & {
  readonly obligations?: readonly WalletObligation[];
  readonly payments?: readonly WalletPayment[];
  readonly allocations?: readonly WalletAllocation[];
};

// =============================================================================
// Composite fetch — the primary page-level read
// =============================================================================

/**
 * Format a Date as a `YYYY-MM-DD` string using the browser's local
 * timezone. Used to build the composite fetcher's default statement
 * period.
 *
 * Note: `Date.prototype.toISOString` returns a UTC ISO string; we
 * deliberately do NOT use it directly, because near midnight the
 * UTC date can differ from the user's local date by one day, and the
 * user's local date is what they mean by "today". The three-part
 * assembly below uses the local calendar fields instead.
 *
 * A small zero-pad helper keeps the month and day two digits.
 *
 * @internal
 */
function toLocalIsoDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * The composite fetcher's default statement period.
 *
 * Both endpoints of the period are returned from one call so the two
 * dates cannot straddle a midnight boundary — a fetcher that
 * separately computed `from` at 23:59:59.999 and `to` at 00:00:00.001
 * would produce a window with `to < from`, which the controller
 * rejects.
 *
 * Ten years is chosen as a bound that cannot be exceeded by any
 * wallet on the platform. When a wallet's data ever predates that
 * window, the caller passes an explicit `statementQuery` — the
 * WalletStatementView page does exactly this.
 *
 * @internal
 */
function defaultStatementPeriod(): { from: string; to: string } {
  const now = new Date();
  const tenYearsAgo = new Date(now.getTime());
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

  return {
    from: toLocalIsoDate(tenYearsAgo),
    to: toLocalIsoDate(now),
  };
}

/**
 * Fetch a wallet's full detail: the aggregate, its three embedded child
 * collections, and its statement.
 *
 * Two requests run in parallel: the wallet aggregate and the wallet
 * statement. All-or-nothing: if either rejects, the whole call rejects
 * with the corresponding `NormalizedApiError`.
 *
 * The three child collections (obligations, payments, allocations) are
 * read from the wallet's show response if the backend embeds them, and
 * default to empty arrays otherwise.
 *
 * -----------------------------------------------------------------------------
 * The statement period
 * -----------------------------------------------------------------------------
 * The statement controller validates `from` and `to` as required
 * (revision 1.0.3; the previous fetcher's assumption that the
 * controller defaulted the period was wrong — it returned 422, which
 * rejected the whole composite call). The fetcher now supplies a
 * default window when the caller does not:
 *
 *   from = today minus ten years (YYYY-MM-DD, local time)
 *   to   = today               (YYYY-MM-DD, local time)
 *
 * Both are computed in one helper so the two dates cannot straddle a
 * midnight boundary. A caller that wants a specific period passes it
 * as `statementQuery`; the spread at the end ensures the caller's
 * value wins over the default.
 *
 * @param id              the wallet's primary key
 * @param statementQuery  the optional period the statement covers
 */
export async function fetchWalletDetail(
  id: number,
  statementQuery: WalletStatementQuery = {},
): Promise<WalletDetail> {
  /*
   * Resolve the period: caller-supplied values win, missing values
   * fall back to the fetcher's default window. The two defaults are
   * computed together so they represent one consistent "now".
   */
  const defaultPeriod = defaultStatementPeriod();
  const resolvedQuery: WalletStatementQuery = {
    from: defaultPeriod.from,
    to: defaultPeriod.to,
    ...statementQuery,
  };

  const [walletResponse, statement] = await Promise.all([
    walletApi.getWallet(id),
    walletApi.getWalletStatement(id, resolvedQuery),
  ]);

  const walletWithChildren = walletResponse as WalletWithChildren;

  return {
    wallet: walletWithChildren,
    obligations: walletWithChildren.obligations ?? [],
    payments: walletWithChildren.payments ?? [],
    allocations: walletWithChildren.allocations ?? [],
    statement,
  };
}

// =============================================================================
// Pass-through wrappers — wallets
// =============================================================================

/**
 * List the tenant's wallets.
 */
export function listWallets(
  query: ListWalletsQuery = {},
): Promise<PaginatedWallets> {
  return walletApi.listWallets(query);
}

/**
 * Open a new wallet for a shareholder.
 */
export function createWallet(
  payload: StoreWalletPayload,
): Promise<Wallet> {
  return walletApi.createWallet(payload);
}

/**
 * Fetch a single wallet's aggregate. Prefer `fetchWalletDetail` when
 * the page needs the wallet's children; use this when only the wallet
 * itself is required.
 */
export function getWallet(id: number): Promise<Wallet> {
  return walletApi.getWallet(id);
}

/**
 * Fetch the authenticated caller's own wallet.  (CR-W2, v1.0.4)
 *
 * Self-service read — the portal's wallet page consumes this. Takes no
 * arguments; the backend resolves the caller's own wallet through the
 * tenant → user → shareholder → wallet chain.
 *
 * Returns the two-outcome identity contract:
 *
 *     { linked: true,  wallet: <WalletResource> }
 *     { linked: false, wallet: null }
 *
 * The `linked: false` outcome collapses every reason the caller has no
 * wallet — no shareholder link, a shareholder link but no wallet, a
 * wallet in another tenant — into a single response shape. See
 * MyWalletController's class docblock on the backend for the full
 * collapse reasoning.
 *
 * This wrapper is a pure pass-through. It does not compose the wallet
 * with its statement, does not cache, and does not hold state. A
 * future CR that needs the ledger on the portal would add a
 * `fetchMyWalletDetail()` composite fetcher then; the current scope
 * renders a summary, not a ledger.
 */
export function getMyWallet(): Promise<MyWalletResponse> {
  return walletApi.getMyWallet();
}

/**
 * Adjust a wallet's balance. Privileged — held by `super_admin` in the
 * frozen RBAC matrix.
 */
export function adjustWallet(
  id: number,
  payload: AdjustWalletPayload,
): Promise<Wallet> {
  return walletApi.adjustWallet(id, payload);
}

// =============================================================================
// Pass-through wrappers — obligations
// =============================================================================

/**
 * Record an obligation against a wallet.
 */
export function storeObligation(
  walletId: number,
  payload: StoreObligationPayload,
): Promise<WalletObligation> {
  return walletApi.storeObligation(walletId, payload);
}

// =============================================================================
// Pass-through wrappers — payments
// =============================================================================

/**
 * Record a payment into a wallet.
 */
export function storePayment(
  walletId: number,
  payload: StorePaymentPayload,
): Promise<WalletPayment> {
  return walletApi.storePayment(walletId, payload);
}

// =============================================================================
// Pass-through wrappers — allocations
// =============================================================================

/**
 * Record an allocation of a payment against an obligation.
 */
export function storeAllocation(
  walletId: number,
  payload: StoreAllocationPayload,
): Promise<WalletAllocation> {
  return walletApi.storeAllocation(walletId, payload);
}

/**
 * Reverse an allocation. Privileged — held by `super_admin` and
 * `platform_admin` in the frozen RBAC matrix.
 */
export function reverseAllocation(
  walletId: number,
  allocationId: number,
  payload: ReverseAllocationPayload = {},
): Promise<WalletAllocation> {
  return walletApi.reverseAllocation(walletId, allocationId, payload);
}

// =============================================================================
// Pass-through wrappers — statement
// =============================================================================

/**
 * Generate a wallet's statement for a period.
 *
 * Prefer `fetchWalletDetail` when the page needs the wallet and the
 * statement together; use this when only the statement is required.
 *
 * Unlike the composite fetcher, this wrapper does not supply a
 * default period — the caller is assumed to know what period it
 * wants. WalletStatementView (WF-14) is the intended consumer and
 * always passes a period.
 */
export function getWalletStatement(
  walletId: number,
  query: WalletStatementQuery = {},
): Promise<WalletStatement> {
  return walletApi.getWalletStatement(walletId, query);
}

// =============================================================================
// Presentation helpers — monetary handling
// =============================================================================

/**
 * Format a backend monetary decimal string for display.
 *
 * Renders the value at a fixed two-decimal precision, padding the
 * fractional part with zeros when shorter and truncating when longer.
 * Appends the currency code after a single space.
 *
 * Nullish input (`null` or `undefined`) and the empty string are both
 * rendered as the empty string. The nullish guard is deliberate: a
 * runtime value that is `undefined` — e.g. a cell reading a field
 * name the API does not emit — must not throw inside a table's render
 * pass, because one throw prevents every row from painting. A silent
 * empty cell is the correct failure mode for display code; the page's
 * error classifier is where a real backend defect surfaces.
 *
 * Truncation (not rounding) is deliberate. The backend is
 * authoritative for the value; the frontend renders at the display
 * precision without altering the number.
 *
 * The value is never converted to a JavaScript `number`. Monetary
 * values must not pass through the float pipeline.
 *
 * Examples:
 *
 *     formatAmount('145',      'ETB') → '145.00 ETB'
 *     formatAmount('145.5',    'ETB') → '145.50 ETB'
 *     formatAmount('145.5000', 'ETB') → '145.50 ETB'
 *     formatAmount('1234.567', 'ETB') → '1234.56 ETB'
 *     formatAmount('',         'ETB') → ''
 *     formatAmount(null,       'ETB') → ''
 *     formatAmount(undefined,  'ETB') → ''
 */
export function formatAmount(
  decimal: string | null | undefined,
  currency: string,
): string {
  /*
   * Nullish and empty-string guard. Returning the empty string (rather
   * than echoing `null` or `undefined`) keeps the return type a plain
   * `string` for call sites and renders as nothing in the template.
   */
  if (decimal === null || decimal === undefined || decimal === '') {
    return '';
  }

  /*
   * Split on the decimal point. When no point is present, the
   * fractional part is empty and the integer part is the whole
   * string.
   */
  const dot = decimal.indexOf('.');
  const integerPart = dot < 0 ? decimal : decimal.slice(0, dot);
  const fractionalPart = dot < 0 ? '' : decimal.slice(dot + 1);

  /*
   * Pad the fractional part to two digits and truncate to exactly
   * two. The `(fractionalPart + '00').slice(0, 2)` idiom produces
   * the correct result for every fractional-part length:
   *
   *     ''      → '00'
   *     '5'     → '50'
   *     '50'    → '50'
   *     '500'   → '50'
   *     '5678'  → '56'
   */
  const paddedFractional = (fractionalPart + '00').slice(0, 2);

  return `${integerPart}.${paddedFractional} ${currency}`;
}

/**
 * Format a backend monetary decimal string for display with an
 * explicit sign derived from the direction.
 *
 * Prefixes the output with `-` for a debit, `+` for a credit. The
 * value is otherwise formatted exactly as `formatAmount` renders it.
 *
 * Nullish and empty input produce the empty string, with no sign
 * prefix. The sign is only attached to a non-empty magnitude — never
 * to nothing.
 *
 * The helper is NOT consumed by any page today — the wallet ledgers
 * render debit and credit in separate columns. It is delivered for a
 * future CR that wants a single signed "amount" column.
 *
 * The same rules as `formatAmount` apply: no rounding, no float
 * conversion, empty/nullish string echoed as empty.
 *
 * Examples:
 *
 *     formatSignedAmount('145',      'debit',  'ETB') → '-145.00 ETB'
 *     formatSignedAmount('145',      'credit', 'ETB') → '+145.00 ETB'
 *     formatSignedAmount('145.5',    'debit',  'ETB') → '-145.50 ETB'
 *     formatSignedAmount('145.5000', 'credit', 'ETB') → '+145.50 ETB'
 *     formatSignedAmount('',         'debit',  'ETB') → ''
 *     formatSignedAmount(null,       'debit',  'ETB') → ''
 *     formatSignedAmount(undefined,  'debit',  'ETB') → ''
 */
export function formatSignedAmount(
  decimal: string | null | undefined,
  direction: WalletEntryDirection,
  currency: string,
): string {
  /*
   * Delegate the nullish / empty-string handling to `formatAmount`,
   * then check the result. This keeps the guard in exactly one place
   * — a future change to the empty-case behaviour propagates to both
   * helpers without a second edit.
   */
  const magnitude = formatAmount(decimal, currency);

  if (magnitude === '') {
    return '';
  }

  const sign = direction === 'debit' ? '-' : '+';

  /*
   * `formatAmount` appends the currency after a space, e.g.
   * "145.00 ETB". Prefixing the sign gives "-145.00 ETB" — the sign
   * is on the numeric part, the currency code carries no sign.
   */
  return `${sign}${magnitude}`;
}