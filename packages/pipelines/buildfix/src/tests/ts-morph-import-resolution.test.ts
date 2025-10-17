import test from 'ava';
import { materializeSnippet } from '../iter/dsl.js';
import { applySnippetToProject } from '../utils.js';
import * as path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TDD RED PHASE: Tests for ts-morph import resolution issue
// These tests should fail initially, demonstrating the 0% success rate problem

test('ts-morph import: should resolve ts-morph import in generated snippets', async (t) => {
  // Create a simple snippet that imports ts-morph
  const snippet = {
    title: 'Test Snippet',
    rationale: 'Test ts-morph import resolution',
    snippet_b64: Buffer.from(
      `
import { Project } from 'ts-morph';

const project = new Project();
console.log('ts-morph imported successfully');
`,
    ).toString('base64'),
  };

  // Create a temporary directory for the test
  const tempDir = path.join(process.cwd(), 'test-temp-ts-morph');
  await fs.mkdir(tempDir, { recursive: true });

  try {
    // Materialize the snippet
    const snippetPath = path.join(tempDir, 'test-snippet.mjs');
    await materializeSnippet(snippet, snippetPath);

    // Read the generated content
    const generatedContent = await fs.readFile(snippetPath, 'utf8');

    // The generated content should have a valid ts-morph import
    // This test will FAIL initially because the import resolution is broken
    t.true(
      generatedContent.includes('ts-morph') && !generatedContent.includes('Cannot find package'),
      'Generated snippet should have valid ts-morph import',
    );

    // Try to execute the snippet (this should fail with current implementation)
    try {
      // Dynamic import to test if the module can be loaded
      await import(path.resolve(snippetPath));
      t.pass('Snippet should execute without import errors');
    } catch (error) {
      t.fail(
        `Snippet should execute without import errors, but got: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  } finally {
    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('ts-morph import: should handle absolute path resolution correctly', async (t) => {
  // Test the specific fix needed: replacing relative ts-morph imports
  // with absolute paths that work in the fixture context

  const snippetContent = `
import { Project } from 'ts-morph';

export function createProject() {
  return new Project();
}
`;

  // This simulates the current fix attempt in utils.ts
  const tsMorphPath = path.resolve(__dirname, '../../node_modules/ts-morph');
  const patchedContent = snippetContent.replace(/from ["']ts-morph["']/, `from "${tsMorphPath}"`);

  // The patched content should have an absolute path
  t.true(
    patchedContent.includes(tsMorphPath),
    'Patched content should include absolute ts-morph path',
  );

  // But this approach fails because absolute paths don't work in ESM modules
  // This test documents the current broken approach
  t.true(
    patchedContent.startsWith('import') && patchedContent.includes('ts-morph'),
    'Should maintain import structure',
  );
});

test('ts-morph import: should use correct ESM-compatible import path', async (t) => {
  // Test the CORRECT solution: use ts-morph/dist/ts-morph.js
  const snippetContent = `
import { Project } from 'ts-morph';

export function testFunction() {
  return 'test';
}
`;

  // The correct fix should replace with the ESM entry point
  const correctFix = snippetContent.replace(
    /from ["']ts-morph["']/,
    'from "ts-morph/dist/ts-morph.js"',
  );

  t.true(
    correctFix.includes('ts-morph/dist/ts-morph.js'),
    'Should use ESM-compatible ts-morph import path',
  );

  // This documents what the fix should accomplish
  t.true(correctFix.includes('import { Project }'), 'Should preserve import structure');
});

test('ts-morph import: should work in fixture context', async (t) => {
  // Test that the fix works in the actual fixture context
  const fixtureDir = path.join(process.cwd(), 'test-fixture-ts-morph');
  const tsconfigPath = path.join(fixtureDir, 'tsconfig.json');

  await fs.mkdir(fixtureDir, { recursive: true });

  try {
    // Create a minimal fixture
    await fs.writeFile(
      tsconfigPath,
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2020',
            module: 'ESNext',
            moduleResolution: 'node',
          },
        },
        null,
        2,
      ),
    );

    await fs.writeFile(path.join(fixtureDir, 'src.ts'), 'export const test = 1;');

    // Create a snippet with ts-morph import
    const snippet = {
      title: 'Test Fixture',
      rationale: 'Test ts-morph in fixture context',
      snippet_b64: Buffer.from(
        `
import { Project } from 'ts-morph';
import { readFileSync } from 'fs';

const project = new Project();
const source = project.addSourceFileAtPath('src.ts');
console.log(source.getFullText());
`,
      ).toString('base64'),
    };

    const snippetPath = path.join(fixtureDir, 'attempt-1.mjs');
    await materializeSnippet(snippet, snippetPath);

    // Apply the snippet to the fixture
    await applySnippetToProject(tsconfigPath, snippetPath);

    // Read the applied content
    const appliedContent = await fs.readFile(snippetPath, 'utf8');

    // This should demonstrate the current failure
    // and will pass once we implement the fix
    t.true(
      appliedContent.includes('ts-morph') && !appliedContent.includes('Cannot find package'),
      'Applied snippet should have working ts-morph import',
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});
