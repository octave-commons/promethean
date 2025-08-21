const $ = (sel) => document.querySelector(sel);
const byId = (id) => document.getElementById(id);

let authCookieName = 'smartgpt_auth';
const auth = {
    get token() {
        return localStorage.getItem('bridgeToken') || '';
    },
    set token(v) {
        v ? localStorage.setItem('bridgeToken', v) : localStorage.removeItem('bridgeToken');
    },
    setCookie(v) {
        if (!v) return;
        // SameSite=Lax so EventSource on same-origin includes cookie; avoid Secure to support http dev
        document.cookie = `${encodeURIComponent(authCookieName)}=${encodeURIComponent(
            v,
        )}; Path=/; SameSite=Lax`;
    },
    clearCookie() {
        document.cookie = `${encodeURIComponent(authCookieName)}=; Path=/; Max-Age=0`;
    },
};

async function api(path, opts = {}) {
    const headers = opts.headers ? { ...opts.headers } : {};
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`;
    if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    const res = await fetch(path, { ...opts, headers });
    if (res.status === 401) throw new Error('unauthorized');
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return await res.json();
    return await res.text();
}

function setPill(el, state, text) {
    el.classList.remove('ok', 'bad', 'warn');
    if (state) el.classList.add(state);
    el.textContent = text;
}

async function refreshAuth() {
    const pill = byId('auth-indicator');
    try {
        const r = await api('/auth/me');
        if (r && r.cookie) authCookieName = r.cookie;
        setPill(pill, 'ok', r?.auth ? 'auth: on' : 'auth: off');
        if (r?.auth && auth.token) auth.setCookie(auth.token);
    } catch (e) {
        setPill(pill, 'bad', 'auth: required');
    }
}

async function refreshConn() {
    const pill = byId('conn-status');
    try {
        const r = await api('/indexer/status');
        setPill(pill, 'ok', 'connected');
        renderIndexer(r?.status || {});
    } catch {
        setPill(pill, 'bad', 'disconnected');
    }
}

function renderIndexer(st) {
    const el = byId('indexer-status');
    el.textContent = JSON.stringify(st, null, 2);
}

async function reindexAll() {
    byId('btn-reindex-all').disabled = true;
    try {
        await api('/reindex', { method: 'POST' });
        await refreshConn();
    } finally {
        byId('btn-reindex-all').disabled = false;
    }
}

async function reindexGlob() {
    const g = byId('glob-input').value.trim();
    if (!g) return;
    byId('btn-reindex-glob').disabled = true;
    try {
        await api('/files/reindex', { method: 'POST', body: JSON.stringify({ path: g }) });
        await refreshConn();
    } finally {
        byId('btn-reindex-glob').disabled = false;
    }
}

async function doSearch() {
    const q = byId('search-q').value.trim();
    const n = Number(byId('search-n').value || 8);
    if (!q) return;
    const out = await api('/search', { method: 'POST', body: JSON.stringify({ q, n }) });
    const results = out?.results || [];
    const holder = byId('search-results');
    holder.innerHTML = '';
    for (const item of results) {
        const t = byId('result-item').content.cloneNode(true);
        t.querySelector('.path').textContent = `${item.path}:${item.startLine}-${item.endLine}`;
        t.querySelector('.snippet').textContent = item.text;
        holder.appendChild(t);
    }
}

// (removed legacy refreshAgents for single-select UI)

// Multi-agent support
const sessions = new Map(); // key: mode:id -> { mode, id, el, close(), write(), sse?, poll? }

function agentKey(mode, id) {
    return `${mode}:${id}`;
}

async function fetchAgents() {
    const [a, p] = await Promise.all([
        api('/agent/list').catch(() => ({ agents: [] })),
        api('/pty/list').catch(() => ({ agents: [] })),
    ]);
    const normal = (a.agents || []).map((x) => ({ ...x, mode: 'agent' }));
    const pty = (p.agents || []).map((x) => ({ ...x, mode: 'pty' }));
    return [...normal, ...pty];
}

function renderAgents(list) {
    const holder = byId('agents-list');
    holder.innerHTML = '';
    const tpl = byId('agent-item');
    const watching = new Set(sessions.keys());
    for (const a of list) {
        const el = tpl.content.cloneNode(true);
        el.querySelector('.id').textContent = `${a.mode}:${a.id}`;
        const meta = [];
        if (a.exited) meta.push('exited');
        if (a.code !== undefined && a.code !== null) meta.push(`code ${a.code}`);
        meta.push(a.bytes + ' bytes');
        if (a.startedAt) meta.push(new Date(a.startedAt).toLocaleString());
        el.querySelector('.meta').textContent = meta.join(' • ');
        const key = agentKey(a.mode, a.id);
        const watchBtn = el.querySelector('.watch');
        const unwatchBtn = el.querySelector('.unwatch');
        const isWatching = watching.has(key);
        watchBtn.style.display = isWatching ? 'none' : '';
        unwatchBtn.style.display = isWatching ? '' : 'none';
        watchBtn.onclick = () => openSession(a.mode, a.id);
        unwatchBtn.onclick = () => closeSession(a.mode, a.id);
        holder.appendChild(el);
    }
}

function openSession(mode, id) {
    const key = agentKey(mode, id);
    if (sessions.has(key)) return;
    const sHolder = byId('agent-sessions');
    const tpl = byId('session-panel');
    const el = tpl.content.cloneNode(true);
    const panel = el.querySelector('.panel');
    const logs = el.querySelector('.logs');
    el.querySelector('.title').textContent = `${mode}:${id}`;
    // controls
    const closeBtn = el.querySelector('.close');
    const sendBtn = el.querySelector('.send');
    const stdin = el.querySelector('.stdin');
    const killBtn = el.querySelector('.kill');
    const resumeBtn = el.querySelector('.resume');
    const interruptBtn = el.querySelector('.interrupt');
    sHolder.appendChild(el);

    const supportsSSE = !byId('auth-indicator').textContent.includes('required');
    let sse = null;
    let stopped = false;
    let last = 0;
    const streamPath = mode === 'pty' ? '/pty/stream' : '/agent/stream';
    const logsPath = mode === 'pty' ? '/pty/logs' : '/agent/logs';
    const sendPath = mode === 'pty' ? '/pty/send' : '/agent/send';
    const killPath = mode === 'pty' ? '/pty/kill' : '/agent/kill';
    const resumePath = mode === 'pty' ? '/pty/resume' : '/agent/resume';
    const interruptPath = mode === 'pty' ? '/pty/interrupt' : '/agent/interrupt';

    function append(text) {
        logs.textContent += text;
        logs.scrollTop = logs.scrollHeight;
    }

    if (supportsSSE) {
        let usingSSE = true;
        sse = new EventSource(`${streamPath}?id=${encodeURIComponent(id)}`);
        sse.addEventListener('replay', (e) => {
            const data = JSON.parse(e.data || '{}');
            append(data.text || '');
        });
        for (const evt of ['stdout', 'stderr']) {
            sse.addEventListener(evt, (e) => {
                const data = JSON.parse(e.data || '{}');
                append(data.text || '');
            });
        }
        const startPolling = () => {
            usingSSE = false;
            if (sse)
                try {
                    sse.close();
                } catch {}
            // basic polling fallback
            const poll = async () => {
                if (stopped || usingSSE) return;
                try {
                    const r = await api(`${logsPath}?id=${encodeURIComponent(id)}&since=${last}`);
                    if (r && r.chunk) {
                        append(r.chunk);
                        last = r.total || last;
                    }
                } catch {}
                setTimeout(poll, 1000);
            };
            poll();
        };
        sse.onerror = () => {
            if (usingSSE) startPolling();
        };
    } else {
        const tick = async () => {
            if (stopped) return;
            try {
                const r = await api(`${logsPath}?id=${encodeURIComponent(id)}&since=${last}`);
                if (r && r.chunk) {
                    append(r.chunk);
                    last = r.total || last;
                }
            } catch {}
            setTimeout(tick, 1000);
        };
        tick();
    }

    // wire controls
    closeBtn.onclick = () => closeSession(mode, id);
    sendBtn.onclick = async () => {
        const val = stdin.value;
        if (!val) return;
        await api(sendPath, { method: 'POST', body: JSON.stringify({ id, input: val }) });
        stdin.value = '';
    };
    killBtn.onclick = async () => {
        await api(killPath, { method: 'POST', body: JSON.stringify({ id, force: true }) });
    };
    resumeBtn.onclick = async () => {
        await api(resumePath, { method: 'POST', body: JSON.stringify({ id }) });
    };
    interruptBtn.onclick = async () => {
        await api(interruptPath, { method: 'POST', body: JSON.stringify({ id }) });
    };

    const session = {
        mode,
        id,
        el: panel,
        close: () => {
            stopped = true;
            if (sse) sse.close();
            panel.remove();
            sessions.delete(key);
            refreshAgentsListOnly();
        },
    };
    sessions.set(key, session);
    refreshAgentsListOnly();
}

function closeSession(mode, id) {
    const key = agentKey(mode, id);
    const s = sessions.get(key);
    if (!s) return;
    s.close();
}

async function agentStart() {
    const prompt = byId('agent-prompt').value;
    const tty = byId('agent-tty').checked;
    const pty = byId('agent-pty').checked;
    const path = pty ? '/pty/start' : '/agent/start';
    const body = pty ? { prompt, cols: 120, rows: 32 } : { prompt, tty };
    const r = await api(path, { method: 'POST', body: JSON.stringify(body) });
    await refreshAgents();
    openSession(pty ? 'pty' : 'agent', r?.id);
}

async function refreshAgents() {
    const list = await fetchAgents();
    renderAgents(list);
}
async function refreshAgentsListOnly() {
    const list = await fetchAgents();
    renderAgents(list);
}

function bindUI() {
    byId('save-token').onclick = () => {
        auth.token = byId('auth-token').value.trim();
        auth.setCookie(auth.token);
        refreshAuth();
        refreshConn();
    };
    byId('clear-token').onclick = () => {
        auth.token = '';
        byId('auth-token').value = '';
        auth.clearCookie();
        refreshAuth();
        refreshConn();
    };

    byId('btn-reindex-all').onclick = reindexAll;
    byId('btn-reindex-glob').onclick = reindexGlob;
    byId('btn-search').onclick = doSearch;

    byId('btn-agent-start').onclick = agentStart;
    byId('btn-agents-refresh').onclick = refreshAgents;
}

async function init() {
    bindUI();
    byId('auth-token').value = auth.token;
    await refreshAuth();
    await refreshConn();
    await refreshAgents();
    setInterval(refreshConn, 3000);
}

init();
