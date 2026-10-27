import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileLedger } from '../src/reconciliation.ts';

test('matches a balanced charge and refund ledger', () => {
  assert.deepEqual(reconcileLedger([
    { id: 'payment-1', kind: 'charge', amountMinor: 10_000 },
    { id: 'refund-1', kind: 'refund', amountMinor: 2_500 }
  ], 7_500), { expectedNetMinor: 7_500, actualNetMinor: 7_500, differenceMinor: 0, matched: true });
});
test('reports a settlement discrepancy with sign', () => {
  const result = reconcileLedger([{ id: 'payment-1', kind: 'charge', amountMinor: 10_000 }], 9_900);
  assert.equal(result.matched, false);
  assert.equal(result.differenceMinor, -100);
});
test('rejects duplicate ledger entry ids', () => {
  assert.throws(() => reconcileLedger([
    { id: 'x', kind: 'charge', amountMinor: 100 },
    { id: 'x', kind: 'refund', amountMinor: 20 }
  ], 80), RangeError);
});
test('rejects malformed amounts and entry kinds', () => {
  assert.throws(() => reconcileLedger([{ id: 'x', kind: 'charge', amountMinor: -1 }], 0), RangeError);
  assert.throws(() => reconcileLedger([{ id: 'x', kind: 'charge', amountMinor: 1.5 }], 0), RangeError);
  assert.throws(() => reconcileLedger([{ id: 'x', kind: 'other' as 'charge', amountMinor: 1 }], 0), RangeError);
  assert.throws(() => reconcileLedger([], Number.MAX_SAFE_INTEGER + 1), RangeError);
});
test('rejects sums that exceed safe integer bounds', () => {
  assert.throws(() => reconcileLedger([
    { id: 'a', kind: 'charge', amountMinor: Number.MAX_SAFE_INTEGER },
    { id: 'b', kind: 'charge', amountMinor: 1 }
  ], 0), RangeError);
});
test('accepts empty ledger against zero settlement', () => {
  assert.equal(reconcileLedger([], 0).matched, true);
});
