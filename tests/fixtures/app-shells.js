import '../../src/styles/themes.css';
import { createApp, h } from 'vue';
import { createPinia } from 'pinia';
import { createMemoryHistory, createRouter, RouterView } from 'vue-router';
import AuthenticatedLayout from '../../src/layouts/AuthenticatedLayout/AuthenticatedLayout.vue';
import PortalLayout from '../../src/features/portal/PortalLayout.vue';
import AdminLayout from '../../src/layouts/AdminLayout/AdminLayout.vue';
import { useLocaleStore } from '../../src/stores/locale';
import { setThemePreference } from '../../src/core/theme-preference';

const child = (surface) => ({
  render: () => h('section', { 'data-testid': 'shell-child-page' }, [
    h('h1', { tabindex: '-1' }, `ARNA ${surface} mounted route`),
    h('p', `Mounted child content for the ${surface} surface.`),
  ]),
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/workspace', component: AuthenticatedLayout, children: [{ path: '', component: child('Workspace') }] },
    { path: '/portal', component: PortalLayout, children: [{ path: '', component: child('Shareholder Portal') }] },
    { path: '/admin', component: AdminLayout, children: [{ path: '', component: child('Administration') }] },
    { path: '/legal', name: 'legal', component: child('Legal Center') },
  ],
});

const app = createApp({ render: () => h(RouterView) });
app.config.errorHandler = (error) => { window.__ARNA_SHELL_FIXTURE_ERROR__ = error instanceof Error ? error.stack : String(error); };
window.addEventListener('error', (event) => { window.__ARNA_SHELL_FIXTURE_ERROR__ = event.error?.stack || event.message; });
window.addEventListener('unhandledrejection', (event) => { window.__ARNA_SHELL_FIXTURE_ERROR__ = String(event.reason); });
const pinia = createPinia();
app.use(pinia);
app.use(router);

const params = new URLSearchParams(window.location.search);
const requested = params.get('surface') || 'workspace';
const requestedLocale = params.get('locale') === 'en' ? 'en' : 'am';
const requestedTheme = ['light', 'dark', 'system'].includes(params.get('theme')) ? params.get('theme') : 'system';
useLocaleStore(pinia).setLocale(requestedLocale);
// The fixture mounts layouts directly rather than the application root (App.vue),
// so mirror the root's locale-to-document-language contract explicitly.
document.documentElement.lang = requestedLocale;
setThemePreference(requestedTheme);
const surface = ['workspace', 'portal', 'admin'].includes(requested) ? requested : 'workspace';
await router.replace(`/${surface}`);
await router.isReady();
app.mount('#app');
