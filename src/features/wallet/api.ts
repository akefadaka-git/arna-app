/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-W2
 * =============================================================================
 *
 * File:      mase_app/src/features/wallet/api.ts  (AMEND)
 * Unit:      CR-W2 — Portal self-service wallet page (API contract)
 * Delivery type:  Amendment — two additive interface changes, one new
 *                 function, revision history and endpoint-coverage note.
 * Net lines:      +4 interface fields; +1 interface (5 lines); +1 function
 *                 (7 lines); ~35 lines of docblock.
 *
 * Before:
 *   The Wallet interface declared the four date fields the WalletResource
 *   emitted at the time v1.0.1 was written — opened_at, closed_at,
 *   created_at, updated_at — each as a plain ISO 8601 string. There was
 *   no MyWalletResponse type, because the Wallet domain had no self-service
 *   endpoint. There was no getMyWallet() function, for the same reason.
 *
 *   WalletResource was amended by CR-W1 (v1.0.1 → v1.1.0) to emit a
 *   `_display` sibling for each of the four date fields, matching the
 *   P3 · Unit 2 convention already applied to the four Shareholder-domain
 *   resources. This file did not reflect that change — the Wallet
 *   interface on the frontend was behind the resource contract on the
 *   backend.
 *
 * After:
 *   The Wallet interface declares four new `_display` fields alongside
 *   the four ISO fields:
 *
 *     opened_at_display   — string
 *     closed_at_display   — string | null  (matches closed_at's nullability)
 *     created_at_display  — string
 *     updated_at_display  — string
 *
 *   All four are declared REQUIRED, not optional. The amended
 *   WalletResource emits them unconditionally; an optional declaration
 *   would weaken the contract for the sake of a hypothetical shape the
 *   backend does not produce. When the amended resource is deployed,
 *   every wallet payload — from /api/wallets, /api/wallets/{id}, and
 *   /api/wallets/me alike — carries all four fields.
 *
 *   A new MyWalletResponse interface is added, mirroring the
 *   Shareholder module's MyShareholderResponse:
 *
 *     interface MyWalletResponse {
 *       readonly linked: boolean;
 *       readonly wallet: Wallet | null;
 *     }
 *
 *   A new getMyWallet() function is added, calling the CR-W1 route
 *   GET /api/wallets/me. It returns Promise<MyWalletResponse> — the
 *   two-outcome identity contract the amended controller produces.
 *
 * Dependency note:
 *   · The four `_display` fields will be absent from the live response
 *     until the amended WalletResource (CR-W1 file 3) is deployed.
 *     See that file's deployment note: it depends on the
 *     RendersLocalizedDates trait and LocalizationService::
 *     formatEthiopianDateMedium() (Track A step 1) and on
 *     composer dump-autoload (Track A step 3). Until Track A is closed,
 *     a caller reading wallet.opened_at_display receives undefined at
 *     runtime even though the TypeScript contract says string.
 *
 *     This is a known transient. The declaration is written to the
 *     deployed contract, not to the current runtime state; a contract
 *     that lags behind its target cannot be relied on once the target
 *     is deployed. If the transient matters for development, the
 *     amended resource can be deployed alongside this file.
 *
 *   · The getMyWallet() function will 404 until the CR-W1 route
 *     amendment (CR-W1 file 2) is deployed. Same reasoning: contract
 *     matches target, not transient.
 *
 *   · No new class, no new dependency, no config change. The module
 *     remains a pure API-client wrapper.
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * MASES Phase 2 UI — Wallet API Module
 * =============================================================================
 *
 * File:      mase_app/src/features/wallet/api.ts
 * Layer:     Features (Wallet domain)
 * Version:   1.0.2
 * Status:    FROZEN
 * Authority: Wallet domain Routes/api.php (verified against source)
 *            Wallet domain Step 7 v1.1.0 §A.1.1 (Permission slugs)
 *            Wallet domain Step 7 v1.1.0 §C.1 (Route surface)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §12 (API client)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.2  — CR-W1 contract reconciliation.
 *
 *          The Wallet domain's WalletResource was amended (CR-W1 file 3,
 *          resource v1.0.1 → v1.1.0) to emit a `_display` sibling for
 *          each of its four date fields, matching the P3 · Unit 2
 *          convention. Four `_display` fields are now declared on the
 *          Wallet interface: opened_at_display, closed_at_display,
 *          created_at_display, updated_at_display.
 *
 *          A new MyWalletResponse interface is added, mirroring the
 *          Shareholder module's MyShareholderResponse. It carries the
 *          two-outcome identity contract the new /api/wallets/me
 *          endpoint (CR-W1 file 2) produces.
 *
 *          A new getMyWallet() function is added, calling the new
 *          endpoint. It returns Promise<MyWalletResponse>.
 *
 *          No existing interface field changed its name, type, or
 *          optionality. No existing function signature changed. No
 *          endpoint URL changed.
 *
 * 1.0.1  — Wallet interface corrected to match the live API response.
 *
 *          The v1.0.0 interface declared `balance: string`, but the
 *          Wallet resource (verified against a live GET /api/wallets
 *          response) emits the balance under the column name
 *          `current_balance` — matching the `wallets` table. The
 *          mismatch caused the WalletListView balance cell to call
 *          `formatAmount(undefined, ...)`, which threw inside the
 *          cell renderer and prevented every data row from painting.
 *
 *          Six additional fields the resource emits were also absent
 *          from the v1.0.0 interface: `is_closed`, `opened_at`,
 *          `closed_at`, `interest_policy_version_id`,
 *          `allocation_policy_version_id`, `kyc_policy_version_id`.
 *          They are now declared. All are read-only; the frontend
 *          does not currently consume them, but the interface is
 *          meant to describe the response faithfully, and the
 *          WalletStatementView (WF-14) may consume `opened_at`.
 *
 *          No function signatures changed. No endpoint URLs changed.
 *          No payload types changed.
 *
 * 1.0.0  — initial delivery.
 *
 * -----------------------------------------------------------------------------
 * Endpoint coverage — verified against the Wallet domain Routes/api.php
 * -----------------------------------------------------------------------------
 *   GET    /wallets                                              index
 *   POST   /wallets                                              store
 *   GET    /wallets/me                                           me       (CR-W1)
 *   GET    /wallets/{wallet}                                     show
 *   POST   /wallets/{wallet}/adjust                              adjust
 *   POST   /wallets/{wallet}/obligations                         obligations.store
 *   POST   /wallets/{wallet}/payments                            payments.store
 *   POST   /wallets/{wallet}/allocations                         allocations.store
 *   POST   /wallets/{wallet}/allocations/{allocation}/reverse    allocations.reverse
 *   GET    /wallets/{wallet}/statement                           statement.show
 *
 * Every route is registered by WalletServiceProvider::loadDomainRoutes()
 * inside a group already prefixed and middleware-wrapped:
 *
 *     Route::middleware(config('wallet.routes.middleware'))
 *          ->prefix(config('wallet.routes.prefix'))
 *          ->group(__DIR__ . '/../Routes/api.php');
 *
 * The default prefix is `wallets`, so the URLs above are the live paths.
 * The middleware stack is `api, auth:sanctum, tenant.membership`.
 *
 * -----------------------------------------------------------------------------
 * Response shapes — PROPOSAL
 * -----------------------------------------------------------------------------
 * The Wallet domain's Resource classes were not supplied in this
 * session. The interfaces below are PROPOSED, derived from:
 *
 *   1. The routes file's per-route docblocks — the descriptions of what
 *      each endpoint reads and writes.
 *   2. The migration filenames — `create_wallets_table`,
 *      `create_wallet_obligations_table`, `create_wallet_payments_table`,
 *      `create_wallet_payment_allocations_table`,
 *      `create_wallet_payment_allocation_reversals_table`,
 *      `create_wallet_entries_table` — which name the six tables.
 *   3. The platform's conventions established by
 *      features/shareholders/api.ts: string-typed monetary decimals,
 *      ISO 8601 timestamps, nullable relation summaries, embedded
 *      resource blocks.
 *   4. (1.0.1) A verified live response for GET /api/wallets, which
 *      fixed the field names on the Wallet aggregate.
 *   5. (1.0.2) The amended WalletResource (CR-W1 file 3), supplied as
 *      source. The four `_display` fields on Wallet and the shape of
 *      the /me response are verified against that resource and the
 *      MyWalletController that renders it.
 *
 * Each interface carries a `PROPOSAL` marker except Wallet, which is
 * now verified against a live response for the fields it declares.
 * When the remaining Resource classes are supplied, the
 * reconciliation is a value-only change — the fields may shift names,
 * the function signatures below will not. The same pattern was used
 * for the shareholders module's payload types
 * (`StoreShareholderPayload` and its siblings), which were reconciled
 * later without a signature change.
 *
 * -----------------------------------------------------------------------------
 * The `wallet` route parameter
 * -----------------------------------------------------------------------------
 * The route parameter is named `{wallet}` and is typed `int`. The
 * controllers receive it as a string and resolve it through
 * tenant-scoped repository lookups, not through implicit route-model
 * binding — see the Wallet controllers' class docblocks
 * §"Tenant scoping" for the rationale.
 *
 * The frontend therefore passes a number, and the URL interpolation
 * uses that number directly. No client-side validation is applied —
 * the backend returns 404 for a wallet id that is not visible to the
 * caller's tenant, and the caller's error handling treats that as
 * the not-found state.
 *
 * -----------------------------------------------------------------------------
 * The `allocation` route parameter
 * -----------------------------------------------------------------------------
 * The route parameter is named `{allocation}` and is typed `int`. The
 * controller resolves it in the frozen two-stage order documented in
 * the Wallet domain's §C.1: the wallet first, then the allocation
 * scoped to that wallet. A cross-wallet allocation id resolves to 404.
 *
 * The frontend's `reverseAllocation()` takes both ids, so the
 * two-stage resolution has both inputs available at the call site.
 *
 * -----------------------------------------------------------------------------
 * The `/me` endpoint and the two-outcome contract
 * -----------------------------------------------------------------------------
 * The CR-W1 endpoint GET /api/wallets/me resolves the authenticated
 * caller's own wallet, in the same structural fashion the Shareholder
 * domain's /api/shareholders/me resolves the caller's own shareholder
 * record. Like that endpoint, it returns one of exactly two shapes:
 *
 *     { linked: true,  wallet: <WalletResource> }
 *     { linked: false, wallet: null }
 *
 * The two-outcome contract collapses every reason the caller has no
 * wallet — no shareholder link, a shareholder link but no wallet, a
 * wallet in another tenant — into a single response shape. No
 * distinguishing signal is returned. See MyWalletController's class
 * docblock for the full collapse reasoning and the endpoint's
 * authorization posture (no Gate::authorize; the resolution is
 * entirely server-side).
 *
 * -----------------------------------------------------------------------------
 * Monetary amounts
 * -----------------------------------------------------------------------------
 * Wallet balances, obligation amounts, payment amounts, and allocation
 * amounts are all monetary. The backend emits them as decimal strings,
 * not floating-point numbers — the same convention the Shareholder
 * domain uses for share quantities (see features/shareholders/api.ts
 * §"Decimal-string helpers").
 *
 * Every amount field below is typed `string`. The frontend never
 * performs arithmetic on a monetary string; it displays it or passes
 * it back to the backend.
 *
 * -----------------------------------------------------------------------------
 * What this module does NOT do
 * -----------------------------------------------------------------------------
 *   - It does not cache. Every call hits the network. The features'
 *     caching, if any, belongs to the store layer (WF-4) or the
 *     service layer (WF-3).
 *
 *   - It does not classify errors. `NormalizedApiError` propagates
 *     unchanged; the pages map the category.
 *
 *   - It does not perform composite fetches. The detail view needs
 *     the wallet, its obligations, its payments, its allocations, and
 *     its entries; assembling those into one call is the service
 *     layer's concern (WF-3), not this module's. Each function here
 *     fetches one resource.
 *
 *   - It does not read the auth store. Permission gating is the
 *     page's responsibility; the backend authorizes every request.
 *
 *   - It does not construct URLs beyond appending the route parameter.
 *     The API client prepends `VITE_API_BASE_URL` and the axios
 *     instance handles headers, CSRF, and error normalization.
 * =============================================================================
 */

