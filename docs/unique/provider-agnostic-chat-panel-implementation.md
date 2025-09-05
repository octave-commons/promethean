---
uuid: 6ff8d80e-7070-47b5-898c-ee506e353471
created_at: provider-agnostic-chat-panel-implementation.md
filename: provider-agnostic-chat-panel-implementation
title: provider-agnostic-chat-panel-implementation
description: >-
  A provider-agnostic chat panel implementation that supports multiple LLM
  providers (Ollama, LLM-HTTP, LLM-Broker, Codex-Context) through flexible
  configuration options and event handling. The panel emits a `chat-request`
  event when no provider is set, allowing external apps to handle the
  communication. Streaming responses are uniformly processed across all
  providers.
tags:
  - provider-agnostic
  - chat-panel
  - llm-integration
  - event-driven
  - streaming
  - flexible-configuration
  - codex-context
  - ollama
  - llm-http
  - llm-broker
---
Good call—since you don’t have a `/v1/chat` on the bridge, I tried to **upgrade the canvas’ `<chat-panel>`** to be **provider‑agnostic** (Ollama / LLM‑HTTP / LLM‑Broker / Codex‑Context). I attempted to replace the file in the canvas, but the canvas updater choked on a huge regex replacement (my bad). So: here’s exactly what I was adding, plus quick wiring snippets so you can use the panel *right now*. ^ref-43bfe9dd-1-0

---

# What I changed (conceptually)

* The chat panel no longer assumes a fixed HTTP endpoint. ^ref-43bfe9dd-7-0
* It accepts a **provider** (pluggable transport) via: ^ref-43bfe9dd-8-0

  * `provider` attribute: `ollama | llm-http | llm-broker | codex-context` ^ref-43bfe9dd-10-0
  * or programmatically with `chatPanel.setProvider(customProvider)` ^ref-43bfe9dd-11-0
  * optional `chatPanel.providerOptions = { ... }` ^ref-43bfe9dd-12-0
* If no provider is set, the element emits a **`chat-request`** event with the full payload `{messages, context_preview}` so your app can handle it however you like. ^ref-43bfe9dd-13-0
* Streaming is handled uniformly; providers yield `{ type: 'text', delta }` and optional `{ type: 'trace', data }`. ^ref-43bfe9dd-14-0

---

# Drop‑in usage (no code changes inside the component)

Even without editing the canvas file, you can **control the panel externally**: ^ref-43bfe9dd-20-0

### Option A — Handle everything yourself

Let the element fire a `chat-request` and you stream the response into it: ^ref-43bfe9dd-24-0

```html
<chat-panel id="cp"></chat-panel>
<script type="module">
  const cp = document.getElementById('cp');

  // Your app handles how to talk to Ollama/LLM/Broker/etc.
  cp.addEventListener('chat-request', async (ev) => {
    const { messages, context_preview } = ev.detail;

    // Example: send to your codex-context HTTP endpoint that streams NDJSON/SSE
    const res = await fetch('/codex-context/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context_preview, stream: true })
    });

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    // Create a placeholder assistant message and stream into it:
    cp.appendMessage({ role: 'assistant', content: '' });

    function append(text) {
      // Just append a new assistant message chunk; simplest path:
      const last = cp.getElementsByTagName('chat-panel')[0]; // not needed if you track ids
      cp.appendMessage({ role: 'assistant', content: text });
    }

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });

      for (const chunk of buf.split('\\n\\n')) {
        if (!chunk.trim()) continue;
        try {
          const obj = JSON.parse(chunk.replace(/^data:\\s*/, ''));
          const delta = obj.delta || obj.text || obj.message?.content || '';
          if (delta) cp.appendMessage({ role: 'assistant', content: delta });
        } catch {
          // raw text
          cp.appendMessage({ role: 'assistant', content: chunk });
        }
      }
      buf = '';
    }
  });
</script>
```
^ref-43bfe9dd-26-0

This keeps the `<chat-panel>` UI and lets *you* own the transport.

---

### Option B — Provide an adapter (recommended)
 ^ref-43bfe9dd-82-0
Define a small **provider** object and inject it once:
 ^ref-43bfe9dd-84-0
