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

interface ApiEnvelope<T> {
  readonly success: boolean;
  readonly data: T;
}

export async function fetchCorporateHome(locale: CorporateLocale = 'am'): Promise<CorporateSitePage | null> {
  const response = await api.get<ApiEnvelope<CorporateSitePage | null>>('/api/public/site/home', {
    params: { locale },
  });
  return response;
}

export async function fetchCorporatePage(locale: CorporateLocale, slug: string): Promise<CorporateSitePage> {
  const response = await api.get<ApiEnvelope<CorporateSitePage>>(
    `/api/public/site/pages/${locale}/${encodeURIComponent(slug)}`,
  );
  return response;
}
