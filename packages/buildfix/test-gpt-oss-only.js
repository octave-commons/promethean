#!/usr/bin/env node

// Override models to only test the working one
import { models } from './src/benchmark/index.js';
models.splice(1); // Keep only first model (gpt-oss:20b-cloud)

// Run the benchmark
await import('./src/benchmark/run-simple.js');
