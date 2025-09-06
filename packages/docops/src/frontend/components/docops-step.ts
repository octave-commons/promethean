export class DocOpsStep extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    const step = this.getAttribute("step") || "";
    const title = this.getAttribute("title") || step;
    const fieldsAttr = (this.getAttribute("fields") || "")
      .split(",")
      .map((s) => s.trim());
    const tpl = document.createElement("template");
    tpl.innerHTML = `
      <style>
        :host { display:block; border:1px solid #ddd; padding:8px; margin:8px 0; border-radius:6px; }
        .row { margin: 6px 0; }
        label { display:inline-block; min-width:120px; }
        input[type=number] { width:100px; }
        select, input { min-width: 220px; }
        pre { background:#f6f6f6; padding:6px; border-radius:4px; max-height:180px; overflow:auto; }
      </style>
      <h4>${title}</h4>
      <div class="row" id="fields"></div>
      <button id="runBtn">Run</button>
      <pre id="log"></pre>
    `;
    this.shadowRoot!.appendChild(tpl.content.cloneNode(true));
    const fields = this.shadowRoot!.getElementById("fields")!;

    const addInput = (key: string, label: string, type = "text", def = "") => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<label>${label}</label><input id="${key}" type="${type}" value="${def}">`;
      fields.appendChild(row);
    };
    const addCheckbox = (key: string, label: string) => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<label>${label}</label><input id="${key}" type="checkbox">`;
      fields.appendChild(row);
    };

    const topColl = () =>
      (document.getElementById("collection") as HTMLInputElement | null)
        ?.value || "";

    if (fieldsAttr.includes("collection"))
      addInput("collection", "Collection", "text", topColl());
    if (fieldsAttr.includes("embedModel"))
      addInput("embedModel", "Embed Model", "text", "nomic-embed-text:latest");
    if (fieldsAttr.includes("genModel"))
      addInput("genModel", "Gen Model", "text", "qwen3:4b");
    if (fieldsAttr.includes("k")) addInput("k", "K", "number", "16");
    if (fieldsAttr.includes("docT"))
      addInput("docT", "Doc Threshold", "number", "0.78");
    if (fieldsAttr.includes("refT"))
      addInput("refT", "Ref Threshold", "number", "0.85");
    if (fieldsAttr.includes("anchorStyle"))
      addInput("anchorStyle", "Anchor Style", "text", "block");
    if (fieldsAttr.includes("force")) addCheckbox("force", "Force");
    fieldsAttr.forEach((f) => {
      if (!f) return;
      const known = [
        "collection",
        "embedModel",
        "genModel",
        "k",
        "docT",
        "refT",
        "anchorStyle",
        "force",
      ];
      if (known.includes(f)) return;
      const label = f
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (c) => c.toUpperCase());
      const type = f.toLowerCase().includes("size") ? "number" : "text";
      addInput(f, label, type, "");
    });

    (this.shadowRoot!.getElementById("runBtn") as HTMLButtonElement).onclick =
      () => this.run();
  }

  run() {
    const step = this.getAttribute("step") || "";
    const params = new URLSearchParams({ step });
    this.shadowRoot!.querySelectorAll<HTMLInputElement>("input").forEach(
      (el) => {
        const id = el.id;
        if (!id) return;
        if (el.type === "checkbox")
          params.set(id, el.checked ? "true" : "false");
        else params.set(id, el.value || "");
      },
    );
    const topDir =
      (document.getElementById("dir") as HTMLInputElement | null)?.value || "";
    params.set("dir", topDir);
    const log = this.shadowRoot!.getElementById("log")!;
    (log as any).textContent = "";
    const wsProto = location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsProto}://${
      location.host
    }/ws/run-step?${params.toString()}`;
    let opened = false;
    let sseUsed = false;
    const startSSE = () => {
      if (sseUsed) return;
      sseUsed = true;
      const es = new EventSource("/api/run-step?" + params.toString());
      es.onmessage = (ev) => {
        const line = (ev as MessageEvent).data || "";
        (log as any).textContent += line + "\n";
        (log as any).scrollTop = (log as any).scrollHeight;
      };
      es.onerror = () => es.close();
    };
    try {
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        opened = true;
      };
      ws.onmessage = (ev) => {
        const line = String((ev as MessageEvent).data || "");
        (log as any).textContent += line + "\n";
        (log as any).scrollTop = (log as any).scrollHeight;
        if (step === "rename" && /completed/i.test(line)) {
          try {
            window.dispatchEvent(new CustomEvent("docops:fs-changed"));
          } catch {}
        }
      };
      ws.onerror = () => {
        try {
          ws.close();
        } catch {}
        startSSE();
      };
      setTimeout(() => {
        if (!opened) {
          try {
            ws.close();
          } catch {}
          startSSE();
        }
      }, 300);
    } catch {
      startSSE();
    }
  }
}

customElements.define("docops-step", DocOpsStep);
