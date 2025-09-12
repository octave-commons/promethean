type GlobalWithPiper = {
  readonly window?: unknown;
  piperSelection?: readonly string[];
  dispatchEvent?: (ev: Event) => boolean;
};

const getGlobal = (): GlobalWithPiper => {
  const g = globalThis as unknown as GlobalWithPiper & {
    window?: GlobalWithPiper;
  };
  return g.window ?? g;
};

export function setSelection(arr: readonly string[]): void {
  const next = Array.isArray(arr) ? (arr.slice() as readonly string[]) : [];
  const tgt = getGlobal();
  (tgt as { piperSelection?: readonly string[] }).piperSelection = next;
  try {
    tgt.dispatchEvent?.(
      new CustomEvent("piper:selection-changed", { detail: next.slice() }),
    );
  } catch {}
}

export function getSelection(): readonly string[] {
  const tgt = getGlobal();
  const sel = tgt.piperSelection ?? [];
  return sel.slice();
}
