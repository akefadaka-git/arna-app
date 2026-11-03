import { api } from '@/core/api/client';

export type CorporateLocale = 'am' | 'en';

export interface CorporateSiteSection {
  readonly id?: string;
  readonly type: string;
  readonly content: Readonly<Record<string, unknown>>;
}

export interface CorporateSitePage {
  readonly public_id: string;
  readonly page_key: string;
  readonly locale: CorporateLocale;
  readonly slug: string | null;
  readonly alternate_slug: string | null;
  readonly title: string;
  readonly summary: string;
  readonly sections: readonly CorporateSiteSection[];
  readonly seo: {
    readonly title?: string;
    readonly description?: string;
    readonly canonical_url?: string;
    readonly robots?: string;
    readonly og_image?: string;
  } | null;
  readonly published_at: string | null;
}

export async function fetchCorporateHome(locale: CorporateLocale = 'am'): Promise<CorporateSitePage | null> {
  return api.get<CorporateSitePage | null>('/api/public/site/home', {
    params: { locale },
  });
}

export async function fetchCorporatePage(locale: CorporateLocale, slug: string): Promise<CorporateSitePage> {
  return api.get<CorporateSitePage>(
    `/api/public/site/pages/${locale}/${encodeURIComponent(slug)}`,
  );
}

export interface CorporatePublicEntry {
  readonly public_id: string;
  readonly type: string;
  readonly slug: string | null;
  readonly alternate_slug: string | null;
  readonly title: string;
  readonly summary: string;
  readonly body: string;
  readonly asset_url: string | null;
  readonly seo?: { readonly title?: string; readonly description?: string; readonly canonical_url?: string; readonly robots?: string; readonly og_image?: string } | null;
  readonly published_at: string | null;
}

export async function fetchCorporateEntries(type: string, locale: CorporateLocale = 'am'): Promise<CorporatePublicEntry[]> {
  const result = await api.get<{ items: CorporatePublicEntry[] }>(`/api/public/site/content/${encodeURIComponent(type)}`, {
    params: { locale, per_page: 12 },
  });
  return result.items;
}

export interface CorporateInquiryDraft {
  readonly inquiry_type: 'general' | 'investor' | 'partnership' | 'media' | 'career' | 'advertising' | 'marketplace';
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly subject: string;
  readonly message: string;
  readonly consent: boolean;
  readonly website?: string;
}

export async function submitCorporateInquiry(draft: CorporateInquiryDraft): Promise<{ reference: string; status: string }> {
  return api.post('/api/public/site/inquiries', draft);
}

export async function submitCorporateOpportunity(type: 'career' | 'opportunity' | 'advertisement' | 'marketplace' | 'business' | 'service', draft: {
  name: string; email: string; phone?: string; title: string; description: string; organization?: string; locale: CorporateLocale;
}): Promise<{ reference: string; status: string }> {
  return api.post(`/api/public/site/submissions/${type}`, draft);
}

export async function fetchCorporateEntry(type: string, locale: CorporateLocale, slug: string): Promise<CorporatePublicEntry> {
  return api.get<CorporatePublicEntry>(
    `/api/public/site/content/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`,
    { params: { locale } },
  );
}

export async function fetchCorporatePages(locale: CorporateLocale = 'am'): Promise<CorporateSitePage[]> {
  return api.get<CorporateSitePage[]>('/api/public/site/pages', { params: { locale } });
}
