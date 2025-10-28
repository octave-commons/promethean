import test from 'ava';

import {
  __resetOllamaForTests,
  ollamaPull,
  ollamaGetQueue,
  ollamaCreateTemplate,
  ollamaListTemplates,
  ollamaEnqueueJobFromTemplate,
} from '../src/tools/ollama.js';

const ctx = {
  env: {},
  fetch,
  now: () => new Date(),
} as const;

test.beforeEach(() => {
  __resetOllamaForTests();
});

test('queues a pull job and reports in pending', async (t) => {
  const pull = ollamaPull(ctx);
  const getQ = ollamaGetQueue(ctx);
  await pull.invoke({ modelName: 'llama3' });
  const q = await getQ.invoke(undefined) as any;
  t.is(q.pending.length, 1);
  t.is(q.inProgress.length, 0);
  t.is(q.completed.length, 0);
});

test('templates can be created and enqueued by name', async (t) => {
  const create = ollamaCreateTemplate(ctx);
  const list = ollamaListTemplates(ctx);
  const fromTpl = ollamaEnqueueJobFromTemplate(ctx);
  await create.invoke({ templateName: 'hello', src: '(define-template hello [] "hi")' });
  const after = await list.invoke(undefined) as any;
  t.truthy(after.templates.find((x: any) => x.name === 'hello'));
  const enq = await fromTpl.invoke({ templateName: 'hello' }) as any;
  t.truthy(enq.jobId);
});
