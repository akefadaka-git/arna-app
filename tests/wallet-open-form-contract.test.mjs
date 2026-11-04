import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { compileScript, parse } from '@vue/compiler-sfc';

const source = await readFile(
  new URL('../src/features/wallet/WalletListView.vue', import.meta.url),
  'utf8',
);

const { descriptor, errors } = parse(source, {
  filename: 'src/features/wallet/WalletListView.vue',
});

test('wallet list composes the existing wallet opening form', () => {
  assert.deepEqual(errors, []);

  const compiled = compileScript(descriptor, {
    id: 'wallet-list-view-contract',
  }).content;

  assert.match(compiled, /WalletOpenForm/);
  assert.match(compiled, /walletOpenFormLabels/);
  assert.match(compiled, /isOpenFormOpen\.value = true/);
  assert.match(compiled, /function onWalletOpened\(/);
  assert.doesNotMatch(compiled, /Until WF-7 lands/);

  assert.match(
    descriptor.template?.content ?? '',
    /v-model:open="isOpenFormOpen"/,
  );
  assert.match(
    descriptor.template?.content ?? '',
    /@submitted="onWalletOpened"/,
  );
});
