import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

// Import the compiled version directly
import { writeFileContent } from './packages/smartgpt-bridge/dist/files.js';

async function testCompiledSecurity() {
  console.log('🧪 Testing COMPILED Security Fix\n');

  // Create temporary directories for testing
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'compiled-security-test-'));
  const safeDir = path.join(tempDir, 'safe');
  const outsideDir = path.join(tempDir, 'outside');

  await fs.mkdir(safeDir, { recursive: true });
  await fs.mkdir(outsideDir, { recursive: true });

  try {
    // Create a sensitive file outside the safe directory
    const secretPath = path.join(outsideDir, 'secret.txt');
    await fs.writeFile(secretPath, 'SECRET DATA - should not be accessible', 'utf8');
    console.log('✓ Created secret file outside safe directory');

    // Create a symlink inside safeDir pointing to a file outside
    const symlinkPath = path.join(safeDir, 'safe-looking-file.txt');

    try {
      await fs.symlink(secretPath, symlinkPath);
      console.log('✓ Created symlink pointing outside safe directory');
    } catch (error) {
      console.log('⚠️  Symlinks not supported on this filesystem, skipping symlink test');
      return;
    }

    console.log('\n🚨 Testing the vulnerability with COMPILED version...');

    // Debug info
    console.log('Debug: safeDir:', safeDir);
    console.log('Debug: symlinkPath:', symlinkPath);
    console.log('Debug: relative path from safeDir:', path.relative(safeDir, symlinkPath));

    // Try to write through the symlink using the compiled function
    try {
      const result = await writeFileContent(safeDir, 'safe-looking-file.txt', 'MALICIOUS CONTENT');
      console.log('❌ SECURITY FAILURE: Was able to write through symlink!');
      console.log('   Result:', result);

      // Check if the secret file was compromised
      const content = await fs.readFile(secretPath, 'utf8');
      if (content.includes('MALICIOUS')) {
        console.log('💀 SECRET FILE WAS COMPROMISED!');
        console.log('   New content:', content);
      } else {
        console.log('📡 Secret file content:', content);
      }
    } catch (error) {
      if (error.message.includes('Security: Symlink points outside allowed directory')) {
        console.log('✅ SECURITY SUCCESS: Symlink escape was blocked!');
        console.log('   Error:', error.message);
      } else {
        console.log('❓ Unexpected error:', error.message);
        console.log('   Stack:', error.stack);
      }
    }

  } finally {
    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });
  }

  console.log('\n🎉 Compiled security test complete!');
}

testCompiledSecurity().catch(console.error);