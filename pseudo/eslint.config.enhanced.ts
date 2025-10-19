import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import functional from 'eslint-plugin-functional';
import importPlugin from 'eslint-plugin-import';
import promise from 'eslint-plugin-promise';
import sonarjs from 'eslint-plugin-sonarjs';
import ava from 'eslint-plugin-ava';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/.cache/**',
      './scripts/**',
      './templates/**',
      './eslint.config.ts',
      './eslint.config.enhanced.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        allowDefaultProject: true,
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      functional,
      import: importPlugin,
      sonarjs,
      promise,
      ava,
    },
    rules: {
      // Enhanced type safety rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      // Enhanced code quality rules
      'sonarjs/cognitive-complexity': ['error', 10],
      'sonarjs/no-collapsible-if': 'warn',
      'sonarjs/no-inverted-boolean-check': 'warn',
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/prefer-immediate-return': 'warn',

      'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 40, IIFEs: true }],
      'max-params': ['error', 3],
      'max-depth': ['error', 4],
      complexity: ['error', 10],

      // Enhanced functional programming rules
      'functional/no-let': 'error',
      'functional/no-loop-statements': 'error',
      'functional/no-throw-statements': 'warn',
      'functional/prefer-immutable-types': [
        'error',
        {
          enforcement: 'ReadonlyDeep',
          ignoreInferredTypes: false,
        },
      ],
      'functional/immutable-data': ['error', { ignoreClasses: 'fieldsOnly' }],
      'functional/prefer-tacit': 'warn',

      // Enhanced import rules
      'import/first': 'error',
      'import/no-default-export': 'error',
      'import/no-cycle': ['error', { maxDepth: 1 }],
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // Enhanced promise rules
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/no-new-statics': 'error',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'warn',

      // General best practices
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'prefer-template': 'error',
      'template-curly-spacing': 'error',
      'object-shorthand': 'error',
      'prefer-destructuring': ['error', { object: true, array: false }],
    },
  },
  {
    files: ['packages/markdown/src/**/*.ts'],
    rules: {
      // Relaxed rules for markdown processing (legacy code)
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      complexity: 'off',
      'max-params': 'off',
      'functional/no-let': 'off',
      'functional/no-loop-statements': 'off',
      'functional/prefer-immutable-types': 'off',
      'functional/immutable-data': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'import/order': 'off',
    },
  },
  {
    files: ['packages/compiler/**/*.{ts,tsx,js}'],
    rules: {
      // Relaxed rules for compiler (complex code generation)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
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
  {
    files: ['**/src/scripts/**/*.ts'],
    rules: {
      // Relaxed function length for script utilities
      'max-lines-per-function': ['warn', { max: 80, IIFEs: true }],
      'max-params': ['warn', { max: 5 }],
      complexity: ['warn', { max: 15 }],
    },
  },
  {
    files: ['**/*.test.{ts,tsx,js}', '**/*.spec.{ts,tsx,js}', '**/tests/**/*.{ts,tsx,js}'],
    plugins: { ava },
    rules: {
      'ava/no-only-test': 'error',
      'ava/no-identical-title': 'error',
      'ava/test-title': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      'functional/no-let': 'warn',
      'no-console': 'off',
      'max-lines-per-function': ['warn', { max: 60, IIFEs: true }],
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
];
