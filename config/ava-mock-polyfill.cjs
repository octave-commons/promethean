const { pathToFileURL } = require("node:url");

async function patch() {
  try {
    const path = require("node:path");
    const entryPath = require.resolve("ava");
    const entryDir = path.dirname(entryPath);
    const packageDir = path.dirname(entryDir);
    const moduleUrl = pathToFileURL(path.join(packageDir, "lib/test.js"));
    const mod = await import(moduleUrl.href);
    const TestClass = mod?.default;
    if (
      !TestClass ||
      typeof TestClass.prototype.createExecutionContext !== "function"
    ) {
      return;
    }
    const original = TestClass.prototype.createExecutionContext;
    if (original.__avaMockPolyfillApplied) {
      return;
    }
    const attachMockApi = (ctx) => {
      if (!ctx || typeof ctx !== "object" || ctx.mock) {
        return ctx;
      }
      const method = function method(target, property, implementation) {
        if (typeof target !== "object" || target === null) {
          throw new TypeError("mock.method target must be an object");
        }
        if (typeof implementation !== "function") {
          throw new TypeError("mock.method implementation must be a function");
        }
        const originalValue = target[property];
        const restore = () => {
          target[property] = originalValue;
        };
        target[property] = implementation;
        return { restore };
      };
      Object.defineProperty(ctx, "mock", {
        configurable: true,
        enumerable: false,
        value: { method },
        writable: false,
      });
      return ctx;
    };
    const patched = function patchedCreateExecutionContext(...args) {
      const ctx = original.apply(this, args);
      return attachMockApi(ctx);
    };
    patched.__avaMockPolyfillApplied = true;
    TestClass.prototype.createExecutionContext = patched;
  } catch (error) {
    console.warn("Failed to patch AVA ExecutionContext for mock API:", error);
  }
}

patch();
