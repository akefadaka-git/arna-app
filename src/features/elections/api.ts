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
