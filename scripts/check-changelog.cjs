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
    const m = name.match(/^(.+)\.(added|changed|deprecated|removed|fixed|security)\.md$/);
    if (!m) continue; // ignore invalid names; the fragments validator reports those
    const prefix = m[1];
    if (prefixes.has(prefix)) {
      console.error(
        "Duplicate changelog fragments detected for PR",
        prefix,
        `(${prefixes.get(prefix)}, ${name})`
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
  const relative = path.relative(repoRoot, changelogPath);
  const result = runner(
    "git",
    ["diff", "--name-only", "--cached", "--", relative],
    {
      encoding: "utf8",
      cwd: repoRoot,
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

if (require.main === module) {
  process.exit(main());
}

module.exports = { checkDuplicateFragments, changelogModified, main };
