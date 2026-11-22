import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflow = await readFile(
  new URL('../.github/workflows/owner-governed-branch-lifecycle.yml', import.meta.url),
  'utf8',
);

test('branch lifecycle is manual-dispatch-only and Owner-gated', () => {
  assert.match(workflow, /^on:\n  workflow_dispatch:/m);
  assert.doesNotMatch(workflow, /^  (?:push|pull_request):/m);
  assert.match(workflow, /if: github\.actor == 'akefadaka-git'/);
});

test('GitHub Actions expressions are valid and interpolated', () => {
  assert.match(workflow, /\$\{\{\s*github\.token\s*\}\}/);
  assert.match(workflow, /\$\{\{\s*github\.repository\s*\}\}/);
  assert.match(workflow, /\$\{\{\s*inputs\.operation\s*\}\}/);
  assert.doesNotMatch(workflow, /\$\{\s*(?:github|inputs|steps)\./);
});

test('merge preflight requires exact heads, base, approval, clean threads and passing checks', () => {
  assert.match(workflow, /EXPECTED_HEAD/);
  assert.match(workflow, /EXPECTED_BASE/);
  assert.match(workflow, /reviewDecision/);
  assert.match(workflow, /isResolved/);
  assert.match(workflow, /gh pr checks/);
  assert.match(workflow, /delete_branch_on_merge/);
});

test('source ref is retained until exact merge-SHA post-merge tests pass', () => {
  assert.match(workflow, /gh workflow run/);
  assert.match(workflow, /target_sha=/);
  assert.match(workflow, /MERGE_SHA/);
  assert.match(workflow, /gh api --method DELETE/);
  assert.match(workflow, /STATUS.*404/);
});
