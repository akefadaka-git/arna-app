<!--
=============================================================================
 MASES Phase 2 UI — ShareholderForm
=============================================================================

 File:      mase_app/src/features/shareholders/ShareholderForm/ShareholderForm.vue
 Layer:     Features (Stage 15 — Shareholder Portal)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE 15
            ShareholderController.php / ShareholderResource.php
              / Shareholder model (verified against source)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The create/edit form for a shareholder. Two modes driven by the route:

   /shareholders/new         → create mode (POST /api/shareholders)
   /shareholders/:id/edit    → edit mode   (PATCH /api/shareholders/:id)

 In edit mode, the form fetches the shareholder on mount, populates the
 fields, and marks the type selector read-only (type is immutable).

 -----------------------------------------------------------------------------
 D11 invariant — see the response preamble
 -----------------------------------------------------------------------------
 individual     →  user_id required; representative_user_id optional
 non-individual →  representative_user_id required; user_id not
                   rendered (must be null)

 The form mirrors the invariant client-side; the backend remains
 authoritative.

 -----------------------------------------------------------------------------
 User-link fields are plain ID inputs — see the response preamble
 -----------------------------------------------------------------------------
 No user-picker exists in the delivered catalog, and no user-list
 endpoint is documented. The form accepts numeric user IDs as text
 inputs. A future CR introduces a UserPicker.

 -----------------------------------------------------------------------------
 FormSection is not used — see the response preamble
 -----------------------------------------------------------------------------
 Plain <section> + <h2> blocks are used instead. A future CR swaps them
 for the composite if its API supports the same structure.

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 Every field is a component-local ref.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */
import type { Shareholder } from '../api';

/**
 * Consumer-supplied, translated labels.
 */
export interface ShareholderFormLabels {
  /* Page header (varies by mode) */
  readonly createTitle: string;
  readonly editTitle: string;
  readonly pageDescription: string;

  /* Section headings */
  readonly sectionTypeStatus: string;
  readonly sectionName: string;
  readonly sectionNameAm: string;
  readonly sectionNameEn: string;
  readonly sectionEntityName: string;
  readonly sectionAccess: string;

  /* Type field */
  readonly typeLabel: string;
  readonly typeIndividual: string;
  readonly typeCompany: string;
  readonly typeTrust: string;
  readonly typeCooperative: string;
  readonly typeGovernment: string;
  readonly typeReligiousBody: string;

  /* Active field */
  readonly activeLabel: string;
  readonly activeHelper: string;

  /* Individual name fields */
  readonly firstNameAmLabel: string;
  readonly fatherNameAmLabel: string;
  readonly grandfatherNameAmLabel: string;
  readonly firstNameEnLabel: string;
  readonly fatherNameEnLabel: string;
  readonly grandfatherNameEnLabel: string;

  /* Entity name fields */
  readonly entityNameAmLabel: string;
  readonly entityNameEnLabel: string;

  /* Access fields */
  readonly userLabel: string;
  readonly userHelper: string;
  readonly representativeLabel: string;
  readonly representativeHelper: string;

  /* Client-side validation messages */
  readonly atLeastOneNameRequired: string;
  readonly representativeRequired: string;
  readonly userRequired: string;

  /* Action buttons */
  readonly submitCreateLabel: string;
  readonly submitEditLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;

  /* Loading / error */
  readonly loadingMessage: string;
  readonly loadErrorMessage: string;
  readonly loadErrorRetryLabel: string;
  readonly notFoundTitle: string;
  readonly notFoundDescription: string;

  /* Banners */
  readonly conflictTitle: string;
  readonly conflictMessage: string;
  readonly networkErrorTitle: string;
  readonly networkErrorMessage: string;
  readonly genericErrorTitle: string;
  readonly genericErrorMessage: string;
  readonly requestIdPrefix: string;
}

export type { Shareholder };
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import Alert from '@/components/composites/Alert';
import FormField from '@/components/composites/FormField';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import BaseSelect from '@/components/primitives/BaseSelect';
import BaseInput from '@/components/primitives/BaseInput';
import BaseCheckbox from '@/components/primitives/BaseCheckbox';
import BaseButton from '@/components/primitives/BaseButton';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import {
  createShareholder,
  getShareholder,
  updateShareholder,
} from '@/features/shareholders/service';
import type {
  StoreShareholderPayload,
  UpdateShareholderPayload,
} from '@/features/shareholders/api';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: ShareholderFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Consumer navigates away (back to detail or to the list). */
  (event: 'cancel'): void;
  /** Consumer reacts to a successful submission (typically navigates to detail). */
  (event: 'submitted', payload: { shareholder: Shareholder }): void;
}>();

