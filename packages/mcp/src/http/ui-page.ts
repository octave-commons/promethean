const styles = `:root {
  color-scheme: dark;
  font-family: "Inter", "Segoe UI", sans-serif;
  background: #0f172a;
}

body {
  margin: 0;
  padding: 0;
  background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
  min-height: 100vh;
}

h1, h2, h3 {
  margin: 0;
}

button {
  cursor: pointer;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.app__header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app__title {
  font-size: 2.25rem;
  font-weight: 700;
}

.app__subtitle {
  color: #94a3b8;
}

.panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.panel {
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.4);
}

.panel__title {
  font-size: 1.25rem;
  font-weight: 600;
}

.chat-log {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 8px;
}

.chat-message {
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  background: rgba(30, 64, 175, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.chat-message--user {
  align-self: flex-end;
  background: rgba(59, 130, 246, 0.3);
}

.chat-message__author {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #60a5fa;
  margin-bottom: 4px;
}

.chat-inputs {
  display: flex;
  gap: 12px;
}

.chat-inputs textarea {
  flex: 1;
  resize: vertical;
  min-height: 60px;
  max-height: 160px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.8);
  color: inherit;
  padding: 12px 16px;
  font-size: 1rem;
}

.primary-button {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.25);
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 8px;
}

.tool-card {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 16px;
  background: rgba(15, 23, 42, 0.6);
}

.tool-card__id {
  font-weight: 600;
  color: #f8fafc;
}

.tool-card__description {
  margin-top: 8px;
  color: #cbd5f5;
  line-height: 1.4;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-field label {
  font-weight: 600;
  color: #cbd5f5;
}

.config-field input,
.config-field select,
.config-field textarea {
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.8);
  color: inherit;
  padding: 10px 12px;
  font-size: 0.95rem;
}

.code-input {
  font-family: "JetBrains Mono", "SFMono-Regular", "Menlo", monospace;
  min-height: 160px;
  line-height: 1.4;
  white-space: pre;
}

.multi-select {
  min-height: 120px;
}

.endpoints {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.endpoint-row {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(15, 23, 42, 0.6);
}

.endpoint-row__header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.endpoint-row__header input {
  flex: 1;
}

.secondary-button {
  background: transparent;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #e2e8f0;
  padding: 8px 14px;
  font-weight: 500;
}

.resolved-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
  color: #94a3b8;
}

.status-banner {
  border-radius: 12px;
  padding: 12px 16px;
  background: rgba(22, 163, 74, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #bbf7d0;
  font-weight: 600;
  display: none;
}

.status-banner--visible {
  display: block;
}

@media (max-width: 768px) {
  .panels {
    grid-template-columns: 1fr;
  }
}
`;

