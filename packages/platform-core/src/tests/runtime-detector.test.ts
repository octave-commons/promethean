/**
 * Tests for runtime detection system
 */

import test from 'ava';
import {
  detectRuntimeEnvironment,
  detectNodeEnvironment,
  detectDenoEnvironment,
  detectBrowserEnvironment,
  detectEdgeEnvironment,
  getRuntimeGlobal,
  supportsGlobalAPI,
} from '../detection/runtime-detector.js';
import { RuntimeEnvironment } from '../models/RuntimeInfo.js';

test('detectRuntimeEnvironment should return a valid result', (t) => {
  const result = detectRuntimeEnvironment();

  t.truthy(result.environment);
  t.is(typeof result.confidence, 'number');
  t.true(result.confidence >= 0 && result.confidence <= 1);
  t.is(typeof result.method, 'string');
  t.true(['global', 'process', 'api', 'feature', 'heuristic'].includes(result.method));
});

test('detectNodeEnvironment should detect Node.js when running in Node.js', (t) => {
  const result = detectNodeEnvironment();

  if (typeof process !== 'undefined' && process.versions?.node) {
    t.is(result.environment, RuntimeEnvironment.NODE);
    t.true(result.confidence > 0.8);
    t.true(result.metadata?.['hasProcess']);
    t.true(result.metadata?.['hasGlobal']);
  } else {
    // If not in Node.js, confidence should be low
    t.true(result.confidence < 0.5);
  }
});

test('detectDenoEnvironment should detect Deno when running in Deno', (t) => {
  const result = detectDenoEnvironment();

  const hasDeno = typeof globalThis !== 'undefined' && 'Deno' in globalThis;
  if (hasDeno) {
    t.is(result.environment, RuntimeEnvironment.DENO);
    t.true(result.confidence > 0.8);
    t.true(result.metadata?.['hasDeno']);
  } else {
    // If not in Deno, confidence should be low
    t.true(result.confidence < 0.5);
  }
});

test('detectBrowserEnvironment should detect browser when running in browser', (t) => {
  const result = detectBrowserEnvironment();

  if (typeof window !== 'undefined') {
    t.is(result.environment, RuntimeEnvironment.BROWSER);
    t.true(result.confidence > 0.8);
    t.true(result.metadata && result.metadata['hasWindow']);
  } else {
    // If not in browser, confidence should be low
    t.true(result.confidence < 0.5);
  }
});

test('detectEdgeEnvironment should detect edge environment appropriately', (t) => {
  const result = detectEdgeEnvironment();

  // Edge detection is more complex, just validate the structure
  t.truthy(result.environment);
  t.is(typeof result.confidence, 'number');
  t.is(typeof result.method, 'string');
  t.truthy(result.metadata);
});

test('getRuntimeGlobal should return a global object', (t) => {
  const globalObj = getRuntimeGlobal();
  t.truthy(globalObj);
  t.is(typeof globalObj, 'object');
});

test('supportsGlobalAPI should check API support correctly', (t) => {
  // Test with a common API that should exist in most environments
  const hasConsole = supportsGlobalAPI('console');
  t.is(typeof hasConsole, 'boolean');

  // Test with an API that likely doesn't exist
  const hasNonExistentAPI = supportsGlobalAPI('definitelyDoesNotExist12345');
  t.false(hasNonExistentAPI);
});

test('Runtime detection confidence should be reasonable', (t) => {
  const result = detectRuntimeEnvironment();

  // Confidence should be reasonable for detected environments
  if (result.environment !== RuntimeEnvironment.UNKNOWN) {
    t.true(result.confidence > 0.5);
  }

  // Unknown environment should have low confidence
  if (result.environment === RuntimeEnvironment.UNKNOWN) {
    t.true(result.confidence < 0.5);
  }
});

test('Runtime detection metadata should be consistent', (t) => {
  const result = detectRuntimeEnvironment();

  if (result.metadata) {
    // Metadata should only contain serializable values
    for (const [key, value] of Object.entries(result.metadata)) {
      t.is(typeof key, 'string');
      t.true(
        typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          typeof value === 'undefined',
      );
    }
  }
});