import { api } from '@/core/api/client';

// =============================================================================
// Wallet — the aggregate root
// =============================================================================

/**
 * The Wallet Resource shape.
 *
 * Verified against a live GET /api/wallets response (2026-09-16) for
 * the fields v1.0.1 declared, and against the amended WalletResource
 * (CR-W1 file 3, resource v1.1.0) for the four `_display` fields
 * added in v1.0.2.
 *
 * The aggregate root of the Wallet domain: a single owner (one
 * shareholder), a currency, and a running balance. The balance is
 * derived from the sum of the wallet's entries; it is never mutated
 * directly — only `adjust()`, `payments.store()`,
 * `obligations.store()`, and `allocations.store()` move it, each by
 * writing a corresponding entry.
 *
 * One relation may be embedded by the backend when it is eager-
 * loaded: `shareholder` (the wallet's owner summary). WalletController
 * ::show() and MyWalletController::show() both eager-load it, so the
 * field is present on the show and /me responses. The index endpoint
 * does NOT eager-load it (see WalletShareholderSummary's docblock for
 * the caveat).
 *
 * The three `*_policy_version_id` fields are nullable foreign keys to
 * the versioned_policies table (interest accrual, allocation, and KYC
 * rules frozen at wallet open). They are exposed for completeness;
 * the frontend does not currently consume them.
 *
 * -----------------------------------------------------------------------------
 * Ethiopian-calendar display siblings (v1.0.2)
 * -----------------------------------------------------------------------------
 * Each of the four date fields carries a `_display` sibling that
 * renders the same instant in the localised medium Ethiopian form:
 *
 *     am:  ሐምሌ 9, 2018 ዓ.ም. (July 16, 2026)
 *     en:  Hamle 9, 2018 E.C. (July 16, 2026)
 *
 * The ISO field remains the wire's machine-readable source of truth;
 * the `_display` field is the human-readable presentation. Both are
 * derived server-side from the same Carbon instance, so they cannot
 * disagree. A client renders `_display` directly; it does not parse
 * the ISO field and it does not know the Ethiopian calendar.
 *
 * `closed_at_display` is null when `closed_at` is null — the pairing
 * of the two fields on which rows carry a value is preserved without
 * a special case. Phase 2B does not produce closed wallets, so both
 * fields are null in the current deployment.
 *
 * See the amended WalletResource's class docblock §"Ethiopian-calendar
 * display siblings (CR-W1)" for the full derivation.
 */
