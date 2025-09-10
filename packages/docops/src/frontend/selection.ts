let selection: string[] = [];

export function setSelection(arr: string[]) {
  selection = Array.isArray(arr) ? arr.slice() : [];
  const tgt: any = (globalThis as any).window ?? globalThis;
  tgt.docopsSelection = selection;
  try {
    tgt.dispatchEvent?.(
      new CustomEvent("docops:selection-changed", {
        detail: selection.slice(),
      }),
    );
  } catch {}
}

export function getSelection(): string[] {
  return selection.slice();
}
