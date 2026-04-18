import type { IncomingHttpHeaders } from "node:http";
import type { FastifyReply } from "fastify";

import type { ProviderCredential } from "./key-pool.js";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]);

const BLOCKED_REQUEST_HEADERS = new Set([
  "authorization",
  "connection",
  "content-length",
  "host",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]);

function asHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value;
}

export function buildForwardHeaders(clientHeaders: IncomingHttpHeaders): Headers {
  const headers = new Headers();

  for (const [rawName, rawValue] of Object.entries(clientHeaders)) {
    if (BLOCKED_REQUEST_HEADERS.has(rawName.toLowerCase())) {
      continue;
    }

    const value = asHeaderValue(rawValue);
    if (typeof value === "string" && value.length > 0) {
      headers.set(rawName, value);
    }
  }
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return headers;
}

export function buildUpstreamHeaders(clientHeaders: IncomingHttpHeaders, apiKey: string): Headers {
  const headers = buildForwardHeaders(clientHeaders);
  headers.set("authorization", `Bearer ${apiKey}`);
  return headers;
}

export function buildUpstreamHeadersForCredential(
  clientHeaders: IncomingHttpHeaders,
  credential: ProviderCredential,
): Headers {
  const headers = buildUpstreamHeaders(clientHeaders, credential.token);
  if (credential.chatgptAccountId) {
    headers.set("chatgpt-account-id", credential.chatgptAccountId);
  }
  return headers;
}

export function copyUpstreamHeaders(reply: FastifyReply, upstreamHeaders: Headers): void {
  for (const [name, value] of upstreamHeaders.entries()) {
    if (HOP_BY_HOP_HEADERS.has(name.toLowerCase())) {
      continue;
    }

    reply.header(name, value);
  }
}

export function parseRetryAfterMs(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const asSeconds = Number(value);
  if (Number.isFinite(asSeconds) && asSeconds >= 0) {
    return asSeconds * 1000;
  }

  const asDate = Date.parse(value);
  if (!Number.isNaN(asDate)) {
    return Math.max(0, asDate - Date.now());
  }

  return undefined;
}

export function isRateLimitResponse(response: Response): boolean {
  return response.status === 429;
}

export function openAiError(
  message: string,
  type: string,
  code?: string
): { readonly error: { readonly message: string; readonly type: string; readonly code?: string; readonly param: null } } {
  return {
    error: {
      message,
      type,
      code,
      param: null
    }
  };
}
