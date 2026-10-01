/*
 * =============================================================================
 * CHANGE VERIFICATION — G3 · File 2 of 7 (amendment v1.1.0)
 * =============================================================================
 *
 * File:      mase_app/src/features/governance/service.ts  (AMEND)
 * Unit:      G3 — GovernanceBody frontend module (service amendment)
 * Delivery type:  Amendment — four new pass-through wrappers, one
 *                 composite fetcher, one result interface. File-level
 *                 v1.1.0 header.
 * Net lines:      +4 wrappers; +1 composite fetcher; +1 result
 *                 interface; ~200 lines docblock.
 *
 * Before (v1.0.0):
 *   The service exposed two one-line pass-through wrappers over the
 *   body endpoints. The composite fetcher was deliberately deferred
 *   because the four other resources' shapes were not in hand. See
 *   the v1.0.0 change-verification block §"What this delivery
 *   deliberately does NOT include".
 *
 * After (v1.1.0):
 *   The four resources have been inspected (G2b file 18, G2b file 6,
 *   G2c file 9, G2c file 22 redelivery 1). This amendment adds:
 *
 *     1. FOUR pass-through wrappers — one per body-scoped collection:
 *
 *          listGovernanceTerms(bodyId, query?)
 *          listGovernancePositions(bodyId, query?)
 *          listGovernanceAppointments(bodyId, query?)
 *          listGovernanceMemberships(bodyId, query?)
 *
 *        Each is a one-line delegate to its `./api` counterpart.
 *
 *     2. ONE composite fetcher — the detail view's single read:
 *
 *          fetchGovernanceBodyDetail(id)
 *
 *        Fans out to all five body-scoped endpoints in parallel via
 *        `Promise.all` and returns a stable, filtered shape.
 *
 *     3. ONE result interface — `GovernanceBodyDetail` — declaring
 *        the composite fetcher's return type.
 *
 * -----------------------------------------------------------------------------
 * Why Promise.all — all-or-nothing
 * -----------------------------------------------------------------------------
 * The composite fetcher issues five parallel requests. If any one
 * fails, the composite rejects — the caller receives the
 * NormalizedApiError from whichever request failed first. This
 * matches the wallet service's composite fetcher, which the loans
 * service.ts docblock records as "fan[ning] out to two endpoints
 * ... with an all-or-nothing error semantic". A partial success
 * would present a broken detail page; a failed fetch that surfaces
 * the error state is more honest.
 *
 * -----------------------------------------------------------------------------
 * Why per_page = 200
 * -----------------------------------------------------------------------------
 * Each of the four collection endpoints is fetched with
 * `per_page: 200` — the maximum the body index controller clamps to
 * (G2a file 14 of 18, `MAX_PER_PAGE = 200`). The other three
 * controllers' clamps are not in this session's context; 200 is the
 * value verified against the one controller I have inspected. If a
 * future CR confirms the others clamp lower, this constant is
 * adjusted; if any clamp higher, the extra headroom is unused.
 *
 * 200 is generous for the Q3 payload — a governance body's roster,
 * positions, and appointments are bounded sets well under 200. A
 * body with more members than 200 would be a governance-scale
 * anomaly that would itself warrant a CR.
 *
 * -----------------------------------------------------------------------------
 * Client-side filtering — the composite fetcher's own work
 * -----------------------------------------------------------------------------
 * The Q3 payload requires four filtered subsets. The backend does
 * not expose matching server-side filters (handoff gaps 2.1, 2.2).
 * The composite fetcher filters client-side:
 *
 *   · currentTerm        — the first term where `is_current === true`,
 *                          or `null` when none match. A body with
 *                          no current term is a valid state
 *                          (pre-establishment or post-dissolution).
 *
 *   · positions          — all positions, sorted by `sort_order`
 *                          ascending. No filter — the Q3 payload
 *                          includes "defined positions including
 *                          vacancies", so every position is emitted.
 *
 *   · activeAppointments — appointments where `status === 'active'`.
 *
 *   · activeMemberships  — memberships where `status === 'active'`.
 *
 * The filters live in this file, not in the view. A future backend
 * CR that adds `?current=true` or `?status=active` removes the
 * client-side work by narrowing these calls — a two-line change in
 * this file, no view change.
 *
 * -----------------------------------------------------------------------------
 * The per-member position and per-member term
 * -----------------------------------------------------------------------------
 * Q3 requires "per-member position + per-member term". Both are
 * embedded on the `GovernanceMembership` resource via `whenLoaded()`
 * — the membership carries a `position` and `term` field when the
 * controller eager-loads them.
 *
 * The composite fetcher does NOT trigger additional requests for
 * these. If the backend's membership index controller eager-loads
 * the relations, they arrive with the membership; if not, the view
 * renders the position and term columns as empty. A future CR that
 * confirms the backend's eager-load list narrows the interface
 * accordingly.
 *
 * -----------------------------------------------------------------------------
 * What does NOT change
 * -----------------------------------------------------------------------------
 *   · `listGovernanceBodies` — unchanged.
 *   · `getGovernanceBody` — unchanged.
 *   · Every import from `./api` that existed in v1.0.0 — still
 *     imported.
 *
 * -----------------------------------------------------------------------------
 * Dependency note
 * -----------------------------------------------------------------------------
 *   · Depends on `./api` v1.1.0 (G3 file 1 amendment, delivered)
 *     for the four new endpoint wrappers and their types.
 *   · Depends on `@/core/api/client` transitively via `./api` — this
 *     file imports nothing from the client directly.
 *   · No config change, no Composer step. TypeScript module.
 *
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * MASES Phase 2 UI — Governance Feature Service
 * =============================================================================
 *
 * File:      mase_app/src/features/governance/service.ts
 * Layer:     Features (Governance domain)
 * Version:   1.1.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §12.5  Service-layer orchestration
 *              §13.3  Feature state lives in the feature module
 *            Governance domain Routes/api.php (G2c file 31 of 31)
 *            Governance domain GovernanceBodyController.php (G2a file
 *              14 of 18, verified against source)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.1.0  — composite detail fetcher added. Four new pass-through
 *          wrappers, one composite fetcher, one result interface.
 *          No existing function changed.
 *
 * 1.0.0  — initial delivery (G3 file 2 of 7). Two pass-through
 *          wrappers over the body endpoints.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The orchestration layer between the governance API module (`./api`)
 * and the governance pages. In this revision:
 *
 *   · Six pass-through wrappers — one per read endpoint the views
 *     consume.
 *
 *   · One composite fetcher — `fetchGovernanceBodyDetail(id)` — that
 *     fans out to all five body-scoped reads and returns a stable,
 *     filtered detail shape for the detail view.
 *
 * -----------------------------------------------------------------------------
 * What this service does NOT do
 * -----------------------------------------------------------------------------
 *   · It does not own list state. Per §13.3, list state lives in
 *     the page's `ref`. This service is stateless.
 *   · It does not read the auth store. Permission gating is the
 *     page's responsibility via the route guard; the backend
 *     authorizes every request regardless.
 *   · It does not classify errors. NormalizedApiError propagates
 *     unchanged; the composite fetcher's `Promise.all` propagates
 *     the first failure.
 *   · It does not navigate.
 *   · It does not persist anything.
 *
 * -----------------------------------------------------------------------------
 * No monetary re-export
 * -----------------------------------------------------------------------------
 * A governance entity carries no monetary field. The formatter is
 * not re-exported.
 * =============================================================================
 */

