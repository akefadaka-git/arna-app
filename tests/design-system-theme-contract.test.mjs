import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const theme = readFileSync('src/styles/themes.css', 'utf8');
const button = readFileSync('src/components/primitives/BaseButton/BaseButton.vue', 'utf8');
const field = readFileSync('src/components/composites/FormField/FormField.vue', 'utf8');
const card = readFileSync('src/components/patterns/Card/Card.vue', 'utf8');
const table = readFileSync('src/components/patterns/DataTable/DataTable.vue', 'utf8');
const modal = readFileSync('src/components/composites/Modal/Modal.vue', 'utf8');

test('dark theme maps every shared semantic color family', () => {
  const requiredRoles = [
    '--mases-color-surface-page', '--mases-color-surface-raised',
    '--mases-color-surface-subtle', '--mases-color-surface-overlay',
    '--mases-color-surface-sunken', '--mases-color-surface-inverse',
    '--mases-color-surface-inverse-raised', '--mases-color-surface-brand',
    '--mases-color-surface-accent', '--mases-color-surface-disabled',
    '--mases-color-surface-success', '--mases-color-surface-warning',
    '--mases-color-surface-info', '--mases-color-surface-danger',
    '--mases-color-text-primary', '--mases-color-text-secondary',
    '--mases-color-text-tertiary', '--mases-color-text-muted',
    '--mases-color-text-inverse', '--mases-color-text-inverse-secondary',
    '--mases-color-text-brand', '--mases-color-text-accent',
    '--mases-color-text-success', '--mases-color-text-warning',
    '--mases-color-text-info', '--mases-color-text-danger',
    '--mases-color-text-disabled', '--mases-color-border-default',
    '--mases-color-border-strong', '--mases-color-border-subtle',
    '--mases-color-border-brand', '--mases-color-border-inverse',
    '--mases-color-border-success', '--mases-color-border-warning',
    '--mases-color-border-info', '--mases-color-border-danger',
    '--mases-color-border-focus', '--mases-color-action-primary',
    '--mases-color-action-primary-hover', '--mases-color-action-primary-active',
    '--mases-color-action-primary-disabled', '--mases-color-action-secondary',
    '--mases-color-action-secondary-hover', '--mases-color-action-secondary-active',
    '--mases-color-action-ghost', '--mases-color-action-ghost-hover',
    '--mases-color-action-danger', '--mases-color-action-danger-hover',
    '--mases-color-action-link', '--mases-color-action-link-hover',
    '--mases-color-icon-primary', '--mases-color-icon-secondary',
    '--mases-color-icon-inverse', '--mases-color-icon-brand',
    '--mases-color-icon-accent', '--mases-color-icon-success',
    '--mases-color-icon-warning', '--mases-color-icon-info',
    '--mases-color-icon-danger', '--mases-color-state-hover',
    '--mases-color-state-selected', '--mases-color-state-selected-accent',
    '--mases-color-state-disabled-bg', '--mases-color-state-disabled-text',
    '--mases-color-state-focus-ring', '--mases-color-state-focus-ring-inverse',
    '--mases-color-overlay-scrim', '--mases-color-surface-auth-backdrop',
    '--mases-color-text-auth-attribution',
  ];
  for (const role of requiredRoles) {
    assert.ok(tokens.includes(role), `frozen token substrate must declare ${role}`);
    assert.ok(theme.includes(role + ':'), `dark theme must map ${role}`);
  }
});

test('system preference and explicit light/dark overrides are supported', () => {
  assert.ok(theme.includes('prefers-color-scheme: dark'));
  assert.ok(theme.includes(':root[data-theme="dark"]'));
  assert.ok(theme.includes(':root:not([data-theme="light"])'));
  assert.ok(theme.includes(':focus-visible'));
  assert.ok(theme.includes('forced-colors: active'));
});

test('English and Amharic typography use their approved font stacks and scales', () => {
  assert.ok(tokens.includes('--mases-font-family-am:     "Noto Sans Ethiopic"'));
  assert.ok(tokens.includes('--mases-font-family-en:     "Inter"'));
  assert.ok(tokens.includes('html[lang="am"]'));
  assert.ok(theme.includes('html[lang="am"] body'));
  assert.ok(theme.includes('html[lang="en"] body'));
  assert.ok(theme.includes('--mases-font-size-body'));
  assert.ok(theme.includes('--mases-line-height-body'));
});

test('shared button, form, card, table and dialog contracts retain keyboard and AT semantics', () => {
  assert.ok(button.includes(':disabled="isDisabled"'));
  assert.ok(button.includes('aria-busy'));
  assert.ok(button.includes('iconOnly=true requires the ariaLabel prop'));
  assert.ok(field.includes('aria-describedby'));
  assert.ok(field.includes('aria-live="polite"'));
  assert.ok(card.includes('role="button"'));
  assert.ok(card.includes('tabindex'));
  assert.ok(card.includes('Enter'));
  assert.ok(card.includes('Space'));
  assert.ok(table.includes('<table'));
  assert.ok(table.includes('scope="col"'));
  assert.ok(table.includes('aria-sort'));
  assert.ok(modal.includes('<dialog'));
  assert.ok(modal.includes('aria-modal="true"'));
  assert.ok(modal.includes('showModal'));
  assert.ok(theme.includes(':focus-visible'));
  assert.ok(theme.includes('prefers-reduced-motion'));
});
