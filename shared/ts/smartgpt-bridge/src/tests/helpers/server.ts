// @ts-nocheck
import { buildFastifyApp } from "../../fastifyApp.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import sinon from "sinon";
import * as persistenceClients from "@promethean/persistence/clients.js";

function makeClient(app) {
  const u = (path, query) => {
    if (!query || Object.keys(query).length === 0) return path;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) params.append(k, String(v));
    return `${path}?${params.toString()}`;
  };
  class Req {
    constructor(method, path) {
      this.method = method;
      this.path = path;
      this._query = {};
      this._body = undefined;
      this._headers = {};
    }
    query(obj) {
      this._query = obj || {};
      return this;
    }
    send(obj) {
      this._body = obj;
      return this;
    }
    set(key, value) {
      this._headers[key] = value;
      return this;
    }
    async expect(code) {
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
    get: (p) => new Req("GET", p),
    post: (p) => new Req("POST", p),
  };
}

export const withServer = async (root, fn) => {
  process.env.NODE_ENV = "test";
  // Avoid native addon crashes in CI/local when ABI mismatches
  if (!process.env.NODE_PTY_DISABLED) process.env.NODE_PTY_DISABLED = "1";
  // Use in-memory Mongo by default for tests
  let mms;
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI === "memory") {
    mms = await MongoMemoryServer.create();
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
  const chromaStub = sinon
    .stub(persistenceClients, "getChromaClient")
    .resolves(fakeChroma);

  const app = await buildFastifyApp(root);
  // Stub RBAC hooks so tests don't require seeded users/policies
  app.authUser = async () => ({ id: "test" });
  app.requirePolicy = () => async () => {};
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
