import { setSelection } from "./selection.js";

export type FileNode = {
  type: string;
  name: string;
  children?: FileNode[];
};

async function fetchDir(
  dir: string,
): Promise<{ dir: string; tree: FileNode[] }> {
  const res = await fetch(
    `/api/files?dir=${encodeURIComponent(
      dir,
    )}&maxDepth=1&maxEntries=600&exts=.md,.mdx,.txt,.markdown`,
  );
  const json = (await res.json()) as { dir?: string; tree?: FileNode[] };
  return { dir: json.dir ?? dir, tree: json.tree ?? [] };
}

function createDir(
  tree: FileTree,
  parent: HTMLElement,
  node: FileNode,
  parentDir: string,
): void {
  const dirPath = `${parentDir}/${node.name}`.replace(/\\/g, "/");
  const li = document.createElement("li");
  li.dataset.fullPath = dirPath;
  const line = document.createElement("div");
  line.className = "dir-line";
  const caret = document.createElement("span");
  caret.textContent = "▶";
  caret.className = "caret";
  const icon = document.createElement("span");
  icon.textContent = "📁";
  const name = document.createElement("span");
  name.textContent = node.name;
  name.className = "dir-name";
  line.append(caret, icon, name);
  li.appendChild(line);
  const sub = document.createElement("ul");
  sub.style.display = "none";
  li.appendChild(sub);
  parent.appendChild(li);
  line.addEventListener(
    "click",
    () => void toggleDir(tree, caret, sub, dirPath),
  );
}

async function toggleDir(
  tree: FileTree,
  caret: HTMLElement,
  sub: HTMLElement,
  dirPath: string,
): Promise<void> {
  const next = sub.style.display === "none";
  caret.textContent = next ? "▼" : "▶";
  sub.style.display = next ? "block" : "none";
  if (next && sub.dataset.loaded !== "1") {
    const cached = tree.cache.get(dirPath);
    if (cached) {
      sub.innerHTML = "";
      renderFiles(tree, sub, cached, dirPath);
      sub.dataset.loaded = "1";
      return;
    }
    sub.innerHTML = '<li class="loading">Loading…</li>';
    const { dir, tree: nodes } = await fetchDir(dirPath);
    sub.innerHTML = "";
    tree.cache.set(dir, nodes);
    renderFiles(tree, sub, nodes, dir);
    sub.dataset.loaded = "1";
  }
}

function createFile(
  tree: FileTree,
  parent: HTMLElement,
  node: FileNode,
  parentDir: string,
): void {
  const full = `${parentDir}/${node.name}`.replace(/\\/g, "/");
  const li = document.createElement("li");
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.value = full;
  cb.addEventListener("change", () => tree.updateSelection());
  li.appendChild(cb);
  const span = document.createElement("span");
  span.className = "file";
  span.textContent = ` ${node.name}`;
  span.addEventListener("click", () => {
    tree.shadowRoot
      ?.querySelectorAll<HTMLInputElement>("input[type=checkbox]")
      .forEach((el) => {
        el.checked = el.value === full;
      });
    tree.updateSelection();
    window.dispatchEvent(
      new CustomEvent("piper:open-file", { detail: { path: full } }),
    );
  });
  li.appendChild(span);
  parent.appendChild(li);
}

function renderFiles(
  tree: FileTree,
  parent: HTMLElement,
  nodes: FileNode[],
  parentDir: string,
): void {
  for (const n of nodes) {
    if (n.type === "dir") createDir(tree, parent, n, parentDir);
    else createFile(tree, parent, n, parentDir);
  }
}

function initToolbar(shadow: ShadowRoot, onSel: () => void): void {
  (shadow.getElementById("selAll") as HTMLButtonElement).onclick = () => {
    shadow
      .querySelectorAll<HTMLInputElement>("input[type=checkbox]")
      .forEach((cb) => {
        cb.checked = true;
      });
    onSel();
  };
  (shadow.getElementById("selNone") as HTMLButtonElement).onclick = () => {
    shadow
      .querySelectorAll<HTMLInputElement>("input[type=checkbox]")
      .forEach((cb) => {
        cb.checked = false;
      });
    onSel();
  };
}

export class FileTree extends HTMLElement {
  public cache: Map<string, FileNode[]> = new Map();

  async connectedCallback(): Promise<void> {
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

  async refresh(): Promise<void> {
    const rootDiv = this.shadowRoot?.getElementById("root");
    if (!rootDiv) return;
    rootDiv.innerHTML = "<em>Loading…</em>";
    const { dir, tree } = await fetchDir(".");
    this.cache.set(dir, tree);
    const ul = document.createElement("ul");
    renderFiles(this, ul, tree, dir);
    rootDiv.innerHTML = "";
    rootDiv.appendChild(ul);
    initToolbar(this.shadowRoot!, () => this.updateSelection());
  }

  updateSelection(): void {
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
