import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('Document Intelligence workspace is permission-gated and routed', () => {
  const routes = source('../src/router/routes-workspace.ts');
  const nav = source('../src/router/shell-labels.ts');
  assert.match(routes, /path: 'document-intelligence'/);
  assert.match(routes, /meta: \{ permission: 'ocr\.job\.view' \}/);
  assert.match(nav, /to: '\/document-intelligence'/);
  assert.match(nav, /permission: 'ocr\.job\.view'/);
  assert.match(nav, /icon: 'file-search'/);
});

test('OCR client exposes the tenant-scoped lifecycle endpoints', () => {
  const api = source('../src/features/document-intelligence/api.ts');
  for (const endpoint of [
    '/api/ocr/jobs',
    '/api/ocr/jobs/',
    '/api/ocr/results/',
    '/api/ocr/search',
  ]) assert.ok(api.includes(endpoint), `missing endpoint: ${endpoint}`);
  assert.match(api, /idempotency_key: idempotencyKey/);
});

test('OCR workspace is bilingual and keeps business approval outside OCR', () => {
  const labels = source('../src/features/document-intelligence/labels.ts');
  const view = source('../src/features/document-intelligence/DocumentIntelligenceView.vue');
  assert.match(labels, /am:/);
  assert.match(labels, /en:/);
  assert.match(labels, /የሰነድ ብልህነት/);
  assert.match(view, /OCR verification does not approve a document/);
  assert.match(view, /verify\('verified'\)/);
});
