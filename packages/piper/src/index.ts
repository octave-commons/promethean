#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-only
import * as path from "path";
import { runPipeline, watchPipeline } from "./runner.js";

function usage() {
  console.log(`piper <command> [options]

Commands:
  list                         List pipelines in pipelines.yaml
  run <name>                   Run a pipeline
  watch <name>                 Watch inputs & re-run

Options for run/watch:
  --config pipelines.yaml      Path to pipelines file (yaml|json)
  --force                      Ignore cache
  --dry                        Dry-run (plan)
  --concurrency 4              Concurrency
  --report docs/agile/pipelines
  --content-hash               Use content hashing even if step cache=mtime`);
}

async function listPipelines(configPath: string) {
  const { readFileSync } = await import("fs");
  const YAML = (await import("yaml")).default;
  const raw = readFileSync(configPath, "utf-8");
  const obj = configPath.endsWith(".json") ? JSON.parse(raw) : YAML.parse(raw);
  const pipes = Array.isArray(obj?.pipelines) ? obj.pipelines : [];
  console.log(pipes.map((p: any) => "- " + p.name).join("\n"));
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const get = (flag: string, dflt?: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i+1] : dflt;
  };
  const has = (flag: string) => args.includes(flag);

  const configPath = path.resolve(get("--config", "pipelines.yaml")!);

  if (!cmd || cmd === "help" || cmd === "--help") return usage();
  if (cmd === "list") return listPipelines(configPath);

  if (cmd === "run" || cmd === "watch") {
    const name = args[1];
    if (!name) { usage(); process.exit(1); }
    const opts = {
      force: has("--force"),
      dryRun: has("--dry"),
      concurrency: Number(get("--concurrency", "2")),
      reportDir: get("--report", "docs/agile/pipelines")!,
      contentHash: has("--content-hash")
    };
    if (cmd === "run") await runPipeline(configPath, name, opts);
    else await watchPipeline(configPath, name, opts);
    return;
  }

  usage();
}

main().catch(e => { console.error(e); process.exit(1); });
