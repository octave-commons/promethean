import { getSelection } from "../selection.js";
import { registerHotElement } from "../hmr.js";

// Escape HTML special characters to prevent XSS when interpolating into HTML strings.
function escapeHTML(str: string = ""): string {
  return str.replace(/[&<>"'/]/g, (char) => {
    const escapeChars: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
    };
    return escapeChars[char] || char;
  });
}

export class PiperStep extends HTMLElement {
  private pipeline = "";
  private step: any = {};

  set data(v: { pipeline: string; step: any }) {
    this.pipeline = v.pipeline;
    this.step = v.step || {};
    if (this.isConnected) this.render();
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.render();
  }

  getHotState?() {
    const s: Record<string, string> = {};
    const inputs = this.shadowRoot?.querySelectorAll<HTMLInputElement>("input");
    inputs?.forEach((i) => {
      if (i.name) s[i.name] = i.value;
    });
    return s;
  }
  setHotState?(state: Record<string, string>) {
    const inputs = this.shadowRoot?.querySelectorAll<HTMLInputElement>("input");
    inputs?.forEach((i) => {
      if (i.name && Object.prototype.hasOwnProperty.call(state, i.name)) {
        i.value = state[i.name] ?? "";
      }
    });
  }

  private render() {
    if (!this.shadowRoot) return;
    const step = this.step || {};
    const tpl = document.createElement("template");
    tpl.innerHTML = `
      <style>
        :host { display:block; border:1px solid #ddd; padding:8px; margin:8px 0; border-radius:6px; }
        .row { margin:6px 0; display:flex; align-items:center; gap:6px; }
        label { min-width:120px; display:inline-block; }
        input { flex:1 1 auto; }
        pre { background:#f6f6f6; padding:6px; border-radius:4px; max-height:180px; overflow:auto; }
      </style>
      <h4>${escapeHTML(step.name) || escapeHTML(step.id)}</h4>
      <div id="fields"></div>
      <button id="runBtn">Run</button>
      <pre id="log"></pre>
    `;
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    const fields = this.shadowRoot.getElementById("fields")!;

    const addInput = (name: string, labelText: string, val: any = "") => {
      const row = document.createElement("div");
      row.className = "row";
      const label = document.createElement("label");
      label.textContent = labelText;
      const input = document.createElement("input");
      input.name = name;
      if (typeof val === "number") input.type = "number";
      input.value = val != null ? String(val) : "";
      row.appendChild(label);
      row.appendChild(input);
      fields.appendChild(row);
    };

    if (step.cwd != null) addInput("cwd", "CWD", step.cwd);
    if (step.shell != null) addInput("shell", "Shell", step.shell);
    if (step.node != null) addInput("node", "Node", step.node);
    if (step.js) {
      addInput("js.module", "JS Module", step.js.module);
      addInput("js.export", "JS Export", step.js.export || "default");
      const args = step.js.args || {};
      for (const [k, v] of Object.entries(args)) {
        addInput(`arg.${k}`, `Arg ${k}`, v);
      }
    }
    if (step.ts) {
      addInput("ts.module", "TS Module", step.ts.module);
      addInput("ts.export", "TS Export", step.ts.export || "default");
      const args = step.ts.args || {};
      for (const [k, v] of Object.entries(args)) {
        addInput(`arg.${k}`, `Arg ${k}`, v);
      }
    }
    const env = step.env || {};
    for (const [k, v] of Object.entries(env)) {
      addInput(`env.${k}`, `Env ${k}`, v);
    }

    (this.shadowRoot.getElementById("runBtn") as HTMLButtonElement).onclick =
      () => this.run();
  }

  private run() {
    const params = new URLSearchParams({
      pipeline: this.pipeline,
      step: this.step.id || "",
    });
    this.shadowRoot
      ?.querySelectorAll<HTMLInputElement>("input")
      .forEach((el) => {
        const { name, value } = el;
        if (!name) return;
        params.set(name, value);
      });
    const files = getSelection();
    if (files.length) params.set("files", files.join(","));
    const log = this.shadowRoot!.getElementById("log")!;
    (log as any).textContent = "";
    const es = new EventSource(`/api/run-step?${params.toString()}`);
    es.onmessage = (ev) => {
      (log as any).textContent += (ev.data || "") + "\n";
      (log as any).scrollTop = (log as any).scrollHeight;
    };
    es.onerror = () => es.close();
  }
}

registerHotElement("piper-step", PiperStep);
