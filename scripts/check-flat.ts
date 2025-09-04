import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "packages";
const ALLOWED = new Set(["src", "dist", "node_modules", ".turbo", "coverage"]);
let bad: string[] = [];

for (const pkg of readdirSync(ROOT)) {
  const full = join(ROOT, pkg);
  if (!statSync(full).isDirectory()) continue;
  for (const child of readdirSync(full)) {
    const p = join(full, child);
    if (statSync(p).isDirectory() && !ALLOWED.has(child)) {
      bad.push(p);
    }
  }
}

if (bad.length) {
  console.error(
    "❌ Non-flat content inside package folders (only src/test/dist/... allowed):",
  );
  for (const b of bad) console.error(" -", b);
  process.exit(1);
} else {
  console.log("✅ packages/ is flat.");
}
