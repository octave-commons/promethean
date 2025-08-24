import { WebSocket, RawData } from 'ws';
import { EventEmitter } from 'events';

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
        this.ws.on('message', (data: RawData) => {
            try {
                const msg = JSON.parse(data.toString());
                this.emit('message', msg as BridgeMessage);
            } catch {
                // ignore
            }
        });
    }

    send(msg: BridgeMessage) {
        this.ws.send(JSON.stringify(msg));
    }

    close() {
        this.ws.close();
    }
}

let singleton: Bridge | null = null;
export function getBridge(): Bridge {
    if (!singleton) {
        const url = process.env.SMARTGPT_BRIDGE_URL || 'ws://localhost:8091';
        singleton = new Bridge(url);
    }
    return singleton;
}

export function resetBridge() {
    if (singleton) {
        singleton.close();
        singleton = null;
    }
}
