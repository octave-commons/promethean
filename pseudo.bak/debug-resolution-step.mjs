// Debug the resolution step specifically
import path from 'path';
import fs from 'fs';

const ROOT_PATH = process.env.MCP_ROOT_PATH || process.cwd();
const testFile = 'AGENTS.md';

console.log(`=== Debugging resolution step ===`);
console.log(`ROOT_PATH: ${ROOT_PATH}`);
console.log(`Test file: ${testFile}`);

// Test the normalizeToRoot function step by step
const base = path.resolve(ROOT_PATH);
console.log(`Base: ${base}`);

const rel = testFile || '.';
console.log(`Rel: ${rel}`);

const abs = path.resolve(base, rel);
console.log(`Abs: ${abs}`);

const relToBase = path.relative(base, abs);
console.log(`Rel to base: ${relToBase}`);
console.log(`Rel to base starts with '..': ${relToBase.startsWith('..')}`);
console.log(`Rel to base is absolute: ${path.isAbsolute(relToBase)}`);

// Check isInsideRoot logic
const isInside = !(relToBase.startsWith('..') || path.isAbsolute(relToBase));
console.log(`Is inside root: ${isInside}`);

// Check if file exists and is file
console.log(`File exists: ${fs.existsSync(abs)}`);
if (fs.existsSync(abs)) {
  const stats = fs.statSync(abs);
  console.log(`Is file: ${stats.isFile()}`);
  console.log(`Stats:`, stats);
}

// Test the exact logic from resolvePath
async function testResolvePath() {
  const sanitizedPath = testFile;
  console.log(`\n=== Testing resolvePath logic ===`);
  console.log(`Sanitized path: ${sanitizedPath}`);

  const normalizeToRoot = (ROOT_PATH, rel = '.') => {
    console.log(`  normalizeToRoot called with: ${ROOT_PATH}, ${rel}`);
    const base = path.resolve(ROOT_PATH);
    console.log(`  base: ${base}`);

    if (rel && path.isAbsolute(rel)) {
      console.log(`  rel is absolute: ${rel}`);
      const abs = path.resolve(rel);
      console.log(`  resolved abs: ${abs}`);

      const isInsideRoot = (ROOT_PATH, absOrRel) => {
        const base = path.resolve(ROOT_PATH);
        const abs = path.isAbsolute(absOrRel)
          ? path.resolve(absOrRel)
          : path.resolve(base, absOrRel);
        const relToBase = path.relative(base, abs);
        const result = !(relToBase.startsWith('..') || path.isAbsolute(relToBase));
        console.log(
          `  isInsideRoot check: base=${base}, absOrRel=${absOrRel}, relToBase=${relToBase}, result=${result}`,
        );
        return result;
      };

      if (isInsideRoot(ROOT_PATH, abs)) {
        console.log(`  returning abs: ${abs}`);
        return abs;
      }
      throw new Error('path outside root');
    }

    console.log(`  rel is not absolute, resolving relative`);
    const abs = path.resolve(base, rel || '.');
    console.log(`  resolved abs: ${abs}`);
    const relToBase = path.relative(base, abs);
    console.log(`  relToBase: ${relToBase}`);

    if (relToBase.startsWith('..') || path.isAbsolute(relToBase)) {
      console.log(`  throwing path outside root`);
      throw new Error('path outside root');
    }
    console.log(`  returning abs: ${abs}`);
    return abs;
  };

  try {
    const absCandidate = normalizeToRoot(ROOT_PATH, sanitizedPath);
    console.log(`  absCandidate: ${absCandidate}`);

    const isInsideRoot = (ROOT_PATH, absOrRel) => {
      const base = path.resolve(ROOT_PATH);
      const abs = path.isAbsolute(absOrRel) ? path.resolve(absOrRel) : path.resolve(base, absOrRel);
      const relToBase = path.relative(base, abs);
      const result = !(relToBase.startsWith('..') || path.isAbsolute(relToBase));
      console.log(
        `  isInsideRoot: base=${base}, absOrRel=${absOrRel}, relToBase=${relToBase}, result=${result}`,
      );
      return result;
    };

    if (!isInsideRoot(ROOT_PATH, absCandidate)) {
      console.log(`  ❌ isInsideRoot returned false`);
      return null;
    }

    console.log(`  ✅ isInsideRoot returned true`);

    const st = await fs.stat(absCandidate);
    console.log(`  file stats:`, st);
    console.log(`  isFile: ${st.isFile()}`);

    if (st.isFile()) {
      console.log(`  ✅ returning absCandidate: ${absCandidate}`);
      return absCandidate;
    }
  } catch (error) {
    console.log(`  ❌ Exception: ${error.message}`);
    return null;
  }
  return null;
}

testResolvePath()
  .then((result) => {
    console.log(`\nFinal result: ${result}`);
  })
  .catch(console.error);
