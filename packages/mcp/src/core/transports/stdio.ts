// Placeholder stdio transport; implement per MCP SDK when needed.
import type { Transport } from "../types.js";

export const stdioTransport = (): Transport => {
  return {
    start: async (_server: unknown) => {
      // TODO: bind to stdio streams
      console.log("[stdio] transport started (placeholder)");
    },
  };
};
