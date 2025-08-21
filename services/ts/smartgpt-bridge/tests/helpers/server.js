import { buildFastifyApp } from '../../src/fastifyApp.js';

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
                headers: { 'content-type': 'application/json', ...this._headers },
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
        get: (p) => new Req('GET', p),
        post: (p) => new Req('POST', p),
    };
}

export const withServer = async (root, fn) => {
    process.env.NODE_ENV = 'test';
    const app = buildFastifyApp(root);
    await app.ready();
    try {
        const client = makeClient(app);
        return await fn(client);
    } finally {
        await app.close();
    }
};
