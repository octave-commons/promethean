import test from "ava";
import { loadConfig } from "../config/load-config.js";

test("loadConfig defaults when nothing set", (t) => {
  const cfg = loadConfig({});
  t.is(cfg.transport, "http");
  t.deepEqual(cfg.tools, []);
});
