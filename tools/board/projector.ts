import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, '..', '..');
const INDEX_FILE = path.join(REPO, 'boards', 'index.jsonl');

type IndexedTask = {
  id: string;
  title: string;
  status: string;
  owner: string;
  labels: string[];
  path: string;
};

const readIndex = async (): Promise<IndexedTask[]> => {
  const data = await readFile(INDEX_FILE, 'utf8').catch(() => '');
  return data.split('\n').filter(Boolean).map(line => JSON.parse(line));
};

const main = async () => {
  const args = new Set(process.argv.slice(2));
  const apply = args.has('--apply');
  const tasks = await readIndex();
  if (!tasks.length) {
    console.error('No index found. Run: pnpm tsx tools/board/indexer.ts --write');
    process.exit(1);
  }
  const plan = tasks.map(t => ({
    action: 'ensure-issue',
    id: t.id,
    title: t.title,
    labels: t.labels,
    status: t.status
  }));
  if (apply) {
    console.log(JSON.stringify({ wouldApply: true, count: plan.length }, null, 2));
  } else {
    console.log(JSON.stringify({ dryRun: true, count: plan.length, sample: plan.slice(0, 3) }, null, 2));
  }
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