export interface Wallet {
  readonly id: number;
  readonly tenant_id: number;
  readonly shareholder_id: number;
  readonly currency: string;
  /**
   * Monetary decimal string at the wallet's currency precision.
   *
   * Named `current_balance` to match the API response and the
   * `wallets.current_balance` column. Renamed from `balance` in
   * v1.0.1 — see the file header revision history.
   */
  readonly current_balance: string;
  readonly is_active: boolean;
  readonly is_closed: boolean;
  readonly opened_at: string;
  /**
   * Localised medium Ethiopian form of `opened_at`. Present on every
   * response once the amended WalletResource (CR-W1 file 3) is
   * deployed. See the interface docblock §"Ethiopian-calendar display
   * siblings" for the format and derivation.
   */
  readonly opened_at_display: string;
  readonly closed_at: string | null;
  /**
   * Localised medium Ethiopian form of `closed_at`. Null when
   * `closed_at` is null — the two fields agree on which rows carry a
   * value.
   */
  readonly closed_at_display: string | null;
  readonly interest_policy_version_id: number | null;
  readonly allocation_policy_version_id: number | null;
  readonly kyc_policy_version_id: number | null;
  /** Present when the controller eager-loads the shareholder relation. */
  readonly shareholder?: WalletShareholderSummary | null;
  readonly created_at: string;
  /**
   * Localised medium Ethiopian form of `created_at`. See the
   * interface docblock §"Ethiopian-calendar display siblings".
   */
  readonly created_at_display: string;
  readonly updated_at: string;
  /**
   * Localised medium Ethiopian form of `updated_at`. See the
   * interface docblock §"Ethiopian-calendar display siblings".
   */
  readonly updated_at_display: string;
}

