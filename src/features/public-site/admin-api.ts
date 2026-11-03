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

const base = '/api/admin/corporate-site/pages';

export function listCorporatePages(): Promise<{ data: CorporatePageRecord[]; current_page: number; last_page: number; total: number }> {
  return api.get(base);
}

export function createCorporatePage(draft: CorporatePageDraft): Promise<CorporatePageRecord> {
  return api.post(base, draft);
}

export function updateCorporatePage(page: CorporatePageRecord, draft: Partial<CorporatePageDraft>): Promise<CorporatePageRecord> {
  return api.put(`${base}/${page.id}`, { ...draft, expected_version: page.version });
}

export function reviewCorporatePage(
  page: CorporatePageRecord,
  decision: 'approve' | 'publish' | 'schedule' | 'unpublish',
  scheduledAt?: string,
): Promise<CorporatePageRecord> {
  return api.post(`${base}/${page.id}/${decision}`, {
    expected_version: page.version,
    ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
  });
}
