import {
  getConfig,
  getDocs,
  searchSemantic,
  getChunks,
  getChunkHits,
  getStatus,
} from "./js/api.js";
import "./js/components/docops-step.js";
import "./js/components/file-tree.js";
import { renderSelectedMarkdown } from "./js/render.js";
import { getSelection } from "./js/selection.js";
import { setSelection } from "./js/selection.js";

async function loadConfigAndPopulate() {
  const cfg = await getConfig();
  document.getElementById("dir").value = cfg.dir || "";
  document.getElementById("collection").value = cfg.collection || "";
}

async function populateDocList() {
  const dir = document.getElementById("dir").value;
  const xs = await getDocs(dir);
  const sel = document.getElementById("doclist");
  sel.innerHTML = "";
  for (const d of xs) {
    const opt = document.createElement("option");
    opt.value = d.uuid;
    opt.textContent =
      "[" + d.uuid.slice(0, 8) + "] " + (d.title || "") + " — " + d.path;
    sel.appendChild(opt);
  }
}

document.getElementById("refresh").onclick = async () => {
  await populateDocList();
  const ft =
    document.getElementById("fileTree") || document.querySelector("file-tree");
  if (ft && ft.refresh) ft.refresh();
};

document.addEventListener("DOMContentLoaded", async () => {
  await loadConfigAndPopulate();
  await populateDocList();
});

document.getElementById("preview").onclick = async () => {
  const dir = document.getElementById("dir").value;
  const files = getSelection();
  const docT = document.getElementById("docT").value;
  const refT = document.getElementById("refT").value;
  let url =
    "/api/preview?dir=" +
    encodeURIComponent(dir) +
    "&docT=" +
    docT +
    "&refT=" +
    refT;
  if (files && files.length) {
    url += "&file=" + encodeURIComponent(files[0]);
  } else {
    const uuid = document.getElementById("doclist").value;
    if (!uuid) {
      document.getElementById("out").textContent =
        "(no file selected — select a file in the explorer or choose a doc above)";
      return;
    }
    url += "&uuid=" + encodeURIComponent(uuid);
  }
  const r = await fetch(url);
  const j = await r.json();
  document.getElementById("out").textContent = JSON.stringify(j, null, 2);
};

// Run Pipeline to include selected files
document.getElementById("run").onclick = async () => {
  const dir = document.getElementById("dir").value;
  const collection = document.getElementById("collection").value;
  const docT = document.getElementById("docT").value;
  const refT = document.getElementById("refT").value;
  const logs = document.getElementById("logs");
  const prog = document.getElementById("overallProgress");
  const progText = document.getElementById("progressText");
  logs.textContent = "";
  const files = getSelection();
  const url =
    "/api/run?dir=" +
    encodeURIComponent(dir) +
    "&collection=" +
    encodeURIComponent(collection) +
    "&docT=" +
    docT +
    "&refT=" +
    refT +
    (files.length ? "&files=" + encodeURIComponent(JSON.stringify(files)) : "");
  const es = new EventSource(url);
  const refreshFiles = () => {
    try {
      setSelection([]);
    } catch {}
    const ft =
      document.getElementById("fileTree") ||
      document.querySelector("file-tree");
    if (ft && ft.refresh) ft.refresh();
    populateDocList();
  };
  es.onmessage = (ev) => {
    const line = ev.data || "";
    if (line.startsWith("PROGRESS ")) {
      try {
        const p = JSON.parse(line.slice(9));
        if (p.percent != null) {
          prog.value = Math.max(0, Math.min(100, p.percent));
          progText.textContent = `${
            p.percent.toFixed ? p.percent.toFixed(0) : p.percent
          }% ${p.message || ""}`;
        } else if (p.index != null && p.of != null) {
          const pc = Math.round((p.index / p.of) * 100);
          prog.value = pc;
          progText.textContent = `Step ${p.index}/${p.of} ${p.step || ""}`;
          if ((p.step || "").toLowerCase() === "rename") {
            // proactively refresh after rename progress
            refreshFiles();
          }
        }
      } catch {}
    } else {
      logs.textContent += line + "\n";
      logs.scrollTop = logs.scrollHeight;
      if (/\brename\b/i.test(line) || /^Done\.?$/.test(line.trim())) {
        refreshFiles();
      }
    }
  };
  es.onerror = () => {
    es.close();
  };
};

document.getElementById("renderMd").onclick = renderSelectedMarkdown;

