import * as path from "path";

import { runPipeline, watchPipeline } from "./runner.js";

function usage() {
  console.log(`piper <command> [options]

Commands:
  list                         List pipelines in pipelines.json
  status <name>                Show cache/status for each step
  run <name>                   Run a pipeline
  watch <name>                 Watch inputs & re-run
  dev-ui                       Launch the Dev UI server

Options for run/watch:
  --config pipelines.json      Path to pipelines file (json)
  --force                      Ignore cache
  --dry                        Dry-run (plan)
  --concurrency 4              Concurrency
  --report docs/agile/pipelines
  --content-hash               Use content hashing even if step cache=mtime
  --json                       Emit NDJSON events (start/skip/end)

Options for dev-ui:
  --config pipelines.json      Path to pipelines file (json)
  --port 3939                  Port to bind
  --token <string>             Optional Bearer token`);
}

async function listPipelines(configPath: string) {
  const { readFileSync } = await import("fs");
  const raw = readFileSync(configPath, "utf-8");
  const obj = JSON.parse(raw);
  const pipes = Array.isArray(obj?.pipelines) ? obj.pipelines : [];
  console.log(pipes.map((p: any) => "- " + p.name).join("\n"));
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const get = (flag: string, dflt?: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : dflt;
  };
  const has = (flag: string) => args.includes(flag);

  const configPath = path.resolve(get("--config", "pipelines.json")!);

  if (!cmd || cmd === "help" || cmd === "--help") return usage();
  if (cmd === "list") return listPipelines(configPath);

  if (cmd === "status") {
    const { showStatus } = await import("./status.js");
    const name = args[1];
    if (!name) {
      usage();
      process.exit(1);
    }
    return showStatus(configPath, name);
  }

  if (cmd === "dev-ui") {
    // The dev UI script reads flags directly from process.argv and starts the server.
    await import("./dev-ui.js");
    return;
  }

  if (cmd === "run" || cmd === "watch") {
    const name = args[1];
    if (!name) {
      usage();
      process.exit(1);
    }
    const opts = {
      force: has("--force"),
      dryRun: has("--dry"),
      concurrency: Number(get("--concurrency", "2")),
      reportDir: get("--report", "docs/agile/pipelines")!,
      contentHash: has("--content-hash"),
      json: has("--json"),
    } as any;
    if (cmd === "run") await runPipeline(configPath, name, opts);
    else await watchPipeline(configPath, name, opts);
    return;
  }

  usage();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
