import { createApp, h } from 'vue';
import { createPinia } from 'pinia';
import { useLocaleStore } from '../../src/stores/locale';
import { createMemoryHistory, createRouter, RouterLink } from 'vue-router';
import AppRoot from '../../src/App.vue';
import AuthenticatedLayout from '../../src/layouts/AuthenticatedLayout/AuthenticatedLayout.vue';
import PortalLayout from '../../src/features/portal/PortalLayout.vue';
import AdminLayout from '../../src/layouts/AdminLayout/AdminLayout.vue';

const child = (surface, target, detail = false) => ({
  render: () => h('section', { 'data-testid': 'shell-child-page' }, [
    h('h1', { tabindex: '-1' }, `ARNA ${surface} mounted route`),
    h('p', `Mounted child content for the ${surface} surface.`),
    h(RouterLink, { to: target }, () => detail ? 'Back to surface' : 'Open details'),
  ]),
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/workspace', component: AuthenticatedLayout, children: [{ path: '', component: child('Workspace', '/workspace/details') }, { path: 'details', component: child('Workspace details', '/workspace', true) }] },
    { path: '/portal', component: PortalLayout, children: [{ path: '', component: child('Shareholder Portal', '/portal/details') }, { path: 'details', component: child('Shareholder Portal details', '/portal', true) }] },
    { path: '/admin', component: AdminLayout, children: [{ path: '', component: child('Administration', '/admin/details') }, { path: 'details', component: child('Administration details', '/admin', true) }] },
    { path: '/legal', name: 'legal', component: child('Legal Center') },
  ],
});

const app = createApp(AppRoot);
app.config.errorHandler = (error) => { window.__ARNA_SHELL_FIXTURE_ERROR__ = error instanceof Error ? error.stack : String(error); };
window.addEventListener('error', (event) => { window.__ARNA_SHELL_FIXTURE_ERROR__ = event.error?.stack || event.message; });
window.addEventListener('unhandledrejection', (event) => { window.__ARNA_SHELL_FIXTURE_ERROR__ = String(event.reason); });
const pinia = createPinia();
app.use(pinia);
const localeStore = useLocaleStore(pinia);
const requestedLocale = new URLSearchParams(window.location.search).get('locale');
if (requestedLocale === 'am' || requestedLocale === 'en') localeStore.setLocale(requestedLocale);
document.documentElement.lang = localeStore.locale;
app.use(router);

const requested = new URLSearchParams(window.location.search).get('surface') || 'workspace';
const surface = ['workspace', 'portal', 'admin'].includes(requested) ? requested : 'workspace';
await router.replace(`/${surface}`);
await router.isReady();
app.mount('#app');
