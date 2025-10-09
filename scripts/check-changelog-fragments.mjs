import fs from 'node:fs';

const VALID_RE = /^\d+(?:\.\d+)*\.(added|changed|deprecated|removed|fixed|security)\.md$/;

function findInvalidFragments(dir = 'changelog.d') {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => name.endsWith('.md') && !VALID_RE.test(name));
}

function main() {
  const invalid = findInvalidFragments();
  if (invalid.length > 0) {
    console.error('Invalid changelog fragment names detected:');
    for (const name of invalid) {
      console.error(` - ${name}`);
    }
    return 1;
  }
  return 0;
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}

export { findInvalidFragments, main };
