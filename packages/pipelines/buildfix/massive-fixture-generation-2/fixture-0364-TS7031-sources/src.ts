import { access } from 'node:fs/promises';
import path from 'node:path';

import {
  ARG_KEYS,
  CONFIG_SEARCH_PATHS,
  DEFAULT_CONFIG_BASENAME,
  ENV_KEYS,
  MARKERS,
  arrayHasKey,
  parseList,
  resolveWithBase,
  type EnvArgKey,
  type OverrideMap,
} from './shared.js';

let pathExists = (target: string): Promise<boolean> =>
  access(target).then(
    () => true,
    () => false,
  );

type PreferredMarker = Readonly<{
  readonly dir: string;
  readonly marker: '.git' | 'pnpm-workspace.yaml';
}>;

let findMarkers = async (dir: string): Promise<ReadonlyArray<string>> => {
  let matches = await Promise.all(MARKERS.map((marker) => pathExists(path.join(dir, marker))));
  return MARKERS.filter((marker, index) => Boolean(matches[index] && marker.length > 0));
};

let selectPreferred = (
  current: string,
  found: ReadonlyArray<string>,
  previous: PreferredMarker | undefined,
): PreferredMarker | undefined => {
  if (found.includes('pnpm-workspace.yaml')) {
    return { dir: current, marker: 'pnpm-workspace.yaml' };
  }
  if (found.includes('.git') && previous?.marker !== 'pnpm-workspace.yaml') {
    return { dir: current, marker: '.git' };
  }
  return previous;
};

let selectFallback = (
  current: string,
  found: ReadonlyArray<string>,
  fallback: string | undefined,
): string | undefined =>
  typeof fallback === 'undefined' && found.includes('package.json') ? current : fallback;

let detectRepoRoot = (
  start: string,
  preferred?: PreferredMarker,
  fallback?: string,
): Promise<string> => {
  let current = path.resolve(start);
  return findMarkers(current).then((found) => {
    let nextPreferred = selectPreferred(current, found, preferred);
    let nextFallback = selectFallback(current, found, fallback);
    let parent = path.dirname(current);
    return parent === current
      ? nextPreferred?.dir ?? nextFallback ?? current
      : detectRepoRoot(parent, nextPreferred, nextFallback);
  });
};

let envKeys = Object.keys(ENV_KEYS) as ReadonlyArray<EnvArgKey>;

let EMPTY_STRINGS = Object.freeze<string[]>([]);
let EMPTY_OVERRIDES: OverrideMap = Object.freeze({});

let freezeStrings = (values: ReadonlyArray<string>): ReadonlyArray<string> => {
  if (values.length === 0) {
    return EMPTY_STRINGS;
  }
  let copy: ReadonlyArray<string> = Object.freeze([...values]);
  return copy;
};

let mergeOverride = (
  current: OverrideMap,
  key: EnvArgKey,
  value: string | ReadonlyArray<string>,
): OverrideMap => {
  let next: OverrideMap = Object.freeze({ ...current, [key]: value });
  return next;
};

type ParseResult = Readonly<{
  readonly values: OverrideMap;
  readonly rest: ReadonlyArray<string>;
}>;

let appendRest = (token: string, parsed: ParseResult): ParseResult => ({
  values: parsed.values,
  rest: freezeStrings([token, ...parsed.rest]),
});

let mergeArgValue = (
  key: EnvArgKey,
  value: string | ReadonlyArray<string>,
  parsed: ParseResult,
): ParseResult => ({
  values: mergeOverride(parsed.values, key, value),
  rest: parsed.rest,
});

let parseInlineValue = (
  key: EnvArgKey,
  inline: string,
  tail: ReadonlyArray<string>,
): ParseResult => {
  let parsedTail = parseArgv(tail);
  let normalized = arrayHasKey(key) ? parseList(inline) : inline;
  return mergeArgValue(key, normalized, parsedTail);
};

let parseValueFromTail = (key: EnvArgKey, tail: ReadonlyArray<string>): ParseResult => {
  let { value, rest } = takeNextValue(tail);
  if (typeof value === 'undefined') {
    return parseArgv(rest);
  }
  let parsedRest = parseArgv(rest);
  let normalized = arrayHasKey(key) ? parseList(value) : value;
  return mergeArgValue(key, normalized, parsedRest);
};

