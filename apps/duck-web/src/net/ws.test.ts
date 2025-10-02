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
});
