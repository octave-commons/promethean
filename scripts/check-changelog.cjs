const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function checkDuplicateFragments(changelogDir = path.join(repoRoot, "changelog.d")) {
  const prefixes = new Map();
  if (!fs.existsSync(changelogDir)) {
    return true;
  }
  for (const name of fs.readdirSync(changelogDir)) {
    if (!name.endsWith(".md")) continue;
    const prefix = name.split(".")[0];
    if (prefixes.has(prefix)) {
      console.error(
        "Duplicate changelog fragments detected for PR",
        prefix,
        `(${prefixes.get(prefix)}, ${name})`,
      );
      return false;
    }
    prefixes.set(prefix, name);
  }
  return true;
}

function changelogModified(
  changelogPath = path.join(repoRoot, "CHANGELOG.md"),
  runner = spawnSync,
) {
  const result = runner(
    "git",
    ["diff", "--name-only", "--cached", changelogPath],
    {
      encoding: "utf8",
    },
  );
  return result.stdout.trim().length > 0;
}

function main() {
  let ok = true;
  if (!checkDuplicateFragments()) {
    ok = false;
  }
  if (changelogModified()) {
    console.error(
      "Direct modifications to CHANGELOG.md are not allowed. Add a fragment under changelog.d/ instead.",
    );
    ok = false;
  }
  return ok ? 0 : 1;
}

module.exports = {
  checkDuplicateFragments,
  changelogModified,
  main,
};

if (require.main === module) {
  process.exit(main());
}
