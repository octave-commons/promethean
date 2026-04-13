import { useEffect, useState } from "react";

import { readStoredJson, writeStoredJson } from "./local-storage";

/**
 * React state that persists into localStorage.
 *
 * - `validate` is applied to both initial read and subsequent writes.
 * - If `validate` returns undefined, we fall back to the default.
 */
export function useStoredState<T>(
  key: string,
  defaultValue: T,
  validate?: (value: unknown) => T | undefined,
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    const raw = readStoredJson<unknown>(key, defaultValue);
    const validated = validate ? validate(raw) : (raw as T);
    return validated === undefined ? defaultValue : validated;
  });

  useEffect(() => {
    const normalized = validate ? validate(state) : state;
    writeStoredJson(key, normalized === undefined ? defaultValue : normalized);
  }, [defaultValue, key, state, validate]);

  const setAndPersist = (value: T) => {
    setState(value);
  };

  return [state, setAndPersist];
}
