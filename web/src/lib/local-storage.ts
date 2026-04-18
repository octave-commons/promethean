type JsonPrimitive = string | number | boolean | null;

function safeReadLocalStorage(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWriteLocalStorage(key: string, value: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeRemoveLocalStorage(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function readStoredJson<T>(key: string, fallback: T): T {
  const raw = safeReadLocalStorage(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStoredJson(key: string, value: unknown): void {
  try {
    safeWriteLocalStorage(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function writeStoredPrimitive(key: string, value: JsonPrimitive): void {
  if (value === null) {
    safeRemoveLocalStorage(key);
    return;
  }
  safeWriteLocalStorage(key, String(value));
}

export function readStoredString(key: string, fallback: string): string {
  const raw = safeReadLocalStorage(key);
  return typeof raw === "string" ? raw : fallback;
}

export function readStoredBoolean(key: string, fallback: boolean): boolean {
  const raw = safeReadLocalStorage(key);
  if (raw === null) {
    return fallback;
  }
  if (raw === "1" || raw === "true" || raw === "yes" || raw === "on") {
    return true;
  }
  if (raw === "0" || raw === "false" || raw === "no" || raw === "off") {
    return false;
  }
  return fallback;
}
