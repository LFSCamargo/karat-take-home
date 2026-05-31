import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@web': resolve(__dirname, 'src'),
      '@api': resolve(__dirname, '../api/src'),
    },
  },
  server: {
    port: 4200,
    proxy: {
      '/api': 'http://localhost:3333',
    },
  },
  build: {
    outDir: '../../dist/apps/web',
    emptyOutDir: true,
  },
});
