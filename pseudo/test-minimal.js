#!/usr/bin/env node

import * as path from 'path';
import { promises as fs } from 'fs';

async function runMinimalTest() {
  console.log('🧪 Running minimal AI-powered TypeScript error fixing test...\n');

  // Test the core functionality without npm install overhead
  const { requestPlan } = await import('./packages/buildfix/src/iter/plan.js');

  // Mock error for testing
  const mockError = {
    file: '/test/src.ts',
    line: 3,
    col: 10,
    code: 'TS2552',
    message: "Cannot find name 'undefinedVar'.",
    frame: "Cannot find name 'undefinedVar'.",
    key: 'TS2304|/test/src.ts|3',
  };

  const mockHistory = {
    key: mockError.key,
    file: mockError.file,
    code: mockError.code,
    attempts: [],
  };

  console.log('📝 Testing plan generation with gpt-oss:20b-cloud...');
  console.log(`   Error: ${mockError.message}`);
  console.log(`   File: ${mockError.file}:${mockError.line}:${mockError.col}\n`);

  try {
    const startTime = Date.now();
    const plan = await requestPlan('gpt-oss:20b-cloud', mockError, mockHistory);
    const duration = Date.now() - startTime;

    console.log('✅ SUCCESS: Plan generated!');
    console.log(`   Title: "${plan.title}"`);
    console.log(`   Rationale: ${plan.rationale.substring(0, 100)}...`);
    console.log(`   Operations: ${plan.dsl.length} DSL ops`);
    console.log(`   Duration: ${duration}ms`);

    // Show first operation as example
    if (plan.dsl.length > 0) {
      console.log(`   First op: ${plan.dsl[0].op} on ${plan.dsl[0].file}`);
    }

    return true;
  } catch (error) {
    console.log('❌ FAILED: Plan generation failed');
    console.log(`   Error: ${error}`);
    return false;
  }
}

runMinimalTest()
  .then((success) => {
    console.log(`\n🏁 Test ${success ? 'PASSED' : 'FAILED'}!`);
    process.exit(success ? 0 : 1);
  })
  .catch(console.error);
