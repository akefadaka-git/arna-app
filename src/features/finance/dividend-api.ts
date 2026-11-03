import { api } from '@/core/api/client';

export interface DividendDistributionItem {
  readonly id: number;
  readonly shareholder_id: number;
  readonly eligible_share_quantity: string;
  readonly gross_amount: string;
  readonly withholding_amount: string;
  readonly net_amount: string;
  readonly payable_id: number | null;
  readonly tax_rate_bps: number | null;
}

export interface DividendDistribution {
  readonly id: number;
  legal_entity_id: number;
  distribution_reference: string;
  financial_year: string;
  resolution_reference: string;
  resolution_date: string;
  declared_on: string;
  record_date: string;
  payment_due_on: string;
  readonly currency: string;
  declared_amount: string;
  readonly distributable_profit_amount: string | null;
  readonly status: string;
  readonly snapshot_row_count: number;
  readonly gross_total: string;
  readonly withholding_total: string;
  readonly net_total: string;
  readonly accrual_journal_reference: string | null;
  readonly items?: readonly DividendDistributionItem[];
}

export interface DividendPaymentBatchItem {
  readonly id: number;
  readonly payable_id: number;
  readonly shareholder_id: number;
  readonly amount: string;
  readonly status: 'pending' | 'paid' | 'failed';
  readonly bank_reference: string | null;
  readonly journal_reference: string | null;
  readonly failure_reason: string | null;
}

export interface DividendPaymentBatch {
  readonly id: number;
  legal_entity_id: number;
  readonly distribution_id: number;
  readonly batch_reference: string;
  readonly currency: string;
  readonly total_amount: string;
  readonly status: string;
  readonly reconciliation_status: string;
  readonly bank_statement_reference: string | null;
  readonly bank_statement_amount: string | null;
  readonly items?: readonly DividendPaymentBatchItem[];
}

export interface CreateDividendDistributionPayload {
  legal_entity_id: number;
  distribution_reference: string;
  financial_year: string;
  resolution_reference: string;
  resolution_date: string;
  declared_on: string;
  record_date: string;
  payment_due_on: string;
  declared_amount: string;
  approved_balance_sheet_reference: string;
  distributable_profit_amount: string;
  resolution_evidence_reference: string;
  payment_method: 'bank_transfer' | 'account_payee_cheque' | 'account_payee_bank_draft' | 'nbe_authorized_payment';
  accounting_framework: 'ifrs' | 'ifrs_sme' | 'other_aabe_approved';
  replaces_distribution_id?: number;
  replacement_reason?: string;
}

export async function getDividendDistribution(id: number): Promise<DividendDistribution> {
  const response = await api.get<{ data: DividendDistribution }>(`/api/finance/dividend-distributions/${id}`);
  return response.data;
}

export async function listDividendDistributions(): Promise<readonly DividendDistribution[]> {
  const response = await api.get<{ data: readonly DividendDistribution[] }>(
    '/api/finance/dividend-distributions',
    { params: { per_page: 100 } },
  );
  return response.data;
}

export function createDividendDistribution(payload: CreateDividendDistributionPayload): Promise<DividendDistribution> {
  return api.post('/api/finance/dividend-distributions', payload);
}

export interface DividendShareClassWeight {
  readonly id: number;
  readonly distribution_id: number;
  readonly share_class_id: number;
  readonly weight_bps: number;
  readonly evidence_reference: string;
  readonly status: 'pending' | 'approved';
  readonly approved_by: number | null;
  readonly approved_at: string | null;
}

export async function listDividendShareClassWeights(distributionId: number): Promise<readonly DividendShareClassWeight[]> {
  const response = await api.get<{ data: readonly DividendShareClassWeight[] }>(
    `/api/finance/dividend-distributions/${distributionId}/share-class-weights`,
  );
  return response.data;
}

export function requestDividendShareClassWeight(
  distributionId: number,
  payload: { share_class_id: number; weight_bps: number; evidence_reference: string },
): Promise<DividendShareClassWeight> {
  return api.post(`/api/finance/dividend-distributions/${distributionId}/share-class-weights`, payload);
}

export function approveDividendShareClassWeight(distributionId: number, weightId: number): Promise<DividendShareClassWeight> {
  return api.post(`/api/finance/dividend-distributions/${distributionId}/share-class-weights/${weightId}/approve`, {});
}

export function certifyDividendProfit(id: number): Promise<DividendDistribution> {
  return api.post(`/api/finance/dividend-distributions/${id}/certify-profit`, {});
}

