import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [react(), legacy({ targets: ['ios >= 12', 'safari >= 12'] })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'api/**/*.test.ts'],
    coverage: { provider: 'v8', include: ['src/**', 'api/**'], exclude: ['**/*.test.*', 'src/main.tsx', 'src/ui/voice.ts', 'src/test/**'], thresholds: { lines: 85, functions: 85, statements: 85, branches: 75 } },
  },
});