/**
 * The response shape of GET /api/wallets/me (CR-W1).
 *
 * Mirrors the Shareholder module's MyShareholderResponse byte-for-byte
 * in shape, with `wallet` substituted for `shareholder`. The two
 * fields model exactly two well-formed outcomes:
 *
 *     { linked: true,  wallet: <WalletResource> }
 *     { linked: false, wallet: null }
 *
 * The caller cannot be steered toward another row: MyWalletController
 * resolves the tenant and the authenticated user server-side, then
 * finds the linked shareholder, then finds that shareholder's wallet
 * — no client-supplied input influences any step.
 *
 * See the file header §"The `/me` endpoint and the two-outcome
 * contract" for the collapse reasoning, and MyWalletController's class
 * docblock for the full contract.
 */
export interface MyWalletResponse {
  readonly linked: boolean;
  readonly wallet: Wallet | null;
}

/**
 * PROPOSAL — the minimal shareholder summary a wallet embeds.
 *
 * Matches the shape the Wallet domain's WalletResource emits, which
 * mirrors the Shareholder domain's own summary. `display_name` is
 * composed server-side (Amharic-first, English fallback).
 *
 * Note: as of the live GET /api/wallets response captured on
 * 2026-09-16, the shareholder object is NOT included in the index
 * response. The WalletListView's owner cell falls back to `#${id}`
 * when this field is absent. A follow-up backend unit will either
 * eager-load the relation on the index endpoint or the frontend will
 * render `shareholder_id` with a note. Neither is a blocking bug.
 *
 * The show and /me responses DO eager-load the relation (both
 * controllers call `loadMissing('shareholder')`), so this field is
 * present on those responses.
 */
