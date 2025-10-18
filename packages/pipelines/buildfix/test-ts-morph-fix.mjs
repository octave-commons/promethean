import { importSnippet } from './dist/utils.js';
import { promises as fs } from 'fs';
import * as path from 'path';

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
    // This should work with our fix
    const apply = await importSnippet(snippetPath);
    console.log('✅ SUCCESS: ts-morph import resolved successfully!');
    console.log('✅ The fix is working - BuildFix P0 task can be marked as completed!');
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    console.log('❌ The ts-morph import resolution is still broken');
  } finally {
    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

testTsMorphFix().catch(console.error);
