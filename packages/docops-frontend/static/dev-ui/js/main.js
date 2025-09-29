const state = {
  config: { dir: "", collection: "" },
  selectedFile: null,
  docs: [],
  chunks: [],
  selectedChunkId: null,
};

const byId = (id) => document.getElementById(id);

function setText(id, value) {
  const el = byId(id);
  if (el) el.textContent = value;
}

async function fetchJSON(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || res.statusText);
  }
  return res.json();
}

function currentDir() {
  const dirInput = byId("dir");
  const value = dirInput?.value?.trim();
  return value || state.config.dir || "";
}

function currentCollection() {
  const input = byId("collection");
  const value = input?.value?.trim();
  return value || state.config.collection || "";
}

function currentDocThreshold() {
  const input = byId("docT");
  const value = Number(input?.value);
  return Number.isFinite(value) && value > 0 ? value : 0.78;
}

function currentRefThreshold() {
  const input = byId("refT");
  const value = Number(input?.value);
  return Number.isFinite(value) && value > 0 ? value : 0.85;
}

function formatJSON(data) {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

function resetChunksView() {
  state.chunks = [];
  state.selectedChunkId = null;
  const list = byId("chunksList");
  if (list) list.innerHTML = "";
  setText("chunkMeta", "(no chunk selected)");
  setText("chunkText", "(no chunk selected)");
  const hits = byId("chunkHits");
  if (hits) {
    hits.innerHTML = "";
    const placeholder = document.createElement("li");
    placeholder.textContent = "(no hits)";
    hits.appendChild(placeholder);
  }
}

function chunkLabel(chunk, index) {
  const text = typeof chunk.text === "string" ? chunk.text : "";
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0);
  const preview = (firstLine ?? text).trim().slice(0, 80);
  return preview || `Chunk ${index + 1}`;
}

function highlightChunkSelection(chunkId) {
  const list = byId("chunksList");
  if (!list) return;
  Array.from(list.children).forEach((child) => {
    if (!(child instanceof HTMLElement)) return;
    const isActive = chunkId && child.dataset.id === chunkId;
    child.style.backgroundColor = isActive ? "#0ea5e9" : "#e2e8f0";
    child.style.color = isActive ? "#fff" : "#0f172a";
  });
}

function renderChunkList(chunks) {
  const list = byId("chunksList");
  if (!list) return;
  list.innerHTML = "";
  if (!chunks.length) {
    const empty = document.createElement("li");
    empty.textContent = "(no chunks)";
    list.appendChild(empty);
    return;
  }

  chunks.forEach((chunk, index) => {
    const item = document.createElement("li");
    item.dataset.id = chunk.id;
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.style.cursor = "pointer";
    item.style.padding = "6px 10px";
    item.style.borderRadius = "6px";
    item.style.marginBottom = "4px";
    item.textContent = chunkLabel(chunk, index);
    const select = () => {
      void selectChunk(chunk.id);
    };
    item.addEventListener("click", select);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
      }
    });
    list.appendChild(item);
  });

  highlightChunkSelection(state.selectedChunkId);
}

async function loadChunkHits(chunkId) {
  const hits = byId("chunkHits");
  if (!hits) return;
  hits.innerHTML = "";
  try {
    const params = new URLSearchParams({ id: chunkId });
    const data = await fetchJSON(`/api/chunk-hits?${params.toString()}`);
    const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) {
      const li = document.createElement("li");
      li.textContent = "(no hits)";
      hits.appendChild(li);
      return;
    }
    items.forEach((hit) => {
      const li = document.createElement("li");
      const score =
        typeof hit.score === "number"
          ? hit.score.toFixed(2)
          : String(hit.score ?? "0");
      const target =
        typeof hit.docUuid === "string" ? hit.docUuid : String(hit.id ?? "");
      const position =
        typeof hit.startLine === "number" && typeof hit.startCol === "number"
          ? ` @ ${hit.startLine}:${hit.startCol}`
          : "";
      li.textContent = `${score} — ${target}${position}`;
      hits.appendChild(li);
    });
  } catch (error) {
    const li = document.createElement("li");
    li.textContent = error instanceof Error ? error.message : String(error);
    hits.appendChild(li);
  }
}

async function selectChunk(chunkId) {
  state.selectedChunkId = chunkId;
  const chunk = state.chunks.find((item) => item.id === chunkId);
  if (!chunk) {
    highlightChunkSelection(null);
    resetChunksView();
    return;
  }
  const startCol = typeof chunk.startCol === "number" ? chunk.startCol : 0;
  const endLine =
    typeof chunk.endLine === "number" ? chunk.endLine : chunk.startLine;
  const endCol = typeof chunk.endCol === "number" ? chunk.endCol : 0;
  const meta = `lines: ${chunk.startLine}:${startCol} - ${endLine}:${endCol}`;
  setText("chunkMeta", meta);
  setText("chunkText", typeof chunk.text === "string" ? chunk.text : "");
  highlightChunkSelection(chunkId);
  await loadChunkHits(chunkId);
}

