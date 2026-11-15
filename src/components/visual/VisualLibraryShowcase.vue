<script setup lang="ts">
import { computed } from 'vue';

import AbstractBackdrop from './AbstractBackdrop.vue';
import ChartPanel from './ChartPanel.vue';
import ImageFrame from './ImageFrame.vue';
import MetricWidget from './MetricWidget.vue';
import MotionReveal from './MotionReveal.vue';
import PromoBanner from './PromoBanner.vue';
import TextEffect from './TextEffect.vue';
import VisualPanel from './VisualPanel.vue';
import { useLocaleStore } from '@/stores/locale';

const locale = useLocaleStore();
const isEnglish = computed(() => locale.locale === 'en');

const copy = computed(() => isEnglish.value ? {
  eyebrow: 'ARNA VISUAL SYSTEM',
  title: 'A visual language for every surface',
  description: 'Reusable 2D and CSS 3D panels, data views, media and motion. This is a component preview, not live operational data.',
  section2d: 'Two-dimensional panels',
  section3d: 'Three-dimensional panels',
  flat: 'Flat surface',
  raised: 'Elevated surface',
  glass: 'Glass surface',
  split: 'Split accent surface',
  tilt: 'Perspective tilt',
  isometric: 'Isometric depth',
  floating: 'Floating surface',
  stacked: 'Layered stack',
  metric: 'Metric widget preview',
  noLive: 'No live data connected',
  chart: 'Illustrative chart',
  chartNote: 'Synthetic example values — not operational figures.',
  image: 'Media frame',
  imageCaption: 'Local illustration asset; no remote media request.',
  promo: 'Promotional surface preview',
  promoTitle: 'A clearly identified announcement area',
  promoBody: 'Use for approved announcements or campaigns. No ad network, targeting or tracking is included.',
  effect: 'Typography treatments',
  sample: 'Depth, clarity and motion',
  preview: 'Component preview',
} : {
  eyebrow: 'የARNA የምስል ስርዓት',
  title: 'ለእያንዳንዱ ገጽ የተዋሃደ የምስል ቋንቋ',
  description: 'ዳግም የሚጠቀሙ 2D እና CSS 3D ፓነሎች፣ የውሂብ እይታዎች፣ ሚዲያ እና እንቅስቃሴ። ይህ የክፍሎች ቅድመ እይታ ነው፤ ቀጥታ የስራ ውሂብ አይደለም።',
  section2d: 'ሁለት-ልኬት ፓነሎች',
  section3d: 'ሶስት-ልኬት ፓነሎች',
  flat: 'ጠፍጣፋ ገጽታ',
  raised: 'ከፍ ያለ ገጽታ',
  glass: 'የብርጭቆ ገጽታ',
  split: 'የተከፈለ የቀለም ገጽታ',
  tilt: 'በአቅጣጫ የተጠመዘዘ',
  isometric: 'አይዞሜትሪክ ጥልቀት',
  floating: 'ተንሳፋፊ ገጽታ',
  stacked: 'በንብርብር የተደረደረ',
  metric: 'የመለኪያ ዊጅት ቅድመ እይታ',
  noLive: 'ቀጥታ ውሂብ አልተገናኘም',
  chart: 'ለምሳሌ የተዘጋጀ ግራፍ',
  chartNote: 'ሰው ሰራሽ የምሳሌ እሴቶች ናቸው፤ የስራ ቁጥሮች አይደሉም።',
  image: 'የሚዲያ ፍሬም',
  imageCaption: 'በፕሮጀክቱ ውስጥ ያለ ምስል፤ ውጫዊ የሚዲያ ጥሪ የለም።',
  promo: 'የማስታወቂያ ገጽታ ቅድመ እይታ',
  promoTitle: 'በግልጽ የተለየ የማስታወቂያ ቦታ',
  promoBody: 'ለተፈቀዱ ማስታወቂያዎች ወይም ዘመቻዎች ይጠቀሙ። የማስታወቂያ አውታር፣ ክትትል ወይም የተጠቃሚ መከታተያ አልተካተተም።',
  effect: 'የጽሑፍ ቅጦች',
  sample: 'ጥልቀት፣ ግልጽነት እና እንቅስቃሴ',
  preview: 'የክፍል ቅድመ እይታ',
});

const sampleData = computed(() => [
  { label: isEnglish.value ? 'Alpha' : 'አልፋ', value: 8 },
  { label: isEnglish.value ? 'Beta' : 'ቤታ', value: 14 },
  { label: isEnglish.value ? 'Gamma' : 'ጋማ', value: 11 },
  { label: isEnglish.value ? 'Delta' : 'ዴልታ', value: 20 },
]);
</script>

