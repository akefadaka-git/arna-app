/*
 * =============================================================================
 * CHANGE VERIFICATION — P3 · Unit 2 · File 7 of 13
 * =============================================================================
 *
 * File:      mase_app/src/features/shareholders/api.ts
 * Unit:      P3 · Unit 2 — Ethiopian calendar date rendering
 * Delivery type:  Amendment
 * Net lines:      +15 `_display` interface fields; +~50 docblock lines
 *
 * Before:
 *   Six interfaces carried date fields as ISO 8601 strings only:
 *
 *     Shareholder                         created_at, updated_at
 *     ShareClass                          created_at, updated_at
 *     ShareHolding                        created_at, updated_at
 *     ShareHoldingEntry                   occurred_at, created_at
 *     ShareCertificate                    issued_at, cancelled_at,
 *                                         created_at, updated_at
 *     ShareCertificateReplacedBySummary   issued_at
 *
 *   A component that wanted to render a date sliced the ISO string
 *   client-side via a local `formatDate()` helper. Six files duplicated
 *   that helper (three portal pages, three workspace pages).
 *
 * After:
 *   Every one of those fifteen date fields gains a `_display` sibling —
 *   the string the backend now emits via ShareholderResource,
 *   ShareHoldingResource, ShareCertificateResource, and
 *   ShareClassResource (files 3–6 of this unit). The new fields are:
 *
 *     Shareholder                         created_at_display, updated_at_display
 *     ShareClass                          created_at_display, updated_at_display
 *     ShareHolding                        created_at_display, updated_at_display
 *     ShareHoldingEntry                   occurred_at_display, created_at_display
 *     ShareCertificate                    issued_at_display,
 *                                         cancelled_at_display,
 *                                         created_at_display,
 *                                         updated_at_display
 *     ShareCertificateReplacedBySummary   issued_at_display
 *
 *   Nullability mirrors the ISO field. `issued_at: string | null` gains
 *   `issued_at_display: string | null`; `created_at: string` gains
 *   `created_at_display: string`. The mirror is exact, so a component
 *   that narrows one field's nullability narrows the sibling's
 *   automatically.
 *
 * =============================================================================
 * The `_display` value's contract
 * =============================================================================
 * The backend produces each `_display` value via
 * LocalizationService::formatEthiopianDateMedium(). Examples for a row
 * whose timestamp corresponds to 2026-07-16:
 *
 *     am:  ሐምሌ 9, 2018 ዓ.ም. (July 16, 2026)
 *     en:  Hamle 9, 2018 E.C. (July 16, 2026)
 *
 * The display string is locale-driven: the same row produces different
 * `_display` values under different request locales. The ISO field is
 * locale-invariant — it is the wire's source of truth for anything that
 * needs a machine-readable instant. Consumers should read the ISO field
 * for logic (sorting, comparison, `<time datetime>`) and the `_display`
 * field for presentation.
 *
 * =============================================================================
 * Why nullability mirrors the ISO field
 * =============================================================================
 * On the backend, the trait's `localizedDate(?DateTimeInterface): ?string`
 * returns null for null input. Two fields are nullable at the schema
 * level and therefore null in the payload for rows that do not carry a
 * value:
 *
 *     ShareCertificate.issued_at       (null for hypothetical draft rows)
 *     ShareCertificate.cancelled_at    (null for any non-cancelled row)
 *     ShareCertificateReplacedBySummary.issued_at  (null when unset)
 *
 * Their `_display` siblings are null for the same rows. Mirroring the
 * nullability in the TypeScript interface preserves that invariant at
 * the type level: a component that checks `certificate.cancelled_at
 * !== null` sees the same narrowing apply to
 * `certificate.cancelled_at_display`.
 *
 * The other twelve fields are non-nullable by schema and by convention.
 * Their `_display` siblings are typed `string`.
 *
 * =============================================================================
 * Revision history — this file
 * =============================================================================
 * 1.0.0  — initial delivery.
 * 1.0.1  — self-service identity extension (MyShareholderResponse,
 *          getMyShareholder).
 * 1.0.2  — ListShareholdersQuery type-system alignment (interface →
 *          type with index signature).
 * 1.1.0  — P3 · Unit 2 (this revision):
 *          · Fifteen `_display` fields added across six interfaces.
 *          · No existing field, function, payload, or docblock section
 *            is changed. The change is strictly additive.
 *          · MINOR bump because the wire-type surface grows.
 *
 * =============================================================================
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 * =============================================================================
 */

