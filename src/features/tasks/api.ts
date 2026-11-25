import { api } from '@/core/api/client';

export type TaskScope = 'personal' | 'corporate';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface TaskEthiopianDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly iso: string;
  readonly formatted_am: string;
  readonly formatted_en: string;
}

export interface TaskRecord {
  readonly id: string;
  readonly tenant_id: number;
  readonly task_scope: TaskScope;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly due_on: string | null;
  readonly due_on_ec: TaskEthiopianDate | null;
  readonly progress_percent: number;
  readonly created_by: number;
  readonly assigned_to_user_id: number | null;
  readonly updated_by: number | null;
  readonly completed_at: string | null;
  readonly version: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface TaskPage {
  readonly data: readonly TaskRecord[];
  readonly current_page: number;
  readonly last_page: number;
  readonly per_page: number;
  readonly total: number;
}

export interface TaskListFilters {
  readonly status?: TaskStatus;
  readonly task_scope?: TaskScope;
  readonly page?: number;
}

export interface CreateTaskPayload {
  readonly task_scope: TaskScope;
  readonly title: string;
  readonly description?: string | null;
  readonly priority: TaskPriority;
  readonly assigned_to_user_id: number;
  readonly due_on_ec?: { readonly year: number; readonly month: number; readonly day: number };
}

export interface UpdateTaskPayload {
  readonly version: number;
  readonly status?: TaskStatus;
  readonly progress_percent?: number;
}

export async function listTasks(filters: TaskListFilters = {}): Promise<TaskPage> {
  const response = await api.getWithMeta<TaskPage>('/api/tasks', { params: filters });
  return response.data;
}

export function createTask(payload: CreateTaskPayload): Promise<TaskRecord> {
  return api.post<TaskRecord>('/api/tasks', payload);
}

export function updateTask(id: string, payload: UpdateTaskPayload): Promise<TaskRecord> {
  return api.patch<TaskRecord>(`/api/tasks/${encodeURIComponent(id)}`, payload);
}
