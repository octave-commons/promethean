export function forwardMethods(
  wrapper: { [k: string]: unknown },
  impl: { [k: string]: unknown },
): void {
  const keys = ["render", "getHotState", "setHotState"];
  for (const k of keys) {
    const fn = (impl as Record<string, unknown>)?.[k];
    if (typeof fn === "function") {
      (wrapper as Record<string, unknown>)[k] = function (
        this: unknown,
        ...args: unknown[]
      ) {
        return (fn as (...xs: unknown[]) => unknown).apply(this, args);
      } as unknown;
    }
  }
}

export function forwardAccessors(
  wrapper: Record<string, unknown>,
  impl: Record<string, unknown>,
  Impl: { prototype?: unknown },
): void {
  try {
    const hasData =
      Object.prototype.hasOwnProperty.call(Impl.prototype || {}, "data") ||
      "data" in impl;
    if (hasData) {
      Object.defineProperty(wrapper, "data", {
        configurable: true,
        enumerable: true,
        get: () => {
          if ("data" in impl) {
            return impl["data"];
          }
          return undefined;
        },
        set: (v: unknown) => {
          if ("data" in impl) {
            impl["data"] = v;
          }
        },
      });
    }
  } catch {
    // Best-effort; lack of accessor forwarding should not break element creation.
  }
}
