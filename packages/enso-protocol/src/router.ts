import type { Envelope } from "@promethean/enso-protocol/envelope.js";
import * as handlers from "../handlers/index.js";

export class Router {
  constructor(private rooms: any) {}
  async handle(ws: any, sessionId: string, env: Envelope) {
    switch (env.type) {
      case "hello":
        return handlers.hello(ws, sessionId, env);
      case "content.post":
        return handlers.contentPost(ws, env);
      case "asset.put":
        return handlers.assetPut(ws, env);
      case "asset.commit":
        return handlers.assetCommit(ws, env);
      case "asset.derive":
        return handlers.assetDerive(ws, env);
      case "voice.frame":
        return handlers.voiceFrame(ws, env);
      case "context.create":
        return handlers.contextCreate(ws, env);
      case "context.add":
        return handlers.contextAdd(ws, env);
      case "context.apply":
        return handlers.contextApply(ws, env);
      case "mcp.mount":
        return handlers.mcpMount(ws, env);
      case "tool.call":
        return handlers.toolCall(ws, env);
      // … add the rest
      default:
        return handlers.unknown(ws, env);
    }
  }
}
