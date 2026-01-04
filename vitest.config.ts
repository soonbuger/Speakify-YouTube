/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

/**
 * Vitest Config for WXT Extension
 * Adapted from JS_Full_Stack template
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom', // DOM 시뮬레이션 (브라우저 확장 테스트용)
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
