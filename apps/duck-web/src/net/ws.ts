export type WsFactory = (
  url: string,
  protocols?: string | string[],
) => WebSocket;

export const openWs =
  (mkWs: WsFactory = (u, p) => new WebSocket(u, p)) =>
  (url: string, bearer?: string) => {
    const tok = (bearer ?? "").trim();
    const protocols = ["duck.v1", ...(tok ? [`bearer.${tok}`] : [])];
    return mkWs(url, protocols);
  };
