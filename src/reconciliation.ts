/** Pure reconciliation of integer minor-unit ledger entries; no provider or database integration. */
export type LedgerEntry = Readonly<{
  id: string;
  kind: 'charge' | 'refund';
  amountMinor: number;
}>;

export type ReconciliationResult = Readonly<{
  expectedNetMinor: number;
  actualNetMinor: number;
  differenceMinor: number;
  matched: boolean;
}>;

function safeMinor(value: number): bigint {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError('Amounts must be nonnegative safe integers in minor units');
  }
  return BigInt(value);
}

/** Compare an expected ledger against an independently supplied settled net amount. */
export function reconcileLedger(entries: readonly LedgerEntry[], actualNetMinor: number): ReconciliationResult {
  if (!Array.isArray(entries) || entries.length > 10_000) {
    throw new RangeError('Ledger must contain at most 10000 entries');
  }
  if (!Number.isSafeInteger(actualNetMinor)) {
    throw new RangeError('Actual net must be a safe integer');
  }
  const seen = new Set<string>();
  let expected = 0n;
  for (const entry of entries) {
    if (!entry || typeof entry.id !== 'string' || !entry.id.trim() || entry.id.length > 256 || seen.has(entry.id)) {
      throw new RangeError('Each ledger entry must have a unique nonblank id');
    }
    seen.add(entry.id);
    const amount = safeMinor(entry.amountMinor);
    if (entry.kind === 'charge') expected += amount;
    else if (entry.kind === 'refund') expected -= amount;
    else throw new RangeError('Unknown ledger entry kind');
  }
  const actual = BigInt(actualNetMinor);
  const difference = actual - expected;
  if (expected > BigInt(Number.MAX_SAFE_INTEGER) || expected < BigInt(Number.MIN_SAFE_INTEGER) ||
      difference > BigInt(Number.MAX_SAFE_INTEGER) || difference < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new RangeError('Reconciliation result exceeds safe integer range');
  }
  return {
    expectedNetMinor: Number(expected),
    actualNetMinor,
    differenceMinor: Number(difference),
    matched: difference === 0n
  };
}
