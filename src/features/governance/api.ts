/*
 * =============================================================================
 * CHANGE VERIFICATION — G3 · File 1 of 7 (amendment v1.1.0)
 * =============================================================================
 *
 * File:      mase_app/src/features/governance/api.ts  (AMEND)
 * Unit:      G3 — GovernanceBody frontend module (API contract amendment)
 * Delivery type:  Amendment — four new resource interfaces, four new
 *                 endpoint wrappers, four paginated-collection types,
 *                 four query types. One added section on embedded
 *                 relations. File-level v1.1.0 header.
 * Net lines:      +4 interfaces; +4 paginated types; +4 query types;
 *                 +4 endpoint wrappers; +3 relation-summary types;
 *                 ~340 lines docblock.
 *
 * Before (v1.0.0):
 *   The module declared two endpoint wrappers and their types,
 *   covering only the two body endpoints:
 *
 *     listGovernanceBodies(query?)  GET /api/governance/bodies
 *     getGovernanceBody(id)         GET /api/governance/bodies/{id}
 *
 *   The composite detail fetcher — which the detail view requires —
 *   was deliberately deferred because the four other resources'
 *   shapes were not yet in hand. Writing those types without the
 *   resources would have required inventing field names, which
 *   handoff rule 1 forbids.
 *
 * After (v1.1.0):
 *   The four remaining resources have been inspected
 *   (GovernanceTermResource G2b file 18, GovernancePositionResource
 *   G2b file 6, GovernanceAppointmentResource G2c file 9,
 *   GovernanceMembershipResource G2c file 22 redelivery 1). This
 *   amendment adds:
 *
 *     1. FOUR new resource interfaces:
 *          · GovernanceTerm
 *          · GovernancePosition
 *          · GovernanceAppointment
 *          · GovernanceMembership
 *
 *     2. ONE new relation-summary type:
 *          · GovernanceMembershipUserSummary — the inline user array
 *            the membership resource emits (three fields).
 *
 *     3. FOUR new paginated-collection types:
 *          · PaginatedGovernanceTerms
 *          · PaginatedGovernancePositions
 *          · PaginatedGovernanceAppointments
 *          · PaginatedGovernanceMemberships
 *
 *     4. FOUR new query types:
 *          · ListGovernanceTermsQuery
 *          · ListGovernancePositionsQuery
 *          · ListGovernanceAppointmentsQuery
 *          · ListGovernanceMembershipsQuery
 *
 *     5. FOUR new endpoint wrappers:
 *          · listGovernanceTerms(bodyId, query?)
 *          · listGovernancePositions(bodyId, query?)
 *          · listGovernanceAppointments(bodyId, query?)
 *          · listGovernanceMemberships(bodyId, query?)
 *
 *   Each list endpoint is scoped to a governance body via the
 *   `{governanceBody}` path segment; the wrapper takes `bodyId` as
 *   its first argument.
 *
 * -----------------------------------------------------------------------------
 * Pagination envelope — assumed flat, following the body index
 * -----------------------------------------------------------------------------
 * The body index controller emits a FLAT `meta` block — four fields
 * directly under `meta`, matching the wallet module's shape. The
 * routes docblock (G2c file 31 of 31) records that "the five `index`
 * actions add a `meta` block with pagination data" — a single
 * convention covering all five indexes, of which the body index is
 * the one whose controller has been inspected.
 *
 * This amendment therefore types all five paginated collections
 * against the SAME flat shape (`GovernanceBodiesPaginationMeta`,
 * declared in v1.0.0). If any of the four new controllers diverges
 * and emits a nested `meta.pagination` — the loans module's shape —
 * the runtime read at `meta.last_page` would be `undefined`. That
 * would surface during browser verification, not silently.
 *
 * The alternative — declaring per-endpoint pagination meta types —
 * would over-fit four unverified shapes and would produce a
 * spurious divergence if the controllers agree. The single shared
 * type reflects the docblock's stated single convention.
 *
 * -----------------------------------------------------------------------------
 * Query type posture — minimal, plus an open index signature
 * -----------------------------------------------------------------------------
 * Each of the four new list endpoints accepts filters via its
 * controller's `extractFilters()` (the body controller's own method,
 * G2a file 14 of 18, is the only one inspected). The four new
 * controllers' exact filter sets are not in hand, so this
 * amendment declares only:
 *
 *     page, per_page      — universal on the domain's paginated reads
 *     [key: string]: ...  — an open index signature, typed for the
 *                            scalar shapes a query parameter can take
 *
 * This means the frontend can pass a filter name the backend accepts
 * without a per-endpoint type declaration. The trade-off is that a
 * typo in a filter name is not caught at compile time — but the
 * backend's validation (or its "no filter recognized" behaviour,
 * which ignores unknown query parameters) surfaces the mistake at
 * runtime. The alternative — declaring a filter name that turns out
 * to be wrong — is worse, because the type would be a lie.
 *
 * A future CR that inspects the four controllers and confirms their
 * filter sets narrows these types then. See the gap record at the
 * bottom of this block.
 *
 * -----------------------------------------------------------------------------
 * The composite fetcher's client-side filter needs
 * -----------------------------------------------------------------------------
 * The detail view's Q3 payload requires four filtered subsets:
 *
 *     · current term          — terms where `is_current === true`
 *     · current officers      — appointments where `status === 'active'`
 *     · current full roster   — memberships where `status === 'active'`
 *     · defined positions     — positions where `is_active === true`
 *
 * The handoff (gaps 2.1 and 2.2) records that:
 *
 *   · The terms endpoint has no `?current=true` filter (gap 2.1).
 *   · The memberships endpoint has no compound status filter (gap 2.2);
 *     a caller wanting "active + suspended" must fetch twice or
 *     filter client-side.
 *
 * The composite fetcher (service.ts amendment, next delivery) will
 * therefore fetch each collection with a large `per_page` and filter
 * client-side. This is not an invention — it is the correct response
 * to a backend that does not expose the filter. The gap is recorded
 * again in the gap list at the bottom of this block for continuity.
 *
 * -----------------------------------------------------------------------------
 * Embedded relations on the appointment and membership resources
 * -----------------------------------------------------------------------------
 * GovernanceAppointmentResource emits three optional nested relations
 * (body, position, term), each wrapped in its own resource.
 * GovernanceMembershipResource emits five (body, position, term,
 * appointment, user), of which four are nested resources and the
 * fifth — `user` — is an inline array of three fields. This
 * amendment types all of them:
 *
 *     GovernanceAppointment.body?       : GovernanceBodySummary
 *     GovernanceAppointment.position?   : GovernancePosition
 *     GovernanceAppointment.term?       : GovernanceTerm
 *
 *     GovernanceMembership.body?        : GovernanceBodySummary
 *     GovernanceMembership.position?    : GovernancePosition
 *     GovernanceMembership.term?        : GovernanceTerm
 *     GovernanceMembership.appointment? : GovernanceAppointment
 *     GovernanceMembership.user?        : GovernanceMembershipUserSummary | null
 *
 * Note the asymmetry: `body` is a SHALLOW summary (six fields), the
 * other relations are FULL nested resources. This mirrors the
 * resources exactly — the `body` summary is the same shallow shape
 * that appears on the position and term resources.
 *
 * The `user` array is emitted by the membership resource through an
 * inline closure; the closure returns `null` when the loaded `user`
 * relation is null. The interface's `| null` on the user field
 * reflects that.
 *
 * -----------------------------------------------------------------------------
 * The display_label fallback chains
 * -----------------------------------------------------------------------------
 * Three of the four new resources emit a `display_label` field whose
 * value is produced by a model accessor with a fallback chain:
 *
 *   · GovernanceTerm.display_label — bilingual label → synthesised
 *     date-range string → empty string.
 *
 *   · GovernancePosition.display_name — bilingual name → code as
 *     ultimate fallback.
 *
 *   · GovernanceAppointment.display_label — bilingual title → the
 *     instrument reference → a synthesised string.
 *
 *   · GovernanceMembership.display_name — bilingual membership name
 *     → the loaded user's display_name → external_reference → empty
 *     string.
 *
 * All four are emitted as non-null strings (the resources never
 * return null for these fields — the accessors always produce a
 * string, even an empty one). The interfaces type them as `string`.
 *
 * -----------------------------------------------------------------------------
 * Gaps recorded (not acted on in G3)
 * -----------------------------------------------------------------------------
 *   2.1  Terms endpoint has no `?current=true` filter. Client filters
 *        on `is_current` after fetching.
 *   2.2  Memberships endpoint has no compound status filter.
 *        Client fetches the collection and filters on `status`.
 *   2.6  No dedicated aggregate endpoint for the detail view's Q3
 *        payload. The composite fetcher (service.ts amendment, next
 *        delivery) fans out to five endpoints.
 *   2.7  The four new list controllers' filter sets are not in this
 *        session's file context. Their query types declare only
 *        `page`, `per_page`, and an open index signature. A future
 *        CR that inspects the controllers narrows them.
 *   2.8  The pagination envelope is assumed flat for all five
 *        indexes, based on the routes docblock's statement of a
 *        single convention. If any controller diverges, the runtime
 *        read surfaces the mismatch during browser verification.
 *
 * -----------------------------------------------------------------------------
 * What does NOT change
 * -----------------------------------------------------------------------------
 *   · `GovernanceBody` — every field, every value, byte-for-byte
 *     identical to v1.0.0.
 *   · `GovernanceBodySummary` — unchanged.
 *   · `GovernanceBodyType` — unchanged.
 *   · `GovernanceBodiesPaginationMeta` — unchanged; now also used
 *     by the four new paginated types.
 *   · `PaginatedGovernanceBodies` — unchanged.
 *   · `ListGovernanceBodiesQuery` — unchanged.
 *   · The two existing endpoint wrappers — unchanged.
 *
 * -----------------------------------------------------------------------------
 * Dependency note
 * -----------------------------------------------------------------------------
 *   · Depends on `@/core/api/client` (v1.2.0, verified in session).
 *   · Depends on the backend resources: GovernanceTermResource (G2b
 *     file 18 of 27), GovernancePositionResource (G2b file 6 of 27),
 *     GovernanceAppointmentResource (G2c file 9 of 31),
 *     GovernanceMembershipResource (G2c file 22 of 31, redelivery 1)
 *     — all verified against source in this session.
 *   · Depends on the four new list routes being registered —
 *     confirmed live via the route:list output provided by the user
 *     (21 routes).
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
 * MASES Phase 2 UI — Governance Feature API Module
 * =============================================================================
 *
 * File:      mase_app/src/features/governance/api.ts
 * Layer:     Features (Governance domain)
 * Version:   1.1.0
 * Status:    FROZEN
 * Authority: Governance domain Routes/api.php (G2c file 31 of 31)
 *            Governance domain GovernanceBodyResource.php (G2a file
 *              11 of 17)
 *            Governance domain GovernanceTermResource.php (G2b file
 *              18 of 27)
 *            Governance domain GovernancePositionResource.php (G2b
 *              file 6 of 27)
 *            Governance domain GovernanceAppointmentResource.php
 *              (G2c file 9 of 31)
 *            Governance domain GovernanceMembershipResource.php
 *              (G2c file 22 of 31, redelivery 1)
 *            Governance domain GovernanceBodyController.php (G2a file
 *              14 of 18)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §12 (API client)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.1.0  — four additional resources and their list endpoints added
 *          (G3 file 1 amendment). The four new resource interfaces,
 *          their paginated-collection wrappers, their query types,
 *          and their endpoint wrappers. No existing type or wrapper
 *          changed.
 *
 * 1.0.0  — initial delivery (G3 file 1 of 7). Two endpoint wrappers
 *          and the types they require.
 *
 * -----------------------------------------------------------------------------
 * Endpoint coverage (as of v1.1.0)
 * -----------------------------------------------------------------------------
 *   GET  /api/governance/bodies                              listGovernanceBodies
 *   GET  /api/governance/bodies/{id}                         getGovernanceBody
 *   GET  /api/governance/bodies/{id}/terms                   listGovernanceTerms
 *   GET  /api/governance/bodies/{id}/positions               listGovernancePositions
 *   GET  /api/governance/bodies/{id}/appointments            listGovernanceAppointments
 *   GET  /api/governance/bodies/{id}/memberships             listGovernanceMemberships
 *
 * Six of the domain's twenty-one routes. The remaining fifteen are
 * write endpoints (POST/PATCH/PUT) or single-resource reads outside
 * G3's read-only body-view scope. Additional wrappers are added by
 * amendment if a future phase requires them.
 *
 * -----------------------------------------------------------------------------
 * No monetary fields
 * -----------------------------------------------------------------------------
 * A governance body, term, position, appointment, or membership
 * carries no monetary field. This module declares no decimal-string
 * fields and consumes no monetary formatter.
 * =============================================================================
 */

