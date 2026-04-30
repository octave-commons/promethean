import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number.parseInt(process.env.CEPHALON_DASHBOARD_PORT ?? '3310', 10);
const OPENPLANNER_BASE_URL = (process.env.OPENPLANNER_API_BASE_URL ?? 'http://openplanner:7777').replace(/\/+$/, '');
const OPENPLANNER_API_KEY = process.env.OPENPLANNER_API_KEY ?? 'change-me';
const DASHBOARD_CALLER = 'unified-dashboard';
const DEFAULT_TARGETS = [
  { id: 'duck', label: 'Duck', baseUrl: 'http://duck:3001' },
  { id: 'openhax', label: 'OpenHax', baseUrl: 'http://openhax:3002' },
  { id: 'openskull', label: 'OpenSkull', baseUrl: 'http://openskull:3003' },
];

function loadTargets() {
  const raw = process.env.CEPHALON_DASHBOARD_TARGETS_JSON?.trim();
  if (!raw) return DEFAULT_TARGETS;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_TARGETS;
  } catch {
    return DEFAULT_TARGETS;
  }
}

const TARGETS = loadTargets();

function json(res, statusCode, body) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  });
  res.end(JSON.stringify(body));
}

function text(res, statusCode, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'content-type': type,
    'access-control-allow-origin': '*',
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function fetchJson(url, options = {}, timeoutMs = 10_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.headers ?? {}),
      },
    });
    const textBody = await response.text();
    const parsed = textBody.length > 0 ? JSON.parse(textBody) : null;
    if (!response.ok) {
      throw new Error(parsed?.error ?? `request failed with ${response.status}`);
    }
    return parsed;
  } finally {
    clearTimeout(timeout);
  }
}

function safeIso(timestamp) {
  const value = Number(timestamp);
  return Number.isFinite(value) ? new Date(value).toISOString() : new Date(0).toISOString();
}

