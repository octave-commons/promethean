import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type Target = {
  readonly repo: string;
  readonly path: string;
  readonly permission: string;
  readonly defaultBranch: string;
  readonly isRoot: boolean;
};

const root = process.cwd();
const templatesDir = path.join(root, "orgs/open-hax/eta-mu/packages/eta-mu-github/templates/workflows");
const allowedCommands = new Set(["inventory", "install"]);

const ensureSafeTargetPath = (targetPath: string): string => {
  const normalized = String(targetPath ?? "").trim();
  if (!normalized) {
    throw new Error("Refusing to install workflows: target path is empty");
  }
  if (path.isAbsolute(normalized)) {
    throw new Error(`Refusing to install workflows outside repo root: ${normalized}`);
  }

  const segments = normalized.split(/[\\/]+/u).filter(Boolean);
  if (segments.includes("..")) {
    throw new Error(`Refusing to install workflows with path traversal: ${normalized}`);
  }

  const resolvedRoot = path.resolve(root);
  const resolvedTargetRoot = path.resolve(root, normalized);
  if (resolvedTargetRoot !== resolvedRoot && !resolvedTargetRoot.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Resolved target escapes repo root: ${normalized}`);
  }

  return resolvedTargetRoot;
};

const parseArgs = () => {
  const [command = "inventory", ...rest] = process.argv.slice(2);
  if (!allowedCommands.has(command)) {
    throw new Error(`Unknown command: ${command}. Allowed commands: inventory, install`);
  }
  const apply = rest.includes("--apply");
  const repoFilterIndex = rest.indexOf("--repo");
  const repoFilter = repoFilterIndex >= 0 ? rest[repoFilterIndex + 1] : undefined;
  return { command, apply, repoFilter };
};

const git = (...args: string[]): string => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const gh = (...args: string[]): string => execFileSync("gh", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

const slugFromUrl = (url: string): string | undefined => {
  const match = url.match(/github\.com[:/](.+?)(?:\.git)?$/);
  return match?.[1];
};

const listSubmodules = (): Array<{ path: string; repo: string }> => {
  const raw = git("config", "-f", ".gitmodules", "--get-regexp", "^submodule\\..*\\.(path|url)$");
  const rows = raw.split("\n").filter(Boolean);
  const map = new Map<string, { path?: string; url?: string }>();
  for (const row of rows) {
    const [key, value] = row.split(/\s+/, 2);
    const match = key.match(/^submodule\.(.+)\.(path|url)$/);
    if (!match) continue;
    const name = match[1];
    const field = match[2] as "path" | "url";
    const entry = map.get(name) ?? {};
    entry[field] = value;
    map.set(name, entry);
  }
  return [...map.values()]
    .filter((entry): entry is { path: string; url: string } => Boolean(entry.path && entry.url))
    .map((entry) => ({ path: entry.path, repo: slugFromUrl(entry.url)! }))
    .filter((entry) => Boolean(entry.repo));
};

const repoMetadata = (repo: string): { permission: string; defaultBranch: string } => {
  try {
    const raw = gh("repo", "view", repo, "--json", "viewerPermission,defaultBranchRef");
    const parsed = JSON.parse(raw) as { viewerPermission?: string; defaultBranchRef?: { name?: string } };
    return {
      permission: parsed.viewerPermission ?? "UNKNOWN",
      defaultBranch: parsed.defaultBranchRef?.name ?? "main",
    };
  } catch {
    return {
      permission: "ERROR",
      defaultBranch: "main",
    };
  }
};

const listTargets = (): Target[] => {
  const targets: Target[] = [];
  const rootRepo = slugFromUrl(git("remote", "get-url", "origin"));
  if (rootRepo) {
    const meta = repoMetadata(rootRepo);
    targets.push({ repo: rootRepo, path: ".", permission: meta.permission, defaultBranch: meta.defaultBranch, isRoot: true });
  }
  for (const submodule of listSubmodules()) {
    const meta = repoMetadata(submodule.repo);
    targets.push({ repo: submodule.repo, path: submodule.path, permission: meta.permission, defaultBranch: meta.defaultBranch, isRoot: false });
  }
  return targets;
};

const installWorkflows = (target: Target): string[] => {
  const created: string[] = [];
  const targetRoot = ensureSafeTargetPath(target.path);
  const workflowDir = path.resolve(targetRoot, ".github/workflows");
  const resolvedRoot = path.resolve(root);
  mkdirSync(workflowDir, { recursive: true });
  for (const name of ["eta-mu.yml", "eta-mu-review-gate.yml"]) {
    const templatePath = path.join(templatesDir, name);
    const outputPath = path.resolve(targetRoot, ".github/workflows", name);
    if (outputPath !== resolvedRoot && !outputPath.startsWith(`${resolvedRoot}${path.sep}`)) {
      throw new Error(`Refusing to write workflow outside repo root: ${outputPath}`);
    }
    writeFileSync(outputPath, readFileSync(templatePath, "utf8"));
    created.push(path.relative(root, outputPath));
  }
  return created;
};

const main = (): void => {
  const args = parseArgs();
  const targets = listTargets().filter((target) => !args.repoFilter || target.repo === args.repoFilter || target.path === args.repoFilter);
  const report = targets.map((target) => {
    const eligible = target.permission === "ADMIN";
    const plannedFiles = [path.join(target.path, ".github/workflows/eta-mu.yml"), path.join(target.path, ".github/workflows/eta-mu-rollout.ts")];
    const installed = args.command === "install" && args.apply && eligible ? installWorkflows(target) : [];
    return {
      repo: target.repo,
      path: target.path,
      permission: target.permission,
      defaultBranch: target.defaultBranch,
      eligible,
      plannedFiles,
      installed,
    };
  });
  console.log(JSON.stringify({ command: args.command, apply: args.apply, targets: report }, null, 2));
};

main();