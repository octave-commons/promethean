import { mkdir, writeFile } from "node:fs/promises";
import * as path from "node:path";
import type { Classification } from "./classify.js";

type EmitArgs = Readonly<{
  pr: number;
  outDir: string;
  classification: Classification;
  counts: Readonly<Record<string, number>>;
  policy: readonly string[];
}>;

const header = (title: string) => `# ${title}\n\n`;

export const emitTasks = async (a: EmitArgs): Promise<void> => {
  await mkdir(a.outDir, { recursive: true });

  const code = renderCodemodsTask(a.pr, a.classification, a.counts);
  const pol = renderPolicyTask(a.pr, a.policy);

  await writeFile(
    path.join(a.outDir, `pr-${a.pr}-nitpack-codemods.md`),
    code,
    "utf8",
  );
  await writeFile(
    path.join(a.outDir, `pr-${a.pr}-nitpack-policy.md`),
    pol,
    "utf8",
  );
};

const renderCodemodsTask = (
  pr: number,
  cls: Classification,
  counts: Readonly<Record<string, number>>,
): string => {
  const items = Array.from(cls.entries())
    .map(([key, comments]) => {
      const count = counts[key] ?? 0;
      const title = keyToTitle(key);
      return `- [ ] ${key} — ${count} matches — Fix: ${title}`;
    })
    .join("\n");

  return [
    header(`PR #${pr} — nitpack codemods`),
    "**Status:** #ready",
    "",
    "## Checklist",
    items || "_No codemods detected_",
    "",
  ].join("\n");
};

const renderPolicyTask = (pr: number, policy: readonly string[]): string => {
  const items = policy.map((p) => `- [ ] ${p}`).join("\n");
  return [
    header(`PR #${pr} — nitpack policy fixes`),
    "**Status:** #ready",
    "",
    "## Checklist",
    items || "_No policy changes detected_",
    "",
  ].join("\n");
};

const keyToTitle = (key: string): string => {
  switch (key) {
    case "REL_JS_SUFFIX":
      return 'append ".js" to relative TS imports (codemod)';
    case "NO_TS_PATHS":
      return "remove TS path aliases from tsconfig files";
    case "NATIVE_ESM":
      return "enforce native ESM (type:module, NodeNext)";
    case "NO_DEFAULT_EXPORT":
      return "replace default exports with named exports";
    case "IMPORT_ORDER":
      return "apply consistent import ordering";
    case "IMMUTABLE_FP":
      return "prefer immutability / no mutation";
    case "GPL_ONLY":
      return "ensure package.json license is GPL-3.0-only";
    case "NO_EMBED_HTML":
      return "remove embedded HTML from backend handlers";
    case "FASTIFY_STATIC":
      return "serve static content via @fastify/static";
    case "AVA_TESTS":
      return "normalize AVA tests/config";
    default:
      return key.toLowerCase();
  }
};
