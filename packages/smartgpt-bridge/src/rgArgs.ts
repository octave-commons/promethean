const GLOB_CHARS = /[?*{}\[\]]/;

const hasGlob = (value: string): boolean => GLOB_CHARS.test(value);

export type RipgrepArgs = {
  readonly withExclude: ReadonlyArray<string>;
  readonly withoutExclude: ReadonlyArray<string>;
};

export type BuildArgsInput = {
  readonly pattern: string;
  readonly flags: string;
  readonly paths: ReadonlyArray<string>;
  readonly excludeGlobs: ReadonlyArray<string>;
  readonly maxMatches: number;
  readonly context: number;
};

type PathReduction = {
  readonly includeArgs: ReadonlyArray<string>;
  readonly searchPaths: ReadonlyArray<string>;
};

export const freezeStrings = (values: string[]): ReadonlyArray<string> =>
  Object.freeze(values);

function createBaseArgs(config: BuildArgsInput): ReadonlyArray<string> {
  const base = freezeStrings([
    "--json",
    "--max-count",
    String(config.maxMatches),
    "-C",
    String(config.context),
  ]);
  return config.flags.includes("i") ? base.concat("-i") : base;
}

function reducePaths(
  initial: ReadonlyArray<string>,
  paths: ReadonlyArray<string>,
): PathReduction {
  return paths.reduce<PathReduction>(
    (state, entry) =>
      hasGlob(entry)
        ? {
            includeArgs: state.includeArgs.concat(["--glob", entry]),
            searchPaths: state.searchPaths,
          }
        : {
            includeArgs: state.includeArgs,
            searchPaths: state.searchPaths.concat([entry]),
          },
    { includeArgs: initial, searchPaths: [] },
  );
}

function applyExcludes(
  args: ReadonlyArray<string>,
  excludeGlobs: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return excludeGlobs.reduce<ReadonlyArray<string>>(
    (acc, glob) => acc.concat(["--glob", `!${glob}`]),
    args,
  );
}

function appendPattern(
  args: ReadonlyArray<string>,
  pattern: string,
  paths: ReadonlyArray<string>,
): ReadonlyArray<string> {
  const searchTargets = paths.length > 0 ? paths : ["."];
  return args.concat([pattern]).concat(searchTargets);
}

export function expandMaxCount(
  args: ReadonlyArray<string>,
  maxMatches: number,
): ReadonlyArray<string> {
  const index = args.indexOf("--max-count");
  if (index === -1 || index + 1 >= args.length) {
    return args;
  }
  if (maxMatches <= 0) {
    return args;
  }
  const expandedLimit = Math.max(maxMatches * 10, maxMatches + 1000);
  const prefix = args.slice(0, index + 1);
  const suffix = args.slice(index + 2);
  return freezeStrings([...prefix, String(expandedLimit), ...suffix]);
}

export function buildRipgrepArgs(config: BuildArgsInput): RipgrepArgs {
  const baseArgs = createBaseArgs(config);
  const pathReduction = reducePaths(baseArgs, config.paths);
  const withExclude = applyExcludes(
    pathReduction.includeArgs,
    config.excludeGlobs,
  );
  return {
    withExclude: appendPattern(
      withExclude,
      config.pattern,
      pathReduction.searchPaths,
    ),
    withoutExclude: appendPattern(
      pathReduction.includeArgs,
      config.pattern,
      pathReduction.searchPaths,
    ),
  };
}
