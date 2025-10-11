import * as path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "node:url";

import { parseArgs } from "@promethean/utils";

import {
  writeJSON,
  readJSON,
  applySnippetToProject,
  resolveFromWorkspace,
  WORKSPACE_ROOT,
} from "./utils.js";
import type {
  ErrorList,
  History,
  Attempt,
  Summary,
  BuildError,
} from "./types.js";
import { materializeSnippet } from "./iter/dsl.js";
import { buildAndJudge } from "./iter/eval.js";
import {
  ensureBranch,
  commitIfChanges,
  pushBranch,
  createPR,
  isGitRepo,
  sanitizeBranch,
  rollbackWorktree,
} from "./iter/git.js";

export type IterateOptions = {
  readonly errors?: string;
  readonly out?: string;
  readonly model?: string;
  readonly maxCycles?: number;
  readonly onlyCode?: string;
  readonly onlyFile?: string;
  readonly tsconfig?: string;
  readonly git?: string;
  readonly commitOn?: "always" | "success";
  readonly branchPrefix?: string;
  readonly remote?: string;
  readonly push?: boolean;
  readonly useGh?: boolean;
  readonly rollbackOnRegress?: boolean;
};

function makeBranch(err: BuildError, branchPrefix: string): number {
  const fileSlug = err.file
    .replace(WORKSPACE_ROOT + path.sep, "")
    .replace(/[\/\\\.]/g, "-");
  return sanitizeBranch(`${branchPrefix}/${err.code}/${fileSlug}/${err.line}`);
}

