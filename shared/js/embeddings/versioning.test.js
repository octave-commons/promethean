import { slug, collectionFor, CONFIG_FP } from "./versioning.js";

describe("versioning helpers", () => {
  test("slug normalizes function names", () => {
    expect(slug("Nomic Embed Text")).toBe("nomic-embed-text");
  });

  test("collectionFor builds versioned collection name", () => {
    const cfg = { driver: "ollama", fn: "nomic-embed-text", dims: 768 };
    expect(collectionFor("discord_messages", "2025-08-12", cfg)).toBe(
      "discord_messages__v:2025-08-12__nomic-embed-text",
    );
  });

  test("CONFIG_FP produces stable sha256 fingerprint", () => {
    const cfg = { driver: "ollama", fn: "nomic-embed-text", dims: 768 };
    expect(CONFIG_FP(cfg)).toBe(
      "f0a618f2e58f2df639dc366c89cf27f6abddd806ac1973305f1844f5e64c0a1f",
    );
  });
});
