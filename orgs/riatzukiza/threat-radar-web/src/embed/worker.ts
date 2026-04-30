// ---------------------------------------------------------------------------
// Web Worker for browser-side ONNX embedding & cosine similarity.
//
// Runs the BrowserEmbedEngine off the main thread to avoid blocking UI.
// Communicates with the main thread via structured message passing.
// ---------------------------------------------------------------------------

import {
  BrowserEmbedEngine,
  type BrowserEmbedConfig,
  type RuntimeDiagnostics,
} from "@workspace/signal-embed-browser";
import { cosineSimilarity, trigramSimilarityMatrix } from "@workspace/signal-embed-browser";

let engine: BrowserEmbedEngine | null = null;

export type WorkerRequest =
  | { type: "init"; config?: Partial<BrowserEmbedConfig> }
  | { type: "embed"; id: string; text: string }
  | { type: "cosineSimilarity"; id: string; a: number[]; b: number[] }
  | { type: "trigramMatrix"; id: string; textsA: string[]; textsB: string[] }
  | { type: "diagnostics"; id: string };

export type WorkerResponse =
  | { type: "init-ok"; diagnostics: RuntimeDiagnostics }
  | { type: "init-error"; error: string }
  | { type: "embed-ok"; id: string; vector: number[]; elapsed_ms: number; source: string }
  | { type: "embed-error"; id: string; error: string }
  | { type: "cosineSimilarity-ok"; id: string; similarity: number }
  | { type: "trigramMatrix-ok"; id: string; matrix: number[]; rows: number; cols: number }
  | { type: "trigramMatrix-error"; id: string; error: string }
  | { type: "diagnostics-ok"; id: string; diagnostics: RuntimeDiagnostics | null }
  | { type: "error"; id?: string; error: string };

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data;

  try {
    switch (msg.type) {
      case "init": {
        engine = new BrowserEmbedEngine(msg.config);
        try {
          const diagnostics = await engine.init();
          console.log("[embed-worker] ONNX engine initialized, backend:", diagnostics.active_backend);
          self.postMessage({ type: "init-ok", diagnostics } satisfies WorkerResponse);
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.warn("[embed-worker] ONNX engine init failed, using CPU fallback:", errorMsg);
          // Even if ONNX fails, we can still do trigram-based similarity
          self.postMessage({ type: "init-error", error: errorMsg } satisfies WorkerResponse);
        }
        break;
      }

      case "embed": {
        if (!engine) {
          self.postMessage({
            type: "embed-error",
            id: msg.id,
            error: "Engine not initialized",
          } satisfies WorkerResponse);
          return;
        }
        const result = await engine.embed(msg.text);
        if (result) {
          self.postMessage({
            type: "embed-ok",
            id: msg.id,
            vector: Array.from(result.vector),
            elapsed_ms: result.elapsed_ms,
            source: result.source,
          } satisfies WorkerResponse);
        } else {
          self.postMessage({
            type: "embed-error",
            id: msg.id,
            error: "Embedding model not available",
          } satisfies WorkerResponse);
        }
        break;
      }

      case "cosineSimilarity": {
        const sim = cosineSimilarity(
          new Float32Array(msg.a),
          new Float32Array(msg.b),
        );
        self.postMessage({
          type: "cosineSimilarity-ok",
          id: msg.id,
          similarity: sim,
        } satisfies WorkerResponse);
        break;
      }

      case "trigramMatrix": {
        const result = trigramSimilarityMatrix(msg.textsA, msg.textsB);
        self.postMessage({
          type: "trigramMatrix-ok",
          id: msg.id,
          matrix: Array.from(result.matrix),
          rows: result.rows,
          cols: result.cols,
        } satisfies WorkerResponse);
        break;
      }

      case "diagnostics": {
        const diag = engine?.getDiagnostics() ?? null;
        self.postMessage({
          type: "diagnostics-ok",
          id: msg.id,
          diagnostics: diag,
        } satisfies WorkerResponse);
        break;
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    self.postMessage({
      type: "error",
      id: "id" in msg ? (msg as { id: string }).id : undefined,
      error: errorMsg,
    } satisfies WorkerResponse);
  }
};
