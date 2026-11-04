<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import PublicSiteLayout from '@/layouts/PublicSiteLayout.vue';
import ErrorShell from '@/components/patterns/ErrorShell';
import ErrorPage from '@/components/patterns/ErrorPage';
import AccessDeniedPage from '@/components/patterns/AccessDeniedPage';
import PageTitle from '@/layouts/AppShell/PageTitle';

import {
  errorCommonActionLabels,
  errorNotFoundStatusLabel,
  errorNotFoundTitle,
  errorNotFoundMessage,
  errorNotFoundPageLabels,
  errorNotFoundActions,
  errorMaintenanceStatusLabel,
  errorMaintenanceTitle,
  errorMaintenanceMessage,
  errorMaintenancePageLabels,
  errorMaintenanceActions,
  errorServerStatusLabel,
  errorServerTitle,
  errorServerMessage,
  errorServerPageLabels,
  errorServerActions,
  errorAccessDeniedLabels,
} from '@/router/error-labels';

const SUPPORT_EMAIL = 'support@maalearna.com.et';
const route = useRoute();
const router = useRouter();

type Variant = 'not-found' | 'maintenance' | 'access-denied' | 'server-error';

const variant = computed<Variant>(() => {
  switch (route.name) {
    case 'maintenance': return 'maintenance';
    case 'access-denied': return 'access-denied';
    case 'server-error': return 'server-error';
    default: return 'not-found';
  }
});

const pageTitle = computed(() => {
  switch (variant.value) {
    case 'maintenance': return errorMaintenanceTitle;
    case 'access-denied': return errorAccessDeniedLabels.title;
    case 'server-error': return errorServerTitle;
    default: return errorNotFoundTitle;
  }
});

const appName: string = import.meta.env.VITE_APP_NAME;

function queryString(key: string): string | undefined {
  const raw = route.query[key];
  return typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : undefined;
}

const code = computed(() => {
  const raw = queryString('code');
  return raw && /^[A-Za-z0-9_]{1,80}$/.test(raw) ? raw : undefined;
});
const requestId = computed(() => {
  const raw = queryString('request_id');
  return raw && /^[A-Za-z0-9._:-]{1,128}$/.test(raw) ? raw : undefined;
});
const timestamp = computed(() => {
  const raw = queryString('timestamp');
  return raw && raw.length <= 40 && !Number.isNaN(Date.parse(raw)) ? raw : undefined;
});
const accessDeniedFrom = computed(() => route.path);

const httpStatus = computed(() => {
  switch (variant.value) {
    case 'maintenance': return 503;
    case 'access-denied': return 403;
    case 'server-error': return 500;
    default: return 404;
  }
});
const diagnosticCode = computed(() => code.value ?? ({
  'not-found': 'RESOURCE_NOT_FOUND',
  maintenance: 'SERVICE_UNAVAILABLE',
  'access-denied': 'AUTH_PERMISSION_DENIED',
  'server-error': 'INTERNAL_ERROR',
}[variant.value]));

const reportHref = computed(() => {
  const params = new URLSearchParams();
  params.set('subject', `ARNA error report — HTTP ${httpStatus.value}`);
  params.set('body', [
    'Please describe what you were doing when this happened:',
    '',
    `HTTP status: ${httpStatus.value}`,
    `Error code: ${diagnosticCode.value}`,
    `Request reference: ${requestId.value ?? 'Not available'}`,
    `Timestamp: ${timestamp.value ?? 'Not available'}`,
    `Page: ${route.path}`,
    '',
    'No password, token, stack trace, or private form data is included.',
  ].join('\n'));
  return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
});

const contactHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('ARNA support request')}`;

function onBack(): void {
  const previous = window.history.state?.back;
  if (typeof previous === 'string' && previous.length > 0) {
    router.back();
    return;
  }
  void router.push('/launcher');
}

function onNotFoundAction(payload: { id: string }): void {
  if (payload.id === 'home') void router.push('/launcher');
}

function onMaintenanceAction(payload: { id: string }): void {
  if (payload.id === 'retry') window.location.reload();
  if (payload.id === 'home') void router.push('/launcher');
}

function onServerErrorAction(payload: { id: string }): void {
  if (payload.id === 'retry') window.location.reload();
  if (payload.id === 'home') void router.push('/launcher');
}

function onAccessDeniedLauncher(): void {
  void router.push('/launcher');
}
</script>

<template>
  <PublicSiteLayout>
    <PageTitle :title="pageTitle" :suffix="appName" />

    <ErrorShell v-if="variant === 'not-found'">
      <ErrorPage
        :status="404"
        :status-label="errorNotFoundStatusLabel"
        :title="errorNotFoundTitle"
        :message="errorNotFoundMessage"
        :code="diagnosticCode"
        :request-id="requestId"
        :timestamp="timestamp"
        :actions="errorNotFoundActions"
        :labels="errorNotFoundPageLabels"
        @action="onNotFoundAction"
      />
      <nav class="error-route-links" :aria-label="errorCommonActionLabels.navigation">
        <button type="button" class="error-route-links__item" @click="onBack">{{ errorCommonActionLabels.back }}</button>
        <a class="error-route-links__item" :href="reportHref">{{ errorCommonActionLabels.report }}</a>
        <a class="error-route-links__item" :href="contactHref">{{ errorCommonActionLabels.contact }}</a>
      </nav>
    </ErrorShell>

    <ErrorShell v-else-if="variant === 'maintenance'">
      <ErrorPage
        :status="503"
        :status-label="errorMaintenanceStatusLabel"
        :title="errorMaintenanceTitle"
        :message="errorMaintenanceMessage"
        :code="diagnosticCode"
        :request-id="requestId"
        :timestamp="timestamp"
        :actions="errorMaintenanceActions"
        :labels="errorMaintenancePageLabels"
        @action="onMaintenanceAction"
      />
      <nav class="error-route-links" :aria-label="errorCommonActionLabels.navigation">
        <button type="button" class="error-route-links__item" @click="onBack">{{ errorCommonActionLabels.back }}</button>
        <a class="error-route-links__item" :href="reportHref">{{ errorCommonActionLabels.report }}</a>
        <a class="error-route-links__item" :href="contactHref">{{ errorCommonActionLabels.contact }}</a>
      </nav>
    </ErrorShell>

    <ErrorShell v-else-if="variant === 'server-error'">
      <ErrorPage
        :status="500"
        :status-label="errorServerStatusLabel"
        :title="errorServerTitle"
        :message="errorServerMessage"
        :code="diagnosticCode"
        :request-id="requestId"
        :timestamp="timestamp"
        :actions="errorServerActions"
        :labels="errorServerPageLabels"
        @action="onServerErrorAction"
      />
      <nav class="error-route-links" :aria-label="errorCommonActionLabels.navigation">
        <button type="button" class="error-route-links__item" @click="onBack">{{ errorCommonActionLabels.back }}</button>
        <a class="error-route-links__item" :href="reportHref">{{ errorCommonActionLabels.report }}</a>
        <a class="error-route-links__item" :href="contactHref">{{ errorCommonActionLabels.contact }}</a>
      </nav>
    </ErrorShell>

    <ErrorShell v-else>
      <AccessDeniedPage
        :code="diagnosticCode"
        :from="accessDeniedFrom"
        :request-id="requestId"
        :timestamp="timestamp"
        :labels="errorAccessDeniedLabels"
        @launcher="onAccessDeniedLauncher"
      />
      <nav class="error-route-links" :aria-label="errorCommonActionLabels.navigation">
        <button type="button" class="error-route-links__item" @click="onBack">{{ errorCommonActionLabels.back }}</button>
        <a class="error-route-links__item" :href="reportHref">{{ errorCommonActionLabels.report }}</a>
        <a class="error-route-links__item" :href="contactHref">{{ errorCommonActionLabels.contact }}</a>
      </nav>
    </ErrorShell>
  </PublicSiteLayout>
</template>

<style scoped>
.error-route-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: var(--mases-space-3);
  width: min(100%, var(--mases-container-form));
  margin: 0 auto;
  padding: 0 var(--mases-space-6) var(--mases-space-8);
}

.error-route-links__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: var(--mases-space-2) var(--mases-space-3);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  background: transparent;
  color: var(--mases-color-action-link);
  font: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  text-decoration: none;
  cursor: pointer;
}

.error-route-links__item:hover {
  text-decoration: underline;
}

.error-route-links__item:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

@media (max-width: 639px) {
  .error-route-links {
    gap: var(--mases-space-2);
    padding-inline: var(--mases-space-4);
  }

  .error-route-links__item {
    flex: 1 1 100%;
  }
}
</style>
