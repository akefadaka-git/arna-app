import { api } from '@/core/api/client';

export type GovernanceElectionStatus = 'draft' | 'nominations_open' | 'nominations_closed' | 'voting_open' | 'voting_closed' | 'certified' | 'cancelled';

export interface GovernanceElection {
  readonly id: number;
  readonly tenant_id: number;
  readonly governance_body_id: number;
  readonly title_am: string | null;
  readonly title_en: string | null;
  readonly mandate: string;
  readonly status: GovernanceElectionStatus;
  readonly nominations_open_at: string;
  readonly nominations_close_at: string;
  readonly voting_open_at: string;
  readonly voting_close_at: string;
  readonly certified_at: string | null;
}

export interface GovernanceElectionNomination {
  readonly id: number;
  readonly election_id: number;
  readonly governance_membership_id: number;
  readonly statement: string | null;
  readonly status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  readonly reviewed_at: string | null;
}

export interface GovernanceElectionAuditEvent {
  readonly id: number;
  readonly actor_id: number | null;
  readonly event_type: string;
  readonly metadata: Record<string, unknown> | null;
  readonly occurred_at: string;
}

export interface GovernanceElectionResult {
  readonly nomination_id: number;
  readonly governance_membership_id: number;
  readonly vote_count: number;
}

export interface GovernanceElectionPage {
  readonly data: readonly GovernanceElection[];
  readonly current_page: number;
  readonly last_page: number;
  readonly total: number;
}

export interface CreateGovernanceElectionInput {
  readonly governance_body_id: number;
  readonly title_am?: string;
  readonly title_en?: string;
  readonly mandate: string;
  readonly nominations_open_at: string;
  readonly nominations_close_at: string;
  readonly voting_open_at: string;
  readonly voting_close_at: string;
}

export async function listGovernanceElections(page = 1): Promise<GovernanceElectionPage> {
  return api.get<GovernanceElectionPage>('/api/governance/elections', { params: { page, per_page: 25 } });
}
export function createGovernanceElection(input: CreateGovernanceElectionInput): Promise<GovernanceElection> {
  return api.post<GovernanceElection>('/api/governance/elections', input);
}
export function transitionGovernanceElection(id: number, transition: 'open_nominations' | 'close_nominations' | 'open_voting' | 'close_voting' | 'certify' | 'cancel'): Promise<GovernanceElection> {
  return api.post<GovernanceElection>(`/api/governance/elections/${id}/transition`, { transition });
}
export async function listElectionNominations(id: number): Promise<readonly GovernanceElectionNomination[]> {
  return api.get<readonly GovernanceElectionNomination[]>(`/api/governance/elections/${id}/nominations`);
}
export function nominateForElection(id: number, governance_membership_id: number, statement?: string): Promise<GovernanceElectionNomination> {
  return api.post<GovernanceElectionNomination>(`/api/governance/elections/${id}/nominations`, { governance_membership_id, ...(statement ? { statement } : {}) });
}
export function reviewElectionNomination(id: number, nominationId: number, status: 'accepted' | 'rejected'): Promise<GovernanceElectionNomination> {
  return api.patch<GovernanceElectionNomination>(`/api/governance/elections/${id}/nominations/${nominationId}`, { status });
}
export function registerElectionVoter(id: number, governance_membership_id: number): Promise<{ registered: boolean }> {
  return api.post<{ registered: boolean }>(`/api/governance/elections/${id}/voters`, { governance_membership_id });
}
export function castElectionBallot(id: number, governance_membership_id: number, nomination_id: number): Promise<{ receipt: string }> {
  return api.post<{ receipt: string }>(`/api/governance/elections/${id}/ballots`, { governance_membership_id, nomination_id });
}
export async function getElectionResults(id: number): Promise<readonly GovernanceElectionResult[]> {
  return api.get<readonly GovernanceElectionResult[]>(`/api/governance/elections/${id}/results`);
}
export async function listElectionAuditEvents(id: number): Promise<readonly GovernanceElectionAuditEvent[]> {
  return api.get<readonly GovernanceElectionAuditEvent[]>(`/api/governance/elections/${id}/audit-events`);
}
