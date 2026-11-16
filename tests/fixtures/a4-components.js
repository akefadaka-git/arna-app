import { createApp, h, ref } from 'vue';
import { createPinia } from 'pinia';
import { createMemoryHistory, createRouter, RouterView } from 'vue-router';
import { useLocaleStore } from '../../src/stores/locale';
import AppHeaderNavigation from '../../src/layouts/AppShell/AppHeaderNavigation/AppHeaderNavigation.vue';
import NotificationsCenter from '../../src/features/notifications/NotificationsCenter.vue';
import Combobox from '../../src/components/composites/Combobox/Combobox.vue';
import Modal from '../../src/components/composites/Modal/Modal.vue';
import Drawer from '../../src/components/composites/Drawer/Drawer.vue';
import FormField from '../../src/components/composites/FormField/FormField.vue';
import ErrorSupportPanel from '../../src/components/composites/ErrorSupportPanel/ErrorSupportPanel.vue';
import DataTable from '../../src/components/patterns/DataTable/DataTable.vue';
import BaseButton from '../../src/components/primitives/BaseButton/BaseButton.vue';
import BaseInput from '../../src/components/primitives/BaseInput/BaseInput.vue';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'a4-home', component: { render: () => h('div', 'A4 home') } },
    { path: '/files', name: 'a4-files', component: { render: () => h('div', { 'data-testid': 'a4-files-route' }, 'Files route') } },
    { path: '/shareholders', name: 'a4-shareholders', component: { render: () => h('div', { 'data-testid': 'a4-shareholders-route' }, 'Shareholders route') } },
  ],
});

