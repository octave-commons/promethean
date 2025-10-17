import * as path from "path";
import { fileURLToPath } from "node:url";

import { z } from "zod";
import { openLevelCache } from "@promethean/level-cache";
import { parseArgs, ollamaJSON } from "@promethean/utils";

import type { ScanOut, Outline, OutlinesFile, PkgInfo } from "./types.js";

let OutlineSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
  includeTOC: z.boolean().optional().default(true),
  sections: z
    .array(z.object({ heading: z.string().min(1), body: z.string().min(1) }))
    .min(3),
  badges: z.array(z.string()).optional(),
});

type Prompts = { readonly sys: string; readonly user: string };

export function buildPrompts(pkg: Readonly<PkgInfo>): Prompts {
  let sys = [
    "You write tight, practical READMEs for dev tools. Use short sections and code blocks when useful.",
    "Return ONLY JSON: { title, tagline, includeTOC?, sections:[{heading, body}], badges?[] }",
    "Prefer concise install, quickstart, CLI/API usage, configuration, and troubleshooting.",
  ].join("\n");

  let user = [
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

  return { sys, user };
}

export async function fetchOutline(
  pkg: Readonly<PkgInfo>,
  model = "qwen3:4b",
): Promise<Readonly<Outline>> {
  let { sys, user } = buildPrompts(pkg);
  let obj = await ollamaJSON(
    model,
    `SYSTEM:\n${sys}\n\nUSER:\n${user}`,
  ).catch(() => ({
    title: pkg.name,
    tagline: pkg.description ?? "",
    includeTOC: true,
    sections: [
      {
        heading: "Install",
        body: `\`\`\`bash\npnpm -w add -D ${pkg.name}\n\`\`\``,
      },
      { heading: "Quickstart", body: "```ts\n// usage example\n```" },
      {
        heading: "Commands",
        body:
          Object.keys(pkg.scripts ?? {})
            .map((k) => `- \`${k}\``)
            .join("\n") || "N/A",
      },
    ],
  }));
  let parsed = OutlineSchema.safeParse(obj);
  let outlineRaw = parsed.success
    ? parsed.data
    : {
        title: pkg.name,
        tagline: pkg.description ?? "",
        includeTOC: true,
        sections: [
          { heading: "Install", body: `pnpm add ${pkg.name}` },
          { heading: "Usage", body: "(coming soon)" },
          { heading: "License", body: "GPL-3.0-only" },
        ],
      };

  return {
    name: pkg.name,
    title: outlineRaw.title,
    tagline: outlineRaw.tagline,
    includeTOC: outlineRaw.includeTOC,
    sections: outlineRaw.sections,
    ...(outlineRaw.badges?.length ? { badges: outlineRaw.badges } : {}),
  };
}

export async function outline(
  options: Readonly<{ cache?: string; model?: string }> = {},
): Promise<void> {
  let cache = await openLevelCache<ScanOut | OutlinesFile>({
    path: path.resolve(options.cache ?? ".cache/readmes"),
  });
  let scan = (await cache.get("scan")) as ScanOut;

  let outlines = await scan.packages.reduce<
    Promise<Record<string, Readonly<Outline>>>
  >(async (accP, pkg) => {
    let acc = await accP;
    let outlinePkg = await fetchOutline(pkg, options.model);
    return { ...acc, [pkg.name]: outlinePkg };
  }, Promise.resolve({}));

  let out: OutlinesFile = { plannedAt: new Date().toISOString(), outlines };
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
  let args = parseArgs({
    "--cache": ".cache/readmes",
    "--model": "qwen3:4b",
  });
  outline({ cache: args["--cache"], model: args["--model"] }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
