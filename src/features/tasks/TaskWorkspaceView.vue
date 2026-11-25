<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useLocaleStore } from '@/stores/locale';
import type { TaskPriority, TaskRecord, TaskScope, TaskStatus } from './api';
import { createTask, listTasks, updateTask } from './api';
import type { CreateTaskPayload } from './api';
import type { TaskWorkspaceLabels } from './labels';
import { taskWorkspaceEnglishLabels } from './labels';

interface Props {
  labels: TaskWorkspaceLabels;
}

const props = defineProps<Props>();
const auth = useAuthStore();
const locale = useLocaleStore();
const labels = computed(() => locale.locale === 'en' ? taskWorkspaceEnglishLabels : props.labels);
const tasks = ref<readonly TaskRecord[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const notice = ref('');
const statusFilter = ref<'all' | TaskStatus>('all');
const scopeFilter = ref<'all' | TaskScope>('all');
const currentPage = ref(1);
const lastPage = ref(1);
const total = ref(0);
const showComposer = ref(false);
const title = ref('');
const description = ref('');
const priority = ref<TaskPriority>('normal');
const taskScope = ref<TaskScope>('personal');
const assigneeId = ref(String(auth.userId ?? ''));
const dueYear = ref('');
const dueMonth = ref('');
const dueDay = ref('');
const progressDrafts = reactive<Record<string, number>>({});
const canCreate = computed(() => auth.permissions.includes('task.create'));
const canUpdate = computed(() => auth.permissions.includes('task.update'));
const canAssign = computed(() => auth.permissions.includes('task.assign'));

const statusOptions = computed(() => [
  { value: 'todo', label: labels.value.statusTodo },
  { value: 'in_progress', label: labels.value.statusInProgress },
  { value: 'blocked', label: labels.value.statusBlocked },
  { value: 'completed', label: labels.value.statusCompleted },
  { value: 'cancelled', label: labels.value.statusCancelled },
] as const);

function statusLabel(status: TaskStatus): string {
  return statusOptions.value.find((item) => item.value === status)?.label ?? status;
}

function priorityLabel(value: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    low: labels.value.priorityLow,
    normal: labels.value.priorityNormal,
    high: labels.value.priorityHigh,
    urgent: labels.value.priorityUrgent,
  };
  return map[value];
}

function canManage(task: TaskRecord): boolean {
  return task.created_by === auth.userId || canAssign.value;
}

function canChangeProgress(task: TaskRecord): boolean {
  if (!canUpdate.value || task.status === 'cancelled') return false;
  if (task.status === 'completed') return canManage(task);
  return canManage(task) || task.assigned_to_user_id === auth.userId;
}

