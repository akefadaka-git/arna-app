import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

const consumers = [
  'src/features/wallet/WalletOpenForm.vue',
  'src/features/wallet/WalletAllocationForm.vue',
  'src/features/wallet/WalletPaymentForm.vue',
  'src/features/wallet/WalletAdjustForm.vue',
  'src/features/loans/LoanApplicationForm.vue',
  'src/features/loans/LoanCollateralForm.vue',
  'src/features/loans/LoanProductListView.vue',
  'src/features/shareholders/CertificateIssueForm/CertificateIssueForm.vue',
  'src/features/shareholders/HoldingEntryForm/HoldingEntryForm.vue',
];

function assertUniqueNativeValues(options) {
  const values = options.map((option) => String(option.value));
  assert.equal(new Set(values).size, values.length, 'BaseSelect option values must be unique after DOM string serialization');
}

test('BaseSelect preserves its frozen native-select API and lifecycle contract', () => {
  const source = read('src/components/primitives/BaseSelect/BaseSelect.vue');
  for (const prop of ['modelValue', 'options', 'name', 'id', 'placeholder', 'disabled', 'required', 'invalid', 'ariaInvalid', 'ariaDescribedBy', 'ariaLabel', 'ariaLabelledBy']) {
    assert.match(source, new RegExp('\\b' + prop + '\\??\\s*:'), 'missing prop ' + prop);
  }
  for (const event of ['update:modelValue', 'change', 'blur', 'focus']) {
    assert.ok(source.includes("event: '" + event + "'"), 'missing ' + event + ' event');
  }
  assert.match(source, /defineExpose\(\{ focus, blur, el \}\)/);
  assert.match(source, /<select[\s\S]*?v-bind="\$attrs"/);
  assert.match(source, /data-testid="base-select-control"/);
  assert.match(source, /:key="option\.value"/);
  assert.match(source, /value=""/);
  assert.match(source, /disabled[\s\S]*?hidden/);
});

test('BaseSelect rejects duplicate values after native DOM string serialization', () => {
  const source = read('src/components/primitives/BaseSelect/BaseSelect.vue');
  assert.match(source, /function validateOptionValues/);
  assert.match(source, /new Set<string>\(\)/);
  assert.match(source, /String\(option\.value\)/);
  assert.match(source, /option values must be unique after DOM string serialization/);
  assert.match(source, /watch\(\(\) => props\.options, validateOptionValues/);

  assertUniqueNativeValues([{ value: 1 }, { value: '2' }, { value: 'three' }]);
  assert.throws(
    () => assertUniqueNativeValues([{ value: 1 }, { value: '1' }]),
    /unique after DOM string serialization/,
    'numeric 1 and string "1" must be treated as a duplicate',
  );
});

test('FormField exposes the accessibility and state contract required by BaseSelect', () => {
  const source = read('src/components/composites/FormField/FormField.vue');
  for (const key of ['id: string', "'aria-describedby': string | undefined", 'invalid: boolean', 'required: boolean', 'disabled: boolean']) {
    assert.ok(source.includes(key), 'FormField scoped slot is missing ' + key);
  }
  assert.match(source, /:id="htmlFor"/);
  assert.match(source, /:invalid="resolvedInvalid"/);
  assert.match(source, /:required="required"/);
  assert.match(source, /:disabled="disabled"/);
  assert.match(source, /v-bind="\{ 'aria-describedby': ariaDescribedBy \}"/);
});

test('all nine approved FormField consumers bind all five scoped BaseSelect properties', () => {
  let total = 0;
  for (const path of consumers) {
    const source = read(path);
    const blocks = [...source.matchAll(/<FormField\b([\s\S]*?)>([\s\S]*?)<\/FormField>/g)]
      .filter((match) => /<BaseSelect\b/.test(match[2]));
    assert.ok(blocks.length > 0, path + ' must contain its reconciled BaseSelect controls');
    for (const [, openAttrs, body] of blocks) {
      total += (body.match(/<BaseSelect\b/g) ?? []).length;
      assert.match(openAttrs, /v-slot="\{ id: fieldId/);
      for (const binding of [':id="fieldId"', ':aria-describedby="describedBy"', ':invalid="fieldInvalid"', ':required="fieldRequired"', ':disabled="fieldDisabled']) {
        assert.ok(body.includes(binding), path + ' is missing ' + binding);
      }
    }
  }
  assert.equal(total, 14, 'the nine files must cover all 14 reconciled FormField-wrapped selects');
});

test('BaseSelect barrel version matches the normative component version', () => {
  const source = read('src/components/primitives/BaseSelect/index.ts');
  assert.match(source, /Version:\s+1\.1\.0/);
});
