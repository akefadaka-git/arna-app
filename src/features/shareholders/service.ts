/*
 * =============================================================================
 * MASES Phase 2 UI — Shareholder Feature Service
 * =============================================================================
 *
 * File:      mase_app/src/features/shareholders/service.ts
 * Layer:     Features (Stage 15 — Shareholder Portal)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §12.5  Service-layer orchestration
 *              §13.3  Feature state lives in the feature module
 *            MASES_PHASE_2_UI_COMPONENT_CATALOG.md §26.9
 *              (ShareholderService — API access methods)
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The orchestration layer between the shareholder API module (Unit 15.1)
 * and the shareholder pages (Unit 15.3+). It provides:
 *
 *   1. Thin pass-through wrappers over every function in ./api, so
 *      pages import one module rather than two.
 *
 *   2. A composite detail fetcher — fetchShareholderDetail(id) — that
 *      loads a shareholder, their holdings, and their certificates in
 *      parallel, with an all-or-nothing error semantic. See the file
 *      header's §"fetchShareholderDetail" rationale below.
 *
 *   3. Decimal-string helpers — formatQuantity and quantityToNumber —
 *      that centralize the presentation of the backend's DECIMAL(20,4)
 *      quantity strings. Every page that displays or compares a share
 *      quantity uses these; no page inlines the conversion.
 *
 * -----------------------------------------------------------------------------
 * What this service does NOT do
 * -----------------------------------------------------------------------------
 *   - It does not own the list state. Per §13.3, a list used by one
 *     page lives in that page's `ref`. This service is stateless.
 *
 *   - It does not read the auth store. Permission gating is the page's
 *     responsibility via PermissionGate (Unit 10.7).
 *
 *   - It does not classify errors. NormalizedApiError propagates
 *     unchanged; pages map the category (Freeze §11.4/§11.5).
 *
 *   - It does not navigate. Pages own their navigation.
 *
 *   - It does not read a translation layer. The backend emits
 *     `type_label`, `status_label`, and `certificate.status_label`
 *     server-side (verified against the resource classes); this
 *     service passes those strings through unchanged. See Unit 15.1's
 *     header comment §"IMPORTANT: labels are backend-supplied".
 *
 *   - It does not persist anything. No storage adapter, no cache.
 *
 * -----------------------------------------------------------------------------
 * fetchShareholderDetail — the all-or-nothing decision
 * -----------------------------------------------------------------------------
 * The composite fetcher runs three requests in parallel:
 *
 *     getShareholder(id)
 *     listShareHoldings(id)
 *     listCertificates(id)
 *
 * and returns { shareholder, holdings, certificates }. If ANY of the
 * three rejects, the whole call rejects. This is a deliberate decision:
 *
 *   - A shareholder detail view without holdings is a half-rendered
 *     page that hides a failure behind an "empty holdings" state. The
 *     user cannot distinguish "this shareholder has no holdings" from
 *     "we could not load the holdings".
 *
 *   - The page renders a single error state with a retry affordance on
 *     rejection, which is the same UX for a failed sub-fetch as for a
 *     failed top-level fetch.
 *
 * A page that genuinely needs partial rendering (e.g. a dashboard
 * widget that shows shareholder identity even if holdings are
 * unavailable) can call the individual functions directly — all three
 * are exported below.
 *
 * -----------------------------------------------------------------------------
 * Decimal-string helpers — see the response preamble
 * -----------------------------------------------------------------------------
 * The backend emits share quantities as DECIMAL(20,4) strings (never
 * floats). Two helpers are provided:
 *
 *   formatQuantity(decimal)     — strips trailing ".0000" for display.
 *   quantityToNumber(decimal)   — returns a JS number for PRESENTATION
 *                                 ONLY (sorting, >0 checks, CSS math).
 *
 * quantityToNumber is NOT a decimal-safe parser and is documented as
 * such. Real arithmetic (totals, percentages, aggregation) must stay on
 * the backend. See the function's own docblock.
 * =============================================================================
 */

import * as shareholdersApi from './api';
import type {
  ListShareholdersQuery,
  PaginatedShareholders,
  ShareClass,
  ShareCertificate,
  ShareHolding,
  Shareholder,
  StoreCertificatePayload,
  StoreShareHoldingEntryPayload,
  StoreShareholderPayload,
  UpdateShareholderPayload,
} from './api';

// =============================================================================
// Public types
// =============================================================================

/**
 * The result of a composite shareholder-detail fetch.
 */
export interface ShareholderDetail {
  readonly shareholder: Shareholder;
  readonly holdings: readonly ShareHolding[];
  readonly certificates: readonly ShareCertificate[];
}

// =============================================================================
// Composite fetch — the primary page-level read
// =============================================================================

/**
 * Fetch a shareholder's full detail: identity, holdings, and
 * certificates, in parallel.
 *
 * All-or-nothing: if any of the three sub-fetches fails, the entire
 * call rejects with the corresponding NormalizedApiError. See the file
 * header comment §"fetchShareholderDetail — the all-or-nothing decision".
 *
 * The three requests run in parallel via Promise.all. They share no
 * state; the backend treats each as an independent tenant-scoped read.
 */
