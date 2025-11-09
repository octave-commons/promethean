import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

// Copy the security check function with debug logging
async function checkSymlinkSecurityWithLogging(ROOT_PATH, filePath) {
  console.log('\n🔍 checkSymlinkSecurity called with:');
  console.log('  ROOT_PATH:', ROOT_PATH);
  console.log('  filePath:', filePath);

  const base = path.resolve(ROOT_PATH);
  console.log('  base (resolved ROOT_PATH):', base);

  // Check if the file already exists as a symlink - use lstat to detect symlinks
  const fullPath = path.resolve(base, filePath);
  console.log('  fullPath (resolved):', fullPath);

  try {
    console.log('  Trying lstat on fullPath...');
    const stat = await fs.lstat(fullPath);
    console.log('  lstat successful:', {
      isSymbolicLink: stat.isSymbolicLink(),
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory()
    });

    if (stat.isSymbolicLink()) {
      console.log('  ⚠️  Symlink detected! Checking if it points outside...');
      // Resolve the symlink and check if it points outside the root
      const realPath = await fs.realpath(fullPath);
      console.log('  realpath result:', realPath);

      // Check if realPath is inside ROOT_PATH
      const relToBase = path.relative(base, realPath);
      const isOutside = relToBase.startsWith('..') || path.isAbsolute(relToBase);
      console.log('  relative path from base:', relToBase);
      console.log('  points outside:', isOutside);

      if (isOutside) {
        console.log('  🚨 SECURITY VIOLATION DETECTED!');
        throw new Error("Security: Symlink points outside allowed directory");
      } else {
        console.log('  ✅ Symlink is safe, points inside allowed directory');
      }
    } else {
      console.log('  ✅ Not a symlink, continuing');
    }
  } catch (error) {
    console.log('  ❌ lstat failed or security violation:', error.message);
    console.log('  This means file doesnt exist, checking path components...');

    // File doesn't exist, check all path components for symlinks
    const pathComponents = filePath.split('/').filter(Boolean);
    console.log('  Path components to check:', pathComponents);
    let currentPath = base;

    for (const component of pathComponents) {
      currentPath = path.join(currentPath, component);
      console.log('  Checking path component:', currentPath);

      try {
        // Use lstat to check if the path component itself is a symlink
        const stat = await fs.lstat(currentPath);
        console.log('  lstat on component successful:', {
          isSymbolicLink: stat.isSymbolicLink(),
          isFile: stat.isFile()
        });

        if (stat.isSymbolicLink()) {
          const realPath = await fs.realpath(currentPath);
          console.log('  Component symlink realpath:', realPath);

          const relToBase = path.relative(base, realPath);
          const isOutside = relToBase.startsWith('..') || path.isAbsolute(relToBase);
          console.log('  Component relative path:', relToBase);
          console.log('  Component points outside:', isOutside);

          if (isOutside) {
            console.log('  🚨 PATH COMPONENT SECURITY VIOLATION!');
            throw new Error("Security: Path component symlink points outside allowed directory");
          }
        }
      } catch (statError) {
        console.log('  Path component lstat failed:', statError.message);
        // Path component doesn't exist, continue checking
      }
    }

    console.log('  ✅ All path components checked, no violations found');
  }
}

async function testWithLogging() {
  console.log('🧪 Testing Security Fix with Detailed Logging\n');

  // Create temporary directories for testing
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'logging-security-test-'));
  const safeDir = path.join(tempDir, 'safe');
  const outsideDir = path.join(tempDir, 'outside');

  await fs.mkdir(safeDir, { recursive: true });
  await fs.mkdir(outsideDir, { recursive: true });

  try {
    // Create a sensitive file outside the safe directory
    const secretPath = path.join(outsideDir, 'secret.txt');
    await fs.writeFile(secretPath, 'SECRET DATA - should not be accessible', 'utf8');
    console.log('✓ Created secret file outside safe directory:', secretPath);

    // Create a symlink inside safeDir pointing to a file outside
    const symlinkPath = path.join(safeDir, 'safe-looking-file.txt');
    await fs.symlink(secretPath, symlinkPath);
    console.log('✓ Created symlink pointing outside safe directory:', symlinkPath);

    console.log('\n🚨 Testing the security check with logging...');

    // Test the security check function directly
    try {
      await checkSymlinkSecurityWithLogging(safeDir, 'safe-looking-file.txt');
      console.log('\n❌ SECURITY FAILURE: Security check passed when it should have failed!');
    } catch (error) {
      console.log('\n✅ SECURITY SUCCESS: Security check blocked the operation!');
      console.log('   Error:', error.message);
    }

  } finally {
    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });
  }

  console.log('\n🎉 Security test with logging complete!');
}

testWithLogging().catch(console.error);