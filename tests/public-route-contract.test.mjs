import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('public entry registers the complete public route set', async () => {
  const source = await read('../public-entry/main.ts');

  for (const route of [
    "path: '/', name: 'public-home'",
    "path: '/verify'",
    "path: '/legal'",
    "path: '/legal/:slug'",
    "path: '/:pathMatch(.*)*', redirect: '/'",
  ]) {
    assert.ok(source.includes(route), `Missing public route declaration: ${route}`);
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

  assert.ok(source.includes('createWebHistory()'));
  assert.ok(source.includes('createApp({ render: () => h(RouterView) }).use(router).mount'));
});

test('public homepage exposes verification and legal navigation', async () => {
  const source = await read('../src/public-site/PublicHome.vue');

  assert.ok(source.includes('to="/verify"'), 'Homepage must link to /verify');
  assert.ok(source.includes('to="/legal"'), 'Homepage must link to /legal');
  assert.ok(source.includes('RouterLink'), 'Navigation should use Vue Router links');
});

test('legal center recovery remains inside the public route set', async () => {
  const source = await read('../src/router/pages/LegalCenterRoute.vue');

  assert.ok(source.includes('to="/"'), 'Legal center recovery must return to public homepage');
  assert.ok(!source.includes('to="/login"'), 'Public legal page must not link to unregistered /login');
});
