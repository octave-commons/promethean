import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const jsTests = execSync("git ls-files '*.test.js'", { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

let hasCompiled = false;
for (const js of jsTests) {
  const ts = js.replace(/\.js$/, '.ts');
  if (existsSync(ts)) {
    console.error(`Compiled test output detected: ${js}`);
    hasCompiled = true;
  }
}

if (hasCompiled) {
  process.exit(1);
}
