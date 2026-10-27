import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
test('npm package contains CLI, runtime modules, and license but excludes tests', () => {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: root, encoding: 'utf8', shell: process.platform === 'win32'
  });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.length, 1);
  const paths = output[0].files.map((file: { path: string }) => file.path);
  for (const required of ['package.json', 'bin/commerceguard.js', 'src/cli.ts', 'src/index.ts', 'src/reconciliation.ts', 'README.md', 'LICENSE']) {
    assert.ok(paths.includes(required), 'missing packaged file: ' + required);
  }
  assert.ok(paths.every((path: string) => !path.startsWith('test/') && !path.startsWith('.github/') && !path.startsWith('docs/')), 'unexpected file included');
});