// -----------------------------------------------------------------------------
// Route
// -----------------------------------------------------------------------------
const route = useRoute();

const routeId = computed<number | null>(() => {
  const raw = route.params.id;
  const asString = typeof raw === 'string' ? raw : '';
  if (asString === '') return null;
  const parsed = Number.parseInt(asString, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});

const mode = computed<'create' | 'edit'>(() =>
  routeId.value === null ? 'create' : 'edit',
);

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
const type = ref<string>('individual');
const isActive = ref<boolean>(true);

const firstNameAm = ref<string>('');
const firstNameEn = ref<string>('');
const fatherNameAm = ref<string>('');
const fatherNameEn = ref<string>('');
const grandfatherNameAm = ref<string>('');
const grandfatherNameEn = ref<string>('');

const entityNameAm = ref<string>('');
const entityNameEn = ref<string>('');

const userId = ref<string>('');
const representativeUserId = ref<string>('');

// -----------------------------------------------------------------------------
// View state
// -----------------------------------------------------------------------------
type ViewState = 'loading' | 'error' | 'empty' | 'ready';

const isLoading = ref<boolean>(mode.value === 'edit');
const loadError = ref<unknown | null>(null);
const notFound = ref<boolean>(false);

const viewState = computed<ViewState>(() => {
  if (isLoading.value) return 'loading';
  if (notFound.value) return 'empty';
  if (loadError.value !== null) return 'error';
  return 'ready';
});

const isSubmitting = ref<boolean>(false);

interface BannerState {
  readonly variant: 'danger';
  readonly title: string;
  readonly message: string;
  readonly requestId?: string;
}

const banner = ref<BannerState | null>(null);
const serverFieldErrors = ref<Record<string, string[]>>({});

/*
 * Client-side errors (mirroring the D11 invariant and the name rule).
 * Each is a single string set on submit attempt; cleared on the next
 * submission attempt.
 */
const nameRequiredError = ref<string | undefined>(undefined);
const representativeRequiredError = ref<string | undefined>(undefined);
const userRequiredError = ref<string | undefined>(undefined);

// -----------------------------------------------------------------------------
// Derived form state
// -----------------------------------------------------------------------------
const isIndividual = computed<boolean>(() => type.value === 'individual');

/*
 * The type is immutable in edit mode. See the file header comment.
 */
const typeEditable = computed<boolean>(() => mode.value === 'create');

const typeOptions = computed(() => [
  { value: 'individual', label: props.labels.typeIndividual },
  { value: 'company', label: props.labels.typeCompany },
  { value: 'trust', label: props.labels.typeTrust },
  { value: 'cooperative', label: props.labels.typeCooperative },
  { value: 'government', label: props.labels.typeGovernment },
  { value: 'religious_body', label: props.labels.typeReligiousBody },
]);

// -----------------------------------------------------------------------------
// Per-field error getters
// -----------------------------------------------------------------------------
function serverError(field: string): string | undefined {
  return serverFieldErrors.value[field]?.[0];
}

const firstNameAmError = computed<string | undefined>(
  () =>
    (isIndividual.value ? nameRequiredError.value : undefined) ??
    serverError('first_name_am'),
);

const firstNameEnError = computed<string | undefined>(
  () => serverError('first_name_en'),
);
const fatherNameAmError = computed<string | undefined>(
  () => serverError('father_name_am'),
);
const fatherNameEnError = computed<string | undefined>(
  () => serverError('father_name_en'),
);
const grandfatherNameAmError = computed<string | undefined>(
  () => serverError('grandfather_name_am'),
);
const grandfatherNameEnError = computed<string | undefined>(
  () => serverError('grandfather_name_en'),
);

const entityNameAmError = computed<string | undefined>(
  () =>
    (!isIndividual.value ? nameRequiredError.value : undefined) ??
    serverError('entity_name_am'),
);

const entityNameEnError = computed<string | undefined>(
  () => serverError('entity_name_en'),
);

const userError = computed<string | undefined>(
  () =>
    (isIndividual.value ? userRequiredError.value : undefined) ??
    serverError('user_id'),
);

const representativeError = computed<string | undefined>(
  () =>
    (!isIndividual.value ? representativeRequiredError.value : undefined) ??
    serverError('representative_user_id'),
);

// -----------------------------------------------------------------------------
// Load (edit mode only)
// -----------------------------------------------------------------------------
function populateFromShareholder(s: Shareholder): void {
  type.value = s.shareholder_type;
  isActive.value = s.is_active;

  if (s.shareholder_type === 'individual') {
    firstNameAm.value = s.individual_name.first_name_am ?? '';
    firstNameEn.value = s.individual_name.first_name_en ?? '';
    fatherNameAm.value = s.individual_name.father_name_am ?? '';
    fatherNameEn.value = s.individual_name.father_name_en ?? '';
    grandfatherNameAm.value = s.individual_name.grandfather_name_am ?? '';
    grandfatherNameEn.value = s.individual_name.grandfather_name_en ?? '';
  } else {
    entityNameAm.value = s.entity_name.entity_name_am ?? '';
    entityNameEn.value = s.entity_name.entity_name_en ?? '';
  }

  userId.value = s.user_id !== null ? String(s.user_id) : '';
  representativeUserId.value =
    s.representative_user_id !== null ? String(s.representative_user_id) : '';
}

function isNotFoundError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const e = err as {
    category?: unknown;
    httpStatus?: unknown;
    status?: unknown;
  };
  if (e.category === 'not-found') return true;
  if (e.httpStatus === 404 || e.status === 404) return true;
  return false;
}

