import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

async function debugSecurityIssue() {
  console.log('🔍 Debugging Security Issue\n');

  // Create temporary directories for testing
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'debug-security-'));
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
    console.log('   Symlink target:', await fs.readlink(symlinkPath));

    // Test what lstat sees
    console.log('\n🔍 Debugging filesystem checks:');
    const lstatSymlink = await fs.lstat(symlinkPath);
    console.log('lstat(symlinkPath):', {
      isSymbolicLink: lstatSymlink.isSymbolicLink(),
      isFile: lstatSymlink.isFile(),
      isDirectory: lstatSymlink.isDirectory()
    });

    const realpathResult = await fs.realpath(symlinkPath);
    console.log('realpath(symlinkPath):', realpathResult);

    // Test what stat sees (follows symlinks)
    const statSymlink = await fs.stat(symlinkPath);
    console.log('stat(symlinkPath):', {
      isSymbolicLink: statSymlink.isSymbolicLink(),
      isFile: statSymlink.isFile(),
      isDirectory: statSymlink.isDirectory()
    });

    // Test path resolution
    const filePath = 'safe-looking-file.txt';
    const base = path.resolve(safeDir);
    const fullPath = path.resolve(base, filePath);

    console.log('\n🔍 Debugging path resolution:');
    console.log('ROOT_PATH:', safeDir);
    console.log('filePath:', filePath);
    console.log('base:', base);
    console.log('fullPath:', fullPath);

    // Test the security check logic
    console.log('\n🔍 Testing security check logic:');
    try {
      const stat = await fs.lstat(fullPath);
      console.log('lstat(fullPath) successful:', {
        isSymbolicLink: stat.isSymbolicLink(),
        isFile: stat.isFile()
      });

      if (stat.isSymbolicLink()) {
        const realPath = await fs.realpath(fullPath);
        console.log('realPath:', realPath);

        // Check if realPath is inside safeDir
        const relPath = path.relative(safeDir, realPath);
        console.log('relative(safeDir, realPath):', relPath);
        console.log('Points outside:', relPath.startsWith('..') || path.isAbsolute(relPath));
      }
    } catch (error) {
      console.log('lstat(fullPath) failed:', error.message);
    }

  } finally {
    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });
  }

  console.log('\n🎯 Debug complete!');
}

debugSecurityIssue().catch(console.error);