import { createHash } from "node:crypto";

/**
 * Compute the SHA-1 hash of the given text and return the hex digest.
 */
export function sha1(text: string): string {
  return createHash("sha1").update(text).digest("hex");
}
