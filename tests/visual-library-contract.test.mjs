import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('visual library exports the initial reusable component set', () => {
  const index = read('src/components/visual/index.ts');
  for (const name of ['MetricWidget', 'ChartPanel', 'ImageFrame', 'PromoBanner', 'AbstractBackdrop', 'TextEffect', 'MotionReveal']) {
    assert.ok(index.includes(name), `visual barrel must export ${name}`);
  }
});

test('charts require accessible naming and provide a textual data legend', () => {
  const chart = read('src/components/visual/ChartPanel.vue');
  assert.match(chart, /ariaLabel:\s*string/);
  assert.match(chart, /:aria-label="ariaLabel"/);
  assert.match(chart, /class="chart-panel__legend"/);
  assert.match(chart, /type\?: 'bar' \| 'line' \| 'donut'/);
});

test('media requires alternative text and supports lazy decoding', () => {
  const image = read('src/components/visual/ImageFrame.vue');
  assert.match(image, /alt:\s*string/);
  assert.match(image, /:alt="alt"/);
  assert.match(image, /loading="lazy"/);
  assert.match(image, /decoding="async"/);
});

test('promotional content is identified and uses ordinary link semantics', () => {
  const promo = read('src/components/visual/PromoBanner.vue');
  assert.match(promo, /eyebrow:\s*string/);
  assert.match(promo, /:aria-label="title"/);
  assert.match(promo, /<a v-if="href && actionLabel"/);
  assert.doesNotMatch(promo, /target="_blank"/);
});

test('decorative and motion components honor accessibility preferences', () => {
  const backdrop = read('src/components/visual/AbstractBackdrop.vue');
  const reveal = read('src/components/visual/MotionReveal.vue');
  const text = read('src/components/visual/TextEffect.vue');
  assert.match(backdrop, /aria-hidden="true"/);
  assert.match(reveal, /prefers-reduced-motion:\s*reduce/);
  assert.match(text, /prefers-reduced-motion:\s*reduce/);
});
