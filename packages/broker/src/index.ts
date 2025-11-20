import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'node:crypto';

interface ClientData {
  id: string;
  topics: Set<string>;
}

interface Message {
  action?: string;
  topic?: string;
  message?: Event;
  correlationId?: string;
  replyTo?: string;
}

interface Event {
  type: string;
  source?: string;
  payload?: unknown;
  timestamp?: string;
  correlationId?: string;
  replyTo?: string;
}

const subscriptions = new Map<string, Set<WebSocket>>(); // topic -> Set of ws
const clients = new Map<WebSocket, ClientData>(); // ws -> { id, topics:Set }

function normalize(message: Partial<Event>): Event {
  const event: Event = {
    type: message.type || '',
    source: message.source,
    payload: message.payload,
    timestamp: message.timestamp || new Date().toISOString(),
  };
  if (message.correlationId) event.correlationId = message.correlationId;
  if (message.replyTo) event.replyTo = message.replyTo;
  return event;
}

function route(event: Event, _sender: WebSocket): void {
  const subs = subscriptions.get(event.type);
  if (!subs) return;
  for (const ws of subs) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ event }));
      } catch (err) {
        console.warn('failed to send', err);
      }
    }
  }
}

export async function start(
  port: number = parseInt(process.env.PORT || '7000'),
): Promise<WebSocketServer> {
  subscriptions.clear();
  clients.clear();
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws: WebSocket) => {
    const id = randomUUID();
    const data: ClientData = { id, topics: new Set() };
    clients.set(ws, data);
    console.log(`client connected ${id}`);

    ws.on('message', (raw: string) => {
      let msg: Message;
      try {
        msg = JSON.parse(raw);
      } catch {
        ws.send(JSON.stringify({ error: 'invalid json' }));
        return;
      }
      const { action } = msg;
      if (action === 'subscribe') {
        const topic = msg.topic;
        if (typeof topic !== 'string') return;
        data.topics.add(topic);
        if (!subscriptions.has(topic)) subscriptions.set(topic, new Set());
        subscriptions.get(topic)!.add(ws);
        console.log(`client ${id} subscribed ${topic}`);
      } else if (action === 'unsubscribe') {
        const topic = msg.topic;
        if (typeof topic !== 'string') return;
        data.topics.delete(topic);
        const set = subscriptions.get(topic);
        if (set) {
          set.delete(ws);
          if (set.size === 0) subscriptions.delete(topic);
        }
        console.log(`client ${id} unsubscribed ${topic}`);
      } else if (action === 'publish') {
        const event = normalize(msg.message || {});
        if (!event.type) return;
        event.source = event.source || id;
        route(event, ws);
        console.log(`client ${id} published ${event.type}`);
      } else {
        ws.send(JSON.stringify({ error: 'unknown action' }));
      }
    });

    ws.on('close', () => {
      console.log(`client disconnected ${id}`);
      for (const topic of data.topics) {
        const set = subscriptions.get(topic);
        if (set) {
          set.delete(ws);
          if (set.size === 0) subscriptions.delete(topic);
        }
      }
      clients.delete(ws);
    });
  });

  await new Promise<void>((resolve) => {
    wss.on('listening', () => resolve());
  });
  const address = wss.address();
  const resolvedPort = typeof address === 'string' ? address : address?.port;
  console.log(resolvedPort ? `broker listening on ${resolvedPort}` : 'broker listening');
  return wss;
}

export async function stop(server: WebSocketServer): Promise<void> {
  for (const ws of server.clients) {
    try {
      ws.terminate();
    } catch {
      // Ignore termination errors
    }
  }
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
}

// Auto-start if not in test environment
if (process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    console.error('failed to start broker', err);
    process.exit(1);
  });
}
