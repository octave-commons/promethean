import {
  getConfig,
  getDocs,
  searchSemantic,
  getChunks,
  getChunkHits,
  getStatus,
} from "./api.js";
import "./components/file-tree.js";
import "./components/docops-step.js";
import { renderSelectedMarkdown } from "./render.js";
import { getSelection, setSelection } from "./selection.js";

let WS_AVAILABLE = false;
async function loadConfigAndPopulate() {
  const cfg = await getConfig();
  (document.getElementById("dir") as HTMLInputElement).value = cfg.dir || "";
  (document.getElementById("collection") as HTMLInputElement).value =
    cfg.collection || "";
  WS_AVAILABLE = !!cfg.ws;
}

async function populateDocList() {
  const dir = (document.getElementById("dir") as HTMLInputElement).value;
  const xs = await getDocs(dir);
  const sel = document.getElementById("doclist") as HTMLSelectElement;
  sel.innerHTML = "";
  for (const d of xs) {
    const opt = document.createElement("option");
    opt.value = d.uuid;
    opt.textContent = `[${d.uuid.slice(0, 8)}] ${d.title || ""} — ${d.path}`;
    sel.appendChild(opt);
  }
}

(document.getElementById("refresh") as HTMLButtonElement).onclick =
  async () => {
    await populateDocList();
    const ft =
      (document.getElementById("fileTree") as any) ||
      (document.querySelector("file-tree") as any);
    if (ft && ft.refresh) ft.refresh();
  };

document.addEventListener("DOMContentLoaded", async () => {
  await loadConfigAndPopulate();
  await populateDocList();
});

(document.getElementById("preview") as HTMLButtonElement).onclick =
  async () => {
    const dir = (document.getElementById("dir") as HTMLInputElement).value;
    const files = getSelection();
    const docT = (document.getElementById("docT") as HTMLInputElement).value;
    const refT = (document.getElementById("refT") as HTMLInputElement).value;
    let url = `/api/preview?dir=${encodeURIComponent(
      dir,
    )}&docT=${docT}&refT=${refT}`;
    if (files && files.length) {
      url += "&file=" + encodeURIComponent(files[0]!);
    } else {
      const uuid = (document.getElementById("doclist") as HTMLSelectElement)
        .value;
      if (!uuid) {
        (document.getElementById("out") as HTMLElement).textContent =
          "(no file selected — select a file in the explorer or choose a doc above)";
        return;
      }
      url += "&uuid=" + encodeURIComponent(uuid);
    }
    const r = await fetch(url);
    const j = await r.json();
    (document.getElementById("out") as HTMLElement).textContent =
      JSON.stringify(j, null, 2);
  };

