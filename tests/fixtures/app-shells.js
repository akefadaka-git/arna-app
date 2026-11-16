import { createApp, h } from 'vue';
import '../../src/styles/reset.css';
import '../../src/styles/tokens.css';
import { createPinia } from 'pinia';
import { createMemoryHistory, createRouter, RouterView } from 'vue-router';
import AuthenticatedLayout from '../../src/layouts/AuthenticatedLayout/AuthenticatedLayout.vue';
import PortalLayout from '../../src/features/portal/PortalLayout.vue';
import AdminLayout from '../../src/layouts/AdminLayout/AdminLayout.vue';

const child = (surface) => ({
  render: () => h('section', { 'data-testid': 'shell-child-page' }, [
    h('h1', { tabindex: '-1' }, `ARNA ${surface} mounted route`),
    h('p', `Mounted child content for the ${surface} surface.`),
  ]),
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/workspace', component: AuthenticatedLayout, children: [
      { path: '', component: child('Workspace') },
      { path: 'files/:id', name: 'file-detail', component: child('File detail') },
    ] },
    { path: '/portal', component: PortalLayout, children: [{ path: '', component: child('Shareholder Portal') }] },
    { path: '/admin', component: AdminLayout, children: [{ path: '', component: child('Administration') }] },
    { path: '/legal', name: 'legal', component: child('Legal Center') },
  ],
});

const app = createApp({ render: () => h(RouterView) });
app.config.errorHandler = (error) => { window.__ARNA_SHELL_FIXTURE_ERROR__ = error instanceof Error ? error.stack : String(error); };
window.addEventListener('error', (event) => { window.__ARNA_SHELL_FIXTURE_ERROR__ = event.error?.stack || event.message; });
window.addEventListener('unhandledrejection', (event) => { window.__ARNA_SHELL_FIXTURE_ERROR__ = String(event.reason); });
app.use(createPinia());
app.use(router);

const requested = new URLSearchParams(window.location.search).get('surface') || 'workspace';
const surface = ['workspace', 'portal', 'admin'].includes(requested) ? requested : 'workspace';
await router.replace(`/${surface}`);
await router.isReady();
app.mount('#app');
