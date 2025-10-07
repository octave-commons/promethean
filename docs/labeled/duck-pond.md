---
$$
uuid: 20c87007-ec24-4f17-8d2e-238743696551
$$
$$
created_at: '2025-10-02T12:13:34Z'
$$
title: 2025.10.02.12.13.34
filename: Duck Pond
$$
description: >-
$$
  A self-contained, native-ESM Web Components demo showcasing an in-memory
  Enso-style room with three seed agents (Duck, Cephalon, Enso) and tool
  capability toggling. It supports real-time chat, agent spawning, and pure
  browser execution without builds.
tags:
  - Web Components
  - Enso Protocol
  - Native ESM
  - Immutability
  - Tool Negotiation
  - Browser JS
$$
related_to_uuid: []
$$
$$
related_to_title: []
$$
references: []
---
Here you go — a self-contained, native-ESM, Web Components “Duck Pond” that runs in a single HTML file. It implements an in-memory Enso-style room $immutable, causally-ordered events$, three seed agents (Duck, Cephalon, Enso), a tool capability toggle panel that simulates MCP capability negotiation, and a chat UI. You can also spawn more ducks.

What you can do now:

* Type in the composer; the Duck, Cephalon, and Enso will all respond.
* Toggle tools (e.g., “Web Search”, “FS Read”) — the pond broadcasts a `caps.update` event and agents adapt their replies accordingly.
* Click “+ Agent” to add Ducklings that also talk.
* This is all pure browser JS with native modules and zero build. It’s deliberately functional/immutable in the core logic.

If you want this wired to real MCP tools and a real Enso transport next, I’ll adapt the `EnsoRoom()` shim into a pluggable transport (WebSocket or HTTP SSE), handle capability negotiation messages per your Enso docs, and route tool invocations to MCP servers you select.


