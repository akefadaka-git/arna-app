import { api } from '@/core/api/client';

export type SettlementAccountRole = 'fine_receivable' | 'cash_bank' | 'dividend_payable' | 'penalty_income';
export interface SettlementAccountMapping {
  readonly id: number; readonly legal_entity_id: number; readonly account_role: SettlementAccountRole;
  readonly ledger_account_id: number; readonly status: 'pending'|'approved'|'revoked';
  readonly configuration_reason: string; readonly account?: { readonly code: string; readonly name_en: string; readonly account_type: string; readonly normal_balance: string };
}
export interface DividendPayable {
  readonly id: number; readonly legal_entity_id: number; readonly shareholder_id: number;
  readonly distribution_reference: string; readonly declared_on: string; readonly due_on: string;
  readonly net_payable_amount: string; readonly cash_paid_amount: string; readonly penalty_offset_amount: string;
  readonly status: 'draft'|'payable'|'settled'|'void'; readonly approval_reference?: string|null;
}
export interface SettlementExecution {
  readonly journal_id: number; readonly journal_number?: string; readonly settlement_id: number;
  readonly status: string; readonly method: 'cash'|'dividend_offset'; readonly amount: string; readonly idempotent_replay: boolean;
}
export interface SettlementReconciliationRow {
  readonly settlement_id: number; readonly penalty_id: number; readonly amount_cents: number;
  readonly currency: string; readonly settlement_status: string; readonly journal_id: number|null;
  readonly journal_number: string|null; readonly journal_status: string|null; readonly legal_entity_id: number|null;
}
export async function listSettlementAccountMappings(legalEntityId: number): Promise<{data: SettlementAccountMapping[]}> {
  return api.get<{data:SettlementAccountMapping[]}>('/api/finance/governance-settlement/account-mappings', { params: { legal_entity_id: legalEntityId } });
}
export async function requestSettlementAccountMapping(input: {legal_entity_id:number;account_role:SettlementAccountRole;ledger_account_id:number;reason:string}): Promise<SettlementAccountMapping> {
  return api.post('/api/finance/governance-settlement/account-mappings',input);
}
export async function approveSettlementAccountMapping(id:number): Promise<SettlementAccountMapping> {
  return api.post(`/api/finance/governance-settlement/account-mappings/${id}/approve`,{});
}
export async function listDividendPayables(params:{legal_entity_id?:number;shareholder_id?:number;status?:string}={}): Promise<{data:DividendPayable[]}> {
  return api.get<{data:DividendPayable[]}>('/api/finance/governance-settlement/dividend-payables',{params});
}
export async function createDividendPayable(input:{legal_entity_id:number;shareholder_id:number;distribution_reference:string;declared_on:string;due_on:string;net_payable_amount:string}):Promise<DividendPayable>{
  return api.post('/api/finance/governance-settlement/dividend-payables',input);
}
export async function approveDividendPayable(id:number,approval_reference:string):Promise<DividendPayable>{
  return api.post(`/api/finance/governance-settlement/dividend-payables/${id}/approve`,{approval_reference});
}
export async function executeGovernanceCashSettlement(id:number,effective_date:string,idempotency_key:string):Promise<SettlementExecution>{
  return api.post(`/api/finance/governance-settlement/settlements/${id}/cash`,{effective_date,idempotency_key});
}
export async function executeGovernanceDividendOffset(id:number,dividend_payable_id:number,effective_date:string,idempotency_key:string):Promise<SettlementExecution>{
  return api.post(`/api/finance/governance-settlement/settlements/${id}/dividend-offset`,{dividend_payable_id,effective_date,idempotency_key});
}
export async function getGovernanceSettlementReconciliation(legal_entity_id:number):Promise<SettlementReconciliationRow[]>{
  return api.get<SettlementReconciliationRow[]>('/api/finance/governance-settlement/reconciliation',{params:{legal_entity_id}});
}


export interface SourceEntityMapping {
  readonly id:number; readonly source_type:string; readonly source_id:string; readonly legal_entity_id:number;
  readonly status:'pending'|'approved'|'revoked'; readonly mapping_reason:string;
}
export async function listSourceEntityMappings(status?:string):Promise<{data:SourceEntityMapping[]}>{
  return api.get<{data:SourceEntityMapping[]}>('/api/finance/source-mappings',{params:{status}});
}
export async function requestSourceEntityMapping(sourceId:number,legalEntityId:number,reason:string):Promise<SourceEntityMapping>{
  return api.post('/api/finance/source-mappings',{source_type:'governance_penalty_settlement',source_id:String(sourceId),legal_entity_id:legalEntityId,reason});
}
export async function approveSourceEntityMapping(id:number,reason:string):Promise<SourceEntityMapping>{
  return api.post(`/api/finance/source-mappings/${id}/approve`,{reason});
}

export async function revokeSettlementAccountMapping(id:number,reason:string):Promise<SettlementAccountMapping>{
  return api.post(\`/api/finance/governance-settlement/account-mappings/\${id}/revoke\`,{reason});
}
