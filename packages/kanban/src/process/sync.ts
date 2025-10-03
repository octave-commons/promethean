import { promises as fs } from 'node:fs';
import yaml from 'yaml';

export type ProcessSyncOptions = {
  processFile?: string;
  owner?: string;
  repo?: string;
  token?: string;
};

export async function processSync(opts: ProcessSyncOptions) {
  const file = opts.processFile || process.env.KANBAN_PROCESS_FILE;
  if (!file) return { ok: false, reason: 'no-process-file' };
  const raw = await fs.readFile(file, 'utf8');
  const cfg = yaml.parse(raw);
  return { ok: true, name: cfg?.name || cfg?.milestone || 'process', tasks: Object.keys(cfg?.pr_rules || {}), checklists: Object.keys(cfg?.checklists || {}) };
}
