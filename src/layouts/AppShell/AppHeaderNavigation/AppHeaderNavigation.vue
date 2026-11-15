<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';
import BaseButton from '@/components/primitives/BaseButton';
import BaseIcon from '@/components/primitives/BaseIcon';
import { useLocaleStore } from '@/stores/locale';

interface SearchNavItem {
  readonly id: string;
  readonly label: string;
  readonly to?: RouteLocationRaw;
  readonly visibleChildren?: ReadonlyArray<SearchNavItem>;
  readonly children?: ReadonlyArray<SearchNavItem>;
}

interface Props {
  items: ReadonlyArray<SearchNavItem>;
}
const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();
const localeStore = useLocaleStore();

const labels = computed(() => localeStore.locale === 'en'
  ? {
      breadcrumb: 'Breadcrumb',
      trigger: 'Search ARNA modules and pages',
      triggerText: 'Search ARNA',
      title: 'Search ARNA',
      description: 'Find an available module or page',
      close: 'Close search',
      input: 'Search modules and pages',
      placeholder: 'Search modules and pages…',
      empty: 'No matching modules or pages',
      hint: 'Search covers the navigation destinations currently available to your account.',
    }
  : {
      breadcrumb: 'የገጽ አቅጣጫ',
      trigger: 'የARNA ሞጁሎችን እና ገጾችን ይፈልጉ',
      triggerText: 'ARNA ይፈልጉ',
      title: 'ARNA ይፈልጉ',
      description: 'የሚገኝ ሞጁል ወይም ገጽ ያግኙ',
      close: 'ፍለጋን ዝጋ',
      input: 'ሞጁሎችን እና ገጾችን ይፈልጉ',
      placeholder: 'ሞጁሎችን እና ገጾችን ይፈልጉ…',
      empty: 'የሚዛመድ ሞጁል ወይም ገጽ አልተገኘም',
      hint: 'ፍለጋው በመለያዎ ሊደረስባቸው የሚችሉ የአሰሳ መዳረሻዎችን ይመለከታል።',
    });
const dialog = ref<HTMLDialogElement | null>(null);
const query = ref('');

const searchItems = computed(() => props.items.flatMap((item) =>
  item.to ? [item] : [...(item.visibleChildren ?? item.children ?? [])],
));

const results = computed(() => {
  const term = query.value.trim().toLocaleLowerCase();
  return searchItems.value.filter((item) =>
    item.to && (!term || item.label.toLocaleLowerCase().includes(term)),
  );
});

const breadcrumbs = computed(() => route.matched
  .filter((record) => typeof record.meta.breadcrumb === 'string' || typeof record.meta.title === 'string')
  .map((record) => ({
    label: String(record.meta.breadcrumb ?? record.meta.title),
    path: record.path,
  }))
  .filter((item, index, all) => index === 0 || item.path !== all[index - 1]?.path));

function openSearch(): void {
  if (dialog.value?.open) return;
  query.value = '';
  dialog.value?.showModal();
}

function onGlobalKeydown(event: KeyboardEvent): void {
  if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openSearch();
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobalKeydown));

function closeSearch(): void {
  dialog.value?.close();
}

function navigate(item: SearchNavItem): void {
  if (!item.to) return;
  void router.push(item.to);
  closeSearch();
}
</script>

<template>
  <div class="app-header-navigation" data-testid="app-header-navigation">
    <nav v-if="breadcrumbs.length" :aria-label="labels.breadcrumb" class="app-header-navigation__breadcrumbs">
      <ol>
        <li v-for="(crumb, index) in breadcrumbs" :key="`${crumb.path}-${index}`">
          <span :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined">{{ crumb.label }}</span>
          <BaseIcon v-if="index < breadcrumbs.length - 1" name="chevron-right" size="xs" aria-hidden="true" />
        </li>
      </ol>
    </nav>

    <BaseButton
      type="button"
      variant="ghost"
      size="sm"
      class="app-header-navigation__search-trigger"
      aria-haspopup="dialog"
      :aria-label="labels.trigger"
      data-testid="app-header-search-trigger"
      @click="openSearch"
    >
      <BaseIcon name="search" size="sm" />
      <span class="app-header-navigation__search-label">{{ labels.triggerText }}</span>
      <kbd>Ctrl / ⌘ K</kbd>
    </BaseButton>

    <dialog ref="dialog" class="app-header-navigation__dialog" aria-labelledby="app-header-search-title">
      <form method="dialog" class="app-header-navigation__dialog-head">
        <div>
          <h2 id="app-header-search-title">{{ labels.title }}</h2>
          <p>{{ labels.description }}</p>
        </div>
        <BaseButton type="button" variant="ghost" size="sm" :aria-label="labels.close" @click="closeSearch">
          <BaseIcon name="close" size="md" />
        </BaseButton>
      </form>
      <label class="app-header-navigation__input-wrap">
        <BaseIcon name="search" size="sm" />
        <input v-model="query" autofocus type="search" :aria-label="labels.input" aria-controls="app-header-search-results" :placeholder="labels.placeholder" />
      </label>
      <ul id="app-header-search-results" class="app-header-navigation__results" aria-live="polite" aria-relevant="additions text">
        <li v-for="item in results" :key="item.id">
          <button type="button" @click="navigate(item)">
            <span>{{ item.label }}</span>
            <BaseIcon name="arrow-up-right" size="sm" />
          </button>
        </li>
        <li v-if="!results.length" class="app-header-navigation__empty">{{ labels.empty }}</li>
      </ul>
      <p class="app-header-navigation__hint">{{ labels.hint }}</p>
    </dialog>
  </div>
