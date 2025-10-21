# Security Documentation

## Overview

This document outlines the security measures implemented in the indexer-service to prevent path traversal vulnerabilities and other security threats.

## Critical Security Fix (P0)

### Path Traversal Vulnerability Resolution

A critical path traversal vulnerability was identified and fixed in the indexer-service. The vulnerability could allow unauthorized file system access through malicious path inputs.

#### Vulnerability Details

- **CVE ID**: Pending assignment
- **Severity**: Critical (P0)
- **Affected Endpoints**:
  - `/indexer/files/reindex`
  - `/indexer/index`
  - `/indexer/remove`
- **Attack Vector**: Path traversal through manipulated file paths

#### Security Measures Implemented

### 1. Enhanced Path Validation

The `isSafeRelPath()` function now implements comprehensive security checks:

```typescript
function isSafeRelPath(rel: string): boolean {
  // Type and length validation
  // Null byte injection prevention
  // Path traversal detection
  // Absolute path rejection
  // Dangerous character filtering
  // Platform-specific attack prevention
  // Path normalization validation
  // Glob pattern attack prevention
}
```

**Security Checks Performed:**

1. **Type Validation**: Ensures input is a string
2. **Length Limits**: Prevents DoS attacks (0 < length ≤ 256)
3. **Null Byte Prevention**: Blocks `\0` injection attempts
4. **Path Traversal Detection**: Blocks `..` and `.` components
5. **Absolute Path Rejection**: Prevents access to absolute filesystem paths
6. **Dangerous Character Filtering**: Blocks command injection characters (`<`, `>`, `|`, `&`, `;`, `` ` ``, `$`, `"`, `'`)
7. **Platform-Specific Protection**:
   - **Windows**: Blocks drive letters, UNC paths, reserved device names
   - **Unix**: Blocks `/dev/`, `/proc/`, `/sys/` filesystem access
8. **Path Normalization**: Validates paths after normalization
9. **Glob Pattern Security**: Prevents attack patterns in glob expressions

### 2. Secure Error Handling

Implemented secure error handling that prevents information disclosure:

```typescript
function handleSecureError(reply: FastifyReply, error: any, statusCode: number = 500): void {
  // Log full error for debugging
  reply.log.error({ err: error }, 'Operation failed');

  // Send generic error message to client
  const genericMessages = {
    400: 'Invalid request',
    500: 'Internal server error',
    // ... other status codes
  };

  reply.code(statusCode).send({
    ok: false,
    error: genericMessages[statusCode],
    requestId: reply.request.id, // For tracing
  });
}
```

**Benefits:**

- Prevents leakage of sensitive filesystem information
- Provides request tracing for debugging
- Maintains consistent error responses
- Logs detailed errors for administrators

### 3. Input Validation Improvements

#### Single Path Validation

- All single path inputs are validated through `isSafeRelPath()`
- Immediate rejection of malicious inputs

#### Array/Batch Validation

- Each element in path arrays is individually validated
- Batch operations reject entire request if any element is malicious
- Prevents mixed attacks (valid + malicious paths)

#### Request Validation

- Proper type checking for path parameters
- Early validation before processing
- Consistent error responses

## Security Testing

### Comprehensive Test Suite

The security fix includes extensive test coverage:

1. **Path Traversal Tests**

   - Basic `../` attacks
   - Windows backslash attacks
   - URL-encoded attacks
   - Double-encoded attacks
   - Mixed path attacks

2. **Null Byte Injection Tests**

   - Null byte in filename
   - Null byte with path traversal
   - Various null byte positions

3. **Dangerous Character Tests**

   - Command injection attempts
   - Shell metacharacter attacks
   - Redirection attacks

4. **Platform-Specific Tests**

   - Windows drive letters and UNC paths
   - Unix system paths (/dev, /proc, /sys)
   - Reserved device names

5. **Information Disclosure Tests**

   - Error message sanitization
   - Path leakage prevention
   - Stack trace protection

6. **Legitimate Use Tests**
   - Valid file operations
   - Normal glob patterns
   - Batch operations

### Running Security Tests

```bash
# Run all tests including security tests
pnpm test

# Run specific security tests
pnpm test -- --match="*security*"
```

## API Security Changes

### Modified Endpoints

#### `/indexer/files/reindex`

**Before:**

- Incomplete validation logic
- Potential for bypass attacks

**After:**

- Comprehensive path validation for both strings and arrays
- Each array element validated individually
- Secure error handling

#### `/indexer/index`

**Before:**

- Basic path validation
- Potential information disclosure

**After:**

- Enhanced path validation
- Secure error responses
- No information leakage

#### `/indexer/remove`

**Before:**

- Basic path validation
- Potential information disclosure

**After:**

- Enhanced path validation
- Secure error responses
- No information leakage

### Error Response Changes

**Before:**

```json
{
  "ok": false,
  "error": "ENOENT: no such file or directory, open '/etc/passwd'"
}
```

**After:**

```json
{
  "ok": false,
  "error": "Invalid request",
  "requestId": "req-12345"
}
```

## Security Best Practices

### For Developers

1. **Always validate inputs** before processing
2. **Use secure error handling** to prevent information disclosure
3. **Log detailed errors** server-side, send generic responses client-side
4. **Test security measures** with comprehensive test suites
5. **Keep dependencies updated** to patch known vulnerabilities

### For System Administrators

1. **Run the service** with minimal required permissions
2. **Use filesystem sandboxing** when possible
3. **Monitor logs** for security events
4. **Implement network segmentation** for additional protection
5. **Regular security audits** of the service configuration

### For Users

1. **Validate all file paths** before sending to the service
2. **Use relative paths** within the intended directory scope
3. **Avoid special characters** in file names when possible
4. **Implement client-side validation** as first line of defense

## Monitoring and Detection

### Security Events to Monitor

1. **Repeated validation failures** - May indicate attack attempts
2. **Unusual error patterns** - May indicate exploitation attempts
3. **High-frequency requests** - May indicate DoS attacks
4. **Unexpected file access patterns** - May indicate successful breaches

### Log Analysis

Monitor for these patterns in logs:

- Multiple 400 responses from same IP
- Path traversal attempts in error logs
- Unusual request patterns
- High error rates

## Future Security Enhancements

### Planned Improvements

1. **Authentication/Authorization** - Add access controls
2. **Rate Limiting Enhancement** - More sophisticated rate limiting
3. **Input Sanitization** - Additional input cleaning
4. **Audit Logging** - Comprehensive audit trail
5. **Security Headers** - HTTP security headers
6. **CORS Configuration** - Proper cross-origin controls

### Security Review Process

1. **Regular security audits** - Quarterly security reviews
2. **Dependency scanning** - Automated vulnerability scanning
3. **Penetration testing** - Annual security testing
4. **Code reviews** - Security-focused code reviews
5. **Threat modeling** - Regular threat assessment

## Reporting Security Issues

### Responsible Disclosure

If you discover a security vulnerability:

1. **Do not create public issues**
2. **Email security details** to: security@promethean.ai
3. **Include detailed information** about the vulnerability
4. **Allow reasonable time** for patching before disclosure
5. **Follow responsible disclosure** practices

### Security Contact

- **Email**: security@promethean.ai
- **PGP Key**: Available on request
- **Response Time**: Within 48 hours

## Compliance

### Standards Compliance

This security implementation addresses:

- **OWASP Top 10** - Path traversal (A01) and security logging (A09)
- **CWE-22** - Path traversal vulnerabilities
- **CWE-89** - Improper input validation
- **CWE-209** - Information exposure through error messages

### Regulatory Considerations

- **GDPR** - Data protection through access controls
- **SOC 2** - Security controls and monitoring
- **ISO 27001** - Information security management

---

**Last Updated**: 2025-10-15
**Version**: 1.0.0
**Review Date**: 2025-12-15