import * as governanceApi from './api';
import type {
  GovernanceAppointment,
  GovernanceBody,
  GovernanceMembership,
  GovernancePosition,
  GovernanceTerm,
  ListGovernanceAppointmentsQuery,
  ListGovernanceBodiesQuery,
  ListGovernanceMembershipsQuery,
  ListGovernancePositionsQuery,
  ListGovernanceTermsQuery,
  PaginatedGovernanceAppointments,
  PaginatedGovernanceBodies,
  PaginatedGovernanceMemberships,
  PaginatedGovernancePositions,
  PaginatedGovernanceTerms,
} from './api';

// =============================================================================
// Public types
// =============================================================================

/**
 * The result of a composite governance-body detail fetch.
 *
 * The detail view reads this shape. The five fields correspond to
 * the Q3-approved payload's five sections:
 *
 *   · `body`               — identity
 *   · `currentTerm`        — current term (null when none)
 *   · `positions`          — defined positions, sorted by sort_order
 *   · `activeAppointments` — current officers
 *   · `activeMemberships`  — current full roster
 *
 * The per-member position and per-member term ride on each
 * membership (via the embedded `position` and `term` fields), so no
 * separate collection is returned for them.
 */
export interface GovernanceBodyDetail {
  readonly body: GovernanceBody;
  readonly currentTerm: GovernanceTerm | null;
  readonly positions: readonly GovernancePosition[];
  readonly activeAppointments: readonly GovernanceAppointment[];
  readonly activeMemberships: readonly GovernanceMembership[];
}

// =============================================================================
// Pass-through wrappers — governance body reads
// =============================================================================

/**
 * List the current tenant's governance bodies.
 *
 * The pagination meta is FLAT — four fields directly under `meta`.
 */
export function listGovernanceBodies(
  query: ListGovernanceBodiesQuery = {},
): Promise<PaginatedGovernanceBodies> {
  return governanceApi.listGovernanceBodies(query);
}

/**
 * Fetch a single governance body by its numeric primary key.
 */
