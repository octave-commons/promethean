export type WsFactory = (
  url: string,
  protocols?: string | string[],
) => WebSocket;
export const openWs =
  (mkWs: WsFactory = (u, p) => new WebSocket(u, p)) =>
  (url: string, bearer?: string) => {
    const protocols = ["duck.v1", ...(bearer ? [`bearer.${bearer}`] : [])];
    return mkWs(url, protocols);
  };