export interface WalletShareholderSummary {
  readonly id: number;
  readonly full_name: string;
  readonly display_name: string;
  readonly shareholder_type: string;
}

/** PROPOSAL — pagination meta, same shape as files and shareholders. */
export interface PaginationMeta {
  readonly current_page?: number;
  readonly per_page?: number;
  readonly total?: number;
  readonly last_page?: number;
  readonly [key: string]: unknown;
}

/** The list endpoint's return shape. */
export interface PaginatedWallets {
  readonly items: readonly Wallet[];
  readonly meta: PaginationMeta;
}

/**
 * Query parameters accepted by the wallets index.
 *
 * Declared as a `type` (not an `interface`) with an index signature so
 * that the value is structurally assignable to the API client's
 * generic query serializer parameter
 * (`Record<string, string | number | boolean | undefined>`). Same
 * pattern as features/shareholders/api.ts's ListShareholdersQuery.
 */
export type ListWalletsQuery = {
  readonly page?: number;
  readonly per_page?: number;
  readonly shareholder_id?: number;
  readonly is_active?: boolean;
  readonly search?: string;
  readonly [key: string]: string | number | boolean | undefined;
};

// =============================================================================
// Wallet Obligation
// =============================================================================

/**
 * PROPOSAL — the WalletObligation Resource shape.
 *
 * An obligation records an amount the wallet owner owes. It is created
 * via `POST /wallets/{wallet}/obligations` and thereafter is a
 * read-only record — the domain exposes no update, delete, or
 * standalone show route for obligations (see the routes file's
 * description of the endpoint). Obligations are embedded under the
 * parent wallet's `show` response.
 *
 * `is_settled` is derived server-side from the sum of the obligation's
 * allocations; it is not a stored column.
 */
