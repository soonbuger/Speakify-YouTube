/**
 * ESLint Flat Config for WXT + TypeScript
 * Adapted from JS_Full_Stack template
 */
import js from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  js.configs.recommended,
  prettierRecommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // Chrome Extension APIs
        chrome: 'readonly',
        // WXT global APIs (auto-injected at build time)
        browser: 'readonly',
        defineContentScript: 'readonly',
        defineBackground: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript rules
      ...tseslint.configs.recommended.rules,

      // 방어적 코딩
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',

      // 코드 품질
      'no-console': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', '.wxt/', '.output/', '*.d.ts', 'docs/', 'scripts/'],
  },
];
