// @ts-nocheck
// Adapter to shared RemoteEmbeddingFunction with testable broker injection and timeouts.
import { RemoteEmbeddingFunction as SharedRemoteEmbedding } from "@promethean/embeddings/remote.js";

export class RemoteEmbeddingFunction extends SharedRemoteEmbedding {
  constructor(
    brokerUrl = process.env.BROKER_URL || "ws://localhost:7000",
    driver = process.env.EMBEDDING_DRIVER,
    fn = process.env.EMBEDDING_FUNCTION,
    brokerInstance,
  ) {
    // If a test sets SHARED_IMPORT, dynamically construct a broker and pass it to shared class.
    const prefix = "smartgpt-embed";
    if (brokerInstance) {
      super(brokerUrl, driver, fn, brokerInstance, prefix);
      this._injected = true;
    } else if (process.env.SHARED_IMPORT) {
      // Dynamically import the fake broker for tests
      const modPromise = import(process.env.SHARED_IMPORT);
      // Create a lazy broker instance once module resolves
      const proxy = new Proxy(
        {},
        {
          get:
            (_t, p) =>
            async (...args) => {
              const Mod = await modPromise;
              const Ctor = Mod.default || Mod.BrokerClient || Mod;
              if (!this.__real)
                this.__real = new Ctor({
                  url: brokerUrl,
                  id: `${prefix}-${Math.random().toString(16).slice(2)}`,
                });
              return this.__real[p](...args);
            },
        },
      );
      // Pass proxy to super; methods will delegate once used
      super(brokerUrl, driver, fn, proxy, prefix);
    } else {
      super(brokerUrl, driver, fn, undefined, prefix);
    }
  }

  async generate(texts) {
    const timeoutMs = Number(process.env.EMBEDDING_TIMEOUT_MS || 0);
    if (!timeoutMs) return await super.generate(texts);
    return await Promise.race([
      super.generate(texts),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("embedding timeout")), timeoutMs),
      ),
    ]);
  }

  dispose() {
    try {
      this.broker?.disconnect?.();
    } catch {}
  }
}
