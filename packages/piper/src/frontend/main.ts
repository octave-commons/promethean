/* eslint-disable max-lines */
import { setSelection, getSelection } from "./selection.js";
import "./components/piper-step.js";

export type PipelineStep = Record<string, unknown>;
export type Pipeline = { name: string; steps: PipelineStep[] };

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    __PIPER_HOT?: { reloadAll?: () => void };
  }
}

// Dev HMR client: connects to backend events and hot-reloads modules without full refresh
function startHMR() {
  try {
    const es = new EventSource("/api/dev-events");
    es.onmessage = async (ev) => {
      const msg = String(ev.data || "");
      if (msg.startsWith("frontend:update")) {
        try {
          await import(`/js/main.js?ts=${Date.now()}`);
          window.__PIPER_HOT?.reloadAll?.();
        } catch (e) {
          console.warn("hot reload failed", e);
        }
      }
    };
    es.onerror = () => {
      // keep silent; dev endpoint may be disabled
      es.close();
    };
  } catch {
    // ignore if EventSource not available
  }
}
startHMR();

function runPipeline(name: string): void {
  const params = new URLSearchParams({ pipeline: name });
  const files = getSelection();
  if (files.length) params.set("files", files.join(","));
  const logEl = document.getElementById("logs") as HTMLPreElement | null;
  if (logEl) logEl.textContent = "";
  const es = new EventSource(`/api/run?${params.toString()}`);
  es.onmessage = (ev: MessageEvent) => {
    if (!logEl) return;
    logEl.textContent += (ev.data || "") + "\n";
    (
      logEl as unknown as { scrollTop: number; scrollHeight: number }
    ).scrollTop = (logEl as unknown as { scrollHeight: number }).scrollHeight;
  };
  es.onerror = () => es.close();
}

type FileNode = {
  type: string;
  name: string;
  children?: FileNode[];
};

