import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');
const tokens = read('src/styles/tokens.css');
const theme = read('src/styles/themes.css');
const button = read('src/components/primitives/BaseButton/BaseButton.vue');
const field = read('src/components/composites/FormField/FormField.vue');
const card = read('src/components/patterns/Card/Card.vue');
const table = read('src/components/patterns/DataTable/DataTable.vue');
const modal = read('src/components/composites/Modal/Modal.vue');

test('all four application entry points import the shared theme layer', () => {
  for (const entry of [
    'workspace-entry/main.ts',
    'portal-entry/main.ts',
    'admin-entry/main.ts',
    'public-entry/main.ts',
  ]) {
    assert.match(read(entry), /import\s+['"]@\/styles\/themes\.css['"]/,
      `${entry} must import the shared theme layer`);
  }
});

test('dark theme maps every shared semantic color family', () => {
  const requiredRoles = [
    '--arna-color-surface-page', '--arna-color-surface-raised',
    '--arna-color-surface-subtle', '--arna-color-surface-overlay',
    '--arna-color-surface-sunken', '--arna-color-surface-inverse',
    '--arna-color-surface-inverse-raised', '--arna-color-surface-brand',
    '--arna-color-surface-accent', '--arna-color-surface-disabled',
    '--arna-color-surface-success', '--arna-color-surface-warning',
    '--arna-color-surface-info', '--arna-color-surface-danger',
    '--arna-color-text-primary', '--arna-color-text-secondary',
    '--arna-color-text-tertiary', '--arna-color-text-muted',
    '--arna-color-text-inverse', '--arna-color-text-inverse-secondary',
    '--arna-color-text-brand', '--arna-color-text-accent',
    '--arna-color-text-success', '--arna-color-text-warning',
    '--arna-color-text-info', '--arna-color-text-danger',
    '--arna-color-text-disabled', '--arna-color-border-default',
    '--arna-color-border-strong', '--arna-color-border-subtle',
    '--arna-color-border-brand', '--arna-color-border-inverse',
    '--arna-color-border-success', '--arna-color-border-warning',
    '--arna-color-border-info', '--arna-color-border-danger',
    '--arna-color-border-focus', '--arna-color-action-primary',
    '--arna-color-action-primary-hover', '--arna-color-action-primary-active',
    '--arna-color-action-primary-disabled', '--arna-color-action-secondary',
    '--arna-color-action-secondary-hover', '--arna-color-action-secondary-active',
    '--arna-color-action-ghost', '--arna-color-action-ghost-hover',
    '--arna-color-action-danger', '--arna-color-action-danger-hover',
    '--arna-color-action-link', '--arna-color-action-link-hover',
    '--arna-color-icon-primary', '--arna-color-icon-secondary',
    '--arna-color-icon-inverse', '--arna-color-icon-brand',
    '--arna-color-icon-accent', '--arna-color-icon-success',
    '--arna-color-icon-warning', '--arna-color-icon-info',
    '--arna-color-icon-danger', '--arna-color-state-hover',
    '--arna-color-state-selected', '--arna-color-state-selected-accent',
    '--arna-color-state-disabled-bg', '--arna-color-state-disabled-text',
    '--arna-color-state-focus-ring', '--arna-color-state-focus-ring-inverse',
    '--arna-color-overlay-scrim', '--arna-color-surface-auth-backdrop',
    '--arna-color-text-auth-attribution',
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
  assert.ok(tokens.includes('--arna-font-family-am:     "Noto Sans Ethiopic"'));
  assert.ok(tokens.includes('--arna-font-family-en:     "Inter"'));
  assert.ok(tokens.includes('html[lang="am"]'));
  assert.ok(theme.includes('html[lang="am"] body'));
  assert.ok(theme.includes('html[lang="en"] body'));
  assert.ok(theme.includes('--arna-font-size-body'));
  assert.ok(theme.includes('--arna-line-height-body'));
});

test('shared button, form, card, table and dialog contracts retain keyboard and AT semantics', () => {
  assert.ok(button.includes(':disabled="isDisabled"'));
  assert.ok(button.includes('aria-busy'));
  assert.ok(button.includes('iconOnly=true requires ariaLabel or ariaLabelledBy'));
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


const themePreference = read('src/core/theme-preference.ts');
const themeControl = read('src/layouts/ThemePreferenceControl.vue');
const appShell = read('src/layouts/AppShell/AppShell.vue');
const authLayout = read('src/features/auth/AuthLayout/AuthLayout.vue');
const publicLayout = read('src/layouts/PublicSiteLayout.vue');
const appRoot = read('src/App.vue');
const publicEntry = read('public-entry/main.ts');

test('theme preference is persisted, system-aware, and safely applied', () => {
  assert.ok(themePreference.includes("type ThemePreference = 'system' | 'light' | 'dark'"));
  assert.ok(themePreference.includes("const STORAGE_KEY = 'arna.theme'"));
  assert.ok(themePreference.includes("root.removeAttribute('data-theme')"));
  assert.ok(themePreference.includes("root.setAttribute('data-theme', preference)"));
  assert.ok(themePreference.includes('window.localStorage.getItem(STORAGE_KEY)'));
  assert.ok(themePreference.includes('window.localStorage.setItem(STORAGE_KEY, preference)'));
  assert.ok(themePreference.includes('catch'));
  assert.ok(themeControl.includes('aria-label="የማሳያ ገጽታ / Display theme"'));
  assert.ok(themeControl.includes('value="system"'));
  assert.ok(themeControl.includes('value="light"'));
  assert.ok(themeControl.includes('value="dark"'));
});

test('theme preference control is available on authenticated, authentication, and public surfaces', () => {
  assert.ok(appShell.includes('<ThemePreferenceControl />'));
  assert.ok(authLayout.includes('<ThemePreferenceControl />'));
  assert.ok(authLayout.includes('href="#auth-main-content"'));
  assert.ok(authLayout.includes('id="auth-main-content"'));
  assert.ok(authLayout.includes('tabindex="-1"'));
  assert.ok(publicLayout.includes('<ThemePreferenceControl />'));
  assert.ok(appShell.includes("import ThemePreferenceControl"));
  assert.ok(authLayout.includes("import ThemePreferenceControl"));
  assert.ok(publicLayout.includes("import ThemePreferenceControl"));
  assert.ok(appRoot.includes('initializeThemePreference()'));
  assert.ok(publicEntry.includes('initializeThemePreference()'));
});

test('all application entry documents default to Amharic and runtime locale updates document language', () => {
  for (const entry of [
    'workspace-entry/index.html',
    'portal-entry/index.html',
    'admin-entry/index.html',
    'public-entry/index.html',
  ]) {
    assert.match(read(entry), /<html\s+lang="am"/, `${entry} must default to Amharic`);
  }
  assert.ok(appRoot.includes('document.documentElement.lang = value'));
  assert.ok(theme.includes('html[lang="am"] body'));
  assert.ok(theme.includes('html[lang="en"] body'));
});
