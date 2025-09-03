const fs = require("node:fs");

const VALID_RE = /^\d+\.(added|changed|deprecated|removed|fixed|security)\.md$/;

function findInvalidFragments(dir = "changelog.d") {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md") && !VALID_RE.test(name));
}

function main() {
  const invalid = findInvalidFragments();
  if (invalid.length > 0) {
    console.error("Invalid changelog fragment names detected:");
    for (const name of invalid) {
      console.error(` - ${name}`);
    }
    return 1;
  }
  return 0;
}

module.exports = {
  findInvalidFragments,
  main,
};

if (require.main === module) {
  process.exit(main());
}
