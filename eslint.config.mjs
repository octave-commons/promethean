// ESLint flat config (ESM) for monorepo
import tseslint from 'typescript-eslint';
import eslintPluginFunctional from 'eslint-plugin-functional';
import importPlugin from 'eslint-plugin-import';
import promise from 'eslint-plugin-promise';
import sonarjs from 'eslint-plugin-sonarjs';
import ava from 'eslint-plugin-ava';

const typedFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];

const recommendedTypeChecked = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: typedFiles,
}));

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.turbo/**',
      '**/node_modules/**',
      '**/.cache/**',
      './scripts/**',
      './templates/**',
      './eslint.config.ts',
    ],
  },
  ...recommendedTypeChecked,
  {
    files: typedFiles,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        allowDefaultProject: true,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      functional: eslintPluginFunctional,
      import: importPlugin,
      sonarjs,
      promise,
      ava,
    },
    rules: {
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-collapsible-if': 'warn',
      'sonarjs/no-inverted-boolean-check': 'warn',
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, IIFEs: true }],
      'max-params': ['error', 4],
      complexity: ['error', 15],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/unbound-method': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='require']",
          message: 'ESM only',
        },
        {
          selector: "MemberExpression[object.name='module'][property.name='exports']",
          message: 'ESM only',
        },
      ],
      'functional/no-let': 'off',
      'functional/no-try-statements': 'off',
      'functional/prefer-immutable-types': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      'functional/immutable-data': 'off',
      'functional/no-loop-statements': 'off',
      'functional/no-method-signature': 'off',
      'functional/prefer-tacit': 'off',
      'promise/no-return-wrap': 'warn',
      'promise/param-names': 'warn',
      'import/first': 'warn',
      'import/no-default-export': 'warn',
      'import/no-cycle': ['warn', { maxDepth: 1 }],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          'newlines-between': 'always',
        },
      ],
    },
  },
  {
    files: ['packages/markdown/src/**/*.ts'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      complexity: 'off',
      'max-params': 'off',
      'functional/no-let': 'off',
      'functional/no-try-statements': 'off',
      'functional/prefer-immutable-types': 'off',
      'functional/immutable-data': 'off',
      'functional/no-loop-statements': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'import/order': 'off',
    },
  },
  {
    files: ['**/src/scripts/**/*.ts'],
    rules: {
      // Loosen function length for script utilities
      'max-lines-per-function': ['warn', { max: 100, IIFEs: true }],
    },
  },
  {
    files: ['**/*.test.{ts,tsx,js}', '**/*.spec.{ts,tsx,js}', '**/tests/**/*.{ts,tsx,js}'],
    plugins: { ava },
    rules: {
      'ava/no-only-test': 'error',
      'ava/no-identical-title': 'error',
      'ava/test-title': 'warn',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='setTimeout'][arguments.0.type='Identifier']",
          message:
            'Use sleep from @promethean/test-utils instead of setTimeout for sleeps in tests.',
        },
      ],
    },
  },
  {
    files: ['packages/compiler/**/*.{ts,tsx,js}'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'off',
      complexity: 'off',
      'max-lines-per-function': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'functional/no-let': 'off',
      'functional/no-loop-statements': 'off',
      'functional/immutable-data': 'off',
      'functional/prefer-immutable-types': 'off',
    },
  },
);
