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

// Load massive fixture set from the generated fixtures directory
export async function loadMassiveFixtures(massiveFixturesDir: string): Promise<Fixture[]> {
  const fixtureDirs = await fs.readdir(massiveFixturesDir);
  const fixtureNames: string[] = [];

  // Filter for fixture directories synchronously
  for (const name of fixtureDirs) {
    if (name.startsWith('fixture-')) {
      const fixturePath = path.join(massiveFixturesDir, name);
      try {
        const stat = await fs.stat(fixturePath);
        if (stat.isDirectory()) {
          fixtureNames.push(name);
        }
      } catch {
        // Ignore errors
      }
    }
  }

  const massiveFixtures: Fixture[] = [];

  for (const fixtureName of fixtureNames) {
    const fixtureDir = path.join(massiveFixturesDir, fixtureName);

    try {
      // Read metadata if available
      let metadata: any = {};
      try {
        const metadataPath = path.join(fixtureDir, 'metadata.json');
        metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      } catch {
        // No metadata file, that's ok
        console.log(`No metadata for ${fixtureName}, using defaults`);
      }

      // Read source files
      const files: Record<string, string> = {};
      const srcFiles = await fs.readdir(fixtureDir);

      for (const srcFile of srcFiles) {
        if (srcFile.endsWith('.ts')) {
          const filePath = path.join(fixtureDir, srcFile);
          const content = await fs.readFile(filePath, 'utf8');
          files[srcFile] = content;
        }
      }

      // Skip fixtures without TypeScript files
      if (Object.keys(files).length === 0) {
        console.warn(`Warning: No TypeScript files found in ${fixtureName}, skipping`);
        continue;
      }

      // Extract error code from fixture name if no metadata
      let errorCode = 'UNKNOWN';
      if (fixtureName.includes('TS')) {
        const match = fixtureName.match(/TS(\d+)/);
        if (match) {
          errorCode = `TS${match[1]}`;
        }
      }

      // Create fixture object
      const fixture: Fixture = {
        name: fixtureName,
        description: metadata.description || `Massive fixture for ${errorCode}`,
        files,
        expectedFixes: {}, // We don't have expected fixes for massive fixtures
        errorPattern: [metadata.targetErrorCode || errorCode],
      };

      massiveFixtures.push(fixture);
    } catch (error) {
      console.warn(`Warning: Failed to load fixture ${fixtureName}:`, error);
    }
  }

  console.log(`Loaded ${massiveFixtures.length} massive fixtures from ${massiveFixturesDir}`);
  return massiveFixtures;
}

export async function createFixtures(baseDir: string, useMassiveFixtures = false): Promise<void> {
  await fs.mkdir(baseDir, { recursive: true });

  // Find the base tsconfig to extend from
  const baseTsconfigPath = path.resolve('../../../tsconfig.json');
  const relativeBaseTsconfig = path.relative(baseDir, baseTsconfigPath);

  const fixturesToUse = useMassiveFixtures
    ? await loadMassiveFixtures(
        path.resolve(process.cwd(), 'packages/buildfix/massive-fixture-generation-2'),
      )
    : fixtures;

  for (const fixture of fixturesToUse) {
    const fixtureDir = path.join(baseDir, fixture.name);
    await fs.mkdir(fixtureDir, { recursive: true });

    // Create all files for the fixture
    for (const [filename, content] of Object.entries(fixture.files)) {
      await fs.writeFile(path.join(fixtureDir, filename), content.trim(), 'utf8');
    }

    // Create package.json
    await fs.writeFile(
      path.join(fixtureDir, 'package.json'),
      JSON.stringify(
        {
          name: `buildfix-fixture-${fixture.name}`,
          version: '1.0.0',
          type: 'module',
          dependencies: {
            'ts-morph': '^23.0.0',
          },
        },
        null,
        2,
      ),
      'utf8',
    );

    // Create tsconfig that extends the base one
    await fs.writeFile(
      path.join(fixtureDir, 'tsconfig.json'),
      JSON.stringify(
        {
          extends: relativeBaseTsconfig,
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
