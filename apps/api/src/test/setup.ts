import { getTestDatabaseUrl } from '../db/connection-url';

process.env.NODE_ENV = 'test';
process.env.VITEST = 'true';
process.env.DATABASE_URL = getTestDatabaseUrl();
