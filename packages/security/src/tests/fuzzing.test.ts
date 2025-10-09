/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import test from 'ava';
import { Fuzzer, FuzzRunner, quickFuzzTest } from '../testing/fuzzing.js';

test('Fuzzer generates comprehensive string test cases', (t) => {
  const fuzzer = new Fuzzer();
  const stringTests = fuzzer.generateStringTests();
  
  t.true(stringTests.length > 0);
  
  // Check for critical security test patterns
  const testNames = stringTests.map(test => test.name);
  t.true(testNames.includes('path-traversal-basic'));
  t.true(testNames.includes('script-tag'));
  t.true(testNames.includes('sql-single-quote'));
  t.true(testNames.includes('command-injection-semicol'));
  t.true(testNames.includes('format-string-basic'));
  t.true(testNames.includes('ldap-injection-wildcard'));
  t.true(testNames.includes('nosql-injection-ne'));
});

test('Fuzzer generates numeric test cases', (t) => {
  const fuzzer = new Fuzzer();
  const numberTests = fuzzer.generateNumberTests();
  
  t.true(numberTests.length > 0);
  
  // Check for edge cases
  const testNames = numberTests.map(test => test.name);
  t.true(testNames.includes('infinity'));
  t.true(testNames.includes('nan'));
  t.true(testNames.includes('max-safe-integer'));
  t.true(testNames.includes('scientific-notation-large'));
});

test('Fuzzer generates object test cases', (t) => {
  const fuzzer = new Fuzzer();
  const objectTests = fuzzer.generateObjectTests();
  
  t.true(objectTests.length > 0);
  
  // Check for prototype pollution tests
  const testNames = objectTests.map(test => test.name);
  t.true(testNames.includes('proto-pollution'));
  t.true(testNames.includes('constructor-pollution'));
  t.true(testNames.includes('prototype-pollution-string'));
});

test('Fuzzer generates array test cases', (t) => {
  const fuzzer = new Fuzzer();
  const arrayTests = fuzzer.generateArrayTests();
  
  t.true(arrayTests.length > 0);
  
  const testNames = arrayTests.map(test => test.name);
  t.true(testNames.includes('empty-array'));
  t.true(testNames.includes('large-array'));
  t.true(testNames.includes('sparse-array'));
});

test('Fuzzer generates full test suite', (t) => {
  const fuzzer = new Fuzzer();
  const fullSuite = fuzzer.generateFullTestSuite();
  
  t.true(fullSuite.length > 50); // Should be comprehensive
  
  // Verify all test types are included
  const hasStringTests = fullSuite.some(test => typeof test.input === 'string');
  const hasNumberTests = fullSuite.some(test => typeof test.input === 'number');
  const hasObjectTests = fullSuite.some(test => typeof test.input === 'object' && !Array.isArray(test.input));
  const hasArrayTests = fullSuite.some(test => Array.isArray(test.input));
  
  t.true(hasStringTests);
  t.true(hasNumberTests);
  t.true(hasObjectTests);
  t.true(hasArrayTests);
});

test('FuzzRunner executes tests against validator', async (t) => {
  const fuzzer = new Fuzzer();
  const fuzzRunner = new FuzzRunner();
  
  // Create a simple validator that rejects dangerous inputs
  const safeValidator = (input: any) => {
    if (typeof input === 'string') {
      if (input.includes('../') || input.includes('<script>') || input.includes('SELECT')) {
        throw new Error('Dangerous input detected');
      }
    }
    return input;
  };
  
  const testCases = fuzzer.generateStringTests().slice(0, 10); // Test subset
  const results = await fuzzRunner.runTests(safeValidator, testCases);
  
  t.is(results.length, testCases.length);
  
  // Should have both passed and failed tests
  const passedTests = results.filter(r => r.result === 'passed');
  const failedTests = results.filter(r => r.result === 'failed');
  
  t.true(passedTests.length > 0);
  t.true(failedTests.length > 0);
});

test('FuzzRunner generates comprehensive report', async (t) => {
  const fuzzRunner = new FuzzRunner();

  const validator = (input: any) => {
    if (typeof input === 'string' && input.includes('dangerous')) {
      throw new Error('Rejected');
    }
    return input;
  };
  
  const testCases = [
    { name: 'safe-input', input: 'safe string', expectedBehavior: 'allow' as const },
    { name: 'dangerous-input', input: 'dangerous string', expectedBehavior: 'reject' as const },
    { name: 'another-safe', input: 'another safe', expectedBehavior: 'allow' as const }
  ];
  
  const results = await fuzzRunner.runTests(validator, testCases);
  const report = fuzzRunner.generateReport(results);
  
  t.is(report.total, 3);
  t.true(report.passed >= 0);
  t.true(report.failed >= 0);
  t.is(report.errors, 0);
  t.true(report.summary.includes('Fuzzing Summary:'));
  t.true(report.failures.length >= 0);
});

test('quickFuzzTest convenience function works', async (t) => {
  const validator = (input: any) => {
    if (typeof input === 'string' && input.length > 100) {
      throw new Error('Input too long');
    }
    return input;
  };
  
  const results = await quickFuzzTest(validator, { maxStringLength: 50 });
  
  t.true(results.length > 0);
  
  // Should have failures for inputs that are too long
  const failedTests = results.filter(r => r.result === 'failed');
  t.true(failedTests.length > 0);
  
  // Should have some passing tests too
  const passedTests = results.filter(r => r.result === 'passed');
  t.true(passedTests.length > 0);
});

test('Fuzzer respects configuration options', (t) => {
  const customConfig = {
    maxStringLength: 100,
    includeUnicode: false,
    includeControlChars: false,
    customPatterns: ['custom-pattern-test']
  };
  
  const fuzzer = new Fuzzer(customConfig);
  const stringTests = fuzzer.generateStringTests();
  
  t.true(stringTests.length > 0);
  
  // Should include custom pattern
  const hasCustomPattern = stringTests.some(test => 
    test.name.includes('custom-pattern') && test.input === 'custom-pattern-test'
  );
  t.true(hasCustomPattern);
  
  // Should not include unicode tests when disabled
  const hasUnicodeTests = stringTests.some(test => 
    test.name.includes('unicode')
  );
  t.false(hasUnicodeTests);
});

test('Fuzzer generates deep object tests', (t) => {
  const fuzzer = new Fuzzer();
  const objectTests = fuzzer.generateObjectTests(2);
  
  const hasDeepTest = objectTests.some(test => 
    test.name.includes('deep-nesting-2')
  );
  t.true(hasDeepTest);
});