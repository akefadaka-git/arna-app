import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('package identity is ARNA', async () => {
  const manifest = JSON.parse(await read('../package.json'));
  const lock = JSON.parse(await read('../package-lock.json'));
  assert.equal(manifest.name, 'arna-ui');
  assert.equal(lock.name, 'arna-ui');
  assert.equal(lock.packages[''].name, 'arna-ui');
});

test('shared shell exposes canonical ARNA exports and brand labels', async () => {
  const source = await read('../src/router/shell-labels.ts');
  assert.match(source, /export const arnaShellLabels/);
  assert.match(source, /export const arnaUserMenuItems/);
  assert.match(source, /productName: 'ARNA'/);
  assert.match(source, /fullCorporateIdentity: 'ማሌ ዓርና ስማርት ሲስተም \(ARNA\)'/);
  assert.match(source, /ወደ ARNA ወርክስፔስ/);
  assert.doesNotMatch(source, /export const mases(?:ShellLabels|UserMenuItems)/);
});

test('all authenticated surfaces import canonical shared exports', async () => {
  for (const path of [
    '../src/layouts/AuthenticatedLayout/AuthenticatedLayout.vue',
    '../src/features/portal/PortalLayout.vue',
    '../src/layouts/AdminLayout/AdminLayout.vue',
    '../src/router/admin-labels.ts',
  ]) {
    const source = await read(path);
    assert.doesNotMatch(source, /import\s*\{\s*mases(?:ShellLabels|UserMenuItems)\b/, path);
    assert.doesNotMatch(source, /^\s*\.\.\.masesUserMenuItems/m, path);
  }
});

test('all entry documents identify the ARNA product', async () => {
  const expected = [
    ['../workspace-entry/index.html', 'ARNA Workspace'],
    ['../portal-entry/index.html', 'ARNA Shareholder Portal'],
    ['../admin-entry/index.html', 'ARNA Administration'],
    ['../public-entry/index.html', 'ARNA'],
  ];
  for (const [path, brand] of expected) {
    const source = await read(path);
    const title = source.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '';
    assert.ok(source.includes(brand), 'entry must expose its ARNA surface name');
    assert.ok(title.length > 0, 'entry must have a document title');
    assert.doesNotMatch(title, /MASES/i, 'active document title must not use legacy product identity');
  }
});

test('build environments use ARNA surface names', async () => {
  for (const [path, value] of [
    ['../.env.workspace', 'VITE_APP_NAME="ARNA Workspace"'],
    ['../.env.portal', 'VITE_APP_NAME="ARNA Shareholder Portal"'],
    ['../.env.admin', 'VITE_APP_NAME=ARNA Administration'],
  ]) {
    assert.ok((await read(path)).includes(value), 'build environment must use its ARNA surface name');
  }
});

test('locale storage migrates old preference and writes only the ARNA key', async () => {
  const source = await read('../src/stores/locale.ts');
  assert.match(source, /const STORAGE_KEY = 'arna\.locale'/);
  assert.match(source, /const LEGACY_STORAGE_KEY = 'mases\.locale'/);
  assert.match(source, /getItem\(STORAGE_KEY\) \?\? localStorage\.getItem\(LEGACY_STORAGE_KEY\)/);
  assert.match(source, /setItem\(STORAGE_KEY, value\)/);
  assert.match(source, /removeItem\(LEGACY_STORAGE_KEY\)/);
});

test('active Combobox DOM identifiers use the ARNA namespace', async () => {
  const source = await read('../src/components/composites/Combobox/Combobox.vue');
  assert.match(source, /arna-combobox-/);
  assert.doesNotMatch(source, /mases-combobox-|__masesCombobox/);
});

test('active accessibility utility uses ARNA namespace', async () => {
  const source = await read('../src/styles/base.css');
  assert.match(source, /\.arna-visually-hidden/);
  assert.doesNotMatch(source, /\.mases-visually-hidden/);
});
