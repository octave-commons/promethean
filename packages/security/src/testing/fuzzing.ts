/**
 * Security Testing Framework - Input Validation Fuzzing
 * 
 * This module provides comprehensive fuzzing utilities for testing input validation
 * and identifying potential security vulnerabilities across different input types.
 */

export type FuzzTestCase = {
  name: string;
  input: any;
  expectedBehavior?: 'allow' | 'sanitize' | 'reject';
  description?: string;
};

export type FuzzerConfig = {
  maxStringLength?: number;
  maxDepth?: number;
  includeUnicode?: boolean;
  includeControlChars?: boolean;
  customPatterns?: string[];
};

export class Fuzzer {
  private config: Required<FuzzerConfig>;

  constructor(config: FuzzerConfig = {}) {
    this.config = {
      maxStringLength: config.maxStringLength ?? 10000,
      maxDepth: config.maxDepth ?? 10,
      includeUnicode: config.includeUnicode ?? true,
      includeControlChars: config.includeControlChars ?? true,
      customPatterns: config.customPatterns ?? [],
    };
  }

  /**
   * Generate fuzzing test cases for string inputs
   */
  generateStringTests(): FuzzTestCase[] {
    const tests: FuzzTestCase[] = [];

    // Basic boundary tests
    tests.push(
      { name: 'empty-string', input: '', expectedBehavior: 'allow' },
      { name: 'single-char', input: 'a', expectedBehavior: 'allow' },
      { name: 'max-length', input: 'a'.repeat(this.config.maxStringLength), expectedBehavior: 'allow' },
      { name: 'overflow-length', input: 'a'.repeat(this.config.maxStringLength + 1), expectedBehavior: 'reject' }
    );

    // Special characters that commonly cause issues
    tests.push(
      { name: 'null-byte', input: '\x00', expectedBehavior: 'sanitize' },
      { name: 'backspace', input: '\x08', expectedBehavior: 'sanitize' },
      { name: 'vertical-tab', input: '\x0b', expectedBehavior: 'sanitize' },
      { name: 'form-feed', input: '\x0c', expectedBehavior: 'sanitize' },
      { name: 'carriage-return', input: '\r', expectedBehavior: 'sanitize' }
    );

    // Path traversal attacks
    tests.push(
      { name: 'path-traversal-basic', input: '../../../etc/passwd', expectedBehavior: 'reject' },
      { name: 'path-traversal-windows', input: '..\\..\\..\\windows\\system32\\config\\sam', expectedBehavior: 'reject' },
      { name: 'path-traversal-encoded', input: '..%2f..%2f..%2fetc%2fpasswd', expectedBehavior: 'reject' },
      { name: 'path-traversal-double-slash', input: '....//....//....//etc/passwd', expectedBehavior: 'reject' },
      { name: 'path-traversal-unicode', input: '..%u2215..%u2215..%u2215etc%u2215passwd', expectedBehavior: 'reject' }
    );

    // Script injection attacks
    tests.push(
      { name: 'script-tag', input: '<script>alert("xss")</script>', expectedBehavior: 'sanitize' },
      { name: 'javascript-protocol', input: 'javascript:alert("xss")', expectedBehavior: 'sanitize' },
      { name: 'onerror-attr', input: '<img src="x" onerror="alert(\'xss\')">', expectedBehavior: 'sanitize' },
      { name: 'onclick-attr', input: '<a href="#" onclick="alert(\'xss\')">click</a>', expectedBehavior: 'sanitize' },
      { name: 'eval-injection', input: 'eval("alert(\'xss\')")', expectedBehavior: 'sanitize' }
    );

    // SQL injection patterns
    tests.push(
      { name: 'sql-single-quote', input: "' OR 1=1 --", expectedBehavior: 'sanitize' },
      { name: 'sql-double-quote', input: '" OR 1=1 --', expectedBehavior: 'sanitize' },
      { name: 'sql-union-select', input: 'UNION SELECT * FROM users --', expectedBehavior: 'sanitize' },
      { name: 'sql-comment', input: '/* comment */', expectedBehavior: 'sanitize' },
      { name: 'sql-blind-injection', input: "' AND (SELECT COUNT(*) FROM users) > 0 --", expectedBehavior: 'sanitize' }
    );

    // Command injection patterns
    tests.push(
      { name: 'command-injection-semicol', input: 'ls; rm -rf /', expectedBehavior: 'sanitize' },
      { name: 'command-injection-pipe', input: 'cat /etc/passwd | grep root', expectedBehavior: 'sanitize' },
      { name: 'command-injection-backticks', input: '`whoami`', expectedBehavior: 'sanitize' },
      { name: 'command-injection-logical-and', input: 'ls && rm -rf /', expectedBehavior: 'sanitize' },
      { name: 'command-injection-logical-or', input: 'ls || rm -rf /', expectedBehavior: 'sanitize' }
    );

    // Format string attacks
    tests.push(
      { name: 'format-string-basic', input: '%s%s%s%s%s', expectedBehavior: 'sanitize' },
      { name: 'format-string-hex', input: '%x%x%x%x%x', expectedBehavior: 'sanitize' },
      { name: 'format-string-pointer', input: '%p%p%p%p%p', expectedBehavior: 'sanitize' },
      { name: 'format-string-width', input: '%1000s', expectedBehavior: 'sanitize' }
    );

    // LDAP injection
    tests.push(
      { name: 'ldap-injection-wildcard', input: '*', expectedBehavior: 'sanitize' },
      { name: 'ldap-injection-or', input: '(|(objectClass=*))', expectedBehavior: 'sanitize' },
      { name: 'ldap-injection-filter', input: '*)(&(objectClass=*)', expectedBehavior: 'sanitize' }
    );

    // NoSQL injection
    tests.push(
      { name: 'nosql-injection-ne', input: '{"$ne": null}', expectedBehavior: 'sanitize' },
      { name: 'nosql-injection-regex', input: '{"$regex": ".*"}', expectedBehavior: 'sanitize' },
      { name: 'nosql-injection-where', input: '{"$where": "return true"}', expectedBehavior: 'sanitize' }
    );

    // Unicode attacks
    if (this.config.includeUnicode) {
      tests.push(
        { name: 'unicode-homograph', input: 'аррӏе.com', expectedBehavior: 'allow', description: 'Cyrillic letters resembling latin' },
        { name: 'unicode-zero-width', input: 'a\u200bb', expectedBehavior: 'sanitize', description: 'Zero-width space' },
        { name: 'unicode-right-to-left', input: 'a\u202eb', expectedBehavior: 'sanitize', description: 'Right-to-left override' },
        { name: 'unicode-normalization', input: 'e\u0301', expectedBehavior: 'allow', description: 'Combining acute accent' }
      );
    }

    // Control characters
    if (this.config.includeControlChars) {
      tests.push(
        { name: 'control-ascii-range', input: Array.from({length: 32}, (_, i) => String.fromCharCode(i)).join(''), expectedBehavior: 'sanitize' },
        { name: 'control-del', input: String.fromCharCode(127), expectedBehavior: 'sanitize' },
        { name: 'control-high-ascii', input: Array.from({length: 128}, (_, i) => String.fromCharCode(i + 128)).join(''), expectedBehavior: 'sanitize' }
      );
    }

    // Add custom patterns
    for (const pattern of this.config.customPatterns) {
      tests.push({
        name: `custom-pattern-${pattern.substring(0, 20)}`,
        input: pattern,
        expectedBehavior: 'sanitize',
        description: 'Custom vulnerability pattern'
      });
    }

    return tests;
  }

