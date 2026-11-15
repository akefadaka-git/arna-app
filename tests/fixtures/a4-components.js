import { createApp, h, ref } from 'vue';
import Combobox from '../../src/components/composites/Combobox/Combobox.vue';
import Modal from '../../src/components/composites/Modal/Modal.vue';
import Drawer from '../../src/components/composites/Drawer/Drawer.vue';
import FormField from '../../src/components/composites/FormField/FormField.vue';

createApp({
  setup() {
    const selected = ref(null);
    const modalOpen = ref(false);
    const drawerOpen = ref(false);
    const modalCloseEvents = ref(0);
    const drawerCloseEvents = ref(0);
    const options = [
      { value: 'alpha', label: 'Alpha' },
      { value: 'blocked', label: 'Unavailable', disabled: true },
      { value: 'beta', label: 'Beta' },
      { value: 'gamma', label: 'Gamma' },
    ];

    return () => h('main', { style: 'padding: 2rem; display: grid; gap: 2rem; max-width: 42rem;' }, [
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
}).mount('#app');
