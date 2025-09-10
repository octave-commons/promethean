import { MongoMemoryServer } from "mongodb-memory-server";
import sinon from "sinon";
import * as persistenceClients from "@promethean/persistence/clients.js";

import { buildFastifyApp } from "../../fastifyApp.js";

function makeClient(app: any) {
  const u = (path: string, query?: Record<string, unknown>) => {
    if (!query || Object.keys(query).length === 0) return path;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) params.append(k, String(v));
    return `${path}?${params.toString()}`;
  };
  class Req {
    method: string;
    path: string;
    _query: Record<string, unknown>;
    _body: any;
    _headers: Record<string, string>;
    constructor(method: string, path: string) {
      this.method = method;
      this.path = path;
      this._query = {};
      this._body = undefined;
      this._headers = {};
    }
    query(obj?: Record<string, unknown>) {
      this._query = obj || {};
      return this;
    }
    send(obj: any) {
      this._body = obj;
      return this;
    }
    set(key: string, value: string) {
      this._headers[key] = value;
      return this;
    }
    async expect(code: number) {
      const res = await app.inject({
        method: this.method,
        url: u(this.path, this._query),
        payload: this._body,
        headers: { "content-type": "application/json", ...this._headers },
      });
      const status = res.statusCode;
      let body;
      try {
        body = res.json();
      } catch {
        body = res.payload;
      }
      if (status !== code) {
        const msg = `Expected ${code} got ${status}: ${res.payload}`;
        throw new Error(msg);
      }
      return { status, body };
    }
  }
  return {
    get: (p: string) => new Req("GET", p),
    post: (p: string) => new Req("POST", p),
  };
}

export const withServer = async (
  root: string,
  fn: (client: any) => Promise<any>,
) => {
  process.env.NODE_ENV = "test";
  // Avoid native addon crashes in CI/local when ABI mismatches
  if (!process.env.NODE_PTY_DISABLED) process.env.NODE_PTY_DISABLED = "1";
  // Use in-memory Mongo by default for tests
  let mms: MongoMemoryServer | undefined;
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI === "memory") {
    let lastErr: any = null;
    for (let i = 0; i < 5; i++) {
      try {
        mms = await MongoMemoryServer.create({ instance: { port: 0 } });
        break;
      } catch (e: any) {
        lastErr = e;
        if (!/already in use/i.test(String(e?.message || e))) throw e;
      }
    }
    if (!mms) throw lastErr || new Error("mongo memory start failed");
    process.env.MONGODB_URI = mms.getUri();
  }

  const fakeChroma = {
    getOrCreateCollection: async () => ({
      add: async () => {},
      query: async () => ({ ids: [], documents: [], metadatas: [] }),
      count: async () => 0,
      get: async () => ({ ids: [] }),
      delete: async () => {},
    }),
  };
  // NOTE: chromadb types vary across workspace versions; runtime mock is minimal.
  const chromaStub = sinon
    .stub(persistenceClients, "getChromaClient")
    // @ts-expect-error test stub returns a minimal client shape used by code
    .resolves(fakeChroma);

  const app = await buildFastifyApp(root);
  // Stub RBAC hooks so tests don't require seeded users/policies
  (app as any).authUser = async () => ({ id: "test" });
  (app as any).requirePolicy = () => async () => {};
  await app.ready();
  try {
    const client = makeClient(app);
    return await fn(client);
  } finally {
    await app.close();
    chromaStub.restore();
    if (mms) await mms.stop();
    const mongo = await persistenceClients.getMongoClient();
    await mongo.close();
  }
};
