import { readFile, writeFile } from "node:fs/promises";
import { createDecipheriv, createCipheriv, randomBytes } from "node:crypto";
import { join } from "node:path";
import { homedir } from "node:os";

import type { ProviderCredential } from "./key-pool.js";

function defaultAuthV2FilePath(): string {
  return process.env.FACTORY_AUTH_V2_FILE ?? join(homedir(), ".factory", "auth.v2.file");
}

function defaultAuthV2KeyPath(): string {
  return process.env.FACTORY_AUTH_V2_KEY ?? join(homedir(), ".factory", "auth.v2.key");
}

export interface FactoryAuthV2Credentials {
  readonly accessToken: string;
  readonly refreshToken: string;
}

/**
 * Decrypt Factory auth.v2 credentials.
 *
 * Format of auth.v2.file: base64(iv):base64(authTag):base64(ciphertext)
 * Format of auth.v2.key: base64-encoded AES-256-GCM key
 * Decrypted JSON: { access_token, refresh_token }
 */
export function decryptAuthV2(keyBase64: string, encryptedContent: string): FactoryAuthV2Credentials {
  const key = Buffer.from(keyBase64.trim(), "base64");
  const parts = encryptedContent.trim().split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid auth.v2.file format: expected base64(iv):base64(authTag):base64(ciphertext)");
  }

  const iv = Buffer.from(parts[0]!, "base64");
  const authTag = Buffer.from(parts[1]!, "base64");
  const ciphertext = Buffer.from(parts[2]!, "base64");

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const parsed: unknown = JSON.parse(decrypted.toString("utf-8"));

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Decrypted auth.v2 content is not a valid JSON object");
  }

  const record = parsed as Record<string, unknown>;
  const accessToken = typeof record["access_token"] === "string" ? record["access_token"].trim() : "";
  const refreshToken = typeof record["refresh_token"] === "string" ? record["refresh_token"].trim() : "";

  if (accessToken.length === 0) {
    throw new Error("Decrypted auth.v2 content is missing access_token");
  }

  return { accessToken, refreshToken };
}

/**
 * Attempt to load Factory OAuth credentials from ~/.factory/auth.v2.file + auth.v2.key.
 * Returns null if files are missing or credentials are invalid.
 * Logs warnings on errors but never throws.
 */
