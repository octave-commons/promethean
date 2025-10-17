import {
  normalizeExts,
  parseList,
  resolveWithBase,
  type Defaults,
  type ReadonlySetLike,
  type KanbanConfig,
  type OverrideMap,
  type RawKanbanConfig,
} from "./shared.js";

type MergeContext = Readonly<{
  readonly repo: string;
  readonly configDir: string;
  readonly cwd: string;
}>;

type PathParams = Readonly<{
  readonly defaults: string;
  readonly envValue?: string;
  readonly configValue?: string;
  readonly argValue?: string;
  readonly context: MergeContext;
}>;

const mergePathSetting = (params: PathParams): string => {
  const fromEnv =
    typeof params.envValue === "string"
      ? resolveWithBase(params.context.repo, params.envValue)
      : params.defaults;
  const fromConfig =
    typeof params.configValue === "string"
      ? resolveWithBase(params.context.configDir, params.configValue)
      : fromEnv;
  return typeof params.argValue === "string"
    ? resolveWithBase(params.context.cwd, params.argValue)
    : fromConfig;
};

const resolveConfigArray = (
  current: ReadonlyArray<string>,
  override: string | ReadonlyArray<string> | undefined,
): ReadonlyArray<string> => {
  if (Array.isArray(override)) {
    const normalized = override
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter((entry) => entry.length > 0);
    return normalized.length > 0 ? normalized : current;
  }
  if (typeof override === "string") {
    const normalized = parseList(override);
    return normalized.length > 0 ? normalized : current;
  }
  return current;
};

type ArrayParams = Readonly<{
  readonly defaults: ReadonlyArray<string>;
  readonly envValue?: string | ReadonlyArray<string>;
  readonly configValue?: ReadonlyArray<string>;
  readonly argValue?: string | ReadonlyArray<string>;
}>;

const mergeArraySetting = ({
  defaults,
  envValue,
  configValue,
  argValue,
}: ArrayParams): ReadonlyArray<string> => {
  const fromEnv = resolveConfigArray(defaults, envValue);
  const fromConfig = resolveConfigArray(fromEnv, configValue);
  return resolveConfigArray(fromConfig, argValue);
};

type MergeInputs = Readonly<{
  readonly defaults: Defaults;
  readonly repo: string;
  readonly cwd: string;
  readonly envValues: OverrideMap;
  readonly argValues: OverrideMap;
  readonly fileConfig: RawKanbanConfig;
  readonly configDir: string;
}>;

const buildPaths = ({
  defaults,
  repo,
  cwd,
  envValues,
  argValues,
  fileConfig,
  configDir,
}: MergeInputs): Readonly<{
  readonly tasksDir: string;
  readonly indexFile: string;
  readonly boardFile: string;
  readonly cachePath: string;
}> => {
  const context: MergeContext = {
    repo,
    configDir,
    cwd,
  } as const;
  const tasksDir = mergePathSetting({
    defaults: defaults.tasksDir,
    envValue: envValues.tasksDir as string | undefined,
    configValue: fileConfig.tasksDir,
    argValue: argValues.tasksDir as string | undefined,
    context,
  });
  const indexFile = mergePathSetting({
    defaults: defaults.indexFile,
    envValue: envValues.indexFile as string | undefined,
    configValue: fileConfig.indexFile,
    argValue: argValues.indexFile as string | undefined,
    context,
  });
  const boardFile = mergePathSetting({
    defaults: defaults.boardFile,
    envValue: envValues.boardFile as string | undefined,
    configValue: fileConfig.boardFile,
    argValue: argValues.boardFile as string | undefined,
    context,
  });
  const cachePath = mergePathSetting({
    defaults: defaults.cachePath,
    envValue: envValues.cachePath as string | undefined,
    configValue: fileConfig.cachePath,
    argValue: argValues.cachePath as string | undefined,
    context,
  });
  return { tasksDir, indexFile, boardFile, cachePath } as const;
};

const buildArrays = ({
  defaults,
  envValues,
  argValues,
  fileConfig,
}: MergeInputs): Readonly<{
  readonly exts: ReadonlyArray<string>;
  readonly requiredFields: ReadonlyArray<string>;
  readonly statusValues: ReadonlyArray<string>;
  readonly priorityValues: ReadonlyArray<string>;
}> => {
  const exts = normalizeExts(
    mergeArraySetting({
      defaults: defaults.exts,
      envValue: envValues.exts,
      configValue: fileConfig.exts,
      argValue: argValues.exts,
    }),
  );
  const requiredFields = mergeArraySetting({
    defaults: defaults.requiredFields,
    envValue: envValues.requiredFields,
    configValue: fileConfig.requiredFields,
    argValue: argValues.requiredFields,
  });
  const statusValues = mergeArraySetting({
    defaults: defaults.statusValues,
    envValue: envValues.statusValues,
    configValue: fileConfig.statusValues,
    argValue: argValues.statusValues,
  });
  const priorityValues = mergeArraySetting({
    defaults: defaults.priorityValues,
    envValue: envValues.priorityValues,
    configValue: fileConfig.priorityValues,
    argValue: argValues.priorityValues,
  });
  return {
    exts,
    requiredFields,
    statusValues,
    priorityValues,
  } as const;
};

const mergeWipLimits = (
  defaults: Readonly<Record<string, number>>,
  configValue?: Readonly<Record<string, number>>,
): Readonly<Record<string, number>> => {
  return Object.freeze({ ...defaults, ...configValue });
};

// export const mergeConfig = (inputs: MergeInputs): KanbanConfig => {
  const paths = buildPaths(inputs);
  const arrays = buildArrays(inputs);
  const wipLimits = mergeWipLimits(inputs.defaults.wipLimits, inputs.fileConfig.wipLimits);
  return Object.freeze({
    repo: inputs.repo,
    tasksDir: paths.tasksDir,
    indexFile: paths.indexFile,
    boardFile: paths.boardFile,
    cachePath: paths.cachePath,
    exts: Object.freeze(new Set(arrays.exts)) as ReadonlySetLike<string>,
    requiredFields: Object.freeze([...arrays.requiredFields]),
    statusValues: Object.freeze(
      new Set(arrays.statusValues),
    ) as ReadonlySetLike<string>,
    priorityValues: Object.freeze(
      new Set(arrays.priorityValues),
    ) as ReadonlySetLike<string>,
    wipLimits,
  });
};
