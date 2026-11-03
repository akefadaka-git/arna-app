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