function parseToolCall(content = '') {
  const match = /^Called\s+([^\(]+)\((.*)\)$/s.exec(content.trim());
  if (!match) return null;
  const toolName = match[1]?.trim() ?? '';
  const argsText = match[2]?.trim() ?? '';
  return { toolName, argsText };
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function parseToolResult(content = '') {
  const trimmed = content.trim();
  if (/^Error:\s*/i.test(trimmed)) {
    return {
      status: 'error',
      error: trimmed.replace(/^Error:\s*/i, ''),
      value: null,
    };
  }

  const match = /^Result:\s*(.*)$/s.exec(trimmed);
  if (!match) return null;
  return {
    status: 'success',
    error: null,
    value: safeJsonParse(match[1]),
  };
}

function categorizeToolName(toolName = '') {
  if (/^browser\./.test(toolName)) return 'browser';
  if (/^peer\./.test(toolName)) return 'peer';
  if (/^(discord\.|irc\.)/.test(toolName)) return 'chat';
  if (/^(vision\.|web\.|audio\.|desktop\.)/.test(toolName)) return 'senses';
  if (/^(memory\.|field\.|heuretic\.|metisean\.)/.test(toolName)) return 'mind';
  return 'other';
}

function summarizeToolEntry(memoryKind, toolName, parsedTool, parsedResult, sourceType) {
  if (!toolName) return sourceType === 'irc' ? 'IRC memory event' : 'memory event';

  const args = safeJsonParse(parsedTool?.argsText ?? '');
  const result = parsedResult?.value;

  switch (toolName) {
    case 'browser.navigate':
      return memoryKind === 'tool_call'
        ? `navigate ${args?.url ?? ''}`.trim()
        : `loaded ${result?.title ?? '(untitled)'} @ ${result?.url ?? ''}`.trim();
    case 'browser.click':
      return `click ${args?.selector ?? result?.selector ?? ''}`.trim();
    case 'browser.type':
      return memoryKind === 'tool_call'
        ? `type ${(args?.text ?? '').length} chars into ${args?.selector ?? ''}`.trim()
        : `typed ${result?.textLength ?? ''} chars into ${result?.selector ?? ''}`.trim();
    case 'browser.screenshot':
      return memoryKind === 'tool_call'
        ? `screenshot ${args?.selector ?? '(page)'}`
        : `screenshot ${result?.selector ?? '(page)'}${result?.analysis ? ' + vision' : ''}`;
    case 'browser.content':
      return memoryKind === 'tool_call'
        ? `extract ${args?.type ?? 'text'} ${args?.selector ?? '(page)'}`
        : `content ${result?.type ?? ''} ${result?.length ?? ''}`.trim();
    case 'browser.execute':
      return memoryKind === 'tool_call'
        ? `execute ${(args?.code ?? '').length} chars js`
        : `execute result ${result?.type ?? ''}`.trim();
    case 'discord.channel.messages':
      return memoryKind === 'tool_call'
        ? `read ${args?.channel_id ?? ''}`.trim()
        : `read ${result?.count ?? 0} messages`;
    case 'discord.search':
      return memoryKind === 'tool_call'
        ? `search ${(args?.query ?? '').slice(0, 80)}`.trim()
        : `search ${result?.count ?? 0} hits`;
    case 'discord.send':
    case 'discord.speak':
      return memoryKind === 'tool_call'
        ? `send ${(args?.text ?? '').slice(0, 80)}`.trim()
        : `sent ${result?.channel_id ?? ''}`.trim();
    case 'peer.read_file':
    case 'peer.write_file':
    case 'peer.edit_file':
    case 'peer.bash':
    case 'peer.logs':
      return memoryKind === 'tool_call'
        ? `${toolName.replace('peer.', '')} ${args?.path ?? args?.peer ?? ''}`.trim()
        : `${toolName.replace('peer.', '')} done`;
    case 'field.observe':
      return memoryKind === 'tool_call' ? 'observe field state' : `field snapshot for ${result?.sessionId ?? ''}`.trim();
    default:
      if (parsedResult?.status === 'error') {
        return `${toolName} failed: ${parsedResult.error}`.slice(0, 120);
      }
      return toolName;
  }
}

function normalizeMemory(target, memory) {
  const contentText = typeof memory?.content?.text === 'string' ? memory.content.text : '';
  const parsedTool = parseToolCall(contentText);
  const parsedResult = parseToolResult(contentText);
  const toolName = parsedTool?.toolName || (/^tool_(call|result)$/.test(memory?.kind ?? '') && typeof memory?.content?.normalizedText === 'string'
    ? memory.content.normalizedText.replace(/^tool:/, '')
    : undefined);
  const browsing = Boolean(toolName && /^(browser\.|web\.)/.test(toolName));
  return {
    targetId: target.id,
    targetLabel: target.label,
    id: memory?.id ?? '',
    timestamp: Number(memory?.timestamp ?? 0),
    iso: safeIso(memory?.timestamp ?? 0),
    sessionId: memory?.sessionId ?? '',
    role: memory?.role ?? '',
    kind: memory?.kind ?? '',
    sourceType: memory?.source?.type ?? '',
    content: contentText,
    toolName,
    toolArgs: parsedTool?.argsText ?? '',
    toolResult: parsedResult?.value ?? null,
    toolStatus: parsedResult?.status ?? (memory?.kind === 'tool_call' ? 'call' : null),
    toolCategory: categorizeToolName(toolName),
    summary: summarizeToolEntry(memory?.kind ?? '', toolName, parsedTool, parsedResult, memory?.source?.type ?? ''),
    isBrowsing: browsing,
    isTool: memory?.kind === 'tool_call' || memory?.kind === 'tool_result',
    isIrc: memory?.source?.type === 'irc',
  };
}

async function fetchMemories(target, maxItems = 200) {
  const pageSize = 100;
  let offset = 0;
  let total = Infinity;
  const items = [];
  while (offset < total && items.length < maxItems) {
    const payload = await fetchJson(`${target.baseUrl}/api/memories/list?limit=${pageSize}&offset=${offset}`);
    const memories = Array.isArray(payload?.memories) ? payload.memories : [];
    total = Number(payload?.total ?? memories.length ?? 0);
    for (const memory of memories) {
      items.push(normalizeMemory(target, memory));
      if (items.length >= maxItems) break;
    }
    if (memories.length === 0) break;
    offset += memories.length;
  }
  return items;
}

async function fetchOverviewForTarget(target) {
  try {
    const [countPayload, contextPayload, runtimePayload] = await Promise.all([
      fetchJson(`${target.baseUrl}/api/memories/count`),
      fetchJson(`${target.baseUrl}/api/memories/context`),
      fetchJson(`${target.baseUrl}/api/runtime/self`).catch(() => ({ runtime: null })),
    ]);

    const recent = Array.isArray(contextPayload?.recent) ? contextPayload.recent : [];
    const latestTimestamp = recent[0]?.timestamp ?? null;

    return {
      id: target.id,
      label: target.label,
      baseUrl: target.baseUrl,
      ok: true,
      memoryCount: Number(countPayload?.count ?? 0),
      pinnedCount: Array.isArray(contextPayload?.pinned) ? contextPayload.pinned.length : 0,
      sessionCount: Number(contextPayload?.sessionCount ?? 0),
      lastMemoryAt: latestTimestamp,
      lastMemoryAtIso: latestTimestamp ? safeIso(latestTimestamp) : null,
      runtime: runtimePayload?.runtime ?? null,
    };
  } catch (error) {
    return {
      id: target.id,
      label: target.label,
      baseUrl: target.baseUrl,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      memoryCount: 0,
      pinnedCount: 0,
      sessionCount: 0,
      lastMemoryAt: null,
      lastMemoryAtIso: null,
      runtime: null,
    };
  }
}

async function fetchErrorStream(limit = 120, targetFilter = 'all') {
  const selectedTargets = targetFilter === 'all' ? TARGETS : TARGETS.filter((target) => target.id === targetFilter);
  const results = [];
  for (const target of selectedTargets) {
    try {
      const payload = await fetchJson(`${target.baseUrl}/api/peer/logs?lines=200`, {
        headers: { 'x-cephalon-caller': DASHBOARD_CALLER },
      });
      const logText = typeof payload?.logs === 'string' ? payload.logs : '';
      const lines = logText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => /(Turn failed|Turn error|\[Fatal\]|TokenInvalid|Error:|WARN|failed warm federation|MongoDBMemoryStore.*Error)/i.test(line));
      for (const line of lines.slice(-limit)) {
        results.push({
          targetId: target.id,
          targetLabel: target.label,
          timestamp: Date.now(),
          iso: new Date().toISOString(),
          line,
        });
      }
    } catch (error) {
      if (targetFilter === 'all') {
        continue;
      }
      results.push({
        targetId: target.id,
        targetLabel: target.label,
        timestamp: Date.now(),
        iso: new Date().toISOString(),
        line: `log fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
  return results.slice(-limit).reverse();
}

async function fetchIrcStream(limit = 120, targetFilter = 'all') {
  const selectedTargets = targetFilter === 'all' ? TARGETS : TARGETS.filter((target) => target.id === targetFilter);
  const results = [];

  for (const target of selectedTargets) {
    try {
      const payload = await fetchJson(`${target.baseUrl}/api/peer/logs?lines=400`, {
        headers: { 'x-cephalon-caller': DASHBOARD_CALLER },
      });
      const logText = typeof payload?.logs === 'string' ? payload.logs : '';
      const lines = logText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => /\[IRC\]|irc\.ussy\.host|irc:ussy:%23ussycode|#ussycode|PRIVMSG|JOIN /i.test(line));

      for (const line of lines.slice(-limit)) {
        results.push({
          targetId: target.id,
          targetLabel: target.label,
          timestamp: Date.now(),
          iso: new Date().toISOString(),
          line,
        });
      }
    } catch (error) {
      if (targetFilter === 'all') {
        continue;
      }
      results.push({
        targetId: target.id,
        targetLabel: target.label,
        timestamp: Date.now(),
        iso: new Date().toISOString(),
        line: `irc log fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  return results.slice(-limit).reverse();
}

async function openPlannerHealth() {
  try {
    const payload = await fetchJson(`${OPENPLANNER_BASE_URL}/v1/health`, {}, 8_000);
    return { ok: true, payload };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function buildOpenPlannerEvent(target, memory) {
  const text = typeof memory?.content === 'string'
    ? memory.content
    : typeof memory?.content?.text === 'string'
      ? memory.content.text
      : '';

  return {
    schema: 'openplanner.event.v1',
    id: `memory-${memory.id}`,
    ts: safeIso(memory.timestamp ?? Date.now()),
    source: `cephalon:${target.id}`,
    kind: `memory.${memory.kind ?? 'unknown'}`,
    source_ref: {
      project: 'cephalon-hive',
      session: memory.sessionId ?? '',
      message: memory.id ?? '',
    },
    text,
    meta: {
      cephalon_id: target.id,
      memory_kind: memory.kind ?? 'unknown',
      role: memory.role ?? 'unknown',
      source_type: memory?.source?.type ?? 'unknown',
      tags: [target.id, memory.kind ?? 'unknown'],
    },
    extra: {
      session_id: memory.sessionId ?? '',
      memory_id: memory.id ?? '',
      event_id: memory.eventId ?? null,
      content_text: text,
      normalized_text: memory?.content?.normalizedText,
      source_type: memory?.source?.type ?? 'unknown',
      source_guild_id: memory?.source?.guildId,
      source_channel_id: memory?.source?.channelId,
      source_author_id: memory?.source?.authorId,
      source_author_is_bot: memory?.source?.authorIsBot,
      role: memory.role ?? 'unknown',
      timestamp: memory.timestamp ?? Date.now(),
    },
  };
}

async function postOpenPlannerEvents(events) {
  if (events.length === 0) return { ok: true, count: 0, ids: [] };
  return fetchJson(`${OPENPLANNER_BASE_URL}/v1/events`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${OPENPLANNER_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ events }),
  }, 30_000);
}

async function backfillOpenPlanner() {
  const summary = [];
  let totalEvents = 0;
  for (const target of TARGETS) {
    try {
      const events = [];
      let offset = 0;
      let total = Infinity;
      const pageSize = 200;
      while (offset < total) {
        const payload = await fetchJson(`${target.baseUrl}/api/memories/list?limit=${pageSize}&offset=${offset}`);
        const memories = Array.isArray(payload?.memories) ? payload.memories : [];
        total = Number(payload?.total ?? memories.length ?? 0);
        for (const memory of memories) {
          events.push(buildOpenPlannerEvent(target, memory));
        }
        if (memories.length === 0) break;
        offset += memories.length;
      }

      let imported = 0;
      for (let index = 0; index < events.length; index += 100) {
        const batch = events.slice(index, index + 100);
        const result = await postOpenPlannerEvents(batch);
        imported += Number(result?.count ?? batch.length);
      }
      totalEvents += imported;
      summary.push({ targetId: target.id, ok: true, imported });
    } catch (error) {
      summary.push({ targetId: target.id, ok: false, error: error instanceof Error ? error.message : String(error), imported: 0 });
    }
  }
  return { ok: true, totalEvents, summary };
}

async function searchOpenPlanner(query, limit = 20) {
  return fetchJson(`${OPENPLANNER_BASE_URL}/v1/search/fts`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${OPENPLANNER_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ q: query, limit }),
  }, 20_000);
}

async function buildStream(kind, targetFilter, limit) {
  if (kind === 'errors') {
    return fetchErrorStream(limit, targetFilter);
  }
  if (kind === 'irc') {
    return fetchIrcStream(limit, targetFilter);
  }

  const selectedTargets = targetFilter === 'all' ? TARGETS : TARGETS.filter((target) => target.id === targetFilter);
  const memories = (await Promise.all(selectedTargets.map((target) => fetchMemories(target, Math.max(limit * 3, 120)).catch(() => [])))).flat();
  const filtered = memories.filter((entry) => {
    switch (kind) {
      case 'tool':
        return entry.isTool;
      case 'browser':
        return entry.isBrowsing;
      case 'chat':
        return entry.isTool && entry.toolCategory === 'chat';
      case 'peer':
        return entry.isTool && entry.toolCategory === 'peer';
      case 'senses':
        return entry.isTool && entry.toolCategory === 'senses';
      case 'mind':
        return entry.isTool && entry.toolCategory === 'mind';
      case 'memory':
        return entry.kind === 'message' || entry.kind === 'summary' || entry.kind === 'image';
      case 'all':
      default:
        return true;
    }
  });

  return filtered
    .sort((left, right) => right.timestamp - left.timestamp)
    .slice(0, limit);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
        'access-control-allow-headers': 'content-type',
      });
      res.end();
      return;
    }

    if (url.pathname === '/api/health') {
      json(res, 200, {
        ok: true,
        targets: TARGETS,
        openplanner: await openPlannerHealth(),
      });
      return;
    }

    if (url.pathname === '/api/overview') {
      const [targets, planner] = await Promise.all([
        Promise.all(TARGETS.map((target) => fetchOverviewForTarget(target))),
        openPlannerHealth(),
      ]);
      json(res, 200, {
        generatedAt: new Date().toISOString(),
        targets,
        openplanner: planner,
      });
      return;
    }

    if (url.pathname === '/api/runtime') {
      const targets = await Promise.all(TARGETS.map((target) => fetchOverviewForTarget(target)));
      json(res, 200, {
        generatedAt: new Date().toISOString(),
        targets: targets.map((target) => ({
          id: target.id,
          label: target.label,
          ok: target.ok,
          runtime: target.runtime,
          error: target.error,
        })),
      });
      return;
    }

    if (url.pathname === '/api/streams') {
      const kind = url.searchParams.get('kind') ?? 'all';
      const target = url.searchParams.get('target') ?? 'all';
      const limit = Math.min(Number.parseInt(url.searchParams.get('limit') ?? '80', 10) || 80, 400);
      const entries = await buildStream(kind, target, limit);
      json(res, 200, { generatedAt: new Date().toISOString(), kind, target, entries });
      return;
    }

    if (url.pathname === '/api/openplanner/search') {
      const query = (url.searchParams.get('q') ?? '').trim();
      const limit = Math.min(Number.parseInt(url.searchParams.get('limit') ?? '20', 10) || 20, 100);
      if (!query) {
        json(res, 200, { results: [] });
        return;
      }
      const results = await searchOpenPlanner(query, limit).catch((error) => ({ error: error instanceof Error ? error.message : String(error) }));
      json(res, 200, results);
      return;
    }

    if (url.pathname === '/api/openplanner/backfill' && req.method === 'POST') {
      json(res, 200, await backfillOpenPlanner());
      return;
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = await readFile(join(__dirname, 'index.html'), 'utf8');
      text(res, 200, html, 'text/html; charset=utf-8');
      return;
    }

    json(res, 404, { error: 'not_found' });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[cephalon-dashboard] listening on http://0.0.0.0:${PORT}`);
});
