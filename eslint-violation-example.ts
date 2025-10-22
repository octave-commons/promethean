// This file intentionally violates ESLint rules for testing purposes

class BadClass {
  private value: any;

  constructor(value: any) {
    this.value = value;
  }

  doSomething(param1: string, param2: number, param3: boolean, param4: string, param5: Date): void {
    let mutableVar = 'this should be const';
    var oldStyleVar = 'should not use var';

    if (param1) {
      if (param2 > 0) {
        if (param3) {
          console.log('nested if that could be collapsed');
        }
      }
    }

    // Very long function that exceeds max-lines-per-function
    for (let i = 0; i < 100; i++) {
      console.log(i);
    }

    for (let j = 0; j < 50; j++) {
      console.log(j);
    }

    for (let k = 0; k < 25; k++) {
      console.log(k);
    }

    for (let l = 0; l < 10; l++) {
      console.log(l);
    }

    for (let m = 0; m < 5; m++) {
      console.log(m);
    }

    // Try-catch block (violates functional/no-try-statements)
    try {
      JSON.parse(this.value);
    } catch (error) {
      console.error('Parse failed', error);
    }

    // Unsafe assignment and call
    const unsafeData: any = JSON.parse(this.value);
    const result = unsafeData.someMethod();

    // Floating promise
    Promise.resolve('test');

    // Inverted boolean check
    if (!param1 !== true) {
      console.log('inverted boolean');
    }
  }
}

// Using require instead of import
const fs = require('fs');

// Default export (violates import/no-default-export)
export default BadClass;

// Using restricted import
import { ContextStore } from '@promethean/persistence';