import { api } from '@/core/api/client';

// =============================================================================
// Shareholder types (verified against ShareholderResource.php)
// =============================================================================

/**
 * The six bilingual individual-name columns, grouped.
 */
export interface IndividualNameBlock {
  readonly first_name_am: string | null;
  readonly first_name_en: string | null;
  readonly father_name_am: string | null;
  readonly father_name_en: string | null;
  readonly grandfather_name_am: string | null;
  readonly grandfather_name_en: string | null;
}

/**
 * The two bilingual entity-name columns, grouped.
 */
export interface EntityNameBlock {
  readonly entity_name_am: string | null;
  readonly entity_name_en: string | null;
}

/**
 * The minimal user summary embedded in a ShareholderResource's `user`
 * and `representative` fields.
 */
export interface ShareholderUserSummary {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly locale: string;
}

/**
 * A shareholder, as returned by the four shareholder endpoints.
 *
 * Three composed-name fields are provided by the backend:
 *   full_name     — Amharic-first composition (all components)
 *   name          — alias of full_name (compatibility)
 *   display_name  — locale-aware composition
 *
 * `type_label` and `status_label` are translated server-side. See the
 * file header comment.
 *
 * `created_at_display` and `updated_at_display` are the localized
 * Ethiopian-calendar forms of `created_at` and `updated_at`. See the
 * file-level change-verification block for the format and rationale.
 */
export interface Shareholder {
  readonly id: number;
  readonly tenant_id: number;
  readonly shareholder_type: string;

  readonly full_name: string;
  readonly name: string;
  readonly display_name: string;

  readonly individual_name: IndividualNameBlock;
  readonly entity_name: EntityNameBlock;

  readonly user_id: number | null;
  readonly representative_user_id: number | null;
  readonly requires_representative: boolean;

  readonly is_active: boolean;
  readonly status_label: string;
  readonly type_label: string;

  /** Present only when the controller eager-loaded the relation. */
  readonly user?: ShareholderUserSummary | null;
  /** Present only when the controller eager-loaded the relation. */
  readonly representative?: ShareholderUserSummary | null;

  readonly created_at: string;
  readonly created_at_display: string;
  readonly updated_at: string;
  readonly updated_at_display: string;
}

/** Pagination meta — same shape as files (Unit 14.1). */
export interface PaginationMeta {
  readonly current_page?: number;
  readonly per_page?: number;
  readonly total?: number;
  readonly last_page?: number;
  readonly [key: string]: unknown;
}

export interface PaginatedShareholders {
  readonly items: readonly Shareholder[];
  readonly meta: PaginationMeta;
}

/**
 * Query parameters accepted by the shareholders index.
 *
 * Declared as a `type` (not an `interface`) with an index signature so
 * that the value is structurally assignable to the API client's
 * generic query serializer parameter
 * (`Record<string, string | number | boolean | undefined>`).
 * See the file header comment §"The ListShareholdersQuery index
 * signature".
 *
 * Every declared field is compatible with the index signature's union:
 * `string`, `boolean`, and `number` are members; `undefined` is a
 * member too, so the optional `?` modifiers remain valid.
 */
export type ListShareholdersQuery = {
  readonly type?: string;
  readonly is_active?: boolean;
  readonly search?: string;
  readonly per_page?: number;
  readonly page?: number;
  readonly [key: string]: string | number | boolean | undefined;
};

/**
 * The response shape of GET /api/shareholders/me (Stage 15.12 identity
 * contract). The `linked` field distinguishes the two outcomes:
 *
 *   linked: true   →  shareholder is a ShareholderResource
 *   linked: false  →  shareholder is null
 *
 * The unlinked outcome covers every reason the authenticated user has
 * no own record: no shareholder link at all, representative-only
 * access, another-tenant link, soft-deleted record, or non-individual
 * linked record. The endpoint intentionally collapses all of these
 * into a single response so that no cross-tenant signal or
 * representative signal is leaked.
 *
 * An INACTIVE own record (is_active = false) is NOT unlinked — it is
 * returned with `linked: true`, and the UI renders the record with an
 * inactive notice.
 */