// Run Pipeline to include selected files
(document.getElementById("run") as HTMLButtonElement).onclick = async () => {
  const dir = (document.getElementById("dir") as HTMLInputElement).value;
  const collection = (document.getElementById("collection") as HTMLInputElement)
    .value;
  const docT = (document.getElementById("docT") as HTMLInputElement).value;
  const refT = (document.getElementById("refT") as HTMLInputElement).value;
  const logs = document.getElementById("logs")!;
  const prog = document.getElementById(
    "overallProgress",
  ) as HTMLProgressElement;
  const progText = document.getElementById("progressText")!;
  logs.textContent = "";
  const files = getSelection();
  if (!files.length) {
    logs.textContent =
      "Select one or more files in the explorer to run the pipeline.";
    return;
  }
  const startRes = await fetch("/api/run-start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dir, collection, docT, refT, files }),
  });
  if (!startRes.ok) {
    const err = await startRes.json().catch(() => ({}));
    logs.textContent = `Failed to start: ${
      (err as any).error || startRes.statusText
    }`;
    return;
  }
  const { token, ws } = await startRes.json();
  const url = "/api/run?token=" + encodeURIComponent(token);
  const wsProto = location.protocol === "https:" ? "wss" : "ws";
  const wsUrl = `${wsProto}://${
    location.host
  }/ws/run?token=${encodeURIComponent(token)}`;
  const refreshFiles = () => {
    try {
      setSelection([]);
    } catch {}
    const ft =
      (document.getElementById("fileTree") as any) ||
      (document.querySelector("file-tree") as any);
    if (ft && ft.refresh) ft.refresh();
    populateDocList();
  };
  const handleLine = (line: string) => {
    if ((line || "").startsWith("PROGRESS ")) {
      try {
        const p = JSON.parse(String(line).slice(9));
        if (p.percent != null) {
          prog.value = Math.max(0, Math.min(100, p.percent));
          (progText as any).textContent = `${
            p.percent.toFixed ? p.percent.toFixed(0) : p.percent
          }% ${p.message || ""}`;
        } else if (p.index != null && p.of != null) {
          const pc = Math.round((p.index / p.of) * 100);
          prog.value = pc;
          (progText as any).textContent = `Step ${p.index}/${p.of} ${
            p.step || ""
          }`;
          if ((p.step || "").toLowerCase() === "rename") refreshFiles();
        }
      } catch {}
    } else {
      logs.textContent += line + "\n";
      logs.scrollTop = logs.scrollHeight;
      if (/\brename\b/i.test(line) || /^Done\.?$/.test(line.trim()))
        refreshFiles();
    }
  };
  const startSSE = () => {
    const es = new EventSource(url);
    es.onmessage = (ev) => handleLine(String((ev as MessageEvent).data || ""));
    es.onerror = () => es.close();
  };
  if (WS_AVAILABLE && ws) {
    try {
      const wsock = new WebSocket(wsUrl);
      let opened = false;
      wsock.onopen = () => {
        opened = true;
      };
      wsock.onmessage = (ev) =>
        handleLine(String((ev as MessageEvent).data || ""));
      wsock.onerror = () => {
        try {
          wsock.close();
        } catch {}
        startSSE();
      };
      setTimeout(() => {
        if (!opened) {
          try {
            wsock.close();
          } catch {}
          startSSE();
        }
      }, 250);
    } catch {
      startSSE();
    }
  } else {
    startSSE();
  }
};

(document.getElementById("renderMd") as HTMLButtonElement).onclick =
  renderSelectedMarkdown;

// Chunks panel (same logic preserved)
async function loadChunksForSelected() {
  const files = getSelection();
  const list = document.getElementById("chunksList");
  const meta = document.getElementById("chunkMeta");
  const text = document.getElementById("chunkText");
  const hitsBox = document.getElementById("chunkHits");
  if (!files.length) {
    if (list) list.innerHTML = "<em>Select a file to load chunks.</em>";
    if (meta) meta.textContent = "";
    if (text) text.textContent = "(no chunk)";
    if (hitsBox) hitsBox.innerHTML = "<em>No chunk selected.</em>";
    return;
  }
  const dir = (document.getElementById("dir") as HTMLInputElement).value || "";
  const file = files[0]!;
  if (list) list.innerHTML = "<em>Loading…</em>";
  try {
    const res = await getChunks({ dir, file });
    const items = res.items || [];
    if (!items.length) {
      (list as any).innerHTML =
        '<em>No chunks found. Run "Embed" step first.</em>';
      return;
    }
    const ul = document.createElement("ul");
    ul.style.paddingLeft = "16px";
    items.forEach((c: any, idx: number) => {
      const li = document.createElement("li");
      const title = c.title ? ` — ${c.title}` : "";
      li.textContent = `#${idx} [${c.kind}] L${c.startLine}-${c.endLine}${title}`;
      li.style.cursor = "pointer";
      li.addEventListener("click", async () => {
        if (meta)
          meta.textContent = `id: ${c.id} | lines: ${c.startLine}:${
            c.startCol
          } - ${c.endLine}:${c.endCol} | chars: ${c.text ? c.text.length : 0}`;
        if (text) (text as any).textContent = c.text || "";
        if (hitsBox) (hitsBox as any).innerHTML = "<em>Loading…</em>";
        try {
          const hits = await getChunkHits(c.id);
          const ul2 = document.createElement("ul");
          ul2.style.paddingLeft = "16px";
          (hits.items || []).forEach((h: any) => {
            const li2 = document.createElement("li");
            li2.textContent = `${
              h.score?.toFixed ? h.score.toFixed(3) : h.score
            } — ${h.title || h.docUuid} @ ${h.startLine}:${h.startCol}`;
            ul2.appendChild(li2);
          });
          (hitsBox as any).innerHTML = "";
          hitsBox?.appendChild(ul2);
        } catch (e: any) {
          (hitsBox as any).textContent = String(e?.message || e);
        }
      });
      ul.appendChild(li);
    });
    (list as any).innerHTML = "";
    list?.appendChild(ul);
  } catch (e: any) {
    (list as any).innerHTML = `<em>${String(e?.message || e)}</em>`;
  }
}

