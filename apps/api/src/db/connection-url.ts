export const APP_DATABASE_NAME = 'app_db';
export const TEST_DATABASE_NAME = 'app_db_test';

export function buildDatabaseUrl(database: string): string {
  const host = process.env.POSTGRES_HOST ?? 'localhost';
  const port = process.env.POSTGRES_PORT ?? '5432';
  const user = process.env.POSTGRES_USER ?? 'postgres';
  const password = process.env.POSTGRES_PASSWORD ?? 'postgres';

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

export function getAppDatabaseUrl(): string {
  return process.env.DATABASE_URL ?? buildDatabaseUrl(APP_DATABASE_NAME);
}

export function getTestDatabaseUrl(): string {
  return (
    process.env.TEST_DATABASE_URL ?? buildDatabaseUrl(TEST_DATABASE_NAME)
  );
}
