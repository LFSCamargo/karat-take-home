import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const workspaceRoot = resolve(__dirname, '../..');

export default defineConfig({
  root: __dirname,
  envDir: workspaceRoot,
  envPrefix: 'VITE_PUBLIC_',
  plugins: [react()],
  resolve: {
    alias: {
      '@web': resolve(__dirname, 'src'),
      '@api': resolve(__dirname, '../api/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    env: {
      VITE_PUBLIC_USE_MOCK_DATA: 'true',
    },
  },
});
