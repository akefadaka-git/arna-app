import { api } from '@/core/api/client';

export type MeetingKind = 'general_assembly' | 'board';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused' | 'represented';

export interface GovernanceMeeting {
  readonly id: number;
  readonly tenant_id: number;
  readonly governance_body_id: number;
  readonly meeting_code: string;
  readonly title_am: string | null;
  readonly title_en: string | null;
  readonly meeting_kind: MeetingKind;
  readonly meeting_category: 'ordinary' | 'extraordinary' | null;
  readonly starts_at: string;
  readonly ends_at: string | null;
  readonly status: string;
  readonly attendance?: readonly AttendanceRecord[];
  readonly proxies?: readonly ProxyRecord[];
  readonly penalties?: readonly PenaltyRecord[];
  readonly corrections?: readonly AttendanceCorrectionRecord[];
  readonly disputes?: readonly PenaltyDisputeRecord[];
  readonly proxy_events?: readonly ProxyEventRecord[];
}

export interface AttendanceRecord {
  readonly id: number;
  readonly subject_type: 'shareholder' | 'director';
  readonly subject_id: number;
  readonly attendance_status: AttendanceStatus;
  readonly proxy_id?: number | null;
  readonly represented_by_user_id?: number | null;
  readonly represented_by_name?: string | null;
  readonly arrived_at: string | null;
  readonly notes: string | null;
}

export interface ProxyRecord {
  readonly id: number;
  readonly principal_type: 'shareholder' | 'director';
  readonly principal_id: number;
  readonly proxy_user_id: number | null;
  readonly proxy_name_am: string | null;
  readonly proxy_name_en: string | null;
  readonly submitted_at: string;
  readonly deadline_at: string;
  readonly status: 'submitted' | 'approved' | 'rejected' | 'revoked';
}

export interface PenaltyRecord {
  readonly id: number;
  readonly attendance_id: number;
  readonly penalty_type: 'late' | 'absence';
  readonly amount_cents: number;
  readonly currency: 'ETB';
  readonly status: string;
}

export interface PenaltySettlement {
  readonly id: number;
  readonly penalty_id: number;
  readonly method: 'cash' | 'dividend_offset';
  readonly amount_cents: number;
  readonly currency: 'ETB';
  readonly status: string;
}

export interface CreateMeetingInput {
  governance_body_id: number;
  meeting_code: string;
  title_am?: string;
  title_en?: string;
  meeting_kind: MeetingKind;
  meeting_category?: 'ordinary' | 'extraordinary';
  starts_at: string;
  ends_at?: string;
}

export async function listGovernanceMeetings(): Promise<readonly GovernanceMeeting[]> {
  return api.get<readonly GovernanceMeeting[]>('/api/governance/meetings');
}

export async function getGovernanceMeeting(id: number): Promise<GovernanceMeeting> {
  return api.get<GovernanceMeeting>(`/api/governance/meetings/${id}`);
}

export async function createGovernanceMeeting(input: CreateMeetingInput): Promise<GovernanceMeeting> {
  return api.post<GovernanceMeeting>('/api/governance/meetings', input);
}

export async function recordGovernanceAttendance(
  meetingId: number,
  input: {
    subject_type: 'shareholder' | 'director';
    subject_id: number;
    user_id?: number;
    proxy_id?: number;
    represented_by_user_id?: number;
    represented_by_name?: string;
    attendance_status: AttendanceStatus;
    arrived_at?: string;
    notes?: string;
  },
): Promise<AttendanceRecord> {
  return api.post<AttendanceRecord>(`/api/governance/meetings/${meetingId}/attendance`, input);
}

export async function submitGovernanceProxy(
  meetingId: number,
  input: {
    principal_type: 'shareholder' | 'director';
    principal_id: number;
    proxy_user_id?: number;
    proxy_name_am?: string;
    proxy_name_en?: string;
    proxy_reference?: string;
    instrument_reference?: string;
  },
): Promise<ProxyRecord> {
  return api.post<ProxyRecord>(`/api/governance/meetings/${meetingId}/proxies`, input);
}