export interface WalletObligation {
  readonly id: number;
  readonly wallet_id: number;
  readonly description: string;
  /** Monetary decimal string. */
  readonly amount: string;
  /** Monetary decimal string — the sum of allocations against it. */
  readonly allocated_amount?: string;
  /** ISO 8601 date or datetime; null when the obligation has no due date. */
  readonly due_date: string | null;
  readonly is_settled: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

// =============================================================================
// Wallet Payment
// =============================================================================

/**
 * PROPOSAL — the WalletPayment Resource shape.
 *
 * A payment records money received into the wallet. It is created via
 * `POST /wallets/{wallet}/payments` and, like obligations, is not
 * addressable by id in the current route surface. Payments are
 * embedded under the parent wallet's `show` response.
 *
 * `method` is the payment channel — the frozen values the Wallet
 * domain uses are `cash`, `bank_transfer`, `cheque`, `other`. The
 * frontend's WalletPaymentForm enumerates them (see WF-1's labels).
 *
 * `occurred_at` may differ from `created_at`: the former is the date
 * the payment physically occurred; the latter is the date the record
 * was written.
 */
export type WalletPaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'cheque'
  | 'other';

export interface WalletPayment {
  readonly id: number;
  readonly wallet_id: number;
  /** Monetary decimal string. */
  readonly amount: string;
  readonly method: WalletPaymentMethod;
  readonly method_label?: string;
  readonly reference: string | null;
  readonly occurred_at: string;
  /** Nullable — the user id of the operator who recorded the payment. */
  readonly recorded_by: number | null;
  readonly created_at: string;
  readonly updated_at: string;
}

// =============================================================================
// Wallet Allocation
// =============================================================================

/**
 * PROPOSAL — the WalletAllocation Resource shape.
 *
 * An allocation attributes a payment to an obligation. It is created
 * via `POST /wallets/{wallet}/allocations` and reversed via
 * `POST /wallets/{wallet}/allocations/{allocation}/reverse`.
 *
 * The Wallet domain permits either "apply" semantics (one payment
 * applied across several obligations, or one obligation settled by
 * several payments) — the `amount` field is a partial or full slice
 * of the payment's total.
 *
 * `is_reversed` is derived server-side from the presence of a matching
 * row in the reversal table; it is not a stored column on the
 * allocation itself.
 */
export interface WalletAllocation {
  readonly id: number;
  readonly wallet_id: number;
  readonly payment_id: number;
  readonly obligation_id: number;
  /** Monetary decimal string. */
  readonly amount: string;
  readonly is_reversed: boolean;
  /** Present when the controller eager-loads the payment relation. */
  readonly payment?: WalletAllocationPaymentSummary | null;
  /** Present when the controller eager-loads the obligation relation. */
  readonly obligation?: WalletAllocationObligationSummary | null;
  readonly created_at: string;
  readonly updated_at: string;
}

/** PROPOSAL — the minimal payment summary an allocation embeds. */
export interface WalletAllocationPaymentSummary {
  readonly id: number;
  readonly amount: string;
  readonly method: WalletPaymentMethod;
  readonly occurred_at: string;
}

/** PROPOSAL — the minimal obligation summary an allocation embeds. */
export interface WalletAllocationObligationSummary {
  readonly id: number;
  readonly description: string;
  readonly amount: string;
  readonly is_settled: boolean;
}

// =============================================================================
// Wallet Entry
// =============================================================================

/**
 * PROPOSAL — the WalletEntry Resource shape.
 *
 * A wallet entry is one row of the wallet's ledger. Every balance-
 * changing operation writes exactly one entry; the wallet's `balance`
 * is the sum of the entries' signed amounts. Entries are read-only —
 * the domain exposes no route to mutate or delete an entry, and
 * reversals are expressed as new entries rather than mutations of the
 * original.
 *
 * `direction` is `debit` (money out) or `credit` (money in). The
 * frontend labels the two as `ወጪ` and `ገቢ` respectively (see WF-1).
 */
export type WalletEntryDirection = 'debit' | 'credit';

export interface WalletEntry {
  readonly id: number;
  readonly wallet_id: number;
  readonly direction: WalletEntryDirection;
  /** Monetary decimal string. */
  readonly amount: string;
  /** Monetary decimal string — balance before this entry. */
  readonly balance_before: string;
  /** Monetary decimal string — balance after this entry. */
  readonly balance_after: string;
  readonly description: string | null;
  /** What kind of operation produced this entry — e.g. `adjustment`,
   *  `obligation`, `payment`, `allocation`, `reversal`. The backend
   *  supplies the value; the frontend does not enumerate the set
   *  exhaustively. */
  readonly entry_type: string;
  readonly occurred_at: string;
  readonly created_at: string;
}

// =============================================================================
// Wallet Statement
// =============================================================================

/**
 * PROPOSAL — the WalletStatement Resource shape.
 *
 * A statement is a computed projection over a wallet's entries, from
 * an opening date to a closing date. It is not a stored resource; the
 * `GET /wallets/{wallet}/statement` endpoint computes it on demand
 * from the `from` and `to` period parameters.
 *
 * The period parameters are validated inline by the controller, not
 * by a FormRequest (see the routes file's description of the
 * endpoint). The frontend's `WalletStatementView` supplies them.
 *
 * The response embeds the entries within the period, plus the four
 * computed totals and the two anchor balances. `opening_balance` is
 * the wallet's balance as of `from`; `closing_balance` is the balance
 * as of `to`.
 */
export interface WalletStatement {
  readonly wallet_id: number;
  readonly currency: string;
  readonly period: WalletStatementPeriod;
  readonly opening_balance: string;
  readonly closing_balance: string;
  readonly total_debit: string;
  readonly total_credit: string;
  readonly entries: readonly WalletEntry[];
}

/** The period the statement was computed over. */
export interface WalletStatementPeriod {
  readonly from: string;
  readonly to: string;
}

/**
 * Query parameters accepted by the statement endpoint. `from` and `to`
 * are both optional at the type level; the controller applies its own
 * defaults when they are absent.
 */
export type WalletStatementQuery = {
  readonly from?: string;
  readonly to?: string;
  readonly [key: string]: string | number | boolean | undefined;
};

// =============================================================================
// Request payloads — PROPOSAL
// =============================================================================

/**
 * PROPOSAL — payload for `POST /wallets`.
 *
 * The Wallet domain's store action requires a shareholder and a
 * currency. The `shareholder_id` is resolved by the controller through
 * the tenant-scoped ShareholderRepository (see the Wallet controllers'
 * docblocks §"store"); the frontend supplies the numeric id.
 */
export interface StoreWalletPayload {
  readonly shareholder_id: number;
  readonly currency: string;
}

/**
 * PROPOSAL — payload for `POST /wallets/{wallet}/adjust`.
 *
 * An operator-initiated balance adjustment. The `direction` is `credit`
 * (increase) or `debit` (decrease); the `amount` is a positive
 * monetary string. The `reason` is optional and is recorded for the
 * audit trail.
 */
export interface AdjustWalletPayload {
  readonly direction: WalletEntryDirection;
  readonly amount: string;
  readonly reason?: string | null;
}

/**
 * PROPOSAL — payload for `POST /wallets/{wallet}/obligations`.
 *
 * An obligation records an amount owed. `description` is required;
 * `amount` is a positive monetary string; `due_date` is optional.
 */
export interface StoreObligationPayload {
  readonly description: string;
  readonly amount: string;
  readonly due_date?: string | null;
}

/**
 * PROPOSAL — payload for `POST /wallets/{wallet}/payments`.
 *
 * A payment records money received. `method` is one of the four
 * enumerated values; `reference` and `occurred_at` are optional.
 */
export interface StorePaymentPayload {
  readonly amount: string;
  readonly method: WalletPaymentMethod;
  readonly reference?: string | null;
  readonly occurred_at?: string | null;
}

/**
 * PROPOSAL — payload for `POST /wallets/{wallet}/allocations`.
 *
 * An allocation attributes a payment to an obligation. Both foreign
 * keys are required; `amount` is a positive monetary string.
 */
export interface StoreAllocationPayload {
  readonly payment_id: number;
  readonly obligation_id: number;
  readonly amount: string;
}

/**
 * PROPOSAL — payload for
 * `POST /wallets/{wallet}/allocations/{allocation}/reverse`.
 *
 * The reverse action is privileged. The `reason` is optional and is
 * recorded for the audit trail.
 */
export interface ReverseAllocationPayload {
  readonly reason?: string | null;
}

// =============================================================================
// Endpoints — Wallet
// =============================================================================

/**
 * GET /wallets — list the tenant's wallets.
 *
 * The response may be paginated. This function uses `api.getWithMeta`
 * and returns both the items and the meta, matching the convention
 * established by `features/files/api.ts` and
 * `features/shareholders/api.ts`.
 */
export async function listWallets(
  query: ListWalletsQuery = {},
): Promise<PaginatedWallets> {
  const response = await api.getWithMeta<readonly Wallet[]>(
    '/api/wallets',
    { params: query },
  );
  return {
    items: response.data,
    meta: (response.meta ?? {}) as PaginationMeta,
  };
}

/**
 * POST /wallets — open a new wallet for a shareholder.
 */
export function createWallet(payload: StoreWalletPayload): Promise<Wallet> {
  return api.post<Wallet>('/api/wallets', payload);
}

/**
 * GET /wallets/{wallet} — a single wallet.
 *
 * The backend may eager-load the wallet's obligations, payments, and
 * allocations onto this response, but the current interfaces do not
 * declare those relations because the Resource shape is not verified.
 * The service layer (WF-3) will assemble the detail view's composite
 * from the individual endpoints if the backend does not embed them.
 */
export function getWallet(id: number): Promise<Wallet> {
  return api.get<Wallet>(`/api/wallets/${id}`);
}

/**
 * GET /wallets/me — the authenticated caller's own wallet.  (CR-W1)
 *
 * Returns the two-outcome identity contract described on the
 * MyWalletResponse interface. The endpoint resolves the caller's
 * wallet server-side through the tenant → user → shareholder → wallet
 * chain; no client-supplied input steers the query.
 *
 * This is the portal's self-service endpoint. It is separate from
 * getWallet(id) because it addresses no wallet by id — it resolves
 * one. See MyWalletController's class docblock for the endpoint's
 * authorization posture and its collapse reasoning.
 */
export function getMyWallet(): Promise<MyWalletResponse> {
  return api.get<MyWalletResponse>('/api/wallets/me');
}

/**
 * POST /wallets/{wallet}/adjust — an operator-initiated balance
 * adjustment.
 */
export function adjustWallet(
  id: number,
  payload: AdjustWalletPayload,
): Promise<Wallet> {
  return api.post<Wallet>(`/api/wallets/${id}/adjust`, payload);
}

// =============================================================================
// Endpoints — Obligations
// =============================================================================

/**
 * POST /wallets/{wallet}/obligations — record an obligation.
 */
export function storeObligation(
  walletId: number,
  payload: StoreObligationPayload,
): Promise<WalletObligation> {
  return api.post<WalletObligation>(
    `/api/wallets/${walletId}/obligations`,
    payload,
  );
}

// =============================================================================
// Endpoints — Payments
// =============================================================================

/**
 * POST /wallets/{wallet}/payments — record a payment.
 */
export function storePayment(
  walletId: number,
  payload: StorePaymentPayload,
): Promise<WalletPayment> {
  return api.post<WalletPayment>(
    `/api/wallets/${walletId}/payments`,
    payload,
  );
}

// =============================================================================
// Endpoints — Allocations
// =============================================================================

/**
 * POST /wallets/{wallet}/allocations — record an allocation.
 */
export function storeAllocation(
  walletId: number,
  payload: StoreAllocationPayload,
): Promise<WalletAllocation> {
  return api.post<WalletAllocation>(
    `/api/wallets/${walletId}/allocations`,
    payload,
  );
}

/**
 * POST /wallets/{wallet}/allocations/{allocation}/reverse — reverse
 * an allocation.
 *
 * The two-stage tenant-scoped resolution the controller performs
 * (wallet first, then allocation scoped to that wallet) is why both
 * ids are required at the call site.
 */
export function reverseAllocation(
  walletId: number,
  allocationId: number,
  payload: ReverseAllocationPayload = {},
): Promise<WalletAllocation> {
  return api.post<WalletAllocation>(
    `/api/wallets/${walletId}/allocations/${allocationId}/reverse`,
    payload,
  );
}

// =============================================================================
// Endpoints — Statement
// =============================================================================

/**
 * GET /wallets/{wallet}/statement — generate a statement for a period.
 *
 * The `from` and `to` period parameters are validated inline by the
 * controller. The frontend's `WalletStatementView` supplies them, or
 * omits them to let the controller apply its defaults.
 */
export function getWalletStatement(
  walletId: number,
  query: WalletStatementQuery = {},
): Promise<WalletStatement> {
  return api.get<WalletStatement>(
    `/api/wallets/${walletId}/statement`,
    { params: query },
  );
}