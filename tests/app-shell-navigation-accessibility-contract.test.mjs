import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');
const navigation = read('src/layouts/AppShell/AppHeaderNavigation/AppHeaderNavigation.vue');
const header = read('src/layouts/AppShell/AppHeader/AppHeader.vue');
const shell = read('src/layouts/AppShell/AppShell.vue');
const drawer = read('src/layouts/AppShell/AppMobileDrawer/AppMobileDrawer.vue');
const bell = read('src/layouts/AppShell/NotificationsBell/NotificationsBell.vue');
const notifications = read('src/features/notifications/NotificationsCenter.vue');
const calendar = read('src/layouts/AppShell/CalendarContext/CalendarContext.vue');

test('English global search has explicit labels for every current authenticated navigation destination', () => {
  const mapStart = navigation.indexOf('const ENGLISH_DESTINATION_LABELS');
  const mapEnd = navigation.indexOf('\n};', mapStart);
  assert.notEqual(mapStart, -1);
  assert.notEqual(mapEnd, -1);
  const labels = navigation.slice(mapStart, mapEnd);
  for (const id of [
    'dashboard', 'executive-overview', 'launcher', 'files', 'shareholders',
    'share-classes', 'wallets', 'loans', 'loan-products', 'governance',
    'appointments', 'tasks', 'calendar',
  ]) {
    assert.match(labels, new RegExp(`['"]?${id}['"]?:`), `Missing English label for ${id}`);
  }
});

test('global search shortcut does not intercept editable or composing input', () => {
  assert.match(navigation, /event\.isComposing\s*\|\|\s*isEditableTarget/);
  assert.match(navigation, /target\.isContentEditable/);
  assert.match(navigation, /target\.closest\('\[contenteditable="true"\], input, textarea, select'\)/);
  assert.match(navigation, /!event\.shiftKey/);
});

test('search trigger exposes a stable dialog relationship and restores focus without test selectors', () => {
  assert.match(navigation, /id="app-header-search-trigger"/);
  assert.match(navigation, /:aria-expanded="isSearchOpen"/);
  assert.match(navigation, /aria-controls="app-header-search-dialog"/);
  assert.match(navigation, /<dialog id="app-header-search-dialog"/);
  assert.match(navigation, /querySelector<HTMLButtonElement>\('#app-header-search-trigger'\)/);
  assert.doesNotMatch(navigation, /querySelector<HTMLButtonElement>\('\[data-testid=/);
});

test('mobile menu trigger exposes its controlled native dialog state', () => {
  assert.match(shell, /:mobile-menu-expanded="isMobileDrawerOpen"/);
  assert.match(shell, /mobile-menu-controls="app-mobile-drawer"/);
  assert.match(header, /:aria-expanded="mobileMenuExpanded"/);
  assert.match(header, /:aria-controls="mobileMenuControls"/);
  assert.match(drawer, /<dialog\s+id="app-mobile-drawer"/);
});

test('notification trigger exposes the controlled notification dialog state', () => {
  assert.match(shell, /:expanded="isNotificationsOpen"/);
  assert.match(shell, /controls="notification-center"/);
  assert.match(bell, /:aria-expanded="expanded"/);
  assert.match(bell, /:aria-controls="controls"/);
  assert.match(notifications, /id="notification-center"/);
  assert.match(shell, /querySelector<HTMLButtonElement>\('#notifications-bell-trigger'\)/);
});

test('shell calendar context uses shared E.C.-first formatter and Addis Ababa machine date', () => {
  assert.match(calendar, /formatCalendarDate\(date, \{ dateStyle: 'medium' \}, localeStore\.locale\)/);
  assert.match(calendar, /timeZone: 'Africa\/Addis_Ababa'/);
  assert.match(calendar, /localDateTimeToIso\(dateKey, '00:00', 'Africa\/Addis_Ababa'\)/);
  assert.match(calendar, /formatShellIsoDate\(effectiveDate\.value\)/);
});

test('shell search shortcut hint and trigger contrast use the stronger semantic text token', () => {
  assert.match(navigation, /\.app-header-navigation__search-shortcut\s*\{[^}]*color:\s*var\(--mases-color-text-secondary\)/s);
});
