import { api } from '@/core/api/client';

export type GovernanceMeetingStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type GovernanceMeetingMode = 'in_person' | 'remote' | 'hybrid';

export interface GovernanceMeeting {
  readonly id: number;
  readonly tenant_id: number;
  readonly governance_body_id: number;
  readonly title_am: string | null;
  readonly title_en: string | null;
  readonly display_title?: string;
  readonly meeting_type: 'ordinary' | 'extraordinary' | 'annual' | 'special';
  readonly status: GovernanceMeetingStatus;
  readonly scheduled_at: string | null;
  readonly location: string | null;
  readonly meeting_mode: GovernanceMeetingMode;
  readonly notes: string | null;
  readonly approved_at: string | null;
  readonly approved_by: number | null;
  readonly body?: { readonly id: number; readonly code: string; readonly name_am: string | null; readonly name_en: string | null };
}

export interface GovernanceMeetingPage {
  readonly data: readonly GovernanceMeeting[];
  readonly current_page: number;
  readonly last_page: number;
  readonly per_page: number;
  readonly total: number;
}

export interface CreateGovernanceMeetingInput {
  readonly governance_body_id: number;
  readonly title_am?: string;
  readonly title_en?: string;
  readonly meeting_type?: GovernanceMeeting['meeting_type'];
  readonly scheduled_at?: string;
  readonly location?: string;
  readonly meeting_mode?: GovernanceMeetingMode;
  readonly notes?: string;
}

export async function listGovernanceMeetings(page = 1): Promise<GovernanceMeetingPage> {
  return api.get<GovernanceMeetingPage>('/api/governance/meetings', {
    params: { page, per_page: 25 },
  });
}

export function createGovernanceMeeting(input: CreateGovernanceMeetingInput): Promise<GovernanceMeeting> {
  return api.post<GovernanceMeeting>('/api/governance/meetings', input);
}

export function approveGovernanceMeeting(id: number): Promise<GovernanceMeeting> {
  return api.post<GovernanceMeeting>(`/api/governance/meetings/${id}/approve`);
}


export interface GovernanceAgendaItem {
  readonly id: number;
  readonly meeting_id: number;
  readonly position: number;
  readonly title_am: string | null;
  readonly title_en: string | null;
  readonly description: string | null;
  readonly status: string;
}

export interface GovernanceMeetingAttendance {
  readonly id: number;
  readonly governance_membership_id: number;
  readonly attendance_status: 'present' | 'absent' | 'excused' | 'remote';
  readonly recorded_at: string | null;
  readonly notes: string | null;
  readonly user_id?: number | null;
  readonly member_name_am?: string | null;
  readonly member_name_en?: string | null;
  readonly membership_status?: string;
}

export interface GovernanceQuorumSnapshot {
  readonly eligible_voting_members: number;
  readonly present_voting_members: number;
  readonly threshold_percent: number;
  readonly threshold_count: number;
  readonly quorum_met: boolean;
  readonly evaluated_at: string;
}

export interface GovernanceMeetingAuditEvent {
  readonly id: number;
  readonly actor_id: number | null;
  readonly event_type: string;
  readonly before_json: Record<string, unknown> | null;
  readonly after_json: Record<string, unknown> | null;
  readonly occurred_at: string;
}

export async function listMeetingAgenda(id: number): Promise<readonly GovernanceAgendaItem[]> {
  return api.get<readonly GovernanceAgendaItem[]>(`/api/governance/meetings/${id}/agenda`);
}

export function addMeetingAgendaItem(id: number, input: { position: number; title_am?: string; title_en?: string; description?: string }): Promise<GovernanceAgendaItem> {
  return api.post<GovernanceAgendaItem>(`/api/governance/meetings/${id}/agenda`, input);
}

export async function listMeetingAttendance(id: number): Promise<readonly GovernanceMeetingAttendance[]> {
  return api.get<readonly GovernanceMeetingAttendance[]>(`/api/governance/meetings/${id}/attendance`);
}

export function recordMeetingAttendance(id: number, input: { governance_membership_id: number; attendance_status: GovernanceMeetingAttendance['attendance_status']; notes?: string }): Promise<GovernanceMeetingAttendance> {
  return api.post<GovernanceMeetingAttendance>(`/api/governance/meetings/${id}/attendance`, input);
}

export function evaluateMeetingQuorum(id: number): Promise<GovernanceQuorumSnapshot> {
  return api.post<GovernanceQuorumSnapshot>(`/api/governance/meetings/${id}/quorum/evaluate`);
}

export async function listMeetingAuditEvents(id: number): Promise<readonly GovernanceMeetingAuditEvent[]> {
  return api.get<readonly GovernanceMeetingAuditEvent[]>(`/api/governance/meetings/${id}/audit-events`);
}
