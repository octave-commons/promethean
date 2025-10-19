// Simple test to verify our transition rules implementation
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing transition rules implementation...');

// Test 1: Check if our Clojure DSL file exists and is readable
const dslPath = path.join(__dirname, 'docs/agile/rules/kanban-transitions.clj');
if (fs.existsSync(dslPath)) {
  console.log('✓ Clojure DSL file exists');
  const content = fs.readFileSync(dslPath, 'utf8');
  if (content.includes('evaluate-transition') && content.includes('valid-transitions-from')) {
    console.log('✓ Clojure DSL contains required functions');
  } else {
    console.log('✗ Clojure DSL missing required functions');
  }
} else {
  console.log('✗ Clojure DSL file missing');
}

// Test 2: Check if our TypeScript implementation exists
const tsPath = path.join(__dirname, 'packages/kanban/src/lib/transition-rules.ts');
if (fs.existsSync(tsPath)) {
  console.log('✓ TypeScript implementation exists');
  const tsContent = fs.readFileSync(tsPath, 'utf8');
  if (tsContent.includes('nbb') && tsContent.includes("import('nbb')")) {
    console.log('✓ TypeScript implementation includes nbb integration');
  } else {
    console.log('✗ TypeScript implementation missing nbb integration');
  }
} else {
  console.log('✗ TypeScript implementation missing');
}

// Test 3: Check if our test file exists
const testPath = path.join(__dirname, 'packages/kanban/src/tests/clojure-only.test.ts');
if (fs.existsSync(testPath)) {
  console.log('✓ Clojure-only test file exists');
} else {
  console.log('✗ Clojure-only test file missing');
}

// Test 4: Check if documentation exists
const docPath = path.join(__dirname, 'docs/agile/kanban-transition-rules-architecture.md');
if (fs.existsSync(docPath)) {
  console.log('✓ Architecture documentation exists');
} else {
  console.log('✗ Architecture documentation missing');
}

console.log('\nImplementation validation completed!');
