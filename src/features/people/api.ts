import { api } from '@/core/api/client';

export interface PersonProfile {
  readonly public_id: string;
  readonly first_name_am: string | null;
  readonly father_name_am: string | null;
  readonly grandfather_name_am: string | null;
  readonly first_name_en: string | null;
  readonly father_name_en: string | null;
  readonly grandfather_name_en: string | null;
  readonly status: 'active' | 'inactive' | string;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface PeoplePage {
  readonly data: readonly PersonProfile[];
  readonly meta: {
    readonly current_page: number;
    readonly per_page: number;
    readonly total: number;
    readonly last_page: number;
  };
}

export type PersonNamePayload = {
  first_name_am: string | null;
  father_name_am: string | null;
  grandfather_name_am: string | null;
  first_name_en: string | null;
  father_name_en: string | null;
  grandfather_name_en: string | null;
};

type PeoplePageMeta = PeoplePage['meta'];

function isPeoplePageMeta(value: unknown): value is PeoplePageMeta {
  if (typeof value !== 'object' || value === null) return false;
  const meta = value as Record<string, unknown>;
  return ['current_page', 'per_page', 'total', 'last_page'].every(
    (key) => typeof meta[key] === 'number' && Number.isFinite(meta[key]),
  );
}

export async function listPeople(page = 1, perPage = 25): Promise<PeoplePage> {
  const response = await api.getWithMeta<readonly PersonProfile[]>(
    '/people',
    { params: { page, per_page: perPage } },
  );
  if (!isPeoplePageMeta(response.meta)) {
    throw new Error('The People API returned an invalid pagination contract.');
  }
  return { data: response.data, meta: response.meta };
}

export function getPerson(publicId: string): Promise<PersonProfile> {
  return api.get<PersonProfile>(`/people/${encodeURIComponent(publicId)}`);
}

export function createPerson(payload: PersonNamePayload): Promise<PersonProfile> {
  return api.post<PersonProfile>('/people', payload);
}

export function updatePerson(
  publicId: string,
  payload: PersonNamePayload & { reason: string },
): Promise<PersonProfile> {
  return api.put<PersonProfile>(
    `/people/${encodeURIComponent(publicId)}`,
    payload,
  );
}

export interface PersonRelationshipSummary {
  readonly account_linked: boolean;
  readonly employment_count: number;
  readonly shareholding_count: number;
  readonly governance_membership_count: number;
  readonly document_linking_supported: boolean;
  readonly document_count: number | null;
}

export function getPersonRelationships(publicId: string): Promise<PersonRelationshipSummary> {
  return api.get<PersonRelationshipSummary>(
    `/people/${encodeURIComponent(publicId)}/relationships`,
  );
}

export interface PersonDocument {
  readonly file_id: number;
  readonly display_name_am: string | null;
  readonly display_name_en: string | null;
  readonly original_name: string;
  readonly mime_type: string | null;
  readonly size: number;
  readonly version: number;
  readonly status: string;
  readonly linked_at: string;
}

export function listPersonDocuments(publicId: string): Promise<readonly PersonDocument[]> {
  return api.get<readonly PersonDocument[]>(
    `/people/${encodeURIComponent(publicId)}/documents`,
  );
}

export function linkPersonDocument(
  publicId: string,
  payload: { file_id: number; reason: string },
): Promise<{ linked: boolean }> {
  return api.post<{ linked: boolean }>(
    `/people/${encodeURIComponent(publicId)}/documents`,
    payload,
  );
}

export function unlinkPersonDocument(
  publicId: string,
  fileId: number,
  reason: string,
): Promise<{ linked: boolean }> {
  return api.delete<{ linked: boolean }>(
    `/people/${encodeURIComponent(publicId)}/documents/${fileId}`,
    { data: { reason } },
  );
}
