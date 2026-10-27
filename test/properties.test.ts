import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCommission, canTransition } from '../src/index.ts';

test('commission boundary and monotonicity properties', () => {
  for (let amount = 0; amount <= 10000; amount += 137) {
    assert.equal(calculateCommission(amount, 0), 0);
    assert.equal(calculateCommission(amount, 10000), amount);
    let previous = 0;
    for (let rate = 0; rate <= 10000; rate += 101) {
      const actual = calculateCommission(amount, rate);
      assert.ok(actual >= previous, 'commission should not decrease as rate rises');
      assert.ok(actual >= 0 && actual <= amount);
      previous = actual;
    }
  }
});
test('only documented order transitions are allowed', () => {
  const states = ['PENDING', 'PAID', 'FULFILLED', 'CANCELLED', 'REFUNDED'] as const;
  const allowed = new Set(['PENDING>PAID','PENDING>CANCELLED','PAID>FULFILLED','PAID>REFUNDED','FULFILLED>REFUNDED']);
  for (const from of states) {
    for (const to of states) {
      assert.equal(canTransition(from, to), allowed.has(from + '>' + to), from + ' to ' + to);
    }
  }
});
