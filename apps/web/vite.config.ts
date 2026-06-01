import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const workspaceRoot = resolve(__dirname, '../..');
const isDockerDev = process.env.DOCKER_DEV === 'true';

export default defineConfig({
  root: __dirname,
  envDir: workspaceRoot,
  envPrefix: 'VITE_PUBLIC_',
  cacheDir: '../../node_modules/.vite/apps/web',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@web': resolve(__dirname, 'src'),
      '@api': resolve(__dirname, '../api/src'),
    },
  },
  server: {
    host: isDockerDev ? '0.0.0.0' : undefined,
    port: 4200,
    watch: isDockerDev
      ? {
          usePolling: true,
          interval: 1000,
        }
      : undefined,
    hmr: isDockerDev
      ? {
          host: 'localhost',
          port: 4200,
          clientPort: 4200,
        }
      : undefined,
    proxy: {
      '/api': process.env.VITE_DEV_API_PROXY ?? 'http://localhost:3333',
    },
  },
  build: {
    outDir: '../../dist/apps/web',
    emptyOutDir: true,
  },
});
