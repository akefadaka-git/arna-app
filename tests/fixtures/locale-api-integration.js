import { api, setAuthHeaderProvider } from '../../src/core/api/client';
import { saveLocalePreference } from '../../src/features/locale/api';

const token = window.__ARNA_TEST_TOKEN__;
const output = document.querySelector('[data-testid="locale-integration-result"]');

async function runLocaleIntegration() {
  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('The integration bearer token was not provided.');
  }

  setAuthHeaderProvider(() => token);
  document.documentElement.lang = 'en';

  await saveLocalePreference('en');
  const user = await api.get('/api/user');

  if (user.locale !== 'en') {
    throw new Error(`Expected persisted locale "en", received "${String(user.locale)}".`);
  }

  window.__ARNA_LOCALE_INTEGRATION__ = { ok: true, locale: user.locale };
  if (output) output.textContent = 'PASS — English preference persisted by the API';
}

runLocaleIntegration().catch((error) => {
  window.__ARNA_LOCALE_INTEGRATION__ = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
  };
  if (output) output.textContent = 'FAIL — locale API integration';
});
