import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import { getAppDatabaseUrl } from './connection-url';
import type { Database } from './schema';

let database: Kysely<Database> | undefined;

export function createDatabase(connectionString?: string) {
  const url =
    connectionString ?? process.env.DATABASE_URL ?? getAppDatabaseUrl();

  if (!url) {
    throw new Error('DATABASE_URL is required');
  }

  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: url,
      }),
    }),
  });
}

export function getDb() {
  if (!database) {
    database = createDatabase();
  }

  return database;
}

export async function destroyDb() {
  if (database) {
    await database.destroy();
    database = undefined;
  }
}