  /**
   * Generate fuzzing test cases for numeric inputs
   */
  generateNumberTests(): FuzzTestCase[] {
    return [
      { name: 'zero', input: 0, expectedBehavior: 'allow' },
      { name: 'positive-int', input: 42, expectedBehavior: 'allow' },
      { name: 'negative-int', input: -42, expectedBehavior: 'allow' },
      { name: 'float-positive', input: 3.14, expectedBehavior: 'allow' },
      { name: 'float-negative', input: -3.14, expectedBehavior: 'allow' },
      { name: 'infinity', input: Infinity, expectedBehavior: 'reject' },
      { name: 'negative-infinity', input: -Infinity, expectedBehavior: 'reject' },
      { name: 'nan', input: NaN, expectedBehavior: 'reject' },
      { name: 'max-safe-integer', input: Number.MAX_SAFE_INTEGER, expectedBehavior: 'allow' },
      { name: 'min-safe-integer', input: Number.MIN_SAFE_INTEGER, expectedBehavior: 'allow' },
      { name: 'max-value', input: Number.MAX_VALUE, expectedBehavior: 'reject' },
      { name: 'min-value', input: Number.MIN_VALUE, expectedBehavior: 'allow' },
      { name: 'epsilon', input: Number.EPSILON, expectedBehavior: 'allow' },
      { name: 'scientific-notation-large', input: 1e308, expectedBehavior: 'reject' },
      { name: 'scientific-notation-small', input: 1e-324, expectedBehavior: 'allow' }
    ];
  }

  /**
   * Generate fuzzing test cases for object inputs
   */
  generateObjectTests(maxDepth: number = 3): FuzzTestCase[] {
    const tests: FuzzTestCase[] = [];

    // Basic object structures
    tests.push(
      { name: 'empty-object', input: {}, expectedBehavior: 'allow' },
      { name: 'single-property', input: { a: 1 }, expectedBehavior: 'allow' },
      { name: 'multiple-properties', input: { a: 1, b: 'test', c: true }, expectedBehavior: 'allow' }
    );

    // Prototype pollution attempts
    tests.push(
      { name: 'proto-pollution', input: { __proto__: { polluted: true } }, expectedBehavior: 'sanitize' },
      { name: 'constructor-pollution', input: { constructor: { prototype: { polluted: true } } }, expectedBehavior: 'sanitize' },
      { name: 'prototype-pollution-string', input: JSON.parse('{"__proto__":{"polluted":true}}'), expectedBehavior: 'sanitize' }
    );

    // Circular references (these will be handled by JSON.stringify issues)
    tests.push(
      { name: 'circular-reference', input: (() => { const obj: any = {}; obj.self = obj; return obj; })(), expectedBehavior: 'reject' }
    );

    // Deep nesting
    if (maxDepth > 1) {
      const deepObj = this.createDeepObject(maxDepth);
      tests.push({ name: `deep-nesting-${maxDepth}`, input: deepObj, expectedBehavior: 'reject' });
    }

    return tests;
  }

