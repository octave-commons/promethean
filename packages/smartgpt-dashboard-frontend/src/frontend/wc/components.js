import {
  html,
  css,
  LitElement,
} from "https://unpkg.com/lit@3.1.3/index.js?module";

function getAuthHeaders() {
  const tok = localStorage.getItem("bridgeToken") || "";
  return tok ? { Authorization: `Bearer ${tok}` } : {};
}

function resolveRef(spec, schema) {
  if (!schema) return null;
  if (schema.$ref && typeof schema.$ref === "string") {
    const m = schema.$ref.match(/^#\/(.+)$/);
    if (!m) return schema;
    const path = m[1]
      .split("/")
      .map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
    let cur = spec;
    for (const p of path) cur = cur?.[p];
    return cur || schema;
  }
  return schema;
}

class ApiResponseViewer extends LitElement {
  static properties = {
    data: { state: true },
    text: { state: true },
    status: { state: true },
  };
  static styles = css`
    .resp {
      background: #0e0e0e;
      color: #ddd;
      padding: 8px;
      border-radius: 6px;
      white-space: pre-wrap;
    }
    .meta {
      font-size: 12px;
      opacity: 0.8;
      margin-bottom: 4px;
    }
  `;
  render() {
    const content = this.data
      ? JSON.stringify(this.data, null, 2)
      : this.text || "";
    return html`
      <div class="meta">Status: ${this.status ?? ""}</div>
      <pre class="resp">${content}</pre>
    `;
  }
}
customElements.define("api-response-viewer", ApiResponseViewer);

class ApiRequestForm extends LitElement {
  static properties = {
    schema: { attribute: false },
    parameters: { attribute: false },
    examples: { attribute: false },
  };
  static styles = css`
    .field {
      margin: 6px 0;
    }
    .field label {
      display: block;
      font-size: 12px;
      opacity: 0.8;
    }
    .row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    input[type="text"],
    input[type="number"],
    textarea,
    select {
      width: 100%;
      padding: 6px;
    }
    textarea {
      min-height: 80px;
      font-family: ui-monospace, Menlo, monospace;
    }
    .actions {
      margin-top: 8px;
    }
  `;
  constructor() {
    super();
    this.schema = null;
    this.parameters = [];
    this.examples = null;
    this._exampleName = "";
  }

  buildControls(schema, path = []) {
    if (!schema) return [];
    const controls = [];
    const type = schema.type;
    const required = schema.required || [];
    const props = schema.properties || {};
    if (type === "object" && Object.keys(props).length) {
      for (const [key, def] of Object.entries(props)) {
        const sch = def;
        const name = [...path, key].join(".");
        controls.push(this.renderInput(name, sch, required.includes(key)));
      }
    } else {
      controls.push(
        this.renderInput(
          path.join("."),
          schema,
          required.includes(path[path.length - 1]),
        ),
      );
    }
    return controls;
  }

  renderInput(name, schema, required) {
    const id = `f_${name.replace(/[^a-z0-9_]/gi, "_")}`;
    const title = schema.title || name;
    const desc = schema.description || "";
    const t = schema.type;
    const enums = schema.enum;
    let control;
    if (enums && Array.isArray(enums)) {
      control = html`<select
        id=${id}
        data-name=${name}
        .value=${schema.default ?? enums[0]}
      >
        ${enums.map(
          (v) => html`<option value=${String(v)}>${String(v)}</option>`,
        )}
      </select>`;
    } else if (t === "boolean") {
      control = html`<input
        id=${id}
        data-name=${name}
        type="checkbox"
        ?checked=${schema.default === true}
      />`;
    } else if (t === "number" || t === "integer") {
      control = html`<input
        id=${id}
        data-name=${name}
        type="number"
        .value=${schema.default ?? ""}
      />`;
    } else if (t === "array") {
      control = html`<textarea
        id=${id}
        data-name=${name}
        placeholder="[ item1, item2 ]"
      ></textarea>`;
    } else if (t === "object") {
      control = html`<textarea
        id=${id}
        data-name=${name}
        placeholder="{ }"
      ></textarea>`;
    } else {
      control = html`<input
        id=${id}
        data-name=${name}
        type="text"
        .value=${schema.default ?? ""}
        placeholder=${schema.example ?? ""}
      />`;
    }
    return html`
      <div class="field">
        <label for=${id}
          >${title}${required
            ? html` <span title="required">*</span>`
            : ""}</label
        >
        ${desc ? html`<div class="small muted">${desc}</div>` : ""} ${control}
      </div>
    `;
  }

  collectBody() {
    const out = {};
    this.renderRoot.querySelectorAll("[data-name]").forEach((el) => {
      const path = el.getAttribute("data-name");
      const segs = path.split(".");
      let cur = out;
      for (let i = 0; i < segs.length - 1; i++) {
        cur[segs[i]] = cur[segs[i]] || {};
        cur = cur[segs[i]];
      }
      const key = segs[segs.length - 1];
      if (el.type === "checkbox") cur[key] = el.checked;
      else if (el.tagName === "TEXTAREA") {
        const txt = el.value.trim();
        try {
          cur[key] = JSON.parse(txt || "null");
        } catch {
          cur[key] = txt;
        }
      } else if (el.type === "number")
        cur[key] = el.value === "" ? null : Number(el.value);
      else cur[key] = el.value;
    });
    return out;
  }

  applyExample(obj) {
    // Fill inputs from example object
    const setValue = (path, value) => {
      const sel = `[data-name="${path}"]`;
      const el = this.renderRoot.querySelector(sel);
      if (!el) return;
      if (el.type === "checkbox") el.checked = Boolean(value);
      else if (el.tagName === "TEXTAREA")
        el.value =
          typeof value === "string" ? value : JSON.stringify(value, null, 2);
      else if (el.type === "number")
        el.value = value === undefined || value === null ? "" : Number(value);
      else
        el.value = value === undefined || value === null ? "" : String(value);
    };
    const walk = (prefix, val) => {
      if (val && typeof val === "object" && !Array.isArray(val)) {
        for (const [k, v] of Object.entries(val))
          walk(prefix ? `${prefix}.${k}` : k, v);
      } else {
        setValue(prefix, val);
      }
    };
    walk("", obj);
  }

  collectParams() {
    const params = {};
    this.renderRoot.querySelectorAll("[data-param]").forEach((el) => {
      const name = el.getAttribute("data-param");
      if (el.type === "checkbox") params[name] = el.checked;
      else params[name] = el.value;
    });
    return params;
  }

  onSubmit(e) {
    e.preventDefault();
    const detail = {
      body: this.schema ? this.collectBody() : null,
      params: this.collectParams(),
    };
    this.dispatchEvent(new CustomEvent("submit", { detail }));
  }

  renderParamInput(p) {
    const id = `p_${p.name}`;
    const t = p.schema?.type || "string";
    const enums = p.schema?.enum;
    let control;
    if (enums)
      control = html`<select id=${id} data-param=${p.name}>
        ${enums.map((v) => html`<option>${String(v)}</option>`)}
      </select>`;
    else if (t === "boolean")
      control = html`<input id=${id} data-param=${p.name} type="checkbox" />`;
    else if (t === "number" || t === "integer")
      control = html`<input id=${id} data-param=${p.name} type="number" />`;
    else
      control = html`<input
        id=${id}
        data-param=${p.name}
        type="text"
        placeholder=${p.example ?? ""}
      />`;
    return html`<div class="field">
      <label for=${id}>${p.name}${p.required ? html` *` : ""}</label>${control}
    </div>`;
  }

  render() {
    const bodyControls = this.schema ? this.buildControls(this.schema) : [];
    const ex = this.examples || {};
    const paramControls = (this.parameters || []).map((p) =>
      this.renderParamInput(p),
    );
    return html`
      <form @submit=${(e) => this.onSubmit(e)}>
        ${Object.keys(ex).length
          ? html`
              <div class="field">
                <label>Examples</label>
                <select
                  @change=${(e) => {
                    const name = e.target.value;
                    this._exampleName = name;
                    const v = ex[name]?.value;
                    if (v) this.applyExample(v);
                  }}
                >
                  <option value="">(select example)</option>
                  ${Object.entries(ex).map(
                    ([k, v]) =>
                      html`<option value=${k}>${v.summary || k}</option>`,
                  )}
                </select>
              </div>
            `
          : ""}
        ${paramControls} ${bodyControls}
        <div class="actions"><button type="submit">Send</button></div>
      </form>
    `;
  }
}
customElements.define("api-request-form", ApiRequestForm);

class ApiEndpointCard extends LitElement {
  static properties = {
    method: {},
    path: {},
    op: { attribute: false },
    spec: { attribute: false },
    base: {},
    response: { state: true },
    status: { state: true },
    streaming: { state: true },
    streamText: { state: true },
  };
  static styles = css`
    .card {
      border: 1px solid #2a2f3a;
      border-radius: 10px;
      padding: 12px;
      margin: 10px 0;
      background: #0e1117;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
    }
    .card:hover {
      border-color: #3a4150;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }
    .head {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 8px;
    }
    .method {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid #2a2f3a;
      background: #0b0e13;
    }
    .method.m-get {
      color: #22c55e;
      border-color: #1f5430;
    }
    .method.m-post {
      color: #3b82f6;
      border-color: #23437a;
    }
    .method.m-put {
      color: #a78bfa;
      border-color: #4b3f8a;
    }
    .method.m-patch {
      color: #f59e0b;
      border-color: #5a4b1a;
    }
    .method.m-delete {
      color: #ef4444;
      border-color: #5b2222;
    }
    .path {
      font-family: ui-monospace, Menlo, monospace;
      opacity: 0.9;
    }
    .summary {
      opacity: 0.8;
    }
    .stream {
      background: #0e0e0e;
      color: #ddd;
      padding: 10px;
      border-radius: 8px;
      white-space: pre-wrap;
      min-height: 80px;
      border: 1px solid #2a2f3a;
    }
    .row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .star {
      margin-left: auto;
      cursor: pointer;
      background: transparent;
      border: 1px solid #2a2f3a;
      border-radius: 999px;
      padding: 2px 8px;
      color: #ffd36e;
    }
    .star:hover {
      border-color: #3a4150;
    }
    details {
      margin: 6px 0;
    }
    details > summary {
      cursor: pointer;
      opacity: 0.85;
    }
  `;
  constructor() {
    super();
    this.response = null;
    this.status = null;
    this.base = ".";
    this.streaming = false;
    this.streamText = "";
    this._es = null;
  }

  getRequestSchema() {
    const rb = this.op?.requestBody?.content?.["application/json"]?.schema;
    return resolveRef(this.spec, rb);
  }
  getRequestExamples() {
    return (
      this.op?.requestBody?.content?.["application/json"]?.examples || null
    );
  }
  getParameters() {
    return (this.op?.parameters || []).map((p) => ({
      ...p,
      schema: resolveRef(this.spec, p.schema || p),
    }));
  }
  getResponseSchema() {
    const rs = this.op?.responses?.[200]?.content?.["application/json"]?.schema;
    return resolveRef(this.spec, rs);
  }

  async send(e) {
    const { body, params } = e.detail;
    const method = this.method.toUpperCase();
    let url = this.path;
    const pathParams = (this.op?.parameters || []).filter(
      (p) => p.in === "path",
    );
    for (const p of pathParams) {
      const v = params?.[p.name] ?? "";
      url = url.replace(`{${p.name}}`, encodeURIComponent(v));
    }
    const queryParams = (this.op?.parameters || []).filter(
      (p) => p.in === "query",
    );
    if (queryParams.length) {
      const qs = new URLSearchParams();
      for (const p of queryParams) {
        const v = params?.[p.name];
        if (v !== undefined && v !== "") qs.set(p.name, String(v));
      }
      const s = qs.toString();
      if (s) url += (url.includes("?") ? "&" : "?") + s;
    }
    const isSSE = !!this.op?.responses?.[200]?.content?.["text/event-stream"];
    if (isSSE && method === "GET") {
      // Start SSE stream
      try {
        if (this._es) {
          this._es.close();
          this._es = null;
        }
      } catch {}
      this.streaming = true;
      this.streamText = "";
      this._es = new EventSource(url);
      const append = (t) => {
        this.streamText += t;
        this.requestUpdate();
      };
      this._es.onmessage = (ev) => append(`${ev.data || ""}\n`);
      // also listen for custom events commonly used by bridge
      for (const ev of ["replay", "data", "stdout", "stderr"]) {
        this._es.addEventListener(ev, (e) => {
          try {
            const js = JSON.parse(e.data || "{}");
            append(`${js.text || ""}\n`);
          } catch {
            append(`${e.data || ""}\n`);
          }
        });
      }
      this._es.onerror = () => {
        try {
          this._es.close();
        } catch {}
        this._es = null;
      };
      return;
    }
    const headers = { "content-type": "application/json", ...getAuthHeaders() };
    const opts = { method, headers };
    if (method !== "GET" && body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    this.status = res.status;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) this.response = await res.json();
    else this.response = await res.text();
    this.requestUpdate();
  }

  render() {
    const schema = this.getRequestSchema();
    const params = this.getParameters();
    const examples = this.getRequestExamples();
    const respSchema = this.getResponseSchema();
    const favKey = `${this.method}:${this.path}`;
    const favs = new Set(
      JSON.parse(localStorage.getItem("apiFavorites") || "[]"),
    );
    const isFav = favs.has(favKey);
    const toggleFav = () => {
      if (favs.has(favKey)) favs.delete(favKey);
      else favs.add(favKey);
      localStorage.setItem("apiFavorites", JSON.stringify(Array.from(favs)));
      this.requestUpdate();
    };
    return html`
      <div class="card">
        <div class="head">
          <span class="method m-${this.method}">${this.method}</span>
          <span class="path">${this.path}</span>
          <span class="summary">${this.op?.summary || ""}</span>
          <button class="star" title="Favorite" @click=${toggleFav}>
            ${isFav ? "★" : "☆"}
          </button>
        </div>
        <api-request-form
          .schema=${schema}
          .parameters=${params}
          .examples=${examples}
          @submit=${(e) => this.send(e)}
        ></api-request-form>
        ${respSchema
          ? html`<details>
              <summary>Response schema</summary>
              <pre class="stream">${JSON.stringify(respSchema, null, 2)}</pre>
            </details>`
          : ""}
        ${this.streaming
          ? html`<div class="row">
                <button
                  @click=${() => {
                    if (this._es)
                      try {
                        this._es.close();
                      } catch {}
                    this._es = null;
                    this.streaming = false;
                  }}
                >
                  Stop
                </button>
              </div>
              <pre class="stream">${this.streamText}</pre>`
          : this.response !== null
            ? html`<api-response-viewer
                .data=${typeof this.response === "string"
                  ? null
                  : this.response}
                .text=${typeof this.response === "string" ? this.response : ""}
                .status=${this.status}
              ></api-response-viewer>`
            : ""}
      </div>
    `;
  }
}
customElements.define("api-endpoint-card", ApiEndpointCard);

class ApiDocs extends LitElement {
  static properties = {
    base: {},
    spec: { state: true },
    q: { state: true },
    tag: { state: true },
    favorites: { state: true },
  };
  static styles = css`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 10px;
    }
    .row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }
  `;
  connectedCallback() {
    super.connectedCallback();
    this.load();
    this.favorites = JSON.parse(localStorage.getItem("apiFavorites") || "[]");
  }
  async load() {
    const res = await fetch("/openapi.json", { headers: getAuthHeaders() });
    this.spec = await res.json();
  }
  render() {
    if (!this.spec) return html`<div>Loading OpenAPI…</div>`;
    const entries = [];
    const methods = ["get", "post", "put", "patch", "delete"];
    for (const [path, ops] of Object.entries(this.spec.paths || {})) {
      for (const m of methods)
        if (ops[m]) entries.push({ method: m, path, op: ops[m] });
    }
    const tags = new Set();
    for (const e of entries) {
      if (Array.isArray(e.op.tags) && e.op.tags.length) e.tag = e.op.tags[0];
      else
        e.tag =
          (e.path.split("/")[1] || "General").replace(/\{.*\}/, "") ||
          "General";
      tags.add(e.tag);
    }
    const q = (this.q || "").toLowerCase();
    let filtered = q
      ? entries.filter((e) =>
          `${e.path} ${e.op.summary || ""} ${e.method}`
            .toLowerCase()
            .includes(q),
        )
      : entries;
    if (this.tag && this.tag !== "All")
      filtered = filtered.filter((e) => e.tag === this.tag);
    const favSet = new Set(this.favorites || []);
    const groups = new Map();
    const order = ["Favorites", ...Array.from(tags).sort()];
    for (const e of filtered) {
      const key = favSet.has(`${e.method}:${e.path}`) ? "Favorites" : e.tag;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(e);
    }
    return html`
      <div class="row">
        <input
          type="text"
          placeholder="Filter endpoints…"
          @input=${(e) => {
            this.q = e.target.value;
          }}
        />
        <select
          @change=${(e) => {
            this.tag = e.target.value;
          }}
        >
          <option>All</option>
          ${Array.from(tags)
            .sort()
            .map(
              (t) => html`<option ?selected=${this.tag === t}>${t}</option>`,
            )}
        </select>
      </div>
      ${order
        .filter((k) => groups.has(k))
        .map(
          (k) => html`
            <h3>${k}</h3>
            <div class="grid">
              ${groups
                .get(k)
                .map(
                  (e) =>
                    html`<api-endpoint-card
                      .method=${e.method}
                      .path=${e.path}
                      .op=${e.op}
                      .spec=${this.spec}
                    ></api-endpoint-card>`,
                )}
            </div>
          `,
        )}
    `;
  }
}
customElements.define("api-docs", ApiDocs);
