/* eslint-disable no-console */
import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import { parseArgs, writeJSON } from "./utils.js";
import type { RunResultsFile, VerifyFile, VerifyItem } from "./types.js";

const args = parseArgs({
  "--runs": ".cache/cookbook/run-results.json",
  "--out": ".cache/cookbook/verify.json",
  "--accept": "false"
});

async function main() {
    const runs = JSON.parse(await fs.readFile(path.resolve(args["--runs"] ?? ""), "utf-8")) as RunResultsFile;
    const accept = (args["--accept"] ?? "") === "true";
  const items: VerifyItem[] = [];

    for (const r of runs.results) {
      const raw = await fs.readFile(r.recipePath, "utf-8");
      const gm = matter(raw);
      const expected = gm.data?.expected_output_hash as string | undefined;
      const actual = r.stdoutHash;

    if (accept && (!expected || expected !== actual)) {
      const fm = { ...(gm.data as any), expected_output_hash: actual };
      const final = matter.stringify(gm.content, fm, { language: "yaml" });
      await fs.writeFile(r.recipePath, final, "utf-8");
    }

      const item: VerifyItem = { recipePath: r.recipePath, ok: !!actual && !!expected && expected === actual && r.ok };
      if (expected !== undefined) item.expected = expected;
      if (actual !== undefined) item.actual = actual;
      items.push(item);
    }

    const out: VerifyFile = { verifiedAt: new Date().toISOString(), items };
    const outPath = args["--out"] ?? ".cache/cookbook/verify.json";
    await writeJSON(path.resolve(outPath), out);
    console.log(`cookbook: verify → ${outPath} (accept=${accept})`);
}
main().catch(e => { console.error(e); process.exit(1); });
