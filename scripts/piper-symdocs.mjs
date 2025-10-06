import { spawn } from 'node:child_process';

export async function scan(args = {}) {
  const { runScan } = await import('../packages/symdocs/dist/01-scan.js');
  await runScan(args);
}

export async function docs(args = {}) {
  const { runDocs } = await import('../packages/symdocs/dist/02-docs.js');
  await runDocs(args);
}

export async function write(args = {}) {
  const { runWrite } = await import('../packages/symdocs/dist/03-write.js');
  await runWrite(args);
}

export async function graph(args = {}) {
  const { runGraph } = await import('../packages/symdocs/dist/04-graph.js');
  await runGraph(args);
}