import { api } from '@/core/api/client';

// =============================================================================
// Vocabulary
// =============================================================================

/**
 * The five governance-body types.
 *
 * Mirrors the backend's `GovernanceBodyType` string-backed enum
 * (G2a file 2 of 17). The vocabulary is closed at five; a future CR
 * that extends the enum extends this union in the same change.
 */
export type GovernanceBodyType =
  | 'assembly'
  | 'board'
  | 'committee'
  | 'subcommittee'
  | 'ad_hoc';

// =============================================================================
// The body — the aggregate root
// =============================================================================

/**
 * The GovernanceBody resource shape.
 *
 * Mirrors `GovernanceBodyResource` (G2a file 11 of 17) field-for-field.
 */
export interface GovernanceBody {
  readonly id: number;
  readonly tenant_id: number;
  readonly code: string;
  readonly body_type: GovernanceBodyType;
  readonly body_type_label: string;

  readonly name_am: string | null;
  readonly name_en: string | null;
  readonly display_name: string;

  readonly is_active: boolean;
  readonly is_standing: boolean;
  readonly is_temporary: boolean;

  readonly parent_body_id: number | null;
  readonly reporting_body_id: number | null;

  readonly purpose: string | null;
  readonly mandate: string | null;
  readonly quorum_rule_json: Record<string, unknown> | null;
  readonly meeting_frequency: string | null;

