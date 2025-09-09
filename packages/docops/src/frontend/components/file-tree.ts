import { getFiles } from "../api.js";
import { setSelection } from "../selection.js";
import { renderSelectedMarkdown } from "../render.js";

class FileTree extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    const tpl = document.createElement("template");
    tpl.innerHTML = `
      <style>
        :host { display:block; border:1px solid #ddd; padding:8px; border-radius:6px; max-height: 320px; overflow:auto; }
        ul { list-style: none; padding-left: 16px; }
        .file { cursor: pointer; color: #0366d6; }
        .file:hover { text-decoration: underline; }
        .toolbar { display:flex; gap:6px; align-items:center; margin-bottom:6px; flex-wrap:wrap; }
        .size { color:#666; font-size: 12px; margin-left:4px; }
      </style>
      <div class="toolbar">
        <button id="selAll">Select All</button>
        <button id="selNone">Clear</button>
        <label>Size ≥ <input id="minKB" type="number" value="1024" style="width:90px"> KB</label>
        <button id="selBySize">Select by Size</button>
      </div>
      <div id="root"></div>
    `;
    this.shadowRoot!.appendChild(tpl.content.cloneNode(true));
    // Fire and forget; lifecycle hook cannot be async
    void this.refresh();
  }
  async refresh() {
    const dir =
      (document.getElementById("dir") as HTMLInputElement | null)?.value || "";
    const j = await getFiles(dir, {
      maxDepth: 2,
      maxEntries: 500,
      exts: ".md,.mdx,.txt,.markdown",
      includeMeta: true,
    });
    const root = this.shadowRoot!.getElementById("root")!;
    root.innerHTML = "";
    const ul = document.createElement("ul");
    // A11y: expose as a tree so tests and screen readers can find items
    ul.setAttribute("role", "tree");
    root.appendChild(ul);
    const human = (b?: number) => {
      if (typeof b !== "number") return "";
      const kb = b / 1024,
        mb = kb / 1024;
      return mb >= 1 ? `${mb.toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
    };
    type TreeNode = {
      readonly type: "dir" | "file";
      readonly name: string;
      readonly children?: readonly TreeNode[];
      readonly size?: number;
    };
    const render = (
      parent: HTMLElement,
      nodes: ReadonlyArray<TreeNode>,
      prefix: string,
    ) => {
      for (const n of nodes) {
        const li = document.createElement("li");
        if (n.type === "dir") {
          li.textContent = "📁 " + n.name;
          // Optional: mark directories as treeitems as well
          li.setAttribute("role", "treeitem");
          li.setAttribute("aria-label", n.name);
          parent.appendChild(li);
          const sub = document.createElement("ul");
          sub.setAttribute("role", "group");
          li.appendChild(sub);
          render(sub, n.children || [], prefix + "/" + n.name);
        } else {
          const id = (prefix + "/" + n.name).replace(/^\/+/, "");
          const full = j.dir + "/" + id;
          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.value = full;
          cb.dataset.size = String(n.size || 0);
          cb.addEventListener("change", () => this.updateSelection());
          li.appendChild(cb);
          const span = document.createElement("span");
          span.textContent = " " + n.name;
          span.className = "file";
          // A11y: make files discoverable via role/name in tests
          span.setAttribute("role", "treeitem");
          span.setAttribute("aria-label", n.name);
          span.addEventListener("click", async () => {
            this.shadowRoot!.querySelectorAll<HTMLInputElement>(
              "input[type=checkbox]",
            ).forEach((el) => {
              el.checked = el.value === full;
            });
            this.updateSelection();
            await renderSelectedMarkdown();
          });
          li.appendChild(span);
          const sz = document.createElement("span");
          sz.className = "size";
          sz.textContent = human(n.size);
          li.appendChild(sz);
          parent.appendChild(li);
        }
      }
    };
    render(ul, j.tree || [], "");
    this.updateSelection();
    // toolbar actions
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
    (
      this.shadowRoot!.getElementById("selBySize") as HTMLButtonElement
    ).onclick = () => {
      const minKB =
        Number(
          (this.shadowRoot!.getElementById("minKB") as HTMLInputElement)
            .value || "0",
        ) || 0;
      const minBytes = minKB * 1024;
      this.shadowRoot!.querySelectorAll<HTMLInputElement>(
        "input[type=checkbox]",
      ).forEach((cb) => {
        const s = Number(cb.dataset.size || "0") || 0;
        cb.checked = s >= minBytes;
      });
      this.updateSelection();
    };
  }
  updateSelection() {
    const cbs = this.shadowRoot!.querySelectorAll<HTMLInputElement>(
      "input[type=checkbox]",
    );
    const sel: string[] = [];
    cbs.forEach((cb) => {
      if (cb.checked) sel.push(cb.value);
    });
    setSelection(sel);
  }
}

customElements.define("file-tree", FileTree);
