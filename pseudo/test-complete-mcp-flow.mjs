// Test the actual MCP files function with the path validation fix
import path from 'path';
import fs from 'fs';

// Copy the exact logic from the fixed validation and files modules
const ROOT_PATH = process.env.MCP_ROOT_PATH || process.cwd();

// Fixed validation functions (copied from comprehensive.ts)
const DANGEROUS_CHARS = ['<', '>', ':', '"', '|', '?', '*', '\0'];

function validateBasicPathProperties(rel) {
  if (rel.length > 4096) return false;
  if (rel !== rel.trim()) return false;
  return true;
}

function containsDangerousCharacters(trimmed) {
  return DANGEROUS_CHARS.some((char) => trimmed.includes(char));
}

function validateWindowsPathSecurity(trimmed) {
  if (/^[a-zA-Z]:/.test(trimmed)) return false;
  if (trimmed.startsWith('\\\\')) return false;
  if (trimmed.includes('\\')) return false;
  return true;
}

function validateUnixPathSecurity(trimmed) {
  if (process.platform !== 'win32') {
    const UNIX_DANGEROUS_PATHS = ['/dev/', '/proc/', '/sys/', '/etc/', '/root/', '/var/log/'];
    if (UNIX_DANGEROUS_PATHS.some((dangerous) => trimmed.startsWith(dangerous))) {
      return false;
    }
  }
  return true;
}

function validatePathNormalization(trimmed) {
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

function containsGlobAttackPatterns(trimmed) {
  const GLOB_ATTACK_PATTERNS = [/\*\*.*\.\./, /\.\.\/\*\*/, /\{\.\./, /\.\.\}/];
  return GLOB_ATTACK_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function detectPathTraversal(trimmed) {
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
  const unicodeHomographs = ['‥', '﹒', '．', '．．', '‥．', '．‥'];

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

function validatePathSecurity(rel) {
  const securityIssues = [];
  let riskLevel = 'low';

  const trimmed = rel.trim();

  // CRITICAL: Path traversal detection must run FIRST
  const traversalResult = detectPathTraversal(trimmed);
  if (traversalResult.isTraversal) {
    securityIssues.push('Path traversal attempt detected');
    riskLevel =
      traversalResult.hasUnicodeAttack || !traversalResult.isAbsolutePath ? 'critical' : 'high';
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

// Simplified validateMcpOperation without circular dependency
async function validateMcpOperation(rootPath, targetPath, operation = 'read') {
  const securityResult = validatePathSecurity(targetPath);
  if (!securityResult.valid) {
    return {
      valid: false,
      error: `Security validation failed: ${securityResult.securityIssues?.join(', ')}`,
    };
  }

  const sanitizedPath = securityResult.sanitized || targetPath;

  // Inline path normalization functions to avoid circular dependency
  const normalizeToRoot = (ROOT_PATH, rel = '.') => {
    const base = path.resolve(ROOT_PATH);

    // If rel is already absolute, check if it's inside the root
    if (rel && path.isAbsolute(rel)) {
      const abs = path.resolve(rel);
      if (isInsideRoot(ROOT_PATH, abs)) {
        return abs;
      }
      throw new Error('path outside root');
    }

    // Otherwise resolve relative to the base
    const abs = path.resolve(base, rel || '.');
    const relToBase = path.relative(base, abs);
    if (relToBase.startsWith('..') || path.isAbsolute(relToBase)) {
      throw new Error('path outside root');
    }
    return abs;
  };

  const isInsideRoot = (ROOT_PATH, absOrRel) => {
    const base = path.resolve(ROOT_PATH);
    // If absOrRel is already absolute, use it directly
    const abs = path.isAbsolute(absOrRel) ? path.resolve(absOrRel) : path.resolve(base, absOrRel);
    const relToBase = path.relative(base, abs);
    return !(relToBase.startsWith('..') || path.isAbsolute(relToBase));
  };

  // Normalize path and check if it's inside root
  const normalizedPath = normalizeToRoot(rootPath, sanitizedPath);
  if (!isInsideRoot(rootPath, normalizedPath)) {
    return {
      valid: false,
      error: 'Path outside allowed root directory',
    };
  }

  return {
    valid: true,
    sanitizedPath,
  };
}

// Simplified resolvePath function
async function resolvePath(ROOT_PATH, p) {
  if (!p) return null;

  // Use comprehensive validation first
  const validationResult = await validateMcpOperation(ROOT_PATH, p, 'read');
  if (!validationResult.valid) {
    return null;
  }

  try {
    const normalizeToRoot = (ROOT_PATH, rel = '.') => {
      const base = path.resolve(ROOT_PATH);
      if (rel && path.isAbsolute(rel)) {
        const abs = path.resolve(rel);
        const isInsideRoot = (ROOT_PATH, absOrRel) => {
          const base = path.resolve(ROOT_PATH);
          const abs = path.isAbsolute(absOrRel)
            ? path.resolve(absOrRel)
            : path.resolve(base, absOrRel);
          const relToBase = path.relative(base, abs);
          return !(relToBase.startsWith('..') || path.isAbsolute(relToBase));
        };
        if (isInsideRoot(ROOT_PATH, abs)) {
          return abs;
        }
        throw new Error('path outside root');
      }
      const abs = path.resolve(base, rel || '.');
      const relToBase = path.relative(base, abs);
      if (relToBase.startsWith('..') || path.isAbsolute(relToBase)) {
        throw new Error('path outside root');
      }
      return abs;
    };

    const absCandidate = normalizeToRoot(ROOT_PATH, validationResult.sanitizedPath);

    const isInsideRoot = (ROOT_PATH, absOrRel) => {
      const base = path.resolve(ROOT_PATH);
      const abs = path.isAbsolute(absOrRel) ? path.resolve(absOrRel) : path.resolve(base, absOrRel);
      const relToBase = path.relative(base, abs);
      return !(relToBase.startsWith('..') || path.isAbsolute(relToBase));
    };

    if (!isInsideRoot(ROOT_PATH, absCandidate)) return null;
    const st = await fs.stat(absCandidate);
    if (st.isFile()) return absCandidate;
  } catch {
    return null;
  }
  return null;
}

// Test the complete flow for AGENTS.md
async function testAgentsMd() {
  console.log('=== Testing complete MCP file resolution for AGENTS.md ===\n');

  const testFile = 'AGENTS.md';
  console.log(`1. Testing path: ${testFile}`);

  // Step 1: Validation
  const validationResult = await validateMcpOperation(ROOT_PATH, testFile, 'read');
  console.log(`2. Validation result:`, validationResult);

  if (!validationResult.valid) {
    console.log(`❌ Validation failed: ${validationResult.error}`);
    return;
  }

  // Step 2: Resolution
  const abs = await resolvePath(ROOT_PATH, validationResult.sanitizedPath);
  console.log(`3. Resolved path: ${abs}`);

  if (!abs) {
    console.log(`❌ Resolution failed: file not found`);
    return;
  }

  // Step 3: Read file
  try {
    const rel = path.relative(ROOT_PATH, abs).replace(/\\/g, '/');
    const raw = await fs.readFile(abs, 'utf8');
    const lines = raw.split(/\r?\n/);

    console.log(`4. File read successfully!`);
    console.log(`   - Relative path: ${rel}`);
    console.log(`   - Total lines: ${lines.length}`);
    console.log(`   - First 100 chars: ${raw.substring(0, 100)}...`);
    console.log(`\n✅ SUCCESS: AGENTS.md can be read by MCP!`);
  } catch (error) {
    console.log(`❌ File read failed: ${error.message}`);
  }
}

testAgentsMd().catch(console.error);
