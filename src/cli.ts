import { readFileSync, writeFileSync } from 'node:fs';
import { calculateCommission, canTransition, InMemoryIdempotencyGuard } from './index.ts';

type Case = { name: string; kind: 'commission'; amountMinor: number; basisPoints: number; expectedMinor: number }
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
      else { const guard = new InMemoryIdempotencyGuard(); actual = c.keys.map(k => guard.accept(k)); expected = c.expectedAccepted; }
      return { name: c.name, passed: JSON.stringify(actual) === JSON.stringify(expected), actual, expected };
    } catch (error) { return { name: c.name, passed: false, error: error instanceof Error ? error.message : String(error) }; }
  });
}
export function run(args: string[]): number {
  if (args.length < 1 || args.length > 3 || (args.length === 3 && args[1] !== '--output')) {
    process.stderr.write('Usage: node --experimental-strip-types src/cli.ts cases.json [--output report.json]\n');
    return 2;
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(args[0], 'utf8'));
    if (!Array.isArray(parsed) || parsed.some(x => !x || typeof x !== 'object' || typeof x.name !== 'string' || !['commission','transition','idempotency'].includes(x.kind))) throw new Error('Expected an array of named cases with supported kinds');
    const results = evaluate(parsed as Case[]);
    const report = { total: results.length, passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results };
    const output = JSON.stringify(report, null, 2) + '\n';
    if (args[1] === '--output') writeFileSync(args[2], output);
    else process.stdout.write(output);
    return report.failed ? 1 : 0;
  } catch (error) { process.stderr.write(String(error) + '\n'); return 2; }
}
if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) process.exitCode = run(process.argv.slice(2));