async function loadChunksForFile(file) {
  resetChunksView();
  if (!file) return;
  const params = new URLSearchParams({ file });
  try {
    const data = await fetchJSON(`/api/chunks?${params.toString()}`);
    const items = Array.isArray(data.items) ? data.items : [];
    state.chunks = items;
    renderChunkList(items);
    if (items.length > 0) {
      await selectChunk(items[0].id);
    }
  } catch (error) {
    setText(
      "chunkMeta",
      error instanceof Error ? error.message : String(error),
    );
  }
}

class FileTree extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.container = document.createElement("div");
    this.container.setAttribute("role", "tree");
    this.container.style.display = "block";
    this.container.style.maxHeight = "320px";
    this.container.style.overflow = "auto";
    this.container.style.padding = "8px";
    this.shadowRoot.appendChild(this.container);
    this._tree = [];
    this._selected = null;
  }

  set tree(data) {
    this._tree = Array.isArray(data) ? data : [];
    this.render();
  }

  render() {
    this.container.innerHTML = "";
    const rootList = document.createElement("ul");
    rootList.style.listStyle = "none";
    rootList.style.paddingLeft = "0";
    this.container.appendChild(rootList);
    this._tree.forEach((node) => this.renderNode(node, rootList));
  }

  renderNode(node, parent) {
    const item = document.createElement("li");
    item.style.marginBottom = "4px";
    if (node.type === "dir" && Array.isArray(node.children)) {
      const summary = document.createElement("details");
      summary.open = false;
      const header = document.createElement("summary");
      header.textContent = node.name;
      summary.appendChild(header);
      const list = document.createElement("ul");
      list.style.listStyle = "none";
      list.style.paddingLeft = "18px";
      node.children.forEach((child) => this.renderNode(child, list));
      summary.appendChild(list);
      item.appendChild(summary);
    } else if (node.type === "file" && node.path) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = node.name;
      btn.dataset.path = node.path;
      btn.setAttribute("role", "treeitem");
      btn.style.background =
        this._selected === node.path ? "#0ea5e9" : "#e2e8f0";
      btn.style.color = this._selected === node.path ? "#fff" : "#0f172a";
      btn.style.border = "none";
      btn.style.padding = "6px 10px";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";
      btn.addEventListener("click", () => this.selectFile(node.path));
      item.appendChild(btn);
    }
    parent.appendChild(item);
  }

  selectFile(path) {
    this._selected = path;
    this.dispatchEvent(
      new CustomEvent("file-selected", { detail: { path }, bubbles: true }),
    );
    this.render();
  }
}

customElements.define("file-tree", FileTree);

class DocopsStep extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.gap = "8px";

    const title = document.createElement("strong");
    title.textContent =
      this.getAttribute("title") || this.getAttribute("step") || "Step";
    wrapper.appendChild(title);

    const run = document.createElement("button");
    run.id = "runBtn";
    run.type = "button";
    run.textContent = "Run";
    run.style.alignSelf = "flex-start";
    run.addEventListener("click", () => this.runStep());
    wrapper.appendChild(run);

    const pre = document.createElement("pre");
    pre.id = "log";
    pre.textContent = "(idle)";
    pre.style.margin = "0";
    pre.style.minHeight = "120px";
    wrapper.appendChild(pre);

    this.shadowRoot.appendChild(wrapper);
  }

  appendLog(line) {
    const pre = this.shadowRoot.getElementById("log");
    if (!pre) return;
    pre.textContent =
      pre.textContent === "(idle)" ? `${line}` : `${pre.textContent}\n${line}`;
  }

  async runStep() {
    const step = this.getAttribute("step");
    if (!step) return;
    const pre = this.shadowRoot.getElementById("log");
    if (pre) pre.textContent = "Running...";

    const params = new URLSearchParams({
      step,
      dir: currentDir(),
      collection: currentCollection(),
      docT: String(currentDocThreshold()),
      refT: String(currentRefThreshold()),
    });
    if (state.selectedFile) {
      params.set("files", JSON.stringify([state.selectedFile]));
    }

    await new Promise((resolve) => {
      const es = new EventSource(`/api/run-step?${params.toString()}`);
      es.onmessage = (ev) => {
        this.appendLog(ev.data);
        if (/Step '\w+' completed\./.test(ev.data) || /^ERROR/.test(ev.data)) {
          es.close();
          resolve();
        }
      };
      es.onerror = () => {
        this.appendLog("Connection closed.");
        es.close();
        resolve();
      };
    });
  }
}

customElements.define("docops-step", DocopsStep);

