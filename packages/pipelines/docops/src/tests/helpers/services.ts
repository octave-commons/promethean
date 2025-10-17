import { Ollama } from "ollama";
import { ChromaClient } from "chromadb";

import { ensureFakeServices, usingFakeServices } from "../../lib/services.js";

/**
 * Ensure Ollama and ChromaDB services are reachable before running tests.
 */
export async function ensureServices() {
  if (usingFakeServices()) return;

  const ollamaUrl = process.env.OLLAMA_URL ?? "http://localhost:11434";
  try {
    const ollamaClient = new Ollama({ host: ollamaUrl });
    await ollamaClient.list();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `Falling back to fake services: Ollama unavailable at ${ollamaUrl}: ${msg}`,
    );
    ensureFakeServices();
    return;
  }

  const chromaUrl = process.env.CHROMA_URL ?? "http://localhost:8000";
  const chromaClient = new ChromaClient({ path: chromaUrl });
  try {
    await chromaClient.heartbeat();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `Falling back to fake services: ChromaDB unavailable at ${chromaUrl}: ${msg}`,
    );
    ensureFakeServices();
  }
}
