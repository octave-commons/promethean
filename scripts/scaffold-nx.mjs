#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry");
const REPO = path.resolve(process.cwd());
const BASE = path.join(REPO, "packages"); // packages live here
const CONFIG = path.join(REPO, "config"); // centralized configs live here

const TEST_CMD = "ava"; // change to "vitest run" or "jest" if needed

const rel = (p) => path.relative(REPO, p);
const exists = async (p) => !!(await fs.stat(p).catch(() => null));

async function writeIfMissing(p, content) {
  // if (await exists(p)) return false;
  console.log(`create ${rel(p)}`);
  if (!DRY) await fs.writeFile(p, content, "utf8");
  return true;
}

async function patchJson(file, patchFn) {
  let obj = {};
  let created = false;
  if (await exists(file)) {
    const s = await fs.readFile(file, "utf8");
    try {
      obj = JSON.parse(s);
    } catch {
      /* keep empty */
    }
  } else {
    created = true;
  }
  const next = patchFn(obj);
  const changed = `${JSON.stringify(next, null, 2)}\n`;
  const prev = `${JSON.stringify(obj, null, 2)}\n`;
  if (created || prev !== changed) {
    console.log(`${created ? "create" : "update"} ${rel(file)}`);
    if (!DRY) await fs.writeFile(file, changed, "utf8");
  }
}

function projectJson(pkgName, projectRoot, sourceRoot) {
  // Nx likes simple names; avoid scopes here
  const nxName = `ts-${pkgName}`;
  return {
    name: nxName,
    root: projectRoot.replace(REPO + path.sep, ""),
    sourceRoot: sourceRoot.replace(REPO + path.sep, ""),
    targets: {
      build: {
        executor: "nx:run-commands",
        options: { command: "tsc -b" },
        outputs: ["{projectRoot}/dist"],
      },
      typecheck: {
        executor: "nx:run-commands",
        options: { command: "tsc -p tsconfig.json --noEmit" },
      },
      test: {
        executor: "nx:run-commands",
        options: { command: TEST_CMD },
      },
      lint: {
        executor: "nx:run-commands",
        options: { command: "eslint ." },
      },
    },
    tags: ["scope:packages"],
  };
}

function tsconfigJson() {
  return {
    extends: "../../config/tsconfig.base.json",
    compilerOptions: {
      rootDir: "src",
      outDir: "dist",
      composite: true,
      declaration: true,
    },
    include: ["src/**/*"],
    // NOTE: add "references": [{ "path": "../foo" }] per-package if needed
  };
}

function defaultPkgJson(pkgName) {
  return {
    name: `@promethean/${pkgName}`,
    version: "0.0.0",
    private: true,
    type: "module",
    main: "./dist/index.js",
    types: "./dist/index.d.ts",
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
      },
    },
    files: ["dist"],
    scripts: {
      build: "tsc -b",
      clean: "rimraf dist",
      typecheck: "tsc -p tsconfig.json --noEmit",
      test: TEST_CMD,
      lint: "eslint .",
    },
  };
}

async function scaffoldPackage(dirent) {
  const pkgName = dirent.name;
  const pkgRoot = path.join(BASE, pkgName);
  const srcDir = path.join(pkgRoot, "src");

  if (!(await exists(srcDir))) {
    console.log(`skip   ${rel(pkgRoot)} (no src/)`);
    return null;
  }

  // project.json
  const pjPath = path.join(pkgRoot, "project.json");
  await patchJson(pjPath, () => projectJson(pkgName, pkgRoot, srcDir));

  // tsconfig.json
  const tsPath = path.join(pkgRoot, "tsconfig.json");
  await patchJson(tsPath, (_) => tsconfigJson()); // keep existing additions

  // ava.config.mjs (re-export)
  const avaPath = path.join(pkgRoot, "ava.config.mjs");
  await writeIfMissing(
    avaPath,
    `export { default } from "../../config/ava.config.mjs";\n`,
  );

  // .eslintrc.cjs (extends)
  const eslintrcPath = path.join(pkgRoot, ".eslintrc.cjs");
  await writeIfMissing(
    eslintrcPath,
    `module.exports = { extends: ["../../config/.eslintrc.base.cjs"] };\n`,
  );

  // package.json (non-destructive merge: only add missing)
  const pkgJsonPath = path.join(pkgRoot, "package.json");
  await patchJson(pkgJsonPath, (cur) => {
    const def = defaultPkgJson(pkgName);
    const next = { ...def, ...cur };
    // deep-merge certain keys
    next.scripts = { ...def.scripts, ...(cur.scripts || {}) };
    next.exports = { ...def.exports, ...(cur.exports || {}) };
    next.files = Array.from(
      new Set([...(def.files || []), ...(cur.files || [])]),
    );
    // preserve existing "name" if set (you already renamed earlier)
    if (cur.name) next.name = cur.name;
    // preserve version if present
    if (cur.version) next.version = cur.version;
    return next;
  });

  return pkgRoot;
}

async function writeRootTsconfig(projectRoots) {
  const refs = projectRoots.map((root) => {
    const relPath = path.relative(REPO, root);
    return { path: `./${relPath}` };
  });
  const rootTs = path.join(REPO, "tsconfig.json");
  await patchJson(rootTs, () => ({ files: [], references: refs }));
}

async function main() {
  if (!(await exists(BASE))) {
    console.error(`ERROR: ${rel(BASE)} does not exist`);
    process.exit(1);
  }
  if (!(await exists(CONFIG))) {
    console.error(`ERROR: ${rel(CONFIG)} (central config dir) not found`);
    process.exit(1);
  }

  const entries = await fs.readdir(BASE, { withFileTypes: true });
  const pkgs = entries.filter((d) => d.isDirectory());

  const roots = [];
  for (const d of pkgs) {
    const r = await scaffoldPackage(d);
    if (r) roots.push(r);
  }

  if (roots.length) {
    await writeRootTsconfig(roots);
  }

  console.log(DRY ? "\n(DRY RUN) Nothing written." : "\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
