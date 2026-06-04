import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['app/**/*.test.ts', 'lib/**/*.test.ts'],
    server: {
      deps: {
        inline: ['x402-next', '@coinbase/x402'],
      },
    },
  },
});
