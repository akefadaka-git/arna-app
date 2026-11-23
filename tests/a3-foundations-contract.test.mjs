import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');
const tokens = read('src/styles/tokens.css');
const themes = read('src/styles/themes.css');
const fontCss = read('src/styles/ethiopic-fonts.css');
const vendor = read('scripts/vendor-ethiopic-font.mjs');
const metric = read('src/components/visual/MetricWidget.vue');
const serviceWorker = read('public/sw.js');
const registration = read('src/core/register-font-cache.ts');

test('ARNA spacing aliases resolve to the canonical token scale', () => {
  assert.match(tokens, /--arna-space-4:\s*var\(--mases-space-4\)/);
  assert.match(metric, /var\(--arna-space-4,\s*1rem\)/);
  assert.doesNotMatch(metric, /--arna-spacing-4/);
});

test('shared theme loads a self-hosted Ethiopic variable font', () => {
  assert.match(themes, /@import ['"]\.\/ethiopic-fonts\.css['"]/);
  assert.match(fontCss, /font-family:\s*"Noto Sans Ethiopic"/);
  assert.match(fontCss, /font-weight:\s*100 900/);
  assert.match(fontCss, /font-display:\s*swap/);
  assert.match(fontCss, /url\(["']\/fonts\/NotoSansEthiopic%5Bwdth%2Cwght%5D\.ttf["']\)/);
  assert.match(tokens, /--mases-font-family-am:\s*"Noto Sans Ethiopic"/);
});

test('font vendor is pinned, license-preserving, and integrity checked', () => {
  assert.match(vendor, /06bfe0d62a98375cb09c942fa18e68bd32cff057/);
  assert.match(vendor, /0910ed80aac7398582c515225304623a60d6f35a/);
  assert.match(vendor, /23e1a135d51a4bfba0ef048fba7f3bce61465475/);
  assert.match(vendor, /gitBlobSha/);
  assert.match(vendor, /flag:\s*'wx'/);
  assert.match(read('package.json'), /"fonts:vendor":\s*"node scripts\/vendor-ethiopic-font\.mjs"/);
});

test('all four production builds materialize the font before bundling', () => {
  const pkg = JSON.parse(read('package.json'));
  for (const mode of ['workspace', 'portal', 'admin', 'public', 'all']) {
    assert.match(pkg.scripts[`build:${mode}`], /fonts:vendor/);
  }
});

test('font-only service worker is registered on authenticated and public apps', () => {
  assert.match(serviceWorker, /arna-ethiopic-font-v1/);
  assert.match(serviceWorker, /cache\.add\(FONT_URL\)/);
  assert.match(serviceWorker, /cache\.match/);
  assert.doesNotMatch(serviceWorker, /\/api\//);
  assert.match(registration, /navigator\.serviceWorker\.register\('\/sw\.js'/);
  assert.match(read('src/App.vue'), /@\/core\/register-font-cache/);
  assert.match(read('public-entry/main.ts'), /@\/core\/register-font-cache/);
});

test('font binary and OFL license exist after the build vendor step', () => {
  const fontPath = 'public/fonts/NotoSansEthiopic[wdth,wght].ttf';
  assert.ok(existsSync(fontPath), 'run npm run fonts:vendor before this contract');
  const font = readFileSync(fontPath);
  assert.ok(font.length > 500_000);
  assert.equal(font.readUInt32BE(0), 0x00010000);
  assert.ok(existsSync('public/fonts/OFL.txt'));
  assert.match(read('public/fonts/OFL.txt'), /SIL OPEN FONT LICENSE Version 1\.1/);
});
