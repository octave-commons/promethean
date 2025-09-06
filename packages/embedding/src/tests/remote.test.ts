import test from 'ava';
import { RemoteEmbeddingFunction } from '../remote.js';

class StubBroker {
  async connect() {}
  subscribe() {}
  enqueue() {}
}

test('exposes supported spaces', t => {
  const fn = new RemoteEmbeddingFunction(undefined, undefined, undefined, new StubBroker() as any);
  t.deepEqual(fn.supportedSpaces(), ['l2', 'cosine']);
});
