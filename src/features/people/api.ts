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

export async function listPeople(page = 1, perPage = 25, search = ''): Promise<PeoplePage> {
  const query = search.trim();
  const response = await api.getWithMeta<readonly PersonProfile[]>(
    '/people',
    { params: { page, per_page: perPage, ...(query ? { search: query } : {}) } },
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


export type PersonRelationshipDomain = 'employees' | 'shareholders' | 'governance-memberships';

export interface PersonRelationshipOption {
  readonly id: number;
  readonly label: string;
  readonly detail: string;
  readonly status: string;
}

export interface PersonRelationshipOptions {
  readonly domain: PersonRelationshipDomain;
  readonly linked: readonly PersonRelationshipOption[];
  readonly candidates: readonly PersonRelationshipOption[];
  readonly candidate_limit: number;
}

export function getPersonRelationshipOptions(
  publicId: string,
  domain: PersonRelationshipDomain,
  search = '',
): Promise<PersonRelationshipOptions> {
  return api.get<PersonRelationshipOptions>(
    `/people/${encodeURIComponent(publicId)}/relationships/${domain}/options`,
    { params: search.trim() ? { search: search.trim() } : {} },
  );
}

export function linkPersonRelationship(
  publicId: string,
  domain: PersonRelationshipDomain,
  recordId: number,
  reason: string,
): Promise<{ linked: boolean }> {
  return api.post<{ linked: boolean }>(
    `/people/${encodeURIComponent(publicId)}/relationships/${domain}/${recordId}`,
    { reason },
  );
}

export function unlinkPersonRelationship(
  publicId: string,
  domain: PersonRelationshipDomain,
  recordId: number,
  reason: string,
): Promise<{ linked: boolean }> {
  return api.post<{ linked: boolean }>(
    `/people/${encodeURIComponent(publicId)}/relationships/${domain}/${recordId}/unlink`,
    { reason },
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
  return api.post<{ linked: boolean }>(
    `/people/${encodeURIComponent(publicId)}/documents/${fileId}/unlink`,
    { reason },
  );
}

export interface PersonContactPoint {
  readonly id: number;
  readonly contact_type: 'email' | 'phone' | 'other';
  readonly label: string | null;
  readonly masked_value: string;
  readonly is_primary: boolean;
  readonly is_verified: boolean;
  readonly verified_at: string | null;
  readonly status: 'active' | 'inactive' | string;
  readonly created_at: string | null;
}

export type NewPersonContactPoint = {
  readonly contact_type: 'email' | 'phone' | 'other';
  readonly label?: string | null;
  readonly contact_value: string;
  readonly is_primary?: boolean;
};

export function listPersonContacts(publicId: string): Promise<readonly PersonContactPoint[]> {
  return api.get<readonly PersonContactPoint[]>(`/people/${encodeURIComponent(publicId)}/contacts`);
}

export function createPersonContact(
  publicId: string,
  payload: NewPersonContactPoint,
): Promise<PersonContactPoint> {
  return api.post<PersonContactPoint>(`/people/${encodeURIComponent(publicId)}/contacts`, payload);
}

export function deactivatePersonContact(
  publicId: string,
  contactId: number,
  reason: string,
): Promise<PersonContactPoint> {
  return api.post<PersonContactPoint>(
    `/people/${encodeURIComponent(publicId)}/contacts/${contactId}/deactivate`,
    { reason },
  );
}

export type PersonRelationshipType =
  | 'parent' | 'child' | 'guardian' | 'dependent' | 'spouse'
  | 'sibling' | 'emergency_contact' | 'household_member' | 'other';

export interface PersonToPersonRelationship {
  readonly id: number;
  readonly related_public_id: string | null;
  readonly related_name_am: string | null;
  readonly related_name_en: string | null;
  readonly relationship_type: PersonRelationshipType;
  readonly effective_from: string | null;
  readonly effective_to: string | null;
  readonly status: 'active' | 'inactive' | string;
}

export interface NewPersonToPersonRelationship {
  readonly related_public_id: string;
  readonly relationship_type: PersonRelationshipType;
  readonly effective_from?: string | null;
  readonly effective_to?: string | null;
  readonly reason: string;
}

export function listPersonToPersonRelationships(
  publicId: string,
): Promise<readonly PersonToPersonRelationship[]> {
  return api.get<readonly PersonToPersonRelationship[]>(
    `/people/${encodeURIComponent(publicId)}/person-relationships`,
  );
}

export function createPersonToPersonRelationship(
  publicId: string,
  payload: NewPersonToPersonRelationship,
): Promise<PersonToPersonRelationship> {
  return api.post<PersonToPersonRelationship>(
    `/people/${encodeURIComponent(publicId)}/person-relationships`,
    payload,
  );
}

export function deactivatePersonToPersonRelationship(
  publicId: string,
  relationshipId: number,
  reason: string,
): Promise<PersonToPersonRelationship> {
  return api.post<PersonToPersonRelationship>(
    `/people/${encodeURIComponent(publicId)}/person-relationships/${relationshipId}/deactivate`,
    { reason },
  );
}

export type PersonParticipationType =
  | 'membership' | 'ministry' | 'volunteer' | 'committee'
  | 'event_attendance' | 'training' | 'qualification' | 'other';

export interface PersonParticipation {
  readonly id: number;
  readonly participation_type: PersonParticipationType;
  readonly title: string;
  readonly reference_code: string | null;
  readonly effective_from: string | null;
  readonly effective_to: string | null;
  readonly status: 'active' | 'inactive' | string;
}

export interface NewPersonParticipation {
  readonly participation_type: PersonParticipationType;
  readonly title: string;
  readonly reference_code?: string | null;
  readonly effective_from?: string | null;
  readonly effective_to?: string | null;
  readonly reason: string;
}

export function listPersonParticipations(publicId: string): Promise<readonly PersonParticipation[]> {
  return api.get<readonly PersonParticipation[]>(
    `/people/${encodeURIComponent(publicId)}/participations`,
  );
}

export function createPersonParticipation(
  publicId: string,
  payload: NewPersonParticipation,
): Promise<PersonParticipation> {
  return api.post<PersonParticipation>(
    `/people/${encodeURIComponent(publicId)}/participations`,
    payload,
  );
}

export function deactivatePersonParticipation(
  publicId: string,
  participationId: number,
  reason: string,
): Promise<PersonParticipation> {
  return api.post<PersonParticipation>(
    `/people/${encodeURIComponent(publicId)}/participations/${participationId}/deactivate`,
    { reason },
  );
}
