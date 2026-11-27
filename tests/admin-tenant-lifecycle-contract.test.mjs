import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../src/router/pages/AdminTenantMembershipsRoute.vue', import.meta.url), 'utf8');

test('Tenant membership actions use the canonical tenant-scoped lifecycle endpoints', () => {
  assert.match(page, /useTenantStore/);
  assert.match(page, /setActiveTenant/);
  assert.match(page, /X-Tenant-ID|tenantContextReady/);
  assert.match(page, /\/api\/admin\/tenant\/memberships\/users\//);
  assert.match(page, /suspend/);
  assert.match(page, /reactivate/);
  assert.match(page, /revoke/);
  assert.match(page, /tenant\.membership\.manage/);
});

test('Tenant RBAC changes require the Owner challenge and supplied Ed25519 signature', () => {
  assert.match(page, /\/api\/admin\/tenant\/rbac\/approval-challenges/);
  assert.match(page, /canonical_payload/);
  assert.match(page, /payload_sha256/);
  assert.match(page, /Owner Ed25519 signature/);
  assert.match(page, /\/execute/);
  assert.match(page, /signature: ownerSignature\.value\.trim\(\)/);
  assert.match(page, /challenge creation.*no access mutation|የጥያቄ ፈጠራ/);
});
