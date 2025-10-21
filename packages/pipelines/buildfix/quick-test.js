#!/usr/bin/env node

import { requestPlan } from './src/iter/plan.js';
import { materializeSnippet } from './src/iter/dsl.js';
import { promises as fs } from 'fs';

const testError = {
  file: '/tmp/src.ts',
  line: 3,
  col: 10,
  code: 'TS2304',
  message: "Cannot find name 'undefinedVariable'",
  frame: "Cannot find name 'undefinedVariable'",
  key: 'TS2304|/tmp/src.ts|3',
};

const testHistory = {
  key: testError.key,
  file: testError.file,
  code: testError.code,
  attempts: [],
};

console.log('🧪 Testing gpt-oss:20b-cloud model...');
console.log('=====================================');

try {
  // Test plan generation
  console.log('1. Testing plan generation...');
  const plan = await requestPlan('gpt-oss:20b-cloud', testError, testHistory);
  console.log('✅ Plan generated:', plan.title);
  console.log('📝 Rationale:', plan.rationale);
  console.log('📋 Full plan object:', JSON.stringify(plan, null, 2));

  // Test DSL materialization
  console.log('\n2. Testing DSL materialization...');
  const snippetPath = '/tmp/test-snippet.mjs';
  await materializeSnippet(plan, snippetPath);
  console.log('✅ DSL materialized to', snippetPath);

  // Read and show the snippet
  const snippetContent = await fs.readFile(snippetPath, 'utf8');
  console.log('📄 Generated snippet:');
  console.log(snippetContent);

  console.log('\n🎉 SUCCESS: AI-powered TypeScript error fixing is working!');
} catch (error) {
  console.error('❌ FAILED:', error.message);
  if (error.cause) {
    console.error('Cause:', error.cause);
  }
}