async function load(): Promise<void> {
  const id = routeId.value;
  if (id === null) {
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  loadError.value = null;
  notFound.value = false;

  try {
    const s = await getShareholder(id);
    populateFromShareholder(s);
  } catch (err) {
    if (isNotFoundError(err)) {
      notFound.value = true;
      loadError.value = null;
    } else {
      loadError.value = err;
      notFound.value = false;
    }
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  if (mode.value === 'edit') {
    void load();
  }
});

// -----------------------------------------------------------------------------
// Submission
// -----------------------------------------------------------------------------
function buildPayload(): StoreShareholderPayload {
  const payload: Record<string, unknown> = {};

  if (mode.value === 'create') {
    payload.shareholder_type = type.value;
  }

  if (isIndividual.value) {
    if (firstNameAm.value !== '') payload.first_name_am = firstNameAm.value;
    if (firstNameEn.value !== '') payload.first_name_en = firstNameEn.value;
    if (fatherNameAm.value !== '') payload.father_name_am = fatherNameAm.value;
    if (fatherNameEn.value !== '') payload.father_name_en = fatherNameEn.value;
    if (grandfatherNameAm.value !== '')
      payload.grandfather_name_am = grandfatherNameAm.value;
    if (grandfatherNameEn.value !== '')
      payload.grandfather_name_en = grandfatherNameEn.value;

    payload.user_id =
      userId.value !== '' ? Number.parseInt(userId.value, 10) : null;
  } else {
    if (entityNameAm.value !== '') payload.entity_name_am = entityNameAm.value;
    if (entityNameEn.value !== '') payload.entity_name_en = entityNameEn.value;

    payload.user_id = null;
  }

  payload.representative_user_id =
    representativeUserId.value !== ''
      ? Number.parseInt(representativeUserId.value, 10)
      : null;

  payload.is_active = isActive.value;

  return payload as unknown as StoreShareholderPayload;
}

async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  banner.value = null;
  serverFieldErrors.value = {};
  nameRequiredError.value = undefined;
  representativeRequiredError.value = undefined;
  userRequiredError.value = undefined;

  // Client-side D11 invariant checks.
  if (isIndividual.value) {
    if (firstNameAm.value.trim() === '' && firstNameEn.value.trim() === '') {
      nameRequiredError.value = props.labels.atLeastOneNameRequired;
    }
    if (userId.value.trim() === '') {
      userRequiredError.value = props.labels.userRequired;
    }
  } else {
    if (entityNameAm.value.trim() === '' && entityNameEn.value.trim() === '') {
      nameRequiredError.value = props.labels.atLeastOneNameRequired;
    }
    if (representativeUserId.value.trim() === '') {
      representativeRequiredError.value = props.labels.representativeRequired;
    }
  }

  if (
    nameRequiredError.value !== undefined ||
    representativeRequiredError.value !== undefined ||
    userRequiredError.value !== undefined
  ) {
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = buildPayload();

    let result: Shareholder;
    if (mode.value === 'create') {
      result = await createShareholder(payload);
    } else {
      const id = routeId.value;
      if (id === null) {
        // Defensive; cannot occur — mode is 'edit' iff routeId is non-null.
        return;
      }
      result = await updateShareholder(id, payload as UpdateShareholderPayload);
    }

    emit('submitted', { shareholder: result });
  } catch (err) {
    handleSubmitError(err);
  } finally {
    isSubmitting.value = false;
  }
}

