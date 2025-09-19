import { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";
import { validateEnvelope } from "@promethean/enso-protocol/validate.js";
import { Rooms } from "./state/rooms.js";
import { Router } from "./transport/router.js";

const wss = new WebSocketServer({ port: 7747 });
const rooms = new Rooms();
const router = new Router(rooms);

wss.on("connection", (ws) => {
  const sessionId = uuid();
  ws.on("message", async (buf) => {
    const env = validateEnvelope(buf);
    await router.handle(ws, sessionId, env); // dispatch by type
  });
});
