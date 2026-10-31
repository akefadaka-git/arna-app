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


export type OrganizationAssignmentStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';
export type OrganizationAssignmentType = 'primary' | 'acting' | 'delegated' | 'support';

export interface OrganizationAssignment {
  readonly id: number;
  readonly tenant_id: number;
  readonly organization_unit_id: number;
  readonly person_id: number;
  readonly assignment_type: OrganizationAssignmentType;
  readonly title_am: string | null;
  readonly title_en: string | null;
  readonly starts_on: string;
  readonly ends_on: string | null;
  readonly status: OrganizationAssignmentStatus;
  readonly lifecycle_reason: string | null;
  readonly person?: {
    readonly id: number;
    readonly public_id?: string;
    readonly first_name_am?: string | null;
    readonly father_name_am?: string | null;
    readonly grandfather_name_am?: string | null;
    readonly first_name_en?: string | null;
    readonly father_name_en?: string | null;
    readonly grandfather_name_en?: string | null;
  };
}

export interface OrganizationAssignmentPage {
  readonly data: readonly OrganizationAssignment[];
  readonly current_page: number;
  readonly last_page: number;
  readonly per_page: number;
  readonly total: number;
}

export interface OrganizationAssignmentQuery {
  readonly page?: number;
  readonly per_page?: number;
  readonly status?: OrganizationAssignmentStatus;
  readonly person_id?: number;
  readonly effective_on?: string;
}

export interface CreateOrganizationAssignmentInput {
  readonly person_id: number;
  readonly assignment_type: OrganizationAssignmentType;
  readonly title_am?: string;
  readonly title_en?: string;
  readonly starts_on: string;
  readonly ends_on?: string | null;
  readonly reason: string;
}

export interface UpdateOrganizationAssignmentInput {
  readonly ends_on?: string | null;
  readonly status?: OrganizationAssignmentStatus;
  readonly reason?: string;
}

export interface OrganizationAuditEvent {
  readonly id: number;
  readonly subject_type: string;
  readonly subject_id: number;
  readonly action: string;
  readonly reason: string | null;
  readonly before_state?: Record<string, unknown> | null;
  readonly after_state?: Record<string, unknown> | null;
  readonly created_at: string;
  readonly actor_user_id?: number | null;
}

export interface OrganizationAuditEventPage {
  readonly data: readonly OrganizationAuditEvent[];
  readonly current_page: number;
  readonly last_page: number;
  readonly per_page: number;
  readonly total: number;
}

export async function listOrganizationAssignments(
  unitId: number,
  query: OrganizationAssignmentQuery = {},
): Promise<OrganizationAssignmentPage> {
  return api.get<OrganizationAssignmentPage>(`/api/organization/units/${unitId}/assignments`, { params: query });
}

export function createOrganizationAssignment(
  unitId: number,
  input: CreateOrganizationAssignmentInput,
): Promise<OrganizationAssignment> {
  return api.post<OrganizationAssignment>(`/api/organization/units/${unitId}/assignments`, input);
}

export function updateOrganizationAssignment(
  id: number,
  input: UpdateOrganizationAssignmentInput,
): Promise<OrganizationAssignment> {
  return api.patch<OrganizationAssignment>(`/api/organization/assignments/${id}`, input);
}

export async function listOrganizationAuditEvents(
  query: { readonly page?: number; readonly per_page?: number; readonly subject_type?: 'unit' | 'assignment'; readonly subject_id?: number; readonly action?: string; readonly from?: string; readonly to?: string } = {},
): Promise<OrganizationAuditEventPage> {
  return api.get<OrganizationAuditEventPage>('/api/organization/audit-events', { params: query });
}
