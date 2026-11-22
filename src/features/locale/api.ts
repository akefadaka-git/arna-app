import { api } from '@/core/api/client';
import { isSupportedLocale } from '@/stores/locale';
import type { SupportedLocale } from '@/stores/locale';

interface LocalePreferenceResponse {
  readonly locale: string;
}

/**
 * Persist the signed-in user's account-level language preference.
 * The server derives the user from Sanctum; no user or tenant identifier
 * is accepted from the client.
 */
export async function saveLocalePreference(locale: SupportedLocale): Promise<void> {
  const result = await api.post<LocalePreferenceResponse>('/api/locale', { locale });
  if (!isSupportedLocale(result.locale) || result.locale !== locale) {
    throw new Error('The locale preference service returned an invalid response.');
  }
}
