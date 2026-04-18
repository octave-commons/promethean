// ---------------------------------------------------------------------------
// React hook for browser-side embedding & similarity via Web Worker.
//
// Creates a Web Worker on mount, initializes the ONNX engine, and exposes
// functions for computing similarity between thread titles.
//
// Falls back to trigram-based similarity if ONNX engine fails to load.
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback, useRef } from "react";
import type { RuntimeDiagnostics } from "@workspace/signal-embed-browser";
import type { WorkerRequest, WorkerResponse } from "./worker";

export interface EmbeddingState {
  /** Whether the worker is ready (either ONNX or trigram fallback) */
  ready: boolean;
  /** Whether ONNX engine initialized successfully */
  onnxReady: boolean;
  /** Active compute backend (webgpu, wasm, trigram-cpu, etc.) */
  activeBackend: string;
  /** Backend diagnostics from the engine */
  diagnostics: RuntimeDiagnostics | null;
  /** Any initialization error message */
  error: string | null;
}

export interface SimilarityScore {
  globalTitle: string;
  localTitle: string;
  similarity: number;
}

/**
 * Compute trigram similarity scores between two sets of text strings.
 * Returns a promise that resolves to the matrix result.
 */
type ComputeSimilarityFn = (
  globalTitles: string[],
  localTitles: string[],
) => Promise<SimilarityScore[]>;

export interface UseEmbeddingResult {
  state: EmbeddingState;
  computeSimilarity: ComputeSimilarityFn;
}

let requestCounter = 0;
function nextId(): string {
  return `req-${++requestCounter}`;
}

