const state = {
  config: { dir: "", collection: "" },
  selectedFile: null,
  docs: [],
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
        opt.textContent = doc.title || doc.path;
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
    setText("searchResults", "(enter a query)");
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
    }
  });
}

async function init() {
  wireEvents();
  await loadConfig();
  await Promise.all([loadDocs(), loadFiles(), loadStatus()]);
}

document.addEventListener("DOMContentLoaded", () => {
  void init();
});
