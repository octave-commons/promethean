import { MongoMemoryServer } from "mongodb-memory-server";
import { createServer } from "../../server/createServer.js";

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

  // Disable dual-write to Chroma and skip sink registration to avoid external deps
  process.env.DUAL_WRITE_ENABLED = "false";
  const app = await createServer(root, {
    // No-op to avoid creating Chroma collections in tests
    registerSinks: async () => {},
  });
  // Stub RBAC hooks so tests don't require seeded users/policies
  (app as any).authUser = async () => ({ id: "test" });
  (app as any).requirePolicy = () => async () => {};
  await app.ready();
  try {
    const client = makeClient(app);
    return await fn(client);
  } finally {
    await app.close();
    if (mms) await mms.stop();
    try {
      const { getMongoClient } = await import(
        "@promethean/persistence/clients.js"
      );
      const mongo = await getMongoClient();
      await mongo.close();
    } catch {}
  }
};
