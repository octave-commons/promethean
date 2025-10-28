import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import test from "ava";

import { loadStdioServerSpecs } from "../proxy/config.js";

test("loadStdioServerSpecs parses minimal config", async (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), "mcp-proxy-"));
  const file = path.join(dir, "servers.edn");
  const edn =
    '{:mcp-servers {:foo {:command "./bin/foo.sh" :args ["--stdio"] :http-path "/custom"}}}';
  writeFileSync(file, edn, "utf8");

  const specs = await loadStdioServerSpecs(file);
  t.is(specs.length, 1);
  const spec = specs[0]!;
  t.is(spec.name, "foo");
  t.is(spec.httpPath, "/custom");
  t.true(spec.command.endsWith(path.join("bin", "foo.sh")));
  t.deepEqual(spec.args, ["--stdio"]);
});

test("loadStdioServerSpecs skips disabled entries and expands defaults", async (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), "mcp-proxy-"));
  const file = path.join(dir, "servers.edn");
  const edn = `{:mcp-servers {:foo {:command "npx" :args ["pkg"]} :bar {:command "ignored" :disabled true}}}`;
  writeFileSync(file, edn, "utf8");

  const specs = await loadStdioServerSpecs(file);
  t.is(specs.length, 1);
  t.is(specs[0]?.name, "foo");
  t.is(specs[0]?.httpPath, "/foo/mcp");
  t.deepEqual(specs[0]?.args, ["pkg"]);
});

test("loadStdioServerSpecs expands environment variables in paths", async (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), "mcp-proxy-"));
  const file = path.join(dir, "servers.edn");
  const edn = `{:mcp-servers {:foo {:command "npx" :cwd "$HOME"}}}`;
  writeFileSync(file, edn, "utf8");

  const specs = await loadStdioServerSpecs(file);
  t.is(specs.length, 1);
  t.is(specs[0]?.cwd, process.env.HOME);
});

test("loadStdioServerSpecs leaves package-style args unresolved", async (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), "mcp-proxy-"));
  const file = path.join(dir, "servers.edn");
  const edn = `{:mcp-servers {:foo {:command "npx" :args ["tritlo/lsp-mcp"]}}}`;
  writeFileSync(file, edn, "utf8");

  const specs = await loadStdioServerSpecs(file);
  t.is(specs.length, 1);
  t.is(specs[0]?.args[0], "tritlo/lsp-mcp");
});
