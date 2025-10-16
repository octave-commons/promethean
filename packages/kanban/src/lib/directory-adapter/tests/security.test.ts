/**
 * Security validation tests for DirectoryAdapter
 */

import test from 'ava';
import { TaskSecurityValidator, createSecurityValidator, DEFAULT_SECURITY_OPTIONS } from '../security.js';
import type { FileOperationContext, SecurityOptions } from '../types.js';

const createContext = (operation: any, path: string, user?: string): FileOperationContext => ({
  operation,
  path,
  timestamp: new Date(),
  user,
  requestId: 'test-request-id',
  metadata: { baseDirectory: '/test/tasks' }
});

test('should validate safe paths', async t => {
  const validator = createSecurityValidator();
  const context = createContext('read', '/test/tasks/valid-task.md');
  
  const result = await validator.validatePath('/test/tasks/valid-task.md', context);
  
  t.true(result.valid);
  t.is(result.securityIssues.length, 0);
  t.is(result.normalizedPath, '/test/tasks/valid-task.md');
});

test('should detect path traversal attempts', async t => {
  const validator = createSecurityValidator();
  const context = createContext('read', '/test/tasks/../../../etc/passwd');
  
  const result = await validator.validatePath('/test/tasks/../../../etc/passwd', context);
  
  t.false(result.valid);
  t.true(result.securityIssues.some(issue => issue.includes('traversal')));
});

test('should detect encoded path traversal', async t => {
  const validator = createSecurityValidator();
  const context = createContext('read', '/test/tasks/..%2f..%2fetc%2fpasswd');
  
  const result = await validator.validatePath('/test/tasks/..%2f..%2fetc%2fpasswd', context);
  
  t.false(result.valid);
  t.true(result.securityIssues.some(issue => issue.includes('traversal')));
});

test('should reject dangerous file extensions', async t => {
  const validator = createSecurityValidator();
  const context = createContext('create', '/test/tasks/malicious.exe');
  
  const result = await validator.validatePath('/test/tasks/malicious.exe', context);
  
  t.false(result.valid);
  t.true(result.securityIssues.some(issue => issue.includes('extension')));
});

test('should allow only markdown files', async t => {
  const validator = createSecurityValidator();
  
  const validExtensions = ['.md', '.markdown'];
  const customValidator = createSecurityValidator({
    ...DEFAULT_SECURITY_OPTIONS,
    allowedExtensions: validExtensions
  });
  
  const context = createContext('create', '/test/tasks/valid.md');
  const result = await customValidator.validatePath('/test/tasks/valid.md', context);
  
  t.true(result.valid);
});

test('should detect suspicious file names', async t => {
  const validator = createSecurityValidator();
  const context = createContext('create', '/test/tasks/.hidden');
  
  const result = await validator.validatePath('/test/tasks/.hidden', context);
  
  t.true(result.valid); // Still valid but with warnings
  t.true(result.warnings.length > 0);
  t.true(result.warnings.some(warning => warning.includes('Suspicious')));
});

test('should validate safe content', async t => {
  const validator = createSecurityValidator();
  const context = createContext('write', '/test/tasks/safe.md');
  const content = '# Safe Task\n\nThis is safe markdown content.';
  
  const result = await validator.validateFileContent(content, context);
  
  t.true(result.valid);
  t.is(result.securityIssues.length, 0);
});

test('should detect dangerous script content', async t => {
  const validator = createSecurityValidator();
  const context = createContext('write', '/test/tasks/dangerous.md');
  const content = '<script>alert("xss")</script>';
  
  const result = await validator.validateFileContent(content, context);
  
  t.false(result.valid);
  t.true(result.securityIssues.some(issue => issue.includes('dangerous')));
});

test('should detect JavaScript URLs', async t => {
  const validator = createSecurityValidator();
  const context = createContext('write', '/test/tasks/js-url.md');
  const content = '[Click me](javascript:alert("xss"))';
  
  const result = await validator.validateFileContent(content, context);
  
  t.false(result.valid);
  t.true(result.securityIssues.some(issue => issue.includes('dangerous')));
});

