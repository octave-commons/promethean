import * as path from 'path';
import { promises as fs } from 'fs';
import type { Fixture } from './fixtures.js';

export interface FixtureTemplate {
  name: string;
  description: string;
  errorType: string;
  errorCode: string;
  errorMessage: string;
  files: Record<string, string>;
  expectedFixes: Record<string, string>;
}

export class FixtureBuilder {
  private baseDir: string;
  private baseTsconfigPath: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.baseTsconfigPath = path.resolve('../../../tsconfig.json');
  }

  async createFixture(template: FixtureTemplate): Promise<Fixture> {
    const fixtureDir = path.join(this.baseDir, template.name);
    await fs.mkdir(fixtureDir, { recursive: true });

    // Create all files for the fixture
    for (const [filename, content] of Object.entries(template.files)) {
      await fs.writeFile(path.join(fixtureDir, filename), content.trim(), 'utf8');
    }

    // Create package.json
    await fs.writeFile(
      path.join(fixtureDir, 'package.json'),
      JSON.stringify(
        {
          name: `buildfix-fixture-${template.name}`,
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
    const relativeBaseTsconfig = path.relative(this.baseDir, this.baseTsconfigPath);
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
          name: template.name,
          description: template.description,
          errorType: template.errorType,
          errorCode: template.errorCode,
          errorMessage: template.errorMessage,
          files: Object.keys(template.files),
        },
        null,
        2,
      ),
      'utf8',
    );

    // Install dependencies
    console.log(`  📦 Installing dependencies for ${template.name}...`);
    const { exec } = await import('child_process');
    await new Promise<void>((resolve, reject) => {
      const proc = exec('npm install', { cwd: fixtureDir }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
      proc.stdout?.pipe(process.stdout);
      proc.stderr?.pipe(process.stderr);
    });

    // Return as Fixture object
    return {
      name: template.name,
      description: template.description,
      files: template.files,
      expectedFixes: template.expectedFixes,
      errorPattern: [template.errorCode],
    };
  }
}

// Predefined templates for common error types
export const fixtureTemplates: FixtureTemplate[] = [
  {
    name: 'undefined-variable',
    description: 'Cannot find name undefinedVariable',
    errorType: 'TS2304',
    errorCode: 'TS2304',
    errorMessage: "Cannot find name 'undefinedVariable'",
    files: {
      'src.ts': `
// ERROR: Cannot find name 'undefinedVariable'
// ERROR_CODE: TS2304
export function testFunction() {
  return undefinedVariable;
}
      `,
    },
    expectedFixes: {
      'src.ts': `
export function testFunction() {
  const undefinedVariable = "defined";
  return undefinedVariable;
}
      `,
    },
  },
  {
    name: 'missing-export',
    description: 'Function exists but not exported',
    errorType: 'TS2305',
    errorCode: 'TS2305',
    errorMessage: "Module has no exported member 'helper'",
    files: {
      'src.ts': `
// ERROR: Function 'helper' is used but not exported
// ERROR_CODE: TS2305
function helper() {
  return "hello";
}

// Usage in another module expects this to be exported
export function main() {
  return helper();
}
      `,
      'usage.ts': `
import { helper } from "./src";

export function useHelper() {
  return helper();
}
      `,
    },
    expectedFixes: {
      'src.ts': `
export function helper() {
  return "hello";
}

// Usage in another module expects this to be exported
export function main() {
  return helper();
}
      `,
    },
  },
  {
    name: 'optional-parameter',
    description: 'Function parameter should be optional',
    errorType: 'TS2554',
    errorCode: 'TS2554',
    errorMessage: 'Expected 1 arguments, but got 0',
    files: {
      'src.ts': `
// ERROR: Function parameter should be optional
// ERROR_CODE: TS2554
export function greet(name: string) {
  return \`Hello, \${name}!\`;
}

// Called without argument
export function main() {
  return greet();
}
      `,
    },
    expectedFixes: {
      'src.ts': `
export function greet(name?: string) {
  return \`Hello, \${name || "world"}!\`;
}

// Called without argument
export function main() {
  return greet();
}
      `,
    },
  },
  {
    name: 'type-annotation-missing',
    description: 'Variable needs type annotation',
    errorType: 'TS7005',
    errorCode: 'TS7005',
    errorMessage: 'Variable implicitly has type',
    files: {
      'src.ts': `
// ERROR: Variable needs type annotation
// ERROR_CODE: TS7005
let value = "hello";

export function getValue() {
  return value;
}
      `,
    },
    expectedFixes: {
      'src.ts': `
let value: string = "hello";

export function getValue() {
  return value;
}
      `,
    },
  },
  {
    name: 'property-not-exist',
    description: 'Property does not exist on object',
    errorType: 'TS2339',
    errorCode: 'TS2339',
    errorMessage: "Property 'missingProp' does not exist on type",
    files: {
      'src.ts': `
// ERROR: Property does not exist on object
// ERROR_CODE: TS2339
interface User {
  name: string;
}

export function getUserProperty(user: User) {
  return user.missingProp;
}
      `,
    },
    expectedFixes: {
      'src.ts': `
interface User {
  name: string;
  missingProp?: string;
}

export function getUserProperty(user: User) {
  return user.missingProp;
}
      `,
    },
  },
];

export async function createAllFixtures(baseDir: string): Promise<Fixture[]> {
  const builder = new FixtureBuilder(baseDir);
  const fixtures: Fixture[] = [];

  for (const template of fixtureTemplates) {
    console.log(`📝 Creating fixture: ${template.name}`);
    const fixture = await builder.createFixture(template);
    fixtures.push(fixture);
  }

  return fixtures;
}
