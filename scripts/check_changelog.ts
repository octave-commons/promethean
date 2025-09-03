import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const CHANGELOG_DIR = path.join(REPO_ROOT, 'changelog.d');
const CHANGELOG_MD = path.join(REPO_ROOT, 'CHANGELOG.md');

function checkDuplicateFragments(): boolean {
  const files = readdirSync(CHANGELOG_DIR).filter((f) => f.endsWith('.md'));
  const prefixes = new Map<string, string>();
  for (const file of files) {
    const prefix = file.split('.')[0];
    if (prefixes.has(prefix)) {
      console.error('Duplicate changelog fragments detected for PR', prefix, `(${prefixes.get(prefix)}, ${file})`);
      return false;
    }
    prefixes.set(prefix, file);
  }
  return true;
}

function changelogModified(): boolean {
  try {
    const output = execFileSync(
      "git",
      ["diff", "--name-only", "--cached", CHANGELOG_MD],
      { encoding: 'utf8' }
    ).trim();
    return output.length > 0;
  } catch {
    return false;
  }
}

function main(): number {
  let ok = true;
  if (!checkDuplicateFragments()) {
    ok = false;
  }
  if (changelogModified()) {
    console.error('Direct modifications to CHANGELOG.md are not allowed. Add a fragment under changelog.d/ instead.');
    ok = false;
  }
  return ok ? 0 : 1;
}

process.exit(main());
