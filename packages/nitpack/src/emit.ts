import { mkdir, writeFile } from "node:fs/promises";
import * as path from "node:path";

import { NIT_KEYS, KEY_TITLES } from "./classify.js";
import type { Classification, NitKey } from "./classify.js";

type EmitArgs = Readonly<{
  pr: number;
  outDir: string;
  classification: Classification;
  counts: Readonly<Partial<Record<NitKey, number>>>;
  policy: readonly string[];
}>;

const header = (title: string) => `# ${title}\n\n`;

export const emitTasks = async (a: EmitArgs): Promise<void> => {
  await mkdir(a.outDir, { recursive: true });

  const code = renderCodemodsTask(a.pr, a.classification, a.counts);
  const pol = renderPolicyTask(a.pr, a.policy);

  await Promise.all([
    writeFile(
      path.join(a.outDir, `pr-${a.pr}-nitpack-codemods.md`),
      code,
      "utf8",
    ),
    writeFile(path.join(a.outDir, `pr-${a.pr}-nitpack-policy.md`), pol, "utf8"),
  ]);
};

const renderCodemodsTask = (
  pr: number,
  cls: Classification,
  counts: Readonly<Partial<Record<NitKey, number>>>,
): string => {
  const keys = NIT_KEYS.filter((k) => cls.has(k));
  const items = keys
    .map((key) => {
      const count = counts[key] ?? 0;
      const title = KEY_TITLES[key];
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
