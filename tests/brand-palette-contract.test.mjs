import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const publicHome = readFileSync('src/public-site/PublicHome.vue', 'utf8');
const publicLayout = readFileSync('src/layouts/PublicSiteLayout.vue', 'utf8');

const approvedPalette = {
  '--arna-color-enterprise-blue': '#123D68',
  '--arna-color-action-blue': '#1769AA',
  '--arna-color-aubergine': '#3D1C50',
  '--arna-color-crimson': '#B4233A',
  '--arna-color-gold': '#D4A017',
  '--arna-color-warm-ivory': '#FFFDF7',
  '--arna-color-living-green': '#216747',
  '--arna-color-bright-azure': '#35A7FF',
  '--arna-color-violet': '#8B5CF6',
  '--arna-color-rose': '#E85D75',
  '--arna-color-teal': '#0F9D9A',
  '--arna-color-citrus': '#C4D83D',
  '--arna-color-basalt-text': '#263445',
  '--arna-color-secondary-text': '#64748B',
  '--arna-color-cloud-surface': '#F3F6FA',
  '--arna-color-white': '#FFFFFF',
};

function luminance(hex) {
  const channels = hex.match(/[0-9A-F]{2}/gi).map((part) => parseInt(part, 16) / 255);
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test('brand token metadata and literal palette values match approved v1.0.0', () => {
  assert.ok(tokens.includes('Version:   1.0.0'), 'Token metadata must be version 1.0.0');
  for (const [token, value] of Object.entries(approvedPalette)) {
    assert.ok(tokens.includes(`${token}: ${value};`), `${token} must equal ${value}`);
  }
});

test('public-site foreground roles meet WCAG AA normal-text contrast on assigned light surfaces', () => {
  const pairs = [
    ['#123D68', '#FFFDF7', 'enterprise blue on warm ivory'],
    ['#1769AA', '#FFFDF7', 'action blue on warm ivory'],
    ['#3D1C50', '#FFFDF7', 'aubergine on warm ivory'],
    ['#B4233A', '#FFFDF7', 'crimson on warm ivory'],
    ['#263445', '#FFFDF7', 'basalt text on warm ivory'],
    ['#64748B', '#FFFDF7', 'secondary text on warm ivory'],
    ['#263445', '#F3F6FA', 'basalt text on cloud surface'],
  ];
  for (const [foreground, background, label] of pairs) {
    assert.ok(contrastRatio(foreground, background) >= 4.5,
      `${label} must reach 4.5:1 (got ${contrastRatio(foreground, background).toFixed(2)}:1)`);
  }
});

test('public home consumes shared semantic roles instead of its previous local palette', () => {
  assert.match(publicHome, /--arna-public-brand-anchor/);
  assert.match(publicHome, /--arna-public-page-surface/);
  assert.match(publicHome, /--arna-public-text-secondary/);
  assert.doesNotMatch(publicHome, /--public-(?:navy|blue|gold|ivory|ink)\s*:/);
  assert.doesNotMatch(publicHome, /#123f78|#168bff|#e5b542|#202b38|#5c6571|#4d5967|#596472|#65707c/i);
});

test('public branding uses approved emblem and shared semantic roles', () => {
  assert.match(publicHome, /src="\/logo\.png"/);
  assert.match(publicHome, /masesBrandLabels\.corporateName/);
  assert.match(publicHome, /masesBrandLabels\.productName/);
  assert.match(publicLayout, /masesBrandLabels\.fullCorporateIdentity/);
  assert.match(publicHome, /class="public-home__emblem"/);
  assert.match(publicLayout, /--arna-public-page-surface/);
  assert.match(publicLayout, /--arna-public-text-primary/);
  assert.match(publicLayout, /--arna-public-border-subtle/);
});