  readonly effective_from: string | null;
  readonly effective_from_display: string | null;
  readonly effective_until: string | null;
  readonly effective_until_display: string | null;

  readonly parent?: GovernanceBodySummary | null;
  readonly reporting_body?: GovernanceBodySummary | null;

  readonly created_at: string;
  readonly created_at_display: string;
  readonly updated_at: string;
  readonly updated_at_display: string;
}

/**
 * The shallow summary emitted for a self-referencing relation.
 *
 * Emitted by `GovernanceBodyResource::bodySummary()`, and reused by
 * the position, term, appointment, and membership resources for
 * their own `body` relation summaries.
 */
export interface GovernanceBodySummary {
  readonly id: number;
  readonly code: string;
  readonly body_type: GovernanceBodyType;
  readonly name_am: string | null;
  readonly name_en: string | null;
  readonly display_name: string;
}

// =============================================================================
// The term
// =============================================================================

/**
 * The GovernanceTerm resource shape.
 *
 * Mirrors `GovernanceTermResource` (G2b file 18 of 27).
 *
 * `is_current` is a computed boolean produced by the model's
 * `isCurrent()` accessor — the term's effective range contains
 * today. Null bounds are treated as unbounded, so a term with both
 * dates null is `is_current = true`.
 */
export interface GovernanceTerm {
  readonly id: number;
  readonly tenant_id: number;
  readonly governance_body_id: number;

