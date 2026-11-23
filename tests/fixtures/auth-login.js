import { createApp, h } from 'vue';
import { createPinia } from 'pinia';
import { createMemoryHistory, createRouter, RouterView } from 'vue-router';
import LoginForm from '../../src/features/auth/LoginForm/LoginForm.vue';
import { loginFormLabels } from '../../src/router/auth-labels.ts';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/login',
      name: 'auth-test-login',
      component: LoginForm,
      props: { labels: loginFormLabels },
    },
    {
      path: '/launcher',
      name: 'auth-test-launcher',
      component: {
        render: () => h('main', { 'data-testid': 'auth-test-launcher' }, 'Signed in'),
      },
    },
  ],
});

const app = createApp({ render: () => h(RouterView) });
app.use(createPinia());
app.use(router);
await router.push('/login');
await router.isReady();
app.mount('#app');