export async function reviewGovernanceProxy(
  proxyId: number,
  decision: 'approved' | 'rejected',
  reason?: string,
): Promise<ProxyRecord> {
  return api.patch<ProxyRecord>(`/api/governance/proxies/${proxyId}/review`, { decision, reason });
}

export async function assessGovernancePenalty(
  meetingId: number,
  attendanceId: number,
  penaltyType: 'late' | 'absence',
  reason?: string,
): Promise<PenaltyRecord> {
  return api.post<PenaltyRecord>(`/api/governance/meetings/${meetingId}/penalties`, {
    attendance_id: attendanceId,
    penalty_type: penaltyType,
    reason,
  });
}

export async function requestGovernancePenaltySettlement(
  penaltyId: number,
  method: 'cash' | 'dividend_offset',
  amountCents: number,
  reference?: string,
): Promise<PenaltySettlement> {
  return api.post<PenaltySettlement>(`/api/governance/penalties/${penaltyId}/settlements`, {
    method,
    amount_cents: amountCents,
    reference,
  });
}

export interface AttendanceCorrectionInput {
  attendance_id: number;
  proposed_status: AttendanceStatus;
  proposed_arrived_at?: string;
  reason: string;
}

export async function requestAttendanceCorrection(
  meetingId: number,
  input: AttendanceCorrectionInput,
): Promise<unknown> {
  return api.post<unknown>(`/api/governance/meetings/${meetingId}/attendance/corrections`, input);
}

export async function reviewAttendanceCorrection(
  correctionId: number,
  decision: 'approved' | 'rejected',
  reason: string,
): Promise<unknown> {
  return api.patch<unknown>(`/api/governance/attendance-corrections/${correctionId}/review`, { decision, reason });
}

export async function submitPenaltyDispute(
  penaltyId: number,
  reason: string,
  evidenceReference?: string,
): Promise<unknown> {
  return api.post<unknown>(`/api/governance/penalties/${penaltyId}/disputes`, {
    reason,
    evidence_reference: evidenceReference,
  });
}

export async function reviewPenaltyDispute(
  disputeId: number,
  decision: 'upheld' | 'waived',
  reason: string,
): Promise<unknown> {
  return api.patch<unknown>(`/api/governance/penalty-disputes/${disputeId}/review`, { decision, reason });
}

export interface AttendanceCorrectionRecord {
  readonly id: number;
  readonly attendance_id: number;
  readonly proposed_status: AttendanceStatus;
  readonly proposed_arrived_at: string | null;
  readonly reason: string;
  readonly status: 'pending' | 'approved' | 'rejected';
  readonly requested_by: number;
}
export interface PenaltyDisputeRecord {
  readonly id: number;
  readonly penalty_id: number;
  readonly reason: string;
  readonly evidence_reference: string | null;
  readonly status: 'pending' | 'upheld' | 'waived';
  readonly submitted_by: number;
}


export interface GovernanceAgendaItem {
  readonly id: number;
  readonly tenant_id: number;
  readonly meeting_id: number;
  readonly item_number: number;
  readonly title_am: string | null;
  readonly title_en: string | null;
  readonly description: string | null;
  readonly duration_minutes: number | null;
  readonly status: 'draft';
  readonly version: number;
}

export interface GovernanceAgendaItemInput {
  item_number: number;
  title_am?: string;
  title_en?: string;
  description?: string;
  duration_minutes?: number;
}

export async function listGovernanceAgenda(meetingId: number): Promise<readonly GovernanceAgendaItem[]> {
  return api.get<readonly GovernanceAgendaItem[]>(`/api/governance/meetings/${meetingId}/agenda`);
}

export async function createGovernanceAgendaItem(
  meetingId: number,
  input: GovernanceAgendaItemInput,
): Promise<GovernanceAgendaItem> {
  return api.post<GovernanceAgendaItem>(`/api/governance/meetings/${meetingId}/agenda`, input);
}

export async function updateGovernanceAgendaItem(
  itemId: number,
  version: number,
  input: Partial<GovernanceAgendaItemInput>,
): Promise<GovernanceAgendaItem> {
  return api.patch<GovernanceAgendaItem>(`/api/governance/agenda-items/${itemId}`, { ...input, version });
}


