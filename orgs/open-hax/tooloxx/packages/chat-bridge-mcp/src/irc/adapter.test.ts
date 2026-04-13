import test from "node:test";
import assert from "node:assert/strict";

import { parseIrcLine } from "./adapter.js";

test("parseIrcLine handles prefixed PRIVMSG lines", () => {
  assert.deepEqual(
    parseIrcLine(":duck!user@example PRIVMSG #ussycode :hello world"),
    {
      prefix: "duck!user@example",
      command: "PRIVMSG",
      params: ["#ussycode", "hello world"],
    },
  );
});

test("parseIrcLine handles server numeric replies", () => {
  assert.deepEqual(
    parseIrcLine(":irc.ussyco.de 353 chatbridge = #ussycode :@duck +goose swan"),
    {
      prefix: "irc.ussyco.de",
      command: "353",
      params: ["chatbridge", "=", "#ussycode", "@duck +goose swan"],
    },
  );
});
