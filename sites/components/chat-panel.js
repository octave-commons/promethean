// chat-panel.js — vanilla Web Component
// Features:
// - Markdown-friendly message rendering (safe, minimal)
// - Composer with Ctrl+Enter to send
// - Context Strip chips with toggles and token counts
// - Streaming reply via fetch ReadableStream (SSE-compatible shim)
// - Emits/consumes events on a tiny optional global bus (window.bus)
// - Leader-ish keys: `Ctrl+Enter` send, `Alt+[ / Alt+]` adjust K, `Alt+.` focus composer
// - No frameworks, no external deps

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host { display: grid; grid-template-rows: auto 1fr auto; height: 100%; font: 13px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial; color: var(--fg, #e6e6e6); background: var(--bg, #0f1115); }
    header { display: grid; grid-template-columns: 1fr auto; gap: .5rem; align-items: center; border-bottom: 1px solid var(--border, #222630); padding: .5rem .75rem; position: sticky; top: 0; background: inherit; z-index: 2; }
    .context { display: flex; gap: .5rem; flex-wrap: wrap; }
    .chip { display: inline-flex; align-items: center; gap: .4rem; padding: .25rem .5rem; border: 1px solid var(--chip-border, #2a2f3a); border-radius: 999px; background: var(--chip-bg, #141822); cursor: pointer; user-select: none; }
    .chip[data-off="true"]{ opacity: .5; filter: saturate(.3); }
    .chip .id { opacity: .7; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; font-size: 12px; }
    .chip .meta { opacity: .6; font-size: 12px; }
    .chip button { all: unset; cursor: pointer; opacity: .7; }

    main { overflow: auto; padding: 1rem; }
    .msg { margin: 0 0 1rem 0; padding: .75rem .9rem; border: 1px solid var(--border, #222630); border-radius: .75rem; background: #0b0d12; }
    .msg.user { background: #11151e; }
    .role { text-transform: uppercase; letter-spacing: .08em; font-size: 10px; opacity: .6; margin-bottom: .25rem; }
    .md { white-space: break-spaces; }
    .md pre { background: #0a0d14; border: 1px solid #222630; padding: .6rem; border-radius: .5rem; overflow: auto; }
    .md code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; font-size: 12px; }
    .md a { color: #8ab4ff; text-decoration: none; }
    .md a:hover { text-decoration: underline; }
    .md ul, .md ol { margin: .25rem 0 .25rem 1.25rem; }
    .md blockquote { border-left: 3px solid #2a2f3a; padding-left: .5rem; margin-left: 0; color: #b0b6c3; }

    footer { border-top: 1px solid var(--border, #222630); padding: .5rem; display: grid; grid-template-columns: 1fr auto; align-items: end; gap: .5rem; }
    textarea { width: 100%; min-height: 3.5rem; max-height: 30vh; resize: vertical; background: #0b0f17; color: inherit; border: 1px solid var(--border, #222630); border-radius: .5rem; padding: .6rem .7rem; font: inherit; }
    .controls { display: flex; gap: .5rem; align-items: center; }
    .btn { background: #1b2331; color: #e6e6e6; border: 1px solid #2a2f3a; padding: .45rem .8rem; border-radius: .5rem; cursor: pointer; }
    .btn[disabled] { opacity: .6; cursor: not-allowed; }
    .meter { height: 4px; background: #1a1f29; border-radius: 2px; overflow: hidden; width: 140px; }
    .meter > div { height: 100%; background: linear-gradient(90deg, #58a6ff, #7ee787); width: 0%; }
  </style>
  <header>
    <div class="context" part="context-strip"></div>
    <div class="controls">
      <div class="meter" title="token budget"><div></div></div>
      <button class="btn send" title="Ctrl+Enter">Send ▷</button>
    </div>
  </header>
  <main part="messages"></main>
  <footer>
    <textarea class="composer" placeholder="Ask or type \`\`\` for code… (Ctrl+Enter to send)"></textarea>
    <div class="controls">
      <button class="btn clear">Clear</button>
    </div>
  </footer>
`;

function escapeHtml(s) {
    return s.replace(
        /[&<>\"]/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
    );
}

// Very small, safe-ish markdown renderer (subset): code fences, inline code, **bold**, *italic*, links
function renderMarkdown(src) {
    let s = escapeHtml(src);
    // fenced code blocks ```lang\n...\n```
    s = s.replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        (m, lang, body) => `<pre><code data-lang="${lang || ''}">${body}</code></pre>`,
    );
    // inline code
    s = s.replace(/`([^`]+)`/g, (m, code) => `<code>${code}</code>`);
    // bold & italic (order matters)
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // links [text](url)
    s = s.replace(
        /\[([^\]]+)\]\((https?:[^\)\s]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
    // simple lists
    s = s.replace(
        /^(?:-\s.*(?:\n|$))+?/gm,
        (block) =>
            `<ul>` +
            block
                .trim()
                .split(/\n/)
                .map((li) => `<li>${li.replace(/^-[\s]*/, '')}</li>`)
                .join('') +
            `</ul>`,
    );
    s = s.replace(
        /^(?:\d+\.\s.*(?:\n|$))+?/gm,
        (block) =>
            `<ol>` +
            block
                .trim()
                .split(/\n/)
                .map((li) => `<li>${li.replace(/^\d+\.[\s]*/, '')}</li>`)
                .join('') +
            `</ol>`,
    );
    // blockquote
    s = s.replace(/(^|\n)>(.*)/g, (m, _a, rest) => `\n<blockquote>${rest.trim()}</blockquote>`);
    // paragraphs / line breaks
    s = s.replace(/\n\n+/g, '</p><p>');
    s = `<p>${s}</p>`;
    return s;
}

export class ChatPanel extends HTMLElement {
    static get observedAttributes() {
        return ['endpoint'];
    }
    /** @type {Array<{id:string, role:'user'|'assistant'|'system'|'tool', content:string}>} */
    #messages = [];
    /** @type {Array<{id:string, kind:string, title:string, selected:boolean, tokens?:number, meta?:any, payload:{text:string, citation?:string}}>} */
    #chips = [];
    #shadow;
    #composer;
    #msgsEl;
    #ctxEl;
    #meterBar;
    #sending = false;
    #endpoint = '/v1/chat';

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
        this.#shadow.appendChild(TEMPLATE.content.cloneNode(true));
        this.#composer = this.#shadow.querySelector('.composer');
        this.#msgsEl = this.#shadow.querySelector('main');
        this.#ctxEl = this.#shadow.querySelector('.context');
        this.#meterBar = this.#shadow.querySelector('.meter > div');

        this.#shadow.querySelector('.send').addEventListener('click', () => this.send());
        this.#shadow.querySelector('.clear').addEventListener('click', () => this.clear());

        this.#composer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.send();
            }
            if (e.altKey && e.key === '.') {
                e.preventDefault();
                this.#composer.focus();
            }
            if (e.altKey && (e.key === '[' || e.key === ']')) {
                e.preventDefault();
                this.dispatchEvent(
                    new CustomEvent('adjust-k', { detail: { dir: e.key === ']' ? +1 : -1 } }),
                );
            }
        });

        // Optional global bus wiring
        if (window.bus) {
            window.bus.on?.('SEARCH_RESULTS', (e) =>
                this.setChips([...(this.#chips || []), ...e.items]),
            );
            window.bus.on?.('RAG_RESULTS', (e) =>
                this.setChips([...(this.#chips || []), ...e.items]),
            );
            window.bus.on?.('FILES_PIN', (e) => this.setChips([...(this.#chips || []), e.chip]));
            window.bus.on?.('CHAT_RESPONSE', (e) =>
                this.appendMessage({ role: 'assistant', content: e.msg }),
            );
        }

        // Initial render
        this.render();
    }

    attributeChangedCallback(name, _o, v) {
        if (name === 'endpoint' && v) this.#endpoint = v;
    }

    // Public API
    setChips(chips) {
        this.#chips = this.#dedupeById(chips);
        this.renderContext();
    }
    getChips() {
        return this.#chips;
    }
    setBudgetUsage(pct) {
        this.#meterBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    }
    setMessages(list) {
        this.#messages = list;
        this.renderMessages();
    }
    appendMessage(msg) {
        this.#messages.push({ id: crypto.randomUUID(), ...msg });
        this.renderMessages(true);
    }

    clear() {
        this.#messages = [];
        this.renderMessages();
    }

    // UI rendering
    render() {
        this.renderContext();
        this.renderMessages();
    }

    renderContext() {
        const el = this.#ctxEl;
        el.innerHTML = '';
        const chips = this.#chips || [];
        for (const c of chips) {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.dataset.off = (!c.selected).toString();
            chip.title = c.meta?.subtitle || '';
            const id = document.createElement('span');
            id.className = 'id';
            id.textContent = `#${c.id}`;
            const title = document.createElement('span');
            title.textContent = c.title;
            const meta = document.createElement('span');
            meta.className = 'meta';
            meta.textContent = c.tokens ? `${c.tokens}` : '';
            const btn = document.createElement('button');
            btn.innerHTML = c.selected ? '✕' : '✓';
            btn.title = c.selected ? 'Disable' : 'Enable';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                c.selected = !c.selected;
                chip.dataset.off = (!c.selected).toString();
                btn.innerHTML = c.selected ? '✕' : '✓';
                this.dispatchEvent(
                    new CustomEvent('chip-toggle', { detail: { id: c.id, selected: c.selected } }),
                );
            });
            chip.addEventListener('click', () => this.previewChip(c));
            chip.append(id, title, meta, btn);
            el.appendChild(chip);
        }
    }

    renderMessages(scroll = false) {
        const wrap = this.#msgsEl;
        wrap.innerHTML = '';
        for (const m of this.#messages) {
            const card = document.createElement('div');
            card.className = `msg ${m.role}`;
            const role = document.createElement('div');
            role.className = 'role';
            role.textContent = m.role;
            const md = document.createElement('div');
            md.className = 'md';
            md.innerHTML = renderMarkdown(m.content || '');
            card.append(role, md);
            wrap.appendChild(card);
        }
        if (scroll) wrap.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    // UX helpers
    previewChip(chip) {
        const preview = `**${chip.title}**\n\n${chip.payload?.text?.slice(0, 1200) || ''}${
            (chip.payload?.text?.length || 0) > 1200 ? '\n…' : ''
        }`;
        this.dispatchEvent(new CustomEvent('chip-preview', { detail: { chip } }));
        // Optionally append as a transient system message preview
        // this.appendMessage({ role:'system', content: preview });
    }

    // Compose full payload for /v1/chat; real selection/packing happens outside, but we include chips for transparency.
    buildChatRequest(userText) {
        const messages = [
            ...this.#messages.filter((m) => m.role !== 'system' && m.role !== 'tool'),
            { role: 'user', content: userText },
        ];
        const context_preview = (this.#chips || [])
            .filter((c) => c.selected)
            .map((c) => ({
                id: c.id,
                kind: c.kind,
                title: c.title,
                tokens: c.tokens,
                citation: c.payload?.citation,
            }));
        return { messages, context_preview };
    }

    async send() {
        if (this.#sending) return;
        const text = this.#composer.value.trim();
        if (!text) return;
        this.#sending = true;
        this.#shadow.querySelector('.send').disabled = true;
        this.appendMessage({ role: 'user', content: text });
        this.#composer.value = '';

        try {
            const payload = this.buildChatRequest(text);
            const res = await fetch(this.#endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stream: true, ...payload }),
            });
            if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

            // streaming decode
            const reader = res.body.getReader();
            const dec = new TextDecoder();
            let assistantId = crypto.randomUUID();
            let acc = '';
            this.#messages.push({ id: assistantId, role: 'assistant', content: '' });
            this.renderMessages(true);

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                acc += dec.decode(value, { stream: true });
                // Expect either raw text stream or SSE lines beginning with 'data:'
                const chunks = acc.split(/\n\n/);
                acc = chunks.pop() || '';
                for (const ch of chunks) {
                    const line = ch.trim();
                    let delta = '';
                    if (line.startsWith('data:')) {
                        const data = line.slice(5).trim();
                        if (data === '[DONE]') continue;
                        try {
                            const j = JSON.parse(data);
                            delta = j.delta || j.text || '';
                            this.dispatchEvent(new CustomEvent('trace', { detail: j }));
                        } catch {
                            delta = data;
                        }
                    } else {
                        delta = line;
                    }
                    this.#appendToAssistant(assistantId, delta);
                }
            }
            // flush tail
            if (acc) this.#appendToAssistant(assistantId, acc);
        } catch (err) {
            console.error(err);
            this.appendMessage({ role: 'system', content: `Error: ${err.message}` });
        } finally {
            this.#sending = false;
            this.#shadow.querySelector('.send').disabled = false;
        }
    }

    #appendToAssistant(id, delta) {
        const idx = this.#messages.findIndex((m) => m.id === id);
        if (idx >= 0) {
            this.#messages[idx].content += delta;
            this.renderMessages(true);
        }
    }

    // util
    #dedupeById(list) {
        const m = new Map();
        for (const x of list || []) if (!m.has(x.id)) m.set(x.id, x);
        return [...m.values()];
    }
}

customElements.define('chat-panel', ChatPanel);