// Minimal FileTree custom element (uses /api/files like DocOps)
class FileTree extends HTMLElement {
  private cache: Map<string, FileNode[]> = new Map();
  async connectedCallback() {
    this.attachShadow({ mode: "open" });
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/ui/file-tree.css";
    this.shadowRoot?.appendChild(link);

    const res = await fetch("/ui/templates/file-tree.html");
    const tpl = document.createElement("template");
    tpl.innerHTML = await res.text();
    this.shadowRoot?.appendChild(tpl.content.cloneNode(true));

    await this.refresh();
  }
  /* eslint-disable-next-line max-lines-per-function */
  async refresh() {
    const rootDiv = this.shadowRoot?.getElementById("root");
    if (!rootDiv) return;
    rootDiv.innerHTML = "<em>Loading…</em>";
    const res = await fetch(
      `/api/files?dir=${encodeURIComponent(
        ".",
      )}&maxDepth=1&maxEntries=600&exts=.md,.mdx,.txt,.markdown`,
    );
    const data = (await res.json()) as { dir: string; tree?: FileNode[] };
    const baseDir: string = data.dir;
    const ul = document.createElement("ul");
    this.cache.set(baseDir, data.tree || []);

    /* eslint-disable-next-line max-lines-per-function */
    const renderFiles = (
      parent: HTMLElement,
      nodes: FileNode[],
      parentDir: string,
    ) => {
      for (const n of nodes) {
        const li = document.createElement("li");
        if (n.type === "dir") {
          const dirPath = `${parentDir}/${n.name}`.replace(/\\/g, "/");
          li.dataset.fullPath = dirPath;
          const line = document.createElement("div");
          line.className = "dir-line";
          const caret = document.createElement("span");
          caret.textContent = "▶";
          caret.className = "caret";
          const icon = document.createElement("span");
          icon.textContent = "📁";
          const name = document.createElement("span");
          name.textContent = n.name;
          name.className = "dir-name";
          line.appendChild(caret);
          line.appendChild(icon);
          line.appendChild(name);
          li.appendChild(line);
          const sub = document.createElement("ul");
          sub.style.display = "none";
          li.appendChild(sub);
          parent.appendChild(li);

          const isOpen = (): boolean => sub.style.display !== "none";
          const hasLoaded = (): boolean => sub.dataset.loaded === "1";
          const markLoaded = (): void => {
            sub.dataset.loaded = "1";
          };
          const toggle = async (): Promise<void> => {
            const next = !isOpen();
            caret.textContent = next ? "▼" : "▶";
            sub.style.display = next ? "block" : "none";
            if (next && !hasLoaded()) {
              const cached = this.cache.get(dirPath);
              if (cached) {
                sub.innerHTML = "";
                renderFiles(sub, cached, dirPath);
                markLoaded();
              } else {
                // lazy load this directory
                sub.innerHTML = '<li class="loading">Loading…</li>';
                const resp = await fetch(
                  `/api/files?dir=${encodeURIComponent(
                    dirPath,
                  )}&maxDepth=1&maxEntries=600&exts=.md,.mdx,.txt,.markdown`,
                );
                const dj = (await resp.json()) as {
                  dir?: string;
                  tree?: FileNode[];
                };
                sub.innerHTML = "";
                const tree = dj.tree || [];
                this.cache.set(dj.dir || dirPath, tree);
                renderFiles(sub, tree, dj.dir || dirPath);
                markLoaded();
              }
            }
          };
          line.addEventListener("click", () => void toggle());
        } else {
          const full = `${parentDir}/${n.name}`.replace(/\\/g, "/");
          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.value = full;
          cb.addEventListener("change", () => this.updateSelection());
          li.appendChild(cb);
          const span = document.createElement("span");
          span.className = "file";
          span.textContent = ` ${n.name}`;
          span.addEventListener("click", () => {
            this.shadowRoot
              ?.querySelectorAll<HTMLInputElement>("input[type=checkbox]")
              .forEach((el) => {
                el.checked = el.value === full;
              });
            this.updateSelection();
            window.dispatchEvent(
              new CustomEvent("piper:open-file", { detail: { path: full } }),
            );
          });
          li.appendChild(span);
          parent.appendChild(li);
        }
      }
    };
    ul.innerHTML = "";
    renderFiles(ul, data.tree || [], baseDir);
    rootDiv.innerHTML = "";
    rootDiv.appendChild(ul);
    // toolbar
    (this.shadowRoot?.getElementById("selAll") as HTMLButtonElement).onclick =
      () => {
        this.shadowRoot
          ?.querySelectorAll<HTMLInputElement>("input[type=checkbox]")
          .forEach((cb) => {
            cb.checked = true;
          });
        this.updateSelection();
      };
    (this.shadowRoot?.getElementById("selNone") as HTMLButtonElement).onclick =
      () => {
        this.shadowRoot
          ?.querySelectorAll<HTMLInputElement>("input[type=checkbox]")
          .forEach((cb) => {
            cb.checked = false;
          });
        this.updateSelection();
      };
  }
  updateSelection() {
    const xs: string[] = [];
    this.shadowRoot
      ?.querySelectorAll<HTMLInputElement>("input[type=checkbox]")
      .forEach((cb) => {
        if (cb.checked) xs.push(cb.value);
      });
    setSelection(xs);
    window.dispatchEvent(
      new CustomEvent("piper:files-changed", { detail: xs }),
    );
  }
}
customElements.define("file-tree", FileTree);

