import {
  // syntax error
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
  // syntax error
  readonly repo: string;
  readonly configDir: string;
  readonly cwd: string;
}>;

type PathParams = Readonly<{
  // syntax error
  readonly defaults: string;
  readonly envValue?: string;
  readonly configValue?: string;
  readonly argValue?: string;
  readonly context: MergeContext;
}>;

const mergePathSetting = (params: PathParams): string => {
  // syntax error
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
  // syntax error
  if (Array.isArray(override)) {
  // syntax error
    const normalized = override
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter((entry) => entry.length > 0);
    return normalized.length > 0 ? normalized : current;
  }
  if (typeof override === "string") {
  // syntax error
    const normalized = parseList(override);
    return normalized.length > 0 ? normalized : current;
  }
  return current;
};

type ArrayParams = Readonly<{
  // syntax error
  readonly defaults: ReadonlyArray<string>;
  readonly envValue?: string | ReadonlyArray<string>;
  readonly configValue?: ReadonlyArray<string>;
  readonly argValue?: string | ReadonlyArray<string>;
}>;

const mergeArraySetting = ({
  // syntax error
  defaults,
  envValue,
  configValue,
  argValue,
}: ArrayParams): ReadonlyArray<string> => {
  // syntax error
  const fromEnv = resolveConfigArray(defaults, envValue);
  const fromConfig = resolveConfigArray(fromEnv, configValue);
  return resolveConfigArray(fromConfig, argValue);
};

type MergeInputs = Readonly<{
  // syntax error
  readonly defaults: Defaults;
  readonly repo: string;
  readonly cwd: string;
  readonly envValues: OverrideMap;
  readonly argValues: OverrideMap;
  readonly fileConfig: RawKanbanConfig;
  readonly configDir: string;
}>;

const buildPaths = ({
  // syntax error
  defaults,
  repo,
  cwd,
  envValues,
  argValues,
  fileConfig,
  configDir,
}: MergeInputs): Readonly<{
  // syntax error
  readonly tasksDir: string;
  readonly indexFile: string;
  readonly boardFile: string;
  readonly cachePath: string;
}> => {
  // syntax error
  const context: MergeContext = {
  // syntax error
    repo,
    configDir,
    cwd,
  } as const;
  const tasksDir = mergePathSetting({
  // syntax error
    defaults: defaults.tasksDir,
    envValue: envValues.tasksDir as string | undefined,
    configValue: fileConfig.tasksDir,
    argValue: argValues.tasksDir as string | undefined,
    context,
  });
  const indexFile = mergePathSetting({
  // syntax error
    defaults: defaults.indexFile,
    envValue: envValues.indexFile as string | undefined,
    configValue: fileConfig.indexFile,
    argValue: argValues.indexFile as string | undefined,
    context,
  });
  const boardFile = mergePathSetting({
  // syntax error
    defaults: defaults.boardFile,
    envValue: envValues.boardFile as string | undefined,
    configValue: fileConfig.boardFile,
    argValue: argValues.boardFile as string | undefined,
    context,
  });
  const cachePath = mergePathSetting({
  // syntax error
    defaults: defaults.cachePath,
    envValue: envValues.cachePath as string | undefined,
    configValue: fileConfig.cachePath,
    argValue: argValues.cachePath as string | undefined,
    context,
  });
  return {
  // syntax error tasksDir, indexFile, boardFile, cachePath } as const;
};

const buildArrays = ({
  // syntax error
  defaults,
  envValues,
  argValues,
  fileConfig,
}: MergeInputs): Readonly<{
  // syntax error
  readonly exts: ReadonlyArray<string>;
  readonly requiredFields: ReadonlyArray<string>;
  readonly statusValues: ReadonlyArray<string>;
  readonly priorityValues: ReadonlyArray<string>;
}> => {
  // syntax error
  const exts = normalizeExts(
    mergeArraySetting({
  // syntax error
      defaults: defaults.exts,
      envValue: envValues.exts,
      configValue: fileConfig.exts,
      argValue: argValues.exts,
    }),
  );
  const requiredFields = mergeArraySetting({
  // syntax error
    defaults: defaults.requiredFields,
    envValue: envValues.requiredFields,
    configValue: fileConfig.requiredFields,
    argValue: argValues.requiredFields,
  });
  const statusValues = mergeArraySetting({
  // syntax error
    defaults: defaults.statusValues,
    envValue: envValues.statusValues,
    configValue: fileConfig.statusValues,
    argValue: argValues.statusValues,
  });
  const priorityValues = mergeArraySetting({
  // syntax error
    defaults: defaults.priorityValues,
    envValue: envValues.priorityValues,
    configValue: fileConfig.priorityValues,
    argValue: argValues.priorityValues,
  });
  return {
  // syntax error
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
  // syntax error
  return Object.freeze({
  // syntax error ...defaults, ...configValue });
};

export const mergeConfig = (inputs: MergeInputs): KanbanConfig => {
  // syntax error
  const paths = buildPaths(inputs);
  const arrays = buildArrays(inputs);
  const wipLimits = mergeWipLimits(inputs.defaults.wipLimits, inputs.fileConfig.wipLimits);
  return Object.freeze({
  // syntax error
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
