import { describe, it, expect } from "vitest";
import {
  cosineSimilarity,
  cosineMatrix,
  trigramSimilarityMatrix,
} from "@workspace/signal-embed-browser";

/**
 * Test the embedding/similarity computation logic used by the useEmbedding hook.
 * Since Web Workers don't work in jsdom, we test the underlying math functions
 * that the worker delegates to.
 */

describe("cosineSimilarity (used by embed worker)", () => {
  it("returns 1.0 for identical vectors", () => {
    const v = new Float32Array([0.5, 0.3, 0.7, 0.1]);
    expect(cosineSimilarity(v, v)).toBeCloseTo(1.0, 5);
  });

  it("returns value in [-1, 1] for arbitrary vectors", () => {
    const a = new Float32Array([0.1, -0.5, 0.3]);
    const b = new Float32Array([0.4, 0.2, -0.1]);
    const sim = cosineSimilarity(a, b);
    expect(sim).toBeGreaterThanOrEqual(-1);
    expect(sim).toBeLessThanOrEqual(1);
  });

  it("returns 0 for zero vector", () => {
    const a = new Float32Array([0, 0, 0]);
    const b = new Float32Array([1, 2, 3]);
    expect(cosineSimilarity(a, b)).toBe(0);
  });
});

describe("cosineMatrix (used by embed worker for batch similarity)", () => {
  it("produces correct dimensions for 2x3 input", () => {
    const left = [new Float32Array([1, 0]), new Float32Array([0, 1])];
    const right = [
      new Float32Array([1, 0]),
      new Float32Array([0, 1]),
      new Float32Array([1, 1]),
    ];
    const result = cosineMatrix(left, right);
    expect(result.rows).toBe(2);
    expect(result.cols).toBe(3);
    expect(result.matrix.length).toBe(6);
  });

  it("diagonal is 1.0 when left === right (identity check)", () => {
    const vecs = [
      new Float32Array([1, 0]),
      new Float32Array([0, 1]),
    ];
    const result = cosineMatrix(vecs, vecs);
    expect(result.matrix[0]).toBeCloseTo(1.0); // [0,0]
    expect(result.matrix[3]).toBeCloseTo(1.0); // [1,1]
  });
});

describe("trigramSimilarityMatrix (lightweight text similarity)", () => {
  it("returns high similarity for identical texts", () => {
    const result = trigramSimilarityMatrix(
      ["energy crisis global"],
      ["energy crisis global"],
    );
    expect(result.matrix[0]).toBeCloseTo(1.0, 3);
  });

  it("returns measurable similarity for related texts", () => {
    const result = trigramSimilarityMatrix(
      ["global energy supply disruption"],
      ["energy shortage affecting local infrastructure"],
    );
    expect(result.matrix[0]).toBeGreaterThan(0.05);
  });

  it("returns lower similarity for unrelated texts", () => {
    const result = trigramSimilarityMatrix(
      ["climate change arctic ice"],
      ["javascript framework comparison review"],
    );
    expect(result.matrix[0]).toBeLessThan(0.3);
  });

  it("produces matrix of correct size for multiple inputs", () => {
    const a = ["thread one", "thread two"];
    const b = ["thread three", "thread four", "thread five"];
    const result = trigramSimilarityMatrix(a, b);
    expect(result.rows).toBe(2);
    expect(result.cols).toBe(3);
    expect(result.matrix.length).toBe(6);
  });

  it("handles empty input gracefully", () => {
    const result = trigramSimilarityMatrix([], ["test"]);
    expect(result.rows).toBe(0);
    expect(result.matrix.length).toBe(0);
  });
});
