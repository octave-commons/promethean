// Simple hot-reload registry for web components that preserves state when possible.
// Components can optionally implement getHotState(): unknown and setHotState(state: unknown): void.

type HotLike = {
  render?: () => void;
  getHotState?: () => unknown;
  setHotState?: (s: unknown) => void;
};
type ImplCtor<T extends HotLike = HotLike> = new () => T;
type HotElement<T extends HotLike = HotLike> = HTMLElement & { __impl?: T };
type HotRegistry<T extends HotLike = HotLike> = {
  components: Map<string, ImplCtor<T>>;
  instances: Map<string, Set<HotElement<T>>>;
  register: (name: string, impl: ImplCtor<T>) => void;
  reloadAll: () => void;
};

function ensureHot<T extends HotLike = HotLike>(): HotRegistry<T> {
  const w = window as unknown as { __PIPER_HOT?: HotRegistry<T> };
  if (!w.__PIPER_HOT) {
    w.__PIPER_HOT = {
      components: new Map(),
      instances: new Map(),
      register: (name: string, impl: ImplCtor<T>) => {
        // Update live instances
        w.__PIPER_HOT!.components.set(name, impl);
        const set = w.__PIPER_HOT!.instances.get(name);
        if (set) for (const inst of set) replaceInstance(inst, impl);
      },
      reloadAll: () => {
        for (const [name, impl] of w.__PIPER_HOT!.components) {
          w.__PIPER_HOT!.register(name, impl);
        }
      },
    };
  }
  return w.__PIPER_HOT;
}

function forwardMethods(
  wrapper: { [k: string]: unknown },
  impl: { [k: string]: unknown },
) {
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

function replaceInstance<T extends HotLike>(
  inst: HotElement<T>,
  Impl: ImplCtor<T>,
): void {
  try {
    const prev = inst.__impl;
    const state = prev?.getHotState ? prev.getHotState() : undefined;
    const next = new Impl();
    inst.__impl = next;
    // Forward known methods to the wrapper so impl can call this.render(), etc.
    forwardMethods(
      inst as unknown as Record<string, unknown>,
      next as unknown as Record<string, unknown>,
    );
    if (state !== undefined && typeof next.setHotState === "function") {
      next.setHotState(state);
    }
    const r = next.render;
    if (typeof r === "function") r.call(inst);
  } catch {
    // swallow hot errors; component can recover on next connect
  }
}

/* eslint-disable-next-line max-lines-per-function */
export function registerHotElement<T extends HotLike = HotLike>(
  name: string,
  Impl: ImplCtor<T>,
): void {
  const hot = ensureHot<T>();
  if (!customElements.get(name)) {
    class HotWrapper extends HTMLElement {
      __impl: InstanceType<typeof Impl> | undefined;
      constructor() {
        super();
        const impl = new Impl();
        this.__impl = impl;
        // Ensure Impl methods (render/state) are callable from wrapper context
        forwardMethods(
          this as unknown as Record<string, unknown>,
          impl as unknown as Record<string, unknown>,
        );

        // Forward common property accessors (not just methods). At minimum, proxy
        // a `data` accessor if the implementation supports it so callers like
        // `el.data = { ... }` configure the underlying component.
        try {
          const hasData =
            Object.prototype.hasOwnProperty.call(
              (Impl as unknown as { prototype?: unknown }).prototype || {},
              "data",
            ) || "data" in (impl as unknown as Record<string, unknown>);
          if (hasData) {
            Object.defineProperty(this, "data", {
              configurable: true,
              enumerable: true,
              get: () => {
                const t: unknown = this.__impl;
                if (
                  t &&
                  typeof t === "object" &&
                  "data" in (t as Record<string, unknown>)
                ) {
                  return (t as Record<string, unknown>)["data"];
                }
                return undefined;
              },
              set: (v: unknown) => {
                const t: unknown = this.__impl;
                if (
                  t &&
                  typeof t === "object" &&
                  "data" in (t as Record<string, unknown>)
                ) {
                  (t as Record<string, unknown>)["data"] = v;
                }
              },
            });
          }
        } catch {
          // Best-effort; lack of accessor forwarding should not break element creation.
        }
      }
      connectedCallback(): void {
        const set = hot.instances.get(name) ?? new Set<HotElement<T>>();
        set.add(this as unknown as HotElement<T>);
        hot.instances.set(name, set);
        (
          this.__impl as unknown as { connectedCallback?: () => void }
        )?.connectedCallback?.call(this);
      }
      disconnectedCallback(): void {
        (
          this.__impl as unknown as { disconnectedCallback?: () => void }
        )?.disconnectedCallback?.call(this);
        const set = hot.instances.get(name);
        if (set) set.delete(this as unknown as HotElement<T>);
      }
      attributeChangedCallback(
        attrName: string,
        oldVal: unknown,
        newVal: unknown,
      ): void {
        (
          this.__impl as unknown as {
            attributeChangedCallback?: (
              a: string,
              o: unknown,
              n: unknown,
            ) => void;
          }
        )?.attributeChangedCallback?.call(this, attrName, oldVal, newVal);
      }
      static get observedAttributes() {
        return (
          (Impl as unknown as { observedAttributes?: string[] })
            .observedAttributes || []
        );
      }
    }
    customElements.define(name, HotWrapper);
  }
  hot.register(name, Impl);
}
