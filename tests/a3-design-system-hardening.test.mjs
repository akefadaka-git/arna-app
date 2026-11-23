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


const checkbox = read('src/components/primitives/BaseCheckbox/BaseCheckbox.vue');
const radio = read('src/components/primitives/BaseRadio/BaseRadio.vue');
const select = read('src/components/primitives/BaseSelect/BaseSelect.vue');
const textarea = read('src/components/primitives/BaseTextarea/BaseTextarea.vue');
const link = read('src/components/primitives/BaseLink/BaseLink.vue');
const progress = read('src/components/primitives/BaseProgressBar/BaseProgressBar.vue');
const spinner = read('src/components/primitives/BaseSpinner/BaseSpinner.vue');
const tooltip = read('src/components/primitives/BaseTooltip/BaseTooltip.vue');
const accordion = read('src/components/composites/Accordion/Accordion.vue');
const drawer = read('src/components/composites/Drawer/Drawer.vue');
const modal = read('src/components/composites/Modal/Modal.vue');
const popover = read('src/components/composites/Popover/Popover.vue');
const alert = read('src/components/composites/Alert/Alert.vue');
const loadingState = read('src/components/composites/LoadingState/LoadingState.vue');
const errorState = read('src/components/composites/ErrorState/ErrorState.vue');
const formField = read('src/components/composites/FormField/FormField.vue');

test('Checkbox and radio preserve native disabled, invalid, description and keyboard-focus contracts', () => {
  for (const [name, source, selector] of [
    ['BaseCheckbox', checkbox, ':disabled="disabled"'],
    ['BaseRadio', radio, ':disabled="disabled"'],
  ]) {
    assert.ok(source.includes(selector), `${name} must use native disabled semantics`);
    assert.match(source, /:aria-invalid="resolvedAriaInvalid"/, `${name} must expose invalid state`);
    assert.match(source, /:aria-describedby="ariaDescribedBy"/, `${name} must expose its description`);
    assert.match(source, /:focus-visible/, `${name} must provide keyboard-visible focus`);
    assert.match(source, /state-disabled-bg|state-disabled-text/, `${name} must style disabled state semantically`);
  }
});

test('Select and textarea preserve native validation, accessible naming and editable-state semantics', () => {
  assert.match(select, /:disabled="disabled"/);
  assert.match(select, /:required="required"/);
  assert.match(select, /:aria-invalid="resolvedAriaInvalid"/);
  assert.match(select, /:aria-describedby="ariaDescribedBy"/);
  assert.match(select, /v-bind="\$attrs"/);
  assert.match(select, /:focus-visible/);
  assert.match(textarea, /:disabled="disabled"/);
  assert.match(textarea, /:readonly="readonly"/);
  assert.match(textarea, /:aria-invalid="resolvedAriaInvalid"/);
  assert.match(textarea, /:aria-describedby="ariaDescribedBy"/);
  assert.match(textarea, /:aria-label="ariaLabel"/);
  assert.match(textarea, /:focus-visible/);
  assert.match(textarea, /textarea--readonly/);
});

test('Link and progress primitives retain keyboard and assistive-technology contracts', () => {
  assert.match(link, /:focus-visible/);
  assert.match(link, /aria-labelledby/);
  assert.match(progress, /role="progressbar"/);
  assert.match(progress, /aria-valuemin/);
  assert.match(progress, /aria-valuemax/);
  assert.match(progress, /aria-valuenow/);
  assert.match(progress, /prefers-reduced-motion/);
});

test('Alert, loading, error and form composites expose state through semantic and accessible channels', () => {
  assert.match(alert, /:focus-visible/);
  assert.match(alert, /prefers-reduced-motion/);
  assert.match(alert, /aria-label|aria-labelledby/);
  assert.match(loadingState, /role="status"|aria-live="polite"/);
  assert.match(errorState, /:focus-visible/);
  assert.match(formField, /aria-describedby/);
  assert.match(formField, /aria-live="polite"/);
  assert.match(formField, /:disabled="disabled"/);
});

test('expanded shared-component style census contains no hard-coded hex colors', () => {
  const sources = [
    checkbox, radio, select, textarea, link, progress,
    alert, loadingState, errorState, formField,
  ];
  for (const source of sources) {
    const style = source.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? '';
    assert.doesNotMatch(style, /#[0-9a-fA-F]{3,8}\b/,
      'shared component styles must consume declared color tokens, not hard-coded hex values');
  }
});

test('ProgressBar consumes semantic loading-motion duration tokens', () => {
  assert.match(tokens, /--mases-duration-loading:\s*900ms/);
  assert.match(tokens, /--mases-duration-loading-reduced:\s*1800ms/);
  assert.match(tokens, /--arna-duration-loading:\s*var\(--mases-duration-loading\)/);
  assert.match(tokens, /--arna-duration-loading-reduced:\s*var\(--mases-duration-loading-reduced\)/);
  assert.match(progress, /animation: arna-progress-indeterminate var\(--arna-duration-loading\)/);
  assert.match(progress, /animation-duration: var\(--arna-duration-loading-reduced\)/);
  assert.doesNotMatch(progress, /animation(?:-duration)?:\s*1\.8s|animation: arna-progress-indeterminate 0\.9s/);
});

test('Spinner consumes semantic loading-motion tokens while preserving reduced-motion exception', () => {
  assert.match(tokens, /--mases-duration-loading:\s*900ms/);
  assert.match(tokens, /--mases-duration-loading-reduced:\s*1800ms/);
  assert.match(tokens, /--arna-duration-loading:\s*var\(--mases-duration-loading\)/);
  assert.match(tokens, /--arna-duration-loading-reduced:\s*var\(--mases-duration-loading-reduced\)/);
  assert.match(spinner, /animation: arna-spinner-rotate var\(--arna-duration-loading\) linear infinite/);
  assert.match(spinner, /animation-duration: var\(--arna-duration-loading-reduced\)/);
  assert.doesNotMatch(spinner, /animation(?:-duration)?:\s*1\.6s|animation: arna-spinner-rotate 0\.8s/);
});
test('shared reduced-motion duration token governs component transition and animation overrides', () => {
  assert.match(tokens, /--mases-duration-fast:\s*150ms/);
  assert.match(tokens, /--arna-duration-fast:\s*var\(--mases-duration-fast\)/);
  assert.match(tokens, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?--mases-duration-fast:\s*1ms/);
  const sources = [alert, tooltip, accordion, drawer, modal, popover, progress];
  for (const source of sources) {
    const reducedMotion = source.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
    assert.ok(reducedMotion.length > 0, 'component must retain its reduced-motion policy');
    assert.match(reducedMotion, /(?:transition|animation)-duration: var\(--arna-duration-fast\);/);
    assert.doesNotMatch(reducedMotion, /(?:transition|animation)-duration: 1ms;/);
  }
});
