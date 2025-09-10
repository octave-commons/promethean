import { Ollama } from "ollama";
import { ChromaClient } from "chromadb";

/**
 * Ensure Ollama and ChromaDB services are reachable before running tests.
 */
export async function ensureServices() {
  const ollamaUrl = process.env.OLLAMA_URL ?? "http://localhost:11434";
  try {
    const ollamaClient = new Ollama({ host: ollamaUrl });
    await ollamaClient.list();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Ollama server unavailable at ${ollamaUrl}: ${msg}`);
  }

  const chromaUrl = process.env.CHROMA_URL ?? "http://localhost:8000";
  const chromaClient = new ChromaClient({ path: chromaUrl });
  try {
    await chromaClient.heartbeat();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`ChromaDB server unavailable at ${chromaUrl}: ${msg}`);
  }
}
