import { promises as fs } from "fs";
import * as path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { openLevelCache } from "@promethean/level-cache";

import { parseArgs, writeJSON } from "./utils.js";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(moduleDir, "..");
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..", "..");

const exec = (
  command: string,
  args: ReadonlyArray<string> = [],
  cwd = REPO_ROOT,
) =>
  new Promise<{ code: number | null; out: string; err: string }>((resolve) => {
    const child = spawn(command, [...args], {
      cwd,
      env: { ...process.env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finalize = (code: number | null) => {
      if (settled) return;
      settled = true;
      resolve({ code, out: stdout, err: stderr });
    };
    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (err) => {
      const message = String(err?.message ?? err ?? "spawn error");
      stderr = stderr ? `${stderr}\n${message}` : message;
      finalize(127);
    });
    child.on("close", finalize);
  });

const args = parseArgs({
  "--cache": ".cache/semverguard",
  "--plan-ns": "plan",
  "--root": "packages",
  "--out": ".cache/semverguard/pr",
  "--mode": "prepare", // prepare | git
  "--branch-prefix": "semver",
  "--remote": "origin",
  "--changelog": "CHANGELOG.md",
  "--update-dependents": "true", // also bump internal deps that reference the changed package
  "--dep-range": "preserve", // preserve | caret | tilde | exact
  "--use-gh": "false", // if true, will call `gh pr create` for each branch
});

type Plans = {
  packages: Record<
    string,
    {
      required: "major" | "minor" | "patch" | "none";
      changes: Array<{
        name: string;
        kind: string;
        detail: string;
        severity: string;
      }>;
      task: {
        title: string;
        summary: string;
        steps: string[];
        acceptance: string[];
        labels?: string[];
      };
    }
  >;
};

type PkgJson = {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function resolvePath(
  input: string | undefined,
  defaultPath: string,
  options: { mustExist?: boolean; bases?: string[] } = {},
): Promise<string> {
  const { mustExist = false, bases = [REPO_ROOT, PACKAGE_ROOT] } = options;
  const select = async (candidate: string): Promise<string> => {
    if (mustExist && !(await pathExists(candidate))) {
      throw new Error(`semverguard: path not found → ${candidate}`);
    }
    return candidate;
  };
  if (!input) {
    return select(defaultPath);
  }
  if (path.isAbsolute(input)) {
    return select(path.resolve(input));
  }
  for (const base of bases) {
    const candidate = path.resolve(base, input);
    if (!mustExist) {
      return candidate;
    }
    if (await pathExists(candidate)) {
      return candidate;
    }
  }
  const fallback = path.resolve(bases[0] ?? REPO_ROOT, input);
  return select(fallback);
}

function bump(v: string, kind: "major" | "minor" | "patch") {
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);
  if (!m) return v;
  const [, a, b, c] = m;
  const A = +a!,
    B = +b!,
    C = +c!;
  if (kind === "major") return `${A + 1}.0.0`;
  if (kind === "minor") return `${A}.${B + 1}.0`;
  return `${A}.${B}.${C + 1}`;
}
function rangeFor(ver: string, depRangeMode: string, existing?: string) {
  if (depRangeMode === "caret") return `^${ver}`;
  if (depRangeMode === "tilde") return `~${ver}`;
  if (depRangeMode === "exact") return ver;
  // preserve prefix (^, ~, >=, <=, workspace:, etc.)
  if (!existing) return `^${ver}`;
  if (/^workspace:/.test(existing)) {
    const suf = existing.split(":")[1] || `^${ver}`;
    const prefix = suf.startsWith("^") || suf.startsWith("~") ? suf[0] : "^";
    return `workspace:${prefix}${ver}`;
  }
  const prefix = existing.match(/^(\^|~|>=|<=|>|<|=)/)?.[1] ?? "";
  return `${prefix}${ver}`;
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(d.getDate()).padStart(2, "0")}`;
}
async function readPkgJson(p: string): Promise<PkgJson> {
  return JSON.parse(await fs.readFile(p, "utf-8"));
}
async function writePkgJson(p: string, j: any) {
  await fs.writeFile(p, JSON.stringify(j, null, 2) + "\n", "utf-8");
}

async function ensureChangelog(pkgRoot: string, file: string) {
  const p = path.join(pkgRoot, file);
  try {
    await fs.access(p);
  } catch {
    await fs.writeFile(p, `# Changelog\n\n`, "utf-8");
  }
  return p;
}
async function prependChangelog(
  chPath: string,
  version: string,
  required: string,
  changes: Plans["packages"][string]["changes"],
) {
  const head =
    `## ${version} — ${today()}\n\nRequired bump: \`${required}\`\n\n### Changes\n\n` +
    (changes.length
      ? changes
          .map((c) => `- [${c.severity}] ${c.kind} \`${c.name}\` — ${c.detail}`)
          .join("\n")
      : "- Documentation / meta-only.\n") +
    "\n\n";
  const prev = await fs.readFile(chPath, "utf-8");
  if (new RegExp(`^##\\s+${version}\\b`, "m").test(prev)) return; // already has this version
  await fs.writeFile(chPath, head + prev, "utf-8");
}

