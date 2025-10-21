import { getSelection } from "../selection.js";
import { registerHotElement } from "../hmr.js";

type Jsonish = string | number | boolean | null | undefined;
type StepArgs = Record<string, Jsonish>;
type ModuleSpec = { module: string; export?: string; args?: StepArgs };
export type PipelineStep = {
  id?: string;
  name?: string;
  cwd?: string;
  shell?: string;
  node?: string;
  js?: ModuleSpec;
  ts?: ModuleSpec;
  env?: StepArgs;
  [k: string]: unknown;
};
type State = Readonly<{
  pipeline: string;
  step: PipelineStep;
  collapsed: boolean;
}>;

// Keep per-element state without mutating the wrapper element.
const STATE = new WeakMap<HTMLElement, State>();
const initialState: State = Object.freeze({
  pipeline: "",
  step: {},
  collapsed: false,
});
const getState = (el: HTMLElement): State => STATE.get(el) ?? initialState;
const setState = (el: HTMLElement, next: State): void => {
  STATE.set(el, next);
};

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

// Implementation class for the <piper-step> element.
// This DOES NOT extend HTMLElement; registerHotElement wraps it with a real
// custom element and binds `this` to the wrapper instance so DOM APIs work.
export class PiperStep {
  // These DOM APIs exist on the actual custom element wrapper; the HMR
  // wrapper binds `this` to that element when invoking methods.
  declare isConnected: boolean;
  declare attachShadow: (init: ShadowRootInit) => ShadowRoot;
  declare shadowRoot: ShadowRoot | null;

  set data(v: { pipeline: string; step: PipelineStep }) {
    const prev = getState(this as unknown as HTMLElement);
    const next: State = {
      pipeline: v.pipeline,
      step: v.step ?? {},
      collapsed: Boolean(prev.collapsed),
    };
    setState(this as unknown as HTMLElement, next);
    if (this.isConnected) this.render();
  }

  connectedCallback(): void {
    this.attachShadow({ mode: "open" });
    this.render();
  }

  getHotState?(): unknown {
    const s: Record<string, string> = {};
    const inputs = this.shadowRoot?.querySelectorAll<HTMLInputElement>("input");
    inputs?.forEach((i: HTMLInputElement) => {
      if (i.name) s[i.name] = i.value;
    });
    const st = getState(this as unknown as HTMLElement);
    return { ...s, __collapsed: String(Boolean(st.collapsed)) };
  }
  setHotState?(state: unknown): void {
    const rec: Record<string, string> | null =
      state && typeof state === "object"
        ? (state as Record<string, string>)
        : null;
    const inputs = this.shadowRoot?.querySelectorAll<HTMLInputElement>("input");
    if (rec) {
      inputs?.forEach((i: HTMLInputElement) => {
        if (i.name && Object.prototype.hasOwnProperty.call(rec, i.name)) {
          i.value = rec[i.name] ?? "";
        }
      });
    }
    const cur = getState(this as unknown as HTMLElement);
    const next: State = {
      pipeline: cur.pipeline,
      step: cur.step,
      collapsed:
        rec && Object.prototype.hasOwnProperty.call(rec, "__collapsed")
          ? String(rec.__collapsed) === "true"
          : cur.collapsed,
    };
    setState(this as unknown as HTMLElement, next);
  }

  render(): void {
    if (!this.shadowRoot) return;
    const state = getState(this as unknown as HTMLElement);
    const step = state.step || {};
    mountShell(this.shadowRoot, step, Boolean(state.collapsed), (c) => {
      const cur = getState(this as unknown as HTMLElement);
      setState(this as unknown as HTMLElement, {
        pipeline: cur.pipeline,
        step: cur.step,
        collapsed: c,
      });
    });
    renderStepFields(this.shadowRoot, step);
    attachRunButton(this.shadowRoot, () => this.run());
  }

