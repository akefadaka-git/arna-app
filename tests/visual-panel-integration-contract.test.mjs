import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('visual panels expose distinct 2D and CSS 3D treatments', () => {
  const panel = read('src/components/visual/VisualPanel.vue');
  assert.match(panel, /mode\?: '2d' \| '3d'/);
  for (const variant of ['flat', 'raised', 'glass', 'split', 'tilt', 'isometric', 'floating', 'stacked']) {
    assert.ok(panel.includes(`'${variant}'`), `panel variant ${variant} must be declared`);
  }
  assert.match(panel, /perspective:/);
  assert.match(panel, /transform-style:\s*preserve-3d/);
  assert.match(panel, /prefers-reduced-motion:\s*reduce/);
  assert.match(panel, /max-width:\s*639px/);
});

test('workspace dashboard mounts the showcase and preserves component reachability', () => {
  const dashboard = read('src/features/dashboard/DashboardView.vue');
  const showcase = read('src/components/visual/VisualLibraryShowcase.vue');
  for (const name of ['MetricWidget', 'ChartPanel', 'ImageFrame', 'PromoBanner', 'AbstractBackdrop', 'TextEffect', 'MotionReveal', 'VisualPanel']) {
    assert.ok(showcase.includes(name), `showcase must consume ${name}`);
  }
  assert.match(dashboard, /import VisualLibraryShowcase from '@\/components\/visual\/VisualLibraryShowcase\.vue'/);
  assert.match(dashboard, /<VisualLibraryShowcase\s*\/>/);
  assert.match(showcase, /useLocaleStore/);
  assert.match(showcase, /Synthetic example values|ሰው ሰራሽ/);
  assert.match(showcase, /No live data connected|ቀጥታ ውሂብ/);
});

test('showcase media resolves to a checked-in local asset', () => {
  const showcase = read('src/components/visual/VisualLibraryShowcase.vue');
  assert.match(showcase, /src="\/media\/arna-visual-preview\.svg"/);
  assert.ok(existsSync('public/media/arna-visual-preview.svg'));
});

test('visual barrel exports the panel and showcase components', () => {
  const index = read('src/components/visual/index.ts');
  assert.match(index, /VisualPanel/);
  assert.match(index, /VisualLibraryShowcase/);
});
