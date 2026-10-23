import { createApp, h } from 'vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';

import PublicHome from '@/public-site/PublicHome.vue';
import PublicVerificationRoute from '@/router/pages/PublicVerificationRoute.vue';
import LegalCenterRoute from '@/router/pages/LegalCenterRoute.vue';
import LegalDocumentRoute from '@/router/pages/LegalDocumentRoute.vue';

/**
 * The corporate public site owns a small, independent route table.
 * It deliberately does not import the authenticated application router,
 * guards, workspace shell, or session bootstrap.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'public-home',
      component: PublicHome,
    },
    {
      path: '/verify',
      name: 'public-document-verification',
      component: PublicVerificationRoute,
    },
    {
      path: '/legal',
      name: 'public-legal-center',
      component: LegalCenterRoute,
      props: { publicMode: true },
    },
    {
      path: '/legal/:slug',
      name: 'public-legal-document',
      component: LegalDocumentRoute,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

createApp({
  render: () => h(RouterView),
})
  .use(router)
  .mount('#app');