export function useEmbedding(): UseEmbeddingResult {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>>(new Map());

  const [state, setState] = useState<EmbeddingState>({
    ready: false,
    onnxReady: false,
    activeBackend: "initializing",
    diagnostics: null,
    error: null,
  });

  // Initialize worker on mount
  useEffect(() => {
    let disposed = false;

    try {
      const worker = new Worker(
        new URL("./worker.ts", import.meta.url),
        { type: "module" },
      );
      workerRef.current = worker;

      console.log("[useEmbedding] Web Worker created for browser-side embedding");

      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        if (disposed) return;
        const msg = e.data;

        switch (msg.type) {
          case "init-ok": {
            setState({
              ready: true,
              onnxReady: true,
              activeBackend: msg.diagnostics.active_backend,
              diagnostics: msg.diagnostics,
              error: null,
            });
            break;
          }
          case "init-error": {
            // ONNX failed but we still have trigram fallback
            setState({
              ready: true,
              onnxReady: false,
              activeBackend: "trigram-cpu",
              diagnostics: null,
              error: `ONNX init failed: ${msg.error}. Using trigram fallback.`,
            });
            break;
          }
          case "trigramMatrix-ok": {
            const pending = pendingRef.current.get(msg.id);
            if (pending) {
              pendingRef.current.delete(msg.id);
              pending.resolve({ matrix: msg.matrix, rows: msg.rows, cols: msg.cols });
            }
            break;
          }
          case "trigramMatrix-error": {
            const pending = pendingRef.current.get(msg.id);
            if (pending) {
              pendingRef.current.delete(msg.id);
              pending.reject(new Error(msg.error));
            }
            break;
          }
          case "embed-ok": {
            const pending = pendingRef.current.get(msg.id);
            if (pending) {
              pendingRef.current.delete(msg.id);
              pending.resolve({ vector: msg.vector, elapsed_ms: msg.elapsed_ms, source: msg.source });
            }
            break;
          }
          case "embed-error": {
            const pending = pendingRef.current.get(msg.id);
            if (pending) {
              pendingRef.current.delete(msg.id);
              pending.reject(new Error(msg.error));
            }
            break;
          }
          case "cosineSimilarity-ok": {
            const pending = pendingRef.current.get(msg.id);
            if (pending) {
              pendingRef.current.delete(msg.id);
              pending.resolve(msg.similarity);
            }
            break;
          }
          case "diagnostics-ok": {
            const pending = pendingRef.current.get(msg.id);
            if (pending) {
              pendingRef.current.delete(msg.id);
              pending.resolve(msg.diagnostics);
            }
            break;
          }
          case "error": {
            if (msg.id) {
              const pending = pendingRef.current.get(msg.id);
              if (pending) {
                pendingRef.current.delete(msg.id);
                pending.reject(new Error(msg.error));
              }
            }
            break;
          }
        }
      };

      worker.onerror = (e) => {
        if (disposed) return;
        console.warn("[useEmbedding] Worker error:", e.message);
        setState((prev) => ({
          ...prev,
          ready: true,
          activeBackend: "trigram-cpu",
          error: `Worker error: ${e.message}. Using trigram fallback.`,
        }));
      };

      // Initialize the engine
      worker.postMessage({ type: "init" } satisfies WorkerRequest);
    } catch (err: unknown) {
      // Worker creation failed (e.g., in test environment)
      console.warn("[useEmbedding] Worker creation failed, using inline trigram fallback");
      setState({
        ready: true,
        onnxReady: false,
        activeBackend: "trigram-cpu-inline",
        diagnostics: null,
        error: err instanceof Error ? err.message : "Worker creation failed",
      });
    }

    return () => {
      disposed = true;
      workerRef.current?.terminate();
      workerRef.current = null;
      // Reject all pending promises
      for (const [, pending] of pendingRef.current) {
        pending.reject(new Error("Worker disposed"));
      }
      pendingRef.current.clear();
    };
  }, []);

  /**
   * Send a request to the worker and return a promise for the response.
   */
  const sendRequest = useCallback(
    (request: WorkerRequest): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        const worker = workerRef.current;
        if (!worker) {
          reject(new Error("Worker not available"));
          return;
        }
        if ("id" in request && typeof request.id === "string") {
          pendingRef.current.set(request.id, { resolve, reject });
        }
        worker.postMessage(request);
      });
    },
    [],
  );

  /**
   * Compute similarity scores between global and local thread titles.
   * Uses ONNX engine if available, falls back to trigram similarity.
   */
  const computeSimilarity = useCallback<ComputeSimilarityFn>(
    async (globalTitles: string[], localTitles: string[]): Promise<SimilarityScore[]> => {
      if (globalTitles.length === 0 || localTitles.length === 0) {
        return [];
      }

      try {
        const id = nextId();
        const result = (await sendRequest({
          type: "trigramMatrix",
          id,
          textsA: globalTitles,
          textsB: localTitles,
        })) as { matrix: number[]; rows: number; cols: number };

        const scores: SimilarityScore[] = [];
        for (let i = 0; i < result.rows; i++) {
          for (let j = 0; j < result.cols; j++) {
            scores.push({
              globalTitle: globalTitles[i],
              localTitle: localTitles[j],
              similarity: result.matrix[i * result.cols + j],
            });
          }
        }

        // Sort by similarity descending
        scores.sort((a, b) => b.similarity - a.similarity);
        return scores;
      } catch {
        // If worker is down, compute inline using pure JS
        return computeInlineSimilarity(globalTitles, localTitles);
      }
    },
    [sendRequest],
  );

  return { state, computeSimilarity };
}

/**
 * Inline fallback when worker is unavailable. Imports the similarity
 * functions directly (runs on main thread but is lightweight for
 * trigram-based computation on small text sets).
 */
async function computeInlineSimilarity(
  globalTitles: string[],
  localTitles: string[],
): Promise<SimilarityScore[]> {
  const { trigramSimilarityMatrix } = await import("@workspace/signal-embed-browser");
  const result = trigramSimilarityMatrix(globalTitles, localTitles);

  const scores: SimilarityScore[] = [];
  for (let i = 0; i < result.rows; i++) {
    for (let j = 0; j < result.cols; j++) {
      scores.push({
        globalTitle: globalTitles[i],
        localTitle: localTitles[j],
        similarity: result.matrix[i * result.cols + j],
      });
    }
  }
  scores.sort((a, b) => b.similarity - a.similarity);
  return scores;
}
