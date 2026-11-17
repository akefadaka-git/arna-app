import { createApp, h } from 'vue';
import { createPinia } from 'pinia';
import '@/styles/themes.css';
import VisualLibraryShowcase from '@/components/visual/VisualLibraryShowcase.vue';
import { useLocaleStore } from '@/stores/locale';

const pinia = createPinia();
const app = createApp({ render: () => h(VisualLibraryShowcase) });
app.use(pinia);
app.mount('#visual-review-root');
const locale = useLocaleStore(pinia);
const root = document.documentElement;

function setLocale(value: 'am' | 'en'): void {
  locale.setLocale(value);
  root.lang = value;
}
document.querySelectorAll<HTMLButtonElement>('[data-locale]').forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.locale;
    if (value === 'am' || value === 'en') setLocale(value);
  });
});
document.querySelectorAll<HTMLButtonElement>('[data-theme]').forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.theme;
    if (value === 'light' || value === 'dark') root.dataset.theme = value;
  });
});
setLocale('am');
root.dataset.theme = 'light';