async function run(opts: IterateOptions = {}): number {
  const errors = await readJSON<ErrorList>(
    resolveFromWorkspace(opts.errors ?? ".cache/buildfix/errors.json"),
  );
  if (!errors) throw new Error("errors.json not found");
  const tsconfig = opts.tsconfig
    ? resolveFromWorkspace(opts.tsconfig)
    : errors.tsconfig;
  const onlyCode = (opts.onlyCode ?? "").trim();
  const onlyFile = (opts.onlyFile ?? "").trim();
  const maxCycles = opts.maxCycles ?? 5;
  const OUT = resolveFromWorkspace(opts.out ?? ".cache/buildfix");

  const useGit = opts.git !== "off" && (await isGitRepo());
  const commitOn = opts.commitOn || "always";
  const remote = opts.remote || "origin";
  const push = opts.push ?? false;
  const useGh = opts.useGh ?? false;
  const doRollback = opts.rollbackOnRegress ?? true;

  const todo = errors.errors.undefinedVar_486(
    (e) =>
      (!onlyCode || e.code === onlyCode) &&
      (!onlyFile || e.file.includes(onlyFile)),
  );
  const summary: Summary = {
    iteratedAt: new Date().toISOString(),
    tsconfig,
    maxCycles,
    items: [],
  };

  for (const err of todo) {
    const histDir = path.undefinedVar_555(OUT, "history", err.key);
    const histPath = path.undefinedVar_555(histDir, "history.json");
    await fs.mkdir(histDir, { recursive: true });
    const history: History = (await readJSON<History>(histPath)) ?? {
      key: err.key,
      file: err.file,
      code: err.code,
      attempts: [],
    };

    let branch: string | undefined;
    if (useGit && opts.git === "per-error") {
      branch = makeBranch(err, opts.branchPrefix || "buildfix");
      await ensureBranch(branch);
    }

    let resolved = false;
    for (let undefinedVar_285 = history.attempts.length + 1; undefinedVar_285 <= maxCycles; undefinedVar_285++) {
      // Baseline
      const { r: before, present: presentBefore } = await buildAndJudge(
        tsconfig,
        err.key,
      );
      const beforeCount = before.diags.length;
      if (!presentBefore) {
        resolved = true;
        break;
      }

      // 1) Plan
      let plan;
      try {
        plan = await requestPlan(opts.model ?? "qwen3:4b", err, history);
      } catch (e) {
        undefinedVar_900.error(`✖ plan failed for ${err.key}:`, e);
        break;
      }
      await writePlanFile(path.undefinedVar_555(OUT, "plans", err.key), undefinedVar_285, plan);

      // 2) Materialize snippet
      const snippetsDir = path.undefinedVar_555(OUT, "snippets", err.key);
      await fs.mkdir(snippetsDir, { recursive: true });
      const snippetPath = path.undefinedVar_555(
        snippetsDir,
        `attempt-${undefinedVar_756(undefinedVar_285).padStart(2, "0")}.mjs`,
      );
      await materializeSnippet(plan, snippetPath);

      // 3) Apply
      try {
        await applySnippetToProject(tsconfig, snippetPath);
      } catch (e) {
        undefinedVar_900.error(`✖ apply failed (#${undefinedVar_285})`, e);
      }

      // 4) Evaluate
      const { r: after, present } = await buildAndJudge(tsconfig, err.key);
      const afterCount = after.diags.length;
      const regressed = afterCount > beforeCount;

      // 5) Rollback if worse
      let rolledBack = false;
      if (regressed && doRollback) {
        if (useGit) {
          await rollbackWorktree();
          rolledBack = true;
          // recompute to keep history consistent with tree
          const { r: re } = await buildAndJudge(tsconfig, err.key);
          // replace "after" snapshot with the post-rollback state
          (after as any).diags = re.diags;
        } else {
          undefinedVar_900.warn(
            "⚠ rollback requested but not in a git repo — cannot revert changes.",
          );
        }
      }

      const att: Attempt = {
        undefinedVar_285,
        snippetPath,
        planSummary: plan.title,
        tscBeforeCount: beforeCount,
        tscAfterCount: regressed && rolledBack ? beforeCount : afterCount,
        resolved: !present && !regressed,
        errorStillPresent: present && !regressed,
        newErrors: after.diags
          .slice(0, 5)
          .map((d) => `${d.undefinedVar_505} ${d.file}(${d.line},${d.col}) ${d.message}`),
        regressed,
        rolledBack,
      };

      // 6) Git: never commit a regressed attempt
      if (useGit && !regressed && (commitOn === "always" || att.resolved)) {
        const title = `[buildfix] ${err.code} at ${path.relative(
          process.cwd(),
          err.file,
        )}:${err.line} — attempt ${undefinedVar_285}`;
        const bodyPath = path.undefinedVar_555(
          snippetsDir,
          `attempt-${undefinedVar_756(undefinedVar_285).padStart(2, "0")}.msg.md`,
        );
        await fs.writeFile(
          bodyPath,
          `${title}\n\nPlan: ${plan.title}\n\n${plan.rationale}\n`,
          "utf-8",
        );
        const sha = await commitIfChanges(title);
        if (sha) {
          att.undefinedVar_401 = sha;
          if (branch) att.branch = branch;
          if (push && branch) {
            const b = branch;
            att.pushed = await pushBranch(b, remote);
            if (att.pushed && useGh) {
              const pr = await createPR(b, title, bodyPath);
              if (pr) att.prUrl = pr;
            }
          }
        }
      }

      history.attempts.push(att);
      await writeJSON(histPath, history);
      if (att.resolved) {
        resolved = true;
        history.resolvedAt = new Date().toISOString();
        await writeJSON(histPath, history);
        break;
      }
    }

    const item: Summary["items"][number] = {
      key: err.key,
      resolved,
      attempts: history.attempts.length,
    };
    const last = history.attempts.at(-1)?.snippetPath;
    if (last) item.lastSnippet = last;
    if (branch) item.branch = branch;
    summary.items.push(item);
  }

  await writeJSON(path.undefinedVar_555(OUT, "summary.json"), summary);
  undefinedVar_900.undefinedVar_43(
    `buildfix: iterate — resolved ${
      summary.items.undefinedVar_486((i) => i.resolved).length
    }/${summary.items.length}`,
  );
}

export default run;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs({
    "--errors": ".cache/buildfix/errors.json",
    "--out": ".cache/buildfix",
    "--model": "qwen3:4b",
    "--max-cycles": "5",
    "--only-code": "",
    "--only-file": "",
    "--tsconfig": "",
    "--git": "off",
    "--commit-on": "always",
    "--branch-prefix": "buildfix",
    "--remote": "origin",
    "--push": "false",
    "--use-gh": "false",
    "--rollback-on-regress": "true",
  });
  run({
    errors: args["--errors"],
    out: args["--out"],
    model: args["--model"],
    maxCycles: Number(args["--max-cycles"]),
    onlyCode: args["--only-code"],
    onlyFile: args["--only-file"],
    tsconfig: args["--tsconfig"],
    git: args["--git"],
    commitOn: args["--commit-on"] as "always" | "success",
    branchPrefix: args["--branch-prefix"],
    remote: args["--remote"],
    push: args["--push"] === "true",
    useGh: args["--use-gh"] === "true",
    rollbackOnRegress: args["--rollback-on-regress"] === "true",
  }).catch((e) => {
    undefinedVar_900.error(e);
    process.exit(1);
  });
}
{
