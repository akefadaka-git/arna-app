import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [routes, guards, nav] = await Promise.all([
  readFile(new URL('../src/router/routes-admin.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/router/guards.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/router/admin-labels.ts', import.meta.url), 'utf8'),
]);

test('admin parent requires authentication without imposing a parent-wide permission', () => {
  assert.match(
    routes,
    /path:\s*'\/',\s*component:\s*\(\)\s*=>\s*import\('@\/layouts\/AdminLayout'\),\s*meta:\s*\{\s*requiresAuth:\s*true\s*\},\s*children:/,
    'AdminLayout parent must require authentication only',
  );
  assert.doesNotMatch(
    routes.match(/path:\s*'\/',[\s\S]*?children:\s*\[/)?.[0] ?? '',
    /permission\s*:/,
    'Parent route must not gate every admin child with a shared permission',
  );
});

test('admin dashboard is an authentication-only landing route', () => {
  const dashboard = routes.match(
    /path:\s*'admin',\s*name:\s*'admin-home',[\s\S]*?component:\s*\(\)\s*=>\s*import\('\.\/pages\/AdminDashboardRoute\.vue'\),/,
  );
  assert.ok(dashboard, 'Admin dashboard route must remain registered');
  assert.doesNotMatch(dashboard[0], /permission\s*:/);
});

test('administrative feature routes retain their individual confirmed permissions', () => {
  assert.match(
    routes,
    /name:\s*'admin-public-content',[\s\S]*?meta:\s*\{\s*permission:\s*'public-content\.review'\s*\}/,
  );
  assert.match(
    routes,
    /name:\s*'admin-corporate-site',[\s\S]*?meta:\s*\{\s*permission:\s*'public-content\.review'\s*\}/,
  );
  assert.match(
    routes,
    /name:\s*'admin-audit-security',[\s\S]*?meta:\s*\{\s*permission:\s*\[\s*'audit\.view',\s*'security-event\.view'\s*\],\s*permissionMode:\s*'any'\s*\}/,
  );
});

test('admin sidebar exposes each feature route with matching permission filtering', () => {
  assert.match(nav, /id:\s*'audit-security-center',[\s\S]*?to:\s*'\/admin\/audit-security',[\s\S]*?permission:\s*\['audit\.view',\s*'security-event\.view'\],[\s\S]*?permissionMode:\s*'any'/);
  assert.match(nav, /id:\s*'public-content-review',[\s\S]*?to:\s*'\/admin\/public-content',[\s\S]*?permission:\s*'public-content\.review'/);
  assert.match(nav, /id:\s*'corporate-site',[\s\S]*?to:\s*'\/admin\/corporate-site',[\s\S]*?permission:\s*'public-content\.review'/);
});

test('auth guard evaluates permissions on matched route records', () => {
  assert.match(guards, /for\s*\(const record of to\.matched\)/);
  assert.match(guards, /const permission = record\.meta\.permission/);
  assert.match(guards, /checkPermission\(auth, permission, mode\)/);
});
