import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from '../src/cli.ts';
test('CLI case evaluator produces structured results', () => {
  const result = evaluate([{ name: 'fee', kind: 'commission', amountMinor: 10000, basisPoints: 1000, expectedMinor: 1000 }]);
  assert.equal(result[0].passed, true);
});
test('CLI evaluator reports failed expectations', () => {
  const result = evaluate([{ name: 'fee', kind: 'commission', amountMinor: 10000, basisPoints: 1000, expectedMinor: 0 }]);
  assert.equal(result[0].passed, false);
});
