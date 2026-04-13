const AUTH_KEY = 'host-fleet-dashboard.auth-token';
const REFRESH_MS = 30000;

const authInput = document.getElementById('auth-token');
const saveButton = document.getElementById('save-token');
const authState = document.getElementById('auth-state');
const refreshButton = document.getElementById('refresh');
const updatedAt = document.getElementById('updated-at');
const totals = document.getElementById('totals');
const hostsRoot = document.getElementById('hosts');
const errorBanner = document.getElementById('error-banner');

function getToken() {
  return localStorage.getItem(AUTH_KEY)?.trim() ?? '';
}

function setToken(token) {
  if (token) {
    localStorage.setItem(AUTH_KEY, token);
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

function authHeaders() {
  const headers = new Headers();
  const token = getToken();
  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }
  return headers;
}

function apiUrl(path) {
  return new URL(path, window.location.href).toString();
}

async function requestJson(path) {
  const response = await fetch(apiUrl(path), { headers: authHeaders() });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof payload.error === 'string' ? payload.error : `Request failed: ${response.status}`;
    throw new Error(detail);
  }
  return payload;
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function statusClass(host) {
  if (!host.reachable) return 'status-pill bad';
  if (Array.isArray(host.errors) && host.errors.length > 0) return 'status-pill warn';
  return 'status-pill ok';
}

function statusLabel(host) {
  if (!host.reachable) return 'unreachable';
  if (Array.isArray(host.errors) && host.errors.length > 0) return 'partial';
  return 'live';
}

function stateClass(container) {
  const state = String(container.state ?? '').toLowerCase();
  if (state === 'running') return 'state-pill ok';
  if (state === 'exited' || state === 'dead') return 'state-pill bad';
  return 'state-pill warn';
}

function formatPorts(ports) {
  return Array.isArray(ports) && ports.length > 0 ? ports.join(', ') : '—';
}

function formatRouteMatch(route) {
  if (Array.isArray(route.matchPaths) && route.matchPaths.length > 0) {
    return route.matchPaths.join(' ');
  }
  if (route.matcher) return route.matcher;
  return 'default';
}

function renderTotals(hosts) {
  const reachable = hosts.filter((host) => host.reachable).length;
  const containers = hosts.reduce((sum, host) => sum + (host.summary?.containerCount ?? 0), 0);
  const routes = hosts.reduce((sum, host) => sum + (host.summary?.routeCount ?? 0), 0);
  totals.innerHTML = [
    `<span class="stat-pill">hosts ${reachable}/${hosts.length}</span>`,
    `<span class="stat-pill">containers ${containers}</span>`,
    `<span class="stat-pill">routes ${routes}</span>`,
  ].join('');
}

function renderHost(host) {
  const errors = Array.isArray(host.errors) ? host.errors : [];
  const errorBlock = errors.length > 0
    ? `<div class="host-error">${errors.map((entry) => `<div>${entry}</div>`).join('')}</div>`
    : '';

  const routeRows = Array.isArray(host.routes) && host.routes.length > 0
    ? host.routes.map((route) => `
      <tr>
        <td>${route.host}</td>
        <td>${formatRouteMatch(route)}</td>
        <td>${(route.upstreams ?? []).join(', ')}</td>
      </tr>
    `).join('')
    : '';

  const containerRows = Array.isArray(host.containers) && host.containers.length > 0
    ? host.containers.map((container) => `
      <tr>
        <td><strong>${container.name}</strong></td>
        <td>${container.image}</td>
        <td><span class="${stateClass(container)}">${container.status}</span></td>
        <td>${formatPorts(container.ports)}</td>
      </tr>
    `).join('')
    : '';

  return `
    <article class="host-card">
      <header class="host-header">
        <div>
          <div class="host-title-row">
            <h2>${host.label}</h2>
            <span class="${statusClass(host)}">${statusLabel(host)}</span>
          </div>
          <div class="host-meta">
            <span>${host.publicBaseUrl ?? host.id}</span>
            ${host.routeFile ? `<span>routes from ${host.routeFile}</span>` : ''}
            ${host.notes ? `<span>${host.notes}</span>` : ''}
          </div>
        </div>
        <div class="host-summary">
          <div><strong>${host.summary?.runningCount ?? 0}/${host.summary?.containerCount ?? 0}</strong><span>running</span></div>
          <div><strong>${host.summary?.healthyCount ?? 0}</strong><span>healthy</span></div>
          <div><strong>${host.summary?.routeCount ?? 0}</strong><span>routes</span></div>
          <div><strong>${formatDate(host.fetchedAt)}</strong><span>sampled</span></div>
        </div>
      </header>
      ${errorBlock}
      <div class="host-sections">
        <section>
          <div class="section-header">
            <h3>Subdomains</h3>
            <small>${Array.isArray(host.routes) ? host.routes.length : 0} routes</small>
          </div>
          ${routeRows ? `
            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr><th>Host</th><th>Match</th><th>Upstream</th></tr>
                </thead>
                <tbody>${routeRows}</tbody>
              </table>
            </div>` : '<div class="empty">No route data available.</div>'}
        </section>
        <section>
          <div class="section-header">
            <h3>Containers</h3>
            <small>${Array.isArray(host.containers) ? host.containers.length : 0} containers</small>
          </div>
          ${containerRows ? `
            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr><th>Name</th><th>Image</th><th>Status</th><th>Ports</th></tr>
                </thead>
                <tbody>${containerRows}</tbody>
              </table>
            </div>` : '<div class="empty">No container data available.</div>'}
        </section>
      </div>
    </article>
  `;
}

async function refresh() {
  try {
    const payload = await requestJson('./api/hosts');
    const hosts = Array.isArray(payload.hosts) ? payload.hosts : [];
    errorBanner.classList.add('hidden');
    errorBanner.textContent = '';
    updatedAt.textContent = `Updated ${formatDate(payload.generatedAt ?? new Date().toISOString())}`;
    renderTotals(hosts);
    hostsRoot.innerHTML = hosts.map(renderHost).join('');
  } catch (error) {
    errorBanner.classList.remove('hidden');
    errorBanner.textContent = error instanceof Error ? error.message : String(error);
    hostsRoot.innerHTML = '';
    totals.innerHTML = '';
  }
}

function syncAuthUi() {
  const token = getToken();
  authInput.value = token;
  authState.textContent = token ? 'Token stored in this browser.' : 'No token stored. API calls will fail unless unauthenticated mode is enabled.';
}

saveButton.addEventListener('click', () => {
  setToken(authInput.value.trim());
  syncAuthUi();
  refresh().catch(console.error);
});

refreshButton.addEventListener('click', () => {
  refresh().catch(console.error);
});

syncAuthUi();
refresh().catch(console.error);
window.setInterval(() => {
  refresh().catch(console.error);
}, REFRESH_MS);
