import { tool } from '@opencode-ai/plugin/tool';
import { IndexerServiceClient, type IndexerServiceConfig } from './indexer-client';

// --- Helpers ---
function formatError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function formatSearchResults(results: any[], query: string): string {
  if (!results.length) return `🔍 No results for "${query}"`;
  const lines = results.map((res, i) => {
    const pct = (res.score * 100).toFixed(1);
    const meta = res.metadata
      ? ` (${res.metadata.fileType || 'unknown'}, ${Math.round((res.metadata.size || 0) / 1024)}KB)`
      : '';
    const snippet = res.content.slice(0, 500) + (res.content.length > 500 ? '...' : '');
    return `${i + 1}. **${res.path}** [${pct}%]${meta}

\`\`\`${res.metadata?.fileType || 'text'}
${snippet}
\`\`\``;
  });
  return `🔍 Found ${results.length} results for "${query}":\n\n${lines.join('\n\n')}`;
}

// --- Tool Factories ---
export function healthTool(baseUrl: string) {
  return tool({
    description: 'Health check for indexer service',
    args: {},
    async execute() {
      try {
        const resp = await fetch(`${baseUrl}/health`);
        const json = (await resp.json()) as { ok: boolean };
        return json.ok
          ? `✅ Service healthy at ${baseUrl}`
          : `❌ Unhealthy: ${JSON.stringify(json)}`;
      } catch (e) {
        return `❌ Connection failed: ${formatError(e)}`;
      }
    },
  });
}

export function statusTool(client: IndexerServiceClient) {
  return tool({
    description: 'Get indexer status',
    args: {},
    async execute() {
      try {
        return JSON.stringify(await client.status(), null, 2);
      } catch (e) {
        return `❌ Status failed: ${formatError(e)}`;
      }
    },
  });
}

export function searchTool(client: IndexerServiceClient) {
  return tool({
    description: 'Semantic search',
    args: {
      query: tool.schema.string().min(1),
      maxResults: tool.schema.number().int().min(1).max(50).default(8),
    },
    async execute({ query, maxResults }) {
      try {
        const resp = await client.search(query, maxResults);
        if (!resp.ok) return `❌ Search error: ${(resp as { error: string }).error}`;
        return formatSearchResults((resp as { results: any[] }).results, query);
      } catch (e) {
        return `❌ Search failed: ${formatError(e)}`;
      }
    },
  });
}

export function indexTool(client: IndexerServiceClient) {
  return tool({
    description: 'Index a file',
    args: { path: tool.schema.string().min(1) },
    async execute({ path }) {
      try {
        const resp = await client.indexPath(path);
        if (!resp.ok) return `❌ Index error: ${(resp as { error: string }).error}`;
        const r = resp as { queued?: number; ignored?: number; mode?: string };
        const msg = r.queued ? `queued` : `ignored`;
        return `✅ ${path} ${msg} (mode ${r.mode || 'single'})`;
      } catch (e) {
        return `❌ Index failed: ${formatError(e)}`;
      }
    },
  });
}

export function reindexFilesTool(client: IndexerServiceClient) {
  return tool({
    description: 'Reindex file patterns',
    args: { patterns: tool.schema.array(tool.schema.string()).min(1) },
    async execute({ patterns }) {
      try {
        const resp = await client.reindexFiles(patterns);
        if (!resp.ok) return `❌ Reindex error: ${(resp as { error: string }).error}`;
        const r = resp as { queued?: number; ignored?: number };
        return `✅ Scheduled: ${patterns.join(', ')} (queued ${r.queued || 0}, ignored ${r.ignored || 0})`;
      } catch (e) {
        return `❌ Reindex failed: ${formatError(e)}`;
      }
    },
  });
}

export function reindexAllTool(client: IndexerServiceClient) {
  return tool({
    description: 'Full reindex',
    args: {},
    async execute() {
      try {
        const st = await client.status();
        if (st.busy) return '⚠️ Busy';
        const resp = await client.reindexAll();
        if (!resp.ok) return `❌ Error: ${(resp as { error: string }).error}`;
        const r = resp as { queued?: number };
        return `✅ Full reindex queued (${r.queued || 0})`;
      } catch (e) {
        return `❌ Full reindex failed: ${formatError(e)}`;
      }
    },
  });
}

export function removeTool(client: IndexerServiceClient) {
  return tool({
    description: 'Remove from index',
    args: { path: tool.schema.string().min(1) },
    async execute({ path }) {
      try {
        const resp = await client.removePath(path);
        if (!resp.ok) return `❌ Remove error: ${(resp as { error: string }).error}`;
        return `✅ Removed ${path}`;
      } catch (e) {
        return `❌ Remove failed: ${formatError(e)}`;
      }
    },
  });
}

export function resetTool(client: IndexerServiceClient) {
  return tool({
    description: 'Reset indexer',
    args: { confirm: tool.schema.boolean().default(false) },
    async execute({ confirm }) {
      if (!confirm) return '⚠️ Confirm to reset';
      try {
        const st = await client.status();
        if (st.busy) return '⚠️ Busy';
        const resp = await client.reset();
        if (!resp.ok) return `❌ Reset error: ${(resp as { error: string }).error}`;
        return '✅ Reset complete';
      } catch (e) {
        return `❌ Reset failed: ${formatError(e)}`;
      }
    },
  });
}

export function configureTool(clientRef: {
  client: IndexerServiceClient;
  cfg: IndexerServiceConfig;
}) {
  return tool({
    description: 'Configure service URL',
    args: { baseUrl: tool.schema.string().url() },
    async execute({ baseUrl }) {
      try {
        const newCfg = { ...clientRef.cfg, baseUrl };
        const test = new IndexerServiceClient(newCfg);
        await test.status();
        clientRef.cfg = newCfg;
        clientRef.client = test;
        return `✅ URL set to ${baseUrl}`;
      } catch (e) {
        return `❌ Config failed: ${formatError(e)}`;
      }
    },
  });
}

export function batchTool(client: IndexerServiceClient) {
  return tool({
    description: 'Batch ops',
    args: {
      operations: tool.schema.array(
        tool.schema.object({
          type: tool.schema.enum(['index', 'reindex', 'remove']),
          path: tool.schema.string(),
          patterns: tool.schema.array(tool.schema.string()).optional(),
        }),
      ),
    },
    async execute({ operations }) {
      const results = await Promise.all(
        operations.map(async (op) => {
          try {
            let res;
            if (op.type === 'index') res = await client.indexPath(op.path);
            else if (op.type === 'reindex')
              res = await client.reindexFiles(op.patterns || [op.path]);
            else res = await client.removePath(op.path);
            return { op, success: (res as { ok: boolean }).ok, res };
          } catch (e) {
            return { op, success: false, error: formatError(e) };
          }
        }),
      );
      const okCount = results.filter((r) => r.success).length;
      const msg = `✅ ${okCount}, ❌ ${results.length - okCount}`;
      return (
        msg +
        '\n' +
        results
          .map((r, i) => `${i + 1}. ${r.op.type} ${r.op.path} - ${r.success ? 'OK' : r.error}`)
          .join('\n')
      );
    },
  });
}
