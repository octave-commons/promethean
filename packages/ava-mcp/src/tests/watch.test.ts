import { EventEmitter } from "node:events";

import test from "ava";
import esmock from "esmock";

function setupServer() {
  const handlers: Record<string, any> = {};
  const server = {
    registerTool: (_n: string, _s: unknown, h: any) => {
      handlers[_n] = h;
    },
  } as any;
  return { handlers, server };
}

test.serial("stopWatch clears buffer and waits for exit", async (t) => {
  const { handlers, server } = setupServer();
  const cp = await import("node:child_process");
  let spawned: any;
  const fakeSpawn = () => {
    spawned = new EventEmitter();
    spawned.stdout = new EventEmitter();
    spawned.stderr = new EventEmitter();
    spawned.kill = () => spawned.emit("exit", 0);
    return spawned;
  };
  const toolsPath = new URL("../tools.js", import.meta.url).pathname;
  const { registerTddTools: reg } = await esmock(toolsPath, {
    "node:child_process": { ...cp, spawn: fakeSpawn },
  });
  reg(server);
  await handlers["tdd.startWatch"]({});
  spawned.stdout.emit("data", "hello");
  const changes = await handlers["tdd.getWatchChanges"]();
  t.true(changes.output.includes("hello"));
  const stopped = await handlers["tdd.stopWatch"]();
  t.true(stopped.stopped);
  t.is(stopped.output, "");
  await t.throwsAsync(() => handlers["tdd.getWatchChanges"](), {
    message: /watch not running/,
  });
});

test.serial("watch start handles spawn errors", async (t) => {
  const { handlers, server } = setupServer();
  const cp = await import("node:child_process");
  const fakeSpawn = () => {
    const proc: any = new EventEmitter();
    proc.stdout = new EventEmitter();
    proc.stderr = new EventEmitter();
    proc.kill = () => {};
    setImmediate(() => proc.emit("error", new Error("spawn fail")));
    return proc;
  };
  const toolsPath = new URL("../tools.js", import.meta.url).pathname;
  const { registerTddTools: reg } = await esmock(toolsPath, {
    "node:child_process": { ...cp, spawn: fakeSpawn },
  });
  reg(server);
  await handlers["tdd.startWatch"]({});
  await new Promise((res) => setImmediate(res));
  await t.throwsAsync(() => handlers["tdd.getWatchChanges"](), {
    message: /watch not running/,
  });
  const stopped = await handlers["tdd.stopWatch"]();
  t.false(stopped.stopped);
});
