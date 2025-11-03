import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface TypeScriptConfig {
  extends?: string | string[];
  compilerOptions: Record<string, unknown>;
  include?: string[];
  exclude?: string[];
}

export const baseTypeScriptConfig: TypeScriptConfig = {
  compilerOptions: {
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'bundler',
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    allowJs: true,
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
    strictFunctionTypes: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedIndexedAccess: true,
    noImplicitOverride: true,
    exactOptionalPropertyTypes: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    declaration: true,
    declarationMap: true,
    sourceMap: true,
    removeComments: false,
    resolveJsonModule: true,
    isolatedModules: true,
    verbatimModuleSyntax: false,
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'],
};

export const strictTypeScriptConfig: TypeScriptConfig = {
  ...baseTypeScriptConfig,
  compilerOptions: {
    ...baseTypeScriptConfig.compilerOptions,
    noImplicitAny: true,
    strictNullChecks: true,
    strictFunctionTypes: true,
    strictBindCallApply: true,
    strictPropertyInitialization: true,
    noImplicitThis: true,
    alwaysStrict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    exactOptionalPropertyTypes: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedIndexedAccess: true,
    noImplicitOverride: true,
  },
};

export const testTypeScriptConfig: TypeScriptConfig = {
  ...baseTypeScriptConfig,
  compilerOptions: {
    ...baseTypeScriptConfig.compilerOptions,
    types: ['node', 'ava'],
    noUnusedLocals: false,
    noUnusedParameters: false,
  },
  include: ['src/**/*', '**/*.test.ts', '**/*.spec.ts'],
};

export function createTypeScriptConfig(overrides: Partial<TypeScriptConfig>): TypeScriptConfig {
  return {
    ...baseTypeScriptConfig,
    ...overrides,
    compilerOptions: {
      ...baseTypeScriptConfig.compilerOptions,
      ...overrides.compilerOptions,
    },
  };
}

export function loadTypeScriptConfig(configPath: string): TypeScriptConfig {
  try {
    const content = readFileSync(resolve(configPath), 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load TypeScript config from ${configPath}: ${error}`);
  }
}
