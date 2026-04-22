import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { resolve } from 'path';

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  build: {
    emptyOutDir: false,
    outDir: 'dist/workers',
    rollupOptions: {
      input: {
        'cedar-policy.worker': resolve(__dirname, 'src/workers/cedar-policy.worker.ts'),
        'cedar-schema.worker': resolve(__dirname, 'src/workers/cedar-schema.worker.ts'),
        'cedar-json.worker':   resolve(__dirname, 'src/workers/cedar-json.worker.ts'),
      },
      external: ['@cedar-policy/cedar-wasm'],
      output: { entryFileNames: '[name].js', format: 'es' },
    },
  },
});