// eslint-disable-next-line max-lines-per-function
async function init(): Promise<void> {
  const container = document.getElementById("pipelines");
  const logs = document.getElementById("logs");
  const tabs = document.getElementById("editorTabs");
  const editor = document.getElementById(
    "editor",
  ) as HTMLTextAreaElement | null;
  const status = document.getElementById("editorStatus");
  if (!container || !tabs || !editor || !status) return;
  const data = await (async (): Promise<{
    pipelines?: Pipeline[];
    error?: string;
  } | null> => {
    try {
      const res = await fetch("/api/pipelines");
      return (await res.json()) as { pipelines?: Pipeline[]; error?: string };
    } catch (e) {
      if (logs) logs.textContent = `Failed to load pipelines: ${e}`;
      return null;
    }
  })();
  if (!data) return;
  if (data?.error && logs) logs.textContent = `Schema error: ${data.error}`;
  (data.pipelines ?? []).forEach((p) => {
    const section = document.createElement("section");
    const hdr = document.createElement("div");
    hdr.style.display = "flex";
    hdr.style.alignItems = "center";
    hdr.style.gap = "8px";
    const btn = document.createElement("button");
    btn.textContent = "▼";
    btn.title = "Collapse/Expand";
    btn.style.border = "none";
    btn.style.background = "transparent";
    btn.style.cursor = "pointer";
    const h = document.createElement("h2");
    h.textContent = p.name;
    h.style.margin = "0";
    hdr.appendChild(btn);
    hdr.appendChild(h);
    const runBtn = document.createElement("button");
    runBtn.textContent = "Run Pipeline";
    runBtn.onclick = () => runPipeline(p.name);
    hdr.appendChild(runBtn);
    section.appendChild(hdr);
    const list = document.createElement("div");
    const key = `piper:collapse:${p.name}`;
    const setCollapsed = (c: boolean) => {
      btn.textContent = c ? "▶" : "▼";
      list.style.display = c ? "none" : "block";
      try {
        localStorage.setItem(key, c ? "1" : "0");
      } catch {}
    };
    btn.onclick = () => setCollapsed(list.style.display !== "none");
    const saved =
      (typeof localStorage !== "undefined"
        ? localStorage.getItem(key)
        : null) === "1";
    setCollapsed(saved);
    for (const s of p.steps) {
      type PiperStepEl = HTMLElement & { data?: unknown };
      const el = document.createElement("piper-step") as PiperStepEl;
      el.data = { pipeline: p.name, step: s } as unknown;
      list.appendChild(el);
    }
    section.appendChild(list);
    container.appendChild(section);
  });

  // Basic tabbed editor behavior
  type Tab = { path: string; content: string; saved: string; active: boolean };
  const openTabs: Tab[] = [];
  const setActive = (p: string) => {
    openTabs.forEach((t) => {
      t.active = t.path === p;
    });
    const t = openTabs.find((t) => t.active);
    if (t) {
      editor.value = t.content;
      status.textContent =
        t.path + (t.content !== t.saved ? " (modified)" : "");
    } else {
      editor.value = "";
      status.textContent = "";
    }
    renderTabs();
  };
  const renderTabs = () => {
    tabs.innerHTML = "";
    for (const t of openTabs) {
      const el = document.createElement("button");
      el.textContent =
        (t.active ? "● " : "○ ") + (t.path.split("/").slice(-1)[0] || t.path);
      el.className = "tab-button";
      el.onclick = () => setActive(t.path);
      const x = document.createElement("span");
      x.textContent = " ×";
      x.className = "tab-close";
      x.onclick = (ev) => {
        ev.stopPropagation();
        const idx = openTabs.findIndex((tt) => tt.path === t.path);
        if (idx >= 0) openTabs.splice(idx, 1);
        const next = openTabs[idx] || openTabs[idx - 1] || openTabs[0];
        if (next) setActive(next.path);
        else setActive("");
      };
      el.appendChild(x);
      tabs.appendChild(el);
    }
  };
  async function openFile(path: string) {
    // check existing
    const exists = openTabs.find((t) => t.path === path);
    if (exists) return setActive(path);
    const r = await fetch(`/api/read-file?path=${encodeURIComponent(path)}`);
    if (!r.ok) return;
    const j = (await r.json()) as { path?: string; content?: string };
    openTabs.push({
      path: j.path ?? path,
      content: j.content ?? "",
      saved: j.content ?? "",
      active: false,
    });
    setActive(j.path ?? path);
  }
  window.addEventListener("piper:open-file", (ev: Event) => {
    const p = (ev as CustomEvent<{ path?: string }>).detail?.path;
    if (p) void openFile(p);
  });
  editor.addEventListener("input", () => {
    const t = openTabs.find((tt) => tt.active);
    if (!t) return;
    t.content = editor.value;
    status.textContent = t.path + (t.content !== t.saved ? " (modified)" : "");
  });
  (
    document.getElementById("saveBtn") as HTMLButtonElement | null
  )?.addEventListener("click", async () => {
    const t = openTabs.find((tt) => tt.active);
    if (!t) return;
    const res = await fetch("/api/write-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: t.path, content: t.content }),
    });
    if (res.ok) {
      t.saved = t.content;
      status.textContent = t.path;
    }
  });
  (
    document.getElementById("revertBtn") as HTMLButtonElement | null
  )?.addEventListener("click", async () => {
    const t = openTabs.find((tt) => tt.active);
    if (!t) return;
    const r = await fetch(`/api/read-file?path=${encodeURIComponent(t.path)}`);
    if (!r.ok) return;
    const j = (await r.json()) as { content?: string; path?: string };
    t.content = j.content ?? "";
    t.saved = t.content;
    editor.value = t.content;
    status.textContent = t.path;
    renderTabs();
  });
}

void init();
