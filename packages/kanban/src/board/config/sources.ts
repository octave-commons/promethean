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

const pathExists = (target: string): Promise<boolean> =>
  access(target).then(
    () => true,
    () => false,
  );

type PreferredMarker = Readonly<{
  readonly dir: string;
  readonly marker: '.git' | 'pnpm-workspace.yaml';
}>;

const findMarkers = async (dir: string): Promise<ReadonlyArray<string>> => {
  const matches = await Promise.all(MARKERS.map((marker) => pathExists(path.join(dir, marker))));
  return MARKERS.filter((_, index) => matches[index]);
};

const selectPreferred = (
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

const selectFallback = (
  current: string,
  found: ReadonlyArray<string>,
  fallback: string | undefined,
): string | undefined =>
  typeof fallback === 'undefined' && found.includes('package.json') ? current : fallback;

const detectRepoRoot = (
  start: string,
  preferred?: PreferredMarker,
  fallback?: string,
): Promise<string> => {
  const current = path.resolve(start);
  return findMarkers(current).then((found) => {
    const nextPreferred = selectPreferred(current, found, preferred);
    const nextFallback = selectFallback(current, found, fallback);
    const parent = path.dirname(current);
    return parent === current
      ? (nextPreferred?.dir ?? nextFallback ?? current)
      : detectRepoRoot(parent, nextPreferred, nextFallback);
  });
};

const envKeys = Object.keys(ENV_KEYS) as ReadonlyArray<EnvArgKey>;

const EMPTY_STRINGS = Object.freeze<string[]>([]);
const EMPTY_OVERRIDES: OverrideMap = Object.freeze({});

const freezeStrings = (values: ReadonlyArray<string>): ReadonlyArray<string> => {
  if (values.length === 0) {
    return EMPTY_STRINGS;
  }
  const copy: ReadonlyArray<string> = Object.freeze([...values]);
  return copy;
};

const mergeOverride = (
  current: OverrideMap,
  key: EnvArgKey,
  value: string | ReadonlyArray<string>,
): OverrideMap => {
  const next: OverrideMap = Object.freeze({ ...current, [key]: value });
  return next;
};

type ParseResult = Readonly<{
  readonly values: OverrideMap;
  readonly rest: ReadonlyArray<string>;
}>;

const appendRest = (token: string, parsed: ParseResult): ParseResult => ({
  values: parsed.values,
  rest: freezeStrings([token, ...parsed.rest]),
});

const mergeArgValue = (
  key: EnvArgKey,
  value: string | ReadonlyArray<string>,
  parsed: ParseResult,
): ParseResult => ({
  values: mergeOverride(parsed.values, key, value),
  rest: parsed.rest,
});

const parseInlineValue = (
  key: EnvArgKey,
  inline: string,
  tail: ReadonlyArray<string>,
): ParseResult => {
  const parsedTail = parseArgv(tail);
  const normalized = arrayHasKey(key) ? parseList(inline) : inline;
  return mergeArgValue(key, normalized, parsedTail);
};

const parseValueFromTail = (key: EnvArgKey, tail: ReadonlyArray<string>): ParseResult => {
  const { value, rest } = takeNextValue(tail);
  if (typeof value === 'undefined') {
    return parseArgv(rest);
  }
  const parsedRest = parseArgv(rest);
  const normalized = arrayHasKey(key) ? parseList(value) : value;
  return mergeArgValue(key, normalized, parsedRest);
};

export const parseEnvConfig = (env: Readonly<NodeJS.ProcessEnv>): OverrideMap =>
  envKeys.reduce<OverrideMap>((acc, key) => {
    const raw = env[ENV_KEYS[key]];
    if (typeof raw === 'undefined') {
      return acc;
    }
    const nextValue = arrayHasKey(key) ? parseList(raw) : raw;
    return mergeOverride(acc, key, nextValue);
  }, EMPTY_OVERRIDES);

const takeNextValue = (
  tokens: ReadonlyArray<string>,
): Readonly<{
  readonly value: string | undefined;
  readonly rest: ReadonlyArray<string>;
}> => {
  if (tokens.length === 0) {
    return { value: undefined, rest: EMPTY_STRINGS };
  }
  const [next, ...tail] = tokens;
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
  const [token, ...tail] = argv;
  if (typeof token !== 'string') {
    return parseArgv(tail);
  }
  if (!token.startsWith('--')) {
    return appendRest(token, parseArgv(tail));
  }
  const withoutPrefix = token.slice(2);
  const parts = withoutPrefix.split('=', 2);
  const rawName = parts[0];
  const inline = parts.length > 1 ? parts[1] : undefined;
  if (typeof rawName !== 'string' || rawName.length === 0) {
    return appendRest(token, parseArgv(tail));
  }
  const name = rawName;
  const key = ARG_KEYS.get(name);
  if (!key) {
    return appendRest(token, parseArgv(tail));
  }
  if (typeof inline === 'string') {
    return parseInlineValue(key, inline, tail);
  }
  return parseValueFromTail(key, tail);
}

const searchConfigUp = (current: string, stop: string): Promise<string | undefined> => {
  const candidate = path.join(current, DEFAULT_CONFIG_BASENAME);
  return pathExists(candidate).then((exists) => {
    if (exists) {
      return candidate;
    }
    if (current === stop) {
      return undefined;
    }
    const parent = path.dirname(current);
    return parent === current ? undefined : searchConfigUp(parent, stop);
  });
};

const searchConfigPaths = async (repoRoot: string): Promise<string | undefined> => {
  for (const configPath of CONFIG_SEARCH_PATHS) {
    const candidate = path.join(repoRoot, configPath);
    if (await pathExists(candidate)) {
      return candidate;
    }
  }
  return undefined;
};

export const findConfigPath = (
  repo: string,
  explicitPath: string | undefined,
  cwd: string,
): Promise<string | undefined> => {
  if (typeof explicitPath === 'string') {
    const resolved = resolveWithBase(cwd, explicitPath);
    return pathExists(resolved).then((exists) => (exists ? resolved : undefined));
  }
  const repoResolved = path.resolve(repo);

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
      const repoCandidate = path.join(repoResolved, DEFAULT_CONFIG_BASENAME);
      return pathExists(repoCandidate).then((exists) => (exists ? repoCandidate : undefined));
    });
  });
};

export const resolveRepo = (
  argValues: OverrideMap,
  envValues: OverrideMap,
  cwd: string,
): Promise<string> => {
  const argRepo = argValues.repo as string | undefined;
  if (typeof argRepo === 'string') {
    return Promise.resolve(resolveWithBase(cwd, argRepo));
  }
  const envRepo = envValues.repo as string | undefined;
  if (typeof envRepo === 'string') {
    return Promise.resolve(resolveWithBase(cwd, envRepo));
  }
  return detectRepoRoot(cwd);
};
