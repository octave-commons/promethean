// SPDX-License-Identifier: GPL-3.0-only
import test from "ava";
import { slug, collectionFor, CONFIG_FP } from "./versioning.js";

test("slug normalizes function names", (t) => {
  t.is(slug("Nomic Embed Text"), "nomic-embed-text");
});

test("collectionFor builds versioned collection name", (t) => {
  const cfg = { driver: "ollama", fn: "nomic-embed-text", dims: 768 };
  t.is(
    collectionFor("discord_messages", "2025-08-12", cfg),
    "discord_messages__v:2025-08-12__nomic-embed-text",
  );
});

test("CONFIG_FP produces stable sha256 fingerprint", (t) => {
  const cfg = { driver: "ollama", fn: "nomic-embed-text", dims: 768 };
  t.is(
    CONFIG_FP(cfg),
    "f0a618f2e58f2df639dc366c89cf27f6abddd806ac1973305f1844f5e64c0a1f",
  );
});
