// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable no-console */
import { z } from "zod";
import * as path from "path";
import { promises as fs } from "fs";
import { parseArgs, ollamaJSON, writeJSON } from "./utils.js";
import type { ScanOut, Outline, OutlinesFile } from "./types.js";

const args = parseArgs({
  "--scan": ".cache/readmes/scan.json",
  "--out": ".cache/readmes/outlines.json",
  "--model": "qwen3:4b"
});

const OutlineSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
  includeTOC: z.boolean().optional().default(true),
  sections: z.array(z.object({ heading: z.string().min(1), body: z.string().min(1) })).min(3),
  badges: z.array(z.string()).optional()
});

async function main() {
  const scan = JSON.parse(await fs.readFile(path.resolve(args["--scan"]), "utf-8")) as ScanOut;
  const outlines: Record<string, Outline> = {};

  for (const pkg of scan.packages) {
    const sys = [
      "You write tight, practical READMEs for dev tools. Use short sections and code blocks when useful.",
      "Return ONLY JSON: { title, tagline, includeTOC?, sections:[{heading, body}], badges?[] }",
      "Prefer concise install, quickstart, CLI/API usage, configuration, and troubleshooting."
    ].join("\n");

    const user = [
      `PACKAGE: ${pkg.name} v${pkg.version}`,
      `DESC: ${pkg.description ?? "(none)"}`,
      `HAS_TS: ${pkg.hasTsConfig}`,
      `BIN: ${Object.keys(pkg.bin ?? {}).join(", ") || "(none)"}`,
      `SCRIPTS: ${Object.keys(pkg.scripts ?? {}).slice(0,8).join(", ") || "(none)"}`,
      `INTERNAL_DEPS: ${pkg.workspaceDeps.join(", ") || "(none)"}`,
      "",
      "If the package is a CLI, include a 'Commands' section with examples.",
      "If it's a library, include a 'Quickstart' import/usage snippet.",
      "If the repo uses Piper pipelines, mention how to run the relevant pipeline."
    ].join("\n");

    let obj: any;
    try { obj = await ollamaJSON(args["--model"], `SYSTEM:\n${sys}\n\nUSER:\n${user}`); }
    catch {
      obj = { title: pkg.name, tagline: pkg.description ?? "", includeTOC: true, sections: [
        { heading: "Install", body: "```bash\npnpm -w add -D " + pkg.name + "\n```" },
        { heading: "Quickstart", body: "```ts\n// usage example\n```" },
        { heading: "Commands", body: Object.keys(pkg.scripts ?? {}).map(k => `- \`${k}\``).join("\n") || "N/A" }
      ] };
    }
    const parsed = OutlineSchema.safeParse(obj);
    const outline = parsed.success ? parsed.data : { title: pkg.name, tagline: pkg.description ?? "", includeTOC: true, sections: [{heading:"Install", body:"pnpm add " + pkg.name},{heading:"Usage", body:"(coming soon)"},{heading:"License", body:"MIT"}] };

    outlines[pkg.name] = { name: pkg.name, ...outline };
  }

  const out: OutlinesFile = { plannedAt: new Date().toISOString(), outlines };
  await writeJSON(path.resolve(args["--out"]), out);
  console.log(`readmeflow: outlined ${Object.keys(outlines).length} README(s) → ${args["--out"]}`);
}
main().catch(e => { console.error(e); process.exit(1); });
