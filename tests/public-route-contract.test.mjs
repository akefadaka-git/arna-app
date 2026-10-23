import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('public entry registers the complete public route set', async () => {
  const source = await read('../public-entry/main.ts');

  for (const route of [
    "path: '/'",
    "name: 'public-home'",
    "path: '/verify'",
    "path: '/legal'",
    "path: '/legal/:slug'",
    "path: '/:pathMatch(.*)*'",
    "redirect: '/'",
  ]) {
    assert.ok(source.includes(route), `Missing public route declaration token: ${route}`);
  }
});

test('public entry does not import authenticated application bootstrapping', async () => {
  const source = await read('../public-entry/main.ts');

  for (const forbidden of [
    '@/router/index',
    '@/router/guards',
    '@/stores/auth',
    'createAppRouter',
    'installAuthGuards',
  ]) {
    assert.ok(!source.includes(forbidden), `Public entry must not import/use ${forbidden}`);
  }

  assert.match(source, /createWebHistory\(\s*import\.meta\.env\.BASE_URL\s*\)/);
  assert.ok(source.includes('.use(router)'), 'Public entry must install the independent router');
  assert.ok(source.includes(".mount('#app')"), 'Public entry must mount into the public root');
});

test('public homepage exposes verification and legal navigation', async () => {
  const source = await read('../src/public-site/PublicHome.vue');

  assert.ok(source.includes('to="/verify"'), 'Homepage must link to /verify');
  assert.ok(source.includes('to="/legal"'), 'Homepage must link to /legal');
  assert.ok(source.includes('RouterLink'), 'Navigation should use Vue Router links');
});

test('standalone legal center opts into public-home recovery without changing app default', async () => {
  const entry = await read('../public-entry/main.ts');
  const legalPage = await read('../src/router/pages/LegalCenterRoute.vue');
  const labels = await read('../src/router/legal-labels.ts');

  assert.match(entry, /name: 'public-legal-center',[\s\S]*?props: \{ publicMode: true \}/);
  assert.ok(legalPage.includes(":to=\"props.publicMode ? '/' : '/login'\""));
  assert.ok(legalPage.includes('legalCenterPageLabels.backToLoginLabel'));
  assert.ok(legalPage.includes('legalCenterPageLabels.backToPublicHomeLabel'));
  assert.ok(labels.includes("backToLoginLabel: 'ወደ መግቢያ ይመለሱ'"));
  assert.ok(labels.includes("backToPublicHomeLabel: 'ወደ መነሻ ገጽ ይመለሱ'"));
});

test('legal center recovery remains inside the public route set', async () => {
  const source = await read('../src/router/pages/LegalCenterRoute.vue');

  assert.ok(source.includes(":to=\"props.publicMode ? '/' : '/login'\""), 'Legal center recovery must be context-specific');
  assert.ok(source.includes('legalCenterPageLabels.backToPublicHomeLabel'), 'Public mode must use the homepage label');
  assert.ok(source.includes('legalCenterPageLabels.backToLoginLabel'), 'Application mode must retain the login label');
});
