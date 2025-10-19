#!/usr/bin/env node

// Realistic security test - simulating actual SmartGPT bridge scenario
import { writeFileContent } from './packages/smartgpt-bridge/dist/files.js';
import { mkdtemp, mkdir, symlink, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Simulate a realistic scenario where we have a sandbox directory
const SANDBOX_ROOT = await mkdtemp(join(tmpdir(), 'smartgpt-sandbox-'));
const USER_HOME = await mkdtemp(join(tmpdir(), 'user-home-'));

console.log('🏠 Realistic SmartGPT security test...');
console.log('📁 Sandbox root:', SANDBOX_ROOT);
console.log('🏠 User home directory:', USER_HOME);

try {
  // Create user's secret file outside the sandbox
  const userSecret = join(USER_HOME, 'secret.txt');
  await writeFile(userSecret, 'USER SECRET - should not be accessible');
  console.log('✅ Created user secret file:', userSecret);

  // Create malicious symlink from sandbox to user's secret
  const maliciousSymlink = join(SANDBOX_ROOT, 'innocent_file.txt');
  
  // This simulates an attacker creating a symlink in the sandbox
  await symlink(userSecret, maliciousSymlink);
  console.log('🔗 Attacker created symlink:', maliciousSymlink, '->', userSecret);

  // Verify the symlink resolves outside the sandbox
  const realPath = await import('node:fs').then(fs => fs.promises.realpath(maliciousSymlink));
  console.log('🎯 Symlink resolves to:', realPath);
  console.log('📁 Is outside sandbox?', !realPath.startsWith(SANDBOX_ROOT));

  // Now test if writeFileContent blocks this attack
  console.log('\n🚨 SmartGPT bridge attempting to write through symlink...');
  try {
    const result = await writeFileContent(SANDBOX_ROOT, 'innocent_file.txt', 'ATTACKER CONTROLLED CONTENT');
    console.log('❌ SECURITY BREACH! Write succeeded!');
    console.log('📄 User secret file content:', await readFile(userSecret, 'utf8'));
  } catch (error) {
    console.log('✅ Attack blocked:', error.message);
    console.log('📄 User secret file safe:', await readFile(userSecret, 'utf8'));
  }

  // Test legitimate file write (should work)
  console.log('\n✅ Testing legitimate file write...');
  await writeFileContent(SANDBOX_ROOT, 'legitimate.txt', 'This should work');
  const legitContent = await readFile(join(SANDBOX_ROOT, 'legitimate.txt'), 'utf8');
  console.log('📄 Legitimate write worked:', legitContent);

} catch (error) {
  console.error('❌ Test setup failed:', error);
  console.error('Stack trace:', error.stack);
} finally {
  console.log('\n📂 Test files preserved:');
  console.log('  Sandbox:', SANDBOX_ROOT);
  console.log('  User home:', USER_HOME);
}