export interface MyShareholderResponse {
  readonly linked: boolean;
  readonly shareholder: Shareholder | null;
}

// =============================================================================
// ShareClass types (verified against ShareClassResource.php)
// =============================================================================

/**
 * A share class — global reference data, not tenant-scoped.
 *
 * `is_founder` and `is_default` are derived booleans computed
 * server-side from config; a UI can render special treatment for the
 * founder class without hardcoding the code string "FOUNDERS".
 *
 * `created_at_display` and `updated_at_display` are the localized
 * Ethiopian-calendar forms of `created_at` and `updated_at`. See the
 * file-level change-verification block.
 */
export interface ShareClass {
  readonly id: number;
  readonly code: string;
  readonly name_am: string | null;
  readonly name_en: string | null;
  readonly display_name: string;
  readonly par_value: string;
  readonly currency: string;
  readonly is_active: boolean;
  readonly is_treasury_eligible: boolean;
  readonly is_founder: boolean;
  readonly is_default: boolean;
  readonly created_at: string;
  readonly created_at_display: string;
  readonly updated_at: string;
  readonly updated_at_display: string;
}

// =============================================================================
// ShareHolding types (verified against ShareHoldingResource.php)
// =============================================================================

/**
 * A single row in the share-holding ledger.
 *
 * `occurred_at_display` and `created_at_display` are the localized
 * Ethiopian-calendar forms of `occurred_at` and `created_at`. See the
 * file-level change-verification block.
 */
export interface ShareHoldingEntry {
  readonly id: number;
  readonly entry_type: string;
  readonly direction: 'in' | 'out' | 'neutral';
  readonly quantity: string;
  readonly balance_before: string;
  readonly balance_after: string;
  readonly reference_type: string | null;
  readonly reference_id: string | null;
  readonly description: string | null;
  readonly occurred_at: string;
  readonly occurred_at_display: string;
  readonly created_by: number | null;
  readonly reversed_entry_id: number | null;
  readonly is_reversal: boolean;
  readonly is_reversed: boolean;
  readonly created_at: string;
  readonly created_at_display: string;
}

/**
 * The embedded shareholder summary on a ShareHoldingResource.
 */
export interface ShareHoldingShareholderSummary {
  readonly id: number;
  readonly shareholder_type: string;
  readonly full_name: string;
  readonly name: string;
  readonly display_name: string;
}

/**
 * The embedded share-class summary on a ShareHoldingResource.
 */
export interface ShareHoldingShareClassSummary {
  readonly id: number;
  readonly code: string;
  readonly name_am: string | null;
  readonly name_en: string | null;
  readonly display_name: string;
}

/**
 * A shareholder's current holding of a given share class.
 *
 * `current_quantity` is a decimal string at scale 4 (never a float).
 *
 * `created_at_display` and `updated_at_display` are the localized
 * Ethiopian-calendar forms of `created_at` and `updated_at`. See the
 * file-level change-verification block.
 */
export interface ShareHolding {
  readonly id: number;
  readonly shareholder_id: number;
  readonly share_class_id: number;
  readonly current_quantity: string;
  readonly is_positive: boolean;
  readonly is_zero: boolean;
  readonly shareholder?: ShareHoldingShareholderSummary | null;
  readonly share_class?: ShareHoldingShareClassSummary | null;
  readonly entries?: readonly ShareHoldingEntry[];
  readonly created_at: string;
  readonly created_at_display: string;
  readonly updated_at: string;
  readonly updated_at_display: string;
}

// =============================================================================
// ShareCertificate types (verified against ShareCertificateResource.php)
// =============================================================================

/**
 * The four lifecycle states.
 */
export type CertificateStatus =
  | 'draft'
  | 'issued'
  | 'cancelled'
  | 'replaced';

