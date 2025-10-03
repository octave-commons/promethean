#!/usr/bin/env node
import { loadKanbanConfig } from "./board/config.js";
import {
  COMMAND_HANDLERS,
  runCommand,
  type CliContext,
} from "./cli/command-handlers.js";

const LEGACY_FLAG_MAP = Object.freeze(
  new Map<string, string>([
    ["--kanban", "--board-file"],
    ["--tasks", "--tasks-dir"],
  ]),
);

const LEGACY_FLAG_ENTRIES = Array.from(LEGACY_FLAG_MAP.entries());

const normalizeLegacyToken = (token: string): string =>
  LEGACY_FLAG_ENTRIES.reduce((current, [legacy, mapped]) => {
    if (current === legacy) {
      return mapped;
    }
    if (current.startsWith(`${legacy}=`)) {
      return `${mapped}=${current.slice(legacy.length + 1)}`;
    }
    return current;
  }, token);

const normalizeLegacyArgs = (
  args: ReadonlyArray<string>,
): ReadonlyArray<string> => args.map(normalizeLegacyToken);

const LEGACY_ENV_MAPPINGS = Object.freeze([
  ["KANBAN_PATH", "KANBAN_BOARD_FILE"],
  ["TASKS_PATH", "KANBAN_TASKS_DIR"],
] as const);

const applyLegacyEnv = (
  env: Readonly<NodeJS.ProcessEnv>,
): Readonly<NodeJS.ProcessEnv> => {
  const patches = LEGACY_ENV_MAPPINGS.reduce<
    ReadonlyArray<readonly [string, string]>
  >((acc, [legacy, modern]) => {
    const legacyValue = env[legacy];
    if (typeof legacyValue === "string" && typeof env[modern] !== "string") {
      return [...acc, [modern, legacyValue] as const];
    }
    return acc;
  }, []);
  if (patches.length === 0) {
    return { ...env };
  }
  return {
    ...env,
    ...Object.fromEntries(patches),
  };
};

const HELP_TEXT =
  `Usage: kanban [--kanban path] [--tasks path] <subcommand> [args...]\n` +
  `Subcommands: ${Object.keys(COMMAND_HANDLERS).join(", ")}`;

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const normalizedArgs = normalizeLegacyArgs(rawArgs);
  const helpRequested =
    normalizedArgs.includes("--help") || normalizedArgs.includes("-h");

  const { config, restArgs } = await loadKanbanConfig({
    argv: normalizedArgs,
    env: applyLegacyEnv(process.env),
  });

  const [command, ...args] = restArgs;
  if (helpRequested || !command) {
    console.error(HELP_TEXT);
    process.exit(2);
  }

  const context: CliContext = {
    boardFile: config.boardFile,
    tasksDir: config.tasksDir,
  };

  await runCommand(command, args, context);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exit(1);
});
