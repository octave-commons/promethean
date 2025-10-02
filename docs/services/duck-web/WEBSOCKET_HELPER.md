# WebSocket Helper

Tiny factory around `WebSocket` that injects custom subprotocols and an optional bearer token.

```ts
export type WsFactory = (url: string, protocols?: string | string[]) => WebSocket;

export const openWs =
  (mkWs: WsFactory = (u, p) => new WebSocket(u, p)) =>
  (url: string, bearer?: string) => {
    const protocols = [
      "duck.v1",
      ...(bearer ? ["bearer." + bearer] : []),
    ];
    return mkWs(url, protocols);
  };
```

- Empty bearer is **ignored** (no `bearer.` sent).
- DI-friendly via `mkWs` so you can unit test without a real socket.