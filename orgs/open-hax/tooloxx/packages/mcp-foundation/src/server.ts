import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export type McpServerBuilder = Readonly<{
  name: string;
  version: string;
  register: (server: McpServer) => void;
}>;

export function createMcpServer(builder: McpServerBuilder): McpServer {
  const server = new McpServer({
    name: builder.name,
    version: builder.version,
  });

  builder.register(server);
  return server;
}