// SPDX-License-Identifier: GPL-3.0-only
let selection = [];

export function setSelection(arr) {
  selection = Array.isArray(arr) ? arr.slice() : [];
  // Keep legacy global for any external code still reading it
  window.docopsSelection = selection;
  try {
    window.dispatchEvent(
      new CustomEvent("docops:selection-changed", {
        detail: selection.slice(),
      }),
    );
  } catch {}
}

export function getSelection() {
  return selection.slice();
}
