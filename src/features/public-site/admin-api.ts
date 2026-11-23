import { api } from '@/core/api/client';
import type { CorporateLocale } from './api';

export type CorporatePageStatus = 'draft' | 'approved' | 'scheduled' | 'published' | 'unpublished' | 'archived';
export type CorporateLifecycleAction = 'enable' | 'disable' | 'archive' | 'restore' | 'delete';

export interface CorporatePageTranslation {
  readonly title: string;
  readonly summary?: string;
  readonly body?: string;
}

export interface CorporatePageDraft {
  readonly page_key: string;
  readonly slug_am?: string | null;
  readonly slug_en?: string | null;
  readonly translations: Partial<Record<CorporateLocale, CorporatePageTranslation>>;
  readonly sections?: readonly Record<string, unknown>[];
  readonly seo?: Partial<Record<CorporateLocale, Record<string, string>>>;
}

export interface CorporatePageRecord extends CorporatePageDraft {
  readonly id: number;
  readonly public_id: string;
  readonly status: CorporatePageStatus;
  readonly version: number;
  readonly published_at: string | null;
  readonly scheduled_at: string | null;
  readonly is_enabled: boolean;
  readonly archived_at: string | null;
  readonly deleted_at?: string | null;
}

export interface CorporateEntryRecord {
  readonly id: number;
  readonly public_id: string;
  readonly entry_type: string;
  readonly slug_am: string | null;
  readonly slug_en: string | null;
  readonly status: string;
  readonly version: number;
  readonly is_enabled: boolean;
  readonly archived_at: string | null;
  readonly deleted_at?: string | null;
  readonly translations: Partial<Record<CorporateLocale, { title?: string; summary?: string; body?: string }>>;
  readonly created_at: string;
  readonly moderation_note: string | null;
  readonly payload?: Record<string, unknown> & { readonly scan_status?: string };
  readonly seo?: Record<string, Record<string, string>>;
}

export interface CorporateInquiryRecord {
  readonly id: number;
  readonly public_id: string;
  readonly inquiry_type: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly subject: string;
  readonly message: string;
  readonly status: string;
  readonly version: number;
  readonly created_at: string;
}

const base = '/api/admin/corporate-site';

export function listCorporatePages(includeDeleted = false): Promise<{ data: CorporatePageRecord[]; current_page: number; last_page: number; total: number }> {
  return api.get('/api/admin/corporate-site/pages', { params: includeDeleted ? { include_deleted: 1 } : {} });
}
export function createCorporatePage(draft: CorporatePageDraft): Promise<CorporatePageRecord> {
  return api.post('/api/admin/corporate-site/pages', draft);
}
export function updateCorporatePage(page: CorporatePageRecord, draft: Partial<CorporatePageDraft>): Promise<CorporatePageRecord> {
  return api.put(`/api/admin/corporate-site/pages/${page.id}`, { ...draft, expected_version: page.version });
}
export function updateCorporatePageLifecycle(page: CorporatePageRecord, action: CorporateLifecycleAction): Promise<Pick<CorporatePageRecord, 'id' | 'public_id' | 'status' | 'version' | 'is_enabled' | 'archived_at'>> {
  return api.post(`/api/admin/corporate-site/pages/${page.id}/lifecycle`, {
    expected_version: page.version,
    action,
  });
}
export function reviewCorporatePage(page: CorporatePageRecord, decision: 'approve' | 'publish' | 'schedule' | 'unpublish', scheduledAt?: string): Promise<CorporatePageRecord> {
  return api.post(`/api/admin/corporate-site/pages/${page.id}/${decision}`, {
    expected_version: page.version,
    ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
  });
}
export interface CorporateEntryDraft {
  readonly entry_type?: string;
  readonly slug_am?: string;
  readonly slug_en?: string;
  readonly translations: Record<string, { title: string; summary?: string; body?: string }>;
  readonly payload?: Record<string, unknown>;
  readonly seo?: Record<string, Record<string, string>>;
}

export async function createCorporateEntry(draft: CorporateEntryDraft & { entry_type: string }): Promise<CorporateEntryRecord> {
  return api.post(`${base}/entries`, draft);
}
export function updateCorporateEntry(entry: CorporateEntryRecord, draft: CorporateEntryDraft): Promise<CorporateEntryRecord> {
  return api.put(`${base}/entries/${entry.id}`, { ...draft, expected_version: entry.version });
}
export async function listCorporateEntries(includeDeleted = false): Promise<CorporateEntryRecord[]> {
  const result = await api.get<{ data: CorporateEntryRecord[] }>(`${base}/entries`, { params: includeDeleted ? { include_deleted: 1 } : {} });
  return result.data;
}
export function scanCorporateMedia(entry: CorporateEntryRecord): Promise<{ public_id: string; scan_status: string; version: number }> {
  return api.post(`${base}/entries/${entry.id}/scan`, { expected_version: entry.version });
}
export function updateCorporateEntryLifecycle(entry: CorporateEntryRecord, action: CorporateLifecycleAction): Promise<{ id: number; public_id: string; status: string; version: number; is_enabled: boolean; archived_at: string | null; deleted_at: string | null }> {
  return api.post(`${base}/entries/${entry.id}/lifecycle`, {
    expected_version: entry.version,
    action,
  });
}
export function reviewCorporateEntry(entry: CorporateEntryRecord, decision: 'approve' | 'publish' | 'reject' | 'unpublish', note?: string): Promise<CorporateEntryRecord> {
  return api.post(`${base}/entries/${entry.id}/${decision}`, {
    expected_version: entry.version,
    moderation_note: note,
  });
}
export async function listCorporateInquiries(): Promise<CorporateInquiryRecord[]> {
  const result = await api.get<{ data: CorporateInquiryRecord[] }>(`${base}/inquiries`);
  return result.data;
}
export function updateCorporateInquiry(inquiry: CorporateInquiryRecord, status: string): Promise<CorporateInquiryRecord> {
  return api.put(`${base}/inquiries/${inquiry.id}`, { status, expected_version: inquiry.version });
}

export async function uploadCorporateMedia(title: string, description: string, file: File, locale: CorporateLocale = 'am'): Promise<{ reference: string; status: string; message: string }> {
  const form = new FormData();
  form.append('title', title);
  form.append('description', description);
  form.append('locale', locale);
  form.append('file', file);
  return api.post(`${base}/media`, form);
}
