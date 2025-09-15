import { spawn } from "node:child_process";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(`${command} ${args.join(" ")} exited with code ${code}`),
        );
    });
  });
}

export async function snapshot(opts = {}) {
  const root = opts.root ?? "packages";
  const tsconfig = opts.tsconfig ?? "./tsconfig.json";
  const cache = opts.cache ?? ".cache/semverguard";
  const ns = opts.ns ?? "snapshot";
  await run("pnpm", [
    "--filter",
    "@promethean/semverguard",
    "sv:01-snapshot",
    "--root",
    root,
    "--tsconfig",
    tsconfig,
    "--cache",
    cache,
    "--ns",
    ns,
  ]);
}

export async function diff(opts = {}) {
  const cache = opts.cache ?? ".cache/semverguard";
  const currentNs = opts.currentNs ?? "snapshot";
  const baselineNs = opts.baselineNs ?? "baseline";
  const diffNs = opts.diffNs ?? "diff";
  await run("pnpm", [
    "--filter",
    "@promethean/semverguard",
    "sv:02-diff",
    "--cache",
    cache,
    "--current-ns",
    currentNs,
    "--baseline-ns",
    baselineNs,
    "--diff-ns",
    diffNs,
  ]);
}

export async function plan(opts = {}) {
  const cache = opts.cache ?? ".cache/semverguard";
  const diffNs = opts.diffNs ?? "diff";
  const planNs = opts.planNs ?? "plan";
  const model = opts.model ?? "qwen3:4b";
  await run("pnpm", [
    "--filter",
    "@promethean/semverguard",
    "sv:03-plan",
    "--cache",
    cache,
    "--diff-ns",
    diffNs,
    "--plan-ns",
    planNs,
    "--model",
    model,
  ]);
}

export async function write(opts = {}) {
  const cache = opts.cache ?? ".cache/semverguard";
  const planNs = opts.planNs ?? "plan";
  const out = opts.out ?? "docs/agile/tasks/semver";
  await run("pnpm", [
    "--filter",
    "@promethean/semverguard",
    "sv:04-write",
    "--cache",
    cache,
    "--plan-ns",
    planNs,
    "--out",
    out,
  ]);
}

export async function pr(opts = {}) {
  const cache = opts.cache ?? ".cache/semverguard";
  const planNs = opts.planNs ?? "plan";
  const root = opts.root ?? "packages";
  const mode = opts.mode ?? "prepare";
  const updateDependents = String(opts.updateDependents ?? true);
  const depRange = opts.depRange ?? "preserve";
  await run("pnpm", [
    "--filter",
    "@promethean/semverguard",
    "sv:05-pr",
    "--cache",
    cache,
    "--plan-ns",
    planNs,
    "--root",
    root,
    "--mode",
    mode,
    "--update-dependents",
    updateDependents,
    "--dep-range",
    depRange,
  ]);
}
