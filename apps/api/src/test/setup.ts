import { loadEnv } from '../config/load-env.js';
import { getTestDatabaseUrl } from '../db/connection-url';

loadEnv();

process.env.NODE_ENV = 'test';
process.env.VITEST = 'true';
process.env.DATABASE_URL = getTestDatabaseUrl();
