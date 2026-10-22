<script setup lang="ts">
import { computed, ref } from 'vue';

import ErrorShell from '@/components/patterns/ErrorShell';
import PublicSiteLayout from '@/layouts/PublicSiteLayout.vue';
import PageTitle from '@/layouts/AppShell/PageTitle';
import { publicVerificationLabels as labels } from '@/router/public-verification-labels';
import type { PublicVerificationResult } from '@/router/public-verification-labels';
import { PublicVerificationValidationError, verifyPublicDocument } from '@/router/public-verification-api';

const appName: string = import.meta.env.VITE_APP_NAME;
const reference = ref('');
const result = ref<PublicVerificationResult | null>(null);
const loading = ref(false);
const validationMessage = ref('');
const checked = ref(false);

const resultTitle = computed(() => {
  if (!checked.value) return '';
  if (loading.value) return labels.submitting;
  if (result.value === null) return labels.unavailableTitle;

  switch (result.value.status) {
    case 'verified': return labels.verifiedTitle;
    case 'invalid': return labels.invalidTitle;
    case 'revoked': return labels.revokedTitle;
  }
});

const resultMessage = computed(() => {
  if (!checked.value || loading.value) return '';
  if (result.value === null) return labels.unavailableMessage;

  switch (result.value.status) {
    case 'verified': return labels.verifiedMessage;
    case 'invalid': return labels.invalidMessage;
    case 'revoked': return labels.revokedMessage;
  }
});

const resultKind = computed(() => result.value?.status ?? 'unavailable');

