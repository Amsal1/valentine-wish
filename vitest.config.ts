import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom for DOM testing
    environment: 'jsdom',
    
    // Include test files co-located with source files
    include: ['src/**/*.test.ts'],
    
    // Global test setup
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
    },
    
    // Property-based testing configuration
    // fast-check will use minimum 100 iterations per test
    testTimeout: 30000,
  },
});
