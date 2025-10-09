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

/**
 * Factory for creating mock WebSocket connections for testing
 */
export const createMockWsFactory = (): WsFactory => {
  return (url: string, protocols?: string | string[]) => {
    const mockWs = {
      readyState: WebSocket.OPEN,
      send: () => {},
      close: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      onmessage: null,
      onopen: null,
      onclose: null,
      onerror: null
    } as any;
    return mockWs;
  };
};

/**
 * Default transport factory for dependency injection
 */
export const transportFactory = {
  wsFactory: openWs,
  mockWsFactory: createMockWsFactory()
};
