// SPDX-License-Identifier: GPL-3.0-only
import * as path from "node:path";

import { chat } from "./ollama.js";
import {
  applyPatch,
  runTests,
  ripgrep,
  readFileSafe,
  summarize,
} from "./tools.js";
type Action =
  | { action: "open_file"; path: string; hint?: string }
  | { action: "search_repo"; query: string }
  | { action: "run_tests"; pattern?: string }
  | { action: "write_patch"; path: string; diff: string }
  | { action: "ask_user"; question: string }
  | { action: "done"; reason?: string };

const plannerModel = process.env.PLANNER_MODEL || "promethean-planner";
const REPO_ROOT = process.env.REPO_ROOT || process.cwd();

const plannerPreamble = `You are the Promethean Orchestrator.
- Output JSON ONLY for one action per turn.
- Allowed actions: open_file, search_repo, run_tests, write_patch, ask_user, done.
- Repo rules: TypeScript default, AVA tests, NEVER use relative imports; only @shared/ts/dist/...; keep patches minimal.
- If uncertain about a path or API, use ask_user.
Schema examples:
{ "action":"open_file", "path":"services/ts/cephalon/src/foo.ts", "hint":"read around function X" }
{ "action":"search_repo", "query":"define HeartbeatClient" }
{ "action":"run_tests", "pattern":"cephalon heartbeat" }
{ "action":"write_patch", "path":"services/ts/cephalon/src/foo.ts", "diff":"@@ ... @@\n- old\n+ new" }
{ "action":"ask_user", "question":"Which module defines the broker client?" }
{ "action":"done", "reason":"tests passed" }
`;

function clampJSON(s: string): string {
  // Heuristic: take first {...} block
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  return s.trim();
}

async function main() {
  const userTask =
    process.argv.slice(2).join(" ") ||
    "Assess repo status and propose the first small test.";
  let messages = [
    { role: "system", content: plannerPreamble },
    { role: "user", content: `Task: ${userTask}` },
  ] as { role: "system" | "user" | "assistant"; content: string }[];

  for (let step = 1; step <= 20; step++) {
    const raw = await chat({
      model: plannerModel,
      messages,
      options: {
        temperature: 0.15,
        top_p: 0.95,
        repeat_penalty: 1.1,
        num_ctx: 8192,
        stop: ["```", "\n\n#"],
      },
    });

    let action: Action;
    try {
      const json = clampJSON(raw);
      action = JSON.parse(json) as Action;
    } catch (e) {
      messages.push({ role: "assistant", content: raw });
      messages.push({
        role: "user",
        content:
          "Your last output was not valid JSON. Output a single action JSON.",
      });
      continue;
    }

    if (action.action === "done") {
      console.log("DONE:", action.reason || "ok");
      break;
    }

    if (action.action === "ask_user") {
      console.log("QUESTION:", action.question);
      break;
    }

    if (action.action === "open_file") {
      const full = path.join(REPO_ROOT, action.path);
      const content = await readFileSafe(full);
      const summary = summarize(content, 1200);
      messages.push({
        role: "assistant",
        content: JSON.stringify(action),
      });
      messages.push({
        role: "user",
        content: `Opened ${action.path}. Summary (truncated):\n\n${summary}`,
      });
      continue;
    }

    if (action.action === "search_repo") {
      const out = await ripgrep(REPO_ROOT, action.query);
      const summary = out.split("\n").slice(0, 40).join("\n");
      messages.push({ role: "assistant", content: JSON.stringify(action) });
      messages.push({
        role: "user",
        content: `Search results (first 40 lines):\n${summary}`,
      });
      continue;
    }

    if (action.action === "run_tests") {
      const res = await runTests(action.pattern);
      messages.push({ role: "assistant", content: JSON.stringify(action) });
      messages.push({
        role: "user",
        content: `Test result:\nexit=${res.code}\nstdout:\n${summarize(
          res.stdout,
          2000,
        )}\nstderr:\n${summarize(res.stderr, 1200)}`,
      });
      if (res.code === 0) {
        messages.push({
          role: "user",
          content: "All tests pass. Consider action: done.",
        });
      }
      continue;
    }

    if (action.action === "write_patch") {
      // write_patch expects a unified diff. We try git apply -3.
      const res = await applyPatch(REPO_ROOT, action.diff);
      messages.push({ role: "assistant", content: JSON.stringify(action) });
      messages.push({
        role: "user",
        content: `Patch apply result: ${res.ok ? "ok" : "failed"}\n${
          res.output
        }`,
      });
      continue;
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
