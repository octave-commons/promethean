import { WebSocket, RawData } from "ws";
import { EventEmitter } from "events";

export interface BridgeMessage {
  kind: string;
  id: string;
  [key: string]: any;
}

export class Bridge extends EventEmitter {
  private ws: WebSocket;

  constructor(url: string) {
    super();
    this.ws = new WebSocket(url);
    this.ws.on("message", (data: RawData) => {
      try {
        const msg = JSON.parse(data.toString());
        this.emit("message", msg as BridgeMessage);
      } catch {
        // ignore
      }
    });
  }

  send(msg: BridgeMessage) {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      this.ws.once("open", () => this.ws.send(JSON.stringify(msg)));
    }
  }

  close() {
    this.ws.close();
  }
}

export function createBridge(url?: string): Bridge {
  const target =
    url || process.env.SMARTGPT_BRIDGE_URL || "ws://localhost:8091";
  return new Bridge(target);
}
