#!/usr/bin/env node
import { argv, exit } from "node:process";
import { ContextRegistry } from "./registry.js";
import type { ContextInit } from "./types/context.js";

export interface CliDependencies {
  registry?: ContextRegistry;
  log?: (message: string) => void;
  error?: (message: string) => void;
}

const defaultRegistry = new ContextRegistry();

async function listSources(registry: ContextRegistry, log: (message: string) => void): Promise<void> {
  const sources = registry.listSources();
  log(JSON.stringify(sources, null, 2));
}

async function createDemoContext(registry: ContextRegistry, log: (message: string) => void): Promise<void> {
  if (registry.listSources().length === 0) {
    registry.registerSource({
      id: { kind: "enso-asset", location: "enso://asset/demo" },
      owners: [{ userId: "demo" }],
      discoverability: "visible",
      availability: { mode: "public" },
      title: "Demo Asset",
    });
  }
  const demo: ContextInit = {
    name: "demo",
    owner: { userId: "demo" },
    entries: registry.listSources().map((source) => ({
      id: source.id,
      state: "pinned",
      permissions: { readable: true },
    })),
  };
  const ctx = registry.createContext(demo);
  log(JSON.stringify(ctx, null, 2));
}

function showHelp(log: (message: string) => void): void {
  log(`enso-protocol CLI

Commands:
  help                  Show this message
  list-sources          Print registered data sources
  create-demo-context   Register a demo source and emit a context snapshot
`);
}

export async function runCliCommand(command: string, deps: CliDependencies = {}): Promise<void> {
  const registry = deps.registry ?? defaultRegistry;
  const log = deps.log ?? console.log;
  const error = deps.error ?? console.error;

  switch (command) {
    case "help":
      showHelp(log);
      return;
    case "list-sources":
      await listSources(registry, log);
      return;
    case "create-demo-context":
      await createDemoContext(registry, log);
      return;
    default:
      error(`Unknown command: ${command}`);
      exit(1);
  }
}

async function main(): Promise<void> {
  const [command = "help"] = argv.slice(2);
  await runCliCommand(command);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    exit(1);
  });
}
