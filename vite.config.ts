import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { resolve } from 'path';

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'cedar-monaco-editor',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'monaco-editor'],
    },
  },
  worker: {
    format: 'es',
  },
});
