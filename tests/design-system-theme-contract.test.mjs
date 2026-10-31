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
    assert.match(tokens, new RegExp(role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*:'),
      `frozen token substrate must declare ${role}`);
    assert.ok(theme.includes(role + ':'), `dark theme must map ${role}`);
  }
});

test('system preference and explicit light/dark overrides are supported', () => {
  assert.match(theme, /prefers-color-scheme:\\s*dark/);
  assert.match(theme, /:root\\[data-theme="dark"\\]/);
  assert.match(theme, /:root:not\\(\\[data-theme="light"\\]\\)/);
  assert.match(theme, /:focus-visible/);
  assert.match(theme, /forced-colors:\\s*active/);
});

test('English and Amharic typography use their approved font stacks and scales', () => {
  assert.match(tokens, /--mases-font-family-am:\\s*"Noto Sans Ethiopic"/);
  assert.match(tokens, /--mases-font-family-en:\\s*"Inter"/);
  assert.match(tokens, /html\\[lang="am"\\]\\s*\\{/);
  assert.match(theme, /html\\[lang="am"\\] body/);
  assert.match(theme, /html\\[lang="en"\\] body/);
  assert.match(theme, /--mases-font-size-body/);
  assert.match(theme, /--mases-line-height-body/);
});

test('shared button, form, card, table and dialog contracts retain keyboard and AT semantics', () => {
  assert.match(button, /:disabled="isDisabled"/);
  assert.match(button, /aria-busy/);
  assert.match(button, /iconOnly=true requires the ariaLabel prop/);
  assert.match(field, /aria-describedby/);
  assert.match(field, /aria-live="polite"/);
  assert.match(card, /role="button"/);
  assert.match(card, /tabindex="0"/);
  assert.match(card, /Enter/);
  assert.match(card, /Space/);
  assert.match(table, /<table/);
  assert.match(table, /scope="col"/);
  assert.match(table, /aria-sort/);
  assert.match(modal, /<dialog/);
  assert.match(modal, /aria-modal="true"/);
  assert.match(modal, /showModal/);
  assert.match(theme, /:focus-visible/);
  assert.match(theme, /prefers-reduced-motion/);
});
