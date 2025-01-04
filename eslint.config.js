import globals from 'globals';
import pluginJs from '@eslint/js';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import prettier from 'eslint-plugin-prettier/recommended';

export default [
  pluginJs.configs.recommended,
  unicorn.configs['flat/recommended'],
  sonarjs.configs.recommended,
  prettier,
  {
    ignore: ['.git', 'node_modules', 'build', 'package-lock.json'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'comma-spacing': ['error', { before: false, after: true }],
      'operator-assignment': ['error', 'always'],
      'comma-style': ['error', 'last'],
      camelcase: ['off', { properties: 'always' }],
      'no-func-assign': 'error',
      'no-self-assign': 'error',
      'no-console': 'error',
      'no-multi-spaces': 'error',
      'no-loop-func': 'error',
      'no-eq-null': 'error',
      'no-empty-pattern': 'error',
      'no-else-return': 'error',
      eqeqeq: 'error',
      'dot-notation': 'error',
      'dot-location': ['error', 'property'],
      'consistent-return': 'off',
      'block-scoped-var': 'error',
      'no-catch-shadow': 'error',
      'no-delete-var': 'error',
      'no-unused-vars': ['error', { args: 'none', varsIgnorePattern: '__' }],
      'no-undef-init': 'error',
      'max-len': ['error', 100, 2, { ignoreUrls: true, ignoreComments: true }],
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    },
  },
];
