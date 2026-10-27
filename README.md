# CommerceGuard OSS

[![Tests](https://github.com/merveismail32-hub/commerceguard-oss/actions/workflows/test.yml/badge.svg)](https://github.com/merveismail32-hub/commerceguard-oss/actions/workflows/test.yml)

An independent, MIT-licensed, open-source prototype for checking marketplace commerce invariants.

## Features

- Commission calculations using integer minor units and basis points
- Explicit order-state transition validation
- In-memory idempotency replay demonstration (not production-safe)
- JSON-driven CLI with structured reports and nonzero exit codes
- Node.js built-in test runner and GitHub Actions

## Quick start

Requires Node.js 22.6+.

```sh
npm test
node --experimental-strip-types src/cli.ts examples/cases.json
node --experimental-strip-types src/cli.ts examples/cases.json --output report.json
```

## Example case

```json
{"name":"10% commission","kind":"commission","amountMinor":10000,"basisPoints":1000,"expectedMinor":1000}
```

CLI accepts a JSON array of cases. Exit code 0 means all expectations matched, 1 means at least one mismatch, and 2 indicates invalid input or execution failure.

## Important limitations

This is an early prototype, **not** a payment processor, fraud detector, or production idempotency solution. The in-memory guard cannot guarantee correctness across restarts, multiple processes, or concurrent distributed workers. Inputs should be trusted test fixtures; stronger validation and large-number safety are planned.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), [security guidance](docs/SECURITY.md), and the [roadmap](docs/ROADMAP.md). Issues and pull requests are welcome. Do not submit secrets or proprietary code.

## License

MIT. Built independently, without code from any private marketplace repository.
