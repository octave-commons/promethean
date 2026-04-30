import { describe, it, expect } from "vitest";
import {
  cosineSimilarity,
  cosineMatrix,
  trigramSimilarityMatrix,
  _textToTrigramVector,
} from "../similarity.js";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const a = new Float32Array([1, 2, 3]);
    const b = new Float32Array([1, 2, 3]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0, 5);
  });

  it("returns -1 for opposite vectors", () => {
    const a = new Float32Array([1, 0, 0]);
    const b = new Float32Array([-1, 0, 0]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1.0, 5);
  });

  it("returns 0 for orthogonal vectors", () => {
    const a = new Float32Array([1, 0, 0]);
    const b = new Float32Array([0, 1, 0]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(0.0, 5);
  });

  it("returns 0 for zero-length vectors", () => {
    const a = new Float32Array([]);
    const b = new Float32Array([]);
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it("returns 0 for zero-norm vector", () => {
    const a = new Float32Array([0, 0, 0]);
    const b = new Float32Array([1, 2, 3]);
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it("works with regular number arrays", () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0, 5);
  });

  it("handles vectors of different lengths by using minimum", () => {
    const a = new Float32Array([1, 0]);
    const b = new Float32Array([1, 0, 0, 0, 0]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0, 5);
  });

  it("computes correct similarity for known values", () => {
    // cos([1,1], [1,0]) = 1/(√2*1) ≈ 0.7071
    const a = new Float32Array([1, 1]);
    const b = new Float32Array([1, 0]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(1 / Math.sqrt(2), 4);
  });
});

describe("cosineMatrix", () => {
  it("returns correct dimensions", () => {
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

  it("diagonal entries are 1.0 for identity matrix", () => {
    const vectors = [
      new Float32Array([1, 0, 0]),
      new Float32Array([0, 1, 0]),
      new Float32Array([0, 0, 1]),
    ];
    const result = cosineMatrix(vectors, vectors);
    expect(result.rows).toBe(3);
    expect(result.cols).toBe(3);
    // Diagonal should be 1.0
    expect(result.matrix[0]).toBeCloseTo(1.0, 5); // [0,0]
    expect(result.matrix[4]).toBeCloseTo(1.0, 5); // [1,1]
    expect(result.matrix[8]).toBeCloseTo(1.0, 5); // [2,2]
    // Off-diagonal should be 0.0 (orthogonal)
    expect(result.matrix[1]).toBeCloseTo(0.0, 5); // [0,1]
    expect(result.matrix[3]).toBeCloseTo(0.0, 5); // [1,0]
  });

  it("returns empty matrix for empty inputs", () => {
    const result = cosineMatrix([], [new Float32Array([1, 2])]);
    expect(result.rows).toBe(0);
    expect(result.cols).toBe(1);
    expect(result.matrix.length).toBe(0);
  });

  it("all entries are valid cosine similarities in [-1, 1]", () => {
    const left = [
      new Float32Array([1, 2, 3]),
      new Float32Array([-1, 0, 1]),
      new Float32Array([0.5, -0.5, 0.5]),
    ];
    const right = [
      new Float32Array([3, 2, 1]),
      new Float32Array([0, 1, -1]),
    ];
    const result = cosineMatrix(left, right);
    for (let i = 0; i < result.matrix.length; i++) {
      expect(result.matrix[i]).toBeGreaterThanOrEqual(-1.0001);
      expect(result.matrix[i]).toBeLessThanOrEqual(1.0001);
    }
  });
});

describe("trigramSimilarityMatrix", () => {
  it("returns high similarity for identical texts", () => {
    const texts = ["machine learning models", "machine learning models"];
    const result = trigramSimilarityMatrix(texts, texts);
    expect(result.rows).toBe(2);
    expect(result.cols).toBe(2);
    // Diagonal (identical texts) should be 1.0
    expect(result.matrix[0]).toBeCloseTo(1.0, 3);
    expect(result.matrix[3]).toBeCloseTo(1.0, 3);
  });

  it("returns lower similarity for unrelated texts", () => {
    const a = ["artificial intelligence breakthroughs"];
    const b = ["underwater basket weaving techniques"];
    const result = trigramSimilarityMatrix(a, b);
    // Unrelated texts should have low similarity
    expect(result.matrix[0]).toBeLessThan(0.5);
  });

  it("returns moderate similarity for related texts", () => {
    const a = ["global energy crisis impacts"];
    const b = ["energy shortage crisis worldwide"];
    const result = trigramSimilarityMatrix(a, b);
    // Related texts should have some similarity
    expect(result.matrix[0]).toBeGreaterThan(0.1);
  });

  it("handles empty inputs", () => {
    const result = trigramSimilarityMatrix([], ["test"]);
    expect(result.rows).toBe(0);
    expect(result.cols).toBe(1);
    expect(result.matrix.length).toBe(0);
  });
});

describe("_textToTrigramVector", () => {
  it("returns a Float32Array of size 256", () => {
    const vec = _textToTrigramVector("hello world");
    expect(vec).toBeInstanceOf(Float32Array);
    expect(vec.length).toBe(256);
  });

  it("returns normalized frequencies that sum to approximately 1", () => {
    const vec = _textToTrigramVector("hello world testing");
    const sum = vec.reduce((a, b) => a + b, 0);
    // Non-zero words generate trigrams, normalized to sum ≈ 1
    expect(sum).toBeGreaterThan(0.9);
    expect(sum).toBeLessThan(1.1);
  });

  it("returns zero vector for empty string", () => {
    const vec = _textToTrigramVector("");
    const sum = vec.reduce((a, b) => a + b, 0);
    expect(sum).toBe(0);
  });

  it("is case-insensitive", () => {
    const vecA = _textToTrigramVector("Hello World");
    const vecB = _textToTrigramVector("hello world");
    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0, 5);
  });
});
