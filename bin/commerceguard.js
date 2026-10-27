#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const entry = resolve(dirname(fileURLToPath(import.meta.url)), '../src/cli.ts');
const child = spawnSync(process.execPath, ['--experimental-strip-types', entry, ...process.argv.slice(2)], { stdio: 'inherit' });
if (child.error) {
  process.stderr.write(String(child.error) + '\n');
  process.exitCode = 2;
} else {
  process.exitCode = child.status ?? 2;
}
