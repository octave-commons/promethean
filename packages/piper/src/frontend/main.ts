export type PipelineStep = { id: string; name?: string };
export type Pipeline = { name: string; steps: PipelineStep[] };

// Lightweight selection cache within this page
function getSelectedFiles(): string[] {
  try {
    const s = (window as any).__PIPER_FILES__ as string[] | undefined;
    return Array.isArray(s) ? s : [];
  } catch {
    return [];
  }
}
function setSelectedFiles(xs: string[]): void {
  (window as any).__PIPER_FILES__ = xs;
}

// Minimal FileTree custom element (uses /api/files like DocOps)
class FileTree extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    const tpl = document.createElement("template");
    tpl.innerHTML = `
      <style>
        :host { display:block; border:1px solid #ddd; padding:8px; border-radius:6px; overflow:auto; }
        ul { list-style:none; padding-left:16px; }
        .file { cursor:pointer; color:#0366d6; }
        .file:hover { text-decoration: underline; }
        .toolbar { display:flex; gap:6px; align-items:center; margin-bottom:6px; flex-wrap:wrap; }
      </style>
      <div class="toolbar">
        <button id="selAll">Select All</button>
        <button id="selNone">Clear</button>
      </div>
      <div id="root"><em>Loading…</em></div>
    `;
    this.shadowRoot!.appendChild(tpl.content.cloneNode(true));
    void this.refresh();
  }
  async refresh() {
    const rootDiv = this.shadowRoot!.getElementById("root")!;
    rootDiv.innerHTML = "<em>Loading…</em>";
    const res = await fetch(
      `/api/files?dir=${encodeURIComponent(
        ".",
      )}&maxDepth=2&maxEntries=600&exts=.md,.mdx,.txt,.markdown`,
    );
    const data = await res.json();
    const ul = document.createElement("ul");
    const render = (parent: HTMLElement, nodes: any[], prefix: string) => {
      for (const n of nodes) {
        const li = document.createElement("li");
        if (n.type === "dir") {
          const line = document.createElement("div");
          line.style.display = "flex";
          line.style.alignItems = "center";
          line.style.gap = "4px";
          line.style.cursor = "pointer";
          line.style.userSelect = "none";
          const caret = document.createElement("span");
          caret.textContent = "▼";
          caret.style.display = "inline-block";
          caret.style.width = "1em";
          caret.style.textAlign = "center";
          caret.style.color = "#666";
          const icon = document.createElement("span");
          icon.textContent = "📁";
          const name = document.createElement("span");
          name.textContent = n.name;
          name.style.fontWeight = "600";
          line.appendChild(caret);
          line.appendChild(icon);
          line.appendChild(name);
          li.appendChild(line);
          const sub = document.createElement("ul");
          li.appendChild(sub);
          parent.appendChild(li);
          render(sub, n.children || [], prefix + "/" + n.name);
          let open = true;
          const toggle = () => {
            open = !open;
            caret.textContent = open ? "▼" : "▶";
            sub.style.display = open ? "block" : "none";
          };
          line.addEventListener("click", toggle);
        } else {
          const full = (
            data.dir +
            "/" +
            (prefix + "/" + n.name).replace(/^\/+/, "")
          ).replace(/\\/g, "/");
          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.value = full;
          cb.addEventListener("change", () => this.updateSelection());
          li.appendChild(cb);
          const span = document.createElement("span");
          span.className = "file";
          span.textContent = " " + n.name;
          span.addEventListener("click", () => {
            this.shadowRoot!.querySelectorAll<HTMLInputElement>(
              "input[type=checkbox]",
            ).forEach((el) => (el.checked = el.value === full));
            this.updateSelection();
            // open file in editor pane
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
    render(ul, data.tree || [], "");
    rootDiv.innerHTML = "";
    rootDiv.appendChild(ul);
    // toolbar
    (this.shadowRoot!.getElementById("selAll") as HTMLButtonElement).onclick =
      () => {
        this.shadowRoot!.querySelectorAll<HTMLInputElement>(
          "input[type=checkbox]",
        ).forEach((cb) => (cb.checked = true));
        this.updateSelection();
      };
    (this.shadowRoot!.getElementById("selNone") as HTMLButtonElement).onclick =
      () => {
        this.shadowRoot!.querySelectorAll<HTMLInputElement>(
          "input[type=checkbox]",
        ).forEach((cb) => (cb.checked = false));
        this.updateSelection();
      };
  }
  updateSelection() {
    const xs: string[] = [];
    this.shadowRoot!.querySelectorAll<HTMLInputElement>(
      "input[type=checkbox]",
    ).forEach((cb) => {
      if (cb.checked) xs.push(cb.value);
    });
    setSelectedFiles(xs);
    window.dispatchEvent(
      new CustomEvent("piper:files-changed", { detail: xs }),
    );
  }
}
customElements.define("file-tree", FileTree);

async function init(): Promise<void> {
  const container = document.getElementById("pipelines");
  const logs = document.getElementById("logs");
  const tabs = document.getElementById("editorTabs")!;
  const editor = document.getElementById("editor") as HTMLTextAreaElement;
  const status = document.getElementById("editorStatus")!;
  if (!container) return;
  let data: { pipelines?: Pipeline[]; error?: string } = {};
  try {
    const res = await fetch("/api/pipelines");
    data = await res.json();
  } catch (e) {
    if (logs)
      (logs as HTMLElement).textContent = `Failed to load pipelines: ${e}`;
    return;
  }
  if (data?.error && logs)
    (logs as HTMLElement).textContent = `Schema error: ${data.error}`;
  (data.pipelines ?? []).forEach((p) => {
    const section = document.createElement("section");
    const h = document.createElement("h2");
    h.textContent = p.name;
    section.appendChild(h);
    const list = document.createElement("div");
    for (const s of p.steps) {
      const row = document.createElement("div");
      row.style.margin = "6px 0";
      const label = document.createElement("span");
      label.textContent = s.name ? `${s.id} — ${s.name}` : s.id;
      label.style.display = "inline-block";
      label.style.minWidth = "260px";
      const btn = document.createElement("button");
      btn.textContent = "Run Step";
      btn.onclick = () => {
        const files = getSelectedFiles();
        const logsEl = document.getElementById("logs");
        if (!logsEl) return;
        (logsEl as HTMLElement).textContent = "";
        const qs = new URLSearchParams({
          pipeline: p.name,
          step: s.id,
          ...(files.length ? { files: JSON.stringify(files) } : {}),
        });
          (logsEl as HTMLElement).textContent += `${e.data}\n`;
        };
        es.onerror = () => es.close();
      };
      row.appendChild(label);
      row.appendChild(btn);
      list.appendChild(row);
    }
    section.appendChild(list);
    container.appendChild(section);
  });

  // Basic tabbed editor behavior
  type Tab = { path: string; content: string; saved: string; active: boolean };
  const openTabs: Tab[] = [];
  const setActive = (p: string) => {
    openTabs.forEach((t) => (t.active = t.path === p));
    const t = openTabs.find((t) => t.active);
    if (t) {
      editor.value = t.content;
      (status as any).textContent =
        t.path + (t.content !== t.saved ? " (modified)" : "");
    } else {
      editor.value = "";
      (status as any).textContent = "";
    }
    renderTabs();
  };
  const renderTabs = () => {
    tabs.innerHTML = "";
    for (const t of openTabs) {
      const el = document.createElement("button");
      el.textContent =
        (t.active ? "● " : "○ ") + (t.path.split("/").slice(-1)[0] || t.path);
      el.style.padding = "4px 8px";
      el.onclick = () => setActive(t.path);
      const x = document.createElement("span");
      x.textContent = " ×";
      x.style.cursor = "pointer";
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
    const j = await r.json();
    openTabs.push({
      path: j.path || path,
      content: j.content || "",
      saved: j.content || "",
      active: false,
    });
    setActive(j.path || path);
  }
  window.addEventListener("piper:open-file", (ev: any) => {
    const p = ev?.detail?.path;
    if (p) void openFile(p);
  });
  editor.addEventListener("input", () => {
    const t = openTabs.find((tt) => tt.active);
    if (!t) return;
    t.content = editor.value;
    (status as any).textContent =
      t.path + (t.content !== t.saved ? " (modified)" : "");
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
      (status as any).textContent = t.path;
    }
  });
  (
    document.getElementById("revertBtn") as HTMLButtonElement | null
  )?.addEventListener("click", async () => {
    const t = openTabs.find((tt) => tt.active);
    if (!t) return;
    const r = await fetch(`/api/read-file?path=${encodeURIComponent(t.path)}`);
    if (!r.ok) return;
    const j = await r.json();
    t.content = j.content || "";
    t.saved = t.content;
    editor.value = t.content;
    (status as any).textContent = t.path;
    renderTabs();
  });
}

void init();