// Chunks panel
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
  const dir = document.getElementById("dir").value || "";
  const file = files[0];
  if (list) list.innerHTML = "<em>Loading…</em>";
  try {
    const res = await getChunks({ dir, file });
    const items = res.items || [];
    if (!items.length) {
      list.innerHTML = '<em>No chunks found. Run "Embed" step first.</em>';
      return;
    }
    const ul = document.createElement("ul");
    ul.style.paddingLeft = "16px";
    items.forEach((c, idx) => {
      const li = document.createElement("li");
      const title = c.title ? ` — ${c.title}` : "";
      li.textContent = `#${idx} [${c.kind}] L${c.startLine}-${c.endLine}${title}`;
      li.style.cursor = "pointer";
      li.addEventListener("click", async () => {
        if (meta)
          meta.textContent = `id: ${c.id} | lines: ${c.startLine}:${
            c.startCol
          } - ${c.endLine}:${c.endCol} | chars: ${c.text ? c.text.length : 0}`;
        if (text) text.textContent = c.text || "";
        if (hitsBox) {
          hitsBox.innerHTML = "<em>Loading hits…</em>";
          try {
            const h = await getChunkHits(c.id);
            const hs = h.items || [];
            if (!hs.length) {
              hitsBox.innerHTML = "<em>No related hits</em>";
              return;
            }
            const hul = document.createElement("ul");
            hul.style.paddingLeft = "16px";
            hs.forEach((r) => {
              const hli = document.createElement("li");
              const s =
                typeof r.score === "number"
                  ? r.score.toFixed(4)
                  : String(r.score);
              hli.textContent = `${r.title || r.path || r.docUuid} — ${s} @ L${
                r.startLine
              }`;
              hul.appendChild(hli);
            });
            hitsBox.innerHTML = "";
            hitsBox.appendChild(hul);
          } catch (e) {
            hitsBox.textContent = String(e);
          }
        }
      });
      ul.appendChild(li);
    });
    list.innerHTML = "";
    list.appendChild(ul);
  } catch (e) {
    list.textContent = String(e);
  }
}

window.addEventListener("docops:selection-changed", loadChunksForSelected);

// Search UI
const searchBtn = document.getElementById("searchBtn");
if (searchBtn) {
  searchBtn.addEventListener("click", async () => {
    const q = document.getElementById("searchTerm").value || "";
    const k = Number(document.getElementById("searchK").value || "10") || 10;
    const collection = document.getElementById("collection").value || "";
    const box = document.getElementById("searchResults");
    box.innerHTML = "<em>Searching…</em>";
    try {
      const res = await searchSemantic(q, collection, k);
      const items = res.items || [];
      if (!items.length) {
        box.innerHTML = "<em>No results</em>";
        return;
      }
      const ul = document.createElement("ul");
      ul.style.paddingLeft = "16px";
      items.forEach((it) => {
        const li = document.createElement("li");
        const score =
          typeof it.score === "number" ? it.score.toFixed(4) : String(it.score);
        li.textContent = `${it.title || it.path || it.docUuid} — ${score}`;
        ul.appendChild(li);
      });
      box.innerHTML = "";
      box.appendChild(ul);
    } catch (e) {
      box.textContent = String(e);
    }
  });
}

// Status table
async function runMissingForItem(it) {
  const steps = [];
  if (!it.frontmatter?.done) steps.push("frontmatter");
  const embedIncomplete =
    (it.embed?.fingerprints || 0) < (it.embed?.chunks || 0);
  if (embedIncomplete) steps.push("embed");
  const queryIncomplete = (it.query?.withHits || 0) < (it.query?.of || 0);
  if (queryIncomplete) steps.push("query");
  if (!it.relations?.present) steps.push("relations");
  if (!it.footers?.present) steps.push("footers");
  if (!steps.length) return;

  const dir = document.getElementById("dir").value || "";
  const logs = document.getElementById("logs");
  const fileParam = encodeURIComponent(JSON.stringify([it.path]));

  for (const step of steps) {
    logs.textContent += `Running step=${step} for ${it.path}\n`;
    const es = new EventSource(
      `/api/run-step?step=${step}&dir=${encodeURIComponent(
        dir,
      )}&files=${fileParam}`,
    );
    await new Promise((resolve) => {
      es.onmessage = (ev) => {
        const line = ev.data || "";
        logs.textContent += line + "\n";
        logs.scrollTop = logs.scrollHeight;
        if (/completed/i.test(line)) {
          es.close();
          resolve(null);
        }
      };
      es.onerror = () => {
        es.close();
        resolve(null);
      };
    });
  }
  await loadStatus();
}

function colorizeCell(el, ok) {
  el.style.fontWeight = "600";
  el.style.color = ok ? "#0a7a2a" : "#a30e0e";
}

