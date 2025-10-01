import { access } from "node:fs/promises";
import path from "node:path";

import {
  ARG_KEYS,
  DEFAULT_CONFIG_BASENAME,
  ENV_KEYS,
  MARKERS,
  arrayHasKey,
  parseList,
  resolveWithBase,
  type EnvArgKey,
  type OverrideMap,
} from "./shared.js";

const pathExists = (target: string): Promise<boolean> =>
  access(target).then(
    () => true,
    () => false,
  );

const detectRepoRoot = (start: string): Promise<string> => {
  const current = path.resolve(start);
  return Promise.all(
    MARKERS.map((marker) => pathExists(path.join(current, marker))),
  ).then((results) => {
    if (results.some(Boolean)) {
      return current;
    }
    const parent = path.dirname(current);
    return parent === current ? current : detectRepoRoot(parent);
  });
};

const envKeys = Object.keys(ENV_KEYS) as ReadonlyArray<EnvArgKey>;

const EMPTY_STRINGS = Object.freeze<string[]>([]);
const EMPTY_OVERRIDES: OverrideMap = Object.freeze({});

const freezeStrings = (
  values: ReadonlyArray<string>,
): ReadonlyArray<string> => {
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

export const parseEnvConfig = (env: Readonly<NodeJS.ProcessEnv>): OverrideMap =>
  envKeys.reduce<OverrideMap>((acc, key) => {
    const raw = env[ENV_KEYS[key]];
    if (typeof raw === "undefined") {
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
  if (typeof next !== "string") {
    return { value: undefined, rest: freezeStrings(tail) };
  }
  if (next.startsWith("--")) {
    return { value: undefined, rest: tokens };
  }
  return { value: next, rest: freezeStrings(tail) };
};

export const parseArgv = (
  argv: ReadonlyArray<string>,
): Readonly<{
  readonly values: OverrideMap;
  readonly rest: ReadonlyArray<string>;
}> => {
  if (argv.length === 0) {
    return { values: Object.freeze({}) as OverrideMap, rest: EMPTY_STRINGS };
  }
  const [token, ...tail] = argv;
  if (typeof token !== "string") {
    return parseArgv(tail);
  }
  if (!token.startsWith("--")) {
    const parsedTail = parseArgv(tail);
    return {
      values: parsedTail.values,
      rest: freezeStrings([token, ...parsedTail.rest]),
    } as const;
  }
  const withoutPrefix = token.slice(2);
  const parts = withoutPrefix.split("=", 2);
  const rawName = parts[0];
  const inline = parts.length > 1 ? parts[1] : undefined;
  if (typeof rawName !== "string" || rawName.length === 0) {
    const parsedTail = parseArgv(tail);
    return {
      values: parsedTail.values,
      rest: freezeStrings([token, ...parsedTail.rest]),
    } as const;
  }
  const name = rawName as string;
  const key = ARG_KEYS.get(name);
  if (!key) {
    const parsedTail = parseArgv(tail);
    return {
      values: parsedTail.values,
      rest: freezeStrings([token, ...parsedTail.rest]),
    } as const;
  }
  if (typeof inline === "string") {
    const parsedTail = parseArgv(tail);
    const normalized = arrayHasKey(key) ? parseList(inline) : inline;
    return {
      values: mergeOverride(parsedTail.values, key, normalized),
      rest: parsedTail.rest,
    } as const;
  }
  const { value, rest } = takeNextValue(tail);
  if (typeof value === "undefined") {
    return parseArgv(rest);
  }
  const parsedRest = parseArgv(rest);
  const normalized = arrayHasKey(key) ? parseList(value) : value;
  return {
    values: mergeOverride(parsedRest.values, key, normalized),
    rest: parsedRest.rest,
  } as const;
};

const searchConfigUp = (
  current: string,
  stop: string,
): Promise<string | undefined> => {
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

export const findConfigPath = (
  repo: string,
  explicitPath: string | undefined,
  cwd: string,
): Promise<string | undefined> => {
  if (typeof explicitPath === "string") {
    const resolved = resolveWithBase(cwd, explicitPath);
    return pathExists(resolved).then((exists) =>
      exists ? resolved : undefined,
    );
  }
  const repoResolved = path.resolve(repo);
  return searchConfigUp(path.resolve(cwd), repoResolved).then((found) => {
    if (typeof found === "string") {
      return found;
    }
    const repoCandidate = path.join(repoResolved, DEFAULT_CONFIG_BASENAME);
    return pathExists(repoCandidate).then((exists) =>
      exists ? repoCandidate : undefined,
    );
  });
};

export const resolveRepo = (
  argValues: OverrideMap,
  envValues: OverrideMap,
  cwd: string,
): Promise<string> => {
  const argRepo = argValues.repo as string | undefined;
  if (typeof argRepo === "string") {
    return Promise.resolve(resolveWithBase(cwd, argRepo));
  }
  const envRepo = envValues.repo as string | undefined;
  if (typeof envRepo === "string") {
    return Promise.resolve(resolveWithBase(cwd, envRepo));
  }
  return detectRepoRoot(cwd);
};