export interface ProxyHistoryVerification {
  readonly status: 'PASS' | 'FAIL' | 'BLOCKED';
  readonly proxy_id: number;
  readonly event_count: number;
  readonly verified_through_event_id: number | null;
  readonly failed_event_id: number | null;
  readonly chain_root: string | null;
  readonly integrity_verified: boolean;
  readonly current_status_matches_chain: boolean;
  readonly note: string;
}

export async function verifyGovernanceProxyHistory(proxyId: number): Promise<ProxyHistoryVerification> {
  return api.get<ProxyHistoryVerification>(`/api/governance/proxies/${proxyId}/verify-history`);
}

export interface ProxyEventRecord {
  readonly id: number;
  readonly proxy_id: number;
  readonly event_type: string;
  readonly previous_status: string | null;
  readonly next_status: string | null;
  readonly actor_id: number;
  readonly reason: string | null;
  readonly previous_event_hash: string | null;
  readonly event_hash: string;
  readonly occurred_at: string;
}

export async function revokeGovernanceProxy(proxyId: number, reason: string): Promise<ProxyRecord> {
  return api.patch<ProxyRecord>(`/api/governance/proxies/${proxyId}/revoke`, { reason });
}

export interface ElectorateSnapshot {
  readonly id: number;
  readonly meeting_id: number;
  readonly version: number;
  readonly source_register_version: string;
  readonly cutoff_at: string;
  readonly entry_count: number;
  readonly source_hash: string;
  readonly status: 'draft' | 'approved' | 'superseded';
  readonly approval_reference: string | null;
}

export interface QuorumEvaluation {
  readonly status: 'PASS' | 'FAIL' | 'BLOCKED';
  readonly reason_code?: string;
  readonly meeting_id: number;
  readonly electorate_snapshot_id: number | null;
  readonly quorum_rule_id: number | null;
  readonly present_voting_units?: string;
  readonly total_eligible_voting_units?: string;
  readonly threshold?: string;
  readonly can_open_business: boolean;
  readonly evaluation_id?: number;
}

export async function createGovernanceElectorateSnapshot(
  meetingId: number,
  sourceRegisterVersion: string,
  cutoffAt: string,
): Promise<ElectorateSnapshot> {
  return api.post<ElectorateSnapshot>(`/api/governance/meetings/${meetingId}/electorate-snapshots`, {
    source_register_version: sourceRegisterVersion,
    cutoff_at: cutoffAt,
  });
}

export async function approveGovernanceElectorateSnapshot(
  snapshotId: number,
  approvalReference: string,
): Promise<ElectorateSnapshot> {
  return api.post<ElectorateSnapshot>(`/api/governance/electorate-snapshots/${snapshotId}/approve`, {
    approval_reference: approvalReference,
  });
}

export interface CreateQuorumRuleInput {
  meeting_kind: 'general_assembly' | 'board';
  meeting_category?: 'ordinary' | 'extraordinary';
  rule_code: string;
  legal_basis: string;
  quorum_numerator: number;
  quorum_denominator: number;
  share_class_weights: Record<string, string>;
  effective_from: string;
  effective_until?: string;
}

export async function createGovernanceQuorumRule(input: CreateQuorumRuleInput): Promise<unknown> {
  return api.post<unknown>('/api/governance/quorum-rules', input);
}

export async function approveGovernanceQuorumRule(
  ruleId: number,
  approvalReference: string,
  approvalDocumentHash: string,
): Promise<unknown> {
  return api.post<unknown>(`/api/governance/quorum-rules/${ruleId}/approve`, {
    approval_reference: approvalReference,
    approval_document_hash: approvalDocumentHash,
  });
}

export async function verifyGovernanceQuorumRule(
  ruleId: number,
  verificationReference: string,
  verificationDocumentHash: string,
): Promise<unknown> {
  return api.post<unknown>(`/api/governance/quorum-rules/${ruleId}/verify-legal`, {
    legal_verification_reference: verificationReference,
    legal_verification_document_hash: verificationDocumentHash,
  });
}

export async function evaluateGovernanceQuorum(meetingId: number): Promise<QuorumEvaluation> {
  return api.post<QuorumEvaluation>(`/api/governance/meetings/${meetingId}/quorum/evaluate`, {});
}
