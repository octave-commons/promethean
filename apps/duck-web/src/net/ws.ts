export type WsFactory = (
  url: string,
  protocols?: string | string[],
) => WebSocket;
export const protocolsForBearer = (bearer?: string): string[] => {
  const token = (bearer ?? "").trim();
  return ["duck.v1", ...(token.length > 0 ? [`bearer.${token}`] : [])];
};

export const openWs =
  (mkWs: WsFactory = (u, p) => new WebSocket(u, p)) =>
  (url: string, bearer?: string) => {
    const protocols = protocolsForBearer(bearer);
    return mkWs(url, protocols);
  };
