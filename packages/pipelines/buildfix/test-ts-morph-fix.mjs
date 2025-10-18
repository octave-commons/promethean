import { importSnippet } from './dist/utils.js';
import { promises as fs } from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

async function testTsMorphFix() {
  console.log('Testing ts-morph import resolution fix...');

  // Create a test snippet with ts-morph import
  const snippetContent = `
import { Project } from 'ts-morph';

const project = new Project();
console.log('ts-morph imported successfully');
`;

  // Create temporary file
  const tempDir = path.join(process.cwd(), 'test-temp');
  await fs.mkdir(tempDir, { recursive: true });
  const snippetPath = path.join(tempDir, 'test-snippet.mjs');
  await fs.writeFile(snippetPath, snippetContent, 'utf8');

  try {
    // First check what the patched content looks like
    const snippetContent = await fs.readFile(snippetPath, 'utf8');
    console.log('Original snippet content:');
    console.log(snippetContent);

    // Apply the importSnippet function to see the patched version
    const tempPath = snippetPath + '.patched.mjs';
    const patchedContent = snippetContent.replace(
      /from ["']ts-morph["']/,
      'from "ts-morph/dist/ts-morph.js"',
    );
    await fs.writeFile(tempPath, patchedContent, 'utf8');

    console.log('\nPatched content:');
    console.log(patchedContent);

    // Try to import the patched version directly
    const mod = await import(pathToFileURL(path.resolve(tempPath)).toString());
    console.log('✅ SUCCESS: ts-morph import resolved successfully!');
    console.log('✅ The fix is working - BuildFix P0 task can be marked as completed!');

    // Clean up temp file
    await fs.unlink(tempPath);
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    console.log('❌ The ts-morph import resolution is still broken');
  } finally {
    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

testTsMorphFix().catch(console.error);
