# Security Testing Framework

This directory contains a comprehensive security testing framework designed to identify vulnerabilities across multiple attack vectors including input validation, prompt injection, and authentication bypasses.

## Overview

The security testing framework provides three main testing categories:

1. **Input Validation Fuzzing** - Comprehensive fuzzing for string, numeric, object, and array inputs
2. **Prompt Injection Testing** - LLM prompt injection attack detection and prevention
3. **Authentication Security Testing** - JWT, OAuth, session management, and rate limiting tests

## Quick Start

### Basic Usage

```typescript
import { 
  SecurityTestFramework, 
  quickFuzzTest, 
  quickPromptInjectionTest,
  quickAuthTest 
} from '@promethean/security';

// Quick fuzzing test
const fuzzResults = await quickFuzzTest(myValidator);

// Quick prompt injection test
const injectionResults = await quickPromptInjectionTest(myDetector);

// Quick authentication test
const authResults = await quickAuthTest();

// Comprehensive security assessment
const framework = new SecurityTestFramework();
const fullResults = await framework.runFullSecurityTest({
  userInputValidator: myInputValidator,
  configValidator: myConfigValidator
});
```

### Detailed Security Assessment

```typescript
import { SecurityTestFramework, BasicPromptInjectionDetector } from '@promethean/security';

const framework = new SecurityTestFramework(new BasicPromptInjectionDetector());

const results = await framework.runFullSecurityTest(
  {
    // Define your validators
    stringValidator: (input: any) => {
      if (typeof input === 'string') {
        if (input.includes('../') || input.includes('<script>')) {
          throw new Error('Dangerous input detected');
        }
      }
      return input;
    },
    numberValidator: (input: any) => {
      if (typeof input === 'number' && !isFinite(input)) {
        throw new Error('Invalid number');
      }
      return input;
    }
  },
  {
    includeFuzzing: true,
    includePromptInjection: true,
    includeAuthentication: true
  }
);

// Generate vulnerability report
const report = framework.generateVulnerabilityReport(results);
console.log(report.report);
```

## Testing Categories

### 1. Input Validation Fuzzing

The fuzzing framework generates comprehensive test cases for:

#### String Inputs
- **Path Traversal**: `../../../etc/passwd`, `..%2f..%2f..%2fetc%2fpasswd`
- **Script Injection**: `<script>alert("xss")</script>`, `javascript:alert("xss")`
- **SQL Injection**: `' OR 1=1 --`, `UNION SELECT * FROM users --`
- **Command Injection**: `ls; rm -rf /`, `cat /etc/passwd | grep root`
- **Format String**: `%s%s%s%s%s`, `%x%x%x%x%x`
- **LDAP Injection**: `*`, `(|(objectClass=*))`
- **NoSQL Injection**: `{"$ne": null}`, `{"$regex": ".*"}`
- **Unicode Attacks**: Homograph characters, zero-width spaces
- **Control Characters**: Null bytes, backspace, vertical tabs

#### Numeric Inputs
- Boundary values (0, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER)
- Special values (Infinity, -Infinity, NaN)
- Scientific notation edge cases
- Floating point precision limits

#### Object Inputs
- Prototype pollution attacks
- Circular references
- Deep nesting attempts
- Malformed property names

#### Array Inputs
- Large arrays (memory exhaustion)
- Sparse arrays
- Mixed type arrays
- Arrays with null/undefined values

### 2. Prompt Injection Testing

Tests against various LLM prompt injection techniques:

#### Jailbreak Attempts
- DAN (Do Anything Now) prompts
- Character role-playing attacks
- Hypnotic suggestion attempts
- Developer mode bypass attempts

#### Instruction Hijacking
- Direct instruction overrides
- New system prompt injection
- Context boundary testing
- Few-shot learning manipulation

#### Encoding Evasion
- Base64 encoded malicious instructions
- ROT13, hex, and other encoding schemes
- Unicode homograph attacks
- Leetspeak obfuscation

#### Advanced Techniques
- Cognitive load attacks
- Emotional manipulation
- Authority impersonation
- Multi-turn conversation attacks

### 3. Authentication Security Testing

Comprehensive authentication and authorization testing:

#### JWT Security
- Token expiration validation
- Signature verification
- Algorithm tampering ("none" algorithm)
- Claim manipulation
- Privilege escalation attempts

#### OAuth Flow Security
- Grant type validation
- Client authentication
- Redirect URI manipulation
- Authorization code security
- Scope escalation testing

#### Session Management
- Session fixation protection
- Session expiration handling
- Concurrent session limits
- Session hijacking prevention
- Logout invalidation

#### Rate Limiting & Brute Force
- Login attempt rate limiting
- Credential stuffing detection
- Distributed attack prevention
- Account lockout mechanisms

#### Replay Attack Protection
- Timestamp validation
- Nonce reuse detection
- Request manipulation detection
- Signature replay prevention

## Configuration Options

### Fuzzer Configuration

```typescript
const fuzzer = new Fuzzer({
  maxStringLength: 10000,        // Maximum string length for tests
  maxDepth: 10,                  // Maximum object nesting depth
  includeUnicode: true,          // Include Unicode attack tests
  includeControlChars: true,     // Include control character tests
  customPatterns: [              // Custom vulnerability patterns
    'custom-injection-pattern',
    'specific-attack-vector'
  ]
});
```

### Custom Prompt Injection Detection

