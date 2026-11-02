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
  readonly starts_at: string;
  readonly ends_at: string | null;
  readonly status: string;
  readonly attendance?: readonly AttendanceRecord[];
  readonly proxies?: readonly ProxyRecord[];
  readonly penalties?: readonly PenaltyRecord[];
}

export interface AttendanceRecord {
  readonly id: number;
  readonly subject_type: 'shareholder' | 'director';
  readonly subject_id: number;
  readonly attendance_status: AttendanceStatus;
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
  readonly status: 'submitted' | 'approved' | 'rejected';
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
