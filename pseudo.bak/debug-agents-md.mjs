// Simple test to check what's happening with AGENTS.md resolution
import path from 'path';
import fs from 'fs';

const ROOT_PATH = process.env.MCP_ROOT_PATH || process.cwd();
console.log(`ROOT_PATH: ${ROOT_PATH}`);
console.log(`Current working directory: ${process.cwd()}`);

// Test the exact path that should be resolved
const testPath = 'AGENTS.md';
console.log(`\nTesting path: ${testPath}`);

// Step 1: Check if file exists
const directPath = path.join(ROOT_PATH, testPath);
console.log(`Direct join path: ${directPath}`);
console.log(`File exists: ${fs.existsSync(directPath)}`);

if (fs.existsSync(directPath)) {
  const stats = fs.statSync(directPath);
  console.log(`Is file: ${stats.isFile()}`);
  console.log(`File size: ${stats.size} bytes`);
}

// Step 2: Test path.resolve (like normalizeToRoot does)
const resolvedPath = path.resolve(ROOT_PATH, testPath);
console.log(`\nResolved path: ${resolvedPath}`);
console.log(`File exists: ${fs.existsSync(resolvedPath)}`);

// Step 3: Test the relative path logic
const base = path.resolve(ROOT_PATH);
const abs = path.resolve(base, testPath || '.');
const relToBase = path.relative(base, abs);
console.log(`\nBase: ${base}`);
console.log(`Abs: ${abs}`);
console.log(`Rel to base: ${relToBase}`);
console.log(`Rel to base starts with '..': ${relToBase.startsWith('..')}`);
console.log(`Rel to base is absolute: ${path.isAbsolute(relToBase)}`);

// Step 4: Test the isInsideRoot logic
const isInsideRoot = !(relToBase.startsWith('..') || path.isAbsolute(relToBase));
console.log(`Is inside root: ${isInsideRoot}`);

// Step 5: List what's actually in the directory
console.log(`\nFiles in directory:`);
try {
  const files = fs.readdirSync(ROOT_PATH);
  const agentsFiles = files.filter((f) => f.toLowerCase().includes('agent'));
  console.log('Files containing "agent":', agentsFiles);

  const exactMatch = files.find((f) => f === 'AGENTS.md');
  console.log(`Exact match for 'AGENTS.md': ${exactMatch ? 'FOUND' : 'NOT FOUND'}`);

  if (exactMatch) {
    console.log('✅ File should be found!');
  } else {
    console.log('❌ No exact match found');
    console.log('Similar files:', agentsFiles);
  }
} catch (error) {
  console.log(`Error reading directory: ${error.message}`);
}
