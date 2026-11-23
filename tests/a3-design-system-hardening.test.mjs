import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');
const tokens = read('src/styles/tokens.css');
const metric = read('src/components/visual/MetricWidget.vue');
const button = read('src/components/primitives/BaseButton/BaseButton.vue');
const input = read('src/components/primitives/BaseInput/BaseInput.vue');

test('ARNA compatibility aliases resolve to declared frozen MASES tokens', () => {
  const declarations = new Map(
    [...tokens.matchAll(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g)]
      .map(([, name, value]) => [name, value.trim()]),
  );
  const aliases = [...declarations].filter(([name]) => name.startsWith('--arna-'));
  assert.ok(aliases.length > 100, 'expected the shared ARNA compatibility alias layer');
  for (const [name, value] of aliases) {
    const refs = [...value.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)].map(([, ref]) => ref);
    for (const ref of refs) {
      assert.ok(declarations.has(ref), `${name} references undeclared token ${ref}`);
    }
  }
});

test('MetricWidget uses semantic spacing, typography and status roles only', () => {
  for (const token of [
    '--arna-space-4', '--arna-space-1', '--arna-space-3',
    '--arna-font-size-body-sm', '--arna-font-size-heading-2',
    '--arna-font-size-caption', '--arna-line-height-body-sm',
    '--arna-line-height-heading-2', '--arna-line-height-caption',
    '--arna-font-weight-bold', '--arna-font-weight-semibold',
    '--arna-color-border-subtle', '--arna-color-surface-raised',
    '--arna-color-text-primary', '--arna-color-text-secondary',
    '--arna-color-text-success', '--arna-color-text-danger',
  ]) {
    assert.ok(metric.includes(token), `MetricWidget must consume ${token}`);
  }
  assert.doesNotMatch(metric, /(?:margin|padding|gap):[^;]*(?:\d+(?:\.\d+)?(?:px|rem|em))/,
    'MetricWidget spacing must come from semantic tokens');
  assert.doesNotMatch(metric, /font-(?:size|weight):\s*(?:clamp\(|\d{3}|\d+(?:\.\d+)?(?:px|rem))/,
    'MetricWidget typography must come from semantic tokens');
});

test('BaseButton loading, disabled and focus-visible states preserve native semantics', () => {
  assert.match(button, /:disabled="isDisabled"/);
  assert.match(button, /:aria-busy="loading \? 'true' : undefined"/);
  assert.match(button, /v-if="loading"[\s\S]*?base-button-spinner/);
  assert.match(button, /\.arna-button:focus-visible/);
  assert.match(button, /\.arna-button:disabled/);
  assert.match(button, /prefers-reduced-motion/);
});

test('BaseInput exposes native disabled/read-only and accessible invalid state', () => {
  assert.match(input, /:disabled="disabled"/);
  assert.match(input, /:readonly="readonly"/);
  assert.match(input, /:aria-invalid="resolvedAriaInvalid"/);
  assert.match(input, /:aria-describedby="ariaDescribedBy"/);
  assert.match(input, /:aria-label="ariaLabel"/);
  assert.match(input, /:aria-labelledby="ariaLabelledBy"/);
  assert.match(input, /:has\(\.input-wrapper__input:focus-visible\)/);
  assert.match(input, /\.input-wrapper--invalid/);
  assert.match(input, /\.input-wrapper--disabled/);
  assert.match(input, /\.input-wrapper--readonly/);
});