  readonly label_am: string | null;
  readonly label_en: string | null;
  readonly display_label: string;

  readonly effective_from: string | null;
  readonly effective_from_display: string | null;
  readonly effective_until: string | null;
  readonly effective_until_display: string | null;

  readonly notes: string | null;

  readonly is_active: boolean;
  readonly is_current: boolean;

  readonly body?: GovernanceBodySummary;

  readonly created_at: string | null;
  readonly created_at_display: string | null;
  readonly updated_at: string | null;
  readonly updated_at_display: string | null;
}

// =============================================================================
// The position
// =============================================================================

/**
 * The GovernancePosition resource shape.
 *
 * Mirrors `GovernancePositionResource` (G2b file 6 of 27).
 *
 * `is_standing` is derived from the parent body's type — it returns
 * `false` when the body relation was not eager-loaded. On the
 * position list endpoint, the controller eager-loads `body`, so
 * `is_standing` reflects the parent's standing status.
 *
 * `is_voting` and `is_officer` are the two structural flags G3's
 * officers section branches on. `sort_order` drives the display
 * ordering of a body's positions.
 */
export interface GovernancePosition {
  readonly id: number;
  readonly tenant_id: number;
  readonly governance_body_id: number;
  readonly code: string;

  readonly name_am: string | null;
  readonly name_en: string | null;
  readonly display_name: string;

