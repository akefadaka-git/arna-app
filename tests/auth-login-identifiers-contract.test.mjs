import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const labels = readFileSync(new URL('../src/router/auth-labels.ts', import.meta.url), 'utf8');
const form = readFileSync(new URL('../src/features/auth/LoginForm/LoginForm.vue', import.meta.url), 'utf8');
const recoveryForm = readFileSync(new URL('../src/features/auth/ForgotPasswordForm/ForgotPasswordForm.vue', import.meta.url), 'utf8');
const legacyResetForm = readFileSync(new URL('../src/features/auth/ResetPasswordForm/ResetPasswordForm.vue', import.meta.url), 'utf8');

test('login copy identifies the field as a neutral ARNA account identifier', () => {
  assert.match(labels, /emailLabel:\s*'የመግቢያ መለያ \/ Sign-in identifier'/);
  assert.match(labels, /identifierHelpText:/);
  assert.match(labels, /employee ID/);
  assert.match(labels, /shareholder number/);
  assert.match(labels, /wallet number/);
});

test('login contract documents all six supported ARNA identifiers', () => {
  for (const identifier of ['email', 'username', 'mobile number', 'employee ID', 'shareholder number', 'wallet number']) {
    assert.ok(form.includes(identifier), `missing identifier contract: ${identifier}`);
  }
});

test('login identifier input uses text input mode for numeric and alphanumeric identifiers', () => {
  const identifierId = form.indexOf('id="login-identifier"');
  const inputStart = identifierId >= 0 ? form.lastIndexOf('<BaseInput', identifierId) : -1;
  const inputEnd = form.indexOf('/>', identifierId);
  const identifierField = inputStart >= 0 && inputEnd > inputStart
    ? form.slice(inputStart, inputEnd)
    : '';
  assert.ok(identifierField, 'login identifier BaseInput must exist');
  assert.match(identifierField, /inputmode="text"/);
  assert.match(identifierField, /autocomplete="username"/);
});

test('returning-user login exposes OTP and Google Authenticator options', () => {
  assert.match(form, /login-otp-channel/);
  assert.match(form, /login-otp-code/);
  assert.match(form, /login-form-mfa/);
  assert.match(labels, /otpChannelLabel:/);
  assert.match(labels, /mfaInstructions:/);
});

test('password recovery uses OTP or Google Authenticator and never legacy reset tokens', () => {
  assert.match(recoveryForm, /forgot-password-use-otp/);
  assert.match(recoveryForm, /forgot-password-use-google-authenticator/);
  assert.match(recoveryForm, /forgot-password-code/);
  assert.match(recoveryForm, /forgot-password-new-password/);
  const legacyScript = legacyResetForm.slice(legacyResetForm.lastIndexOf('<script setup'));
  assert.match(legacyScript, /Legacy reset links are no longer accepted/);
  assert.doesNotMatch(legacyScript, /token:\\s*routeToken\\.value/);
});
