import test from "ava";

import {
  AppDefinition,
  defineAgent,
  defineApp,
  defineNodeService,
  definePythonService,
} from "../index.js";

const baseEnv: Readonly<Record<string, string>> = Object.freeze({
  PM2_PROCESS_NAME: "demo",
  HEARTBEAT_PORT: String(defineApp.HEARTBEAT_PORT),
  PYTHONUNBUFFERED: "1",
  PYTHONPATH: defineApp.PYTHONPATH,
  CHECK_INTERVAL: String(1000 * 60 * 5),
  HEARTBEAT_TIMEOUT: String(1000 * 60 * 10),
});

test("defineApp applies defaults and normalizes env values", (t) => {
  const app = defineApp("demo", "index.js", ["--flag"], {
    cwd: "/srv",
    watch: ["src"],
    env: { numeric: 42 },
    exec_mode: "cluster",
    instances: 2,
  });

  t.is(app.name, "demo");
  t.is(app.exec_mode, "cluster");
  t.deepEqual(app.args, ["--flag"]);
  t.like(app.env, { numeric: "42", ...baseEnv });
  t.true(Array.isArray(app.ignore_watch));
});

test("defineApp omits optional fields when unset", (t) => {
  const app = defineApp("demo", "index.js");
  t.false(Object.prototype.hasOwnProperty.call(app, "cwd"));
  t.false(Object.prototype.hasOwnProperty.call(app, "watch"));
  t.false(Object.prototype.hasOwnProperty.call(app, "env_file"));
});

test("definePythonService wraps defineApp with pipenv runner", (t) => {
  const app = definePythonService("duck", "/agents/duck", { watch: "src" });
  t.is(app.script, "pipenv");
  t.deepEqual(app.args, ["run", "python", "-m", "main"]);
  t.is(app.cwd, "/agents/duck");
  t.deepEqual(app.watch, "src");
});

test("defineNodeService executes current directory script", (t) => {
  const app = defineNodeService("duck", "/agents/duck");
  t.is(app.script, ".");
  t.is(app.cwd, "/agents/duck");
  t.deepEqual(app.args, []);
});

test("defineAgent namespaces applications and injects agent name", (t) => {
  const apps: readonly AppDefinition[] = [
    defineApp("broker", "broker.js"),
    defineApp("listener", "listener.js"),
  ];
  const agent = defineAgent("duck", apps, { region: "west" });

  t.is(agent.name, "duck");
  t.is(agent.region, "west");
  const names = agent.apps.map((app) => app.name);
  t.deepEqual(names, ["duck_broker", "duck_listener"]);
  t.true(agent.apps.every((app) => app.env?.AGENT_NAME === "duck"));
});
