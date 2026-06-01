import { getTestDatabaseUrl } from '../db/connection-url';
import { runMigrations } from '../db/migrate-runner';

export default async function globalSetup() {
  const connectionString = getTestDatabaseUrl();
  process.env.DATABASE_URL = connectionString;

  const { error } = await runMigrations(connectionString);

  if (error) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(
      `Failed to migrate test database (${connectionString}): ${message}`,
    );
  }
}
