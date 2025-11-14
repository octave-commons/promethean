import fs from "node:fs/promises";
import path from "node:path";
import { tool } from "@openai/agents";
import { z } from "zod";

export type Edit = { path: string; startLine: number; endLine: number; replacement: string };

export async function readFileSlice(file: string, lineStart: number, lineEnd?: number) {
  const text = await fs.readFile(file, "utf8");
  const lines = text.split("\n");
  const start = Math.max(1, lineStart - 6);
  const end = Math.min(lines.length, (lineEnd ?? lineStart) + 6);
  const slice = lines.slice(start - 1, end).join("\n");
  return { slice, start, end, total: lines.length };
}

export async function applyEdits(edits: readonly Edit[]): Promise<number> {
  let changed = 0;
  for (const e of edits) {
    const full = path.join(process.cwd(), e.path);
    const content = await fs.readFile(full, "utf8");
    const lines = content.split("\n");
    const s = Math.max(1, e.startLine) - 1;
    const t = Math.min(lines.length, e.endLine);
    const replacementLines = (e.replacement ?? "").replace(/\r\n/g, "\n").split("\n");
    const newLines = [...lines.slice(0, s), ...replacementLines, ...lines.slice(t)];
    const newText = newLines.join("\n");
    if (newText !== content) {
      await fs.writeFile(full, newText, "utf8");
      changed++;
    }
  }
  return changed;
}

export function createApplyEditsTool(name = "apply_edits", description?: string) {
  return tool({
    name,
    description: description ?? "Apply minimal line-range edits to files",
    parameters: z.object({
      edits: z.array(z.object({ path: z.string(), startLine: z.number().min(1), endLine: z.number().min(1), replacement: z.string() })).min(1),
    }),
    execute: async ({ edits }) => {
      const changed = await applyEdits(edits);
      return JSON.stringify({ changed });
    },
  });
}

export function createDoneTool(name = "done", description?: string) {
  return tool({
    name,
    description: description ?? "Finish when there are no remaining errors or budget is exhausted",
    parameters: z.object({ reason: z.string() }),
    execute: async ({ reason }) => JSON.stringify({ ok: true, reason }),
  });
}
