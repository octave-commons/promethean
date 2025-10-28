import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  defaultConfigForRepo,
  type LoadKanbanConfigResult,
  type RawKanbanConfig,
} from "./config/shared.js";
import {
  findConfigPath,
  parseArgv,
  parseEnvConfig,
  resolveRepo,
} from "./config/sources.js";
import { mergeConfig } from "./config/merge.js";

const readConfigPayload = async (
  configPath: string,
): Promise<
  Readonly<{ readonly raw: RawKanbanConfig; readonly dir: string }>
> => {
  const rawJson = await readFile(configPath, "utf8");
  return {
    raw: JSON.parse(rawJson) as RawKanbanConfig,
    dir: path.dirname(configPath),
  } as const;
};

export const loadKanbanConfig = async (
  options?: Readonly<{
    readonly argv?: ReadonlyArray<string>;
    readonly env?: Readonly<NodeJS.ProcessEnv>;
  }>,
): Promise<LoadKanbanConfigResult> => {
  const argv = options?.argv ?? process.argv.slice(2);
  const env = options?.env ?? process.env;
  const envValues = parseEnvConfig(env);
  const { values: argValues, rest } = parseArgv(argv);
  const cwd = process.cwd();
  const repo = await resolveRepo(argValues, envValues, cwd);
  const defaults = defaultConfigForRepo(repo);
  const explicitConfig =
    (argValues.config as string | undefined) ??
    (envValues.config as string | undefined);
  const configPath = await findConfigPath(repo, explicitConfig, cwd);
  const filePayload =
    typeof configPath === "string"
      ? await readConfigPayload(configPath)
      : { raw: {}, dir: repo };
  const config = mergeConfig({
    defaults,
    repo,
    cwd,
    envValues,
    argValues,
    fileConfig: filePayload.raw,
    configDir: filePayload.dir,
  });
  return { config, restArgs: rest } as const;
};
