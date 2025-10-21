import { Plugin } from '@opencode-ai/plugin';

import { IndexerServiceClient, type IndexerServiceConfig } from './indexer-client.js';
import {
  healthTool,
  statusTool,
  searchTool,
  indexTool,
  reindexFilesTool,
  reindexAllTool,
  removeTool,
  resetTool,
  configureTool,
  batchTool,
} from './indexer-tools.js';

// --- Plugin Definition ---
export const IndexerServicePlugin: Plugin = async () => {
  const cfg: IndexerServiceConfig = {
    baseUrl: process.env.INDEXER_SERVICE_URL || 'http://localhost:4260',
    headers: { 'User-Agent': 'opencode-plugin/1.0' },
  };
  const client = new IndexerServiceClient(cfg);
  // bind clientRef for reconfigure
  const clientRef = { client, cfg };

  return {
    tool: {
      indexer_health_check: healthTool(cfg.baseUrl),
      indexer_status: statusTool(client),
      indexer_search: searchTool(client),
      indexer_index_file: indexTool(client),
      indexer_reindex_files: reindexFilesTool(client),
      indexer_reindex_all: reindexAllTool(client),
      indexer_remove_file: removeTool(client),
      indexer_reset: resetTool(client),
      indexer_configure: configureTool(clientRef),
      indexer_batch_operations: batchTool(client),
    },
  };
};
