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

const errorRoute = readFileSync('src/router/pages/ErrorRoute.vue', 'utf8');
const errorLabels = readFileSync('src/router/error-labels.ts', 'utf8');
const baseRoutes = readFileSync('src/router/routes-base.ts', 'utf8');
const accessDeniedPage = readFileSync('src/components/patterns/AccessDeniedPage/AccessDeniedPage.vue', 'utf8');

test('shared error pages provide back, home, report, contact, and safe retry actions', () => {
  assert.match(errorRoute, /function onBack\(\): void/);
  assert.match(errorRoute, /window\.history\.state\?\.back/);
  assert.match(errorRoute, /router\.push\('\/launcher'\)/);
  assert.match(errorRoute, /errorCommonActionLabels\.report/);
  assert.match(errorRoute, /errorCommonActionLabels\.contact/);
  assert.match(errorRoute, /window\.location\.reload\(\)/);
  assert.match(errorRoute, /mailto:\$\{SUPPORT_EMAIL\}/);
  assert.match(errorRoute, /No password, token, stack trace, or private form data is included/);
});

test('shared error routes include 403, 404, 500, and 503 presentations', () => {
  assert.match(accessDeniedPage, /:status="403"/);
  assert.match(errorRoute, /:status="404"/);
  assert.match(errorRoute, /:status="500"/);
  assert.match(errorRoute, /:status="503"/);
  assert.match(baseRoutes, /path: '\/server-error'/);
  assert.match(errorLabels, /errorServerTitle/);
});
