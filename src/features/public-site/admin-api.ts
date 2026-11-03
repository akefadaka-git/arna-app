import { api } from '@/core/api/client';
import type { CorporateLocale } from './api';

export type CorporatePageStatus = 'draft' | 'approved' | 'scheduled' | 'published' | 'unpublished';

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
}

export interface CorporateEntryRecord {
  readonly id: number;
  readonly public_id: string;
  readonly entry_type: string;
  readonly status: string;
  readonly version: number;
  readonly translations: Partial<Record<CorporateLocale, { title?: string; body?: string }>>;
  readonly created_at: string;
  readonly moderation_note: string | null;
  readonly payload?: { readonly scan_status?: string };
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

export function listCorporatePages(): Promise<{ data: CorporatePageRecord[]; current_page: number; last_page: number; total: number }> {
  return api.get('/api/admin/corporate-site/pages');
}
export function createCorporatePage(draft: CorporatePageDraft): Promise<CorporatePageRecord> {
  return api.post('/api/admin/corporate-site/pages', draft);
}
export function updateCorporatePage(page: CorporatePageRecord, draft: Partial<CorporatePageDraft>): Promise<CorporatePageRecord> {
  return api.put(`/api/admin/corporate-site/pages/${page.id}`, { ...draft, expected_version: page.version });
}
export function reviewCorporatePage(page: CorporatePageRecord, decision: 'approve' | 'publish' | 'schedule' | 'unpublish', scheduledAt?: string): Promise<CorporatePageRecord> {
  return api.post(`/api/admin/corporate-site/pages/${page.id}/${decision}`, {
    expected_version: page.version,
    ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
  });
}
export async function createCorporateEntry(draft: { entry_type: string; slug_am?: string; slug_en?: string; translations: Record<string, { title: string; body?: string }>; seo?: Record<string, Record<string, string>> }): Promise<CorporateEntryRecord> {
  return api.post(`${base}/entries`, draft);
}
export async function listCorporateEntries(): Promise<CorporateEntryRecord[]> {
  const result = await api.get<{ data: CorporateEntryRecord[] }>(`${base}/entries`);
  return result.data;
}
export function scanCorporateMedia(entry: CorporateEntryRecord): Promise<{ public_id: string; scan_status: string; version: number }> {
  return api.post(`${base}/entries/${entry.id}/scan`, {});
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
  return api.post('/api/public/site/media', form);
}
