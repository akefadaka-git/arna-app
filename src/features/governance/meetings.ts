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
