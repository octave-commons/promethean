import test from "ava";

import {
  designTokens,
  applyDesignTokens,
  registerUiComponents,
} from "../index.js";

test("applyDesignTokens sets CSS variables", (t) => {
  const style: Record<string, string> = {};
  const root = {
    style: {
      setProperty: (k: string, v: string): void => {
        // eslint-disable-next-line functional/immutable-data
        style[k] = v;
      },
    },
  } as unknown as HTMLElement;
  applyDesignTokens(root);
  Object.keys(designTokens).forEach((k) => {
    t.truthy(style[`--${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`]);
  });
});

test("registerUiComponents registers custom elements", (t) => {
  const registry: Record<string, unknown> = {};
  type SimpleRegistry = {
    readonly define: (n: string, c: CustomElementConstructor) => void;
    readonly get: (n: string) => CustomElementConstructor | undefined;
  }
  const customEls: SimpleRegistry = {
    define: (n, c) => {
      // eslint-disable-next-line functional/immutable-data
      registry[n] = c;
    },
    get: (n) => registry[n] as CustomElementConstructor | undefined,
  };
  (globalThis as unknown as { customElements: SimpleRegistry }).customElements =
    customEls;
  registerUiComponents();
  t.truthy(registry["ui-file-explorer"]);
  t.truthy(registry["ui-chat-panel"]);
});
