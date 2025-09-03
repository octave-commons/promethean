import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const VALID_RE = /^\d+\.(added|changed|deprecated|removed|fixed|security)\.md$/;

function main(): number {
  const directory = path.resolve('changelog.d');
  if (!existsSync(directory)) {
    return 0;
  }
  const files = readdirSync(directory);
  const bad = files.filter((name) => name.endsWith('.md') && !VALID_RE.test(name));
  if (bad.length > 0) {
    console.error('Invalid changelog fragment names detected:');
    for (const name of bad) {
      console.error(` - ${name}`);
    }
    return 1;
  }
  return 0;
}

process.exit(main());
