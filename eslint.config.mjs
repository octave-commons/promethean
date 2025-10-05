// ESLint flat config (ESM) for monorepo
import tseslint from 'typescript-eslint';
import eslintPluginFunctional from 'eslint-plugin-functional';

export default tseslint.config(
  tseslint.configs.recommendedTypeChecked,
  {
    ignores: ['**/dist/**', '**/.turbo/**', '**/node_modules/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    rules: {
      // Functional style
      'functional/no-let': 'warn',
      'functional/prefer-readonly-type': 'off',
      'functional/immutable-data': 'warn',
      // TS hygiene
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/no-floating-promises': 'error',
    },
    plugins: {
      functional: eslintPluginFunctional,
    },
  }
);
