/** Monetary amounts are integer minor units (cents, kuruş). */
export function calculateCommission(amountMinor: number, basisPoints: number): number {
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) throw new RangeError('Invalid amount');
  if (!Number.isSafeInteger(basisPoints) || basisPoints < 0 || basisPoints > 10000) throw new RangeError('Invalid rate');
  const result = (BigInt(amountMinor) * BigInt(basisPoints) + 5000n) / 10000n;
  if (result > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError('Result out of range');
  return Number(result);
}
export type OrderState = 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED';
const transitions: Record<OrderState, readonly OrderState[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['FULFILLED', 'REFUNDED'],
  FULFILLED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: []
};
export function canTransition(from: OrderState, to: OrderState): boolean {
  return Object.hasOwn(transitions, from) && transitions[from].includes(to);
}
/** Demo only: not durable or safe across multiple processes. */
export class InMemoryIdempotencyGuard {
  private readonly seen = new Set<string>();
  accept(key: string): boolean {
    if (!key.trim()) throw new RangeError('Blank key');
    if (this.seen.has(key)) return false;
    this.seen.add(key);
    return true;
  }
}
