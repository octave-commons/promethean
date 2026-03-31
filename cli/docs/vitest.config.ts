import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: path.resolve(__dirname, 'coverage'),
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.ts'],
    },
  },
});
