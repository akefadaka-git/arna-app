import { api } from '@/core/api/client';

/**
 * Phase 01 Finance wire contract.
 *
 * Monetary values remain decimal strings. The client treats the API as
 * authoritative for tenant/entity access and never enables accounting
 * policy switches itself.
 */
export type FinanceCalendarCode = 'EC' | 'GC';
export type FinanceCurrencyMode = 'base_only';
export type FinancePolicyStatus = 'owner_review_required' | 'approved' | 'rejected';
export type FinanceTaxProfileStatus = 'unconfigured' | 'pending_review' | 'configured' | 'suspended';

export interface FinanceEntityAccountingProfile {
  readonly functional_currency: 'ETB';
  readonly reporting_currency: 'ETB';
  readonly transaction_currency_mode: FinanceCurrencyMode;
  readonly display_calendar: FinanceCalendarCode;
  readonly timezone: 'Africa/Addis_Ababa' | string;
  readonly fiscal_year_start_month_ec: number | null;
  readonly fiscal_year_start_day_ec: number | null;
  readonly tax_profile_status: FinanceTaxProfileStatus;
  readonly accounting_policy_status: FinancePolicyStatus;
  readonly document_numbering_policy_version: string | null;
}

export interface FinanceLegalEntity {
  readonly id: number;
  readonly tenant_id: number;
  readonly code: string;
  readonly name_am: string | null;
  readonly name_en: string;
  readonly base_currency: 'ETB';
  readonly status: 'active' | 'inactive';
  /** Eloquent relation emitted by the tenant-scoped entities index. */
  readonly accounting_profile?: FinanceEntityAccountingProfile | null;
}

export interface FinanceDocumentSummary {
  readonly canonical_number: string;
  readonly document_type_code: string;
  readonly document_type_number: string;
  readonly title: string;
  readonly status: string;
  readonly issued_at: string;
  readonly file_id: number;
  readonly file_version: number;
  readonly file_sha256: string | null;
}

export interface FinanceDocumentLink {
  readonly id: number;
  readonly legal_entity_id: number;
  readonly document_id: number;
  readonly source_domain: string;
  readonly source_type: string;
  readonly source_id: string;
  readonly purpose:
    | 'source_evidence'
    | 'approval_evidence'
    | 'supporting_evidence'
    | 'issued_output'
    | 'reconciliation_evidence'
    | 'legal_authority';
  readonly is_primary: boolean;
  readonly linked_at: string;
  readonly document?: FinanceDocumentSummary;
}

export interface FinanceEntityListQuery {
  readonly page?: number;
  readonly per_page?: number;
}

export interface FinanceEntityListResponse {
  readonly items: readonly FinanceLegalEntity[];
  readonly meta: {
    readonly current_page?: number;
    readonly last_page?: number;
    readonly per_page?: number;
    readonly total?: number;
  };
}

export async function listFinanceEntities(
  query: FinanceEntityListQuery = {},
): Promise<FinanceEntityListResponse> {
  const response = await api.getWithMeta<readonly FinanceLegalEntity[]>(
    '/api/finance/entities',
    { params: { page: query.page, per_page: query.per_page } },
  );
  return {
    items: response.data,
    meta: response.meta ?? {},
  };
}


export interface FinanceDocumentLinkQuery {
  readonly source_domain?: string;
  readonly source_type?: string;
  readonly source_id?: string;
  readonly purpose?: FinanceDocumentLink['purpose'];
  readonly page?: number;
  readonly per_page?: number;
}

export interface FinanceDocumentLinkListResponse {
  readonly items: readonly FinanceDocumentLink[];
  readonly meta: {
    readonly current_page?: number;
    readonly last_page?: number;
    readonly per_page?: number;
    readonly total?: number;
  };
}

export async function listFinanceDocumentLinks(
  legalEntityId: number,
  query: FinanceDocumentLinkQuery = {},
): Promise<FinanceDocumentLinkListResponse> {
  const response = await api.getWithMeta<readonly FinanceDocumentLink[]>(
    '/api/finance/documents',
    { params: { legal_entity_id: legalEntityId, ...query } },
  );
  return {
    items: response.data,
    meta: response.meta ?? {},
  };
}

export type FinanceDimensionType =
  | 'department'
  | 'branch'
  | 'project'
  | 'cost_center'
  | 'contract'
  | 'fund'
  | 'region';

export interface FinanceDimension {
  readonly id: number;
  readonly legal_entity_id: number;
  readonly code: string;
  readonly dimension_type: FinanceDimensionType;
  readonly name_am: string | null;
  readonly name_en: string;
  readonly status: 'active' | 'inactive';
  readonly values_count?: number;
}

export interface FinanceDimensionValue {
  readonly id: number;
  readonly dimension_id: number;
  readonly parent_id: number | null;
  readonly code: string;
  readonly name_am: string | null;
  readonly name_en: string;
  readonly status: 'active' | 'inactive';
  readonly effective_from: string | null;
  readonly effective_to: string | null;
}

export interface FinanceDimensionCreateInput {
  readonly legal_entity_id: number;
  readonly code: string;
  readonly dimension_type: FinanceDimensionType;
  readonly name_en: string;
  readonly name_am?: string | null;
}

export interface FinanceDimensionValueCreateInput {
  readonly legal_entity_id: number;
  readonly code: string;
  readonly name_en: string;
  readonly name_am?: string | null;
  readonly parent_id?: number | null;
  readonly effective_from?: string | null;
  readonly effective_to?: string | null;
}

export async function listFinanceDimensions(
  legalEntityId: number,
  page = 1,
  perPage = 25,
): Promise<{ items: readonly FinanceDimension[]; meta: Record<string, unknown> }> {
  const response = await api.getWithMeta<readonly FinanceDimension[]>(
    '/api/finance/dimensions',
    { params: { legal_entity_id: legalEntityId, page, per_page: perPage } },
  );
  return { items: response.data, meta: response.meta ?? {} };
}

export function createFinanceDimension(input: FinanceDimensionCreateInput): Promise<FinanceDimension> {
  return api.post<FinanceDimension>('/api/finance/dimensions', input);
}

export async function listFinanceDimensionValues(
  legalEntityId: number,
  dimensionId: number,
  page = 1,
  perPage = 25,
): Promise<{ items: readonly FinanceDimensionValue[]; meta: Record<string, unknown> }> {
  const response = await api.getWithMeta<readonly FinanceDimensionValue[]>(
    `/api/finance/dimensions/${dimensionId}/values`,
    { params: { legal_entity_id: legalEntityId, page, per_page: perPage } },
  );
  return { items: response.data, meta: response.meta ?? {} };
}

export function createFinanceDimensionValue(
  dimensionId: number,
  input: FinanceDimensionValueCreateInput,
): Promise<FinanceDimensionValue> {
  return api.post<FinanceDimensionValue>(`/api/finance/dimensions/${dimensionId}/values`, input);
}
