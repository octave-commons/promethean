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

export async function getChunks({ dir, file, uuid }) {
  const params = new URLSearchParams();
  if (dir) params.set('dir', dir);
  if (file) params.set('file', file);
  if (uuid) params.set('uuid', uuid);
  const r = await fetch('/api/chunks?' + params.toString());
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(err.error || r.statusText);
  }
  return r.json();
}

export async function getChunkHits(id) {
  const params = new URLSearchParams({ id });
  const r = await fetch('/api/chunk-hits?' + params.toString());
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(err.error || r.statusText);
  }
  return r.json();
}

export async function searchSemantic(q, collection, k = 10) {
  const params = new URLSearchParams({ q: q || '', collection: collection || '', k: String(k || 10) });
  const r = await fetch('/api/search?' + params.toString());
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(err.error || r.statusText);
  }
  return r.json();
}

export async function getStatus(dir) {
  const params = new URLSearchParams();
  if (dir) params.set('dir', dir);
  const r = await fetch('/api/status?' + params.toString());
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(err.error || r.statusText);
  }
  return r.json();
}
