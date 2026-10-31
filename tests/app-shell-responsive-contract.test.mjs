import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const shell = readFileSync('src/layouts/AppShell/AppShell.vue', 'utf8');

test('App Shell keeps the content region shrink-safe at every breakpoint', () => {
  assert.match(shell, /\.app-shell__body\s*\{[^}]*min-height:\s*0/s);
  assert.match(shell, /\.app-shell__main\s*\{[^}]*min-width:\s*0/s);
  assert.match(shell, /\.app-shell__content\s*\{[^}]*width:\s*100%/s);
});

test('tablet navigation column uses a fluid width without hiding bilingual labels', () => {
  assert.match(shell, /@media\s*\(min-width:\s*640px\)\s*and\s*\(max-width:\s*1023px\)/);
  assert.match(shell, /width:\s*clamp\(13rem,\s*25vw,\s*15rem\)/);
  assert.match(shell, /\.app-shell__aside-nav\s+:deep\(\.app-sidebar\)\s*\{\s*width:\s*100%/);
  assert.doesNotMatch(shell, /app-sidebar__label\s*\{[^}]*display:\s*none/s);
});

test('mobile navigation remains delegated to the existing accessible drawer', () => {
  assert.match(shell, /<AppMobileDrawer[\s\S]*v-model:open="isMobileDrawerOpen"/);
  assert.match(shell, /<SkipToContent/);
  assert.match(shell, /<main[\s\S]*tabindex="-1"/);
});

test('shell layout retains reduced-motion and forced-colors accommodations', () => {
  assert.match(shell, /prefers-reduced-motion:\s*reduce/);
  assert.match(shell, /forced-colors:\s*active/);
  assert.match(shell, /outline-color:\s*Highlight/);
});

test('brand lockup uses the circular corporate emblem, bilingual identity and tagline', () => {
  const brand = readFileSync('src/layouts/AppShell/MASESBrand/MASESBrand.vue', 'utf8');
  const labels = readFileSync('src/router/shell-labels.ts', 'utf8');
  assert.match(brand, /src="\/logo\.png"/);
  assert.match(brand, /width="56"[\s\S]*height="56"/);
  assert.match(brand, /border-radius:\s*50%/);
  assert.match(brand, /masesBrandLabels\.tagline/);
  assert.match(labels, /tagline:\s*'Lead by example • Build lasting trust'/);
});

test('notification control remains honest about the missing backend dependency', () => {
  const shell = readFileSync('src/layouts/AppShell/AppShell.vue', 'utf8');
  const store = readFileSync('src/stores/notifications.ts', 'utf8');
  assert.match(shell, /<NotificationsBell[\s\S]*:disabled="true"/);
  assert.match(store, /DEPENDENCY MISSING/);
});

test('brand lockup uses the approved emblem, product name, and descriptive tagline', () => {
  const brand = readFileSync('src/layouts/AppShell/MASESBrand/MASESBrand.vue', 'utf8');
  assert.match(brand, /src="\/logo\.png"/);
  assert.match(brand, /border-radius:\s*50%/);
  assert.match(brand, /width:\s*56px/);
  assert.match(brand, /masesBrandLabels\.productName/);
  assert.match(brand, /Maale Arna Smart System/);
});

test('header reserves a responsive second row for breadcrumbs on narrow screens', () => {
  const header = readFileSync('src/layouts/AppShell/AppHeader/AppHeader.vue', 'utf8');
  assert.match(header, /flex-wrap:\s*wrap/);
  assert.match(header, /\.app-header__nav\s*\{[^}]*flex:\s*1 1 100%/s);
  assert.match(header, /\.app-header__nav,\s*\.app-header__actions\s*\{\s*order:\s*0/s);
  assert.match(header, /flex-wrap:\s*nowrap/);
});

test('notification bell remains gated until its service endpoints are implemented', () => {
  const shell = readFileSync('src/layouts/AppShell/AppShell.vue', 'utf8');
  assert.match(shell, /<NotificationsBell\s+:disabled="true"/);
});

test('header exposes route breadcrumbs and accessible navigation search', () => {
  const shell = readFileSync('src/layouts/AppShell/AppShell.vue', 'utf8');
  const navigation = readFileSync('src/layouts/AppShell/AppHeaderNavigation/AppHeaderNavigation.vue', 'utf8');
  assert.match(shell, /<AppHeaderNavigation :items="navItems"/);
  assert.match(navigation, /aria-label="Breadcrumb"/);
  assert.match(navigation, /data-testid="app-header-search-trigger"/);
  assert.match(navigation, /<dialog[\s\S]*aria-labelledby="app-header-search-title"/);
  assert.match(navigation, /results\.value|v-for="item in results"/);
  assert.match(navigation, /router\.push\(to\)/);
  assert.match(navigation, /Search covers the navigation destinations currently available/);
});
