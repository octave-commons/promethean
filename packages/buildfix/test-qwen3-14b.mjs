#!/usr/bin/env node

import { runBenchmark } from './dist/benchmark/index.js';

const fixtures = [
  'missing-export',
  'optional-parameter',
  'property-not-exist',
  'type-annotation-missing',
  'add-import',
];
const model = 'qwen3:14b';

console.log(`Testing ${model} on all fixtures...\n`);

for (const fixture of fixtures) {
  console.log(`Testing fixture: ${fixture}`);
  try {
    const result = await runBenchmark({ model, fixture, quiet: true });
    console.log(`✅ ${model}: ${fixture} - Success (${result.duration}ms)`);
  } catch (error) {
    console.log(`❌ ${model}: ${fixture} - ${error.message}`);
  }
  console.log();
}
