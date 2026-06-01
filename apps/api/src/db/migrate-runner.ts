import { existsSync, promises as fs } from 'node:fs';
import path from 'node:path';

import { FileMigrationProvider, Migrator } from 'kysely/migration';

import { createDatabase } from './client';

function resolveMigrationFolder(): string {
  const candidates = [
    path.join(process.cwd(), 'apps/api/src/db/migrations'),
    path.join(process.cwd(), 'src/db/migrations'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error('Could not find migrations folder.');
}

export async function runMigrations(
  connectionString: string,
  direction: 'latest' | 'down' = 'latest',
) {
  const db = createDatabase(connectionString);
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: resolveMigrationFolder(),
    }),
  });

  try {
    if (direction === 'down') {
      return migrator.migrateDown();
    }

    return migrator.migrateToLatest();
  } finally {
    await db.destroy();
  }
}
