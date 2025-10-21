#!/usr/bin/env node

// Comprehensive security test covering multiple attack vectors
import { writeFileContent } from './packages/smartgpt-bridge/dist/files.js';
import { mkdtemp, mkdir, symlink, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SANDBOX_ROOT = await mkdtemp(join(tmpdir(), 'comprehensive-test-'));
const ATTACK_DIR = await mkdtemp(join(tmpdir(), 'attack-dir-'));

console.log('🔒 Comprehensive symlink security test...');
console.log('📁 Sandbox:', SANDBOX_ROOT);
console.log('🎯 Attack directory:', ATTACK_DIR);

async function testCase(name, testFn) {
  console.log(`\n📋 Test: ${name}`);
  try {
    await testFn();
    console.log('✅ PASSED');
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  }
}

const results = [];

// Test 1: Direct symlink to outside file
results.push(await testCase('Direct symlink escape', async () => {
  const targetFile = join(ATTACK_DIR, 'secret.txt');
  await writeFile(targetFile, 'SECRET');
  
  const symlinkPath = join(SANDBOX_ROOT, 'malicious.txt');
  await symlink(targetFile, symlinkPath);
  
  try {
    await writeFileContent(SANDBOX_ROOT, 'malicious.txt', 'COMPROMISED');
    throw new Error('Security check failed to block direct symlink escape');
  } catch (error) {
    if (!error.message.includes('Security:')) throw error;
    const content = await readFile(targetFile, 'utf8');
    if (content !== 'SECRET') throw new Error('File was modified');
  }
}));

// Test 2: Directory traversal via symlink
results.push(await testCase('Directory traversal via symlink', async () => {
  const symlinkDir = join(SANDBOX_ROOT, 'escape-hatch');
  await symlink(ATTACK_DIR, symlinkDir);
  
  try {
    await writeFileContent(SANDBOX_ROOT, 'escape-hatch/traversal.txt', 'COMPROMISED');
    throw new Error('Security check failed to block directory traversal');
  } catch (error) {
    if (!error.message.includes('Security:')) throw error;
  }
}));

// Test 3: Multi-level symlink chain
results.push(await testCase('Multi-level symlink chain', async () => {
  const targetFile = join(ATTACK_DIR, 'chain-target.txt');
  await writeFile(targetFile, 'CHAIN SECRET');
  
  const intermediateLink = join(SANDBOX_ROOT, 'intermediate');
  await symlink(targetFile, intermediateLink);
  
  const finalLink = join(SANDBOX_ROOT, 'final');
  await symlink(intermediateLink, finalLink);
  
  try {
    await writeFileContent(SANDBOX_ROOT, 'final', 'COMPROMISED');
    throw new Error('Security check failed to block symlink chain');
  } catch (error) {
    if (!error.message.includes('Security:')) throw error;
    const content = await readFile(targetFile, 'utf8');
    if (content !== 'CHAIN SECRET') throw new Error('File was modified through chain');
  }
}));

// Test 4: Legitimate file operations (should work)
results.push(await testCase('Legitimate file operations', async () => {
  await writeFileContent(SANDBOX_ROOT, 'legit.txt', 'This should work');
  await writeFileContent(SANDBOX_ROOT, 'nested/deep/file.txt', 'Nested file should work');
  
  const content1 = await readFile(join(SANDBOX_ROOT, 'legit.txt'), 'utf8');
  const content2 = await readFile(join(SANDBOX_ROOT, 'nested/deep/file.txt'), 'utf8');
  
  if (content1 !== 'This should work') throw new Error('Legitimate write failed');
  if (content2 !== 'Nested file should work') throw new Error('Nested write failed');
}));

// Test 5: Symlink within sandbox (should work)
results.push(await testCase('Internal symlinks (allowed)', async () => {
  const targetFile = join(SANDBOX_ROOT, 'target.txt');
  await writeFile(targetFile, 'Internal target');
  
  const symlinkPath = join(SANDBOX_ROOT, 'internal-link.txt');
  await symlink(targetFile, symlinkPath);
  
  // This should work because both files are within the sandbox
  await writeFileContent(SANDBOX_ROOT, 'internal-link.txt', 'Updated via symlink');
  
  const content = await readFile(targetFile, 'utf8');
  if (content !== 'Updated via symlink') throw new Error('Internal symlink write failed');
}));

const passed = results.filter(Boolean).length;
const total = results.length;

console.log(`\n🎯 Results: ${passed}/${total} tests passed`);

if (passed === total) {
  console.log('🎉 All security tests PASSED! The symlink protection is working correctly.');
} else {
  console.log('🚨 Some security tests FAILED! There are vulnerabilities that need to be addressed.');
}

console.log('\n📂 Test files preserved:');
console.log('  Sandbox:', SANDBOX_ROOT);
console.log('  Attack directory:', ATTACK_DIR);
