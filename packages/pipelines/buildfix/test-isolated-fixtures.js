#!/usr/bin/env node

// Override models to test just 2 models
import { models } from './src/benchmark/index.js';
models.splice(2); // Keep only first 2 models

// Override fixtures to test just 2 fixtures
import { createAllFixtures } from './src/benchmark/fixture-template.js';
const originalCreateAllFixtures = createAllFixtures;
import('./src/benchmark/fixture-template.js').then((module) => {
  // Monkey patch to only create 2 fixtures
  module.fixtureTemplates.splice(2);
});

// Run the benchmark
await import('./src/benchmark/run-simple.js');