function makePrTitle(pkgName: string, version: string, required: string) {
  const scope = pkgName.includes("/") ? pkgName.split("/").pop()! : pkgName;
  const tag =
    required === "major" ? "feat!" : required === "minor" ? "feat" : "fix";
  return `${tag}(${scope}): release v${version} (semver: ${required})`;
}
function makePrBody(
  pkgName: string,
  oldV: string,
  newV: string,
  required: string,
  summary: string,
  changes: Plans["packages"][string]["changes"],
) {
  const table = [
    "| Severity | Change |",
    "|---|---|",
    ...changes.map(
      (c) => `| ${c.severity} | ${c.kind} \`${c.name}\` — ${c.detail} |`,
    ),
  ].join("\n");
  return [
    `# ${pkgName} v${newV} (${required})`,
    "",
    summary,
    "",
    `**Bump:** \`${oldV}\` → \`${newV}\``,
    "",
    "## API diff",
    "",
    table,
    "",
    "## Checklist",
    "",
    "- [ ] CHANGELOG updated",
    "- [ ] Dependent packages install clean",
    "- [ ] CI green",
    "",
  ].join("\n");
}

async function loadWorkspacePackages(root: string) {
  const dirs = await fs
    .readdir(root, { withFileTypes: true })
    .then((ents) => ents.filter((e) => e.isDirectory()).map((e) => e.name));
  const map = new Map<string, { dir: string; pkgPath: string; pkg: PkgJson }>();
  for (const d of dirs) {
    const pj = path.join(root, d, "package.json");
    try {
      const json = await readPkgJson(pj);
      map.set(json.name || d, {
        dir: path.join(root, d),
        pkgPath: pj,
        pkg: json,
      });
    } catch {
      /* ignore */
    }
  }
  return map;
}