export async function fetchShareholderDetail(
  id: number,
): Promise<ShareholderDetail> {
  const [shareholder, holdings, certificates] = await Promise.all([
    shareholdersApi.getShareholder(id),
    shareholdersApi.listShareHoldings(id),
    shareholdersApi.listCertificates(id),
  ]);

  return { shareholder, holdings, certificates };
}

// =============================================================================
// Pass-through wrappers — shareholders
// =============================================================================

export function listShareholders(
  query: ListShareholdersQuery = {},
): Promise<PaginatedShareholders> {
  return shareholdersApi.listShareholders(query);
}

export function getShareholder(id: number): Promise<Shareholder> {
  return shareholdersApi.getShareholder(id);
}

export function createShareholder(
  payload: StoreShareholderPayload,
): Promise<Shareholder> {
  return shareholdersApi.createShareholder(payload);
}

export function updateShareholder(
  id: number,
  payload: UpdateShareholderPayload,
): Promise<Shareholder> {
  return shareholdersApi.updateShareholder(id, payload);
}

// =============================================================================
// Pass-through wrappers — share classes
// =============================================================================

export function listShareClasses(): Promise<readonly ShareClass[]> {
  return shareholdersApi.listShareClasses();
}

export function getShareClass(id: number): Promise<ShareClass> {
  return shareholdersApi.getShareClass(id);
}

// =============================================================================
// Pass-through wrappers — holdings
// =============================================================================

export function listShareHoldings(
  shareholderId: number,
): Promise<readonly ShareHolding[]> {
  return shareholdersApi.listShareHoldings(shareholderId);
}

export function getShareHolding(id: number): Promise<ShareHolding> {
  return shareholdersApi.getShareHolding(id);
}

export function storeShareHoldingEntry(
  payload: StoreShareHoldingEntryPayload,
): Promise<ShareHolding> {
  return shareholdersApi.storeShareHoldingEntry(payload);
}

// =============================================================================
// Pass-through wrappers — certificates
// =============================================================================

export function listCertificates(
  shareholderId: number,
): Promise<readonly ShareCertificate[]> {
  return shareholdersApi.listCertificates(shareholderId);
}

export function getCertificate(id: number): Promise<ShareCertificate> {
  return shareholdersApi.getCertificate(id);
}

export function issueCertificate(
  payload: StoreCertificatePayload,
): Promise<ShareCertificate> {
  return shareholdersApi.issueCertificate(payload);
}

export function cancelCertificate(
  id: number,
  reason?: string,
): Promise<ShareCertificate> {
  return shareholdersApi.cancelCertificate(id, reason);
}

// =============================================================================
// Presentation helpers — decimal-string handling
// =============================================================================

/**
 * Format a backend decimal string for display.
 *
 * The backend emits share quantities as DECIMAL(20,4) strings, e.g.
 * "145.0000". This helper strips the fractional part when it is all
 * zeros ("145"), and preserves it otherwise ("145.5000" → "145.5").
 *
 * The helper is NOT a validator: an empty string, a malformed value, or
 * a value the backend would never emit is echoed back unchanged. The
 * purpose is presentation, not sanitation; a page that receives a
 * malformed value has a backend/data defect to investigate, and hiding
 * it behind a formatted string would obscure the defect.
 *
 * A leading sign is preserved.
 */
export function formatQuantity(decimal: string): string {
  if (decimal === '') return decimal;

  /*
   * Split on the decimal point. If there is no point, the string is
   * already an integer representation and is returned unchanged.
   */
  const dot = decimal.indexOf('.');
  if (dot < 0) return decimal;

  const integerPart = decimal.slice(0, dot);
  const fractionalPart = decimal.slice(dot + 1);

  /*
   * Trim trailing zeros from the fractional part. If every digit is a
   * zero, the fractional part is dropped entirely.
   */
  const trimmedFractional = fractionalPart.replace(/0+$/, '');

  if (trimmedFractional === '') {
    return integerPart;
  }

  return `${integerPart}.${trimmedFractional}`;
}

/**
 * Convert a backend decimal string to a JS number for PRESENTATION ONLY.
 *
 * USE CASES THIS FUNCTION IS SAFE FOR:
 *   - sorting a table of quantities client-side
 *   - a `quantity > 0` check that drives a badge
 *   - a CSS width calculation for a chart bar
 *
 * USE CASES THIS FUNCTION IS UNSAFE FOR:
 *   - any arithmetic whose result the UI displays as a financial value
 *   - summing quantities across rows
 *   - computing a percentage of a total
 *
 * The reason: JavaScript's `number` is a 64-bit float and cannot
 * represent every decimal fraction exactly. A share quantity
 * represented as a DECIMAL(20,4) string is exact; converting it to a
 * float loses that guarantee. Real arithmetic on quantities must stay
 * on the backend, where BCMath operates on the exact decimal strings.
 *
 * A malformed input returns `Number.NaN`. Callers using the result for
 * a numeric comparison should treat NaN as "not greater than zero";
 * callers using it for sorting should note that NaN sorts
 * inconsistently. See formatQuantity for a never-converting path.
 */
export function quantityToNumber(decimal: string): number {
  return Number(decimal);
}