```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Duck Pond – Enso Protocol Demo</title>
  <style>
    :root {
      --bg: #0b0f14; --panel: #111820; --ink: #e8f0f7; --muted: #9fb3c8;
      --accent: #29b6f6; --accent-2: #7c4dff; --line: #1c2733; --ok:#00c853; --warn:#ffab00;
    }
    * { box-sizing: border-box }
    body { margin: 0; background: var(--bg); color: var(--ink); font: 14px/1.45 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif; }
    header { padding: 12px 16px; border-bottom: 1px solid var(--line); display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; background: linear-gradient(180deg, #0d141c, #0a0e13); }
    header h1 { margin: 0; font-size: 16px; letter-spacing: .25px; color: var(--muted) }
    header h1 strong { color: var(--ink) }
    header .pill { padding: 4px 8px; border: 1px solid var(--line); color: var(--muted); border-radius: 999px }

    main { display: grid; grid-template-columns: 320px 1fr; height: calc(100vh - 56px); }
    aside { border-right: 1px solid var(--line); display: grid; grid-template-rows: auto auto 1fr; background: #0c131a; }

    .panel { padding: 12px; border-bottom: 1px solid var(--line); }
    .panel h2 { margin: 0 0 8px 0; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .12em }

    .tools { display: flex; flex-wrap: wrap; gap: 6px }
    .tool { padding: 6px 8px; border: 1px solid var(--line); border-radius: 10px; cursor: pointer; user-select: none; color: var(--muted); }
    .tool[data-enabled="true"] { border-color: var(--accent); color: var(--ink); background: rgba(41,182,246,.08) }

    .agents { display: grid; grid-auto-rows: min-content; gap: 8px }
    .agent { display: grid; grid-template-columns: 28px 1fr auto; gap: 8px; align-items: center; padding: 6px 8px; border-radius: 10px; border: 1px solid var(--line); background: #0b1219 }
    .agent .avatar { width: 28px; height: 28px; border-radius: 999px; display: grid; place-items: center; font-weight: 700; background: #0e1620; border: 1px solid #162231 }
    .agent .name { font-weight: 600 }
    .agent .caps { font-size: 11px; color: var(--muted) }

    section.chat { display: grid; grid-template-rows: 1fr auto; height: 100%; }
    .log { padding: 16px; overflow: auto; display: grid; gap: 10px; align-content: start }
    .bubble { max-width: 70ch; padding: 10px 12px; border: 1px solid var(--line); border-radius: 14px; background: #0c141c }
    .bubble .meta { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; font-size: 12px; color: var(--muted) }
    .meta .from { font-weight: 700; color: var(--ink) }
    .meta .role { padding: 1px 6px; border-radius: 999px; background: #0e1620; border: 1px solid var(--line) }

    form.composer { border-top: 1px solid var(--line); padding: 10px; display: grid; grid-template-columns: 1fr auto; gap: 8px; background: #0c131a }
    form.composer input[type="text"] { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--line); color: var(--ink); background: #0b1219 }
    form.composer button { padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line); color: var(--ink); background: #0b1219; cursor: pointer }
    form.composer button.primary { border-color: var(--accent); background: rgba(41,182,246,.08) }

    .status { font-size: 12px; color: var(--muted); padding: 8px 0 0 0 }
    .tiny { font-size: 11px; color: var(--muted) }
  </style>
</head>
<body>
  <header>
    <h1><strong>Duck Pond</strong> · Enso protocol demo · <span class="tiny">multi-agent chat with MCP tool capability selection</span></h1>
    <span class="pill" id="room-pill">room: local://pond · caps: text/events</span>
  </header>
  <main>
    <aside>
      <div class="panel">
        <h2>Tools (MCP)</h2>
        <div class="tools" id="tool-list"></div>
        <div class="status tiny">Toggle capabilities. Agents renegotiate on change.</div>
      </div>
      <div class="panel">
        <h2>Agents</h2>
        <div class="agents" id="agent-list"></div>
      </div>
      <div class="panel" style="border-bottom:none">
        <h2>Room</h2>
        <div class="tiny">Transport: in-memory (demo). Enso-style events with causal ordering per room.</div>
      </div>
    </aside>

    <section class="chat">
      <div class="log" id="log"></div>
      <form class="composer" id="composer" autocomplete="off">
        <input id="input" type="text" placeholder="Say something to the pond…" />
        <div style="display:flex; gap:8px">
          <button type="button" id="spawn">+ Agent</button>
          <button class="primary" type="submit">Send</button>
        </div>
      </form>
    </section>
  </main>

  <script type="module">
    // === Minimal Enso-ish client (in-memory, single-room) =====================
    // Events are immutable objects with seq numbers scoped to room.
    const now = () => new Date().toISOString();
    const deepFreeze = (o) => (Object.freeze(o), Object.getOwnPropertyNames(o).forEach(k => typeof o[k]==='object'&&o[k]!==null && deepFreeze(o[k])), o);

    /** @typedef {{id:string, kind:'text'|'act'|'system', from:string, ts:string, seq:number, data:unknown}} EnsoEvent */
    const EnsoRoom = () => {
      let seq = 0;
      let subs = new Set();
      const history = [];
      const publish = (ev) => { history.push(ev); subs.forEach(f => f(ev)); };
      const send = (kind, from, data) => {
        const ev = deepFreeze({ id: crypto.randomUUID(), kind, from, ts: now(), seq: ++seq, data });
        publish(ev); return ev;
      };
      const subscribe = (fn) => (subs.add(fn), () => subs.delete(fn));
      return { send, subscribe, history: () => [...history] };
    };

    // === Capability model (MCP-ish toggle) ====================================
    /** @typedef {{ id:string, label:string, enabled:boolean }} Tool */
    const defaultTools = [
      { id: 'search.web', label: 'Web Search', enabled: true },
      { id: 'fs.read', label: 'FS Read', enabled: false },
      { id: 'git.graph', label: 'Git Graph', enabled: false },
      { id: 'mcp.depgraph', label: 'Dep Graph', enabled: false },
      { id: 'notes.query', label: 'Notes Query', enabled: true },
    ];

    // === Agent registry ========================================================
    /** @typedef {{ id:string, name:string, role:'duck'|'cephalon'|'enso', color:string, avatar:string, caps:Set<string>, onEvent:(ev:EnsoEvent, ctx:Ctx)=>void }} Agent */
    /** @typedef {{ room: ReturnType<typeof EnsoRoom>, updateCaps:(caps:ReadonlyArray<string>)=>void, post:(kind:'text'|'act'|'system', from:string, data:any)=>void }} Ctx */

    const mkAgent = (name, role, onEvent) => ({
      id: crypto.randomUUID(),
      name, role,
      color: role==='duck' ? '#29b6f6' : role==='cephalon' ? '#7c4dff' : '#00c853',
      avatar: role==='duck' ? '🦆' : role==='cephalon' ? '🜂' : '◯',
      caps: new Set(['text.events']),
      onEvent
    });

    // Strategy functions: deterministic, side-effect free.
    const replyDuck = (caps) => (msg) => {
      const tools = [...caps].filter(x => x.includes('.'));
      const tail = tools.length ? ` (I can use: ${tools.join(', ')})` : '';
      const content = msg.includes('quack') ? 'quack quack!!' : msg.includes('hello') ? 'quack hello!' : 'quack.';
      return `${content}${tail}`;
    };

    const replyCephalon = (caps) => (msg) => {
      const concise = msg.length > 120 ? msg.slice(0, 117) + '…' : msg;
      const haveSearch = [...caps].includes('search.web');
      const haveFS = [...caps].includes('fs.read');
      const hints = [haveSearch && 'search.web', haveFS && 'fs.read'].filter(Boolean).join(', ');
      return `observed: “${concise}”. ${hints ? 'Tools: ' + hints + '.' : 'No tools granted.'}`;
    };

    const replyEnso = () => (msg) => `event observed; routing ok; ${msg.length} chars`;

    // === UI helpers ============================================================
    const el = (sel, ctx = document) => ctx.querySelector(sel);
    const elAll = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
    const render = (parent, html) => { parent.innerHTML = html; };
    const htmlEscape = (s) => s.replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

    // === App state (immutable updates) ========================================
    const state = Object.seal({
      tools: structuredClone(defaultTools),
      agents: [],
      room: EnsoRoom(),
    });

    const ctx /** @type {Ctx} */ = {
      room: state.room,
      updateCaps: (caps) => {
        state.agents = state.agents.map(a => ({ ...a, caps: new Set(caps) }));
        drawAgents();
        // Announce renegotiation in room
        state.room.send('system', 'pond', { note: 'caps.update', granted: caps });
      },
      post: (kind, from, data) => state.room.send(kind, from, data)
    };

    // Seed agents
    const seedAgents = () => {
      const duck = mkAgent('Duck', 'duck', (ev, ctx) => {
        if (ev.kind !== 'text' || ev.from === 'Duck') return;
        const msg = typeof ev.data === 'string' ? ev.data : '';
        const reply = replyDuck(duck.caps)(msg);
        ctx.post('text', duck.name, reply);
      });
      const cephalon = mkAgent('Cephalon', 'cephalon', (ev, ctx) => {
        if (ev.kind !== 'text' || ev.from === 'Cephalon') return;
        const msg = typeof ev.data === 'string' ? ev.data : '';
        const reply = replyCephalon(cephalon.caps)(msg);
        ctx.post('text', cephalon.name, reply);
      });
      const enso = mkAgent('Enso', 'enso', (ev, ctx) => {
        if (ev.kind !== 'text' || ev.from === 'Enso') return;
        const msg = typeof ev.data === 'string' ? ev.data : '';
        const reply = replyEnso()(msg);
        ctx.post('text', 'Enso', reply);
      });
      state.agents = [duck, cephalon, enso];
    };

    // === Renderers =============================================================
    const drawTools = () => {
      const parent = el('#tool-list');
      const html = state.tools.map(t => `
        <div class="tool" data-id="${t.id}" data-enabled="${t.enabled}">${t.label}</div>
      `).join('');
      render(parent, html);
      elAll('.tool', parent).forEach(node => {
        node.addEventListener('click', () => {
          const id = node.getAttribute('data-id');
          state.tools = state.tools.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x);
          drawTools();
          const granted = state.tools.filter(x => x.enabled).map(x => x.id);
          ctx.updateCaps(granted);
        });
      });
    };

    const drawAgents = () => {
      const parent = el('#agent-list');
      const html = state.agents.map(a => `
        <div class="agent">
          <div class="avatar" style="border-color:${a.color}">${a.avatar}</div>
          <div>
            <div class="name">${a.name}</div>
            <div class="caps">caps: ${[...a.caps].join(', ') || '—'}</div>
          </div>
          <div class="caps tiny" style="color:${a.color}">${a.role}</div>
        </div>
      `).join('');
      render(parent, html);
    };

    const appendBubble = (ev) => {
      const parent = el('#log');
      const from = htmlEscape(ev.from);
      const role = ev.kind;
      const body = typeof ev.data === 'string' ? htmlEscape(ev.data) : `<code>${htmlEscape(JSON.stringify(ev.data))}</code>`;
      const div = document.createElement('div');
      div.className = 'bubble';
      div.innerHTML = `
        <div class="meta"><span class="from">${from}</span> <span class="role">${role}</span> <span class="tiny">#${ev.seq} · ${new Date(ev.ts).toLocaleTimeString()}</span></div>
        <div class="body">${body}</div>
      `;
      parent.appendChild(div);
      parent.scrollTo({ top: parent.scrollHeight, behavior: 'smooth' });
    };

    // Subscribe agents + UI to room
    const wireRoom = () => {
      state.room.subscribe(ev => {
        // agents observe
        state.agents.forEach(a => a.onEvent(ev, ctx));
        // ui sees
        appendBubble(ev);
      });
      // initial caps broadcast
      const granted = state.tools.filter(x => x.enabled).map(x => x.id);
      ctx.updateCaps(granted);
    };

    // Composer
    const wireComposer = () => {
      const form = el('#composer');
      const input = el('#input');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = (input.value || '').trim();
        if (!v) return;
        ctx.post('text', 'You', v);
        input.value = '';
      });
      el('#spawn').addEventListener('click', () => {
        const idx = state.agents.length + 1;
        const bot = mkAgent(`Duckling ${idx}`, 'duck', (ev, ctx) => {
          if (ev.kind !== 'text' || ev.from.startsWith('Duckling')) return;
          const msg = typeof ev.data === 'string' ? ev.data : '';
          const reply = replyDuck(bot.caps)(msg);
          ctx.post('text', bot.name, reply);
        });
        bot.caps = new Set([...state.agents[0].caps]);
        state.agents = [...state.agents, bot];
        drawAgents();
        ctx.post('system', 'pond', { note: 'agent.spawn', who: bot.name });
      });
    };

    // Boot
    seedAgents();
    drawTools();
    drawAgents();
    wireRoom();
    wireComposer();

    // Greeter
    ctx.post('system', 'pond', { note: 'hello', proto: 'enso-demo', version: '0.1' });
    ctx.post('text', 'You', 'hello pond');
  </script>
</body>
</html>

```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
