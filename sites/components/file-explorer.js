// file-explorer.js — vanilla web component for browsing repository files

function getAuthHeaders() {
    const tok = localStorage.getItem('bridgeToken') || '';
    return tok ? { Authorization: `Bearer ${tok}` } : {};
}

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    .explorer { margin-bottom: 20px; }
    .toolbar { display: flex; gap: 8px; align-items: center; }
    ul { list-style: none; padding-left: 0; }
    li { margin: 2px 0; }
    .entry { background: none; border: none; color: #4fc3f7; cursor: pointer; font: inherit; text-align: left; }
    .entry:hover { text-decoration: underline; }
    .snippet { background: #0e0e0e; color: #ddd; padding: 8px; border-radius: 6px; white-space: pre; overflow-x: auto; max-height: 400px; }
  </style>
  <div class="explorer">
    <div class="toolbar">
      <button class="up">Up</button>
      <span class="path"></span>
    </div>
    <ul class="entries"></ul>
    <pre class="snippet" hidden></pre>
  </div>
`;

class FileExplorer extends HTMLElement {
    #path = '.';
    #entries = [];
    #root;

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: 'open' });
        this.#root.appendChild(TEMPLATE.content.cloneNode(true));
        this.#root.querySelector('.up').addEventListener('click', () => this.goUp());
    }

    connectedCallback() {
        this.load();
    }

    async load() {
        try {
            const res = await fetch(
                `/bridge/v0/files/list?path=${encodeURIComponent(this.#path)}`,
                {
                    headers: getAuthHeaders(),
                },
            );
            const js = await res.json();
            this.#entries = js.entries || [];
        } catch {
            this.#entries = [];
        }
        this.render();
    }

    async open(entry) {
        if (entry.type === 'dir') {
            this.#path = entry.path;
            await this.load();
        } else {
            try {
                const res = await fetch(
                    `/bridge/v0/files/view?path=${encodeURIComponent(entry.path)}`,
                    {
                        headers: getAuthHeaders(),
                    },
                );
                const js = await res.json();
                const sn = this.#root.querySelector('.snippet');
                sn.textContent = js.snippet || '';
                sn.hidden = !js.snippet;
            } catch {
                const sn = this.#root.querySelector('.snippet');
                sn.textContent = '';
                sn.hidden = true;
            }
        }
    }

    goUp() {
        if (this.#path === '.' || !this.#path) return;
        const parts = this.#path.split('/').filter(Boolean);
        parts.pop();
        this.#path = parts.length ? parts.join('/') : '.';
        this.load();
    }

    render() {
        this.#root.querySelector('.path').textContent = this.#path;
        const ul = this.#root.querySelector('.entries');
        ul.innerHTML = '';
        for (const e of this.#entries) {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.className = 'entry';
            btn.textContent = `${e.type === 'dir' ? '📁' : '📄'} ${e.name}`;
            btn.addEventListener('click', () => this.open(e));
            li.appendChild(btn);
            ul.appendChild(li);
        }
    }
}

customElements.define('file-explorer', FileExplorer);
