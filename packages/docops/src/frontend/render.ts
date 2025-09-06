import { getSelection } from "./selection.js";
import { readFileText } from "./api.js";

declare const marked: { parse: (md: string, opts?: any) => string };

export async function renderSelectedMarkdown() {
  const dirEl = document.getElementById("dir") as HTMLInputElement | null;
  const info = document.getElementById("mdInfo");
  const out = document.getElementById("mdRender");
  if (!dirEl || !info || !out) return;
  const dir = dirEl.value;
  const files = getSelection();
  out.innerHTML = "";
  if (!files.length) {
    info.textContent = "No file selected. Select a file in the File Explorer.";
    return;
  }
  const file = files[0]!;
  info.textContent = "Rendering: " + file;
  try {
    const md = await readFileText(dir, file);
    const html = marked.parse(md, { mangle: false, headerIds: true });
    out.innerHTML = html;
  } catch (e: any) {
    out.textContent = String(e?.message || e);
  }
}