async function loadConfig() {
  try {
    const config = await fetchJSON("/api/config");
    state.config = config;
    if (byId("dir")) byId("dir").value = config.dir || "";
    if (byId("collection")) byId("collection").value = config.collection || "";
  } catch (error) {
    console.warn("failed to load config", error);
  }
}

async function loadDocs() {
  try {
    const docs = await fetchJSON("/api/docs");
    state.docs = Array.isArray(docs) ? docs : [];
    const select = byId("doclist");
    if (select) {
      select.innerHTML = "";
      state.docs.forEach((doc) => {
        const opt = document.createElement("option");
        opt.value = doc.uuid;
        const pathText = typeof doc.path === "string" ? doc.path : "";
        const basename = pathText ? pathText.split(/[/\\]/).pop() : "";
        if (doc.title && basename) {
          opt.textContent = `${doc.title} (${basename})`;
        } else if (doc.title) {
          opt.textContent = doc.title;
        } else if (basename) {
          opt.textContent = basename;
        } else if (pathText) {
          opt.textContent = pathText;
        } else {
          opt.textContent = doc.uuid;
        }
        select.appendChild(opt);
      });
    }
  } catch (error) {
    console.warn("failed to load docs", error);
  }
}

async function loadFiles() {
  const params = new URLSearchParams({
    dir: currentDir(),
    maxDepth: "4",
    maxEntries: "200",
    includeMeta: "1",
  });
  try {
    const data = await fetchJSON(`/api/files?${params.toString()}`);
    const tree = byId("fileTree");
    if (tree && "tree" in tree) tree.tree = data.tree || [];
  } catch (error) {
    console.warn("failed to load files", error);
  }
}

async function renderMarkdown() {
  if (!state.selectedFile) {
    setText("mdRender", "(no file selected)");
    return;
  }
  try {
    const params = new URLSearchParams({ file: state.selectedFile });
    const res = await fetch(`/api/read?${params.toString()}`);
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    setText("mdRender", text);
  } catch (error) {
    setText("mdRender", String(error.message || error));
  }
}

async function previewFrontmatter() {
  const params = new URLSearchParams({
    dir: currentDir(),
    docT: String(currentDocThreshold()),
    refT: String(currentRefThreshold()),
  });
  if (state.selectedFile) params.set("file", state.selectedFile);
  const select = byId("doclist");
  if (!state.selectedFile && select?.value) params.set("uuid", select.value);
  try {
    const data = await fetchJSON(`/api/preview?${params.toString()}`);
    setText("out", formatJSON(data));
  } catch (error) {
    setText("out", String(error.message || error));
  }
}

async function runSearch() {
  const term = byId("searchTerm")?.value?.trim() ?? "";
  const k = byId("searchK")?.value || "5";
  if (!term) {
    setText("searchResults", "Enter a query to search.");
    return;
  }
  const params = new URLSearchParams({
    q: term,
    k: String(k),
    collection: currentCollection(),
  });
  try {
    const data = await fetchJSON(`/api/search?${params.toString()}`);
    const lines = (data.items || []).map(
      (item) => `• ${item.path || item.uuid}: ${item.snippet || ""}`,
    );
    setText("searchResults", lines.length ? lines.join("\n") : "(no results)");
  } catch (error) {
    setText("searchResults", String(error.message || error));
  }
}

async function loadStatus() {
  const params = new URLSearchParams({
    dir: currentDir(),
    limit: "25",
    page: "1",
    onlyIncomplete: "0",
  });
  try {
    const data = await fetchJSON(`/api/status?${params.toString()}`);
    const lines = (data.items || []).map((item) => {
      const ok = item.frontmatter?.done ? "done" : "todo";
      return `${item.title || item.path} – frontmatter:${ok}`;
    });
    setText("statusTable", lines.length ? lines.join("\n") : "(no items)");
  } catch (error) {
    setText("statusTable", String(error.message || error));
  }
}

function wireEvents() {
  byId("refresh")?.addEventListener("click", async () => {
    await Promise.all([loadDocs(), loadFiles()]);
  });
  byId("renderMd")?.addEventListener("click", () => {
    void renderMarkdown();
  });
  byId("preview")?.addEventListener("click", () => {
    void previewFrontmatter();
  });
  byId("searchBtn")?.addEventListener("click", () => {
    void runSearch();
  });
  byId("statusRefresh")?.addEventListener("click", () => {
    void loadStatus();
  });

  byId("fileTree")?.addEventListener("file-selected", (event) => {
    const path = event.detail?.path;
    if (path) {
      state.selectedFile = path;
      void renderMarkdown();
      void loadChunksForFile(path);
    }
  });
}

async function init() {
  wireEvents();
  resetChunksView();
  await loadConfig();
  await Promise.all([loadDocs(), loadFiles(), loadStatus()]);
}

document.addEventListener("DOMContentLoaded", () => {
  void init();
});
