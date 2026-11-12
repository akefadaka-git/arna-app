import { api } from '@/core/api/client';

export interface FinanceEntity {
  readonly id: number;
  readonly code: string;
  readonly name_en: string;
  readonly name_am?: string | null;
  readonly base_currency: string;
  readonly status: string;
}


export interface FinanceAccount {
  readonly id: number;
  readonly code: string;
  readonly name_en: string;
  readonly account_type: string;
  readonly normal_balance: string;
  readonly status: string;
}

export interface FinanceJournal {
  readonly id: number;
  readonly journal_number: string;
  readonly effective_date: string;
  readonly status: string;
  readonly currency: string;
  readonly description: string;
  readonly total_debits?: string;
  readonly total_credits?: string;
}

export interface FinanceAccountingPeriod {
  readonly id: number;
  readonly code: string;
  readonly starts_on: string;
  readonly ends_on: string;
  readonly status: string;
}

export interface FinanceInboxEvent {
  readonly id: number;
  readonly source_type: string;
  readonly source_event_id: string;
  readonly source_version: string;
  readonly event_type: string;
  readonly status: string;
  readonly payload_sha256: string;
  readonly last_error: string | null;
  readonly received_at: string;
}

export interface FinanceTrialBalanceAccount {
  readonly id: number;
  readonly code: string;
  readonly name_en: string;
  readonly debit_total: string;
  readonly credit_total: string;
  readonly net_debit: string;
  readonly net_credit: string;
}

export interface FinanceEvidenceSnapshot {
  readonly scope: { readonly tenant_id: number; readonly legal_entity_id: number; readonly entity_code: string };
  readonly as_of: string;
  readonly as_of_ec: string;
  readonly report: {
    readonly currency: string;
    readonly accounts: readonly FinanceTrialBalanceAccount[];
    readonly summary: {
      readonly total_debits: string;
      readonly total_credits: string;
      readonly difference: string;
      readonly is_balanced: boolean;
    };
  };
  readonly evidence_refs: readonly { readonly type: string; readonly legal_entity_id: number; readonly as_of: string; readonly sha256: string }[];
  readonly evidence_sha256: string;
  readonly limitations: readonly string[];
}

export interface FinanceAiProposal {
  readonly id: number;
  readonly legal_entity_id: number;
  readonly agent_key: string;
  readonly task_type: string;
  readonly status: 'proposed' | 'approved' | 'rejected';
  readonly title: string;
  readonly summary: string;
  readonly proposal: Readonly<Record<string, unknown>>;
  readonly evidence_refs: readonly Readonly<Record<string, unknown>>[];
  readonly evidence_sha256: string;
  readonly confidence: string | null;
  readonly limitations: readonly string[];
  readonly requested_by: number;
  readonly reviewed_by: number | null;
}

interface ApiEnvelope<T> {
  readonly success: boolean;
  readonly data: T;
}

export async function listFinanceEntities(): Promise<FinanceEntity[]> {
  const result = await api.get<ApiEnvelope<{ data: FinanceEntity[] }>>('/api/finance/entities');
  return result.data.data;
}

export async function getFinanceEvidence(legalEntityId: number, asOfEc: string): Promise<FinanceEvidenceSnapshot> {
  const result = await api.get<ApiEnvelope<FinanceEvidenceSnapshot>>('/api/finance/intelligence/evidence', {
    params: { legal_entity_id: legalEntityId, as_of_ec: asOfEc },
  });
  return result.data;
}

export async function listFinanceAiProposals(legalEntityId: number): Promise<FinanceAiProposal[]> {
  const result = await api.get<ApiEnvelope<{ data: FinanceAiProposal[] }>>('/api/finance/intelligence/proposals', {
    params: { legal_entity_id: legalEntityId },
  });
  return result.data.data;
}


export async function listFinanceAccounts(legalEntityId: number): Promise<FinanceAccount[]> {
  const result = await api.get<ApiEnvelope<{ data: FinanceAccount[] }>>('/api/finance/accounts', {
    params: { legal_entity_id: legalEntityId },
  });
  return result.data.data;
}

export async function listFinanceJournals(legalEntityId: number): Promise<FinanceJournal[]> {
  const result = await api.get<ApiEnvelope<{ data: FinanceJournal[] }>>('/api/finance/journals', {
    params: { legal_entity_id: legalEntityId },
  });
  return result.data.data;
}

export async function listFinancePeriods(legalEntityId: number): Promise<FinanceAccountingPeriod[]> {
  const result = await api.get<ApiEnvelope<{ data: FinanceAccountingPeriod[] }>>('/api/finance/periods', {
    params: { legal_entity_id: legalEntityId },
  });
  return result.data.data;
}

export async function listFinanceInbox(): Promise<FinanceInboxEvent[]> {
  const result = await api.get<ApiEnvelope<{ data: FinanceInboxEvent[] }>>('/api/finance/subledger/inbox', {
    params: { status: 'quarantined' },
  });
  return result.data.data;
}

export async function generateFinanceAiProposal(input: {
  legal_entity_id: number;
  task_type: 'variance_review' | 'cash_flow_review' | 'ledger_anomaly_review' | 'period_close_review';
  as_of_ec: string;
  question: string;
}): Promise<FinanceAiProposal> {
  const result = await api.post<ApiEnvelope<FinanceAiProposal>>('/api/finance/intelligence/proposals', input);
  return result.data;
}

export async function reviewFinanceAiProposal(id: number, action: 'approve' | 'reject', reason: string): Promise<FinanceAiProposal> {
  const result = await api.post<ApiEnvelope<FinanceAiProposal>>(
    `/api/finance/intelligence/proposals/${id}/${action}`,
    { reason },
  );
  return result.data;
}
