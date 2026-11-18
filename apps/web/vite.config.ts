import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Alias the engine to its TypeScript source so Vite transpiles it as part of the
// app build — no separate compile step for the workspace package.
const enginePath = fileURLToPath(new URL('../../packages/engine/src/index.ts', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@sdibeuc/engine': enginePath,
    },
  },
});
