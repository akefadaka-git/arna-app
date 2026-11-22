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
