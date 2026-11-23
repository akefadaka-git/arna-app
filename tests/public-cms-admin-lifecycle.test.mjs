import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const admin = readFileSync(new URL('../src/router/pages/AdminCorporateSiteRoute.vue', import.meta.url), 'utf8');
const api = readFileSync(new URL('../src/features/public-site/admin-api.ts', import.meta.url), 'utf8');

test('corporate CMS provides a structured bilingual section composer', () => {
  for (const contract of [
    'sectionsDraft',
    'normalizeSections',
    'addSection',
    'moveSection',
    'removeSection',
    'section.content.am.title',
    'section.content.en.title',
    'section.content.am.items',
    'section.content.en.items',
    'section.content.visible',
    'cta_url',
    'image_alt',
  ]) {
    assert.ok(admin.includes(contract), `missing structured CMS contract: ${contract}`);
  }
  assert.doesNotMatch(admin, /v-model="sectionsJson"|All page sections — JSON/,
    'page composition must not require editing a JSON textarea');
});

test('corporate CMS exposes versioned enable, disable, archive, restore and safe delete controls', () => {
  for (const action of ['enable', 'disable', 'archive', 'restore', 'delete']) {
    assert.ok(api.includes(`' ${action}'`.trim()) || api.includes(`'${action}'`),
      `API client must expose lifecycle action ${action}`);
    assert.ok(admin.includes(`'${action}'`), `Admin Console must expose lifecycle action ${action}`);
  }
  assert.match(admin, /window\.confirm\('Delete this archived/);
  assert.match(admin, /Show archived and deleted records/);
  assert.match(api, /expected_version: page\.version/);
  assert.match(api, /expected_version: entry\.version/);
});

test('editorial authoring uses independent bilingual summary and structured metadata fields', () => {
  for (const field of ['entrySummaryAm', 'entrySummaryEn', 'entryCategory', 'entryLocation', 'entryStartDate', 'entryEndDate', 'entryExternalUrl', 'entryFeatured']) {
    assert.ok(admin.includes(field), `missing editorial field: ${field}`);
  }
  assert.doesNotMatch(admin, /entryPayloadJson|Structured entry payload — JSON/,
    'routine editorial authoring must not require JSON payload editing');
});
