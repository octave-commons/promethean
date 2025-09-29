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
import { requestPlan, writePlanFile } from "./iter/plan.js";
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

function makeBranch(err: BuildError, branchPrefix: string): string {
  const fileSlug = err.file
    .replace(WORKSPACE_ROOT + path.sep, "")
    .replace(/[\/\\\.]/g, "-");
  return sanitizeBranch(`${branchPrefix}/${err.code}/${fileSlug}/${err.line}`);
}

export async function run(opts: IterateOptions = {}): Promise<void> {
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

  const todo = errors.errors.filter(
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
    const histDir = path.join(OUT, "history", err.key);
    const histPath = path.join(histDir, "history.json");
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
    for (let n = history.attempts.length + 1; n <= maxCycles; n++) {
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
        console.error(`✖ plan failed for ${err.key}:`, e);
        break;
      }
      await writePlanFile(path.join(OUT, "plans", err.key), n, plan);

      // 2) Materialize snippet
      const snippetsDir = path.join(OUT, "snippets", err.key);
      await fs.mkdir(snippetsDir, { recursive: true });
      const snippetPath = path.join(
        snippetsDir,
        `attempt-${String(n).padStart(2, "0")}.mjs`,
      );
      await materializeSnippet(plan, snippetPath);

      // 3) Apply
      try {
        await applySnippetToProject(tsconfig, snippetPath);
      } catch (e) {
        console.error(`✖ apply failed (#${n})`, e);
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
          console.warn(
            "⚠ rollback requested but not in a git repo — cannot revert changes.",
          );
        }
      }

      const att: Attempt = {
        n,
        snippetPath,
        planSummary: plan.title,
        tscBeforeCount: beforeCount,
        tscAfterCount: regressed && rolledBack ? beforeCount : afterCount,
        resolved: !present && !regressed,
        errorStillPresent: present && !regressed,
        newErrors: after.diags
          .slice(0, 5)
          .map((d) => `${d.code} ${d.file}(${d.line},${d.col}) ${d.message}`),
        regressed,
        rolledBack,
      };

      // 6) Git: never commit a regressed attempt
      if (useGit && !regressed && (commitOn === "always" || att.resolved)) {
        const title = `[buildfix] ${err.code} at ${path.relative(
          process.cwd(),
          err.file,
        )}:${err.line} — attempt ${n}`;
        const bodyPath = path.join(
          snippetsDir,
          `attempt-${String(n).padStart(2, "0")}.msg.md`,
        );
        await fs.writeFile(
          bodyPath,
          `${title}\n\nPlan: ${plan.title}\n\n${plan.rationale}\n`,
          "utf-8",
        );
        const sha = await commitIfChanges(title);
        if (sha) {
          att.commitSha = sha;
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

  await writeJSON(path.join(OUT, "summary.json"), summary);
  console.log(
    `buildfix: iterate — resolved ${
      summary.items.filter((i) => i.resolved).length
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
    console.error(e);
    process.exit(1);
  });
}
