import { getFiles } from '../api.js';
import { setSelection } from '../selection.js';
import { renderSelectedMarkdown } from '../render.js';

class FileTree extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    const tpl = document.createElement('template');
    tpl.innerHTML = `
      <style>
        :host { display:block; border:1px solid #ddd; padding:8px; border-radius:6px; max-height: 320px; overflow:auto; }
        ul { list-style: none; padding-left: 16px; }
        .file { cursor: pointer; color: #0366d6; }
        .file:hover { text-decoration: underline; }
      </style>
      <div id="root"></div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.refresh();
  }
  async refresh() {
    const dir = document.getElementById('dir').value;
    const j = await getFiles(dir);
    const root = this.shadowRoot.getElementById('root');
    root.innerHTML = '';
    const ul = document.createElement('ul');
    root.appendChild(ul);
    const render = (parent, nodes, prefix) => {
      for (const n of nodes) {
        const li = document.createElement('li');
        if (n.type === 'dir') {
          li.textContent = '📁 ' + n.name;
          parent.appendChild(li);
          const sub = document.createElement('ul');
          li.appendChild(sub);
          render(sub, n.children || [], prefix + '/' + n.name);
        } else {
          const id = (prefix + '/' + n.name).replace(/^\/+/, '');
          const full = j.dir + '/' + id;
          const cb = document.createElement('input'); cb.type='checkbox'; cb.value = full;
          cb.addEventListener('change', () => this.updateSelection());
          li.appendChild(cb);
          const span = document.createElement('span'); span.textContent = ' ' + n.name; span.className = 'file';
          span.addEventListener('click', async () => {
            const cbs = this.shadowRoot.querySelectorAll('input[type=checkbox]');
            cbs.forEach(el => { el.checked = (el.value === full); });
            this.updateSelection();
            await renderSelectedMarkdown();
          });
          li.appendChild(span);
          parent.appendChild(li);
        }
      }
    };
    render(ul, j.tree || [], '');
    this.updateSelection();
  }
  updateSelection() {
    const cbs = this.shadowRoot.querySelectorAll('input[type=checkbox]');
    const sel = [];
    cbs.forEach(cb => { if (cb.checked) sel.push(cb.value); });
    setSelection(sel);
  }
}
customElements.define('file-tree', FileTree);
