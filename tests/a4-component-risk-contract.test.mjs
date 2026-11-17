import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('Combobox declares and wires the keyboard and ARIA contract', () => {
  const source = read('src/components/composites/Combobox/Combobox.vue');
  for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Escape', 'Tab']) {
    assert.ok(source.includes(`case '${key}'`), `Combobox must handle ${key}`);
  }
  assert.match(source, /@keydown="onKeydown"/);
  assert.match(source, /role="combobox"/);
  assert.match(source, /role="listbox"/);
  assert.match(source, /role="option"/);
  assert.match(source, /aria-activedescendant/);
  assert.match(source, /option\.disabled/);
  assert.match(source, /update:modelValue/);
  assert.match(source, /search', query: string/);
});

test('FileUploader preserves the upload boundary and abort lifecycle', () => {
  const source = read('src/components/patterns/FileUploader/FileUploader.vue');
  assert.match(source, /upload: UploadFn/);
  assert.match(source, /signal: AbortSignal/);
  assert.match(source, /new AbortController\(\)/);
  assert.match(source, /controller\.abort\(\)/);
  assert.match(source, /onBeforeUnmount\(\(\) =>/);
  assert.match(source, /@reject-file="onInputReject"/);
  assert.match(source, /items\.value\.find\(\(queued\) => queued\.localId === item\.localId\)/);
  assert.match(source, /abortControllers\.clear\(\)/);
  for (const event of ['uploaded', 'failed', 'removed', 'completed', 'rejected']) {
    assert.match(source, new RegExp(`event: '${event}'`), `missing ${event} event`);
  }
  for (const reason of ['size', 'type', 'count']) {
    assert.match(source, new RegExp(`reason: '${reason}'`), `missing ${reason} rejection`);
  }
  assert.match(source, /server/);
});

test('PermissionGate is a presentation gate backed by the auth permission set', () => {
  const source = read('src/components/patterns/PermissionGate/PermissionGate.vue');
  assert.match(source, /Conditional rendering based on the authenticated user's permissions/);
  assert.match(source, /authStore\.permissions/);
  assert.match(source, /const isAuthorized = computed<boolean>/);
  assert.match(source, /required\.length === 0/);
  assert.match(source, /<slot v-if="isAuthorized"/);
  assert.match(source, /name="fallback"/);
});

test('Modal and Drawer expose the optional close-label risk explicitly', () => {
  for (const path of [
    'src/components/composites/Modal/Modal.vue',
    'src/components/composites/Drawer/Drawer.vue',
  ]) {
    const source = read(path);
    assert.match(source, /closeLabel\?: string/);
    assert.match(source, /:aria-label="closeLabel \?\? ''"/);
    assert.match(source, /data-testid="(?:modal|drawer)-close"/);
    assert.match(source, /update:open/);
    assert.match(source, /event: 'close'/);
  }
});

test('inspected Modal consumers pass dedicated close labels', () => {
  const consumers = [
    'src/features/loans/LoanRejectForm.vue',
    'src/features/loans/LoanApproveForm.vue',
    'src/features/wallet/WalletOpenForm.vue',
    'src/features/loans/LoanDisburseForm.vue',
    'src/features/loans/LoanWriteOffForm.vue',
    'src/features/wallet/WalletAdjustForm.vue',
    'src/features/wallet/WalletPaymentForm.vue',
    'src/features/loans/LoanRepaymentForm.vue',
    'src/features/loans/LoanCollateralForm.vue',
    'src/features/loans/LoanRestructureForm.vue',
    'src/features/loans/LoanApplicationForm.vue',
    'src/features/wallet/WalletObligationForm.vue',
    'src/features/wallet/WalletAllocationForm.vue',
    'src/features/loans/LoanCollateralReleaseForm.vue',
    'src/features/wallet/WalletAllocationReverseDialog.vue',
    'src/features/shareholders/HoldingEntryForm/HoldingEntryForm.vue',
    'src/features/shareholders/CertificateIssueForm/CertificateIssueForm.vue',
    'src/features/shareholders/CertificateCancelDialog/CertificateCancelDialog.vue',
    'src/features/files/FilesListView/FilesListView.vue',
  ];
  for (const path of consumers) {
    const source = read(path);
    assert.match(source, /<Modal[\s\S]*?:close-label="labels\./, `${path} must bind translated close label`);
  }
  for (const path of [
    'src/features/wallet/labels.ts',
    'src/features/loans/labels.ts',
    'src/features/shareholders/labels.ts',
    'src/features/files/labels.ts',
  ]) {
    assert.match(read(path), /closeLabel|uploadModalCloseLabel/);
  }
});


test('all SearchBar consumers provide a translated clear-button accessible name', () => {
  const component = read('src/components/composites/SearchBar/SearchBar.vue');
  assert.match(component, /clearLabel: string;/);
  assert.doesNotMatch(component, /clearLabel\?: string/);

  const consumers = [
    ['src/features/files/FilesListView/FilesListView.vue', 'files-list-view-search'],
    ['src/features/wallet/WalletListView.vue', 'wallet-list-view-search'],
    ['src/features/shareholders/ShareholderListView/ShareholderListView.vue', 'shareholder-list-view-search'],
  ];
  for (const [path, testId] of consumers) {
    const source = read(path);
    assert.match(source, new RegExp(`<SearchBar[\\s\\S]*?:clear-label="labels\\.searchClearLabel"[\\s\\S]*?data-testid="${testId}"`), `${path} must bind SearchBar clearLabel`);
  }

  const labelSources = [
    'src/features/files/labels.ts',
    'src/features/wallet/labels.ts',
    'src/features/shareholders/labels.ts',
  ];
  for (const path of labelSources) {
    const source = read(path);
    const match = source.match(/searchClearLabel:\s*'([^']+)'/);
    assert.ok(match, `${path} must provide a search clear label`);
    assert.equal(match[1], 'የፍለጋ ጽሑፉን አጽዳ', `${path} must use the approved Amharic clear label`);
  }
});


test('AppHeaderNavigation search chrome follows the active Amharic or English locale', () => {
  const source = read('src/layouts/AppShell/AppHeaderNavigation/AppHeaderNavigation.vue');
  assert.match(source, /useLocaleStore/);
  assert.match(source, /localeStore\.locale === 'en'/);
  assert.match(source, /function displayLabel\(item: SearchNavItem\): string/);
  for (const label of ['Dashboard', 'Documents', 'Shareholders', 'Wallets', 'Loans', 'Governance']) {
    assert.ok(source.includes(`'${label}'`), `missing English destination label: ${label}`);
  }
  assert.match(source, /displayLabel\(item\)\.toLocaleLowerCase\(\)\.includes\(term\)/);
  for (const label of [
    'Search ARNA',
    'Find an available module or page',
    'Close search',
    'Search modules and pages…',
    'No matching modules or pages',
    'ARNA ይፈልጉ',
    'የሚገኝ ሞጁል ወይም ገጽ ያግኙ',
    'ፍለጋን ዝጋ',
    'የሚዛመድ ሞጁል ወይም ገጽ አልተገኘም',
  ]) {
    assert.ok(source.includes(label), `missing localized search label: ${label}`);
  }
  assert.doesNotMatch(source, /aria-label="Search ARNA modules and pages"|>Search ARNA<|>No matching modules or pages</);
});

test('checkbox and Combobox pointer targets meet the compact-control minimum', () => {
  const checkbox = read('src/components/primitives/BaseCheckbox/BaseCheckbox.vue');
  assert.match(checkbox, /min-width:\s*24px/);
  assert.match(checkbox, /min-height:\s*24px/);
  const combobox = read('src/components/composites/Combobox/Combobox.vue');
  assert.match(combobox, /\.combobox__option\s*\{[^}]*min-height:\s*32px/s);
});
