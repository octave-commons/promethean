// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable no-console */
import * as path from "path";
import { promises as fs } from "fs";
import {
  parseArgs,
  writeJSON,
  readJSON,
  applySnippetToProject,
} from "./utils.js";
import type { ErrorList, History, Attempt, Summary } from "./types.js";
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

const args = parseArgs({
  "--errors": ".cache/buildfix/errors.json",
  "--out": ".cache/buildfix",
  "--model": "qwen3:4b",
  "--max-cycles": "5",
  "--only-code": "",
  "--only-file": "",
  "--tsconfig": "",
  // git
  "--git": "off", // off | per-error
  "--commit-on": "always", // always | success
  "--branch-prefix": "buildfix",
  "--remote": "origin",
  "--push": "false",
  "--use-gh": "false",
  // rollback
  "--rollback-on-regress": "true", // if after error count > before, undo worktree changes
});

function makeBranch(err: any) {
  const fileSlug = err.file
    .replace(process.cwd() + path.sep, "")
    .replace(/[\/\\\.]/g, "-");
  return sanitizeBranch(
    `${args["--branch-prefix"]}/${err.code}/${fileSlug}/${err.line}`,
  );
}

async function main() {
  const errors = await readJSON<ErrorList>(path.resolve(args["--errors"]));
  if (!errors) throw new Error("errors.json not found");
  const tsconfig = args["--tsconfig"] || errors.tsconfig;
  const onlyCode = (args["--only-code"] || "").trim();
  const onlyFile = (args["--only-file"] || "").trim();
  const maxCycles = Number(args["--max-cycles"]);
  const OUT = path.resolve(args["--out"]);

  const useGit = args["--git"] !== "off" && (await isGitRepo());
  const commitOn = (args["--commit-on"] as "always" | "success") || "always";
  const remote = args["--remote"];
  const push = args["--push"] === "true";
  const useGh = args["--use-gh"] === "true";
  const doRollback = args["--rollback-on-regress"] === "true";

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
    if (useGit && args["--git"] === "per-error") {
      branch = makeBranch(err);
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
        plan = await requestPlan(args["--model"], err, history);
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
          const { r: re, present: rePresent } = await buildAndJudge(
            tsconfig,
            err.key,
          );
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
          att.branch = branch;
          if (push && branch) {
            att.pushed = await pushBranch(branch, remote);
            if (att.pushed && useGh)
              att.prUrl = await createPR(branch, title, bodyPath);
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

    summary.items.push({
      key: err.key,
      resolved,
      attempts: history.attempts.length,
      lastSnippet: history.attempts.at(-1)?.snippetPath,
      branch,
    });
  }

  await writeJSON(path.join(OUT, "summary.json"), summary);
  console.log(
    `buildfix: iterate — resolved ${
      summary.items.filter((i) => i.resolved).length
    }/${summary.items.length}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
