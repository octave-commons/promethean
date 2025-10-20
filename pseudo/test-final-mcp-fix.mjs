// Direct test of the fixed path validation logic without building
import path from 'path';

// Copy the exact logic from the MCP validation file
const DANGEROUS_CHARS = ['<', '>', ':', '"', '|', '?', '*', '\0'];

const WINDOWS_RESERVED_NAMES = [
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
];

function validateBasicPathProperties(rel: string): boolean {
  if (rel.length > 4096) return false;
  if (rel !== rel.trim()) return false;
  return true;
}

function containsDangerousCharacters(trimmed: string): boolean {
  return DANGEROUS_CHARS.some((char) => trimmed.includes(char));
}

function validateWindowsPathSecurity(trimmed: string): boolean {
  if (/^[a-zA-Z]:/.test(trimmed)) return false;
  if (trimmed.startsWith('\\\\')) return false;
  if (trimmed.includes('\\')) return false;
  const baseName = path.basename(trimmed).toUpperCase();
  if (WINDOWS_RESERVED_NAMES.includes(baseName)) return false;
  return true;
}

function validateUnixPathSecurity(trimmed: string): boolean {
  if (process.platform !== 'win32') {
    const UNIX_DANGEROUS_PATHS = ['/dev/', '/proc/', '/sys/', '/etc/', '/root/', '/var/log/'];
    if (UNIX_DANGEROUS_PATHS.some((dangerous) => trimmed.startsWith(dangerous))) {
      return false;
    }
  }
  return true;
}

function validatePathNormalization(trimmed: string): boolean {
  try {
    const normalized = path.normalize(trimmed);
    if (path.isAbsolute(normalized) || normalized.includes('..')) {
      return false;
    }
    const fakeRoot = '/fake/root';
    const resolved = path.resolve(fakeRoot, normalized);
    if (!resolved.startsWith(fakeRoot)) {
      return false;
    }
  } catch {
    return false;
  }
  return true;
}

function containsGlobAttackPatterns(trimmed: string): boolean {
  const GLOB_ATTACK_PATTERNS = [
    /\*\*.*\.\./,
    /\.\.\/\*\*/,
    /\{\.\./,
    /\.\.\}/,
  ];
  return GLOB_ATTACK_PATTERNS.some((pattern) => pattern.test(trimmed));
}

// The FIXED detectPathTraversal function
function detectPathTraversal(trimmed: string): {
  isTraversal: boolean;
  isAbsolutePath: boolean;
  hasUnicodeAttack: boolean;
} {
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    // If decoding fails, continue with original
  }

  let hasUnicodeAttack = false;
  let hasTraversal = false;

  // Check for %2e%2e patterns in both encoded and decoded forms
  if (/%2e%2e/i.test(trimmed) || /%2e%2e/i.test(decoded)) {
    hasTraversal = true;
  }

  // Apply Unicode normalization to catch homograph attacks
  const normalized = decoded.normalize('NFKC');

  // Check for unicode homograph characters
  const unicodeHomographs = [
    '‥', '﹒', '．', '．．', '‥．', '．‥',
  ];

  // Check original string for unicode homographs
  for (const homograph of unicodeHomographs) {
    if (decoded.includes(homograph)) {
      hasUnicodeAttack = true;
      hasTraversal = true;
      break;
    }
  }

  // Check normalized string for dangerous patterns
  if (/\.\.\./.test(normalized)) {
    hasUnicodeAttack = true;
    hasTraversal = true;
  }

  const pathComponents = normalized.split(/[\\/]/);
  // FIXED: Only block '..' not '.'
  if (pathComponents.includes('..')) {
    hasTraversal = true;
  }

  const isAbsolutePath = path.isAbsolute(normalized);

  return {
    isTraversal: hasTraversal,
    isAbsolutePath,
    hasUnicodeAttack,
  };
}

// The main validation function (simplified)
function validatePathSecurity(rel: string) {
  const securityIssues = [];
  let riskLevel = 'low';

  const trimmed = rel.trim();

  // CRITICAL: Path traversal detection must run FIRST
  const traversalResult = detectPathTraversal(trimmed);
  if (traversalResult.isTraversal) {
    securityIssues.push('Path traversal attempt detected');
    riskLevel = traversalResult.hasUnicodeAttack || !traversalResult.isAbsolutePath ? 'critical' : 'high';
  } else if (traversalResult.isAbsolutePath) {
    securityIssues.push('Absolute path access detected');
    riskLevel = 'high';
  }

  // Basic validation
  if (!validateBasicPathProperties(rel)) {
    securityIssues.push('Invalid basic path properties');
    if (riskLevel !== 'critical') riskLevel = 'critical';
  }

  // Dangerous characters
  if (containsDangerousCharacters(trimmed)) {
    securityIssues.push('Dangerous characters detected');
    if (riskLevel !== 'critical') riskLevel = 'high';
  }

  // Windows-specific validation
  if (!validateWindowsPathSecurity(trimmed)) {
    securityIssues.push('Windows path security violation');
    if (riskLevel !== 'critical') riskLevel = 'high';
  }

  // Unix-specific validation
  if (!validateUnixPathSecurity(trimmed)) {
    securityIssues.push('Unix path security violation');
    if (trimmed.startsWith('~') && riskLevel !== 'critical') {
      riskLevel = 'critical';
    } else if (riskLevel !== 'critical') {
      riskLevel = 'high';
    }
  }

  // Path normalization
  if (!validatePathNormalization(trimmed)) {
    securityIssues.push('Path normalization failed');
    if (riskLevel === 'low') {
      riskLevel = 'medium';
    }
  }

  // Glob pattern attacks
  if (containsGlobAttackPatterns(trimmed)) {
    securityIssues.push('Glob pattern attack detected');
    if (riskLevel !== 'critical') riskLevel = 'medium';
  }

  const valid = securityIssues.length === 0;
  return {
    valid,
    sanitized: valid ? trimmed : undefined,
    securityIssues: valid ? undefined : securityIssues,
    riskLevel,
  };
}

// Test the exact cases mentioned in the issue
console.log('=== TESTING THE SPECIFIC USER ISSUE ===\n');

const testCases = [
  { path: '.', description: 'Current directory (.) - should be ALLOWED' },
  { path: '', description: 'Empty string - should be ALLOWED' },
  { path: './', description: 'Current directory with slash (./) - should be ALLOWED' },
  { path: './file.txt', description: 'Relative path with current dir (./file.txt) - should be ALLOWED' },
  { path: '..', description: 'Parent directory (..) - should be BLOCKED' },
  { path: '../file.txt', description: 'Parent directory access (../file.txt) - should be BLOCKED' },
];

testCases.forEach(({ path, description }) => {
  const result = validatePathSecurity(path);
  const status = result.valid ? '✅ ALLOWED' : '❌ BLOCKED';
  
  console.log(`${description}`);
  console.log(`  Result: ${status}`);
  if (!result.valid && result.securityIssues) {
    console.log(`  Issues: ${result.securityIssues.join(', ')}`);
  }
  console.log('');
});

console.log('=== SUMMARY ===');
console.log('The fix should allow "." and "./" while blocking ".."');
console.log('If you see "Path traversal attempt detected" for "." - the bug is NOT fixed');
console.log('If you see "." allowed - the bug is FIXED!');