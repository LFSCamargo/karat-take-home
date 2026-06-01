import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';

let loaded = false;

function findWorkspaceRoot(startDir = process.cwd()): string {
  let current = path.resolve(startDir);

  while (current !== path.dirname(current)) {
    if (
      existsSync(path.join(current, 'pnpm-workspace.yaml')) ||
      existsSync(path.join(current, 'nx.json'))
    ) {
      return current;
    }

    current = path.dirname(current);
  }

  return path.resolve(startDir);
}

export function loadEnv() {
  if (loaded) {
    return;
  }

  const envPath = path.join(findWorkspaceRoot(), '.env');

  if (existsSync(envPath)) {
    config({ path: envPath });
  }

  loaded = true;
}

export function resetEnvLoaderForTests() {
  loaded = false;
}