// -----------------------------------------------------------------------------
// Error handling
// -----------------------------------------------------------------------------
interface NormalizedApiErrorLike {
  readonly category?: unknown;
  readonly code?: unknown;
  readonly message?: unknown;
  readonly requestId?: unknown;
  readonly fieldErrors?: unknown;
}

function isNormalizedApiErrorLike(err: unknown): err is NormalizedApiErrorLike {
  return typeof err === 'object' && err !== null;
}

function setFieldErrorsFromError(err: unknown): boolean {
  if (!isNormalizedApiErrorLike(err)) return false;
  if (err.category !== 'validation') return false;

  const payload = err.fieldErrors;
  if (typeof payload !== 'object' || payload === null) return false;

  const next: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
      next[key] = value as string[];
    }
  }
  serverFieldErrors.value = next;
  return Object.keys(next).length > 0;
}

function handleSubmitError(err: unknown): void {
  // Field-level errors first — a 422 with a `fieldErrors` map is the
  // most specific response and takes precedence over the banner.
  const hasFieldErrors = setFieldErrorsFromError(err);
  if (hasFieldErrors) return;

  if (!isNormalizedApiErrorLike(err)) {
    banner.value = {
      variant: 'danger',
      title: props.labels.genericErrorTitle,
      message: props.labels.genericErrorMessage,
    };
    return;
  }

  const requestId =
    typeof err.requestId === 'string' && err.requestId !== ''
      ? err.requestId
      : undefined;

  if (err.category === 'conflict') {
    banner.value = {
      variant: 'danger',
      title: props.labels.conflictTitle,
      message: props.labels.conflictMessage,
    };
    return;
  }

  if (err.category === 'network') {
    banner.value = {
      variant: 'danger',
      title: props.labels.networkErrorTitle,
      message: props.labels.networkErrorMessage,
    };
    return;
  }

  banner.value = {
    variant: 'danger',
    title: props.labels.genericErrorTitle,
    message: props.labels.genericErrorMessage,
    requestId,
  };
}

// -----------------------------------------------------------------------------
// Cancel
// -----------------------------------------------------------------------------
function onCancel(): void {
  emit('cancel');
}

// -----------------------------------------------------------------------------
// Derived page title / submit label
// -----------------------------------------------------------------------------
const pageTitle = computed<string>(() =>
  mode.value === 'create' ? props.labels.createTitle : props.labels.editTitle,
);

const submitLabel = computed<string>(() => {
  if (isSubmitting.value) return props.labels.submittingLabel;
  return mode.value === 'create'
    ? props.labels.submitCreateLabel
    : props.labels.submitEditLabel;
});
</script>

