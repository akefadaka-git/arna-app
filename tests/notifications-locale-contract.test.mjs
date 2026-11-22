import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [center, notificationApi, localeApi, shell] = await Promise.all([
  readFile(new URL('../src/features/notifications/NotificationsCenter.vue', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/notifications/api.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/locale/api.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/layouts/AppShell/AppShell.vue', import.meta.url), 'utf8'),
]);

test('notification navigation is restricted to known internal routes and validated identifiers', () => {
  assert.match(center, /NOTIFICATION_DETAIL_ROUTES/);
  assert.match(center, /NOTIFICATION_LIST_ROUTES/);
  assert.match(center, /router\.hasRoute\(action\.route_name\)/);
  assert.match(center, /\^\[A-Za-z0-9_\-\]\{1,128\}\$/);
  assert.doesNotMatch(center, /window\.location\.(assign|href)\s*=\s*item\.action/);
});

test('notification loads are discarded when tenant context changes', () => {
  assert.match(center, /const tenantId = tenantStore\.effectiveTenantId/);
  assert.match(center, /tenantId !== tenantStore\.effectiveTenantId/);
});

test('notification API uses the selected supported locale explicitly', () => {
  assert.match(notificationApi, /locale: SupportedLocale/);
  assert.match(notificationApi, /present\(item, locale\)/);
});

test('account locale preference is persisted through authenticated API without user or tenant IDs', () => {
  assert.match(localeApi, /api\.post<LocalePreferenceResponse>\('\/api\/locale', \{ locale \}\)/);
  assert.doesNotMatch(localeApi, /user_id|tenant_id|tenantId/);
  assert.match(localeApi, /isSupportedLocale\(result\.locale\)/);
});

test('shell changes locale only after account preference persistence succeeds', () => {
  assert.match(shell, /await saveLocalePreference\(payload\.code\);\s*localeStore\.setLocale\(payload\.code\);/);
  assert.match(shell, /localeSaveFailed\.value = true/);
});
