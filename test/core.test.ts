import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCommission, canTransition, InMemoryIdempotencyGuard } from '../src/index.ts';
test('commission uses minor units and basis points', () => {
  assert.equal(calculateCommission(10000, 1000), 1000);
  assert.equal(calculateCommission(101, 500), 5);
  assert.throws(() => calculateCommission(-1, 1000), RangeError);
  assert.throws(() => calculateCommission(100, 10001), RangeError);
});
test('order transition validation', () => {
  assert.equal(canTransition('PENDING', 'PAID'), true);
  assert.equal(canTransition('PENDING', 'REFUNDED'), false);
  assert.equal(canTransition('CANCELLED', 'PAID'), false);
});
test('duplicate keys rejected within one instance', () => {
  const guard = new InMemoryIdempotencyGuard();
  assert.equal(guard.accept('p1'), true);
  assert.equal(guard.accept('p1'), false);
  assert.equal(guard.accept('p2'), true);
  assert.throws(() => guard.accept(' '), RangeError);
});