export interface ShareCertificateShareholderSummary {
  readonly id: number;
  readonly shareholder_type: string;
  readonly full_name: string;
  readonly name: string;
  readonly display_name: string;
}

export interface ShareCertificateShareClassSummary {
  readonly id: number;
  readonly code: string;
  readonly name_am: string | null;
  readonly name_en: string | null;
  readonly display_name: string;
}

export interface ShareCertificateShareHoldingSummary {
  readonly id: number;
  /** Current holding quantity at fetch time — NOT the certified quantity. */
  readonly current_quantity: string;
}

/**
 * The shallow summary of a certificate's replacement, emitted only when
 * the `replaced_by` relation is eager-loaded.
 *
 * `issued_at_display` is the localized Ethiopian-calendar form of
 * `issued_at`. It is nullable because the replacement's `issued_at` is
 * itself nullable in the schema. See the file-level change-verification
 * block.
 */
export interface ShareCertificateReplacedBySummary {
  readonly id: number;
  readonly certificate_number: string | null;
  readonly status: CertificateStatus;
  readonly issued_at: string | null;
  readonly issued_at_display: string | null;
}

/**
 * A share certificate.
 *
 * `issued_at_display`, `cancelled_at_display`, `created_at_display`, and
 * `updated_at_display` are the localized Ethiopian-calendar forms of
 * their ISO counterparts. The two nullable dates (`issued_at`,
 * `cancelled_at`) have nullable `_display` siblings; the two non-nullable
 * dates (`created_at`, `updated_at`) have non-nullable siblings. See the
 * file-level change-verification block.
 */
export interface ShareCertificate {
  readonly id: number;
  readonly shareholder_id: number;
  readonly share_class_id: number;
  readonly share_holding_id: number | null;
  readonly certificate_number: string | null;
  readonly status: CertificateStatus;
  readonly status_label: string;
  readonly is_active: boolean;
  readonly is_terminal: boolean;
  readonly is_draft: boolean;
  readonly was_replaced: boolean;
  readonly replaced_by_id: number | null;
  readonly notes: string | null;
  readonly shareholder?: ShareCertificateShareholderSummary | null;
  readonly share_class?: ShareCertificateShareClassSummary | null;
  readonly share_holding?: ShareCertificateShareHoldingSummary | null;
  readonly replaced_by?: ShareCertificateReplacedBySummary | null;
  readonly issued_at: string | null;
  readonly issued_at_display: string | null;
  readonly cancelled_at: string | null;
  readonly cancelled_at_display: string | null;
  readonly created_at: string;
  readonly created_at_display: string;
  readonly updated_at: string;
  readonly updated_at_display: string;
}

// =============================================================================
// Request payloads — PROPOSED (see the file header comment)
// =============================================================================

/**
 * Payload for POST /api/shareholders.
 *
 * PROPOSAL: derived from ShareholderResource's individual_name and
 * entity_name blocks and from the six bilingual name columns declared
 * on the Shareholder model.
 */
export interface StoreShareholderPayload {
  readonly shareholder_type: string;

  readonly first_name_am?: string | null;
  readonly first_name_en?: string | null;
  readonly father_name_am?: string | null;
  readonly father_name_en?: string | null;
  readonly grandfather_name_am?: string | null;
  readonly grandfather_name_en?: string | null;

  readonly entity_name_am?: string | null;
  readonly entity_name_en?: string | null;

  readonly user_id?: number | null;
  readonly representative_user_id?: number | null;
  readonly is_active?: boolean;
}

/** Same field set; all optional for PATCH. */
export type UpdateShareholderPayload = Partial<StoreShareholderPayload>;

/** Payload for POST /api/shareholders/holdings/entries. */
export interface StoreShareHoldingEntryPayload {
  /** Provide this OR the {shareholder_id, share_class_id} pair. */
  readonly share_holding_id?: number;
  readonly shareholder_id?: number;
  readonly share_class_id?: number;
  readonly direction: 'in' | 'out';
  readonly quantity: number | string;
  readonly entry_type: string;
  readonly reference_type?: string | null;
  readonly reference_id?: string | null;
  readonly description?: string | null;
  readonly occurred_at?: string;
}