async function main() {
  const cachePath = await resolvePath(
    args["--cache"],
    path.resolve(REPO_ROOT, args["--cache"] ?? ".cache/semverguard"),
    { bases: [REPO_ROOT, PACKAGE_ROOT] },
  );
  const cache = await openLevelCache<any>({
    path: cachePath,
  });
  const planCache = cache.withNamespace(args["--plan-ns"] ?? "plan");
  const planMap: Plans["packages"] = {};
  for await (const [pkg, plan] of planCache.entries()) {
    planMap[pkg] = plan as any;
  }
  await cache.close();
  const plans: Plans = { packages: planMap };
  const ROOT = await resolvePath(
    args["--root"],
    path.resolve(REPO_ROOT, args["--root"] ?? "packages"),
    { mustExist: true, bases: [REPO_ROOT, PACKAGE_ROOT] },
  );
  const OUT = await resolvePath(
    args["--out"],
    path.resolve(REPO_ROOT, args["--out"] ?? ".cache/semverguard/pr"),
    { bases: [REPO_ROOT, PACKAGE_ROOT] },
  );
  const MODE = args["--mode"] ?? "prepare";
  const UPDATE_DEPS = args["--update-dependents"] === "true";
  const DEP_RANGE_MODE = args["--dep-range"] ?? "preserve";
  const BR_PREFIX = args["--branch-prefix"] ?? "semver";
  const REMOTE = args["--remote"] ?? "origin";
  const CHANGELOG = args["--changelog"] ?? "CHANGELOG.md";
  const USE_GH = args["--use-gh"] === "true";

  await fs.mkdir(OUT, { recursive: true });

  const workspace = await loadWorkspacePackages(ROOT);

  const summary: Array<{
    pkg: string;
    old: string;
    next: string;
    branch: string;
    files: string[];
  }> = [];

  // 1) apply version bumps + changelogs + dependent updates
  for (const [pkgName, plan] of Object.entries(plans.packages)) {
    if (!plan || plan.required === "none") continue;
    const entry = workspace.get(pkgName);
    if (!entry) {
      console.warn(`! package not found in workspace: ${pkgName}`);
      continue;
    }

    const oldV = entry.pkg.version || "0.0.0";
    const nextV = bump(oldV, plan.required);

    // write package.json version
    entry.pkg.version = nextV;

    // update dependents
    const changedFiles = new Set<string>([entry.pkgPath]);
    if (UPDATE_DEPS) {
      for (const [depName, depEntry] of workspace) {
        if (depName === pkgName) continue;
        const kinds: Array<
          "dependencies" | "devDependencies" | "peerDependencies"
        > = ["dependencies", "devDependencies", "peerDependencies"];
        let touch = false;
        for (const k of kinds) {
          const rec = depEntry.pkg[k];
          if (!rec) continue;
          if (rec[pkgName]) {
            rec[pkgName] = rangeFor(nextV, DEP_RANGE_MODE, rec[pkgName]);
            touch = true;
          }
        }
        if (touch) {
          await writePkgJson(depEntry.pkgPath, depEntry.pkg);
          changedFiles.add(depEntry.pkgPath);
        }
      }
    }

    // write bumped package.json
    await writePkgJson(entry.pkgPath, entry.pkg);

    // update CHANGELOG
    const chPath = await ensureChangelog(entry.dir, CHANGELOG);
    await prependChangelog(chPath, `v${nextV}`, plan.required, plan.changes);
    changedFiles.add(chPath);

    // write PR metadata
    const prDir = path.join(OUT, pkgName.replace(/[\/@]/g, "_"));
    await fs.mkdir(prDir, { recursive: true });
    const title = makePrTitle(pkgName, nextV, plan.required);
    const body = makePrBody(
      pkgName,
      oldV,
      nextV,
      plan.required,
      plan.task.summary,
      plan.changes,
    );
    await fs.writeFile(path.join(prDir, "PR_TITLE.txt"), title, "utf-8");
    await fs.writeFile(path.join(prDir, "PR_BODY.md"), body, "utf-8");
    await writeJSON(path.join(prDir, "info.json"), {
      pkg: pkgName,
      from: oldV,
      to: nextV,
      required: plan.required,
      changedFiles: Array.from(changedFiles),
    });

    const branch = `${BR_PREFIX}/${pkgName
      .replace("@", "")
      .replace("/", "-")}/v${nextV}`;
    summary.push({
      pkg: pkgName,
      old: oldV,
      next: nextV,
      branch,
      files: Array.from(changedFiles),
    });

    // 2) optionally, make a branch, commit, push
    if (MODE === "git") {
      const { code: ck } = await exec("git", [
        "rev-parse",
        "--is-inside-work-tree",
      ]);
      if (ck !== 0) {
        console.error("Not a git repo; skipping git mode.");
        continue;
      }

      await exec("git", ["checkout", "-b", branch]).catch(() =>
        exec("git", ["checkout", branch]),
      ); // create or reuse
      const filesToAdd = Array.from(changedFiles).map((f) =>
        path.relative(REPO_ROOT, f),
      );
      if (filesToAdd.length > 0) {
        await exec("git", ["add", ...filesToAdd]);
      }
      await exec("git", ["commit", "-m", title]);
      await exec("git", ["push", REMOTE, branch]);

      if (USE_GH) {
        await exec("gh", [
          "pr",
          "create",
          "--fill",
          "--title",
          title,
          "--body-file",
          path.join(prDir, "PR_BODY.md"),
        ]).catch(() => {});
      }
    }
  }

  // 3) write run summary
  await writeJSON(path.join(OUT, "summary.json"), {
    createdAt: new Date().toISOString(),
    prs: summary,
  });
  console.log(
    `semverguard:05-pr — prepared ${summary.length} PR(s) → ${path.relative(
      REPO_ROOT,
      OUT,
    )}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