export function getGovernanceBody(id: number): Promise<GovernanceBody> {
  return governanceApi.getGovernanceBody(id);
}

/**
 * List a governance body's terms.
 *
 * Supports `page` and `per_page`. Additional filters the endpoint
 * accepts are not typed here — see api.ts's change-verification
 * block §"Query type posture".
 */
export function listGovernanceTerms(
  bodyId: number,
  query: ListGovernanceTermsQuery = {},
): Promise<PaginatedGovernanceTerms> {
  return governanceApi.listGovernanceTerms(bodyId, query);
}

/**
 * List a governance body's defined positions.
 *
 * The response is not sorted client-side; consumers sort by
 * `sort_order` ascending.
 */
export function listGovernancePositions(
  bodyId: number,
  query: ListGovernancePositionsQuery = {},
): Promise<PaginatedGovernancePositions> {
  return governanceApi.listGovernancePositions(bodyId, query);
}

/**
 * List a governance body's appointments.
 *
 * To obtain the body's current officers, the caller filters on
 * `status === 'active'` — see `fetchGovernanceBodyDetail()`.
 */
export function listGovernanceAppointments(
  bodyId: number,
  query: ListGovernanceAppointmentsQuery = {},
): Promise<PaginatedGovernanceAppointments> {
  return governanceApi.listGovernanceAppointments(bodyId, query);
}

/**
 * List a governance body's memberships.
 *
 * To obtain the body's current roster, the caller filters on
 * `status === 'active'` — see `fetchGovernanceBodyDetail()`.
 */
export function listGovernanceMemberships(
  bodyId: number,
  query: ListGovernanceMembershipsQuery = {},
): Promise<PaginatedGovernanceMemberships> {
  return governanceApi.listGovernanceMemberships(bodyId, query);
}

// =============================================================================
// Composite fetch — the detail page's single read
// =============================================================================

/**
 * The `per_page` value the composite fetcher sends to the four
 * collection endpoints. See the change-verification block
 * §"Why per_page = 200".
 */
const DETAIL_COLLECTION_PER_PAGE = 200;

/**
 * Fetch a governance body's full detail: identity, current term,
 * defined positions, active appointments, and active memberships.
 *
 * Fans out to all five body-scoped endpoints in parallel. If any
 * one rejects, the composite rejects with the first failure — the
 * all-or-nothing semantic the wallet composite fetcher uses.
 *
 * The returned shape is stable: `positions` is sorted by
 * `sort_order` ascending; `currentTerm` is the first term whose
 * `is_current` is true, or `null`; `activeAppointments` and
 * `activeMemberships` are filtered to `status === 'active'`.
 *
 * @param id  the governance body's primary key
 */
export async function fetchGovernanceBodyDetail(
  id: number,
): Promise<GovernanceBodyDetail> {
  /*
   * All five reads are issued in parallel. The order of the
   * destructured results matches the order of the array literals.
   */
  const [
    body,
    termsResult,
    positionsResult,
    appointmentsResult,
    membershipsResult,
  ] = await Promise.all([
    governanceApi.getGovernanceBody(id),
    governanceApi.listGovernanceTerms(id, {
      per_page: DETAIL_COLLECTION_PER_PAGE,
    }),
    governanceApi.listGovernancePositions(id, {
      per_page: DETAIL_COLLECTION_PER_PAGE,
    }),
    governanceApi.listGovernanceAppointments(id, {
      per_page: DETAIL_COLLECTION_PER_PAGE,
    }),
    governanceApi.listGovernanceMemberships(id, {
      per_page: DETAIL_COLLECTION_PER_PAGE,
    }),
  ]);

  /*
   * Current term: the first term whose computed `is_current` boolean
   * is true. A body may have no current term (pre-establishment or
   * post-dissolution); the filter returns an empty array and the
   * accessor falls back to `null`.
   */
  const currentTerm =
    termsResult.items.find((term) => term.is_current === true) ?? null;

  /*
   * Positions: unfiltered — Q3 requires "defined positions including
   * vacancies", so every position is returned. Sorted by `sort_order`
   * ascending to match the backend's intended display order.
   */
  const positions = [...positionsResult.items].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  /*
   * Active appointments: the body's current officers. Filtered
   * client-side because the backend exposes no `?status=active`
   * filter (handoff gap 2.1's sibling concern).
   */
  const activeAppointments = appointmentsResult.items.filter(
    (appointment) => appointment.status === 'active',
  );

  /*
   * Active memberships: the body's current roster. Same client-side
   * filter as above (handoff gap 2.2).
   */
  const activeMemberships = membershipsResult.items.filter(
    (membership) => membership.status === 'active',
  );

  return {
    body,
    currentTerm,
    positions,
    activeAppointments,
    activeMemberships,
  };
}