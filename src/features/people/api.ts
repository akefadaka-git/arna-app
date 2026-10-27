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

type Envelope<T> = { success: true; data: T; meta?: PeoplePage['meta'] };

export async function listPeople(page = 1, perPage = 25): Promise<PeoplePage> {
  const response = await api.get<Envelope<readonly PersonProfile[]> & { meta: PeoplePage['meta'] }>(
    '/people',
    { params: { page, per_page: perPage } },
  );
  return { data: response.data.data, meta: response.data.meta };
}

export async function getPerson(publicId: string): Promise<PersonProfile> {
  const response = await api.get<Envelope<PersonProfile>>(`/people/${encodeURIComponent(publicId)}`);
  return response.data.data;
}

export async function createPerson(payload: PersonNamePayload): Promise<PersonProfile> {
  const response = await api.post<Envelope<PersonProfile>>('/people', payload);
  return response.data.data;
}

export async function updatePerson(
  publicId: string,
  payload: PersonNamePayload & { reason: string },
): Promise<PersonProfile> {
  const response = await api.put<Envelope<PersonProfile>>(
    `/people/${encodeURIComponent(publicId)}`,
    payload,
  );
  return response.data.data;
}
