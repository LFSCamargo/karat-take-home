import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    globalSetup: ['src/test/global-setup.ts'],
    setupFiles: ['src/test/setup.ts'],
    fileParallelism: false,
  },
});
