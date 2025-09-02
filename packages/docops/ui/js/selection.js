let selection = [];

export function setSelection(arr) {
  selection = Array.isArray(arr) ? arr.slice() : [];
  // Keep legacy global for any external code still reading it
  window.docopsSelection = selection;
}

export function getSelection() {
  return selection.slice();
}
