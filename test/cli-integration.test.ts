import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const entry = fileURLToPath(new URL('../src/cli.ts', import.meta.url));
function invoke(value: unknown, output = false) {
  const dir = mkdtempSync(join(tmpdir(), 'commerceguard-'));
  try {
    const input = join(dir, 'cases.json');
    const report = join(dir, 'report.json');
    writeFileSync(input, JSON.stringify(value));
    const args = ['--experimental-strip-types', entry, input];
    if (output) args.push('--output', report);
    const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
    return { status: result.status, stderr: result.stderr, stdout: result.stdout, report: output && result.status !== 2 ? JSON.parse(readFileSync(report, 'utf8')) : null };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
test('CLI writes a successful JSON report', () => {
  const r = invoke([{ name: 'commission', kind: 'commission', amountMinor: 10000, basisPoints: 1000, expectedMinor: 1000 }], true);
  assert.equal(r.status, 0);
  assert.equal(r.report.passed, 1);
  assert.equal(r.report.failed, 0);
});
test('CLI exits 1 on assertion mismatch', () => {
  const r = invoke([{ name: 'commission', kind: 'commission', amountMinor: 10000, basisPoints: 1000, expectedMinor: 1 }]);
  assert.equal(r.status, 1);
  assert.equal(JSON.parse(r.stdout).failed, 1);
});
test('CLI exits 2 on invalid idempotency expectation lengths', () => {
  const r = invoke([{ name: 'bad replay', kind: 'idempotency', keys: ['x', 'x'], expectedAccepted: [true] }]);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /Invalid case schema/);
});
test('CLI exits 2 on invalid command-line arguments', () => {
  const r = spawnSync(process.execPath, ['--experimental-strip-types', entry], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /Usage/);
});
test('CLI rejects more than 1000 cases', () => {
  const r = invoke(Array.from({ length: 1001 }, (_, i) => ({ name: 'case' + i, kind: 'transition', from: 'PENDING', to: 'PAID', expected: true })));
  assert.equal(r.status, 2);
});

test('CLI verifies a balanced reconciliation fixture', () => {
  const r = invoke([{ name: 'settlement', kind: 'reconciliation', entries: [
    { id: 'charge-1', kind: 'charge', amountMinor: 10000 },
    { id: 'refund-1', kind: 'refund', amountMinor: 2500 }
  ], actualNetMinor: 7500, expectedMatched: true, expectedDifferenceMinor: 0 }]);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).passed, 1);
});
test('CLI reports reconciliation mismatch as a failed expectation', () => {
  const r = invoke([{ name: 'settlement', kind: 'reconciliation', entries: [
    { id: 'charge-1', kind: 'charge', amountMinor: 10000 }
  ], actualNetMinor: 9900, expectedMatched: true, expectedDifferenceMinor: 0 }]);
  assert.equal(r.status, 1);
  assert.equal(JSON.parse(r.stdout).failed, 1);
});
test('CLI rejects malformed reconciliation fixture', () => {
  const r = invoke([{ name: 'bad', kind: 'reconciliation', entries: [
    { id: 'charge-1', kind: 'charge', amountMinor: -5 }
  ], actualNetMinor: 0, expectedMatched: true, expectedDifferenceMinor: 0 }]);
  assert.equal(r.status, 2);
});