// Wire clicks for chunks panel assets
document.addEventListener("DOMContentLoaded", () => {
  const side = document.getElementById("fileTree");
  if (side)
    (side as any).addEventListener?.(
      "docops:selection-changed",
      loadChunksForSelected,
    );
  window.addEventListener(
    "docops:selection-changed",
    loadChunksForSelected as any,
  );
  const rBtn = document.getElementById("refresh");
  rBtn?.addEventListener("click", loadChunksForSelected);
  // Search wiring
  (
    document.getElementById("searchBtn") as HTMLButtonElement | null
  )?.addEventListener("click", async () => {
    const q =
      (document.getElementById("searchTerm") as HTMLInputElement | null)
        ?.value || "";
    const k =
      Number(
        (document.getElementById("searchK") as HTMLInputElement | null)
          ?.value || "10",
      ) || 10;
    const collection =
      (document.getElementById("collection") as HTMLInputElement | null)
        ?.value || "";
    const box = document.getElementById("searchResults");
    if (!box) return;
    if (!q.trim()) {
      box.innerHTML = "<em>Enter a query to search.</em>";
      return;
    }
    box.innerHTML = "<em>Searching…</em>";
    try {
      const res = await searchSemantic(q, collection, k);
      const ul = document.createElement("ul");
      ul.style.paddingLeft = "16px";
      (res.items || []).forEach((it: any) => {
        const li = document.createElement("li");
        const sc = it.score ?? 0;
        li.textContent = `${(sc as any).toFixed ? sc.toFixed(3) : sc} — ${
          it.title || it.docUuid
        } (${it.path || ""})`;
        ul.appendChild(li);
      });
      box.innerHTML = "";
      box.appendChild(ul);
    } catch (e: any) {
      box.innerHTML = `<em>${String(e?.message || e)}</em>`;
    }
  });
  // Status wiring
  (
    document.getElementById("statusRefresh") as HTMLButtonElement | null
  )?.addEventListener("click", async () => {
    const dir =
      (document.getElementById("dir") as HTMLInputElement | null)?.value || "";
    const onlyIncomplete =
      (
        document.getElementById(
          "statusOnlyIncomplete",
        ) as HTMLInputElement | null
      )?.checked || false;
    const box = document.getElementById("statusTable");
    if (!box) return;
    box.innerHTML = "<em>Loading…</em>";
    try {
      const res = await getStatus(dir, { limit: 200, page: 1, onlyIncomplete });
      const items = res.items || [];
      if (!items.length) {
        box.innerHTML = "<em>No documents found.</em>";
        return;
      }
      const tbl = document.createElement("table");
      (tbl.style as any).width = "100%";
      (tbl.style as any).fontSize = "12px";
      const thead = document.createElement("thead");
      thead.innerHTML =
        '<tr><th align="left">Title</th><th>Front</th><th>Embed</th><th>Query</th><th>Relations</th><th>Footers</th></tr>';
      const tbody = document.createElement("tbody");
      items.forEach((it: any) => {
        const tr = document.createElement("tr");
        const emOK = `${it.embed?.fingerprints || 0}/${it.embed?.chunks || 0}`;
        const qOK = `${it.query?.withHits || 0}/${it.query?.of || 0}`;
        tr.innerHTML = `<td>${it.title || it.path}</td><td>${
          it.frontmatter?.done ? "✔" : "✖"
        }</td><td>${emOK}</td><td>${qOK}</td><td>${
          it.relations?.present ? "✔" : "✖"
        }</td><td>${it.footers?.present ? "✔" : "✖"}</td>`;
        tbody.appendChild(tr);
      });
      tbl.appendChild(thead);
      tbl.appendChild(tbody);
      box.innerHTML = "";
      box.appendChild(tbl);
    } catch (e: any) {
      box.innerHTML = `<em>${String(e?.message || e)}</em>`;
    }
  });
});
