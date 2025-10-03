import test from "ava";

import { openWs, type WsFactory } from "./ws.js";

const captureProtocols = () => {
  const calls: ReadonlyArray<string>[] = [];
  const factory: WsFactory = (_url, protocols) => {
    const list = Array.isArray(protocols)
      ? protocols
      : protocols
        ? [protocols]
        : [];
    calls.push(list);
    return {} as ReturnType<WsFactory>;
  };
  return { calls, factory };
};

test("openWs always includes the duck.v1 protocol", (t) => {
  const { calls, factory } = captureProtocols();
  openWs(factory)("wss://duck.example");
  t.deepEqual(calls[0], ["duck.v1"]);
});

test("openWs appends bearer token when provided", (t) => {
  const { calls, factory } = captureProtocols();
  openWs(factory)("wss://duck.example", "secret");
  t.deepEqual(calls[0], ["duck.v1", "bearer.secret"]);
});

test("openWs trims surrounding whitespace on bearer tokens", (t) => {
  const { calls, factory } = captureProtocols();
  openWs(factory)("wss://duck.example", "  tok  ");
  t.deepEqual(calls[0], ["duck.v1", "bearer.tok"]);
});

test("openWs omits bearer protocol when token is only whitespace", (t) => {
  const { calls, factory } = captureProtocols();
  openWs(factory)("wss://duck.example", "   ");
  t.deepEqual(calls[0], ["duck.v1"]);
});
