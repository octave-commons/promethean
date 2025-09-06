let selection: string[] = [];

export function setSelection(arr: string[]) {
  selection = Array.isArray(arr) ? arr.slice() : [];
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.docopsSelection = selection;
  try {
    (globalThis as any).window.dispatchEvent?.(
      new CustomEvent("docops:selection-changed", {
        detail: selection.slice(),
      }),
    );
  } catch {}
}

export function getSelection(): string[] {
  return selection.slice();
}
