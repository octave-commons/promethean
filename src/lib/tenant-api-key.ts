import { createHash, randomBytes } from "node:crypto";

export const DEFAULT_TENANT_ID = "default";
export const TENANT_API_KEY_PREFIX = "ohpk_";
export const TENANT_API_KEY_VISIBLE_PREFIX_LENGTH = 12;

export function normalizeTenantId(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized.length === 0) {
    throw new Error("tenant id must not be empty");
  }

  return normalized;
}

export function generateTenantApiKey(): string {
  return `${TENANT_API_KEY_PREFIX}${randomBytes(24).toString("base64url")}`;
}

export function buildTenantApiKeyPrefix(token: string): string {
  const normalized = token.trim();
  if (normalized.length === 0) {
    throw new Error("tenant api key must not be empty");
  }

  return normalized.slice(0, Math.min(TENANT_API_KEY_VISIBLE_PREFIX_LENGTH, normalized.length));
}

export function hashTenantApiKey(token: string, pepper: string): string {
  const normalizedToken = token.trim();
  if (normalizedToken.length === 0) {
    throw new Error("tenant api key must not be empty");
  }

  if (pepper.trim().length === 0) {
    throw new Error("tenant api key pepper must not be empty");
  }

  return createHash("sha256")
    .update(pepper)
    .update(":")
    .update(normalizedToken)
    .digest("hex");
}
