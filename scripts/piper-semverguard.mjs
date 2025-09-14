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
  const out = opts.out ?? ".cache/semverguard/snapshot.json";
  await run("pnpm", [
    "--filter",
    "@promethean/semverguard",
    "sv:01-snapshot",
    "--root",
    root,
    "--tsconfig",
    tsconfig,
    "--out",
    out,
  ]);
}

export async function diff(opts = {}) {
  const current = opts.current ?? ".cache/semverguard/snapshot.json";
  const baseline = opts.baseline ?? ".cache/semverguard/baseline.json";
  const out = opts.out ?? ".cache/semverguard/diff.json";
  await run("pnpm", [
    "--filter",
    "@promethean/semverguard",
    "sv:02-diff",
    "--current",
    current,
    "--baseline",
    baseline,
    "--out",
    out,
  ]);
}

export async function plan(opts = {}) {
  const diff = opts.diff ?? ".cache/semverguard/diff.json";
  const out = opts.out ?? ".cache/semverguard/plans.json";
  const model = opts.model ?? "qwen3:4b";
  await run("pnpm", [
    "--filter",
    "@promethean/semverguard",
    "sv:03-plan",
    "--diff",
    diff,
    "--out",
    out,
    "--model",
    model,
  ]);
}

export async function write(opts = {}) {
  const plans = opts.plans ?? ".cache/semverguard/plans.json";
  const out = opts.out ?? "docs/agile/tasks/semver";
  await run("pnpm", [
    "--filter",
    "@promethean/semverguard",
    "sv:04-write",
    "--plans",
    plans,
    "--out",
    out,
  ]);
}

export async function pr(opts = {}) {
  const plans = opts.plans ?? ".cache/semverguard/plans.json";
  const root = opts.root ?? "packages";
  const mode = opts.mode ?? "prepare";
  const updateDependents = String(opts.updateDependents ?? true);
  const depRange = opts.depRange ?? "preserve";
  await run("pnpm", [
    "--filter",
    "@promethean/semverguard",
    "sv:05-pr",
    "--plans",
    plans,
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
