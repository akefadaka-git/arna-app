import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const routes = await readFile(new URL('../src/router/routes-workspace.ts', import.meta.url), 'utf8');

test('workspace loans list accepts administrative or own-only viewing', () => {
  assert.match(routes, /path:\s*'loans',[\s\S]*?meta:\s*\{\s*permission:\s*\['loan\.view',\s*'loan\.view_own'\],\s*permissionMode:\s*'any'/);
});

test('loan product catalogue requires administrative loan viewing', () => {
  assert.match(routes, /path:\s*'loan-products',[\s\S]*?meta:\s*\{\s*permission:\s*'loan\.view'\s*\}/);
});
