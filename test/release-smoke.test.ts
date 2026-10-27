import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/commerceguard.js', import.meta.url));
const fixtures = fileURLToPath(new URL('../examples/cases.json', import.meta.url));

test('release smoke: executable verifies all documented examples', () => {
  const result = spawnSync(process.execPath, [cli, fixtures], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.total, 4);
  assert.equal(report.passed, 4);
  assert.equal(report.failed, 0);
});
