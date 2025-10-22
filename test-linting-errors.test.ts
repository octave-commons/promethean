// Test file with intentional linting errors to demonstrate ESLint rules

import test from 'ava';

// Class declaration (should trigger error - classes not allowed)
class TestClass {
  constructor(private value: any) {}

  // Method with too many parameters (should trigger max-params error)
  methodWithTooManyParams(a: any, b: any, c: any, d: any, e: any): void {
    // Using 'let' (should trigger functional/no-let error)
    let mutableVar = 'test';
    mutableVar = 'changed';

    // Using var (should trigger no-var error)
    var oldStyleVar = 'bad';

    // Using setTimeout with identifier (should trigger restricted syntax error)
    setTimeout(() => {
      console.log('delayed');
    }, 100);

    // Using require (should trigger ESM only error)
    const module = require('fs');

    // Using any type (should trigger @typescript-eslint/no-explicit-any)
    const anyValue: any = 'test';

    // Floating promise (should trigger @typescript-eslint/no-floating-promises)
    Promise.resolve('test');

    // Try statement (should trigger functional/no-try-statements warning)
    try {
      JSON.parse('invalid');
    } catch (error) {
      console.log(error);
    }

    // Loop statement (should trigger functional/no-loop-statements warning)
    for (let i = 0; i < 10; i++) {
      console.log(i);
    }
  }
}

// Function that's too long (should trigger max-lines-per-function error)
test('function with too many lines', async (t) => {
  const framework = new TestClass('test');

  // This function will exceed the 50 line limit
  const line1 = 'line 1';
  const line2 = 'line 2';
  const line3 = 'line 3';
  const line4 = 'line 4';
  const line5 = 'line 5';
  const line6 = 'line 6';
  const line7 = 'line 7';
  const line8 = 'line 8';
  const line9 = 'line 9';
  const line10 = 'line 10';
  const line11 = 'line 11';
  const line12 = 'line 12';
  const line13 = 'line 13';
  const line14 = 'line 14';
  const line15 = 'line 15';
  const line16 = 'line 16';
  const line17 = 'line 17';
  const line18 = 'line 18';
  const line19 = 'line 19';
  const line20 = 'line 20';
  const line21 = 'line 21';
  const line22 = 'line 22';
  const line23 = 'line 23';
  const line24 = 'line 24';
  const line25 = 'line 25';
  const line26 = 'line 26';
  const line27 = 'line 27';
  const line28 = 'line 28';
  const line29 = 'line 29';
  const line30 = 'line 30';
  const line31 = 'line 31';
  const line32 = 'line 32';
  const line33 = 'line 33';
  const line34 = 'line 34';
  const line35 = 'line 35';
  const line36 = 'line 36';
  const line37 = 'line 37';
  const line38 = 'line 38';
  const line39 = 'line 39';
  const line40 = 'line 40';
  const line41 = 'line 41';
  const line42 = 'line 42';
  const line43 = 'line 43';
  const line44 = 'line 44';
  const line45 = 'line 45';
  const line46 = 'line 46';
  const line47 = 'line 47';
  const line48 = 'line 48';
  const line49 = 'line 49';
  const line50 = 'line 50';
  const line51 = 'line 51';
  const line52 = 'line 52';
  const line53 = 'line 53';
  const line54 = 'line 54';
  const line55 = 'line 55';

  t.true(line1 === 'line 1');
});

// Test with .only (should trigger ava/no-only-test error)
test.only('this test should not be committed', (t) => {
  t.pass();
});

// Test with identical title (should trigger ava/no-identical-title error)
test('function with too many lines', (t) => {
  t.pass();
});

// Function without explicit module boundary types (should trigger @typescript-eslint/explicit-module-boundary-types)
function untypedFunction(param) {
  return param.toString();
}

// Using module.exports (should trigger ESM only error)
module.exports = { TestClass, untypedFunction };
