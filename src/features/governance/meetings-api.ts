import { api } from '@/core/api/client';

export type MeetingKind = 'ga' | 'board';
export interface GovernanceMeeting {
  id: number; governance_body_id: number; meeting_kind: MeetingKind;
  title_am: string | null; title_en: string | null; scheduled_at: string;
  timezone: string; status: 'scheduled' | 'open' | 'closed' | 'cancelled';
}
export interface MeetingProxy {
  id: number; principal_membership_id: number; representative_membership_id: number | null;
  representative_name: string; instrument_reference: string; status: string; received_at: string;
}
export interface MeetingAttendance {
  id: number; membership_id: number; proxy_id: number | null; status: string;
  arrived_at: string | null; absence_authorized: boolean;\n  shareholder_id?: number | null; attendee_name_snapshot?: string | null; attendee_address_snapshot?: string | null;\n  share_count_snapshot?: string | null; vote_count_snapshot?: string | null; initialed_by_name?: string | null;\n  initialed_at?: string | null; signature_method?: string | null; signature_reference?: string | null;
}
export interface MeetingPenalty {
  id: number; membership_id: number; penalty_type: 'late' | 'absence'; amount: string;
  currency: 'ETB'; status: string; reason: string;
}
export interface MeetingDetail {
  meeting: GovernanceMeeting; proxies: MeetingProxy[];
  attendance: MeetingAttendance[]; penalties: MeetingPenalty[];
  payments: MeetingPenaltyPayment[]; dividend_settlement_requests: DividendSettlementRequest[];
}
export interface MeetingPenaltyPayment {
  id: number; penalty_id: number; amount: string; currency: 'ETB'; payment_method: string;
  receipt_reference: string; paid_at: string; finance_reconciliation_status: 'pending' | 'reconciled';
  finance_reference: string | null;
}
export interface DividendSettlementRequest {
  id: number; penalty_id: number; shareholder_id: number; dividend_reference: string;
  requested_amount: string; currency: 'ETB'; status: string; authority_reference: string | null;
  finance_reference: string | null;
}
export interface FinanceReconciliationQueue {
  payments: Array<MeetingPenaltyPayment & { meeting_id: number; finance_legal_entity_id: number | null }>;
  dividend_settlements: DividendSettlementRequest[];
}
export interface MeetingPage { data: GovernanceMeeting[]; current_page: number; last_page: number; total: number; }

export const listMeetings = (query: Record<string, string | number> = {}) =>
  api.get<MeetingPage>('/api/governance/meetings', { params: query });
export const getMeeting = (id: number) => api.get<MeetingDetail>(`/api/governance/meetings/${id}`);
export const createMeeting = (payload: {
  governance_body_id: number; finance_legal_entity_id?: number; meeting_kind: MeetingKind; scheduled_at: string;
  timezone?: string; title_am?: string; title_en?: string;
}) => api.post<GovernanceMeeting>('/api/governance/meetings', payload);
export const startMeeting = (id: number) => api.post<GovernanceMeeting>(`/api/governance/meetings/${id}/start`);
export const submitMeetingProxy = (id: number, payload: Record<string, unknown>) =>
  api.post<MeetingProxy>(`/api/governance/meetings/${id}/proxies`, payload);
export const reviewMeetingProxy = (id: number, proxyId: number, payload: { decision: 'accept' | 'reject'; reason?: string }) =>
  api.post<MeetingProxy>(`/api/governance/meetings/${id}/proxies/${proxyId}/review`, payload);
export const recordMeetingArrival = (id: number, payload: Record<string, unknown>) =>
  api.post<MeetingAttendance>(`/api/governance/meetings/${id}/attendance`, payload);
export const authorizeMeetingAbsence = (id: number, payload: Record<string, unknown>) =>
  api.post<MeetingAttendance>(`/api/governance/meetings/${id}/absence-authorizations`, payload);
export const closeMeeting = (id: number) => api.post<GovernanceMeeting>(`/api/governance/meetings/${id}/close`);
export const reviewMeetingPenalty = (id: number, penaltyId: number, payload: { decision: 'assess' | 'waive'; reason: string }) =>
  api.post<MeetingPenalty>(`/api/governance/meetings/${id}/penalties/${penaltyId}/review`, payload);
export const disputeMeetingPenalty = (id: number, penaltyId: number, payload: { reason: string }) =>
  api.post<MeetingPenalty>(`/api/governance/meetings/${id}/penalties/${penaltyId}/dispute`, payload);
export const recordMeetingPenaltyPayment = (id: number, penaltyId: number, payload: Record<string, unknown>) =>
  api.post<Record<string, unknown>>(`/api/governance/meetings/${id}/penalties/${penaltyId}/payments`, payload);
export const requestMeetingDividendSettlement = (id: number, penaltyId: number, payload: Record<string, unknown>) =>
  api.post<Record<string, unknown>>(`/api/governance/meetings/${id}/penalties/${penaltyId}/dividend-settlement-requests`, payload);

export const listMeetingFinanceReconciliationQueue = () =>
  api.get<FinanceReconciliationQueue>('/api/governance/meetings/finance-reconciliation');
export const reconcileMeetingPayment = (meetingId: number, paymentId: number, financeReference: number) =>
  api.post<MeetingPenaltyPayment>(`/api/governance/meetings/${meetingId}/payments/${paymentId}/reconcile`, { finance_reference: financeReference });
export const reviewMeetingDividendSettlement = (
  meetingId: number, settlementId: number,
  payload: { decision: 'approve' | 'reject'; authority_reference?: string; reason: string },
) => api.post<DividendSettlementRequest>(
  `/api/governance/meetings/${meetingId}/dividend-settlement-requests/${settlementId}/review`, payload,
);
export const reconcileMeetingDividendSettlement = (meetingId: number, settlementId: number, financeReference: number) =>
  api.post<DividendSettlementRequest>(
    `/api/governance/meetings/${meetingId}/dividend-settlement-requests/${settlementId}/reconcile`,
    { finance_reference: financeReference },
  );
