import { forwardMethods, forwardAccessors } from "./forward.js";
import type { HotLike, ImplCtor, HotElement, HotRegistry } from "./hmr.js";

export class HotWrapper<T extends HotLike = HotLike> extends HTMLElement {
  static hot: HotRegistry<HotLike>;
  static elementName: string;
  static Impl: ImplCtor<HotLike>;

  __impl: InstanceType<ImplCtor<T>> | undefined;

  constructor() {
    super();
    const ctor = this.constructor as typeof HotWrapper<T>;
    const Impl = ctor.Impl as ImplCtor<T>;
    const impl = new Impl();
    this.__impl = impl;
    forwardMethods(
      this as unknown as Record<string, unknown>,
      impl as unknown as Record<string, unknown>,
    );
    forwardAccessors(
      this as unknown as Record<string, unknown>,
      impl as unknown as Record<string, unknown>,
      Impl as unknown as { prototype?: unknown },
    );
  }

  connectedCallback(): void {
    const ctor = this.constructor as typeof HotWrapper<T>;
    const set =
      ctor.hot.instances.get(ctor.elementName) ?? new Set<HotElement<T>>();
    set.add(this as unknown as HotElement<T>);
    ctor.hot.instances.set(ctor.elementName, set);
    (
      this.__impl as unknown as { connectedCallback?: () => void }
    )?.connectedCallback?.call(this);
  }

  disconnectedCallback(): void {
    const ctor = this.constructor as typeof HotWrapper<T>;
    (
      this.__impl as unknown as { disconnectedCallback?: () => void }
    )?.disconnectedCallback?.call(this);
    const set = ctor.hot.instances.get(ctor.elementName);
    if (set) set.delete(this as unknown as HotElement<T>);
  }

  attributeChangedCallback(
    attrName: string,
    oldVal: unknown,
    newVal: unknown,
  ): void {
    (
      this.__impl as unknown as {
        attributeChangedCallback?: (a: string, o: unknown, n: unknown) => void;
      }
    )?.attributeChangedCallback?.call(this, attrName, oldVal, newVal);
  }

  static get observedAttributes(): string[] {
    return (
      (
        (this as unknown as typeof HotWrapper<HotLike>).Impl as unknown as {
          observedAttributes?: string[];
        }
      ).observedAttributes || []
    );
  }
}