<template>
  <section class="visual-library-showcase" data-testid="visual-library-showcase">
    <header class="visual-library-showcase__hero">
      <AbstractBackdrop variant="mesh" />
      <div class="visual-library-showcase__hero-copy">
        <p class="visual-library-showcase__eyebrow">{{ copy.eyebrow }}</p>
        <h2>{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
    </header>

    <MotionReveal>
      <section class="visual-library-showcase__section" aria-labelledby="visual-2d-heading">
        <h3 id="visual-2d-heading">{{ copy.section2d }}</h3>
        <div class="visual-library-showcase__grid">
          <VisualPanel mode="2d" variant="flat" :title="copy.flat">
            <p>{{ copy.sample }}</p>
          </VisualPanel>
          <VisualPanel mode="2d" variant="raised" :title="copy.raised">
            <p>{{ copy.sample }}</p>
          </VisualPanel>
          <VisualPanel mode="2d" variant="glass" :title="copy.glass">
            <p>{{ copy.sample }}</p>
          </VisualPanel>
          <VisualPanel mode="2d" variant="split" :title="copy.split">
            <p>{{ copy.sample }}</p>
          </VisualPanel>
        </div>
      </section>

      <section class="visual-library-showcase__section" aria-labelledby="visual-3d-heading">
        <h3 id="visual-3d-heading">{{ copy.section3d }}</h3>
        <div class="visual-library-showcase__grid visual-library-showcase__grid--3d">
          <VisualPanel mode="3d" variant="tilt" :title="copy.tilt">
            <p>{{ copy.sample }}</p>
          </VisualPanel>
          <VisualPanel mode="3d" variant="isometric" :title="copy.isometric">
            <p>{{ copy.sample }}</p>
          </VisualPanel>
          <VisualPanel mode="3d" variant="floating" :title="copy.floating">
            <p>{{ copy.sample }}</p>
          </VisualPanel>
          <VisualPanel mode="3d" variant="stacked" :title="copy.stacked">
            <p>{{ copy.sample }}</p>
          </VisualPanel>
        </div>
      </section>

      <section class="visual-library-showcase__section" aria-label="Visual component previews">
        <div class="visual-library-showcase__grid visual-library-showcase__grid--content">
          <VisualPanel mode="2d" variant="raised" :title="copy.metric">
            <MetricWidget label="KPI" value="—" :description="copy.noLive" />
          </VisualPanel>
          <VisualPanel mode="2d" variant="raised" :title="copy.chart">
            <p class="visual-library-showcase__note">{{ copy.chartNote }}</p>
            <ChartPanel
              type="bar"
              :data="sampleData"
              :ariaLabel="copy.chart"
              :legend-label="copy.chart"
            />
          </VisualPanel>
          <VisualPanel mode="2d" variant="flat" :title="copy.image">
            <ImageFrame
              src="/media/arna-visual-preview.svg"
              :alt="copy.image"
              :caption="copy.imageCaption"
              aspect-ratio="16 / 9"
              fit="contain"
            />
          </VisualPanel>
        </div>
      </section>

      <section class="visual-library-showcase__section" aria-label="Promotional and typography previews">
        <PromoBanner
          :eyebrow="copy.promo"
          :title="copy.promoTitle"
          :description="copy.promoBody"
          tone="neutral"
        />
        <VisualPanel mode="2d" variant="split" :title="copy.effect">
          <p class="visual-library-showcase__effects">
            <TextEffect text="ARNA" effect="gradient" />
            <TextEffect text="ARNA" effect="outline" />
            <TextEffect text="ARNA" effect="shimmer" />
          </p>
        </VisualPanel>
      </section>
    </MotionReveal>
  </section>
</template>

<style scoped>
.visual-library-showcase { display: grid; gap: var(--arna-space-6); min-width: 0; }
.visual-library-showcase__hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-width: 0;
  padding: clamp(1.1rem, 3vw, 2rem);
  border: 1px solid var(--arna-color-border-subtle);
  border-radius: var(--arna-radius-lg);
  background: var(--arna-color-surface-raised);
}
.visual-library-showcase__hero-copy { position: relative; z-index: 1; max-width: 62rem; }
.visual-library-showcase__eyebrow { margin: 0 0 .45rem; color: var(--arna-color-text-secondary); font-size: var(--arna-font-size-caption); font-weight: 700; letter-spacing: .06em; }
.visual-library-showcase__hero h2 { margin: 0; font-size: clamp(1.3rem, 3vw, 2rem); line-height: 1.3; overflow-wrap: anywhere; }
.visual-library-showcase__hero-copy > p:last-child { max-width: 66ch; margin: .65rem 0 0; color: var(--arna-color-text-secondary); line-height: 1.6; overflow-wrap: anywhere; }
.visual-library-showcase__section { display: grid; gap: var(--arna-space-6, 1.5rem); min-width: 0; }
.visual-library-showcase__section > h3 { margin: 0; color: var(--arna-color-text-primary); font-size: var(--arna-font-size-heading-5); overflow-wrap: anywhere; }
.visual-library-showcase__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: var(--arna-space-5); min-width: 0; align-items: stretch; }
.visual-library-showcase__grid--3d {
  padding: 1rem .2rem 3rem;
  row-gap: 3rem;
}
.visual-library-showcase__grid--content {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  align-items: start;
  margin-block-end: 1.5rem;
}
.visual-library-showcase__note { margin: 0 0 .75rem; color: var(--arna-color-text-secondary); font-size: var(--arna-font-size-caption); }
.visual-library-showcase__effects { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin: 0; font-size: clamp(1.4rem, 4vw, 2rem); }
@media (max-width: 639px) {
  .visual-library-showcase { gap: var(--arna-space-5); }
  .visual-library-showcase__grid--3d { padding-inline: 0; }
}
</style>
