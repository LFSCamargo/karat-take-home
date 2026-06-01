import { getAppDatabaseUrl } from './connection-url';
import { runMigrations } from './migrate-runner';

async function run() {
  const direction = process.argv[2] === 'down' ? 'down' : 'latest';
  const connectionString = process.env.DATABASE_URL ?? getAppDatabaseUrl();

  const { error, results } = await runMigrations(connectionString, direction);

  for (const result of results ?? []) {
    if (result.status === 'Success') {
      const action = direction === 'down' ? 'rolled back' : 'applied';
      console.log(`Migration "${result.migrationName}" ${action}.`);
    } else if (result.status === 'Error') {
      console.error(`Migration "${result.migrationName}" failed.`);
    }
  }

  if (error) {
    console.error(
      direction === 'down'
        ? 'Failed to roll back migration.'
        : 'Failed to run migrations.',
    );
    console.error(error);
    process.exit(1);
  }
}

run();
