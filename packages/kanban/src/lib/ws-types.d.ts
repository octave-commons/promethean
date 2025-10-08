declare module 'ws' {
  export class WebSocket {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;

    readyState: number;
    constructor(address?: string, options?: unknown);
    send(data: string | Buffer): void;
    close(code?: number, reason?: string): void;
    addEventListener(event: string, listener: (...args: any[]) => void): void;
    removeEventListener(event: string, listener: (...args: any[]) => void): void;
    on(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;
  }

  export class WebSocketServer {
    constructor(options?: { port?: number; host?: string; path?: string; noServer?: boolean });
    close(): void;
    on(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;
    handleUpgrade(request: any, socket: any, head: any, callback: (ws: WebSocket) => void): void;
    emit(event: string, ...args: any[]): void;
  }
}