  readonly description_am: string | null;
  readonly description_en: string | null;

  readonly is_voting: boolean;
  readonly is_officer: boolean;
  readonly is_active: boolean;
  readonly is_standing: boolean;

  readonly sort_order: number;

  readonly body?: GovernanceBodySummary;

  readonly created_at: string | null;
  readonly created_at_display: string | null;
  readonly updated_at: string | null;
  readonly updated_at_display: string | null;
}

// =============================================================================
// The appointment
// =============================================================================

/**
 * The GovernanceAppointment resource shape.
 *
 * Mirrors `GovernanceAppointmentResource` (G2c file 9 of 31).
 *
 * The three enum-typed fields (`instrument_type`, `appointment_mode`,
 * `status`) are each emitted as a raw-value + `_label` pair. The
 * labels resolve through the `governance::common.*` catalogue; the
 * CR-G2C-CAT-001 amendment delivered the three groups the resource's
 * docblock records as pending.
 */
export interface GovernanceAppointment {
  readonly id: number;
  readonly tenant_id: number;

  readonly governance_body_id: number;
  readonly governance_position_id: number | null;
  readonly governance_term_id: number | null;

  readonly instrument_type: string;
  readonly instrument_type_label: string;

  readonly instrument_reference: string | null;
  readonly instrument_date: string | null;
  readonly instrument_date_display: string | null;

  readonly effective_date: string | null;
  readonly effective_date_display: string | null;

  readonly appointment_mode: string;
  readonly appointment_mode_label: string;

  readonly status: string;
  readonly status_label: string;

  readonly title_am: string | null;
  readonly title_en: string | null;
  readonly display_label: string;

  readonly notes_am: string | null;
  readonly notes_en: string | null;

  readonly created_at: string | null;
  readonly updated_at: string | null;

  readonly body?: GovernanceBodySummary;
  readonly position?: GovernancePosition;
  readonly term?: GovernanceTerm;
}

// =============================================================================
// The membership
// =============================================================================

/**
 * The inline user summary the membership resource emits.
 *
 * The membership resource's `user` relation is emitted as an inline
 * array rather than a nested resource — MASES Core ships no
 * `UserResource`. The three fields are `id`, `display_name`, and
 * `email`.
 */
export interface GovernanceMembershipUserSummary {
  readonly id: number;
  readonly display_name: string;
  readonly email: string | null;
}

/**
 * The GovernanceMembership resource shape.
 *
 * Mirrors `GovernanceMembershipResource` (G2c file 22 of 31,
 * redelivery 1).
 *
 * Member identity is expressed as four raw columns plus a resolved
 * `display_name`. The four columns are member_name_am, member_name_en,
 * external_reference, and user_id (the relation FK). The
 * `display_name` accessor resolves through a precedence chain:
 * bilingual membership name → loaded user's display_name →
 * external_reference → empty string.
 *
 * `is_current` is emitted by the resource despite the general
 * policy of not emitting derived predicates, because the computation
 * depends on the server's notion of "today" — a client cannot
 * reproduce it without knowing the server's timezone.
 */