async function submitVerification(): Promise<void> {
  const normalized = reference.value.trim();
  validationMessage.value = '';

  if (!normalized) {
    validationMessage.value = labels.required;
    return;
  }

  if (normalized.length > 64) {
    validationMessage.value = labels.tooLong;
    return;
  }

  reference.value = normalized;
  loading.value = true;
  checked.value = true;
  result.value = null;

  try {
    result.value = await verifyPublicDocument(normalized);
  } catch (error: unknown) {
    if (error instanceof PublicVerificationValidationError) {
      validationMessage.value = labels.serverValidation;
      checked.value = false;
      result.value = null;
    } else {
      // Unexpected adapter failures must not be shown as a validation error.
      result.value = null;
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <PublicSiteLayout>
    <PageTitle :title="labels.pageTitle" :suffix="appName" />

    <ErrorShell>
      <section class="verification" aria-labelledby="verification-title">
        <header class="verification__header">
          <p class="verification__eyebrow">ARNA · PUBLIC SERVICE</p>
          <h1 id="verification-title" class="verification__title">{{ labels.pageTitle }}</h1>
          <p class="verification__intro">{{ labels.intro }}</p>
        </header>

        <form class="verification__form" @submit.prevent="submitVerification">
          <label class="verification__label" for="document-reference">{{ labels.referenceLabel }}</label>
          <input
            id="document-reference"
            v-model="reference"
            class="verification__input"
            name="reference"
            type="text"
            autocomplete="off"
            autocapitalize="characters"
            spellcheck="false"
            maxlength="64"
            required
            :placeholder="labels.referencePlaceholder"
            :aria-invalid="validationMessage ? 'true' : 'false'"
            aria-describedby="reference-help reference-error"
          />
          <p id="reference-help" class="verification__hint">የአክሲዮን ምስክር ወረቀቱን ማጣቀሻ ቁጥር ብቻ ያስገቡ።</p>
          <p
            v-if="validationMessage"
            id="reference-error"
            class="verification__validation"
            role="alert"
          >
            {{ validationMessage }}
          </p>
          <button class="verification__submit" type="submit" :disabled="loading">
            {{ loading ? labels.submitting : labels.submit }}
          </button>
        </form>

        <section
          v-if="checked"
          class="verification__result"
          :class="`verification__result--${resultKind}`"
          aria-live="polite"
          aria-atomic="true"
          data-testid="public-verification-result"
        >
          <h2 class="verification__result-title">{{ resultTitle }}</h2>
          <p class="verification__result-message">{{ resultMessage }}</p>
          <dl v-if="result" class="verification__metadata">
            <div>
              <dt>{{ labels.referenceResult }}</dt>
              <dd>{{ result.reference }}</dd>
            </div>
            <div v-if="result.documentType">
              <dt>የማስረጃ ዓይነት</dt>
              <dd>{{ result.documentType }}</dd>
            </div>
            <div v-if="result.issuedAt">
              <dt>የተሰጠበት ቀን</dt>
              <dd>{{ result.issuedAt }}</dd>
            </div>
          </dl>
        </section>

        <p class="verification__disclaimer">
          ይህ አገልግሎት የARNA የአክሲዮን ምስክር ወረቀቶችን ብቻ ያረጋግጣል። ሌሎች ሕጋዊ ሰነዶችን አያረጋግጥም።
          አገልግሎቱ ካልተገኘ የምስክር ወረቀቱ ትክክል ወይም ሐሰተኛ ነው ብለን አንደምድምም።
        </p>
      </section>
    </ErrorShell>
  </PublicSiteLayout>
</template>

<style scoped>
.verification {
  width: min(100%, 720px);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6, 24px);
  color: var(--mases-color-text-primary, #141009);
}
.verification__header { display: flex; flex-direction: column; gap: var(--mases-space-3, 12px); }
.verification__eyebrow {
  margin: 0;
  color: var(--mases-color-text-secondary, #3F382B);
  font-size: var(--mases-font-size-body-sm, 14px);
  letter-spacing: .08em;
}
.verification__title {
  margin: 0;
  font-size: var(--mases-font-size-heading-3, 28px);
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.verification__intro { margin: 0; line-height: 1.7; }
.verification__form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3, 12px);
  padding: var(--mases-space-5, 20px);
  border: 1px solid var(--mases-color-border-subtle, #E5E0D2);
  border-radius: var(--mases-radius-md, 8px);
  background: var(--mases-color-surface, #FFFDF7);
}
.verification__label { font-weight: var(--mases-font-weight-semibold, 600); }
.verification__input {
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;
  padding: var(--mases-space-3, 12px);
  border: 1px solid var(--mases-color-border-subtle, #E5E0D2);
  border-radius: var(--mases-radius-sm, 4px);
  background: var(--mases-color-surface, #FFFDF7);
  color: inherit;
  font: inherit;
}
.verification__input:focus-visible,
.verification__submit:focus-visible {
  outline: 3px solid var(--mases-color-focus, #168BFF);
  outline-offset: 2px;
}
.verification__hint,
.verification__validation { margin: 0; font-size: var(--mases-font-size-body-sm, 14px); }
.verification__hint { color: var(--mases-color-text-secondary, #3F382B); }
.verification__validation { color: var(--mases-color-danger, #9B1C1C); }
.verification__submit {
  min-height: 48px;
  padding: var(--mases-space-3, 12px) var(--mases-space-4, 16px);
  border: 0;
  border-radius: var(--mases-radius-md, 8px);
  background: var(--mases-color-action-primary, #123F78);
  color: white;
  font: inherit;
  font-weight: var(--mases-font-weight-semibold, 600);
  cursor: pointer;
}
.verification__submit:disabled { cursor: wait; opacity: .7; }
.verification__result {
  padding: var(--mases-space-5, 20px);
  border: 1px solid var(--mases-color-border-subtle, #E5E0D2);
  border-inline-start-width: 5px;
  border-radius: var(--mases-radius-md, 8px);
}
.verification__result--verified { border-inline-start-color: var(--mases-color-success, #237A45); }
.verification__result--invalid,
.verification__result--revoked { border-inline-start-color: var(--mases-color-danger, #9B1C1C); }
.verification__result--unavailable { border-inline-start-color: var(--mases-color-warning, #B7791F); }
.verification__result-title { margin: 0 0 var(--mases-space-2, 8px); font-size: 1.15rem; }
.verification__result-message { margin: 0; line-height: 1.6; }
.verification__metadata { display: grid; gap: var(--mases-space-3, 12px); margin: var(--mases-space-4, 16px) 0 0; }
.verification__metadata div { display: grid; gap: 4px; }
.verification__metadata dt { color: var(--mases-color-text-secondary, #3F382B); font-size: var(--mases-font-size-body-sm, 14px); }
.verification__metadata dd { margin: 0; overflow-wrap: anywhere; }
.verification__disclaimer { margin: 0; color: var(--mases-color-text-secondary, #3F382B); font-size: var(--mases-font-size-body-sm, 14px); line-height: 1.7; }
@media (max-width: 520px) {
  .verification__form { padding: var(--mases-space-4, 16px); }
}
</style>
