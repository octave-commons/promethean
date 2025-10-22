// Comprehensive test file for opencode diagnostic feature
// This file contains multiple types of violations to test all diagnostic capabilities

import { nonExistentModule } from 'fake-package';
import * as fs from 'fs';

// 1. Class violations (should trigger no-restricted-syntax)
class TestClass {
  constructor(public value: string) {}

  method(): void {
    console.log('method');
  }
}

// 2. Class expression violation
const classExpression = class {
  field: number = 42;
};

// 3. TypeScript errors
function untypedFunction(param1, param2) {
  return param1 + param2;
}

const untypedVariable = 42;
let mutableVariable = 'mutable';

// 4. Import violations
import defaultExport from 'non-existent-module';

// 5. Functional programming violations
let counter = 0;
counter++;

// 6. Code quality violations
function complexFunction(a, b, c, d, e, f) {
  if (a) {
    if (b) {
      if (c) {
        if (d) {
          if (e) {
            return f;
          }
        }
      }
    }
  }
  return null;
}

// 7. Memory leak patterns
const intervals: NodeJS.Timeout[] = [];
for (let i = 0; i < 10; i++) {
  intervals.push(
    setInterval(() => {
      console.log('leaking memory');
    }, 1000),
  );
}

// 8. Security violations
const userInput = 'user input';
eval(userInput);

// 9. Unused variables
const unusedVar = 'never used';
const anotherUnused = 'also never used';

// 10. Type assertion violations
const anyValue: any = 'test';
const unsafeAccess = anyValue.nonExistentProperty;

// 11. Promise violations
async function promiseViolation() {
  // Floating promise (no await or catch)
  fetch('https://example.com');
}

// 12. Import cycle simulation (would cause circular dependency)
// This is just a comment to simulate the concept

export { TestClass, untypedFunction, complexFunction };
