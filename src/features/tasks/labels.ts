export interface TaskWorkspaceLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;
  readonly createTask: string;
  readonly title: string;
  readonly description: string;
  readonly priority: string;
  readonly scope: string;
  readonly personal: string;
  readonly corporate: string;
  readonly assigneeId: string;
  readonly dueDate: string;
  readonly dueYear: string;
  readonly dueMonth: string;
  readonly dueDay: string;
  readonly save: string;
  readonly cancel: string;
  readonly status: string;
  readonly progress: string;
  readonly filters: string;
  readonly allStatuses: string;
  readonly allScopes: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly loading: string;
  readonly retry: string;
  readonly previous: string;
  readonly next: string;
  readonly taskCount: string;
  readonly noDueDate: string;
  readonly created: string;
  readonly saved: string;
  readonly statusTodo: string;
  readonly statusInProgress: string;
  readonly statusBlocked: string;
  readonly statusCompleted: string;
  readonly statusCancelled: string;
  readonly priorityLow: string;
  readonly priorityNormal: string;
  readonly priorityHigh: string;
  readonly priorityUrgent: string;
  readonly creator: string;
  readonly assignee: string;
  readonly corporateAssignmentHint: string;
  readonly dueDateHint: string;
  readonly titleRequired: string;
}

export const taskWorkspaceLabels: TaskWorkspaceLabels = {
  pageTitle: 'ተግባሮች እና የሥራ ዝርዝር',
  pageDescription: 'የግል እና የድርጅት ተግባሮችን፣ ቀነ ገደቦችን እና እድገትን ያስተዳድሩ።',
  createTask: 'አዲስ ተግባር',
  title: 'የተግባር ርዕስ',
  description: 'መግለጫ',
  priority: 'ቅድሚያ',
  scope: 'የተግባር ወሰን',
  personal: 'የግል',
  corporate: 'የድርጅት',
  assigneeId: 'የተመደበለት ተጠቃሚ መለያ',
  dueDate: 'የመጨረሻ ቀን (ዓ.ም.)',
  dueYear: 'ዓመት',
  dueMonth: 'ወር',
  dueDay: 'ቀን',
  save: 'አስቀምጥ',
  cancel: 'ሰርዝ',
  status: 'ሁኔታ',
  progress: 'እድገት (%)',
  filters: 'ማጣሪያዎች',
  allStatuses: 'ሁሉም ሁኔታዎች',
  allScopes: 'ሁሉም ወሰኖች',
  emptyTitle: 'ምንም ተግባር የለም',
  emptyDescription: 'አዲስ ተግባር ይፍጠሩ ወይም ማጣሪያዎችን ይቀይሩ።',
  loading: 'ተግባሮች በመጫን ላይ…',
  retry: 'እንደገና ይሞክሩ',
  previous: 'ቀዳሚ',
  next: 'ቀጣይ',
  taskCount: 'ተግባሮች',
  noDueDate: 'ቀነ ገደብ አልተወሰነም',
  created: 'ተፈጥሯል',
  saved: 'ተቀምጧል።',
  statusTodo: 'ያልተጀመረ',
  statusInProgress: 'በሂደት ላይ',
  statusBlocked: 'ታግዷል',
  statusCompleted: 'ተጠናቋል',
  statusCancelled: 'ተሰርዟል',
  priorityLow: 'ዝቅተኛ',
  priorityNormal: 'መደበኛ',
  priorityHigh: 'ከፍተኛ',
  priorityUrgent: 'አስቸኳይ',
  creator: 'ፈጣሪ',
  assignee: 'ተመድቦለታል',
  corporateAssignmentHint: 'የድርጅት ተግባር ንቁ የተቋም አባል መለያ ይፈልጋል።',
  dueDateHint: 'የኢትዮጵያ ዓ.ም. ቀን ያስገቡ።',
  titleRequired: 'የተግባር ርዕስ ያስፈልጋል።',
};

export const taskWorkspaceEnglishLabels: TaskWorkspaceLabels = {
  pageTitle: 'Tasks & To-Do',
  pageDescription: 'Manage personal and corporate tasks, deadlines and progress.',
  createTask: 'New task',
  title: 'Task title',
  description: 'Description',
  priority: 'Priority',
  scope: 'Task scope',
  personal: 'Personal',
  corporate: 'Corporate',
  assigneeId: 'Assignee user ID',
  dueDate: 'Due date (E.C.)',
  dueYear: 'Year',
  dueMonth: 'Month',
  dueDay: 'Day',
  save: 'Save',
  cancel: 'Cancel',
  status: 'Status',
  progress: 'Progress (%)',
  filters: 'Filters',
  allStatuses: 'All statuses',
  allScopes: 'All scopes',
  emptyTitle: 'No tasks found',
  emptyDescription: 'Create a task or adjust the filters.',
  loading: 'Loading tasks…',
  retry: 'Retry',
  previous: 'Previous',
  next: 'Next',
  taskCount: 'Tasks',
  noDueDate: 'No due date',
  created: 'Created',
  saved: 'Saved.',
  statusTodo: 'To do',
  statusInProgress: 'In progress',
  statusBlocked: 'Blocked',
  statusCompleted: 'Completed',
  statusCancelled: 'Cancelled',
  priorityLow: 'Low',
  priorityNormal: 'Normal',
  priorityHigh: 'High',
  priorityUrgent: 'Urgent',
  creator: 'Creator',
  assignee: 'Assignee',
  corporateAssignmentHint: 'Corporate tasks require an active member ID in this tenant.',
  dueDateHint: 'Enter an Ethiopian Calendar date.',
  titleRequired: 'A task title is required.',
};
