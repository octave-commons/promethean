// Lint-only violations - no TypeScript errors, should trigger ESLint only
// Using valid TypeScript syntax but violating ESLint rules

// 1. var usage - valid TypeScript but violates no-var
var validButVar = 'this is valid TS but violates no-var';

// 2. let that should be const - valid TS but violates prefer-const
let validButConst = 'never reassigned but uses let';

// 3. Class with valid syntax - valid TS but violates no-restricted-syntax
class ValidButForbiddenClass {
  constructor(public value: string) {}

  validMethod(): string {
    return this.value;
  }
}

// 4. Class expression - valid TS but violates no-restricted-syntax
const validButForbiddenExpression = class {
  field: string = 'valid TS syntax';
};

// 5. Valid array mutation - valid TS but violates functional/immutable-data
const validArray: number[] = [1, 2, 3];
validArray.push(4); // Valid TS, but ESLint violation

// 6. Valid object mutation - valid TS but violates functional/immutable-data
const validObject: { prop: string } = { prop: 'value' };
validObject.newProp = 'new'; // Valid TS, but ESLint violation

// 7. Valid loop - valid TS but violates functional/no-loop-statements
for (let i: number = 0; i < 5; i++) {
  console.log(i); // Valid TS, but ESLint violation
}

// 8. Valid try-catch - valid TS but violates functional/no-try-statements
try {
  const result: any = JSON.parse('{"valid": "json"}');
  console.log(result);
} catch (error: any) {
  console.log(error); // Valid TS, but ESLint violation
}

// 9. Valid let usage - valid TS but violates functional/no-let
let validLet: string = 'valid TS but violates no-let';

// 10. Valid function with no return type - valid TS but violates explicit-module-boundary-types
function validFunction(param1: string, param2: number): string {
  return param1 + param2;
}

// 11. Valid any type - valid TS but violates no-explicit-any
const validAny: any = 'valid TS any type';

// 12. Valid require - valid TS but violates no-restricted-syntax
const validRequire = require('fs'); // Valid TS require, but ESLint violation

// 13. Valid module.exports - valid TS but violates no-restricted-syntax
module.exports = { valid: true }; // Valid TS, but ESLint violation

// 14. Valid floating promise - valid TS but violates no-floating-promises
const validPromise = fetch('https://example.com'); // Valid TS, but ESLint violation

// 15. Valid too many params - valid TS but violates max-params
function validTooMany(a: string, b: string, c: string, d: string, e: string, f: string): string {
  return a + b + c + d + e + f;
}
