import { configDotenv } from "dotenv";
import { buildFastifyApp } from "./fastifyApp.js";
import { scheduleChromaCleanup } from "./logging/chromaCleanup.js";
import { instrumentFastify } from "./debug/fastify-instrumentation.js";

configDotenv(); // throw on failure if you actually require it

const PORT = Number(process.env.PORT ?? 3210);
const ROOT_PATH = process.env.ROOT_PATH ?? process.cwd();

const app = await buildFastifyApp(ROOT_PATH);

// further instrumentation
const originalRegister = (app as any).register.bind(app);
(app as any).register = (plugin: any, opts?: any) => {
  const name =
    plugin?.name && plugin.name !== "plugin"
      ? plugin.name
      : (plugin?.[Symbol.for("fastify.display-name")] ??
        (plugin?.default?.name || "anonymous-plugin"));

  app.log.info({ plugin: name }, "register start");

  // Wrap plugin to inject a per-plugin onReady probe
  const wrappedPlugin = async (instance: any, options: any) => {
    instance.addHook("onReady", async () => {
      instance.log.info({ plugin: name }, "plugin onReady reached");
    });
    return plugin(instance, options);
  };

  const res = originalRegister(wrappedPlugin, opts);
  app.after((err: any) => {
    if (err) app.log.error({ plugin: name, err }, "register after error");
    else app.log.info({ plugin: name }, "register after ok");
  });
  return res;
};

instrumentFastify(app, 5000);
scheduleChromaCleanup();

// Diagnose hangs in plugin init
const ready = Promise.resolve(app.ready());
const timer = setTimeout(() => console.error("[hang] app.ready() >5s"), 5000);
await ready.finally(() => clearTimeout(timer));
console.log("fastify app.ready() resolved");

// Extra visibility
app.server.on("error", (e) => console.error("[server error]", e));
app.server.on("listening", () => console.log("[server] low-level listening"));

try {
  const address = await app.listen({ port: PORT, host: "127.0.0.1" }); // or "0.0.0.0"
  console.log(`SmartGPT bridge listening on ${address}`);
} catch (err) {
  console.error("Failed to start server:", err);
  process.exit(1);
}
