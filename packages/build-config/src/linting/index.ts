import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface ESLintConfig {
  extends?: string | string[];
  plugins?: string[];
  rules?: Record<string, unknown>;
  env?: Record<string, boolean>;
  parserOptions?: Record<string, unknown>;
  overrides?: Array<{
    files: string[];
    rules?: Record<string, unknown>;
    parserOptions?: Record<string, unknown>;
  }>;
}

export interface PrettierConfig {
  semi?: boolean;
  trailingComma?: 'none' | 'es5' | 'all';
  singleQuote?: boolean;
  printWidth?: number;
  tabWidth?: number;
  useTabs?: boolean;
  bracketSpacing?: boolean;
  arrowParens?: 'avoid' | 'always';
  endOfLine?: 'lf' | 'crlf' | 'cr';
}

export const baseESLintConfig: ESLintConfig = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
  ],
  plugins: ['@typescript-eslint', 'functional', 'import'],
  rules: {
    'functional/no-let': 'error',
    'functional/no-throw-statement': 'warn',
    'functional/no-loop-statement': 'warn',
    'functional/no-conditional-statement': 'warn',
    'functional/immutable-data': 'error',
    'functional/prefer-readonly-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      },
    ],
  },
  env: {
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
};

export const basePrettierConfig: PrettierConfig = {
  semi: false,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
};

export function createESLintConfig(overrides: Partial<ESLintConfig>): ESLintConfig {
  return {
    ...baseESLintConfig,
    ...overrides,
    rules: {
      ...baseESLintConfig.rules,
      ...overrides.rules,
    },
  };
}

export function createPrettierConfig(overrides: Partial<PrettierConfig>): PrettierConfig {
  return {
    ...basePrettierConfig,
    ...overrides,
  };
}

export function loadESLintConfig(configPath: string): ESLintConfig {
  try {
    const content = readFileSync(resolve(configPath), 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load ESLint config from ${configPath}: ${error}`);
  }
}

export function loadPrettierConfig(configPath: string): PrettierConfig {
  try {
    const content = readFileSync(resolve(configPath), 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load Prettier config from ${configPath}: ${error}`);
  }
}
