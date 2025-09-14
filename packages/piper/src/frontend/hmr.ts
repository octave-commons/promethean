// Simple hot-reload registry for web components that preserves state when
// possible. Components can optionally implement getHotState(): unknown and
// setHotState(state: unknown): void.

import { forwardMethods } from "./forward.js";
import { HotWrapper } from "./hot-wrapper.js";

export type HotLike = {
  render?: () => void;
  getHotState?: () => unknown;
  setHotState?: (s: unknown) => void;
};
export type ImplCtor<T extends HotLike = HotLike> = new () => T;
export type HotElement<T extends HotLike = HotLike> = HTMLElement & {
  __impl?: T;
};
export type HotRegistry<T extends HotLike = HotLike> = {
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

export function registerHotElement<T extends HotLike = HotLike>(
  name: string,
  Impl: ImplCtor<T>,
): void {
  const hot = ensureHot<T>();
  if (!customElements.get(name)) {
    class HW extends HotWrapper<T> {}
    (HW as typeof HotWrapper<T>).Impl = Impl;
    (HW as typeof HotWrapper<HotLike>).hot =
      hot as unknown as HotRegistry<HotLike>;
    (HW as typeof HotWrapper<T>).elementName = name;
    customElements.define(name, HW);
  }
  hot.register(name, Impl);
}
