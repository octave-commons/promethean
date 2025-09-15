import * as path from "path";
import { fileURLToPath } from "node:url";

import { z } from "zod";
import { openLevelCache } from "@promethean/level-cache";
import { parseArgs, ollamaJSON } from "@promethean/utils";

import type { ScanOut, Outline, OutlinesFile } from "./types.js";

const OutlineSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
  includeTOC: z.boolean().optional().default(true),
  sections: z
    .array(z.object({ heading: z.string().min(1), body: z.string().min(1) }))
    .min(3),
  badges: z.array(z.string()).optional(),
});

type Pkg = ScanOut["packages"][number];
type OutlineRaw = z.infer<typeof OutlineSchema>;

const SYS_PROMPT = [
  "You write tight, practical READMEs for dev tools. Use short sections and code blocks when useful.",
  "Return ONLY JSON: { title, tagline, includeTOC?, sections:[{heading, body}], badges?[] }",
  "Prefer concise install, quickstart, CLI/API usage, configuration, and troubleshooting.",
].join("\n");

const userPrompt = (pkg: Pkg): string =>
  [
    `PACKAGE: ${pkg.name} v${pkg.version}`,
    `DESC: ${pkg.description ?? "(none)"}`,
    `HAS_TS: ${pkg.hasTsConfig}`,
    `BIN: ${Object.keys(pkg.bin ?? {}).join(", ") || "(none)"}`,
    `SCRIPTS: ${
      Object.keys(pkg.scripts ?? {})
        .slice(0, 8)
        .join(", ") || "(none)"
    }`,
    `INTERNAL_DEPS: ${pkg.workspaceDeps.join(", ") || "(none)"}`,
    "",
    "If the package is a CLI, include a 'Commands' section with examples.",
    "If it's a library, include a 'Quickstart' import/usage snippet.",
    "If the repo uses Piper pipelines, mention how to run the relevant pipeline.",
  ].join("\n");

const fallbackOutline = (pkg: Pkg): OutlineRaw => ({
  title: pkg.name,
  tagline: pkg.description ?? "",
  includeTOC: true,
  sections: [
    { heading: "Install", body: `pnpm add ${pkg.name}` },
    { heading: "Usage", body: "(coming soon)" },
    { heading: "License", body: "GPLv3" },
  ],
});

const outlineFromRaw = (pkg: Pkg, raw: OutlineRaw): Outline => ({
  name: pkg.name,
  title: raw.title,
  tagline: raw.tagline,
  includeTOC: raw.includeTOC,
  sections: raw.sections,
  ...(raw.badges?.length ? { badges: raw.badges } : {}),
});

const fetchOutline = async (pkg: Pkg, model: string): Promise<Outline> => {
  const prompt = `SYSTEM:\n${SYS_PROMPT}\n\nUSER:\n${userPrompt(pkg)}`;
  const obj = await ollamaJSON(model, prompt).catch(() => fallbackOutline(pkg));
  const parsed = OutlineSchema.safeParse(obj);
  const raw = parsed.success ? parsed.data : fallbackOutline(pkg);
  return outlineFromRaw(pkg, raw);
};

const buildOutlines = async (
  pkgs: Pkg[],
  model: string,
): Promise<Record<string, Outline>> =>
  Object.fromEntries(
    await Promise.all(
      pkgs.map(
        async (pkg) => [pkg.name, await fetchOutline(pkg, model)] as const,
      ),
    ),
  );

export async function outline(
  options: { cache?: string; model?: string } = {},
): Promise<void> {
  const cache = await openLevelCache<ScanOut | OutlinesFile>({
    path: path.resolve(options.cache ?? ".cache/readmes"),
  });
  const scan = (await cache.get("scan")) as ScanOut;
  const model = options.model ?? "qwen3:4b";
  const outlines = await buildOutlines(scan.packages, model);
  const out: OutlinesFile = { plannedAt: new Date().toISOString(), outlines };
  await cache.set("outlines", out);
  await cache.close();
  console.log(
    `readmeflow: outlined ${Object.keys(outlines).length} README(s) → ${
      options.cache ?? ".cache/readmes"
    }`,
  );
}

export default outline;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs({
    "--cache": ".cache/readmes",
    "--model": "qwen3:4b",
  });
  outline({ cache: args["--cache"], model: args["--model"] }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
