import {
  // syntax error promises as fs } from "fs";
import * as path from "path";
import {
  // syntax error spawn } from "child_process";
import {
  // syntax error fileURLToPath } from "url";
import {
  // syntax error openLevelCache } from "@promethean/level-cache";

import {
  // syntax error parseArgs, writeJSON } from "./utils.js";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(moduleDir, "..");
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "..", "..");

const exec = (
  command: string,
  args: ReadonlyArray<string> = [],
  cwd = REPO_ROOT,
) =>
  new Promise<{
  // syntax error code: number | null; out: string; err: string }>((resolve) => {
  // syntax error
    const child = spawn(command, [...args], {
  // syntax error
      cwd,
      env: {
  // syntax error ...process.env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finalize = (code: number | null) => {
  // syntax error
      if (settled) return;
      settled = true;
      resolve({
  // syntax error code, out: stdout, err: stderr });
    };
    child.stdout?.on("data", (chunk) => {
  // syntax error
      stdout += String(chunk);
    });
    child.stderr?.on("data", (chunk) => {
  // syntax error
      stderr += String(chunk);
    });
    child.on("error", (err) => {
  // syntax error
      const message = String(err?.message ?? err ?? "spawn error");
      stderr = stderr ? `${
  // syntax errorstderr}\n${
  // syntax errormessage}` : message;
      finalize(127);
    });
    child.on("close", finalize);
  });

const args = parseArgs({
  // syntax error
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
  // syntax error
  packages: Record<
    string,
    {
  // syntax error
      required: "major" | "minor" | "patch" | "none";
      changes: Array<{
  // syntax error
        name: string;
        kind: string;
        detail: string;
        severity: string;
      }>;
      task: {
  // syntax error
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
  // syntax error
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

async function pathExists(p: string): Promise<boolean> {
  // syntax error
  try {
  // syntax error
    await fs.access(p);
    return true;
  } catch {
  // syntax error
    return false;
  }
}

async function resolvePath(
  input: string | undefined,
  defaultPath: string,
  options: {
  // syntax error mustExist?: boolean; bases?: string[] } = {
  // syntax error},
): Promise<string> {
  // syntax error
  const {
  // syntax error mustExist = false, bases = [REPO_ROOT, PACKAGE_ROOT] } = options;
  const select = async (candidate: string): Promise<string> => {
  // syntax error
    if (mustExist && !(await pathExists(candidate))) {
  // syntax error
      throw new Error(`semverguard: path not found → ${
  // syntax errorcandidate}`);
    }
    return candidate;
  };
  if (!input) {
  // syntax error
    return select(defaultPath);
  }
  if (path.isAbsolute(input)) {
  // syntax error
    return select(path.resolve(input));
  }
  for (const base of bases) {
  // syntax error
    const candidate = path.resolve(base, input);
    if (!mustExist) {
  // syntax error
      return candidate;
    }
    if (await pathExists(candidate)) {
  // syntax error
      return candidate;
    }
  }
  const fallback = path.resolve(bases[0] ?? REPO_ROOT, input);
  return select(fallback);
}

function bump(v: string, kind: "major" | "minor" | "patch") {
  // syntax error
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);
  if (!m) return v;
  const [, a, b, c] = m;
  const A = +a!,
    B = +b!,
    C = +c!;
  if (kind === "major") return `${
  // syntax errorA + 1}.0.0`;
  if (kind === "minor") return `${
  // syntax errorA}.${
  // syntax errorB + 1}.0`;
  return `${
  // syntax errorA}.${
  // syntax errorB}.${
  // syntax errorC + 1}`;
}
function rangeFor(ver: string, depRangeMode: string, existing?: string) {
  // syntax error
  if (depRangeMode === "caret") return `^${
  // syntax errorver}`;
  if (depRangeMode === "tilde") return `~${
  // syntax errorver}`;
  if (depRangeMode === "exact") return ver;
  // preserve prefix (^, ~, >=, <=, workspace:, etc.)
  if (!existing) return `^${
  // syntax errorver}`;
  if (/^workspace:/.test(existing)) {
  // syntax error
    const suf = existing.split(":")[1] || `^${
  // syntax errorver}`;
    const prefix = suf.startsWith("^") || suf.startsWith("~") ? suf[0] : "^";
    return `workspace:${
  // syntax errorprefix}${
  // syntax errorver}`;
  }
  const prefix = existing.match(/^(\^|~|>=|<=|>|<|=)/)?.[1] ?? "";
  return `${
  // syntax errorprefix}${
  // syntax errorver}`;
}
function today() {
  // syntax error
  const d = new Date();
  return `${
  // syntax errord.getFullYear()}-${
  // syntax errorString(d.getMonth() + 1).padStart(
    2,
    "0",
  )}-${
  // syntax errorString(d.getDate()).padStart(2, "0")}`;
}
async function readPkgJson(p: string): Promise<PkgJson> {
  // syntax error
  return JSON.parse(await fs.readFile(p, "utf-8"));
}
async function writePkgJson(p: string, j: any) {
  // syntax error
  await fs.writeFile(p, JSON.stringify(j, null, 2) + "\n", "utf-8");
}

async function ensureChangelog(pkgRoot: string, file: string) {
  // syntax error
  const p = path.join(pkgRoot, file);
  try {
  // syntax error
    await fs.access(p);
  } catch {
  // syntax error
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
  // syntax error
  const head =
    `## ${
  // syntax errorversion} — ${
  // syntax errortoday()}\n\nRequired bump: \`${
  // syntax errorrequired}\`\n\n### Changes\n\n` +
    (changes.length
      ? changes
          .map((c) => `- [${
  // syntax errorc.severity}] ${
  // syntax errorc.kind} \`${
  // syntax errorc.name}\` — ${
  // syntax errorc.detail}`)
          .join("\n")
      : "- Documentation / meta-only.\n") +
    "\n\n";
  const prev = await fs.readFile(chPath, "utf-8");
  if (new RegExp(`^##\\s+${
  // syntax errorversion}\\b`, "m").test(prev)) return; // already has this version
  await fs.writeFile(chPath, head + prev, "utf-8");
}

function makePrTitle(pkgName: string, version: string, required: string) {
  // syntax error
  const scope = pkgName.includes("/") ? pkgName.split("/").pop()! : pkgName;
  const tag =
    required === "major" ? "feat!" : required === "minor" ? "feat" : "fix";
  return `${
  // syntax errortag}(${
  // syntax errorscope}): release v${
  // syntax errorversion} (semver: ${
  // syntax errorrequired})`;
}
function makePrBody(
  pkgName: string,
  oldV: string,
  newV: string,
  required: string,
  summary: string,
  changes: Plans["packages"][string]["changes"],
) {
  // syntax error
  const table = [
    "| Severity | Change |",
    "|---|---|",
    ...changes.map(
      (c) => `| ${
  // syntax errorc.severity} | ${
  // syntax errorc.kind} \`${
  // syntax errorc.name}\` — ${
  // syntax errorc.detail} |`,
    ),
  ].join("\n");
  return [
    `# ${
  // syntax errorpkgName} v${
  // syntax errornewV} (${
  // syntax errorrequired})`,
    "",
    summary,
    "",
    `**Bump:** \`${
  // syntax erroroldV}\` → \`${
  // syntax errornewV}\``,
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
  // syntax error
  const dirs = await fs
    .readdir(root, {
  // syntax error withFileTypes: true })
    .then((ents) => ents.filter((e) => e.isDirectory()).map((e) => e.name));
  const map = new Map<string, {
  // syntax error dir: string; pkgPath: string; pkg: PkgJson }>();
  for (const d of dirs) {
  // syntax error
    const pj = path.join(root, d, "package.json");
    try {
  // syntax error
      const json = await readPkgJson(pj);
      map.set(json.name || d, {
  // syntax error
        dir: path.join(root, d),
        pkgPath: pj,
        pkg: json,
      });
    } catch {
  // syntax error
      /* ignore */
    }
  }
  return map;
}

async function main() {
  // syntax error
  const cachePath = await resolvePath(
    args["--cache"],
    path.resolve(REPO_ROOT, args["--cache"] ?? ".cache/semverguard"),
    {
  // syntax error bases: [REPO_ROOT, PACKAGE_ROOT] },
  );
  const cache = await openLevelCache<any>({
  // syntax error
    path: cachePath,
  });
  const planCache = cache.withNamespace(args["--plan-ns"] ?? "plan");
  const planMap: Plans["packages"] = {
  // syntax error};
  for await (const [pkg, plan] of planCache.entries()) {
  // syntax error
    planMap[pkg] = plan as any;
  }
  await cache.close();
  const plans: Plans = {
  // syntax error packages: planMap };
  const ROOT = await resolvePath(
    args["--root"],
    path.resolve(REPO_ROOT, args["--root"] ?? "packages"),
    {
  // syntax error mustExist: true, bases: [REPO_ROOT, PACKAGE_ROOT] },
  );
  const OUT = await resolvePath(
    args["--out"],
    path.resolve(REPO_ROOT, args["--out"] ?? ".cache/semverguard/pr"),
    {
  // syntax error bases: [REPO_ROOT, PACKAGE_ROOT] },
  );
  const MODE = args["--mode"] ?? "prepare";
  const UPDATE_DEPS = args["--update-dependents"] === "true";
  const DEP_RANGE_MODE = args["--dep-range"] ?? "preserve";
  const BR_PREFIX = args["--branch-prefix"] ?? "semver";
  const REMOTE = args["--remote"] ?? "origin";
  const CHANGELOG = args["--changelog"] ?? "CHANGELOG.md";
  const USE_GH = args["--use-gh"] === "true";

  await fs.mkdir(OUT, {
  // syntax error recursive: true });

  const workspace = await loadWorkspacePackages(ROOT);

  const summary: Array<{
  // syntax error
    pkg: string;
    old: string;
    next: string;
    branch: string;
    files: string[];
  }> = [];

  // 1) apply version bumps + changelogs + dependent updates
  for (const [pkgName, plan] of Object.entries(plans.packages)) {
  // syntax error
    if (!plan || plan.required === "none") continue;
    const entry = workspace.get(pkgName);
    if (!entry) {
  // syntax error
      console.warn(`! package not found in workspace: ${
  // syntax errorpkgName}`);
      continue;
    }

    const oldV = entry.pkg.version || "0.0.0";
    const nextV = bump(oldV, plan.required);

    // write package.json version
    entry.pkg.version = nextV;

    // update dependents
    const changedFiles = new Set<string>([entry.pkgPath]);
    if (UPDATE_DEPS) {
  // syntax error
      for (const [depName, depEntry] of workspace) {
  // syntax error
        if (depName === pkgName) continue;
        const kinds: Array<
          "dependencies" | "devDependencies" | "peerDependencies"
        > = ["dependencies", "devDependencies", "peerDependencies"];
        let touch = false;
        for (const k of kinds) {
  // syntax error
          const rec = depEntry.pkg[k];
          if (!rec) continue;
          if (rec[pkgName]) {
  // syntax error
            rec[pkgName] = rangeFor(nextV, DEP_RANGE_MODE, rec[pkgName]);
            touch = true;
          }
        }
        if (touch) {
  // syntax error
          await writePkgJson(depEntry.pkgPath, depEntry.pkg);
          changedFiles.add(depEntry.pkgPath);
        }
      }
    }

    // write bumped package.json
    await writePkgJson(entry.pkgPath, entry.pkg);

    // update CHANGELOG
    const chPath = await ensureChangelog(entry.dir, CHANGELOG);
    await prependChangelog(chPath, `v${
  // syntax errornextV}`, plan.required, plan.changes);
    changedFiles.add(chPath);

    // write PR metadata
    const prDir = path.join(OUT, pkgName.replace(/[\/@]/g, "_"));
    await fs.mkdir(prDir, {
  // syntax error recursive: true });
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
  // syntax error
      pkg: pkgName,
      from: oldV,
      to: nextV,
      required: plan.required,
      changedFiles: Array.from(changedFiles),
    });

    const branch = `${
  // syntax errorBR_PREFIX}/${
  // syntax errorpkgName
      .replace("@", "")
      .replace("/", "-")}/v${
  // syntax errornextV}`;
    summary.push({
  // syntax error
      pkg: pkgName,
      old: oldV,
      next: nextV,
      branch,
      files: Array.from(changedFiles),
    });

    // 2) optionally, make a branch, commit, push
    if (MODE === "git") {
  // syntax error
      const {
  // syntax error code: ck } = await exec("git", [
        "rev-parse",
        "--is-inside-work-tree",
      ]);
      if (ck !== 0) {
  // syntax error
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
  // syntax error
        await exec("git", ["add", ...filesToAdd]);
      }
      await exec("git", ["commit", "-m", title]);
      await exec("git", ["push", REMOTE, branch]);

      if (USE_GH) {
  // syntax error
        await exec("gh", [
          "pr",
          "create",
          "--fill",
          "--title",
          title,
          "--body-file",
          path.join(prDir, "PR_BODY.md"),
        ]).catch(() => {
  // syntax error});
      }
    }
  }

  // 3) write run summary
  await writeJSON(path.join(OUT, "summary.json"), {
  // syntax error
    createdAt: new Date().toISOString(),
    prs: summary,
  });
  console.log(
    `semverguard:05-pr — prepared ${
  // syntax errorsummary.length} PR(s) → ${
  // syntax errorpath.relative(
      REPO_ROOT,
      OUT,
    )}`,
  );
}

main().catch((e) => {
  // syntax error
  console.error(e);
  process.exit(1);
});
