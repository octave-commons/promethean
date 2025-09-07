#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

/**
 * Discover packages that expose a `dev` script.
 * @param {string} root repository root
 * @returns {Promise<string[]>} list of package names
 */
export async function findRunnablePackages(root = process.cwd()) {
  const packagesDir = path.join(root, "packages");
  let entries;
  try {
    entries = await fs.readdir(packagesDir, { withFileTypes: true });
  } catch {
    return [];
  }
  const runnable = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgJsonPath = path.join(packagesDir, entry.name, "package.json");
    try {
      const pkg = JSON.parse(await fs.readFile(pkgJsonPath, "utf8"));
      if (pkg.scripts?.dev) {
        runnable.push(pkg.name ?? entry.name);
      }
    } catch {
      // ignore
    }
  }
  return runnable;
}

export function buildDevArgs(packages) {
  const args = ["run", "-r", "--parallel", "--workspace-root"];
  for (const pkg of packages) {
    args.push("--filter", pkg);
  }
  args.push("dev");
  return args;
}

async function main() {
  const packages = await findRunnablePackages();
  if (packages.length === 0) {
    console.log("No runnable packages with a dev script found.");
    return;
  }
  const args = buildDevArgs(packages);
  const child = spawn("pnpm", args, { stdio: "inherit" });
  child.on("exit", (code) => process.exit(code ?? 0));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
