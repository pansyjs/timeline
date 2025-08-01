import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {},
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