  /**
   * Generate fuzzing test cases for array inputs
   */
  generateArrayTests(): FuzzTestCase[] {
    return [
      { name: 'empty-array', input: [], expectedBehavior: 'allow' },
      { name: 'single-element', input: [1], expectedBehavior: 'allow' },
      { name: 'mixed-types', input: [1, 'test', true, null, undefined], expectedBehavior: 'allow' },
      { name: 'large-array', input: new Array(10000).fill(0), expectedBehavior: 'reject' },
      { name: 'sparse-array', input: new Array(1000), expectedBehavior: 'allow' },
      { name: 'array-with-null', input: [null, null, null], expectedBehavior: 'allow' },
      { name: 'array-with-undefined', input: [undefined, undefined], expectedBehavior: 'allow' }
    ];
  }

  /**
   * Generate comprehensive fuzzing test suite
   */
  generateFullTestSuite(): FuzzTestCase[] {
    return [
      ...this.generateStringTests(),
      ...this.generateNumberTests(),
      ...this.generateObjectTests(),
      ...this.generateArrayTests()
    ];
  }

  private createDeepObject(depth: number): any {
    if (depth <= 0) return 'deep';
    return { nested: this.createDeepObject(depth - 1) };
  }
}

export type FuzzTestResult = {
  testCase: FuzzTestCase;
  result: 'passed' | 'failed' | 'error';
  actualBehavior?: 'allow' | 'sanitize' | 'reject';
  error?: Error;
  output?: any;
};

// Convenience function for quick fuzz testing
export async function quickFuzzTest(
  validator: (input: any) => any,
  options?: { maxStringLength?: number; includeUnicode?: boolean }
): Promise<FuzzTestResult[]> {
  const fuzzer = new Fuzzer(options);
  const fuzzRunner = new FuzzRunner();
  const testCases = fuzzer.generateFullTestSuite();
  
  return await fuzzRunner.runTests(validator, testCases);
}

export class FuzzRunner {
  /**
   * Run fuzzing tests against a validation function
   */
  async runTests(
    validator: (input: any) => any,
    testCases: FuzzTestCase[]
  ): Promise<FuzzTestResult[]> {
    const results: FuzzTestResult[] = [];

    for (const testCase of testCases) {
      try {
        const result = validator(testCase.input);
        const actualBehavior = this.determineActualBehavior(result, testCase.input);
        
        const passed = this.isTestPassed(testCase, actualBehavior, result);
        
        results.push({
          testCase,
          result: passed ? 'passed' : 'failed',
          actualBehavior,
          output: result
        });
      } catch (error) {
        const actualBehavior = this.determineActualBehaviorFromError(error as Error);
        const passed = this.isTestPassed(testCase, actualBehavior, error);
        
        results.push({
          testCase,
          result: passed ? 'passed' : 'failed',
          actualBehavior,
          error: error as Error
        });
      }
    }

    return results;
  }

  private determineActualBehavior(result: any, input: any): 'allow' | 'sanitize' | 'reject' {
    if (result === null || result === undefined) {
      return 'reject';
    }
    
    if (typeof result === 'string' && typeof input === 'string' && result !== input) {
      return 'sanitize';
    }
    
    return 'allow';
  }

  private determineActualBehaviorFromError(error: Error): 'allow' | 'sanitize' | 'reject' {
    if (error.name === 'ValidationError' || error.name === 'SecurityError') {
      return 'reject';
    }
    return 'sanitize';
  }

  private isTestPassed(testCase: FuzzTestCase, actualBehavior: string, _result: any): boolean {
    if (!testCase.expectedBehavior) {
      return true; // If no expectation, test passes by default
    }
    
    return actualBehavior === testCase.expectedBehavior;
  }

  /**
   * Generate a summary report of fuzzing results
   */
  generateReport(results: FuzzTestResult[]): {
    total: number;
    passed: number;
    failed: number;
    errors: number;
    failures: FuzzTestResult[];
    summary: string;
  } {
    const total = results.length;
    const passed = results.filter(r => r.result === 'passed').length;
    const failed = results.filter(r => r.result === 'failed').length;
    const errors = results.filter(r => r.result === 'error').length;
    const failures = results.filter(r => r.result === 'failed');

    const summary = `Fuzzing Summary: ${passed}/${total} tests passed (${((passed/total)*100).toFixed(1)}%), ${failed} failed, ${errors} errors`;

    return {
      total,
      passed,
      failed,
      errors,
      failures,
      summary
    };
  }
}