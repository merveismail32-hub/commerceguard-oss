import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { calculateCommission, canTransition, InMemoryIdempotencyGuard } from './index.ts';
import { reconcileLedger, type LedgerEntry } from './reconciliation.ts';

type Case = { name: string; kind: 'reconciliation'; entries: LedgerEntry[]; actualNetMinor: number; expectedMatched: boolean; expectedDifferenceMinor: number }
  | { name: string; kind: 'commission'; amountMinor: number; basisPoints: number; expectedMinor: number }
  | { name: string; kind: 'transition'; from: 'PENDING'|'PAID'|'FULFILLED'|'CANCELLED'|'REFUNDED'; to: 'PENDING'|'PAID'|'FULFILLED'|'CANCELLED'|'REFUNDED'; expected: boolean }
  | { name: string; kind: 'idempotency'; keys: string[]; expectedAccepted: boolean[] };
type Result = { name: string; passed: boolean; actual?: unknown; expected?: unknown; error?: string };
export function evaluate(cases: Case[]): Result[] {
  return cases.map(c => {
    try {
      let actual: unknown;
      let expected: unknown;
      if (c.kind === 'commission') { actual = calculateCommission(c.amountMinor, c.basisPoints); expected = c.expectedMinor; }
      else if (c.kind === 'transition') { actual = canTransition(c.from, c.to); expected = c.expected; }
      else if (c.kind === 'reconciliation') { const result = reconcileLedger(c.entries, c.actualNetMinor); actual = { matched: result.matched, differenceMinor: result.differenceMinor }; expected = { matched: c.expectedMatched, differenceMinor: c.expectedDifferenceMinor }; }
      else { const guard = new InMemoryIdempotencyGuard(); actual = c.keys.map(k => guard.accept(k)); expected = c.expectedAccepted; }
      return { name: c.name, passed: JSON.stringify(actual) === JSON.stringify(expected), actual, expected };
    } catch (error) { return { name: c.name, passed: false, error: error instanceof Error ? error.message : String(error) }; }
  });
}
const MAX_FIXTURE_BYTES = 1024 * 1024;
const MAX_CASES = 1000;
export function run(args: string[]): number {
  if (!(args.length === 1 || (args.length === 3 && args[1] === '--output' && Boolean(args[2])))) {
    process.stderr.write('Usage: node --experimental-strip-types src/cli.ts cases.json [--output report.json]\n');
    return 2;
  }
  try {
    const bytes = readFileSync(args[0]);
    if (bytes.byteLength > MAX_FIXTURE_BYTES) throw new Error('Fixture exceeds 1 MiB limit');
    const parsed: unknown = JSON.parse(bytes.toString('utf8'));
    if (!Array.isArray(parsed) || parsed.length > MAX_CASES || parsed.some(x => !x || typeof x !== 'object' || typeof x.name !== 'string' || !x.name.trim() || x.name.length > 120 || !['commission','transition','idempotency','reconciliation'].includes(x.kind) || (x.kind === 'commission' && (!Number.isSafeInteger(x.amountMinor) || !Number.isSafeInteger(x.basisPoints) || !Number.isSafeInteger(x.expectedMinor))) || (x.kind === 'transition' && (!['PENDING','PAID','FULFILLED','CANCELLED','REFUNDED'].includes(x.from) || !['PENDING','PAID','FULFILLED','CANCELLED','REFUNDED'].includes(x.to) || typeof x.expected !== 'boolean')) || (x.kind === 'reconciliation' && (!Array.isArray(x.entries) || x.entries.length > 10000 || !x.entries.every((e: unknown) => !!e && typeof e === 'object' && typeof (e as LedgerEntry).id === 'string' && ['charge','refund'].includes((e as LedgerEntry).kind) && Number.isSafeInteger((e as LedgerEntry).amountMinor) && (e as LedgerEntry).amountMinor >= 0) || !Number.isSafeInteger(x.actualNetMinor) || typeof x.expectedMatched !== 'boolean' || !Number.isSafeInteger(x.expectedDifferenceMinor))) || (x.kind === 'idempotency' && (!Array.isArray(x.keys) || !x.keys.every((k: unknown) => typeof k === 'string') || !Array.isArray(x.expectedAccepted) || x.keys.length > 10000 || x.keys.length !== x.expectedAccepted.length || !x.keys.every((k: string) => k.length > 0 && k.length <= 256) || !x.expectedAccepted.every((v: unknown) => typeof v === 'boolean'))))) throw new Error('Invalid case schema');
    const results = evaluate(parsed as Case[]);
    const report = { total: results.length, passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results };
    const output = JSON.stringify(report, null, 2) + '\n';
    if (args[1] === '--output') writeFileSync(args[2], output);
    else process.stdout.write(output);
    return report.failed ? 1 : 0;
  } catch (error) { process.stderr.write(String(error) + '\n'); return 2; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exitCode = run(process.argv.slice(2));
