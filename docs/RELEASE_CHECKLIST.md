# Release readiness checklist

This project is an early prototype. Do not claim production payment or distributed idempotency guarantees.

## Before v0.1.0 release

- [ ] Confirm all GitHub Actions matrix jobs are green (Node 22/24; Linux/Windows)
- [ ] Inspect `npm pack --dry-run --json` output and ensure no private files are included
- [ ] Check CLI sample: `node bin/commerceguard.js examples/cases.json`
- [ ] Verify README usage matches packaged files
- [ ] Review MIT license and security reporting instructions
- [ ] Review CLI input size limits and unsupported behavior
- [ ] Tag `v0.1.0` only after CI verification and owner approval

## Publishing policy

The npm package remains private in package.json. A GitHub release is not the same as npm publication. Do not publish to npm, create a release tag, or claim an audited production security tool without explicit review.

## Community signals

Track meaningful issues, documentation improvements, external feedback, and genuine contributors. Never fabricate downloads, stars, or adoption metrics.
