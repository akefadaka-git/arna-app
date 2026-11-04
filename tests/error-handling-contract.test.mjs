import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const client = readFileSync('src/core/api/client.ts', 'utf8');

test('normalized API errors preserve governed severity and retryability metadata', () => {
  assert.match(client, /readonly severity:/);
  assert.match(client, /readonly retryable:/);
  assert.match(client, /severity: errorBlock\?\.severity/);
  assert.match(client, /retryable: errorBlock\?\.retryable/);
});

test('error normalization retains cancellation as a non-retryable normal-flow event', () => {
  assert.match(client, /code: 'REQUEST_CANCELLED'/);
  assert.match(client, /cancelled: true/);
});

test('frontend contract does not require raw exception details for user messaging', () => {
  const contract = readFileSync('docs/ARNA-ERROR-HANDLING-CONTRACT.md', 'utf8');
  assert.match(contract, /Never display raw stack traces, SQL, tokens, or server exception messages/);
  assert.match(contract, /requestId/);
});
