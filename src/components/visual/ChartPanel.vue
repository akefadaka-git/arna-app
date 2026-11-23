<script lang="ts">
export interface ChartDatum {
  label: string;
  value: number;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  type?: 'bar' | 'line' | 'donut';
  data: ChartDatum[];
  ariaLabel: string;
  legendLabel: string;
  valueLabel?: string;
}>(), {
  type: 'bar',
  valueLabel: '',
});

const safeData = computed(() => props.data.map((item) => ({
  label: item.label,
  value: Number.isFinite(item.value) ? Math.max(0, item.value) : 0,
})));
const maxValue = computed(() => Math.max(1, ...safeData.value.map((item) => item.value)));
const total = computed(() => safeData.value.reduce((sum, item) => sum + item.value, 0));
const barRects = computed(() => safeData.value.map((item, index) => {
  const slot = 100 / Math.max(1, safeData.value.length);
  const height = (item.value / maxValue.value) * 76;
  return { ...item, x: index * slot + slot * 0.18, y: 88 - height, width: slot * 0.64, height };
}));
const linePoints = computed(() => safeData.value.map((item, index) => {
  const x = safeData.value.length < 2 ? 50 : 8 + (index * 84) / (safeData.value.length - 1);
  const y = 88 - (item.value / maxValue.value) * 76;
  return `${x},${y}`;
}).join(' '));
const donutSegments = computed(() => {
  const circumference = 2 * Math.PI * 38;
  let offset = 0;
  return safeData.value.map((item) => {
    const length = total.value ? (item.value / total.value) * circumference : 0;
    const segment = { ...item, length, offset };
    offset += length;
    return segment;
  });
});
</script>

<template>
  <section class="chart-panel" data-testid="chart-panel">
    <div class="chart-panel__plot">
      <svg v-if="type === 'bar'" viewBox="0 0 100 100" role="img" :aria-label="ariaLabel">
        <line x1="0" y1="88" x2="100" y2="88" class="chart-panel__axis" />
        <rect v-for="(bar, index) in barRects" :key="bar.label + index" :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height" rx="1.5" class="chart-panel__bar" />
      </svg>
      <svg v-else-if="type === 'line'" viewBox="0 0 100 100" role="img" :aria-label="ariaLabel">
        <line x1="0" y1="88" x2="100" y2="88" class="chart-panel__axis" />
        <polyline :points="linePoints" fill="none" class="chart-panel__line" />
        <circle v-for="(point, index) in linePoints.split(' ')" :key="index" :cx="Number(point.split(',')[0])" :cy="Number(point.split(',')[1])" r="2" class="chart-panel__point" />
      </svg>
      <svg v-else viewBox="0 0 120 120" role="img" :aria-label="ariaLabel">
        <circle cx="60" cy="60" r="38" fill="none" class="chart-panel__donut-track" />
        <circle v-for="(segment, index) in donutSegments" :key="segment.label + index" cx="60" cy="60" r="38" fill="none" :stroke-dasharray="`${segment.length} ${2 * Math.PI * 38 - segment.length}`" :stroke-dashoffset="-segment.offset" :class="['chart-panel__donut-segment', `chart-panel__donut-segment--${index % 5}`]" transform="rotate(-90 60 60)" />
        <text x="60" y="64" text-anchor="middle" class="chart-panel__total">{{ total }}</text>
      </svg>
    </div>
    <ul class="chart-panel__legend" :aria-label="legendLabel">
      <li v-for="(item, index) in safeData" :key="item.label + index">
        <span :class="['chart-panel__swatch', `chart-panel__swatch--${index % 5}`]" aria-hidden="true" />
        <span class="chart-panel__legend-label">{{ item.label }}</span>
        <strong>{{ item.value }}<span v-if="valueLabel"> {{ valueLabel }}</span></strong>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.chart-panel { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; min-width: 0; padding: var(--arna-space-4); border: 1px solid var(--arna-color-border-subtle); border-radius: var(--arna-radius-md); background: var(--arna-color-surface-raised); color: var(--arna-color-text-primary); }
.chart-panel__plot { min-height: 150px; display: grid; place-items: center; }
.chart-panel svg { width: 100%; max-width: 420px; max-height: 220px; overflow: visible; }
.chart-panel__axis { stroke: var(--arna-color-border-default); stroke-width: .8; }
.chart-panel__bar { fill: var(--arna-color-action-primary); }
.chart-panel__line { stroke: var(--arna-color-action-primary); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.chart-panel__point { fill: var(--arna-color-surface-raised); stroke: var(--arna-color-action-primary); stroke-width: 1.5; }
.chart-panel__donut-track { stroke: var(--arna-color-border-subtle); stroke-width: 14; }
.chart-panel__donut-segment { stroke-width: 14; }
.chart-panel__donut-segment--0, .chart-panel__swatch--0 { stroke: var(--arna-color-action-primary); background: var(--arna-color-action-primary); }
.chart-panel__donut-segment--1, .chart-panel__swatch--1 { stroke: var(--arna-color-text-brand); background: var(--arna-color-text-brand); }
.chart-panel__donut-segment--2, .chart-panel__swatch--2 { stroke: var(--arna-color-text-success); background: var(--arna-color-text-success); }
.chart-panel__donut-segment--3, .chart-panel__swatch--3 { stroke: var(--arna-color-text-warning); background: var(--arna-color-text-warning); }
.chart-panel__donut-segment--4, .chart-panel__swatch--4 { stroke: var(--arna-color-text-danger); background: var(--arna-color-text-danger); }
.chart-panel__total { fill: var(--arna-color-text-primary); font-size: 12px; font-weight: 700; }
.chart-panel__legend { display: grid; grid-template-columns: minmax(0, 1fr); gap: .45rem; list-style: none; margin: 0; padding: 0; }
.chart-panel__legend li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: .55rem; font-size: var(--arna-font-size-body-sm); }
.chart-panel__legend-label { min-width: 0; overflow-wrap: anywhere; color: var(--arna-color-text-secondary); }
.chart-panel__swatch { width: .65rem; height: .65rem; border-radius: 50%; }
@media (min-width: 640px) { .chart-panel__legend { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
