import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";
import type { Envelope } from "./types/envelope.js";

type CanonicalValue =
  | string
  | number
  | boolean
  | null
  | CanonicalValue[]
  | { [key: string]: CanonicalValue };

function canonicalize(value: unknown): CanonicalValue {
  if (value === null || typeof value !== "object") {
    if (typeof value === "number" && !Number.isFinite(value)) {
      return null;
    }
    return value as CanonicalValue;
  }
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => [key, canonicalize(val)] as const);
  const result: { [key: string]: CanonicalValue } = {};
  for (const [key, val] of entries) {
    result[key] = val;
  }
  return result;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function canonicalEnvelope(envelope: Envelope): string {
  const { sig, ...rest } = envelope;
  return stableStringify(rest);
}

export function signEnvelope(
  envelope: Envelope,
  privateKeyPem: string,
): string {
  const canonical = canonicalEnvelope(envelope);
  const key = createPrivateKey(privateKeyPem);
  const signature = sign(null, Buffer.from(canonical), key);
  return signature.toString("base64");
}

export function verifyEnvelopeSignature(
  envelope: Envelope,
  publicKeyPem: string,
): boolean {
  if (!envelope.sig) {
    return false;
  }
  const canonical = canonicalEnvelope(envelope);
  const key = createPublicKey(publicKeyPem);
  return verify(
    null,
    Buffer.from(canonical),
    key,
    Buffer.from(envelope.sig, "base64"),
  );
}
