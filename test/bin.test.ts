import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const bin = fileURLToPath(new URL('../bin/commerceguard.js', import.meta.url));
const example = fileURLToPath(new URL('../examples/cases.json', import.meta.url));

test('CLI executable runs example fixture successfully', () => {
  const result = spawnSync(process.execPath, [bin, example], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.failed, 0);
  assert.equal(report.passed, 3);
});
test('CLI executable returns usage error for no args', () => {
  const result = spawnSync(process.execPath, [bin], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Usage/);
});