test('should reject oversized files', async t => {
  const validator = createSecurityValidator({
    ...DEFAULT_SECURITY_OPTIONS,
    maxFileSize: 100 // Very small limit for testing
  });
  const context = createContext('write', '/test/tasks/large.md');
  const content = 'x'.repeat(200); // Larger than limit
  
  const result = await validator.validateFileContent(content, context);
  
  t.false(result.valid);
  t.true(result.securityIssues.some(issue => issue.includes('size')));
});

test('should detect binary content', async t => {
  const validator = createSecurityValidator();
  const context = createContext('write', '/test/tasks/binary.md');
  const content = 'Text with \x00 null byte and \x01 control character';
  
  const result = await validator.validateFileContent(content, context);
  
  t.false(result.valid);
  t.true(result.securityIssues.some(issue => issue.includes('binary')));
});

test('should validate operation context', async t => {
  const validator = createSecurityValidator({
    ...DEFAULT_SECURITY_OPTIONS,
    requireAuthentication: true
  });
  
  // Should fail without user
  const contextWithoutUser = createContext('read', '/test/tasks/task.md');
  t.false(await validator.validateOperation(contextWithoutUser));
  
  // Should succeed with user
  const contextWithUser = createContext('read', '/test/tasks/task.md', 'test-user');
  t.true(await validator.validateOperation(contextWithUser));
});

test('should prevent deletion of critical files', async t => {
  const validator = createSecurityValidator();
  const context = createContext('delete', '/test/tasks/README.md');
  
  const result = await validator.validatePath('/test/tasks/README.md', context);
  
  t.false(result.valid);
  t.true(result.securityIssues.some(issue => issue.includes('critical')));
});

test('should generate content hashes', t => {
  const validator = createSecurityValidator();
  const content = 'Test content for hashing';
  const hash1 = validator.generateContentHash(content);
  const hash2 = validator.generateContentHash(content);
  
  t.is(hash1, hash2);
  t.is(hash1.length, 64); // SHA-256 hex length
});

test('should sanitize file paths', t => {
  const validator = createSecurityValidator();
  
  const dangerousPath = 'file<>:"|?*.txt';
  const sanitized = validator.sanitizePath(dangerousPath);
  
  t.is(sanitized, 'file______.txt');
});

test('should handle different security levels', async t => {
  const strictValidator = createSecurityValidator({ level: 'strict' });
  const permissiveValidator = createSecurityValidator({ level: 'permissive' });
  
  const context = createContext('create', '/test/tasks/.hidden');
  
  const strictResult = await strictValidator.validatePath('/test/tasks/.hidden', context);
  const permissiveResult = await permissiveValidator.validatePath('/test/tasks/.hidden', context);
  
  // Both should be valid but strict might have more warnings
  t.true(strictResult.valid);
  t.true(permissiveResult.valid);
});

test('should validate markdown-specific security', async t => {
  const validator = createSecurityValidator();
  const context = createContext('write', '/test/tasks/markdown.md');
  
  // Test dangerous markdown links
  const dangerousMarkdown = '[Safe](javascript:alert("xss")) and [Also Safe](data:text/html,<script>alert(1)</script>)';
  const result = await validator.validateFileContent(dangerousMarkdown, context);
  
  t.false(result.valid);
  t.true(result.securityIssues.some(issue => issue.includes('link')));
});

test('should detect excessive HTML in markdown', async t => {
  const validator = createSecurityValidator();
  const context = createContext('write', '/test/tasks/html-heavy.md');
  
  // Create content with lots of HTML tags
  let htmlContent = '';
  for (let i = 0; i < 15; i++) {
    htmlContent += `<div>Content ${i}</div>\n`;
  }
  
  const result = await validator.validateFileContent(htmlContent, context);
  
  t.false(result.valid);
  t.true(result.securityIssues.some(issue => issue.includes('HTML')));
});