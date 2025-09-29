import test from "ava";
import { generateKeyPairSync } from "node:crypto";
import {
  canonicalEnvelope,
  signEnvelope,
  verifyEnvelopeSignature,
} from "../signature.js";
import type { Envelope } from "../types/envelope.js";

function sampleEnvelope(): Envelope<{ message: string }> {
  return {
    id: "evt-1",
    ts: "2024-01-01T00:00:00.000Z",
    room: "lab",
    from: "tester",
    kind: "event",
    type: "content.post",
    payload: { message: "hello" },
  };
}

test("canonical envelope strips signature", (t) => {
  const envelope = sampleEnvelope();
  const canonical = canonicalEnvelope({ ...envelope, sig: "abc" });
  t.false(canonical.includes("sig"));
});

test("sign and verify envelope signatures", (t) => {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const envelope = sampleEnvelope();
  const sig = signEnvelope(
    envelope,
    privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  );
  const signed: Envelope<{ message: string }> = { ...envelope, sig };
  const verified = verifyEnvelopeSignature(
    signed,
    publicKey.export({ type: "spki", format: "pem" }).toString(),
  );
  t.true(verified);

  const tampered: Envelope<{ message: string }> = {
    ...signed,
    payload: { message: "tampered" },
  };
  t.false(
    verifyEnvelopeSignature(
      tampered,
      publicKey.export({ type: "spki", format: "pem" }).toString(),
    ),
  );
});