export interface GovernanceMembership {
  readonly id: number;
  readonly tenant_id: number;

  readonly governance_body_id: number;
  readonly governance_position_id: number | null;
  readonly governance_term_id: number | null;
  readonly governance_appointment_id: number | null;
  readonly user_id: number | null;

  readonly member_name_am: string | null;
  readonly member_name_en: string | null;
  readonly external_reference: string | null;
  readonly display_name: string;

  readonly start_date: string;
  readonly start_date_display: string;
  readonly end_date: string | null;
  readonly end_date_display: string | null;

  readonly status: string;
  readonly status_label: string;

  readonly is_ex_officio: boolean;
  readonly is_current: boolean;

  readonly ended_reason: string | null;

  readonly notes_am: string | null;
  readonly notes_en: string | null;

  readonly created_at: string | null;
  readonly updated_at: string | null;

  readonly body?: GovernanceBodySummary;
  readonly position?: GovernancePosition;
  readonly term?: GovernanceTerm;
  readonly appointment?: GovernanceAppointment;
  readonly user?: GovernanceMembershipUserSummary | null;
}

// =============================================================================
// Pagination
// =============================================================================

/**
 * The flat pagination meta the governance indexes emit.
 *
 * The four fields sit directly under `meta` — the wallet module's
 * envelope shape. The routes docblock (G2c file 31 of 31) records
 * that "the five `index` actions add a `meta` block with pagination
 * data"; the body index controller confirms the flat shape, and this
 * type is used by all five paginated collections under the
 * assumption that the convention is domain-wide.
 */
export interface GovernanceBodiesPaginationMeta {
  readonly current_page: number;
  readonly per_page: number;
  readonly total: number;
  readonly last_page: number;
}

export interface PaginatedGovernanceBodies {
  readonly items: readonly GovernanceBody[];
  readonly meta: GovernanceBodiesPaginationMeta;
}

export interface PaginatedGovernanceTerms {
  readonly items: readonly GovernanceTerm[];
  readonly meta: GovernanceBodiesPaginationMeta;
}

export interface PaginatedGovernancePositions {
  readonly items: readonly GovernancePosition[];
  readonly meta: GovernanceBodiesPaginationMeta;
}

export interface PaginatedGovernanceAppointments {
  readonly items: readonly GovernanceAppointment[];
  readonly meta: GovernanceBodiesPaginationMeta;
}

export interface PaginatedGovernanceMemberships {
  readonly items: readonly GovernanceMembership[];
  readonly meta: GovernanceBodiesPaginationMeta;
}

// =============================================================================
// Query types
// =============================================================================

/**
 * Query parameters accepted by the governance-bodies index.
 *
 * The five filters mirror `GovernanceBodyController::extractFilters()`
 * (G2a file 14 of 18).
 */
export type ListGovernanceBodiesQuery = {
  readonly page?: number;
  readonly per_page?: number;
  readonly type?: GovernanceBodyType;
  readonly is_active?: boolean;
  readonly parent_body_id?: number;
  readonly search?: string;
  readonly [key: string]: string | number | boolean | undefined;
};

/*
 * The four body-scoped list endpoints' filters are not in this
 * session's file context. See the change-verification block
 * §"Query type posture" for the reasoning behind the minimal
 * declarations plus the open index signature.
 */

export type ListGovernanceTermsQuery = {
  readonly page?: number;
  readonly per_page?: number;
  readonly [key: string]: string | number | boolean | undefined;
};

export type ListGovernancePositionsQuery = {
  readonly page?: number;
  readonly per_page?: number;
  readonly [key: string]: string | number | boolean | undefined;
};

export type ListGovernanceAppointmentsQuery = {
  readonly page?: number;
  readonly per_page?: number;
  readonly [key: string]: string | number | boolean | undefined;
};

export type ListGovernanceMembershipsQuery = {
  readonly page?: number;
  readonly per_page?: number;
  readonly [key: string]: string | number | boolean | undefined;
};

