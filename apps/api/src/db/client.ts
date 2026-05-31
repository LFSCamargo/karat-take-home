import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import type { Database } from './schema';

const connectionString = process.env.DATABASE_URL;

export function createDatabase() {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString,
      }),
    }),
  });
}

export const db = createDatabase();
