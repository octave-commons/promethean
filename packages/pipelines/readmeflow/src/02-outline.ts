import * as path from "path";
import { fileURLToPath } from "node:url";

import { z } from "zod";
import { openLevelCache } from "@promethean-os/level-cache";
import { parseArgs } from "@promethean-os/utils";
// Prefer workspace package; fallback to local dist
// eslint-disable-next-line import/no-relative-packages
import { makeOpenAIAdapter } from "../../../pantheon/llm-openai/dist/index.js";

import type { ScanOut, Outline, OutlinesFile, PkgInfo } from "./types.js";

const OutlineSchema = z.object({
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
  const sys = [
    "You write tight, practical READMEs for dev tools. Use short sections and code blocks when useful.",
    "Return ONLY JSON: { title, tagline, includeTOC?, sections:[{heading, body}], badges?[] }",
    "Prefer concise install, quickstart, CLI/API usage, configuration, and troubleshooting.",
    "Use the provided <ctx>context</ctx> to tailor examples and commands.",
  ].join("\n");

  const filesCtx = (pkg.files ?? [])
    .slice(0, 3)
    .map((f) => `FILE: ${f.path}\n---\n${f.content}`)
    .join("\n\n");

  const user = [
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
    "",
    "<ctx>",
    filesCtx || "(no files)",
    "</ctx>",
  ].join("\n");

  return { sys, user };
}

let OPENAI_OK: boolean | null = null;
async function isOpenAIAvailable(baseURL: string, timeoutMs = 1000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const url = baseURL.replace(/\/$/, "") + "/models";
    const res = await fetch(url, { method: "GET", signal: controller.signal } as any);
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchOutline(
  pkg: Readonly<PkgInfo>,
  model = "gpt-oss:20b-cloud",
): Promise<Readonly<Outline>> {
  const { sys, user } = buildPrompts(pkg);
  const baseURL = process.env.OPENAI_BASE_URL || process.env.OLLAMA_URL || "http://localhost:11434/v1";
  const apiKey = process.env.OPENAI_API_KEY || "ollama";

  if (OPENAI_OK === null) {
    OPENAI_OK = await isOpenAIAvailable(baseURL, 800);
  }

  let obj: any = null;
  if (OPENAI_OK) {
    const llm = makeOpenAIAdapter({
      apiKey,
      baseURL,
      defaultModel: model,
      timeout: 8000,
      retryConfig: { maxRetries: 1, baseDelay: 500 },
    });

    obj = await llm
      .complete(
        [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        { model },
      )
      .then((m) => {
        try {
          return JSON.parse(m.content as string);
        } catch {
          return null;
        }
      })
      .catch(() => null);
  }

  const outlineRaw = obj && OutlineSchema.safeParse(obj).success
    ? (OutlineSchema.parse(obj) as any)
    : {
        title: pkg.name,
        tagline: pkg.description ?? "",
        includeTOC: true,
        sections: [
          { heading: "Install", body: `\`\`\`bash\npnpm -w add -D ${pkg.name}\n\`\`\`` },
          { heading: "Quickstart", body: "```ts\n// usage example\n```" },
          {
            heading: "Commands",
            body:
              Object.keys(pkg.scripts ?? {})
                .map((k) => `- \`${k}\``)
                .join("\n") || "N/A",
          },
        ],
      };

  return {
    name: pkg.name,
    title: outlineRaw.title,
    tagline: outlineRaw.tagline,
    includeTOC: outlineRaw.includeTOC,
    sections: outlineRaw.sections,
    ...(outlineRaw.badges?.length ? { badges: outlineRaw.badges } : {}),
  } as Outline;
}

export async function outline(
  options: Readonly<{ cache?: string; model?: string }> = {},
): Promise<void> {
  const cache = await openLevelCache<ScanOut | OutlinesFile>({
    path: path.resolve(options.cache ?? ".cache/readmes"),
  });
  const scan = (await cache.get("scan")) as ScanOut;

  const outlines = await scan.packages.reduce<
    Promise<Record<string, Readonly<Outline>>>
  >(async (accP, pkg) => {
    const acc = await accP;
    const outlinePkg = await fetchOutline(pkg, options.model);
    return { ...acc, [pkg.name]: outlinePkg };
  }, Promise.resolve({}));

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
