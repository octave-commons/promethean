#!/usr/bin/env node

import { loadFile } from '@nbb/trail';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Debugging nbb loadFile...');

try {
  // Try loading the validation.clj file
  const validationPath = join(__dirname, 'dist', 'clojure', 'validation.clj');
  console.log('Loading from path:', validationPath);
  
  const result = await loadFile(validationPath);
  console.log('Load result type:', typeof result);
  console.log('Load result:', result);
  console.log('Load result keys:', result ? Object.keys(result) : 'null/undefined');
  
  // Check if it's a Promise
  if (result && typeof result.then === 'function') {
    console.log('Result is a Promise, awaiting...');
    const awaited = await result;
    console.log('Awaited result:', awaited);
    console.log('Awaited result keys:', awaited ? Object.keys(awaited) : 'null/undefined');
  }
  
} catch (error) {
  console.error('Error loading validation.clj:', error);
  console.error('Error stack:', error.stack);
}