```typescript
class CustomPromptInjectionDetector implements PromptInjectionDetector {
  async detect(prompt: string): Promise<PromptInjectionResult> {
    // Your custom detection logic
    return {
      detected: false,
      blocked: false,
      confidence: 0,
      response: undefined
    };
  }

  scanForSuspiciousPatterns(prompt: string): string[] {
    // Custom pattern scanning
    return [];
  }

  calculateRiskScore(prompt: string): number {
    // Custom risk calculation
    return 0.1;
  }
}

const framework = new SecurityTestFramework(new CustomPromptInjectionDetector());
```

## Test Results and Reporting

### Result Structure

```typescript
interface SecurityTestResults {
  fuzzing?: FuzzTestResult[];           // Fuzzing test results
  promptInjection?: PromptInjectionResult[];  // Prompt injection results
  authentication?: AuthTestResult[];   // Authentication test results
  summary: SecurityTestSummary;        // Overall summary
}

interface SecurityTestSummary {
  totalTests: number;          // Total number of tests run
  passedTests: number;         // Number of passed tests
  failedTests: number;         // Number of failed tests
  criticalFailures: number;    // Critical security failures
  overallScore: number;        // Overall security score (0-100)
  recommendations: string[];   // Security recommendations
  executionTime: number;       // Test execution time in ms
}
```

### Vulnerability Report

The framework generates detailed vulnerability reports:

```typescript
const report = framework.generateVulnerabilityReport(results);

console.log(report.report);  // Human-readable report
console.log(report.vulnerabilities);  // Structured vulnerability list
console.log(report.riskScore);        // Overall risk score (0-100)
```

Sample report output:
```
# Security Vulnerability Assessment Report

**Execution Time:** 1250ms
**Total Tests:** 156
**Passed:** 142 (91.0%)
**Failed:** 14
**Critical Failures:** 2
**Overall Security Score:** 85.2/100
**Risk Score:** 23/100

## Vulnerabilities Found

1. **Input Validation** (critical)
   - Path traversal attack not blocked
   - Recommendation: Implement proper input sanitization and validation

2. **Prompt Injection** (high)
   - DAN jailbreak attempt not detected
   - Recommendation: Implement stronger prompt injection detection

## Recommendations

1. URGENT: Strengthen prompt injection protection mechanisms
2. Implement comprehensive input validation and sanitization
3. Review and improve session security management
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Security Tests
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run security tests
        run: |
          node -e "
          import { SecurityTestFramework } from '@promethean/security';
          
          const framework = new SecurityTestFramework();
          const results = await framework.runFullSecurityTest({
            validator: myInputValidator
          });
          
          const report = framework.generateVulnerabilityReport(results);
          console.log(report.report);
          
          if (report.riskScore > 50) {
            process.exit(1);
          }
          "
```

### npm Script

```json
{
  "scripts": {
    "test:security": "node scripts/security-test.js",
    "test:security:fuzz": "node scripts/fuzz-test.js",
    "test:security:prompt-injection": "node scripts/prompt-injection-test.js"
  }
}
```

## Best Practices

### 1. Input Validation
- Always validate input on the server side
- Use allow-lists rather than block-lists
- Sanitize all user inputs before processing
- Implement proper error handling

### 2. Prompt Injection Prevention
- Use system prompts that clearly define boundaries
- Implement input filtering and output encoding
- Monitor for suspicious patterns
- Regular testing with updated injection techniques

### 3. Authentication Security
- Use strong token signing algorithms
- Implement proper token expiration
- Validate all OAuth parameters
- Monitor for authentication anomalies

### 4. Continuous Testing
- Integrate security tests into CI/CD pipelines
- Regularly update test patterns
- Monitor for new vulnerability types
- Maintain comprehensive test coverage

## Performance Considerations

- **Test Execution**: Full security suite typically runs in 1-5 seconds
- **Memory Usage**: Fuzzing tests allocate temporary memory for large inputs
- **Parallelization**: Tests can be run in parallel for faster execution
- **Caching**: Results can be cached for unchanged validators

## Extending the Framework

### Adding Custom Test Categories

```typescript
// Custom test category
export class CustomSecurityTester {
  generateTests(): CustomTestCase[] {
    return [
      {
        name: 'custom-attack',
        input: 'malicious input',
        expectedBehavior: 'block',
        severity: 'high'
      }
    ];
  }
}

// Integrate with main framework
const framework = new SecurityTestFramework();
const customResults = await customTester.runTests();
```

### Custom Vulnerability Scanners

```typescript
export class CustomVulnerabilityScanner {
  async scan(system: any): Promise<Vulnerability[]> {
    // Custom scanning logic
    return [];
  }
}
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**: Reduce `maxStringLength` and `maxDepth` in fuzzer config
2. **Slow Execution**: Disable unnecessary test categories or run tests in parallel
3. **False Positives**: Adjust expected behavior in test cases or improve validation logic
4. **Missing Vulnerabilities**: Add custom patterns to fuzzer configuration

### Debug Mode

```typescript
const framework = new SecurityTestFramework();
const results = await framework.runFullSecurityTest(validators, {
  includeFuzzing: true,
  includePromptInjection: true,
  includeAuthentication: true
});

// Enable detailed logging
console.log('Test results:', JSON.stringify(results, null, 2));
```

## Contributing

When adding new security tests:

1. Follow existing test patterns and naming conventions
2. Include comprehensive documentation
3. Add appropriate test cases
4. Update this README with new capabilities
5. Ensure backward compatibility

## License

This security testing framework is part of the Promethean project and follows the same licensing terms.