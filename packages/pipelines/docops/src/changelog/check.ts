#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  fileURLToPath(new URL("../../../..", import.meta.url)),
);

export function checkDuplicateFragments(
  changelogDir: string = path.join(repoRoot, "changelog.d"),
): boolean {
  const prefixes = new Map<string, string>();
  if (!fs.existsSync(changelogDir)) {
    return true;
  }
  for (const name of fs.readdirSync(changelogDir)) {
    if (!name.endsWith(".md")) continue;
    const m = name.match(
      /^(.+)\.(added|changed|deprecated|removed|fixed|security)\.md$/,
    );
    if (!m) continue; // ignore invalid names; the fragments validator reports those
    const prefix = m[1]!;
    if (prefixes.has(prefix)) {
      console.error(
        "Duplicate changelog fragments detected for PR",
        prefix,
        `(${prefixes.get(prefix) ?? ""}, ${name})`,
      );
      return false;
    }
    prefixes.set(prefix, name);
  }
  return true;
}

export function changelogModified(
  changelogPath: string = path.join(repoRoot, "CHANGELOG.md"),
  runner: typeof spawnSync = spawnSync,
): boolean {
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

export function main(): number {
  const fragmentsOk = checkDuplicateFragments();
  const changelogOk = !changelogModified();
  if (!changelogOk) {
    console.error(
      "Direct modifications to CHANGELOG.md are not allowed. Add a fragment under changelog.d/ instead.",
    );
  }
  return fragmentsOk && changelogOk ? 0 : 1;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  process.exit(main());
}