  private run(): void {
    const state = getState(this as unknown as HTMLElement);
    const params = new URLSearchParams({
      pipeline: state.pipeline || "",
      step: (state.step?.id as string) || "",
    });
    this.shadowRoot
      ?.querySelectorAll<HTMLInputElement>("input")
      .forEach((el: HTMLInputElement) => {
        const { name, value } = el;
        if (!name) return;
        params.set(name, value);
      });
    const files = getSelection();
    if (files.length) params.set("files", files.join(","));
    const log = this.shadowRoot!.getElementById("log") as HTMLPreElement;
    if (log) log.textContent = "";
    const es = new EventSource(`/api/run-step?${params.toString()}`);
    es.onmessage = (ev: MessageEvent) => {
      if (!log) return;
      log.textContent += (ev.data || "") + "\n";
      (
        log as unknown as { scrollTop: number; scrollHeight: number }
      ).scrollTop = (log as unknown as { scrollHeight: number }).scrollHeight;
    };
    es.onerror = () => es.close();
  }
}

registerHotElement("piper-step", PiperStep);

// ---------- helpers to keep render small/clear
function mountShell(
  shadowRoot: ShadowRoot,
  step: PipelineStep,
  collapsed: boolean,
  onToggle: (c: boolean) => void,
): void {
  const tpl = document.createElement("template");
  tpl.innerHTML = `
    <style>
      :host { display:block; border:1px solid #ddd; padding:8px; margin:8px 0; border-radius:6px; }
      .hdr { display:flex; align-items:center; gap:8px; cursor:default; }
      .toggle { border:none; background:transparent; cursor:pointer; font-size:14px; }
      .row { margin:6px 0; display:flex; align-items:center; gap:6px; }
      label { min-width:120px; display:inline-block; }
      input { flex:1 1 auto; }
      pre { background:#f6f6f6; padding:6px; border-radius:4px; max-height:180px; overflow:auto; }
    </style>
    <div class="hdr">
      <button id="toggle" class="toggle" title="Collapse/Expand">▶</button>
      <h4 style="margin:0;">${escapeHTML(step.name ?? step.id ?? "")}</h4>
    </div>
    <div id="body">
      <div id="fields"></div>
      <button id="runBtn">Run</button>
      <pre id="log"></pre>
    </div>
  `;
  shadowRoot.innerHTML = "";
  shadowRoot.appendChild(tpl.content.cloneNode(true));
  const body = shadowRoot.getElementById("body") as HTMLDivElement;
  const toggleBtn = shadowRoot.getElementById("toggle") as HTMLButtonElement;
  const setCollapsed = (c: boolean): void => {
    toggleBtn.textContent = c ? "▶" : "▼";
    body.style.display = c ? "none" : "block";
    onToggle(c);
  };
  toggleBtn.onclick = () => setCollapsed(!collapsed);
  setCollapsed(collapsed);
}

function renderStepFields(shadowRoot: ShadowRoot, step: PipelineStep): void {
  const fields = shadowRoot.getElementById("fields") as HTMLDivElement;
  const addInput = (
    name: string,
    labelText: string,
    val: Jsonish = "",
  ): void => {
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

  if (step.cwd != null) addInput("cwd", "CWD", step.cwd as Jsonish);
  if (step.shell != null) addInput("shell", "Shell", step.shell as Jsonish);
  if (step.node != null) addInput("node", "Node", step.node as Jsonish);

  const addArgs = (prefix: string, args?: StepArgs): void => {
    if (!args) return;
    Object.entries(args).forEach(([k, v]) =>
      addInput(`${prefix}.${k}`, `Arg ${k}`, v),
    );
  };
  if (step.js) {
    addInput("js.module", "JS Module", step.js.module);
    addInput("js.export", "JS Export", step.js.export ?? "default");
    addArgs("arg", step.js.args);
  }
  if (step.ts) {
    addInput("ts.module", "TS Module", step.ts.module);
    addInput("ts.export", "TS Export", step.ts.export ?? "default");
    addArgs("arg", step.ts.args);
  }
  const env = step.env || {};
  Object.entries(env).forEach(([k, v]) => addInput(`env.${k}`, `Env ${k}`, v));
}

function attachRunButton(shadowRoot: ShadowRoot, run: () => void): void {
  const btn = shadowRoot.getElementById("runBtn") as HTMLButtonElement;
  btn.onclick = () => run();
}
