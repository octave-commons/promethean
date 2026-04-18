import type { FastifyRequest } from "fastify";

import type { ProxyConfig } from "./config.js";
import { hasBearerToken } from "./provider-utils.js";

export function applyNativeOllamaAuth(request: FastifyRequest, config: ProxyConfig): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (config.proxyAuthToken) {
    const authorization = request.headers.authorization;
    if (hasBearerToken(authorization, config.proxyAuthToken) && typeof authorization === "string") {
      headers.authorization = authorization;
    } else {
      headers.authorization = `Bearer ${config.proxyAuthToken}`;
    }
  }

  return headers;
}
