import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface AvaConfig {
  files?: string[];
  timeout?: string | number;
  failFast?: boolean;
  require?: string[];
  nodeArguments?: string[];
  concurrency?: number;
  extensions?: string[];
  match?: string[];
  cache?: boolean;
}

export const baseAvaConfig: AvaConfig = {
  files: ['dist/tests/**/*.js', 'dist/test/**/*.js', 'dist/**/*.test.js', 'dist/**/*.spec.js'],
  timeout: '30s',
  failFast: false,
  require: [],
  nodeArguments: ['--enable-source-maps'],
  concurrency: undefined,
  extensions: ['js'],
  match: [],
  cache: true,
};

export function createAvaConfig(overrides: Partial<AvaConfig>): AvaConfig {
  return {
    ...baseAvaConfig,
    ...overrides,
    files: overrides.files || baseAvaConfig.files,
    nodeArguments: [...(baseAvaConfig.nodeArguments || []), ...(overrides.nodeArguments || [])],
  };
}

export function createPackageAvaConfig(
  packageName: string,
  overrides: Partial<AvaConfig> = {},
): AvaConfig {
  return createAvaConfig({
    ...overrides,
    files: [
      `packages/${packageName}/dist/tests/**/*.js`,
      `packages/${packageName}/dist/test/**/*.js`,
      `packages/${packageName}/dist/**/*.test.js`,
      `packages/${packageName}/dist/**/*.spec.js`,
    ].filter(Boolean),
  });
}

export function loadAvaConfig(configPath: string): AvaConfig {
  try {
    const content = readFileSync(resolve(configPath), 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load AVA config from ${configPath}: ${error}`);
  }
}
