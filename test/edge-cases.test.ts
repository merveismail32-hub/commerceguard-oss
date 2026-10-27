import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCommission, canTransition, InMemoryIdempotencyGuard } from '../src/index.ts';

test('commission is exact for large safe integers', () => {
  assert.equal(calculateCommission(Number.MAX_SAFE_INTEGER, 10000), Number.MAX_SAFE_INTEGER);
  assert.equal(calculateCommission(Number.MAX_SAFE_INTEGER, 1), 900719925474);
  assert.equal(calculateCommission(1, 5000), 1);
  assert.equal(calculateCommission(1, 4999), 0);
});
test('commission rejects malformed inputs', () => {
  for (const amount of [-1, 1.1, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => calculateCommission(amount, 1000), RangeError);
  }
  for (const rate of [-1, 10001, 1.5, Infinity, NaN]) {
    assert.throws(() => calculateCommission(100, rate), RangeError);
  }
});
test('terminal states never transition', () => {
  for (const from of ['CANCELLED','REFUNDED'] as const) {
    for (const to of ['PENDING','PAID','FULFILLED','CANCELLED','REFUNDED'] as const) {
      assert.equal(canTransition(from, to), false);
    }
  }
});
test('idempotency guard is isolated per instance', () => {
  const a = new InMemoryIdempotencyGuard();
  const b = new InMemoryIdempotencyGuard();
  assert.equal(a.accept('same'), true);
  assert.equal(a.accept('same'), false);
  assert.equal(b.accept('same'), true);
});