const app = createApp({
  setup() {
    const localeStore = useLocaleStore();
    const selected = ref(null);
    const modalOpen = ref(false);
    const drawerOpen = ref(false);
    const notificationsOpen = ref(false);
    const modalCloseEvents = ref(0);
    const drawerCloseEvents = ref(0);
    const tableSelectedKeys = ref([]);
    const tableSort = ref({ key: 'name', dir: 'asc' });
    const tableRowClicks = ref(0);
    const baseButtonLoading = ref(false);
    const baseButtonClicks = ref(0);
    const baseInputValue = ref('Initial value');
    const baseInputDate = ref('2026-11-16');
    const baseInputRef = ref(null);
    const baseInputEventCounts = ref({ focus: 0, blur: 0, enter: 0 });
    const tableRows = [
      { id: 'row-1', name: 'Alpha account', status: 'Active' },
      { id: 'row-2', name: 'Beta account', status: 'Pending' },
    ];
    const tableColumns = [
      { key: 'name', label: 'Account name', sortable: true, priority: 'high' },
      { key: 'status', label: 'Status', priority: 'medium' },
    ];
    const tableSelectionLabels = {
      selectAll: 'Select all accounts',
      selectRow: (row) => `Select ${row.name}`,
    };
    const supportLabels = {
      toggle: 'Technical details',
      errorCode: 'Error code',
      requestId: 'Request reference',
      timestamp: 'Timestamp',
      occurredAt: 'Local time',
      copy: 'Copy support information',
      copied: 'Copied',
      copyFallbackInstruction: 'Select and copy the text below.',
    };
    const options = [
      { value: 'alpha', label: 'Alpha' },
      { value: 'blocked', label: 'Unavailable', disabled: true },
      { value: 'beta', label: 'Beta' },
      { value: 'gamma', label: 'Gamma' },
    ];

    return () => h('main', { style: 'padding: 2rem; display: grid; gap: 2rem; max-width: 42rem;' }, [
      h('section', { 'aria-label': 'Header navigation search test' }, [
        h(AppHeaderNavigation, {
          items: [
            { id: 'files', label: 'ፋይሎች', to: '/files' },
            { id: 'shareholders', label: 'ባለአክሲዮኖች', to: '/shareholders' },
          ],
        }),
        h('button', {
          type: 'button',
          'data-testid': 'set-locale-en',
          style: 'min-height: 44px;',
          onClick: () => { localeStore.setLocale('en'); document.documentElement.lang = 'en'; },
        }, 'Set English'),
        h('button', {
          type: 'button',
          'data-testid': 'set-locale-am',
          style: 'min-height: 44px;',
          onClick: () => { localeStore.setLocale('am'); document.documentElement.lang = 'am'; },
        }, 'Set Amharic'),
      ]),
      h(RouterView),
      h('section', { 'aria-label': 'BaseInput enhancement test', 'data-testid': 'base-input-section' }, [
        h('label', { for: 'base-input-primary' }, 'BaseInput primary field'),
        h(BaseInput, {
          ref: baseInputRef,
          id: 'base-input-primary',
          modelValue: baseInputValue.value,
          ariaDescribedBy: 'base-input-help',
          onUpdate:modelValue: (value) => { baseInputValue.value = value; },
          onFocus: () => { baseInputEventCounts.value.focus += 1; },
          onBlur: () => { baseInputEventCounts.value.blur += 1; },
          onEnter: () => { baseInputEventCounts.value.enter += 1; },
          'data-testid': 'base-input-primary-root',
        }, {
          prefix: () => h('span', 'Br'),
          leading: () => h('span', 'Leading icon'),
          trailing: () => h('span', 'Trailing icon'),
          suffix: () => h('span', 'kg'),
        }),
        h('p', { id: 'base-input-help' }, 'Enter the account value.'),
        h('output', { 'data-testid': 'base-input-value' }, baseInputValue.value),
        h('output', { 'data-testid': 'base-input-events' }, JSON.stringify(baseInputEventCounts.value)),
        h('button', { type: 'button', 'data-testid': 'base-input-focus', onClick: () => baseInputRef.value?.focus() }, 'Focus BaseInput'),
        h('label', { for: 'base-input-date' }, 'Occurrence date'),
        h(BaseInput, {
          id: 'base-input-date',
          type: 'date',
          modelValue: baseInputDate.value,
          onUpdate:modelValue: (value) => { baseInputDate.value = value; },
        }),
        h('label', { for: 'base-input-invalid' }, 'Explicitly valid override'),
        h(BaseInput, { id: 'base-input-invalid', invalid: true, ariaInvalid: false, required: true }),
        h('label', { for: 'base-input-disabled' }, 'Disabled field'),
        h(BaseInput, { id: 'base-input-disabled', disabled: true }),
      ]),
      h('section', { 'aria-label': 'BaseButton enhancement test' }, [
        h('button', { type: 'button', 'data-testid': 'base-button-focus-sentinel' }, 'Focus sentinel'),
        h(BaseButton, {
          variant: 'primary',
          size: 'md',
          loading: baseButtonLoading.value,
          onClick: () => { baseButtonClicks.value += 1; },
          'data-testid': 'enhanced-base-button',
        }, { default: () => 'የአርና መድረክ አስተዳደር እና የባለአክሲዮኖች የፋይናንስ አገልግሎት መቆጣጠሪያ አዝራር' }),
        h('button', {
          type: 'button',
          'data-testid': 'toggle-base-button-loading',
          onClick: () => { baseButtonLoading.value = !baseButtonLoading.value; },
        }, 'Toggle button loading'),
        h(BaseButton, {
          variant: 'secondary',
          size: 'md',
          iconOnly: true,
          ariaLabel: 'More actions',
          'data-testid': 'enhanced-base-button-icon-only',
        }, { default: () => '⋯' }),
        h('output', { 'data-testid': 'enhanced-base-button-clicks' }, String(baseButtonClicks.value)),
      ]),
      h('section', { 'aria-label': 'Notifications center test' }, [
        h('button', { type: 'button', 'data-testid': 'open-notifications', onClick: () => { notificationsOpen.value = true; } }, 'Open notifications'),
        h(NotificationsCenter, {
          open: notificationsOpen.value,
          onClose: () => { notificationsOpen.value = false; },
        }),
      ]),
      h('section', { 'aria-label': 'Error support panel test' }, [
        h(ErrorSupportPanel, {
          code: 'AUTH_PERMISSION_DENIED',
          requestId: 'req-12345',
          timestamp: '2026-11-15T12:00:00Z',
          occurredAt: '15/11/2019 15:00 E.C.',
          labels: supportLabels,
        }),
      ]),
      h('section', { 'aria-label': 'FormField test' }, [
        h(FormField, {
          label: 'Account reference',
          htmlFor: 'a4-form-field-input',
        }, {
          default: ({ id, 'aria-describedby': describedBy, invalid, required, disabled }) => h('input', {
            id,
            'aria-describedby': describedBy,
            'aria-invalid': invalid ? 'true' : undefined,
            required,
            disabled,
            'data-testid': 'form-field-control',
            style: 'min-height: 44px; width: 100%;',
          }),
          help: () => h('span', { 'data-testid': 'form-field-help-slot' }, 'Enter the account reference.'),
        }),
      ]),
      h('section', { 'aria-label': 'Combobox test' }, [
        h('h1', 'Combobox browser test'),
        h(Combobox, {
          modelValue: selected.value,
          options,
          ariaLabel: 'Choose an item',
          placeholder: 'Choose an item',
          'onUpdate:modelValue': (value) => { selected.value = value; },
        }),
        h('output', { 'data-testid': 'combobox-selected', 'aria-live': 'polite' }, String(selected.value ?? 'none')),
        h('button', { type: 'button', 'data-testid': 'after-combobox' }, 'After combobox'),
      ]),
      h('section', { 'aria-label': 'DataTable test' }, [
        h(DataTable, {
          columns: tableColumns,
          rows: tableRows,
          rowKey: (row) => row.id,
          selectable: true,
          selectedKeys: tableSelectedKeys.value,
          selectionLabels: tableSelectionLabels,
          sortKey: tableSort.value.key,
          sortDir: tableSort.value.dir,
          'onUpdate:selectedKeys': (keys) => { tableSelectedKeys.value = keys; },
          'onUpdate:sort': (sort) => { tableSort.value = sort; },
          onRowClick: () => { tableRowClicks.value += 1; },
        }, {
          'row-actions': ({ row }) => h('button', { type: 'button', 'aria-label': `Open ${row.name}`, 'data-testid': `table-action-${row.id}` }, 'Open'),
        }),
        h('output', { 'data-testid': 'table-selected-keys' }, tableSelectedKeys.value.join(',')),
        h('output', { 'data-testid': 'table-sort' }, `${tableSort.value.key}:${tableSort.value.dir}`),
        h('output', { 'data-testid': 'table-row-clicks' }, String(tableRowClicks.value)),
      ]),
      h('section', { 'aria-label': 'Modal test' }, [
        h('button', { type: 'button', 'data-testid': 'open-modal', onClick: () => { modalOpen.value = true; } }, 'Open modal'),
        h(Modal, {
          open: modalOpen.value,
          title: 'A4 modal title',
          closeLabel: 'Close modal',
          'onUpdate:open': (value) => { modalOpen.value = value; },
          onClose: () => { modalCloseEvents.value += 1; },
        }, { default: () => h('button', { type: 'button', 'data-testid': 'modal-inside' }, 'Modal content') }),
        h('output', { 'data-testid': 'modal-close-events' }, String(modalCloseEvents.value)),
      ]),
      h('section', { 'aria-label': 'Drawer test' }, [
        h('button', { type: 'button', 'data-testid': 'open-drawer', onClick: () => { drawerOpen.value = true; } }, 'Open drawer'),
        h(Drawer, {
          open: drawerOpen.value,
          title: 'A4 drawer title',
          closeLabel: 'Close drawer',
          'onUpdate:open': (value) => { drawerOpen.value = value; },
          onClose: () => { drawerCloseEvents.value += 1; },
        }, { default: () => h('button', { type: 'button', 'data-testid': 'drawer-inside' }, 'Drawer content') }),
        h('output', { 'data-testid': 'drawer-close-events' }, String(drawerCloseEvents.value)),
      ]),
    ]);
  },
});
app.use(createPinia());
app.use(router);
app.mount('#app');