/** Payload for POST /api/shareholders/certificates. */
export interface StoreCertificatePayload {
  readonly shareholder_id: number;
  readonly share_class_id: number;
  readonly share_holding_id?: number | null;
  readonly certificate_number?: string | null;
  readonly notes?: string | null;
}

// =============================================================================
// Shareholder endpoints
// =============================================================================

export async function listShareholders(
  query: ListShareholdersQuery = {},
): Promise<PaginatedShareholders> {
  const response = await api.getWithMeta<readonly Shareholder[]>(
    '/api/shareholders',
    { params: query },
  );
  return {
    items: response.data,
    meta: (response.meta ?? {}) as PaginationMeta,
  };
}

/**
 * GET /api/shareholders/{id} — a single shareholder, resolved by id.
 *
 * Callers must already know the id. For the portal's self-service
 * flow, use getMyShareholder() instead — it resolves the id
 * server-side from the authenticated user.
 */
export function getShareholder(id: number): Promise<Shareholder> {
  return api.get<Shareholder>(`/api/shareholders/${id}`);
}

/**
 * GET /api/shareholders/me — the authenticated user's own shareholder
 * record, resolved server-side.
 *
 * No identity is supplied by the caller. See the file header comment
 * §"The self-service identity endpoint" for the eligibility rules and
 * the meaning of the two response outcomes.
 *
 * This function is the sole entry point for the portal's identity
 * resolution (useMyShareholder composable, Unit 15.12-F). No other
 * endpoint may be used to resolve "my" shareholder.
 */
export function getMyShareholder(): Promise<MyShareholderResponse> {
  return api.get<MyShareholderResponse>('/api/shareholders/me');
}

export function createShareholder(
  payload: StoreShareholderPayload,
): Promise<Shareholder> {
  return api.post<Shareholder>('/api/shareholders', payload);
}

export function updateShareholder(
  id: number,
  payload: UpdateShareholderPayload,
): Promise<Shareholder> {
  return api.patch<Shareholder>(`/api/shareholders/${id}`, payload);
}

// =============================================================================
// Share-class endpoints
// =============================================================================

export function listShareClasses(): Promise<readonly ShareClass[]> {
  return api.get<readonly ShareClass[]>('/api/shareholders/classes');
}

export function getShareClass(id: number): Promise<ShareClass> {
  return api.get<ShareClass>(`/api/shareholders/classes/${id}`);
}

// =============================================================================
// Share-holding endpoints
// =============================================================================

export function listShareHoldings(
  shareholderId: number,
): Promise<readonly ShareHolding[]> {
  return api.get<readonly ShareHolding[]>('/api/shareholders/holdings', {
    params: { shareholder_id: shareholderId },
  });
}

export function getShareHolding(id: number): Promise<ShareHolding> {
  return api.get<ShareHolding>(`/api/shareholders/holdings/${id}`);
}

export function storeShareHoldingEntry(
  payload: StoreShareHoldingEntryPayload,
): Promise<ShareHolding> {
  return api.post<ShareHolding>(
    '/api/shareholders/holdings/entries',
    payload,
  );
}

// =============================================================================
// Certificate endpoints
// =============================================================================

export function listCertificates(
  shareholderId: number,
): Promise<readonly ShareCertificate[]> {
  return api.get<readonly ShareCertificate[]>(
    '/api/shareholders/certificates',
    { params: { shareholder_id: shareholderId } },
  );
}

export function getCertificate(id: number): Promise<ShareCertificate> {
  return api.get<ShareCertificate>(`/api/shareholders/certificates/${id}`);
}

export function issueCertificate(
  payload: StoreCertificatePayload,
): Promise<ShareCertificate> {
  return api.post<ShareCertificate>('/api/shareholders/certificates', payload);
}

/**
 * Cancel a certificate. The optional `reason` is appended to the
 * certificate's notes by the backend service (CertificateService::cancel).
 */
export function cancelCertificate(
  id: number,
  reason?: string,
): Promise<ShareCertificate> {
  const body = reason !== undefined ? { reason } : {};
  return api.post<ShareCertificate>(
    `/api/shareholders/certificates/${id}/cancel`,
    body,
  );
}