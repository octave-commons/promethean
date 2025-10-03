import test from "ava";

import {
  designTokens,
  applyDesignTokens,
  registerUiComponents,
} from "../index.js";

test("applyDesignTokens sets CSS variables", (t) => {
  // eslint-disable-next-line functional/no-let
  let styleEntries: ReadonlyArray<readonly [string, string]> = [];
  const root = {
    style: {
      setProperty: (k: string, v: string): void => {
        styleEntries = [...styleEntries, [k, v] as const];
      },
    },
  } as unknown as HTMLElement;
  applyDesignTokens(root);
  const style = Object.fromEntries(styleEntries);
  Object.keys(designTokens).forEach((k) => {
    t.truthy(style[`--${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`]);
  });
});

test("registerUiComponents registers custom elements", (t) => {
  type SimpleRegistry = {
    readonly define: (n: string, c: CustomElementConstructor) => void;
    readonly get: (n: string) => CustomElementConstructor | undefined;
  };
  // eslint-disable-next-line functional/no-let
  let registry: ReadonlyArray<readonly [string, CustomElementConstructor]> = [];
  const customEls: SimpleRegistry = {
    define: (n, c) => {
      registry = [...registry, [n, c] as const];
    },
    get: (n) => registry.find(([name]) => name === n)?.[1],
  };
  // eslint-disable-next-line functional/immutable-data
  (globalThis as unknown as { customElements: SimpleRegistry }).customElements =
    customEls;
  registerUiComponents();
  t.truthy(customEls.get("ui-file-explorer"));
  t.truthy(customEls.get("ui-chat-panel"));
});
