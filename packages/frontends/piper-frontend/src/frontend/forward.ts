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

function defineDataAccessor(
  wrapper: Record<string, unknown>,
  impl: Record<string, unknown>,
  desc: Pick<PropertyDescriptor, "get" | "set">,
): void {
  const getter =
    typeof desc.get === "function"
      ? () => desc.get!.call(wrapper)
      : () => ("data" in impl ? (impl as { data?: unknown }).data : undefined);
  const setter =
    typeof desc.set === "function"
      ? (value: unknown) => {
          desc.set!.call(wrapper, value);
        }
      : (value: unknown) => {
          if ("data" in impl) {
            (impl as { data?: unknown }).data = value;
          }
        };
  Object.defineProperty(wrapper, "data", {
    configurable: true,
    enumerable: true,
    get: getter,
    set: setter,
  });
}

function defineFallbackDataAccessor(
  wrapper: Record<string, unknown>,
  impl: Record<string, unknown>,
): void {
  Object.defineProperty(wrapper, "data", {
    configurable: true,
    enumerable: true,
    get: () => (impl as { data?: unknown }).data,
    set: (value: unknown) => {
      (impl as { data?: unknown }).data = value;
    },
  });
}

export function forwardAccessors(
  wrapper: Record<string, unknown>,
  impl: Record<string, unknown>,
  Impl: { prototype?: unknown },
): void {
  try {
    const proto = (Impl.prototype || {}) as Record<string, unknown>;
    const desc = Object.getOwnPropertyDescriptor(proto, "data");
    if (desc?.get || desc?.set) {
      defineDataAccessor(wrapper, impl, desc);
      return;
    }

    if ("data" in impl) {
      defineFallbackDataAccessor(wrapper, impl);
    }
  } catch {
    // Best-effort; lack of accessor forwarding should not break element creation.
  }
}
