import { getSelection } from "./selection.js";
import { readFileText } from "./api.js";

// marked is optionally provided by the UI via CDN. In sandboxed CI without
// network, it may be unavailable. We detect at runtime and fall back to a
// plain-text render to keep E2E stable.
declare const marked:
  | { parse: (md: string, opts?: unknown) => string }
  | undefined;

export async function renderSelectedMarkdown(): Promise<void> {
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
    const g = globalThis as unknown as {
      marked?: { parse?: (md: string, opts?: unknown) => string };
    };
    const mk = g.marked?.parse ?? marked?.parse;
    if (typeof mk === "function") {
      const html = mk(md, { mangle: false, headerIds: true });
      out.innerHTML = html;
    } else {
      // No markdown engine available (offline). Show raw text so tests pass.
      out.textContent = md;
    }
  } catch (e: unknown) {
    const msg =
      e && typeof e === "object" && "message" in e
        ? String((e as { message?: unknown }).message)
        : String(e);
    out.textContent = msg;
  }
}
