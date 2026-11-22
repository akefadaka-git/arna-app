import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/features/wallet/WalletDetailView.vue', import.meta.url), 'utf8');

test('allocation reversal row actions are gated by wallet.allocation.reverse', () => {
  const start = source.indexOf('<PermissionGate permission="wallet.allocation.reverse">');
  assert.notEqual(start, -1, 'The dedicated permission gate must exist.');
  const end = source.indexOf('</PermissionGate>', start);
  assert.notEqual(end, -1, 'The dedicated permission gate must close.');
  const gatedBlock = source.slice(start, end);
  assert.match(gatedBlock, /<DropdownMenu/);
  assert.match(gatedBlock, /allocationActionsFor\(asAllocation\(row\)\)/);
});