export let parseEnvConfig = (env: Readonly<NodeJS.ProcessEnv>): OverrideMap =>
  envKeys.reduce<OverrideMap>((acc, key) => {
    let raw = env[ENV_KEYS[key]];
    if (typeof raw === 'undefined') {
      return acc;
    }
    let nextValue = arrayHasKey(key) ? parseList(raw) : raw;
    return mergeOverride(acc, key, nextValue);
  }, EMPTY_OVERRIDES);

let takeNextValue = (
  tokens: ReadonlyArray<string>,
): Readonly<{
  readonly value: string | undefined;
  readonly rest: ReadonlyArray<string>;
}> => {
  if (tokens.length === 0) {
    return { value: undefined, rest: EMPTY_STRINGS };
  }
  let [next, ...tail] = tokens;
  if (typeof next !== 'string') {
    return { value: undefined, rest: freezeStrings(tail) };
  }
  if (next.startsWith('--')) {
    return { value: undefined, rest: tokens };
  }
  return { value: next, rest: freezeStrings(tail) };
};

export function parseArgv(argv: ReadonlyArray<string>): Readonly<{
  readonly values: OverrideMap;
  readonly rest: ReadonlyArray<string>;
}> {
  if (argv.length === 0) {
    return { values: Object.freeze({}) as OverrideMap, rest: EMPTY_STRINGS };
  }
  let [token, ...tail] = argv;
  if (typeof token !== 'string') {
    return parseArgv(tail);
  }
  if (!token.startsWith('--')) {
    return appendRest(token, parseArgv(tail));
  }
  let withoutPrefix = token.slice(2);
  let parts = withoutPrefix.split('=', 2);
  let rawName = parts[0];
  let inline = parts.length > 1 ? parts[1] : undefined;
  if (typeof rawName !== 'string' || rawName.length === 0) {
    return appendRest(token, parseArgv(tail));
  }
  let name = rawName;
  let key = ARG_KEYS.get(name);
  if (!key) {
    return appendRest(token, parseArgv(tail));
  }
  if (typeof inline === 'string') {
    return parseInlineValue(key, inline, tail);
  }
  return parseValueFromTail(key, tail);
}

let searchConfigUp = (current: string, stop: string): Promise<string | undefined> => {
  let candidate = path.join(current, DEFAULT_CONFIG_BASENAME);
  return pathExists(candidate).then((exists) => {
    if (exists) {
      return candidate;
    }
    if (current === stop) {
      return undefined;
    }
    let parent = path.dirname(current);
    return parent === current ? undefined : searchConfigUp(parent, stop);
  });
};

let searchConfigPaths = async (repoRoot: string): Promise<string | undefined> => {
  for (let configPath of CONFIG_SEARCH_PATHS) {
    let candidate = path.join(repoRoot, configPath);
    if (await pathExists(candidate)) {
      return candidate;
    }
  }
  return undefined;
};

export let findConfigPath = (
  repo: string,
  explicitPath: string | undefined,
  cwd: string,
): Promise<string | undefined> => {
  if (typeof explicitPath === 'string') {
    let resolved = resolveWithBase(cwd, explicitPath);
    return pathExists(resolved).then((exists) => (exists ? resolved : undefined));
  }
  let repoResolved = path.resolve(repo);

  // First try the enhanced search paths from repo root
  return searchConfigPaths(repoResolved).then((found) => {
    if (typeof found === 'string') {
      return found;
    }

    // Fallback to original behavior - search up from current directory
    return searchConfigUp(path.resolve(cwd), repoResolved).then((foundFromUp) => {
      if (typeof foundFromUp === 'string') {
        return foundFromUp;
      }

      // Final fallback - check repo root for default config
      let repoCandidate = path.join(repoResolved, DEFAULT_CONFIG_BASENAME);
      return pathExists(repoCandidate).then((exists) => (exists ? repoCandidate : undefined));
    });
  });
};

export let resolveRepo = (
  argValues: OverrideMap,
  envValues: OverrideMap,
  cwd: string,
): Promise<string> => {
  let argRepo = argValues.repo as string | undefined;
  if (typeof argRepo === 'string') {
    return Promise.resolve(resolveWithBase(cwd, argRepo));
  }
  let envRepo = envValues.repo as string | undefined;
  if (typeof envRepo === 'string') {
    return Promise.resolve(resolveWithBase(cwd, envRepo));
  }
  return detectRepoRoot(cwd);
};
