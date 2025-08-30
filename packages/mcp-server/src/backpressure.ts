import type { WebSocket } from "ws";

export function createSender(ws: WebSocket, maxBuffer = 1 << 20) {
  return (msg: any): boolean => {
    if (msg.method === "tools/progress" && ws.bufferedAmount > maxBuffer) {
      return false;
    }
    ws.send(JSON.stringify(msg));
    return true;
  };
}
