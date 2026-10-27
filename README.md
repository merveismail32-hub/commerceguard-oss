# CommerceGuard OSS

[![Tests](https://github.com/merveismail32-hub/commerceguard-oss/actions/workflows/test.yml/badge.svg)](https://github.com/merveismail32-hub/commerceguard-oss/actions/workflows/test.yml)

An independent, MIT-licensed, open-source prototype for checking marketplace commerce invariants.

## Features

- Commission calculations using integer minor units and basis points
- Explicit order-state transition validation
- In-memory idempotency replay demonstration (not production-safe)
- JSON-driven CLI with structured reports and nonzero exit codes
- Pure ledger reconciliation checks for synthetic charges and refunds
- Node.js built-in test runner and GitHub Actions

## Quick start

Requires Node.js 22.6+.

```sh
npm test
node bin/commerceguard.js examples/cases.json
node --experimental-strip-types src/cli.ts examples/cases.json
node --experimental-strip-types src/cli.ts examples/cases.json --output report.json
```

## Example case

```json
{"name":"10% commission","kind":"commission","amountMinor":10000,"basisPoints":1000,"expectedMinor":1000}
```

The `commerceguard` executable is declared in package.json for future packaging. The package is currently private and **not published to npm**. Run `node bin/commerceguard.js` from the repository root for now.

CLI accepts a JSON array of cases. Exit code 0 means all expectations matched, 1 means at least one mismatch, and 2 indicates invalid input or execution failure.

## Reconciliation example

The `reconcileLedger` function is available from `src/reconciliation.ts` for source-level use. It compares a synthetic charge/refund ledger with an independently supplied settled net amount, returning `matched` and a signed `differenceMinor`. All amounts use integer minor units. Duplicate entry IDs and unsafe integer sums are rejected. It does not connect to banks, payment providers, or accounting systems.

## Important limitations

This is an early prototype, **not** a payment processor, fraud detector, or production idempotency solution. The in-memory guard cannot guarantee correctness across restarts, multiple processes, or concurrent distributed workers. Inputs should be trusted test fixtures; fixture size limits and BigInt-based integer arithmetic are implemented, but more robust schema validation and domain-specific rounding policies remain future work.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), [security guidance](docs/SECURITY.md), and the [roadmap](docs/ROADMAP.md). Issues and pull requests are welcome. Do not submit secrets or proprietary code.

## License

MIT. Built independently, without code from any private marketplace repository.
