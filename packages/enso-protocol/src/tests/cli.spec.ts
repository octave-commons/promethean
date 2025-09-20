import test from "ava";
import { ContextRegistry } from "../registry.js";
import { runCliCommand } from "../cli.js";

function registerDemoSource(registry: ContextRegistry, location: string) {
  return registry.registerSource({
    id: { kind: "enso-asset", location },
    owners: [{ userId: "owner" }],
    discoverability: "visible",
    availability: { mode: "public" },
    title: "Fixture",
    contentHints: { mime: "text/plain" },
  });
}

test("help command prints usage information", async (t) => {
  const logs: string[] = [];
  await runCliCommand("help", { log: (message) => logs.push(message) });
  t.true(logs.some((line) => line.includes("enso-protocol CLI")));
  t.true(logs.some((line) => line.includes("list-sources")));
});

test("list-sources emits JSON describing registered sources", async (t) => {
  const registry = new ContextRegistry();
  registerDemoSource(registry, "enso://asset/alpha");
  const logs: string[] = [];
  await runCliCommand("list-sources", { registry, log: (message) => logs.push(message) });
  t.true(logs.length > 0);
  const payload = JSON.parse(logs.at(-1)!);
  t.is(payload.length, 1);
  t.is(payload[0].id.location, "enso://asset/alpha");
  t.is(payload[0].title, "Fixture");
});

test("create-demo-context seeds a demo source when registry empty", async (t) => {
  const registry = new ContextRegistry();
  const logs: string[] = [];
  await runCliCommand("create-demo-context", { registry, log: (message) => logs.push(message) });
  t.true(registry.listSources().length > 0);
  const context = JSON.parse(logs.at(-1)!);
  t.is(context.name, "demo");
  t.true(Array.isArray(context.entries));
  t.true(context.entries.length > 0);
  const entryLocations = context.entries.map((entry: { id: { location: string } }) => entry.id.location);
  t.deepEqual(entryLocations, registry.listSources().map((source) => source.id.location));
});

test("create-demo-context reuses preexisting sources", async (t) => {
  const registry = new ContextRegistry();
  registerDemoSource(registry, "enso://asset/beta");
  registerDemoSource(registry, "enso://asset/gamma");
  const before = registry.listSources().map((meta) => meta.id.location);
  const logs: string[] = [];
  await runCliCommand("create-demo-context", { registry, log: (message) => logs.push(message) });
  const after = registry.listSources().map((meta) => meta.id.location);
  t.deepEqual(after, before);
  const context = JSON.parse(logs.at(-1)!);
  t.is(context.entries.length, before.length);
  const contextLocations = context.entries.map((entry: { id: { location: string } }) => entry.id.location);
  t.deepEqual(contextLocations.sort(), [...before].sort());
});

test("unknown command reports error and exits with failure", async (t) => {
  const registry = new ContextRegistry();
  const errors: string[] = [];
  const exitError = new Error("exit:1");
  const exitFn = (() => {
    throw exitError;
  }) as (code: number) => never;
  const execution = runCliCommand("nope", {
    registry,
    error: (message) => errors.push(message),
    exit: exitFn,
  });
  const thrown = await t.throwsAsync(execution, { is: exitError });
  t.is(thrown, exitError);
  t.deepEqual(errors, ["Unknown command: nope"]);
});