export async function loadFactoryAuthV2(): Promise<FactoryAuthV2Credentials | null> {
  const authV2File = defaultAuthV2FilePath();
  const authV2Key = defaultAuthV2KeyPath();

  try {
    const [keyContent, encryptedContent] = await Promise.all([
      readFile(authV2Key, "utf-8"),
      readFile(authV2File, "utf-8"),
    ]);

    const credentials = decryptAuthV2(keyContent, encryptedContent);
    return credentials;
  } catch (error) {
    const isFileNotFound = error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT";
    if (isFileNotFound) {
      // Files simply don't exist — not an error, just no OAuth credentials
      return null;
    }

    console.warn(
      `[factory-auth] Failed to load Factory OAuth credentials from ${authV2File}: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Parse JWT expiry from an access token (base64url decode the middle segment).
 * Returns epoch milliseconds or null if the token is not a valid JWT.
 */
export function parseJwtExpiry(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = Buffer.from(parts[1]!, "base64url").toString("utf-8");
    const parsed: unknown = JSON.parse(payload);
    if (typeof parsed === "object" && parsed !== null && "exp" in parsed) {
      const exp = (parsed as Record<string, unknown>)["exp"];
      if (typeof exp === "number" && Number.isFinite(exp)) {
        return exp * 1000; // Convert seconds to milliseconds
      }
    }
  } catch {
    // Not a valid JWT
  }

  return null;
}

// ─── WorkOS OAuth Token Refresh ─────────────────────────────────────────────

const WORKOS_CLIENT_ID = "client_01HNM792M5G5G1A2THWPXKFMXB";
const WORKOS_REFRESH_URL = "https://api.workos.com/user_management/authenticate";

/** Buffer before JWT expiry to trigger proactive refresh (30 minutes). */
export const FACTORY_REFRESH_BUFFER_MS = 30 * 60 * 1000;

export interface FactoryRefreshedTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number | undefined;
}

/**
 * Check whether a Factory OAuth credential needs a proactive token refresh.
 * Returns true when the JWT exp claim is within 30 minutes of current time,
 * or when expiresAt is missing but the credential has a refresh token.
 */
export function factoryCredentialNeedsRefresh(credential: ProviderCredential): boolean {
  if (credential.providerId !== "factory") {
    return false;
  }
  if (credential.authType !== "oauth_bearer") {
    return false;
  }
  if (!credential.refreshToken) {
    return false;
  }

  // Check JWT exp claim directly from the token for accuracy
  const jwtExpiry = parseJwtExpiry(credential.token);
  if (jwtExpiry !== null) {
    return jwtExpiry - Date.now() < FACTORY_REFRESH_BUFFER_MS;
  }

  // If we have an expiresAt from the credential store, use that
  if (typeof credential.expiresAt === "number") {
    return credential.expiresAt - Date.now() < FACTORY_REFRESH_BUFFER_MS;
  }

  // No expiry information available but we have a refresh token — don't force refresh
  return false;
}

/**
 * Refresh a Factory OAuth token via the WorkOS API.
 *
 * POST https://api.workos.com/user_management/authenticate
 * Body (URL-encoded form): grant_type=refresh_token&refresh_token={token}&client_id={clientId}
 *
 * Returns the new access token, refresh token, and parsed JWT expiry.
 */
export async function refreshFactoryOAuthToken(
  refreshToken: string,
  fetchFn: typeof fetch = globalThis.fetch,
): Promise<FactoryRefreshedTokens> {
  const formBody = new URLSearchParams();
  formBody.append("grant_type", "refresh_token");
  formBody.append("refresh_token", refreshToken);
  formBody.append("client_id", WORKOS_CLIENT_ID);

  const response = await fetchFn(WORKOS_REFRESH_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: formBody.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WorkOS token refresh failed: ${response.status} ${errorText}`);
  }

  const data: unknown = await response.json();
  if (typeof data !== "object" || data === null) {
    throw new Error("WorkOS token refresh returned invalid JSON");
  }

  const record = data as Record<string, unknown>;
  const newAccessToken = typeof record["access_token"] === "string" ? record["access_token"].trim() : "";
  const newRefreshToken = typeof record["refresh_token"] === "string" ? record["refresh_token"].trim() : "";

  if (newAccessToken.length === 0) {
    throw new Error("WorkOS token refresh response missing access_token");
  }
  if (newRefreshToken.length === 0) {
    throw new Error("WorkOS token refresh response missing refresh_token");
  }

  const expiresAt = parseJwtExpiry(newAccessToken) ?? undefined;

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresAt,
  };
}

// ─── Auth V2 Encryption (for persisting refreshed tokens) ───────────────────

/**
 * Encrypt Factory auth.v2 credentials using AES-256-GCM.
 * Returns string in format: base64(iv):base64(authTag):base64(ciphertext)
 */
export function encryptAuthV2(keyBase64: string, data: { readonly access_token: string; readonly refresh_token: string }): string {
  const key = Buffer.from(keyBase64.trim(), "base64");
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(data), "utf-8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${ciphertext.toString("base64")}`;
}

/**
 * Persist refreshed Factory OAuth tokens back to the encrypted auth.v2 file.
 * Only writes if the auth.v2.key file exists and is readable.
 * Never throws — logs warnings on failure.
 */
export async function persistFactoryAuthV2(accessToken: string, refreshToken: string): Promise<void> {
  const authV2File = defaultAuthV2FilePath();
  const authV2Key = defaultAuthV2KeyPath();

  try {
    const keyContent = await readFile(authV2Key, "utf-8");
    const encrypted = encryptAuthV2(keyContent.trim(), {
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    await writeFile(authV2File, encrypted, "utf-8");
  } catch (error) {
    console.warn(
      `[factory-auth] Failed to persist refreshed tokens to ${authV2File}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
