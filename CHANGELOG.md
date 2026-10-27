# Changelog

All notable changes to CommerceGuard OSS are documented here. This project has not published a tagged release yet.

## Unreleased (v0.1.0 candidate)

- Dependency-free TypeScript commission calculations using integer minor units and BigInt intermediates.
- Order-state transition checks and an explicitly non-durable in-memory idempotency demonstration.
- Pure synthetic ledger reconciliation with duplicate ID and safe-integer validation.
- JSON CLI with structured reports and exit codes 0/1/2.
- Fixture size limits, input validation, examples, and automated cross-platform tests.
- Package integrity checks for the CLI and runtime modules.

### Known limitations

- No payment provider, database, or production distributed idempotency integration.
- No npm publication or GitHub release yet.
- Only synthetic/test data should be used.
