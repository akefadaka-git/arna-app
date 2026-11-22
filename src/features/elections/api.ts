import { api } from '@/core/api/client';

export interface GovernanceElection {
  readonly id: number;
  readonly tenant_id: number;
  readonly governance_body_id: number | null;
  readonly code: string;
  readonly title_am: string | null;
  readonly title_en: string | null;
  readonly election_scope: string;
  readonly election_type: string;
  readonly status: string;
  readonly authority_reference: string | null;
  readonly authority_verified_at: string | null;
  readonly record_date: string | null;
  readonly version: number;
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

interface LaravelPaginator<T> {
  readonly data: readonly T[];
  readonly current_page: number;
  readonly per_page: number;
  readonly total: number;
  readonly last_page: number;
}

/** GET /api/governance/elections — tenant-scoped Laravel paginator. */
export async function listGovernanceElections(perPage = 25): Promise<PaginatedGovernanceElections> {
  const response = await api.get<LaravelPaginator<GovernanceElection>>(
    '/api/governance/elections',
    { params: { per_page: perPage } },
  );

  return {
    items: response.data,
    meta: {
      current_page: response.current_page,
      per_page: response.per_page,
      total: response.total,
      last_page: response.last_page,
    },
  };
}


export interface ElectionCandidatePerson {
  readonly id: number;
  readonly public_id: string;
  readonly first_name_am: string | null;
  readonly father_name_am: string | null;
  readonly grandfather_name_am: string | null;
  readonly first_name_en: string | null;
  readonly father_name_en: string | null;
  readonly grandfather_name_en: string | null;
}

export interface ElectionCandidateRecord {
  readonly id: number;
  readonly tenant_id: number;
  readonly election_id: number;
  readonly person_id: number;
  readonly status: string;
  readonly consent_status: string;
  readonly consent_method: string | null;
  readonly consented_at: string | null;
  readonly declarations: readonly Record<string, unknown>[] | null;
  readonly version: number;
  readonly person?: ElectionCandidatePerson;
  readonly nominations?: readonly {
    readonly id: number;
    readonly status: string;
    readonly self_nomination: boolean;
    readonly submission_channel: string;
    readonly source_reference: string;
    readonly statement: string | null;
    readonly submitted_at: string;
  }[];
  readonly evidence?: readonly { readonly id: number; readonly evidence_type: string; readonly attached_at: string }[];
  readonly decisions?: readonly { readonly id: number; readonly outcome: string; readonly rationale: string; readonly decided_at: string }[];
}

export interface ElectionCommitteeMemberRecord {
  readonly id: number;
  readonly person_id: number;
  readonly user_id: number;
  readonly member_role: string;
  readonly status: string;
  readonly appointment_reference: string;
}

export interface ElectionAuthorityEvidenceRecord {
  readonly id: number;
  readonly instrument_type: string;
  readonly instrument_reference: string;
  readonly status: string;
}

export interface ElectionRegisterSnapshot {
  readonly id: number;
  readonly record_date: string;
  readonly source_reference: string;
  readonly status: string;
  readonly frozen_at: string | null;
}

export interface ElectionManualCountBatch {
  readonly id: number;
  readonly batch_reference: string;
  readonly polling_station: string | null;
  readonly ballots_received: number;
  readonly ballots_valid: number;
  readonly ballots_rejected: number;
  readonly status: string;
  readonly entered_by: number;
  readonly witnessed_by: number | null;
}

export interface ElectionManualCountEvidence {
  readonly batches: readonly ElectionManualCountBatch[];
  readonly lines: readonly Record<string, unknown>[];
}

export function getGovernanceElection(id: number): Promise<GovernanceElection> {
  return api.get<GovernanceElection>('/api/governance/elections/' + id);
}

export function listElectionCandidates(id: number): Promise<readonly ElectionCandidateRecord[]> {
  return api.get<readonly ElectionCandidateRecord[]>('/api/governance/elections/' + id + '/candidates');
}

export function listElectionCommitteeMembers(id: number): Promise<readonly ElectionCommitteeMemberRecord[]> {
  return api.get<readonly ElectionCommitteeMemberRecord[]>('/api/governance/elections/' + id + '/committee/members');
}

export function listElectionAuthorityEvidence(id: number): Promise<readonly ElectionAuthorityEvidenceRecord[]> {
  return api.get<readonly ElectionAuthorityEvidenceRecord[]>('/api/governance/elections/' + id + '/authority-evidence');
}

export function getElectionRegisterSnapshot(id: number): Promise<ElectionRegisterSnapshot | null> {
  return api.get<ElectionRegisterSnapshot | null>('/api/governance/elections/' + id + '/registers');
}

export function listElectionManualCountEvidence(id: number): Promise<ElectionManualCountEvidence> {
  return api.get<ElectionManualCountEvidence>('/api/governance/elections/' + id + '/count-batches');
}


export interface RecordManualCountBatchInput {
  readonly batch_reference: string;
  readonly polling_station?: string;
  readonly ballots_received: number;
  readonly ballots_valid: number;
  readonly ballots_rejected: number;
  readonly sealed_box_reference: string;
  readonly count_sheet_reference: string;
  readonly lines: readonly { readonly candidate_id: number; readonly ballot_count: number }[];
}

export function recordElectionManualCountBatch(
  id: number,
  input: RecordManualCountBatchInput,
): Promise<ElectionManualCountEvidence> {
  return api.post<ElectionManualCountEvidence>('/api/governance/elections/' + id + '/count-batches', input);
}

export function witnessElectionManualCountBatch(id: number, batchId: number): Promise<ElectionManualCountBatch> {
  return api.post<ElectionManualCountBatch>('/api/governance/elections/' + id + '/count-batches/' + batchId + '/witness');
}
