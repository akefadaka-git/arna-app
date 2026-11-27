import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const routes = await readFile(new URL('../src/router/routes-admin.ts', import.meta.url), 'utf8');
const nav = await readFile(new URL('../src/router/admin-labels.ts', import.meta.url), 'utf8');
const page = await readFile(new URL('../src/router/pages/AdminAuditSecurityRoute.vue', import.meta.url), 'utf8');

test('Platform Audit and Security uses separate global read permissions and platform-only API routes', () => {
  assert.match(routes, /path: 'admin\/audit-security'/);
  assert.match(routes, /name: 'admin-audit-security'/);
  assert.match(routes, /permission: \['platform\.audit\.read', 'platform\.security\.read'\]/);
  assert.match(nav, /to: '\/admin\/audit-security'/);
  assert.match(nav, /permission: \['platform\.audit\.read', 'platform\.security\.read'\]/);
  assert.match(page, /\/api\/admin\/platform\/audit-logs/);
  assert.match(page, /\/api\/admin\/platform\/security-events/);
});

test('Platform Audit and Security page is read-only and communicates tenant isolation', () => {
  assert.match(page, /tenant ያልተመደበላቸውን/);
  assert.match(page, /የኦዲት መዝገቦች ለማስረጃነት ብቻ/);
  assert.doesNotMatch(page, /api\.post/);
  assert.doesNotMatch(page, /security-events\/.*\/resolve/);
  assert.match(page, /role="alert"/);
  assert.match(page, /role="status"/);
});
