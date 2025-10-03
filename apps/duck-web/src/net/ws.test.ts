import test from "ava";
import { openWs, protocolsForBearer, type WsFactory } from "./ws";

test("protocolsForBearer omits bearer subprotocol when token is missing", (t) => {
  t.deepEqual(protocolsForBearer(undefined), ["duck.v1"]);
  t.deepEqual(protocolsForBearer("   "), ["duck.v1"]);
});

test("protocolsForBearer trims bearer token and appends subprotocol", (t) => {
  t.deepEqual(protocolsForBearer("  tok  "), ["duck.v1", "bearer.tok"]);
});

test("openWs forwards computed protocols to the WebSocket factory", (t) => {
  const calls: Array<string[] | string | undefined> = [];
  const mkWs: WsFactory = (_url, protocols) => {
    calls.push(
      Array.isArray(protocols)
        ? [...protocols]
        : protocols === undefined
          ? undefined
          : [protocols],
    );
    return {} as unknown as WebSocket;
  };

  const connect = openWs(mkWs);
  connect("wss://duck.example");
  connect("wss://duck.example", "  tok  ");

  t.deepEqual(calls[0], ["duck.v1"]);
  t.deepEqual(calls[1], ["duck.v1", "bearer.tok"]);

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