</template>

<style scoped>
.app-header-navigation {
  display: flex;
  align-items: center;
  gap: var(--arna-space-3);
  min-width: 0;
  width: 100%;
}
.app-header-navigation__breadcrumbs {
  min-width: 0;
  overflow: hidden;
}
.app-header-navigation__breadcrumbs ol {
  display: flex;
  align-items: center;
  gap: var(--arna-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  white-space: nowrap;
  overflow: hidden;
}
.app-header-navigation__breadcrumbs li {
  display: inline-flex;
  align-items: center;
  gap: var(--arna-space-2);
  min-width: 0;
  color: var(--arna-color-text-secondary);
  font-size: var(--arna-font-size-caption);
}
.app-header-navigation__breadcrumbs [aria-current="page"] {
  color: var(--arna-color-text-primary);
  font-weight: var(--arna-font-weight-semibold);
  overflow: hidden;
  text-overflow: ellipsis;
}
.app-header-navigation__search-trigger {
  margin-inline-start: auto;
  flex-shrink: 0;
}
.app-header-navigation__search-label {
  display: inline;
}
.app-header-navigation__search-trigger kbd {
  margin-inline-start: var(--arna-space-3);
  padding: 1px var(--arna-space-1);
  border: 1px solid var(--arna-color-border-subtle);
  border-radius: var(--arna-radius-sm);
  color: var(--arna-color-text-muted);
  font-size: var(--arna-font-size-caption);
}
.app-header-navigation__dialog {
  width: min(42rem, calc(100vw - 2rem));
  max-height: min(80dvh, 42rem);
  margin: auto;
  padding: var(--arna-space-5);
  border: 1px solid var(--arna-color-border-subtle);
  border-radius: var(--arna-radius-xl);
  background: var(--arna-color-surface-raised);
  color: var(--arna-color-text-primary);
  box-shadow: var(--arna-shadow-elevation-4);
}
.app-header-navigation__dialog::backdrop {
  background: var(--arna-color-overlay-scrim);
}
.app-header-navigation__dialog-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--arna-space-3);
  margin-bottom: var(--arna-space-4);
}
.app-header-navigation__dialog-head h2 {
  margin: 0;
  font-size: var(--arna-font-size-heading-md);
}
.app-header-navigation__dialog-head p,
.app-header-navigation__hint {
  margin: var(--arna-space-1) 0 0;
  color: var(--arna-color-text-secondary);
  font-size: var(--arna-font-size-caption);
}
.app-header-navigation__input-wrap {
  display: flex;
  align-items: center;
  gap: var(--arna-space-2);
  padding: var(--arna-space-3);
  border: 1px solid var(--arna-color-border-default);
  border-radius: var(--arna-radius-md);
  background: var(--arna-color-surface-page);
}
.app-header-navigation__input-wrap input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}
.app-header-navigation__results {
  display: grid;
  gap: var(--arna-space-1);
  max-height: 42dvh;
  overflow: auto;
  margin: var(--arna-space-3) 0;
  padding: 0;
  list-style: none;
}
.app-header-navigation__results button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--arna-space-3);
  border: 0;
  border-radius: var(--arna-radius-md);
  background: transparent;
  color: inherit;
  text-align: start;
  cursor: pointer;
}
.app-header-navigation__results button:hover,
.app-header-navigation__results button:focus-visible {
  background: var(--arna-color-state-hover);
}
.app-header-navigation__empty {
  padding: var(--arna-space-4);
  color: var(--arna-color-text-secondary);
  text-align: center;
}
@media (max-width: 767px) {
  .app-header-navigation__search-label,
  .app-header-navigation__search-trigger kbd {
    display: none;
  }
  .app-header-navigation__breadcrumbs {
    display: none;
  }
}
@media (forced-colors: active) {
  .app-header-navigation__dialog {
    border: 1px solid CanvasText;
    background: Canvas;
    color: CanvasText;
  }
}
</style>
