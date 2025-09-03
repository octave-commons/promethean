#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const LICENSE_SRC = path.join(ROOT, "LICENSE.txt");
const PACKAGES_DIR = path.join(ROOT, "packages");

if (!fs.existsSync(LICENSE_SRC)) {
  console.error(`License file not found at ${LICENSE_SRC}`);
  process.exit(1);
}

const license = fs.readFileSync(LICENSE_SRC);

for (const entry of fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const pkgDir = path.join(PACKAGES_DIR, entry.name);
  const pkgJson = path.join(pkgDir, "package.json");
  if (!fs.existsSync(pkgJson)) continue;
  const dest = path.join(pkgDir, "LICENSE.txt");
  fs.writeFileSync(dest, license);
  console.log(`Wrote license to ${dest}`);
}
