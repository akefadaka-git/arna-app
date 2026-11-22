import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const labels = readFileSync(new URL('../src/router/auth-labels.ts', import.meta.url), 'utf8');
const form = readFileSync(new URL('../src/features/auth/LoginForm/LoginForm.vue', import.meta.url), 'utf8');

test('login copy identifies the field as a neutral ARNA account identifier', () => {
  assert.match(labels, /emailLabel:\s*'የARNA መለያ'/);
  assert.match(labels, /የARNA መለያ ወይም የይለፍ ቃል/);
});

test('login contract documents all six supported ARNA identifiers', () => {
  for (const identifier of ['email', 'username', 'mobile number', 'employee ID', 'shareholder number', 'wallet number']) {
    assert.ok(form.includes(identifier), `missing identifier contract: ${identifier}`);
  }
});

test('login identifier input uses text input mode for numeric and alphanumeric identifiers', () => {
  const inputStart = form.indexOf('<BaseInput\\n        id="login-identifier"');
  const inputEnd = form.indexOf('/>', inputStart);
  const identifierField = inputStart >= 0 && inputEnd > inputStart
    ? form.slice(inputStart, inputEnd)
    : '';
  assert.ok(identifierField, 'login identifier BaseInput must exist');
  assert.match(identifierField, /inputmode="text"/);
  assert.match(identifierField, /autocomplete="username"/);
});
