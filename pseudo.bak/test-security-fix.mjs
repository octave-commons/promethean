import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { writeFileContent } from './packages/smartgpt-bridge/dist/files.js';

async function testSecurityFix() {
  console.log('🧪 Testing Security Fix for Symlink Escape\n');

  // Create temporary directories for testing
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'security-test-'));
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

    console.log('\n🚨 Testing the vulnerability...');

    // Debug what happens during the security check
    console.log('Debug: Testing path "safe-looking-file.txt"');
    console.log('Debug: Safe directory:', safeDir);
    console.log('Debug: Symlink path:', symlinkPath);
    console.log('Debug: Symlink target:', secretPath);

    // Try to write through the symlink - should be blocked
    try {
      await writeFileContent(safeDir, 'safe-looking-file.txt', 'MALICIOUS CONTENT');
      console.log('❌ SECURITY FAILURE: Was able to write through symlink!');

      // Check if the secret file was compromised
      const content = await fs.readFile(secretPath, 'utf8');
      if (content.includes('MALICIOUS')) {
        console.log('💀 SECRET FILE WAS COMPROMISED!');
      } else {
        console.log('📡 Secret file content:', content);
      }
    } catch (error) {
      if (error.message.includes('Security: Symlink points outside allowed directory')) {
        console.log('✅ SECURITY SUCCESS: Symlink escape was blocked!');
        console.log('   Error:', error.message);
      } else {
        console.log('❓ Unexpected error:', error.message);
      }
    }

    console.log('\n✅ Testing legitimate file write...');

    // Test that legitimate writes still work
    try {
      const result = await writeFileContent(safeDir, 'legitimate-file.txt', 'safe content');
      console.log('✅ Legitimate write successful');
      console.log('   Result:', result);

      const content = await fs.readFile(path.join(safeDir, 'legitimate-file.txt'), 'utf8');
      console.log('✅ Content verified:', content);
    } catch (error) {
      console.log('❌ Legitimate write failed:', error.message);
    }

  } finally {
    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });
  }

  console.log('\n🎉 Security test complete!');
}

testSecurityFix().catch(console.error);