async function load(page = currentPage.value): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await listTasks({
      ...(statusFilter.value === 'all' ? {} : { status: statusFilter.value }),
      ...(scopeFilter.value === 'all' ? {} : { task_scope: scopeFilter.value }),
      page,
    });
    tasks.value = result.data;
    currentPage.value = result.current_page;
    lastPage.value = result.last_page;
    total.value = result.total;
    for (const task of result.data) {
      progressDrafts[task.id] = task.progress_percent;
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

watch([statusFilter, scopeFilter], () => {
  currentPage.value = 1;
  void load(1);
});

function dueDatePayload(): CreateTaskPayload['due_on_ec'] | undefined {
  const parts = [dueYear.value, dueMonth.value, dueDay.value];
  if (parts.every((part) => part.trim() === '')) return undefined;
  if (parts.some((part) => part.trim() === '')) {
    throw new Error(labels.value.dueDateHint);
  }
  const [year, month, day] = parts.map(Number);
  if (![year, month, day].every(Number.isInteger) || year < 1 || month < 1 || month > 13 || day < 1 || day > 30) {
    throw new Error(labels.value.dueDateHint);
  }
  return { year, month, day };
}

async function submitTask(): Promise<void> {
  error.value = '';
  notice.value = '';
  if (!title.value.trim()) {
    error.value = labels.value.titleRequired;
    return;
  }
  const assignedTo = Number(assigneeId.value || auth.userId);
  if (!Number.isInteger(assignedTo) || assignedTo < 1) {
    error.value = labels.value.corporateAssignmentHint;
    return;
  }

  let due_on_ec: CreateTaskPayload['due_on_ec'];
  try {
    due_on_ec = dueDatePayload();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    return;
  }

  const payload: CreateTaskPayload = {
    task_scope: taskScope.value,
    title: title.value.trim(),
    description: description.value.trim() || null,
    priority: priority.value,
    assigned_to_user_id: taskScope.value === 'personal' ? (auth.userId ?? assignedTo) : assignedTo,
    ...(due_on_ec ? { due_on_ec } : {}),
  };

  saving.value = true;
  try {
    await createTask(payload);
    title.value = '';
    description.value = '';
    priority.value = 'normal';
    taskScope.value = 'personal';
    assigneeId.value = String(auth.userId ?? '');
    dueYear.value = '';
    dueMonth.value = '';
    dueDay.value = '';
    showComposer.value = false;
    notice.value = labels.value.created;
    await load(1);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}

async function changeStatus(task: TaskRecord, event: Event): Promise<void> {
  const nextStatus = (event.target as HTMLSelectElement).value as TaskStatus;
  if (nextStatus === task.status) return;
  await saveTaskUpdate(task, { status: nextStatus });
}

function changeProgress(id: string, event: Event): void {
  const value = Number((event.target as HTMLInputElement).value);
  progressDrafts[id] = Number.isFinite(value) ? Math.max(0, Math.min(99, Math.round(value))) : 0;
}

async function saveProgress(task: TaskRecord): Promise<void> {
  const progress = progressDrafts[task.id] ?? task.progress_percent;
  if (progress === task.progress_percent) return;
  await saveTaskUpdate(task, { progress_percent: progress });
}

async function saveTaskUpdate(task: TaskRecord, change: { status?: TaskStatus; progress_percent?: number }): Promise<void> {
  error.value = '';
  notice.value = '';
  saving.value = true;
  try {
    await updateTask(task.id, { version: task.version, ...change });
    notice.value = labels.value.saved;
    await load(currentPage.value);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    await load(currentPage.value);
  } finally {
    saving.value = false;
  }
}

function priorityClass(value: TaskPriority): string {
  return `task-workspace__priority--${value}`;
}

onMounted(() => {
  void load(1);
});
</script>

<template>
  <main class="task-workspace" aria-labelledby="task-workspace-title">
    <header class="task-workspace__header">
      <div>
        <p class="task-workspace__eyebrow">D08 · Task &amp; Work Management</p>
        <h1 id="task-workspace-title">{{ labels.pageTitle }}</h1>
        <p class="task-workspace__description">{{ labels.pageDescription }}</p>
      </div>
      <button v-if="canCreate" data-testid="task-create-toggle" class="task-workspace__primary" type="button" @click="showComposer = !showComposer">
        {{ showComposer ? labels.cancel : labels.createTask }}
      </button>
    </header>

    <section v-if="showComposer && canCreate" class="task-workspace__composer" aria-label="New task">
      <form data-testid="task-create-form" class="task-workspace__form" @submit.prevent="submitTask">
        <label class="task-workspace__field task-workspace__field--wide">
          <span>{{ labels.title }}</span>
          <input v-model="title" data-testid="task-title-input" maxlength="240" required autocomplete="off" />
        </label>
        <label class="task-workspace__field task-workspace__field--wide">
          <span>{{ labels.description }}</span>
          <textarea v-model="description" rows="3" maxlength="20000" />
        </label>
        <label class="task-workspace__field">
          <span>{{ labels.scope }}</span>
          <select v-model="taskScope">
            <option value="personal">{{ labels.personal }}</option>
            <option value="corporate">{{ labels.corporate }}</option>
          </select>
        </label>
        <label class="task-workspace__field">
          <span>{{ labels.priority }}</span>
          <select v-model="priority">
            <option value="low">{{ labels.priorityLow }}</option>
            <option value="normal">{{ labels.priorityNormal }}</option>
            <option value="high">{{ labels.priorityHigh }}</option>
            <option value="urgent">{{ labels.priorityUrgent }}</option>
          </select>
        </label>
        <label v-if="taskScope === 'corporate' && canAssign" class="task-workspace__field">
          <span>{{ labels.assigneeId }}</span>
          <input v-model="assigneeId" inputmode="numeric" pattern="[0-9]+" />
        </label>
        <p v-if="taskScope === 'corporate'" class="task-workspace__hint">{{ labels.corporateAssignmentHint }}</p>
        <fieldset class="task-workspace__date">
          <legend>{{ labels.dueDate }}</legend>
          <label><span>{{ labels.dueYear }}</span><input v-model="dueYear" inputmode="numeric" type="number" min="1" max="9999" /></label>
          <label><span>{{ labels.dueMonth }}</span><input v-model="dueMonth" inputmode="numeric" type="number" min="1" max="13" /></label>
          <label><span>{{ labels.dueDay }}</span><input v-model="dueDay" inputmode="numeric" type="number" min="1" max="30" /></label>
          <small>{{ labels.dueDateHint }}</small>
        </fieldset>
        <div class="task-workspace__form-actions">
          <button data-testid="task-submit" class="task-workspace__primary" type="submit" :disabled="saving">{{ saving ? labels.loading : labels.save }}</button>
          <button class="task-workspace__secondary" type="button" @click="showComposer = false">{{ labels.cancel }}</button>
        </div>
      </form>
    </section>

    <p v-if="error" class="task-workspace__message task-workspace__message--error" role="alert">{{ error }}</p>
    <p v-if="notice" class="task-workspace__message task-workspace__message--success" role="status">{{ notice }}</p>

    <section class="task-workspace__filters" :aria-label="labels.filters">
      <label class="task-workspace__field">
        <span>{{ labels.status }}</span>
        <select v-model="statusFilter">
          <option value="all">{{ labels.allStatuses }}</option>
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
      <label class="task-workspace__field">
        <span>{{ labels.scope }}</span>
        <select v-model="scopeFilter">
          <option value="all">{{ labels.allScopes }}</option>
          <option value="personal">{{ labels.personal }}</option>
          <option value="corporate">{{ labels.corporate }}</option>
        </select>
      </label>
      <p class="task-workspace__count"><strong>{{ total }}</strong> {{ labels.taskCount }}</p>
    </section>

    <div v-if="loading" class="task-workspace__state" role="status">{{ labels.loading }}</div>
    <section v-else-if="tasks.length === 0" class="task-workspace__empty">
      <h2>{{ labels.emptyTitle }}</h2>
      <p>{{ labels.emptyDescription }}</p>
    </section>

    <section v-else data-testid="task-list" class="task-workspace__list" aria-label="Tasks">
      <article v-for="task in tasks" :key="task.id" data-testid="task-card" class="task-workspace__card">
        <div class="task-workspace__card-top">
          <div>
            <div class="task-workspace__meta">
              <span class="task-workspace__scope">{{ task.task_scope === 'personal' ? labels.personal : labels.corporate }}</span>
              <span class="task-workspace__priority" :class="priorityClass(task.priority)">{{ priorityLabel(task.priority) }}</span>
            </div>
            <h2>{{ task.title }}</h2>
            <p v-if="task.description" class="task-workspace__task-description">{{ task.description }}</p>
          </div>
          <span class="task-workspace__due">{{ task.due_on_ec?.formatted_am ?? labels.noDueDate }}</span>
        </div>
        <div class="task-workspace__card-bottom">
          <label class="task-workspace__field task-workspace__status">
            <span>{{ labels.status }}</span>
            <select data-testid="task-status" :value="task.status" :disabled="!canChangeProgress(task) || saving" @change="changeStatus(task, $event)">
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
          <div v-if="canChangeProgress(task)" class="task-workspace__progress">
            <label :for="`task-progress-${task.id}`">{{ labels.progress }}</label>
            <input :id="`task-progress-${task.id}`" data-testid="task-progress" type="range" min="0" max="99" step="1" :value="progressDrafts[task.id] ?? task.progress_percent" @input="changeProgress(task.id, $event)" />
            <output>{{ progressDrafts[task.id] ?? task.progress_percent }}%</output>
            <button data-testid="task-progress-save" class="task-workspace__secondary task-workspace__save-progress" type="button" :disabled="saving || (progressDrafts[task.id] ?? task.progress_percent) === task.progress_percent" @click="saveProgress(task)">{{ labels.save }}</button>
          </div>
          <p v-else class="task-workspace__read-only">{{ task.progress_percent }}% · {{ statusLabel(task.status) }}</p>
        </div>
        <footer class="task-workspace__card-footer">
          <span>{{ labels.assignee }}: #{{ task.assigned_to_user_id ?? '—' }}</span>
          <span>{{ labels.creator }}: #{{ task.created_by }}</span>
        </footer>
      </article>
    </section>

    <nav v-if="lastPage > 1" class="task-workspace__pagination" aria-label="Task pages">
      <button class="task-workspace__secondary" type="button" :disabled="currentPage <= 1 || loading" @click="load(currentPage - 1)">{{ labels.previous }}</button>
      <span>{{ currentPage }} / {{ lastPage }}</span>
      <button class="task-workspace__secondary" type="button" :disabled="currentPage >= lastPage || loading" @click="load(currentPage + 1)">{{ labels.next }}</button>
    </nav>
  </main>
</template>

<style scoped>
.task-workspace {
  display: flex;
  flex-direction: column;
  gap: var(--arna-space-5);
  min-width: 0;
  color: var(--arna-color-text-primary);
}
.task-workspace__header,
.task-workspace__card-top,
.task-workspace__card-bottom,
.task-workspace__card-footer,
.task-workspace__filters,
.task-workspace__form-actions,
.task-workspace__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--arna-space-3);
}
.task-workspace__header {
  align-items: flex-start;
  flex-wrap: wrap;
}
.task-workspace__eyebrow {
  margin: 0 0 var(--arna-space-1);
  color: var(--arna-color-text-secondary);
  font-size: var(--arna-font-size-caption);
  font-weight: var(--arna-font-weight-semibold);
  letter-spacing: .04em;
}
.task-workspace h1 {
  margin: 0;
  font-size: var(--arna-font-size-heading-2);
}
.task-workspace__description,
.task-workspace__task-description {
  color: var(--arna-color-text-secondary);
  margin: var(--arna-space-2) 0 0;
}
.task-workspace__primary,
.task-workspace__secondary {
  min-height: 2.5rem;
  padding: var(--arna-space-2) var(--arna-space-4);
  border: 1px solid var(--arna-color-border-default);
  border-radius: var(--arna-radius-md);
  font: inherit;
  font-weight: var(--arna-font-weight-semibold);
  cursor: pointer;
}
.task-workspace__primary {
  color: var(--arna-color-text-inverse);
  background: var(--arna-color-action-primary);
  border-color: var(--arna-color-action-primary);
}
.task-workspace__secondary {
  color: var(--arna-color-text-primary);
  background: var(--arna-color-surface-raised);
}
.task-workspace button:disabled {
  opacity: .55;
  cursor: not-allowed;
}
.task-workspace__composer,
.task-workspace__card,
.task-workspace__empty,
.task-workspace__state {
  padding: var(--arna-space-4);
  border: 1px solid var(--arna-color-border-default);
  border-radius: var(--arna-radius-lg);
  background: var(--arna-color-surface-raised);
}
.task-workspace__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--arna-space-4);
}
.task-workspace__field {
  display: flex;
  flex-direction: column;
  gap: var(--arna-space-1);
  min-width: 0;
  font-size: var(--arna-font-size-body-sm);
  font-weight: var(--arna-font-weight-medium);
}
.task-workspace__field input,
.task-workspace__field select,
.task-workspace__field textarea,
.task-workspace__date input {
  width: 100%;
  min-height: 2.5rem;
  padding: var(--arna-space-2) var(--arna-space-3);
  color: var(--arna-color-text-primary);
  background: var(--arna-color-surface-page);
  border: 1px solid var(--arna-color-border-default);
  border-radius: var(--arna-radius-md);
  font: inherit;
}
.task-workspace__field--wide,
.task-workspace__date,
.task-workspace__hint,
.task-workspace__form-actions {
  grid-column: 1 / -1;
}
.task-workspace__date {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--arna-space-3);
  border: 1px solid var(--arna-color-border-default);
  border-radius: var(--arna-radius-md);
  padding: var(--arna-space-3);
}
.task-workspace__date legend {
  padding-inline: var(--arna-space-2);
  font-weight: var(--arna-font-weight-semibold);
}
.task-workspace__date label {
  display: grid;
  gap: var(--arna-space-1);
  font-size: var(--arna-font-size-sm);
}
.task-workspace__date small,
.task-workspace__hint {
  color: var(--arna-color-text-secondary);
}
.task-workspace__filters {
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: var(--arna-space-3);
  border: 1px solid var(--arna-color-border-default);
  border-radius: var(--arna-radius-lg);
  background: var(--arna-color-surface-raised);
}
.task-workspace__filters .task-workspace__field {
  min-width: 12rem;
}
.task-workspace__count {
  margin-inline-start: auto;
  color: var(--arna-color-text-secondary);
}
.task-workspace__list {
  display: grid;
  gap: var(--arna-space-3);
}
.task-workspace__card {
  display: flex;
  flex-direction: column;
  gap: var(--arna-space-3);
}
.task-workspace__card-top {
  align-items: flex-start;
}
.task-workspace__card h2 {
  margin: var(--arna-space-2) 0 0;
  font-size: var(--arna-font-size-heading-5);
}
.task-workspace__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--arna-space-2);
}
.task-workspace__scope,
.task-workspace__priority {
  display: inline-flex;
  padding: var(--arna-space-1) var(--arna-space-2);
  border-radius: var(--arna-radius-full);
  background: var(--arna-color-surface-subtle);
  font-size: var(--arna-font-size-xs);
}
.task-workspace__priority--urgent,
.task-workspace__priority--high {
  color: var(--arna-color-text-danger);
}
.task-workspace__due {
  color: var(--arna-color-text-secondary);
  font-size: var(--arna-font-size-sm);
  white-space: nowrap;
}
.task-workspace__card-bottom {
  justify-content: flex-start;
  flex-wrap: wrap;
}
.task-workspace__status {
  min-width: 12rem;
}
.task-workspace__progress {
  display: flex;
  align-items: center;
  gap: var(--arna-space-2);
  flex: 1;
  min-width: 15rem;
  font-size: var(--arna-font-size-sm);
}
.task-workspace__progress input {
  flex: 1;
  min-width: 4rem;
}
.task-workspace__progress output {
  min-width: 3rem;
  text-align: end;
  font-variant-numeric: tabular-nums;
}
.task-workspace__save-progress {
  min-height: 2rem;
  padding: var(--arna-space-1) var(--arna-space-2);
}
.task-workspace__read-only {
  color: var(--arna-color-text-secondary);
}
.task-workspace__card-footer {
  justify-content: flex-start;
  flex-wrap: wrap;
  padding-top: var(--arna-space-2);
  border-top: 1px solid var(--arna-color-border-subtle);
  color: var(--arna-color-text-secondary);
  font-size: var(--arna-font-size-xs);
}
.task-workspace__empty,
.task-workspace__state {
  text-align: center;
}
.task-workspace__empty h2 {
  margin-top: 0;
}
.task-workspace__message {
  padding: var(--arna-space-3);
  border-radius: var(--arna-radius-md);
}
.task-workspace__message--error {
  color: var(--arna-color-text-danger);
  background: var(--arna-color-surface-danger);
}
.task-workspace__message--success {
  color: var(--arna-color-text-success);
  background: var(--arna-color-surface-success);
}
.task-workspace__pagination {
  justify-content: center;
}
@media (max-width: 640px) {
  .task-workspace__form {
    grid-template-columns: minmax(0, 1fr);
  }
  .task-workspace__field--wide,
  .task-workspace__date,
  .task-workspace__hint,
  .task-workspace__form-actions {
    grid-column: auto;
  }
  .task-workspace__card-top,
  .task-workspace__card-bottom {
    align-items: stretch;
    flex-direction: column;
  }
  .task-workspace__due {
    white-space: normal;
  }
}
</style>
