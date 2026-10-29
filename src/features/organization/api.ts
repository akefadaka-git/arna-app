import { api } from '@/core/api/client';

export type OrganizationUnitType =
  | 'company'
  | 'division'
  | 'branch'
  | 'department'
  | 'team';

export type OrganizationUnitStatus = 'active' | 'inactive';

export interface OrganizationUnit {
  readonly id: number;
  readonly tenant_id: number;
  readonly parent_id: number | null;
  readonly legal_entity_id: number | null;
  readonly code: string;
  readonly unit_type: OrganizationUnitType;
  readonly name_am: string | null;
  readonly name_en: string | null;
  readonly status: OrganizationUnitStatus;
  readonly lifecycle_reason: string | null;
  readonly parent?: Pick<OrganizationUnit, 'id' | 'code' | 'name_am' | 'name_en'> | null;
  readonly children?: readonly Pick<OrganizationUnit, 'id' | 'code' | 'name_am' | 'name_en' | 'status'>[];
  readonly created_at: string;
  readonly updated_at: string;
}

export interface OrganizationUnitPage {
  readonly data: readonly OrganizationUnit[];
  readonly current_page: number;
  readonly last_page: number;
  readonly per_page: number;
  readonly total: number;
}

export interface ListOrganizationUnitsQuery {
  readonly page?: number;
  readonly per_page?: number;
  readonly parent_id?: number;
  readonly status?: OrganizationUnitStatus;
}

export async function listOrganizationUnits(
  query: ListOrganizationUnitsQuery = {},
): Promise<OrganizationUnitPage> {
  return api.get<OrganizationUnitPage>('/api/organization/units', { params: query });
}

export async function getOrganizationUnit(id: number): Promise<OrganizationUnit> {
  return api.get<OrganizationUnit>(`/api/organization/units/${id}`);
}
