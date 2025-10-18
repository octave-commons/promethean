/**
 * Test utilities for unified package testing
 */

export interface TestConfig {
  timeout: number;
  retries: number;
}

export const defaultTestConfig: TestConfig = {
  timeout: 5000,
  retries: 3,
};

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = defaultTestConfig.timeout,
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Test timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

export function createMockConfig(overrides: Partial<TestConfig> = {}): TestConfig {
  return {
    ...defaultTestConfig,
    ...overrides,
  };
}

export function assertValidVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version);
}

export function assertValidPackageStructure(packagePath: string): boolean {
  const requiredFiles = ['package.json', 'tsconfig.json', 'README.md'];

  return requiredFiles.every((file) =>
    require('fs').existsSync(require('path').join(packagePath, file)),
  );
}
