<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '@/components/primitives/BaseButton';
import BaseIcon from '@/components/primitives/BaseIcon';

interface Props {
  items: ReadonlyArray<NavItem>;
}
const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();
const dialog = ref<HTMLDialogElement | null>(null);
const query = ref('');

const results = computed(() => {
  const term = query.value.trim().toLocaleLowerCase();
  return props.items.filter((item) => !term || item.label.toLocaleLowerCase().includes(term));
});

const breadcrumbs = computed(() => route.matched
  .filter((record) => typeof record.meta.breadcrumb === 'string' || typeof record.meta.title === 'string')
  .map((record) => ({
    label: String(record.meta.breadcrumb ?? record.meta.title),
    path: record.path,
  }))
  .filter((item, index, all) => index === 0 || item.path !== all[index - 1]?.path));

function openSearch(): void {
  query.value = '';
  dialog.value?.showModal();
}

function closeSearch(): void {
  dialog.value?.close();
}

function navigate(to: NavItem['to']): void {
  void router.push(to);
  closeSearch();
}
</script>

<template>
  <div class="app-header-navigation" data-testid="app-header-navigation">
    <nav v-if="breadcrumbs.length" aria-label="Breadcrumb" class="app-header-navigation__breadcrumbs">
      <ol>
        <li v-for="(crumb, index) in breadcrumbs" :key="`${crumb.path}-${index}`">
          <span :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined">{{ crumb.label }}</span>
          <BaseIcon v-if="index < breadcrumbs.length - 1" name="chevron-right" size="xs" aria-hidden="true" />
        </li>
      </ol>
    </nav>

    <BaseButton
      type="button"
      variant="outline"
      size="sm"
      class="app-header-navigation__search-trigger"
      aria-haspopup="dialog"
      aria-label="Search ARNA modules and pages"
      data-testid="app-header-search-trigger"
      @click="openSearch"
    >
      <BaseIcon name="search" size="sm" />
      <span class="app-header-navigation__search-label">Search ARNA</span>
      <kbd>⌘ K</kbd>
    </BaseButton>

    <dialog ref="dialog" class="app-header-navigation__dialog" aria-labelledby="app-header-search-title">
      <form method="dialog" class="app-header-navigation__dialog-head">
        <div>
          <h2 id="app-header-search-title">Search ARNA</h2>
          <p>Find an available module or page</p>
        </div>
        <BaseButton type="button" variant="ghost" size="sm" aria-label="Close search" @click="closeSearch">
          <BaseIcon name="x" size="md" />
        </BaseButton>
      </form>
      <label class="app-header-navigation__input-wrap">
        <BaseIcon name="search" size="sm" />
        <input v-model="query" autofocus type="search" placeholder="Search modules and pages…" />
      </label>
      <ul class="app-header-navigation__results">
        <li v-for="item in results" :key="item.id">
          <button type="button" @click="navigate(item.to)">
            <span>{{ item.label }}</span>
            <BaseIcon name="arrow-up-right" size="sm" />
          </button>
        </li>
        <li v-if="!results.length" class="app-header-navigation__empty">No matching modules or pages</li>
      </ul>
      <p class="app-header-navigation__hint">Search covers the navigation destinations currently available to your account.</p>
    </dialog>
  </div>
</template>

<style scoped>
.app-header-navigation {
  display: flex;
  align-items: center;
  gap: var(--mases-space-3);
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
  gap: var(--mases-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  white-space: nowrap;
  overflow: hidden;
}
.app-header-navigation__breadcrumbs li {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2);
  min-width: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-caption);
}
.app-header-navigation__breadcrumbs [aria-current="page"] {
  color: var(--mases-color-text-primary);
  font-weight: var(--mases-font-weight-semibold);
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
  margin-inline-start: var(--mases-space-3);
  padding: 1px var(--mases-space-1);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-sm);
  color: var(--mases-color-text-muted);
  font-size: var(--mases-font-size-caption);
}
.app-header-navigation__dialog {
  width: min(42rem, calc(100vw - 2rem));
  max-height: min(80dvh, 42rem);
  margin: auto;
  padding: var(--mases-space-5);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-xl);
  background: var(--mases-color-surface-raised);
  color: var(--mases-color-text-primary);
  box-shadow: var(--mases-shadow-elevation-4);
}
.app-header-navigation__dialog::backdrop {
  background: var(--mases-color-overlay-scrim);
}
.app-header-navigation__dialog-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--mases-space-3);
  margin-bottom: var(--mases-space-4);
}
.app-header-navigation__dialog-head h2 {
  margin: 0;
  font-size: var(--mases-font-size-heading-md);
}
.app-header-navigation__dialog-head p,
.app-header-navigation__hint {
  margin: var(--mases-space-1) 0 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-caption);
}
.app-header-navigation__input-wrap {
  display: flex;
  align-items: center;
  gap: var(--mases-space-2);
  padding: var(--mases-space-3);
  border: 1px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-md);
  background: var(--mases-color-surface-page);
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
  gap: var(--mases-space-1);
  max-height: 42dvh;
  overflow: auto;
  margin: var(--mases-space-3) 0;
  padding: 0;
  list-style: none;
}
.app-header-navigation__results button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--mases-space-3);
  border: 0;
  border-radius: var(--mases-radius-md);
  background: transparent;
  color: inherit;
  text-align: start;
  cursor: pointer;
}
.app-header-navigation__results button:hover,
.app-header-navigation__results button:focus-visible {
  background: var(--mases-color-state-hover);
}
.app-header-navigation__empty {
  padding: var(--mases-space-4);
  color: var(--mases-color-text-secondary);
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
