import { indexSessions } from "@promethean-os/reconstituter/opencode-sessions";
import { pathToFileURL } from "node:url";

export type IndexerDeps = {
  indexSessions: () => Promise<void>;
};

export type IndexerMode = "historical-backfill" | "disabled";

export async function runIndexer(deps: IndexerDeps): Promise<void> {
  await deps.indexSessions();
}

function resolveMode(): IndexerMode {
  const rawMode = process.env.OPENCODE_INDEXER_MODE;
  if (!rawMode || rawMode.length === 0) {
    return "historical-backfill";
  }

  if (rawMode === "historical-backfill" || rawMode === "disabled") {
    return rawMode;
  }

  throw new Error(
    `Unsupported OPENCODE_INDEXER_MODE=${rawMode}. Expected "historical-backfill" or "disabled".`
  );
}

export function resolveDeps(): IndexerDeps {
  const mode = resolveMode();

  if (mode === "disabled") {
    return { indexSessions: async () => {} };
  }

  if (process.env.OPENCODE_INDEXER_NOOP === "1") {
    return { indexSessions: async () => {} };
  }

  return { indexSessions };
}

async function main(): Promise<void> {
  try {
    await runIndexer(resolveDeps());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("opencode-indexer failed:", message);
    process.exitCode = 1;
  }
}

const entryHref = pathToFileURL(process.argv[1] ?? "").href;
if (entryHref === import.meta.url) {
  main();
}