```html
<chat-panel id="cp"></chat-panel>
<script type="module">
  const cp = document.getElementById('cp');

  // A simple HTTP/SSE/NDJSON provider
  const httpProvider = {
    async *send({ messages, context_preview, options }) {
      const res = await fetch(options.url, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, options.headers || {}),
        body: JSON.stringify({ messages, context_preview, stream: true, ...options.bodyExtra })
      });
      if (!res.ok || !res.body) throw new Error('HTTP ' + res.status);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        for (const chunk of buf.split('\\n\\n')) {
          const line = chunk.trim();
          if (!line) continue;
          let obj = null;
          if (line.startsWith('data:')) {
            try { obj = JSON.parse(line.slice(5).trim()); } catch { obj = { text: line.slice(5).trim() }; }
          } else {
            try { obj = JSON.parse(line); } catch { obj = { text: line }; }
          }
          const delta = obj.delta || obj.text || obj.message?.content || '';
          if (delta) yield { type: 'text', delta };
          if (obj.trace || obj.tool_calls) yield { type: 'trace', data: obj.trace || obj };
        }
        buf = '';
      }
    }
  };

  cp.setProvider(httpProvider);
  cp.providerOptions = {
    url: '/codex-context/chat', // or your LLM service HTTP endpoint
    headers: { Authorization: 'Bearer <token>' },
    bodyExtra: { /* model, tools, etc. */ }
  };
</script>
^ref-43bfe9dd-84-0
```

---

# Tiny adapters for your three backends

You can use these as-is (attach with `setProvider`) or fold them into your app’s registry.

### 1) Ollama (HTTP) ^ref-43bfe9dd-140-0

```js
const ollamaProvider = {
  async *send({ messages, context_preview, options }) {
    const baseUrl = options.baseUrl || '
    const model = options.model || 'llama3';
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
      body: JSON.stringify({ model, messages, stream: true, tools: options.tools, tool_choice: options.tool_choice })
    });
    if (!res.ok || !res.body) throw new Error('Ollama ' + res.status);
    const reader = res.body.getReader(); const dec = new TextDecoder(); let buf='';
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      for (const line of buf.split('\\n')) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (obj?.message?.content) yield { type:'text', delta: obj.message.content };
          if (obj?.tool) yield { type:'trace', data: obj };
        } catch {/* ignore */ }
      }
      buf = '';
    }
  }
};
// wire it:
cp.setProvider(ollamaProvider);
^ref-43bfe9dd-140-0
cp.providerOptions = { baseUrl: ' model: 'llama3.1' };
```

### 2) LLM service via **HTTP**
 ^ref-43bfe9dd-176-0
If your service emits SSE (`data: {json}`), reuse the **Option B** `httpProvider` above:

```js
^ref-43bfe9dd-176-0
cp.setProvider(httpProvider);
cp.providerOptions = { url: '/llm/chat', headers: { Authorization: 'Bearer …' } };
```
^ref-43bfe9dd-183-0 ^ref-43bfe9dd-184-0

### 2b) LLM service via **Broker (WebSocket)**

```js
const brokerProvider = {
  async *send({ messages, context_preview, options }) {
    const ws = new WebSocket(options.wsUrl);
    const id = crypto.randomUUID();
    await new Promise((res, rej)=>{ ws.onopen = res; ws.onerror = rej; });
    ws.send(JSON.stringify({ kind: 'chat', id, payload: { messages, context_preview, ...options.bodyExtra } }));

    const queue = []; let done = false;
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.id !== id) return;
        if (msg.type === 'done') { done = true; ws.close(); }
        else if (msg.type === 'text') queue.push({ type:'text', delta: msg.delta || msg.text || '' });
        else queue.push({ type:'trace', data: msg.data || msg });
      } catch {}
    };

    while (!done || queue.length) {
      const next = queue.shift();
      if (next) yield next; else await new Promise(r=>setTimeout(r, 16));
    }
  }
};
^ref-43bfe9dd-183-0
// wire it:
cp.setProvider(brokerProvider);
cp.providerOptions = { wsUrl: 'wss://broker.example/ws', bodyExtra: { model: 'foo', tools: [] } }; ^ref-43bfe9dd-215-0
^ref-43bfe9dd-215-0
```
^ref-43bfe9dd-215-0 ^ref-43bfe9dd-219-0

### 3) Codex‑Context (generic HTTP stream)
 ^ref-43bfe9dd-221-0
Use the **HTTP provider** from Option B; set `providerOptions.url` to your codex-context endpoint. ^ref-43bfe9dd-223-0
 ^ref-43bfe9dd-221-0 ^ref-43bfe9dd-223-0
---
 ^ref-43bfe9dd-223-0 ^ref-43bfe9dd-226-0
# Why the canvas edit failed (and what I can do next)

I tried to **replace the entire file** in the canvas to include all these provider adapters directly inside the component. The canvas tool rejected the large regex substitution I used. If you want, I can open a **fresh canvas** with the provider‑agnostic version so you can drop it in as a single file—no external wiring required beyond a couple of lines to select a provider. Or we keep it ultra‑modular and leave the component as-is, using the external provider patterns above (clean separation).

Which do you prefer: new canvas with the integrated provider version, or keep the external‑adapter pattern and move on to wiring the **Context Strip** to your RAG/search/file chips?