async function loadStatus() {
  const dir = document.getElementById("dir").value || "";
  const onlyIncomplete = !!document.getElementById("statusOnlyIncomplete")
    ?.checked;
  const box = document.getElementById("statusTable");
  box.innerHTML = "<em>Loading…</em>";
  try {
    const res = await getStatus(dir);
    let items = res.items || [];
    if (onlyIncomplete) {
      items = items.filter((it) => {
        const embedIncomplete =
          (it.embed?.fingerprints || 0) < (it.embed?.chunks || 0);
        const queryIncomplete = (it.query?.withHits || 0) < (it.query?.of || 0);
        return (
          !it.frontmatter?.done ||
          embedIncomplete ||
          queryIncomplete ||
          !it.relations?.present ||
          !it.footers?.present
        );
      });
    }
    if (!items.length) {
      box.innerHTML = "<em>No docs found</em>";
      return;
    }
    const tbl = document.createElement("table");
    tbl.style.width = "100%";
    tbl.style.borderCollapse = "collapse";
    const head = document.createElement("tr");
    [
      "File",
      "Front",
      "Embed",
      "Query",
      "Relations",
      "Footers",
      "Actions",
    ].forEach((h) => {
      const th = document.createElement("th");
      th.textContent = h;
      th.style.textAlign = "left";
      th.style.borderBottom = "1px solid #ddd";
      th.style.padding = "4px";
      head.appendChild(th);
    });
    tbl.appendChild(head);
    items.forEach((it) => {
      const tr = document.createElement("tr");
      const pct = (a, b) => (b > 0 ? ((a / b) * 100).toFixed(0) + "%" : "0%");
      const td = (s) => {
        const el = document.createElement("td");
        el.style.padding = "4px";
        el.style.borderBottom = "1px solid #f0f0f0";
        el.textContent = s;
        return el;
      };

      const fileTd = td(it.path);
      fileTd.style.cursor = "pointer";
      fileTd.style.color = "#0366d6";
      fileTd.addEventListener("click", () => {
        try {
          setSelection([it.path]);
        } catch {}
        renderSelectedMarkdown();
      });
      tr.appendChild(fileTd);

      const frontTd = td(it.frontmatter?.done ? "yes" : "no");
      colorizeCell(frontTd, !!it.frontmatter?.done);
      tr.appendChild(frontTd);

      const embedOk =
        (it.embed?.fingerprints || 0) >= (it.embed?.chunks || 0) &&
        (it.embed?.chunks || 0) > 0;
      const embedTd = td(
        `${it.embed?.fingerprints || 0}/${it.embed?.chunks || 0} (${pct(
          it.embed?.fingerprints || 0,
          it.embed?.chunks || 0,
        )})`,
      );
      colorizeCell(embedTd, embedOk);
      tr.appendChild(embedTd);

      const queryOk =
        (it.query?.withHits || 0) >= (it.query?.of || 0) &&
        (it.query?.of || 0) > 0;
      const queryTd = td(
        `${it.query?.withHits || 0}/${it.query?.of || 0} (${pct(
          it.query?.withHits || 0,
          it.query?.of || 0,
        )})`,
      );
      colorizeCell(queryTd, queryOk);
      tr.appendChild(queryTd);

      const relTd = td(
        it.relations?.present
          ? `${it.relations.related || 0} rel | ${it.relations.refs || 0} refs`
          : "no",
      );
      colorizeCell(relTd, !!it.relations?.present);
      tr.appendChild(relTd);

      const footTd = td(it.footers?.present ? "yes" : "no");
      colorizeCell(footTd, !!it.footers?.present);
      tr.appendChild(footTd);

      const actTd = document.createElement("td");
      actTd.style.padding = "4px";
      actTd.style.borderBottom = "1px solid #f0f0f0";
      const btn = document.createElement("button");
      btn.textContent = "Run Missing";
      btn.onclick = () => runMissingForItem(it);
      actTd.appendChild(btn);
      tr.appendChild(actTd);

      tbl.appendChild(tr);
    });
    box.innerHTML = "";
    box.appendChild(tbl);
  } catch (e) {
    box.textContent = String(e);
  }
}

const statusBtn = document.getElementById("statusRefresh");
if (statusBtn) statusBtn.addEventListener("click", loadStatus);
document
  .getElementById("statusOnlyIncomplete")
  ?.addEventListener("change", loadStatus);
window.addEventListener("docops:fs-changed", loadStatus);

// Keep file explorer and docs list in sync with top-level dir
document.addEventListener("DOMContentLoaded", async () => {
  const refreshFT = () => {
    const ft =
      document.getElementById("fileTree") ||
      document.querySelector("file-tree");
    if (ft && ft.refresh) ft.refresh();
  };
  refreshFT();
  const dirInput = document.getElementById("dir");
  if (dirInput)
    dirInput.addEventListener("change", () => {
      populateDocList();
      refreshFT();
      loadStatus();
    });
  // initial status
  loadStatus();
});