const script = `(() => {
  const qs = (selector) => document.querySelector(selector);
  const chatForm = qs('#chat-form');
  const chatInput = qs('#chat-input');
  const chatLog = qs('#chat-log');
  const toolList = qs('#tool-list');
  const endpointsContainer = qs('#endpoints');
  const addEndpointButton = qs('#add-endpoint');
  const saveButton = qs('#save-config');
  const configPathInput = qs('#config-path');
  const transportSelect = qs('#config-transport');
  const globalToolsSelect = qs('#config-tools');
  const proxyInput = qs('#config-stdio-proxy');
  const inlineProxyInput = qs('#config-inline-proxies');
  const resolvedList = qs('#resolved-endpoints');
  const statusBanner = qs('#status-banner');
  const sourceLabel = qs('#config-source');

  let currentState = null;

  const createOption = (tool) => {
    const option = document.createElement('option');
    option.value = tool.id;
    option.textContent = tool.id;
    return option;
  };

  const populateToolSelect = (select, tools, selectedValues = []) => {
    const available = Array.isArray(tools) ? tools : [];
    const selected = Array.isArray(selectedValues) ? selectedValues : [];
    const seen = new Set();
    select.innerHTML = '';
    for (const tool of available) {
      if (!seen.has(tool.id)) {
        select.appendChild(createOption(tool));
        seen.add(tool.id);
      }
    }
    for (const value of selected) {
      if (!seen.has(value)) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      }
    }
    setSelectValues(select, selected);
  };

  const setSelectValues = (select, values) => {
    const set = new Set(values);
    for (const option of select.options) {
      option.selected = set.has(option.value);
    }
  };

  const getSelectValues = (select) =>
    Array.from(select.options)
      .filter((option) => option.selected)
      .map((option) => option.value);

  const formatInlineProxies = (proxies) =>
    JSON.stringify(Array.isArray(proxies) ? proxies : [], null, 2);

  const parseInlineProxies = (value) => {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error('Inline proxies must be a JSON array.');
      }
      return parsed;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error('Invalid inline proxy JSON: ' + message);
    }
  };

  const appendChatMessage = (author, text) => {
    const entry = document.createElement('div');
    entry.className = 'chat-message ' + (author === 'user' ? 'chat-message--user' : '');

    const heading = document.createElement('div');
    heading.className = 'chat-message__author';
    heading.textContent = author === 'user' ? 'You' : 'MCP';

    const content = document.createElement('div');
    content.textContent = text;

    entry.appendChild(heading);
    entry.appendChild(content);
    chatLog.appendChild(entry);
    chatLog.scrollTop = chatLog.scrollHeight;
  };

  const renderToolList = (tools) => {
    toolList.innerHTML = '';
    for (const tool of tools) {
      const card = document.createElement('div');
      card.className = 'tool-card';

      const id = document.createElement('div');
      id.className = 'tool-card__id';
      id.textContent = tool.id;

      const desc = document.createElement('div');
      desc.className = 'tool-card__description';
      desc.textContent = tool.description || 'No description available.';

      card.appendChild(id);
      card.appendChild(desc);
      toolList.appendChild(card);
    }
  };

  const endpointRows = new Set();

  const createEndpointRow = (entry) => {
    const row = document.createElement('div');
    row.className = 'endpoint-row';

    const header = document.createElement('div');
    header.className = 'endpoint-row__header';

    const pathInput = document.createElement('input');
    pathInput.placeholder = '/mcp';
    pathInput.value = entry?.path ?? '';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'secondary-button';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      endpointRows.delete(row);
      row.remove();
    });

    header.appendChild(pathInput);
    header.appendChild(removeButton);

    const select = document.createElement('select');
    select.className = 'multi-select';
    select.multiple = true;
    populateToolSelect(
      select,
      currentState?.availableTools ?? [],
      entry?.tools ?? [],
    );

    row.appendChild(header);
    row.appendChild(select);
    row.dataset.pathInputId = 'true';

    row.getSelected = () => ({
      path: pathInput.value.trim(),
      tools: getSelectValues(select),
    });

    endpointRows.add(row);
    return row;
  };

  const renderResolvedEndpoints = (endpoints, proxies) => {
    resolvedList.innerHTML = '';
    if (endpoints.length === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'No HTTP endpoints configured.';
      resolvedList.appendChild(empty);
    }
    for (const endpoint of endpoints) {
      const item = document.createElement('div');
      item.textContent = endpoint.path + ' → [' + endpoint.tools.join(', ') + ']';
      resolvedList.appendChild(item);
    }
    if (proxies.length > 0) {
      const divider = document.createElement('div');
      divider.textContent = 'Proxied stdio servers:';
      divider.style.marginTop = '12px';
      resolvedList.appendChild(divider);
      for (const proxy of proxies) {
        const item = document.createElement('div');
        item.textContent = proxy.name + ' → ' + proxy.httpPath;
        resolvedList.appendChild(item);
      }
    }
  };

  const resetEndpointRows = (config) => {
    endpointRows.forEach((row) => row.remove());
    endpointRows.clear();
    endpointsContainer.innerHTML = '';

    const entries = Object.entries(config.endpoints ?? {});
    if (entries.length === 0) {
      endpointsContainer.appendChild(createEndpointRow({ path: '', tools: [] }));
      return;
    }
    for (const [path, endpointConfig] of entries) {
      endpointsContainer.appendChild(
        createEndpointRow({ path, tools: endpointConfig.tools ?? [] }),
      );
    }
  };

  const describeSource = (source, fallbackPath) => {
    if (!source) return 'Unknown';
    if (source.type === 'file') return 'File · ' + source.path;
    if (source.type === 'env') return 'Environment variable (MCP_CONFIG_JSON)';
    if (source.type === 'default') return 'Default · ' + fallbackPath;
    return 'Unknown';
  };

  const applyState = (state) => {
    currentState = state;
    renderToolList(state.availableTools);
    transportSelect.value = state.config.transport;
    populateToolSelect(
      globalToolsSelect,
      state.availableTools ?? [],
      state.config.tools ?? [],
    );
    proxyInput.value = state.config.stdioProxyConfig ?? '';
    inlineProxyInput.value = formatInlineProxies(state.config.stdioProxies);
    configPathInput.value = state.configPath;
    sourceLabel.textContent = describeSource(state.configSource, state.configPath);
    renderResolvedEndpoints(state.httpEndpoints ?? [], state.proxies ?? []);
    resetEndpointRows(state.config);
  };

  const loadState = async () => {
    const res = await fetch('/ui/state');
    if (!res.ok) throw new Error('Failed to load UI state');
    return await res.json();
  };

  const refreshState = async () => {
    try {
      const state = await loadState();
      applyState(state);
    } catch (error) {
      console.error(error);
    }
  };

  const collectConfig = () => {
    const endpoints = {};
    endpointRows.forEach((row) => {
      const { path, tools } = row.getSelected();
      if (path) {
        endpoints[path] = { tools };
      }
    });

    const inlineProxies = parseInlineProxies(inlineProxyInput.value);

    return {
      transport: transportSelect.value,
      tools: getSelectValues(globalToolsSelect),
      endpoints,
      stdioProxyConfig: proxyInput.value.trim() || null,
      stdioProxies: inlineProxies,
    };
  };

  const showStatus = (message) => {
    statusBanner.textContent = message;
    statusBanner.classList.add('status-banner--visible');
    setTimeout(() => statusBanner.classList.remove('status-banner--visible'), 3200);
  };

  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
    appendChatMessage('user', message);
    chatInput.value = '';

    try {
      const res = await fetch('/ui/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        const data = await res.json();
        appendChatMessage('system', data.reply ?? 'Saved');
      } else {
        appendChatMessage('system', 'Unable to process message.');
      }
    } catch (error) {
      console.error(error);
      appendChatMessage('system', 'Network error while sending message.');
    }
  });

  saveButton.addEventListener('click', async () => {
    let config;
    try {
      config = collectConfig();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : 'Invalid inline proxy configuration.';
      showStatus(message);
      return;
    }
    const targetPath = configPathInput.value.trim();
    try {
      const res = await fetch('/ui/config', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path: targetPath || undefined, config }),
      });
      if (!res.ok) throw new Error('Failed to save configuration');
      const state = await res.json();
      applyState(state);
      showStatus('Configuration saved. Restart the MCP service to apply changes.');
    } catch (error) {
      console.error(error);
      showStatus('Failed to save configuration. Check logs.');
    }
  });

  addEndpointButton.addEventListener('click', () => {
    endpointsContainer.appendChild(createEndpointRow({ path: '', tools: [] }));
  });

  refreshState();
})();`;

