import { getConfig, getDocs } from './js/api.js';
import './js/components/docops-step.js';
import './js/components/file-tree.js';
import { renderSelectedMarkdown } from './js/render.js';
import { getSelection } from './js/selection.js';

async function loadConfigAndPopulate() {
  const cfg = await getConfig();
  document.getElementById('dir').value = cfg.dir || '';
  document.getElementById('collection').value = cfg.collection || '';
}

async function populateDocList() {
  const dir = document.getElementById('dir').value;
  const xs = await getDocs(dir);
  const sel = document.getElementById('doclist');
  sel.innerHTML = '';
  for (const d of xs) {
    const opt = document.createElement('option');
    opt.value = d.uuid;
    opt.textContent = '[' + d.uuid.slice(0,8) + '] ' + (d.title||'') + ' — ' + d.path;
    sel.appendChild(opt);
  }
}

document.getElementById('refresh').onclick = async () => {
  await populateDocList();
  const ft = document.getElementById('fileTree') || document.querySelector('file-tree');
  if (ft && ft.refresh) ft.refresh();
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadConfigAndPopulate();
  await populateDocList();
});

document.getElementById('preview').onclick = async () => {
  const dir = document.getElementById('dir').value;
  const files = getSelection();
  const docT = document.getElementById('docT').value;
  const refT = document.getElementById('refT').value;
  let url = '/api/preview?dir=' + encodeURIComponent(dir) + '&docT=' + docT + '&refT=' + refT;
  if (files && files.length) {
    url += '&file=' + encodeURIComponent(files[0]);
  } else {
    const uuid = document.getElementById('doclist').value;
    if (!uuid) {
      document.getElementById('out').textContent = '(no file selected — select a file in the explorer or choose a doc above)';
      return;
    }
    url += '&uuid=' + encodeURIComponent(uuid);
  }
  const r = await fetch(url);
  const j = await r.json();
  document.getElementById('out').textContent = JSON.stringify(j, null, 2);
};

// Run Pipeline to include selected files
document.getElementById('run').onclick = async () => {
  const dir = document.getElementById('dir').value;
  const collection = document.getElementById('collection').value;
  const docT = document.getElementById('docT').value;
  const refT = document.getElementById('refT').value;
  const logs = document.getElementById('logs');
  const prog = document.getElementById('overallProgress');
  const progText = document.getElementById('progressText');
  logs.textContent = '';
  const files = getSelection();
  const url = '/api/run?dir='+encodeURIComponent(dir)+'&collection='+encodeURIComponent(collection)+'&docT='+docT+'&refT='+refT + (files.length ? '&files='+encodeURIComponent(JSON.stringify(files)) : '');
  const es = new EventSource(url);
  es.onmessage = (ev) => {
    const line = ev.data || '';
    if (line.startsWith('PROGRESS ')) {
      try {
        const p = JSON.parse(line.slice(9));
        if (p.percent != null) {
          prog.value = Math.max(0, Math.min(100, p.percent));
          progText.textContent = `${p.percent.toFixed ? p.percent.toFixed(0) : p.percent}% ${p.message||''}`;
        } else if (p.index != null && p.of != null) {
          const pc = Math.round((p.index / p.of) * 100);
          prog.value = pc; progText.textContent = `Step ${p.index}/${p.of} ${p.step||''}`;
        }
      } catch {}
    } else {
      logs.textContent += line + '\n'; logs.scrollTop = logs.scrollHeight;
    }
  };
  es.onerror = () => { es.close(); };
};

document.getElementById('renderMd').onclick = renderSelectedMarkdown;

// Keep file explorer and docs list in sync with top-level dir
document.addEventListener('DOMContentLoaded', async () => {
  const refreshFT = () => {
    const ft = document.getElementById('fileTree') || document.querySelector('file-tree');
    if (ft && ft.refresh) ft.refresh();
  };
  refreshFT();
  const dirInput = document.getElementById('dir');
  if (dirInput) dirInput.addEventListener('change', () => { populateDocList(); refreshFT(); });
});
