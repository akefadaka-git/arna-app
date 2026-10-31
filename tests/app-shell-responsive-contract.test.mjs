import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const shell = readFileSync('src/layouts/AppShell/AppShell.vue', 'utf8');

test('App Shell keeps the content region shrink-safe at every breakpoint', () => {
  assert.match(shell, /\.app-shell__body\s*\{[^}]*min-height:\s*0/s);
  assert.match(shell, /\.app-shell__main\s*\{[^}]*min-width:\s*0/s);
  assert.match(shell, /\.app-shell__content\s*\{[^}]*width:\s*100%/s);
});

test('tablet navigation column uses a fluid width without hiding bilingual labels', () => {
  assert.match(shell, /@media\s*\(min-width:\s*640px\)\s*and\s*\(max-width:\s*1023px\)/);
  assert.match(shell, /width:\s*clamp\(13rem,\s*25vw,\s*15rem\)/);
  assert.match(shell, /\.app-shell__aside-nav\s+:deep\(\.app-sidebar\)\s*\{\s*width:\s*100%/);
  assert.doesNotMatch(shell, /app-sidebar__label\s*\{[^}]*display:\s*none/s);
});

test('mobile navigation remains delegated to the existing accessible drawer', () => {
  assert.match(shell, /<AppMobileDrawer[\s\S]*v-model:open="isMobileDrawerOpen"/);
  assert.match(shell, /<SkipToContent/);
  assert.match(shell, /<main[\s\S]*tabindex="-1"/);
});

test('shell layout retains reduced-motion and forced-colors accommodations', () => {
  assert.match(shell, /prefers-reduced-motion:\s*reduce/);
  assert.match(shell, /forced-colors:\s*active/);
  assert.match(shell, /outline-color:\s*Highlight/);
});
