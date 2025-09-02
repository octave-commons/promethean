import { getSelection } from "./selection.js";
import { readFileText } from "./api.js";

export async function renderSelectedMarkdown() {
  const dir = document.getElementById("dir").value;
  const files = getSelection();
  const info = document.getElementById("mdInfo");
  const out = document.getElementById("mdRender");
  out.innerHTML = "";
  if (!files.length) {
    info.textContent = "No file selected. Select a file in the File Explorer.";
    return;
  }
  const file = files[0];
  info.textContent = "Rendering: " + file;
  try {
    const md = await readFileText(dir, file);
    const html = marked.parse(md, { mangle: false, headerIds: true });
    out.innerHTML = html;
  } catch (e) {
    out.textContent = String(e);
  }
}
