import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';

const outputDir = join(process.cwd(), 'dist-public');
const indexPath = join(outputDir, 'public-entry', 'index.html');

function collectFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  });
}

function resolveLocalAsset(reference) {
  if (!reference || /^(?:[a-z]+:)?\/\//i.test(reference) || /^(?:data:|#)/i.test(reference)) {
    return null;
  }

  const pathname = reference.split(/[?#]/, 1)[0];
  return pathname.startsWith('/')
    ? join(outputDir, pathname.replace(/^\/+/, ''))
    : resolve(dirname(indexPath), pathname);
}

test('public build emits a standalone index with existing referenced local assets', () => {
  assert.ok(existsSync(indexPath), 'dist-public/public-entry/index.html must exist after build');

  const html = readFileSync(indexPath, 'utf8');
  const assetFiles = collectFiles(join(outputDir, 'assets'));
  assert.ok(assetFiles.length > 0, 'public build must emit local assets');

  const references = [
    ...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi),
    ...html.matchAll(/<link\b(?=[^>]*\brel=["'][^"']*stylesheet[^"']*["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/gi),
  ].map((match) => match[1]);

  assert.ok(references.some((reference) => /\.js(?:[?#]|$)/i.test(reference)),
    'public index must reference a JavaScript entry');

  for (const reference of references) {
    const assetPath = resolveLocalAsset(reference);
    if (assetPath !== null) {
      assert.ok(existsSync(assetPath), `HTML-referenced local asset must exist: ${reference}`);
    }
  }
});

test('public JavaScript bundle contains the expected public route contract', () => {
  const bundles = collectFiles(join(outputDir, 'assets'))
    .filter((file) => file.endsWith('.js'));
  assert.ok(bundles.length > 0, 'public JavaScript bundles must exist');

  const source = bundles.map((file) => readFileSync(file, 'utf8')).join('\n');
  for (const route of ['/', '/verify', '/legal', '/legal/:slug']) {
    assert.ok(source.includes(route), `public route ${route} must be present in the built bundle`);
  }
});