export const renderUiPage = (): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Promethean MCP Console</title>
    <style>${styles}</style>
  </head>
  <body>
    <div class="app">
      <header class="app__header">
        <h1 class="app__title">Promethean MCP Console</h1>
        <p class="app__subtitle">
          Inspect available MCP tools, configure HTTP endpoints, and manage promethean.mcp.json files.
        </p>
        <div id="status-banner" class="status-banner"></div>
      </header>
      <main class="panels">
        <section class="panel" id="chat-panel">
          <h2 class="panel__title">Chat</h2>
          <div id="chat-log" class="chat-log"></div>
          <form id="chat-form" class="chat-form">
            <div class="chat-inputs">
              <textarea id="chat-input" placeholder="Ask about MCP tools or configuration..."></textarea>
              <button type="submit" class="primary-button">Send</button>
            </div>
          </form>
        </section>
        <section class="panel" id="tools-panel">
          <h2 class="panel__title">Available MCP Tools</h2>
          <div id="tool-list" class="tool-list"></div>
        </section>
        <section class="panel" id="config-panel">
          <h2 class="panel__title">Configuration</h2>
          <div class="config-form">
            <div class="config-field">
              <label for="config-source">Current source</label>
              <div id="config-source" class="resolved-list"></div>
            </div>
            <div class="config-field">
              <label for="config-path">Config path</label>
              <input id="config-path" type="text" placeholder="promethean.mcp.json" />
            </div>
            <div class="config-field">
              <label for="config-transport">Transport</label>
              <select id="config-transport">
                <option value="http">http</option>
                <option value="stdio">stdio</option>
              </select>
            </div>
            <div class="config-field">
              <label for="config-tools">Global tools</label>
              <select id="config-tools" multiple class="multi-select"></select>
            </div>
            <div class="config-field">
              <label for="config-stdio-proxy">Stdio proxy config path</label>
              <input id="config-stdio-proxy" type="text" placeholder="servers.edn" />
            </div>
            <div class="config-field">
              <label for="config-inline-proxies">Inline stdio proxies (JSON array)</label>
              <textarea
                id="config-inline-proxies"
                class="code-input"
                placeholder='[{"name":"proxy","command":"./bin/server.sh","httpPath":"/proxy"}]'
              ></textarea>
            </div>
            <div class="config-field">
              <label>HTTP endpoints</label>
              <div id="endpoints" class="endpoints"></div>
              <button type="button" id="add-endpoint" class="secondary-button">Add endpoint</button>
            </div>
            <div class="config-field">
              <label>Resolved HTTP endpoints</label>
              <div id="resolved-endpoints" class="resolved-list"></div>
            </div>
            <button type="button" id="save-config" class="primary-button">Save configuration</button>
          </div>
        </section>
      </main>
    </div>
    <script>${script.replaceAll('</script>', '<\\/script>')}</script>
  </body>
</html>`;

export default renderUiPage;
