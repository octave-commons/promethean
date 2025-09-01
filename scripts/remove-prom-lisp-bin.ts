// scripts/remove-prom-lisp-bin.ts
import { promises as fs } from "node:fs";
import { join } from "node:path";

const ROOT = "packages";
const DRY = process.argv.includes("--dry-run");

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const dirs = await fs.readdir(ROOT, { withFileTypes: true });
  let touched = 0,
    skipped = 0,
    missing = 0;

  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const pkgPath = join(ROOT, d.name, "package.json");
    if (!(await fileExists(pkgPath))) {
      missing++;
      continue;
    }

    const raw = await fs.readFile(pkgPath, "utf8");
    let pkg: any;
    try {
      pkg = JSON.parse(raw);
    } catch {
      skipped++;
      continue;
    }

    let changed = false;

    if (pkg && pkg.bin) {
      // If bin is exactly {"prom-lisp": "dist/cli/lisp.js"} OR contains that entry
      if (
        typeof pkg.bin === "object" &&
        pkg.bin["prom-lisp"] === "dist/cli/lisp.js"
      ) {
        delete pkg.bin["prom-lisp"];
        if (Object.keys(pkg.bin).length === 0) delete pkg.bin;
        changed = true;
      }
    }

    if (changed) {
      touched++;
      if (!DRY) {
        await fs.writeFile(
          pkgPath,
          JSON.stringify(pkg, null, 2) + "\n",
          "utf8",
        );
      }
      console.log(`${DRY ? "[dry]" : "[edit]"} ${pkgPath}`);
    }
  }

  console.log(
    `Done. edited=${touched} skipped=${skipped} missing_pkg_json=${missing}`,
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
