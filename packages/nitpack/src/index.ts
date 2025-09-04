#!/usr/bin/env node
import { argv, cwd, env, exit } from "node:process";
import { normalizeArgs } from "./normalize.js";
import { fetchAllComments } from "./github.js";
import { normalizeComments } from "./text.js";
import { classifyComments, NIT_KEYS, toPolicyChanges } from "./classify.js";
import { countOccurrences } from "./rg.js";
import { emitTasks } from "./emit.js";

const main = async () => {
  const args = normalizeArgs(argv.slice(2));
  const token = args.token ?? env.GITHUB_TOKEN;
  if (!args.repo || !args.pr) {
    console.error(
      "Usage: nitpack --repo <owner/name> --pr <number> [--out docs/agile/tasks] [--token ...]",
    );
    exit(2);
  }
  if (!token) {
    console.error("Missing token. Provide --token or set GITHUB_TOKEN");
    exit(2);
  }
  const repoRoot = args.root ?? cwd();
  const outDir = args.out ?? "docs/agile/tasks";

  const { owner, name } = parseRepo(args.repo);
  const { issueComments, reviewComments } = await fetchAllComments({
    owner,
    repo: name,
    pr: Number(args.pr),
    token,
  });

  const allBodies = [...issueComments, ...reviewComments]
    .map((c) => c.body)
    .filter(Boolean);
  const normalized = normalizeComments(allBodies);

  const classification = classifyComments(normalized);
  const keys = Array.from(classification.keys());
  const counts = Object.fromEntries(
    await Promise.all(
      keys.map(
        async (key) => [key, await countOccurrences(key, repoRoot)] as const,
      ),
    ),
  );

  await emitTasks({
    pr: Number(args.pr),
    outDir,
    classification,
    counts,
    policy: toPolicyChanges(classification),
  });

  console.log(`[nitpack] wrote tasks for PR #${args.pr} to ${outDir}`);
};

const parseRepo = (repo: string) => {
  const [owner, name] = repo.split("/");
  if (!owner || !name) throw new Error("Bad --repo, expected owner/name");
  return { owner, name };
};

main().catch((err) => {
  console.error("[nitpack] error:", err?.stack || err);
  exit(1);
});
