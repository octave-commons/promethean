import { promises as fs } from "fs";
import * as path from "path";

import matter from "gray-matter";
import { slug } from "@promethean-os/utils";

import { parseArgs, writeText } from "./utils.js";
import type { PlanFile } from "./types.js";

const args = parseArgs({
  "--plan": ".cache/cookbook/plan.json",
  "--out": "docs/cookbook",
} as const);

const START = "<!-- COOKBOOK:BEGIN -->";
const END = "<!-- COOKBOOK:END -->";

function strip(text: string) {
  const si = text.indexOf(START),
    ei = text.indexOf(END);
  return si >= 0 && ei > si
    ? (text.slice(0, si).trimEnd() + "\n").trimEnd()
    : text.trimEnd();
}

function render(recipe: any) {
  const codeBlock = [
    "## Code",
    "```" + recipe.code_lang,
    recipe.code.trimEnd(),
    "```",
    "",
  ].join("\n");
  return [
    START,
    `# ${recipe.title}`,
    "",
    `> ${recipe.problem}`,
    "",
    "## Steps",
    ...recipe.steps.map((s: string, i: number) => `${i + 1}. ${s}`),
    "",
    codeBlock,
    "## Ingredients",
    ...recipe.ingredients.map((i: string) => `- ${i}`),
    "",
    recipe.see_also?.length
      ? "## See also\n" +
        recipe.see_also.map((l: string) => `- ${l}`).join("\n") +
        "\n"
      : "",
    END,
    "",
  ].join("\n");
}

async function main() {
  const plan = JSON.parse(
    await fs.readFile(path.resolve(args["--plan"]), "utf-8"),
  ) as PlanFile;
  const OUT = path.resolve(args["--out"]);
  await fs.mkdir(OUT, { recursive: true });

  let count = 0;
  for (const recs of Object.values(plan.groups)) {
    for (const r of recs) {
      const dir = path.join(OUT, r.task);
      await fs.mkdir(dir, { recursive: true });
      const fname = `${slug(r.title)}.md`;
      const p = path.join(dir, fname);

      const existing = await (async () => {
        try {
          return await fs.readFile(p, "utf-8");
        } catch {
          return undefined;
        }
      })();
      const gm = existing ? matter(existing) : { content: "", data: {} as any };
      const content =
        (strip(gm.content) ? strip(gm.content) + "\n\n" : "") + render(r);
      const fm = {
        ...(gm as any).data,
        uuid: r.uuid,
        title: r.title,
        task: r.task,
        runtime: r.runtime,
        difficulty: r.difficulty,
        estimated_time: r.estimated_time,
        tags: r.tags,
      };
      const final = matter.stringify(content, fm, { language: "yaml" });
      await writeText(p, final);
      count++;
    }
  }
  console.log(`cookbook: wrote ${count} recipe(s) to ${args["--out"]}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
