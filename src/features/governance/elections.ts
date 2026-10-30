import { api } from '@/core/api/client';

export type GovernanceElectionTransition = 'open_nominations' | 'close_nominations' | 'open_voting' | 'close_voting' | 'start_runoff' | 'start_rerun' | 'certify' | 'cancel';

export type GovernanceElectionStatus = 'draft' | 'nominations_open' | 'nominations_closed' | 'voting_open' | 'voting_closed' | 'runoff_required' | 'rerun_required' | 'runoff_selection_blocked' | 'quorum_failed' | 'certified' | 'cancelled';

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
  readonly frozen_eligible_voter_count?: number | null;
  readonly current_round?: number;
  readonly winner_nomination_id?: number | null;
  readonly challenge_bylaw_reference?: string | null;
  readonly challenge_window_ends_at?: string | null;
  readonly challenge_window_evidence_reference?: string | null;
  readonly challenge_window_verified_by?: number | null;
  readonly challenge_window_verified_at?: string | null;
  readonly result_summary_json?: string | Record<string, unknown> | null;
}

export interface GovernanceElectionNomination {
  readonly id: number;
  readonly election_id: number;
  readonly governance_membership_id: number;
  readonly statement: string | null;
  readonly status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  readonly reviewed_at: string | null;
  readonly nomination_source?: 'self' | 'third_party';
  readonly candidate_consent_at?: string | null;
}

export interface GovernanceElectionAuditEvent {
  readonly id: number;
  readonly actor_id: number | null;
  readonly event_type: string;
  readonly metadata: Record<string, unknown> | null;
  readonly occurred_at: string;
}

export interface GovernanceElectionChallenge {
  readonly id: number;
  readonly challenge_type: 'challenge' | 'appeal';
  readonly reason: string;
  readonly evidence_references: string[] | string | null;
  readonly status: 'pending' | 'accepted' | 'rejected';
  readonly decision_note: string | null;
  readonly submitted_at: string;
  readonly decided_at: string | null;
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
export function transitionGovernanceElection(id: number, transition: GovernanceElectionTransition, round_closes_at?: string): Promise<GovernanceElection> {
  return api.post<GovernanceElection>(`/api/governance/elections/${id}/transition`, { transition, ...(round_closes_at ? { round_closes_at } : {}) });
}
export async function listElectionNominations(id: number): Promise<readonly GovernanceElectionNomination[]> {
  return api.get<readonly GovernanceElectionNomination[]>(`/api/governance/elections/${id}/nominations`);
}
export function nominateForElection(id: number, governance_membership_id: number, statement?: string, candidate_consent_confirmed = false): Promise<GovernanceElectionNomination> {
  return api.post<GovernanceElectionNomination>(`/api/governance/elections/${id}/nominations`, { governance_membership_id, ...(statement ? { statement } : {}), candidate_consent_confirmed });
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


export interface GovernanceElectionVoter {
  readonly id: number;
  readonly governance_membership_id: number;
  readonly cast_at: string | null;
  readonly user_id?: number | null;
  readonly member_name_am?: string | null;
  readonly member_name_en?: string | null;
}
export async function listElectionVoters(id: number): Promise<readonly GovernanceElectionVoter[]> {
  return api.get<readonly GovernanceElectionVoter[]>(`/api/governance/elections/${id}/voters`);
}

export async function setElectionChallengeWindow(id: number, bylaw_reference: string, evidence_reference: string, window_ends_at: string): Promise<GovernanceElection> {
  return api.post<GovernanceElection>(`/api/governance/elections/${id}/challenge-window`, { bylaw_reference, evidence_reference, window_ends_at });
}
export async function verifyElectionChallengeWindow(id: number): Promise<GovernanceElection> {
  return api.post<GovernanceElection>(`/api/governance/elections/${id}/challenge-window/verify`);
}
export async function submitElectionChallenge(id: number, challenge_type: 'challenge' | 'appeal', reason: string, evidence_references: string[] = []): Promise<GovernanceElectionChallenge> {
  return api.post<GovernanceElectionChallenge>(`/api/governance/elections/${id}/challenges`, { challenge_type, reason, evidence_references });
}
export async function listElectionChallenges(id: number): Promise<readonly GovernanceElectionChallenge[]> {
  return api.get<readonly GovernanceElectionChallenge[]>(`/api/governance/elections/${id}/challenges`);
}
export async function resolveElectionChallenge(id: number, challengeId: number, status: 'accepted' | 'rejected', decision_note: string): Promise<GovernanceElectionChallenge> {
  return api.patch<GovernanceElectionChallenge>(`/api/governance/elections/${id}/challenges/${challengeId}`, { status, decision_note });
}
