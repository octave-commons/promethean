import * as path from 'path';
import { promises as fs } from 'fs';

export interface Fixture {
  name: string;
  description: string;
  files: Record<string, string>;
  expectedFixes: Record<string, string>;
  errorPattern: string[];
}

export const fixtures: Fixture[] = [
  {
    name: 'missing-export',
    description: 'Function exists but not exported',
    files: {
      'src.ts': `
function helper() {
  return "hello";
}

// Usage in another module expects this to be exported
export function main() {
  return helper();
}`,
      'usage.ts': `
import { helper } from "./src";

export function useHelper() {
  return helper();
}`,
    },
    expectedFixes: {
      'src.ts': `
export function helper() {
  return "hello";
}

// Usage in another module expects this to be exported
export function main() {
  return helper();
}`,
    },
    errorPattern: ['TS2305', 'helper', 'export'],
  },
  {
    name: 'optional-parameter',
    description: 'Function parameter should be optional',
    files: {
      'src.ts': `
export function greet(name: string) {
  return \`Hello, \${name}!\`;
}

// Called without argument
export function main() {
  return greet();
}`,
    },
    expectedFixes: {
      'src.ts': `
export function greet(name?: string) {
  return \`Hello, \${name || "world"}!\`;
}

// Called without argument
export function main() {
  return greet();
}`,
    },
    errorPattern: ['TS2554', 'greet', 'expected'],
  },
  {
    name: 'type-annotation-missing',
    description: 'Variable needs type annotation',
    files: {
      'src.ts': `
export function getValue() {
  const result = someUnknownFunction();
  return result;
}`,
    },
    expectedFixes: {
      'src.ts': `
export function getValue(): unknown {
  const result: unknown = someUnknownFunction();
  return result;
}`,
    },
    errorPattern: ['TS7005', 'result', 'type'],
  },
  {
    name: 'missing-return-type',
    description: 'Function missing return type annotation',
    files: {
      'src.ts': `
export function calculateTotal(items: number[]) {
  return items.reduce((sum, item) => sum + item, 0);
}`,
    },
    expectedFixes: {
      'src.ts': `
export function calculateTotal(items: number[]): number {
  return items.reduce((sum, item) => sum + item, 0);
}`,
    },
    errorPattern: ['TS7010', 'calculateTotal', 'return type'],
  },
  {
    name: 'class-not-exported',
    description: 'Class used but not exported',
    files: {
      'src.ts': `
class Helper {
  static format(text: string) {
    return text.trim();
  }
}

export function formatText(text: string) {
  return Helper.format(text);
}`,
      'usage.ts': `
import { Helper } from "./src";

export function useHelper() {
  return Helper.format("test");
}`,
    },
    expectedFixes: {
      'src.ts': `
export class Helper {
  static format(text: string) {
    return text.trim();
  }
}

export function formatText(text: string) {
  return Helper.format(text);
}`,
    },
    errorPattern: ['TS2305', 'Helper', 'export'],
  },
  {
    name: 'interface-missing',
    description: 'Using interface without proper definition',
    files: {
      'src.ts': `
export function processUser(user: User) {
  return user.id;
}

export interface User {
  id: number;
  name: string;
}`,
    },
    expectedFixes: {
      'src.ts': `
export interface User {
  id: number;
  name: string;
}

export function processUser(user: User) {
  return user.id;
}`,
    },
    errorPattern: ['TS2552', 'User', 'find'],
  },
];

export async function createFixtures(baseDir: string): Promise<void> {
  await fs.mkdir(baseDir, { recursive: true });

  for (const fixture of fixtures) {
    const fixtureDir = path.join(baseDir, fixture.name);
    await fs.mkdir(fixtureDir, { recursive: true });

    // Create all files for the fixture
    for (const [filename, content] of Object.entries(fixture.files)) {
      await fs.writeFile(path.join(fixtureDir, filename), content.trim(), 'utf8');
    }

    // Create tsconfig
    await fs.writeFile(
      path.join(fixtureDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            strict: true,
            noEmit: true,
            target: 'ES2020',
            module: 'ESNext',
            moduleResolution: 'node',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
          },
          include: ['*.ts'],
        },
        null,
        2,
      ),
      'utf8',
    );

    // Create metadata
    await fs.writeFile(
      path.join(fixtureDir, 'metadata.json'),
      JSON.stringify(
        {
          name: fixture.name,
          description: fixture.description,
          errorPattern: fixture.errorPattern,
          files: Object.keys(fixture.files),
        },
        null,
        2,
      ),
      'utf8',
    );
  }
}

if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const baseDir = process.argv[2] || './test-fixtures';
  createFixtures(baseDir)
    .then(() => console.log(`Created ${fixtures.length} fixtures in ${baseDir}`))
    .catch(console.error);
}