// =============================================================================
// Endpoints — reads
// =============================================================================

/**
 * GET /api/governance/bodies — list governance bodies.
 *
 * The response set is scope-narrowed to the resolved tenant by the
 * controller. The `meta` block is FLAT.
 */
export async function listGovernanceBodies(
  query: ListGovernanceBodiesQuery = {},
): Promise<PaginatedGovernanceBodies> {
  const response = await api.getWithMeta<readonly GovernanceBody[]>(
    '/api/governance/bodies',
    { params: query },
  );
  const rawMeta = (response.meta ?? {}) as GovernanceBodiesPaginationMeta;
  return {
    items: response.data,
    meta: rawMeta,
  };
}

/**
 * GET /api/governance/bodies/{id} — a single governance body.
 *
 * The response carries the `parent` and `reporting_body` summaries
 * when the corresponding relations are set.
 */
export function getGovernanceBody(id: number): Promise<GovernanceBody> {
  return api.get<GovernanceBody>(`/api/governance/bodies/${id}`);
}

/**
 * GET /api/governance/bodies/{id}/terms — a body's terms.
 *
 * Supports `page` and `per_page`. Additional filters the endpoint
 * accepts are not typed here — see the change-verification block
 * §"Query type posture".
 */
export async function listGovernanceTerms(
  bodyId: number,
  query: ListGovernanceTermsQuery = {},
): Promise<PaginatedGovernanceTerms> {
  const response = await api.getWithMeta<readonly GovernanceTerm[]>(
    `/api/governance/bodies/${bodyId}/terms`,
    { params: query },
  );
  const rawMeta = (response.meta ?? {}) as GovernanceBodiesPaginationMeta;
  return {
    items: response.data,
    meta: rawMeta,
  };
}

/**
 * GET /api/governance/bodies/{id}/positions — a body's defined positions.
 *
 * Supports `page` and `per_page`. The response is not sorted
 * client-side; consumers sort by `sort_order` ascending.
 */
export async function listGovernancePositions(
  bodyId: number,
  query: ListGovernancePositionsQuery = {},
): Promise<PaginatedGovernancePositions> {
  const response = await api.getWithMeta<readonly GovernancePosition[]>(
    `/api/governance/bodies/${bodyId}/positions`,
    { params: query },
  );
  const rawMeta = (response.meta ?? {}) as GovernanceBodiesPaginationMeta;
  return {
    items: response.data,
    meta: rawMeta,
  };
}

/**
 * GET /api/governance/bodies/{id}/appointments — a body's appointments.
 *
 * Supports `page` and `per_page`. The composite fetcher filters on
 * `status === 'active'` client-side; see the change-verification
 * block §"The composite fetcher's client-side filter needs".
 */
export async function listGovernanceAppointments(
  bodyId: number,
  query: ListGovernanceAppointmentsQuery = {},
): Promise<PaginatedGovernanceAppointments> {
  const response = await api.getWithMeta<readonly GovernanceAppointment[]>(
    `/api/governance/bodies/${bodyId}/appointments`,
    { params: query },
  );
  const rawMeta = (response.meta ?? {}) as GovernanceBodiesPaginationMeta;
  return {
    items: response.data,
    meta: rawMeta,
  };
}

/**
 * GET /api/governance/bodies/{id}/memberships — a body's memberships.
 *
 * Supports `page` and `per_page`. The composite fetcher filters on
 * `status === 'active'` client-side; see the change-verification
 * block §"The composite fetcher's client-side filter needs".
 */
export async function listGovernanceMemberships(
  bodyId: number,
  query: ListGovernanceMembershipsQuery = {},
): Promise<PaginatedGovernanceMemberships> {
  const response = await api.getWithMeta<readonly GovernanceMembership[]>(
    `/api/governance/bodies/${bodyId}/memberships`,
    { params: query },
  );
  const rawMeta = (response.meta ?? {}) as GovernanceBodiesPaginationMeta;
  return {
    items: response.data,
    meta: rawMeta,
  };
}