<template>
  <div
    class="shareholder-form"
    :data-mode="mode"
    :data-state="viewState"
    data-testid="shareholder-form-root"
  >
    <!-- ============================================================
         Loading (edit mode only)
         ============================================================ -->
    <LoadingState
      v-if="viewState === 'loading'"
      :message="labels.loadingMessage"
      data-testid="shareholder-form-loading"
    />

    <!-- ============================================================
         Not found (edit mode only)
         ============================================================ -->
    <EmptyState
      v-else-if="viewState === 'empty'"
      :title="labels.notFoundTitle"
      :description="labels.notFoundDescription"
      data-testid="shareholder-form-not-found"
    />

    <!-- ============================================================
         Load error (edit mode only)
         ============================================================ -->
    <ErrorState
      v-else-if="viewState === 'error'"
      :title="labels.loadErrorMessage"
      :action-label="labels.loadErrorRetryLabel"
      data-testid="shareholder-form-load-error"
      @action="load"
    />

    <!-- ============================================================
         Ready (create mode, or edit mode with a loaded shareholder)
         ============================================================ -->
    <template v-else>
      <PageHeader
        :title="pageTitle"
        :description="labels.pageDescription"
      />

      <Card>
        <form
          class="shareholder-form__form"
          :aria-busy="isSubmitting ? 'true' : undefined"
          @submit.prevent="onSubmit"
        >
          <!-- ====================================================
               Banner
               ==================================================== -->
          <Alert
            v-if="banner"
            :variant="banner.variant"
            :title="banner.title"
            data-testid="shareholder-form-banner"
          >
            <p class="shareholder-form__banner-message">{{ banner.message }}</p>
            <p
              v-if="banner.requestId"
              class="shareholder-form__banner-reference"
            >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
          </Alert>

          <!-- ====================================================
               Section: Type and status
               ==================================================== -->
          <section class="shareholder-form__section">
            <h2 class="shareholder-form__section-title">
              {{ labels.sectionTypeStatus }}
            </h2>

            <FormField
              :label="labels.typeLabel"
              html-for="shareholder-type"
              :disabled="!typeEditable || isSubmitting"
              required
            >
              <BaseSelect
                id="shareholder-type"
                v-model="type"
                :options="typeOptions"
                :disabled="!typeEditable || isSubmitting"
                data-testid="shareholder-form-type"
              />
            </FormField>

            <FormField
              :label="labels.activeLabel"
              html-for="shareholder-active"
              :helper-text="labels.activeHelper"
              :disabled="isSubmitting"
            >
              <BaseCheckbox
                id="shareholder-active"
                v-model="isActive"
                :disabled="isSubmitting"
                data-testid="shareholder-form-active"
              />
            </FormField>
          </section>

          <!-- ====================================================
               Section: Individual name
               ==================================================== -->
          <section
            v-if="isIndividual"
            class="shareholder-form__section"
            data-testid="shareholder-form-individual-name"
          >
            <h2 class="shareholder-form__section-title">
              {{ labels.sectionName }}
            </h2>

            <!-- Amharic block (primary) -->
            <div class="shareholder-form__subsection">
              <h3 class="shareholder-form__subsection-title">
                {{ labels.sectionNameAm }}
              </h3>
              <div class="shareholder-form__subsection-fields">
                <FormField
                  :label="labels.firstNameAmLabel"
                  html-for="shareholder-first-name-am"
                  :error="firstNameAmError"
                  :disabled="isSubmitting"
                  required
                >
                  <BaseInput
                    id="shareholder-first-name-am"
                    v-model="firstNameAm"
                    type="text"
                    autocomplete="given-name"
                    :disabled="isSubmitting"
                    data-testid="shareholder-form-first-name-am"
                  />
                </FormField>

                <FormField
                  :label="labels.fatherNameAmLabel"
                  html-for="shareholder-father-name-am"
                  :error="fatherNameAmError"
                  :disabled="isSubmitting"
                >
                  <BaseInput
                    id="shareholder-father-name-am"
                    v-model="fatherNameAm"
                    type="text"
                    :disabled="isSubmitting"
                    data-testid="shareholder-form-father-name-am"
                  />
                </FormField>

                <FormField
                  :label="labels.grandfatherNameAmLabel"
                  html-for="shareholder-grandfather-name-am"
                  :error="grandfatherNameAmError"
                  :disabled="isSubmitting"
                >
                  <BaseInput
                    id="shareholder-grandfather-name-am"
                    v-model="grandfatherNameAm"
                    type="text"
                    :disabled="isSubmitting"
                    data-testid="shareholder-form-grandfather-name-am"
                  />
                </FormField>
              </div>
            </div>

            <!-- English block (secondary) -->
            <div class="shareholder-form__subsection">
              <h3 class="shareholder-form__subsection-title">
                {{ labels.sectionNameEn }}
              </h3>
              <div class="shareholder-form__subsection-fields">
                <FormField
                  :label="labels.firstNameEnLabel"
                  html-for="shareholder-first-name-en"
                  :error="firstNameEnError"
                  :disabled="isSubmitting"
                >
                  <BaseInput
                    id="shareholder-first-name-en"
                    v-model="firstNameEn"
                    type="text"
                    autocomplete="given-name"
                    :disabled="isSubmitting"
                    data-testid="shareholder-form-first-name-en"
                  />
                </FormField>

                <FormField
                  :label="labels.fatherNameEnLabel"
                  html-for="shareholder-father-name-en"
                  :error="fatherNameEnError"
                  :disabled="isSubmitting"
                >
                  <BaseInput
                    id="shareholder-father-name-en"
                    v-model="fatherNameEn"
                    type="text"
                    :disabled="isSubmitting"
                    data-testid="shareholder-form-father-name-en"
                  />
                </FormField>

                <FormField
                  :label="labels.grandfatherNameEnLabel"
                  html-for="shareholder-grandfather-name-en"
                  :error="grandfatherNameEnError"
                  :disabled="isSubmitting"
                >
                  <BaseInput
                    id="shareholder-grandfather-name-en"
                    v-model="grandfatherNameEn"
                    type="text"
                    :disabled="isSubmitting"
                    data-testid="shareholder-form-grandfather-name-en"
                  />
                </FormField>
              </div>
            </div>
          </section>

          <!-- ====================================================
               Section: Entity name
               ==================================================== -->
          <section
            v-else
            class="shareholder-form__section"
            data-testid="shareholder-form-entity-name"
          >
            <h2 class="shareholder-form__section-title">
              {{ labels.sectionEntityName }}
            </h2>

            <div class="shareholder-form__subsection-fields">
              <FormField
                :label="labels.entityNameAmLabel"
                html-for="shareholder-entity-name-am"
                :error="entityNameAmError"
                :disabled="isSubmitting"
                required
              >
                <BaseInput
                  id="shareholder-entity-name-am"
                  v-model="entityNameAm"
                  type="text"
                  :disabled="isSubmitting"
                  data-testid="shareholder-form-entity-name-am"
                />
              </FormField>

              <FormField
                :label="labels.entityNameEnLabel"
                html-for="shareholder-entity-name-en"
                :error="entityNameEnError"
                :disabled="isSubmitting"
              >
                <BaseInput
                  id="shareholder-entity-name-en"
                  v-model="entityNameEn"
                  type="text"
                  :disabled="isSubmitting"
                  data-testid="shareholder-form-entity-name-en"
                />
              </FormField>
            </div>
          </section>

          <!-- ====================================================
               Section: Access
               ==================================================== -->
          <section class="shareholder-form__section">
            <h2 class="shareholder-form__section-title">
              {{ labels.sectionAccess }}
            </h2>

            <div class="shareholder-form__subsection-fields">
              <!-- User link: only for individuals (D11) -->
              <FormField
                v-if="isIndividual"
                :label="labels.userLabel"
                html-for="shareholder-user"
                :helper-text="labels.userHelper"
                :error="userError"
                :disabled="isSubmitting"
                required
              >
                <BaseInput
                  id="shareholder-user"
                  v-model="userId"
                  type="text"
                  inputmode="numeric"
                  :disabled="isSubmitting"
                  data-testid="shareholder-form-user"
                />
              </FormField>

              <!-- Representative link: always shown; required for non-individuals -->
              <FormField
                :label="labels.representativeLabel"
                html-for="shareholder-representative"
                :helper-text="labels.representativeHelper"
                :error="representativeError"
                :disabled="isSubmitting"
                :required="!isIndividual"
              >
                <BaseInput
                  id="shareholder-representative"
                  v-model="representativeUserId"
                  type="text"
                  inputmode="numeric"
                  :disabled="isSubmitting"
                  data-testid="shareholder-form-representative"
                />
              </FormField>
            </div>
          </section>

          <!-- ====================================================
               Actions
               ==================================================== -->
          <div class="shareholder-form__actions">
            <BaseButton
              type="button"
              variant="secondary"
              :disabled="isSubmitting"
              data-testid="shareholder-form-cancel"
              @click="onCancel"
            >{{ labels.cancelLabel }}</BaseButton>

            <PrimaryButton
              type="submit"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              data-testid="shareholder-form-submit"
            >{{ submitLabel }}</PrimaryButton>
          </div>
        </form>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.shareholder-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Form
   ============================================================================ */
.shareholder-form__form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

.shareholder-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.shareholder-form__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Sections
   ============================================================================ */
.shareholder-form__section {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-4);
  padding-block-end: var(--mases-space-4);
  border-block-end: 1px solid var(--mases-color-border-subtle);
}

.shareholder-form__section:last-of-type {
  padding-block-end: 0;
  border-block-end: 0;
}

.shareholder-form__section-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-6);
  line-height: var(--mases-line-height-heading-6);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Subsections (Amharic block, English block, entity name)
   ============================================================================ */
.shareholder-form__subsection {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
}

.shareholder-form__subsection-title {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

.shareholder-form__subsection-fields {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-4);
}

/* ============================================================================
   Actions
   ============================================================================ */
.shareholder-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

/* ============================================================================
   Mobile (<640px)
   ---------------------------------------------------------------------------
   Actions stack so the two buttons are comfortable tap targets.
   ============================================================================ */
@media (max-width: 639px) {
  .shareholder-form__actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .shareholder-form {
    /* no-op placeholder */
  }
}
</style>