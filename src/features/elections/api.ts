import { api } from '@/core/api/client';

export type ElectionStatus = 'planned' | 'nominating' | 'voting' | 'counting' | 'certified' | 'cancelled';
export type ElectionVotingMethod = 'physical';

export interface GovernanceElection {
  readonly id: number;
  readonly tenant_id: number;
  readonly governance_body_id: number | null;
  readonly code: string;
  readonly title: string;
  readonly status: ElectionStatus;
  readonly record_date: string | null;
  readonly authority_reference: string | null;
  readonly authority_verified_at: string | null;
  readonly voting_rule_version: string | null;
  readonly voting_method: ElectionVotingMethod;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface PaginatedGovernanceElections {
  readonly items: readonly GovernanceElection[];
  readonly meta: {
    readonly current_page: number;
    readonly per_page: number;
    readonly total: number;
    readonly last_page: number;
  };
}

export interface CreateGovernanceElectionInput {
  readonly code: string;
  readonly title: string;
  readonly governance_body_id?: number | null;
  readonly record_date?: string | null;
}

/** GET /api/governance/elections — RBAC + tenant-scoped collection. */
export async function listGovernanceElections(perPage = 15): Promise<PaginatedGovernanceElections> {
  const response = await api.getWithMeta<readonly GovernanceElection[]>(
    '/api/governance/elections',
    { params: { per_page: perPage } },
  );
  return {
    items: response.data,
    meta: response.meta as PaginatedGovernanceElections['meta'],
  };
}

/** GET /api/governance/elections/{id} — policy checks tenant ownership. */
export function getGovernanceElection(id: number): Promise<GovernanceElection> {
  return api.get<GovernanceElection>(`/api/governance/elections/${id}`);
}

/** POST /api/governance/elections — requires governance.election.manage. */
export function createGovernanceElection(input: CreateGovernanceElectionInput): Promise<GovernanceElection> {
  return api.post<GovernanceElection>('/api/governance/elections', input);
}


export interface ElectionNominationSubmissionInput {
  readonly candidate_person_id: number;
  readonly self_nomination?: boolean;
  readonly statement?: string;
}
export interface ElectionCandidate {
  readonly id: number;
  readonly candidate_person_id: number | null;
  readonly candidate_name_snapshot: string | null;
  readonly nomination_statement: string | null;
  readonly committee_status: string;
}
export interface ElectionCommitteeQueue {
  readonly submissions: readonly Record<string, unknown>[];
  readonly candidates: readonly ElectionCandidate[];
}
export interface CandidateReviewFeedbackInput {
  readonly rating: number;
  readonly comment?: string;
}
export interface CommitteeDecisionInput {
  readonly decision: 'approved' | 'rejected' | 'returned';
  readonly reason: string;
  readonly meeting_reference?: string;
  readonly evidence_reference?: string;
  readonly final_ballot_approved?: boolean;
}
export function submitElectionNomination(electionId: number, input: ElectionNominationSubmissionInput): Promise<{ submitted: boolean }> {
  return api.post(`/api/governance/elections/${electionId}/nominations`, input);
}
export function getElectionCandidateReview(electionId: number): Promise<readonly ElectionCandidate[]> {
  return api.get<readonly ElectionCandidate[]>(`/api/governance/elections/${electionId}/candidate-review`);
}
export function submitCandidateFeedback(electionId: number, nominationId: number, input: CandidateReviewFeedbackInput): Promise<{ saved: boolean; binding: false }> {
  return api.post(`/api/governance/elections/${electionId}/candidates/${nominationId}/feedback`, input);
}
export function saveCandidatePreference(electionId: number, nominationId: number): Promise<{ saved: boolean; binding: false }> {
  return api.post(`/api/governance/elections/${electionId}/candidates/${nominationId}/preference`);
}
export function getElectionCommitteeQueue(electionId: number): Promise<ElectionCommitteeQueue> {
  return api.get<ElectionCommitteeQueue>(`/api/governance/elections/${electionId}/committee/queue`);
}
export function decideElectionNomination(electionId: number, nominationId: number, input: CommitteeDecisionInput): Promise<ElectionCandidate> {
  return api.post(`/api/governance/elections/${electionId}/committee/candidates/${nominationId}/decision`, input);
}
