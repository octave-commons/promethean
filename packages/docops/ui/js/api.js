// Lightweight fetch helpers for DocOps UI

export async function getConfig() {
  const r = await fetch('/api/config');
  if (!r.ok) throw new Error(`config: ${r.status} ${r.statusText}`);
  return r.json();
}

export async function getDocs(dir) {
  const r = await fetch('/api/docs?dir=' + encodeURIComponent(dir || ''));
  if (!r.ok) throw new Error(`docs: ${r.status} ${r.statusText}`);
  return r.json();
}

export async function getFiles(dir) {
  const r = await fetch('/api/files?dir=' + encodeURIComponent(dir || ''));
  if (!r.ok) throw new Error(`files: ${r.status} ${r.statusText}`);
  return r.json();
}

export async function readFileText(dir, file) {
  const r = await fetch('/api/read?dir=' + encodeURIComponent(dir || '') + '&file=' + encodeURIComponent(file || ''));
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(err.error || r.statusText);
  }
  return r.text();
}
