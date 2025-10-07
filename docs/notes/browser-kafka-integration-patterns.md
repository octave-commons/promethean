---
$$
uuid: 65bd7bb9-8575-4cac-a714-a994b61cd16e
$$
$$
created_at: '2025-09-03T12:47:46Z'
$$
filename: Browser-Kafka Integration Patterns
title: Browser-Kafka Integration Patterns
$$
description: >-
$$
  Explains two primary methods for integrating Kafka with browsers: HTTP REST
  bridges and WebSocket bridges. Highlights pros/cons of each approach and
  provides practical TypeScript examples for browser-side implementation.
tags:
  - Kafka
  - browser
  - REST
  - WebSocket
  - KafkaJS
  - confluent
  - redpanda
  - sse
  - websockets
$$
related_to_uuid:
$$
  - 14a4bbf0-4780-4a02-8637-e3c1bbcc9915
$$
related_to_title:
$$
  - Ice Box Reorganization
references:
  - uuid: 14a4bbf0-4780-4a02-8637-e3c1bbcc9915
    line: 1
    col: 0
    score: 1
  - uuid: 14a4bbf0-4780-4a02-8637-e3c1bbcc9915
    line: 3
    col: 0
    score: 1
  - uuid: 14a4bbf0-4780-4a02-8637-e3c1bbcc9915
    line: 11
    col: 0
    score: 1
---
Short version: you can’t talk to Kafka directly from a browser. Kafka uses a custom TCP protocol; browsers don’t expose raw TCP sockets. KafkaJS (and other JS clients) are Node-only by design. ([kafka.js.org][1])

So you have two sane patterns:
$$
1. **HTTP bridge (REST)**
$$
* Drop in a REST gateway that fronts Kafka, then call it from the browser with `fetch`.
* Options:

  * **Confluent REST Proxy** $produce/consume/admin over REST$. ([Confluent Documentation][2], [GitHub][3])
  * **Redpanda HTTP Proxy (“pandaproxy”)** $Kafka-compatible cluster, REST for produce/consume; limited admin$. ([Redpanda Documentation][4])
* Pros: dead simple from the browser; easy to cache/authorize with your normal API stack.
* Cons: polling/HTTP semantics; you must design consumption (offsets, batching) carefully to avoid hot-loop polling.
$$
2. **WebSocket bridge**
$$
* Run a service that consumes from Kafka and relays over WebSockets (or SSE) to the browser; POST back to produce.
* DIY or use an off-the-shelf proxy (examples below).

  * **Kafka WebSocket Proxy** (community project). ([GitLab][5])
  * **Gravitee Kafka↔WebSocket mediation** $API-gateway approach$. ([Gravitee][6])
* Pros: push-style delivery, lower overhead than REST polling, plays nicely with backpressure.
* Cons: you own the bridge semantics (auth, consumer groups, offset commits, reconnection logic).

If you’re on Confluent or Redpanda already, their proxies are the fastest path. If you want true realtime push UX, add a WS/SSE layer on top of a single consumer service $that service controls offsets and fan-out to clients$. Confluent has an example showing browser consumption via a middle tier—same idea. ([Confluent][7])

---

### Practical TypeScript shapes $browser-side$
$$
**REST (produce)**
$$
```ts
// Produce via REST Proxy / pandaproxy
export const produce = (baseUrl: string) =>
  async (topic: string, value: unknown) => {
    const res = await fetch(`${baseUrl}/topics/${encodeURIComponent(topic)}`, {
      method: "POST",
      headers: { "Content-Type": "application/vnd.kafka.json.v2+json" },
      body: JSON.stringify({ records: [{ value }] })
    });
    if (!res.ok) throw new Error(`REST produce failed: ${res.status}`);
    return res.json();
  };
```

*Notes:* Content types differ by proxy; adjust to their docs (Confluent vs Redpanda). Handle auth $cookies/JWT$ at your edge/API gateway. ([Confluent Documentation][2], [Redpanda Documentation][8])
$$
**SSE (consume)**
$$
```ts
// Stream messages from your backend consumer → SSE
export const consumeSSE = (url: string, onMessage: (v: unknown) => void) => {
  const es = new EventSource(url);
  es.onmessage = (e) => onMessage(JSON.parse(e.data));
  es.onerror = () => es.close();
  return () => es.close();
};
```

Your backend runs a Kafka consumer in a group, translates records to SSE, and controls commits $exactly-once is still your problem—treat browser as at-least-once$.
$$
**WebSocket (bi-directional)**
$$
```ts
// WS bridge where server relays Kafka records and accepts produces
export const connectWs = (url: string, handlers: {
  onRecord?: (r: unknown) => void;
  onOpen?: () => void;
  onClose?: (ev: CloseEvent) => void;
  onError?: (ev: Event) => void;
}) => {
  const ws = new WebSocket(url);
  ws.onopen = () => handlers.onOpen?.();
  ws.onmessage = (e) => handlers.onRecord?.(JSON.parse(e.data));
  ws.onerror = (e) => handlers.onError?.(e);
  ws.onclose = (e) => handlers.onClose?.(e);
  return {
    produce: (topic: string, value: unknown) =>
      ws.send(JSON.stringify({ type: "produce", topic, value })),
    close: () => ws.close()
  };
};
```

If you expose Kafka via a WS proxy, follow its message schema. ([GitLab][5])

---

### Architecture call (blunt take)

* **Don’t** fight the browser: you won’t run a real Kafka client in it (no TCP). Even Confluent’s “JS client” targets Node via librdkafka bindings, not browsers. ([Confluent Documentation][9])
* **Do** put a **thin gateway** in front of Kafka (REST or WS), keep all consumer-group/offset logic server-side, and ship only app-level events to the browser.
* Start with **REST** (fastest), then add **WS/SSE** for hot streams or when polling gets ugly.

If you want, I’ll sketch the gateway service $Node + Fastify, native ESM, functional TS, no mutation$ that:

* Exposes `POST /produce`, `GET /stream` (SSE), and `GET /ws` (WebSocket).
* Uses KafkaJS/Confluent JS **server-side** and respects your Promethean monorepo rules.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Ice Box Reorganization]$ice-box-reorganization.md$
## Sources
- [Ice Box Reorganization — L1]$ice-box-reorganization.md#^ref-14a4bbf0-1-0$ (line 1, col 0, score 1)
- [Ice Box Reorganization — L3]$ice-box-reorganization.md#^ref-14a4bbf0-3-0$ (line 3, col 0, score 1)
- [Ice Box Reorganization — L11]$ice-box-reorganization.md#^ref-14a4bbf0-11-0$ (line 11, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
