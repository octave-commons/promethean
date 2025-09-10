type GlobalWithDocops = {
  readonly window?: unknown;
  docopsSelection?: readonly string[];
  dispatchEvent?: (ev: Event) => boolean;
};

const getGlobal = (): GlobalWithDocops => {
  const g = globalThis as unknown as GlobalWithDocops & {
    window?: GlobalWithDocops;
  };
  return g.window ?? g;
};

export function setSelection(arr: readonly string[]): void {
  const next = Array.isArray(arr) ? (arr.slice() as readonly string[]) : [];
  const tgt = getGlobal();
  // store snapshot for other modules/UI; immutable by convention
  (tgt as { docopsSelection?: readonly string[] }).docopsSelection = next;
  try {
    tgt.dispatchEvent?.(
      new CustomEvent("docops:selection-changed", {
        detail: next.slice(),
      }),
    );
  } catch {}
}

export function getSelection(): readonly string[] {
  const tgt = getGlobal();
  const sel = tgt.docopsSelection ?? [];
  return sel.slice();
}