export function assessDividendRecipientTax(
  distributionId: number,
  shareholderId: number,
  payload: {
    recipient_type: 'individual' | 'company' | 'other';
    tax_residency: 'resident' | 'non_resident';
    treatment: 'statutory' | 'treaty' | 'exempt' | 'special';
    withholding_rate_bps: number;
    legal_basis: string;
    evidence_reference?: string;
    effective_from: string;
    evidence_expires_on?: string;
  },
): Promise<unknown> {
  return api.post(
    `/api/finance/dividend-distributions/${distributionId}/shareholders/${shareholderId}/tax-assessment`,
    payload,
  );
}

export function cancelDividendDistribution(id: number, reason: string): Promise<DividendDistribution> {
  return api.post(`/api/finance/dividend-distributions/${id}/cancel`, { reason });
}

export function calculateDividendDistribution(id: number): Promise<DividendDistribution> {
  return api.post(`/api/finance/dividend-distributions/${id}/calculate`, {});
}

export function approveDividendDistribution(id: number): Promise<DividendDistribution> {
  return api.post(`/api/finance/dividend-distributions/${id}/approve`, {});
}

export interface DividendTaxRemittance {
  readonly id: number;
  readonly legal_entity_id: number;
  readonly distribution_id: number;
  readonly remittance_reference: string;
  readonly tax_authority_reference: string;
  readonly amount: string;
  readonly currency: string;
  readonly status: string;
  readonly bank_reference: string | null;
  readonly journal_reference: string | null;
}

export async function listDividendTaxRemittances(): Promise<readonly DividendTaxRemittance[]> {
  const response = await api.get<{ data: readonly DividendTaxRemittance[] }>('/api/finance/dividend-tax-remittances', { params: { per_page: 100 } });
  return response.data;
}

export function createDividendTaxRemittance(payload: {
  legal_entity_id: number;
  distribution_id: number;
  remittance_reference: string;
  tax_authority_reference: string;
  amount: string;
}): Promise<DividendTaxRemittance> {
  return api.post('/api/finance/dividend-tax-remittances', payload);
}

export function approveDividendTaxRemittance(id: number): Promise<DividendTaxRemittance> {
  return api.post(`/api/finance/dividend-tax-remittances/${id}/approve`, {});
}

export function cancelDividendTaxRemittance(id: number, reason: string): Promise<DividendTaxRemittance> {
  return api.post(`/api/finance/dividend-tax-remittances/${id}/cancel`, { reason });
}

export function confirmDividendTaxRemittance(
  id: number,
  payload: { bank_reference: string; evidence_reference: string; paid_on: string },
): Promise<DividendTaxRemittance> {
  return api.post(`/api/finance/dividend-tax-remittances/${id}/confirm`, payload);
}

export async function listDividendPaymentBatches(): Promise<readonly DividendPaymentBatch[]> {
  const response = await api.get<{ data: readonly DividendPaymentBatch[] }>(
    '/api/finance/dividend-payment-batches',
    { params: { per_page: 100 } },
  );
  return response.data;
}

export function createDividendPaymentBatch(payload: {
  legal_entity_id: number;
  distribution_id: number;
  batch_reference: string;
  payable_ids: number[];
}): Promise<DividendPaymentBatch> {
  return api.post('/api/finance/dividend-payment-batches', payload);
}

export function cancelDividendPaymentBatch(id: number, reason: string): Promise<DividendPaymentBatch> {
  return api.post(`/api/finance/dividend-payment-batches/${id}/cancel`, { reason });
}

export function approveDividendPaymentBatch(id: number): Promise<DividendPaymentBatch> {
  return api.post(`/api/finance/dividend-payment-batches/${id}/approve`, {});
}

export function confirmDividendPayment(
  batchId: number,
  itemId: number,
  payload: { bank_reference: string; evidence_reference: string; paid_on: string },
): Promise<unknown> {
  return api.post(`/api/finance/dividend-payment-batches/${batchId}/items/${itemId}/confirm`, payload);
}

export function failDividendPayment(batchId: number, itemId: number, reason: string): Promise<unknown> {
  return api.post(`/api/finance/dividend-payment-batches/${batchId}/items/${itemId}/fail`, { reason });
}

export function reconcileDividendPaymentBatch(
  id: number,
  payload: { statement_reference: string; statement_amount: string },
): Promise<DividendPaymentBatch> {
  return api.post(`/api/finance/dividend-payment-batches/${id}/reconcile`, payload);
}
