import { getSelection } from "./selection.js";
import "./file-tree.js";
import "./components/piper-step.js";

export type PipelineStep = Record<string, unknown>;
export type Pipeline = { name: string; steps: PipelineStep[] };

// Dev HMR client: connects to backend events and hot-reloads modules without full refresh
function startHMR() {
  try {
    const es = new EventSource("/api/dev-events");
    es.onmessage = async (ev) => {
      const msg = String(ev.data || "");
      if (msg.startsWith("frontend:update")) {
        try {
          await import(`/js/main.js?ts=${Date.now()}`);
          (
            window as Window & {
              __PIPER_HOT?: { reloadAll?: () => void };
            }
          ).__PIPER_HOT?.reloadAll?.();
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

async function fetchPipelines(
  logs: HTMLElement | null,
): Promise<Pipeline[] | null> {
  try {
    const res = await fetch("/api/pipelines");
    const j = (await res.json()) as { pipelines?: Pipeline[]; error?: string };
    if (j.error && logs) logs.textContent = `Schema error: ${j.error}`;
    return j.pipelines ?? [];
  } catch (e) {
    if (logs) logs.textContent = `Failed to load pipelines: ${e}`;
    return null;
  }
}

function renderPipelineSection(container: HTMLElement, p: Pipeline): void {
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

  const runBtn = document.createElement("button");
  runBtn.textContent = "Run Pipeline";
  runBtn.onclick = () => runPipeline(p.name);

  hdr.append(btn, h, runBtn);
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
    (typeof localStorage !== "undefined" ? localStorage.getItem(key) : null) ===
    "1";
  setCollapsed(saved);

  for (const s of p.steps) {
    type PiperStepEl = HTMLElement & { data?: unknown };
    const el = document.createElement("piper-step") as PiperStepEl;
    el.data = { pipeline: p.name, step: s } as unknown;
    list.appendChild(el);
  }

  section.appendChild(list);
  container.appendChild(section);
}

type Tab = { path: string; content: string; saved: string; active: boolean };

type EditorCtx = {
  tabs: Tab[];
  editor: HTMLTextAreaElement;
  status: HTMLElement;
  render: () => void;
};

const setActive = (ctx: EditorCtx, p: string): void => {
  ctx.tabs.forEach((t) => {
    t.active = t.path === p;
  });
  const t = ctx.tabs.find((tt) => tt.active);
  if (t) {
    ctx.editor.value = t.content;
    ctx.status.textContent =
      t.path + (t.content !== t.saved ? " (modified)" : "");
  } else {
    ctx.editor.value = "";
    ctx.status.textContent = "";
  }
  ctx.render();
};

const renderTabs = (
  tabsEl: HTMLElement,
  openTabs: Tab[],
  set: (p: string) => void,
): void => {
  tabsEl.innerHTML = "";
  for (const t of openTabs) {
    const el = document.createElement("button");
    el.textContent =
      (t.active ? "● " : "○ ") + (t.path.split("/").slice(-1)[0] || t.path);
    el.className = "tab-button";
    el.onclick = () => set(t.path);

    const x = document.createElement("span");
    x.textContent = " ×";
    x.className = "tab-close";
    x.onclick = (ev) => {
      ev.stopPropagation();
      const idx = openTabs.findIndex((tt) => tt.path === t.path);
      if (idx >= 0) openTabs.splice(idx, 1);
      const next = openTabs[idx] || openTabs[idx - 1] || openTabs[0];
      set(next ? next.path : "");
    };

    el.appendChild(x);
    tabsEl.appendChild(el);
  }
};

const openFile = async (
  openTabs: Tab[],
  path: string,
  set: (p: string) => void,
): Promise<void> => {
  const exists = openTabs.find((t) => t.path === path);
  if (exists) return set(path);
  const r = await fetch(`/api/read-file?path=${encodeURIComponent(path)}`);
  if (!r.ok) return;
  const j = (await r.json()) as { path?: string; content?: string };
  openTabs.push({
    path: j.path ?? path,
    content: j.content ?? "",
    saved: j.content ?? "",
    active: false,
  });
  set(j.path ?? path);
};

function setupEditor(
  tabsEl: HTMLElement,
  editor: HTMLTextAreaElement,
  status: HTMLElement,
): void {
  const openTabs: Tab[] = [];
  const ctx: EditorCtx = {
    tabs: openTabs,
    editor,
    status,
    render: () => renderTabs(tabsEl, openTabs, (q) => setActive(ctx, q)),
  };

  const setActiveBound = (p: string): void => setActive(ctx, p);
  ctx.render = () => renderTabs(tabsEl, openTabs, setActiveBound);

  const openFileBound = (p: string) => openFile(openTabs, p, setActiveBound);
  window.addEventListener("piper:open-file", (ev: Event) => {
    const p = (ev as CustomEvent<{ path?: string }>).detail?.path;
    if (p) void openFileBound(p);
  });

  editor.addEventListener("input", () => {
    const t = openTabs.find((tt) => tt.active);
    if (!t) return;
    t.content = editor.value;
    status.textContent = t.path + (t.content !== t.saved ? " (modified)" : "");
  });

  bindSave(openTabs, status);
  bindRevert(openTabs, editor, status, () => ctx.render());
}

const bindSave = (openTabs: Tab[], status: HTMLElement): void => {
  document.getElementById("saveBtn")?.addEventListener("click", async () => {
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
};

const bindRevert = (
  openTabs: Tab[],
  editor: HTMLTextAreaElement,
  status: HTMLElement,
  render: () => void,
): void => {
  document.getElementById("revertBtn")?.addEventListener("click", async () => {
    const t = openTabs.find((tt) => tt.active);
    if (!t) return;
    const r = await fetch(`/api/read-file?path=${encodeURIComponent(t.path)}`);
    if (!r.ok) return;
    const j = (await r.json()) as { content?: string; path?: string };
    t.content = j.content ?? "";
    t.saved = t.content;
    editor.value = t.content;
    status.textContent = t.path ?? "";
    render();
  });
};

async function init(): Promise<void> {
  const container = document.getElementById("pipelines");
  const logs = document.getElementById("logs");
  const tabs = document.getElementById("editorTabs");
  const editor = document.getElementById(
    "editor",
  ) as HTMLTextAreaElement | null;
  const status = document.getElementById("editorStatus");
  if (!container || !tabs || !editor || !status) return;

  const pipelines = await fetchPipelines(logs);
  if (!pipelines) return;

  pipelines.forEach((p) => renderPipelineSection(container, p));
  setupEditor(tabs, editor, status);
}

void init();
