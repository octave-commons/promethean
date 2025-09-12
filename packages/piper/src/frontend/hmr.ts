// Simple hot-reload registry for web components that preserves state when possible.
// Components can optionally implement getHotState(): any and setHotState(state: any): void.

type ImplCtor<T extends HTMLElement> = new () => T & {
  // Optional hooks that components may implement
  getHotState?: () => any;
  setHotState?: (s: any) => void;
};

declare global {
  interface Window {
    __PIPER_HOT?: {
      components: Map<string, ImplCtor<any>>;
      instances: Map<string, Set<HTMLElement & { __impl?: any }>>;
      register: (name: string, impl: ImplCtor<any>) => void;
      reloadAll: () => void;
    };
  }
}

function ensureHot() {
  if (!window.__PIPER_HOT) {
    window.__PIPER_HOT = {
      components: new Map(),
      instances: new Map(),
      register: (name: string, impl: ImplCtor<any>) => {
        // Update live instances
        window.__PIPER_HOT!.components.set(name, impl);
        const set = window.__PIPER_HOT!.instances.get(name);
        if (set) {
          for (const inst of set) {
            try {
              const prev = (inst as any).__impl;
              const state = prev?.getHotState ? prev.getHotState() : undefined;
              const next = new impl();
              (inst as any).__impl = next;
              if (state !== undefined && typeof next.setHotState === "function") {
                next.setHotState(state);
              }
              const r: any = (next).render;
              if (typeof r === "function") r.call(inst);
            } catch {
              // swallow hot errors; component can recover on next connect
            }
          }
        }
      },
      reloadAll: () => {
        for (const [name, impl] of window.__PIPER_HOT!.components) {
          window.__PIPER_HOT!.register(name, impl);
        }
      },
    };
  }
  return window.__PIPER_HOT;
}

export function registerHotElement<T extends HTMLElement>(
  name: string,
  Impl: ImplCtor<T>,
) {
  const hot = ensureHot();
  if (!customElements.get(name)) {
    class HotWrapper extends HTMLElement {
      __impl: InstanceType<typeof Impl> | undefined;
      constructor() {
        super();
        const impl = new Impl();
        this.__impl = impl as any;
      }
      connectedCallback() {
        const set = hot.instances.get(name) ?? new Set();
        set.add(this as any);
        hot.instances.set(name, set);
        (this.__impl as any)?.connectedCallback?.call(this);
      }
      disconnectedCallback() {
        (this.__impl as any)?.disconnectedCallback?.call(this);
        const set = hot.instances.get(name);
        if (set) set.delete(this as any);
      }
      attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
        (this.__impl as any)?.attributeChangedCallback?.call(this, attrName, oldVal, newVal);
      }
      static get observedAttributes() {
        return (Impl as any).observedAttributes || [];
      }
    }
    customElements.define(name, HotWrapper);
  }
  hot.register(name, Impl);
}
