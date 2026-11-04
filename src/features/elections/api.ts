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
  readonly members: readonly ElectionCommitteeMember[];
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
export function decideElectionNominationSubmission(electionId: number, submissionId: number, input: Omit<CommitteeDecisionInput, 'final_ballot_approved'>): Promise<{ submission_id: number; decision: string }> {
  return api.post(`/api/governance/elections/${electionId}/committee/submissions/${submissionId}/decision`, input);
}
export function decideElectionNomination(electionId: number, nominationId: number, input: CommitteeDecisionInput): Promise<ElectionCandidate> {
  return api.post(`/api/governance/elections/${electionId}/committee/candidates/${nominationId}/decision`, input);
}

export interface AppointElectionCommitteeMemberInput {
  readonly person_id: number;
  readonly user_id: number;
  readonly member_role: 'committee_member' | 'legal_advisor' | 'supervisory_member';
  readonly ex_officio?: boolean;
  readonly appointment_reference: string;
}
export interface ElectionCommitteeMember {
  readonly id: number;
  readonly person_id: number;
  readonly user_id: number;
  readonly member_role: AppointElectionCommitteeMemberInput['member_role'];
  readonly status: string;
  readonly recused_at: string | null;
  readonly recusal_scope: string | null;
  readonly appointment_reference: string;
}
export function appointElectionCommitteeMember(electionId: number, input: AppointElectionCommitteeMemberInput): Promise<ElectionCommitteeMember> {
  return api.post(`/api/governance/elections/${electionId}/committee/members`, input);
}
export function recuseElectionCommitteeMember(electionId: number, memberId: number, recusalScope: string): Promise<{ recused: boolean }> {
  return api.post(`/api/governance/elections/${electionId}/committee/members/${memberId}/recusal`, { recusal_scope: recusalScope });
}

export interface ElectionAuthorityVerificationInput { readonly authority_reference: string }
export interface ElectionScheduleInput { readonly rule_version?: string; readonly opens_at: string; readonly closes_at: string }
export interface ElectionObjectionInput {
  readonly nomination_id?: number;
  readonly category: 'eligibility' | 'nomination' | 'procedure' | 'ballot' | 'counting' | 'other';
  readonly grounds: string;
  readonly evidence_reference?: string;
}
export interface ElectionAppealInput { readonly grounds: string; readonly evidence_reference?: string }
export interface ElectionCertificationInput {
  readonly tally_id: number;
  readonly certifying_authority: string;
  readonly certification_reference: string;
  readonly evidence_sha256: string;
}
export function verifyElectionAuthority(electionId: number, input: ElectionAuthorityVerificationInput): Promise<GovernanceElection> {
  return api.post(`/api/governance/elections/${electionId}/authority/verify`, input);
}
export function openElectionNominations(electionId: number, input: Required<ElectionScheduleInput>): Promise<GovernanceElection> {
  return api.post(`/api/governance/elections/${electionId}/nominations/open`, input);
}
export function openPhysicalElectionVoting(electionId: number, input: Omit<ElectionScheduleInput, 'rule_version'>): Promise<GovernanceElection> {
  return api.post(`/api/governance/elections/${electionId}/voting/open-physical`, input);
}
export function closeElectionVoting(electionId: number): Promise<GovernanceElection> {
  return api.post(`/api/governance/elections/${electionId}/voting/close`);
}
export function submitElectionObjection(electionId: number, input: ElectionObjectionInput): Promise<{ objection_id: number; status: string }> {
  return api.post(`/api/governance/elections/${electionId}/objections`, input);
}
export function submitElectionAppeal(electionId: number, objectionId: number, input: ElectionAppealInput): Promise<{ appeal_id: number; status: string }> {
  return api.post(`/api/governance/elections/${electionId}/objections/${objectionId}/appeals`, input);
}
export function certifyGovernanceElection(electionId: number, input: ElectionCertificationInput): Promise<{ certification_id: number; status: string }> {
  return api.post(`/api/governance/elections/${electionId}/certification`, input);
}
export function ratifyGovernanceElection(electionId: number, ratification_reference: string): Promise<{ status: string; ratified_at: string }> {
  return api.post(`/api/governance/elections/${electionId}/ratification`, { ratification_reference });
}
