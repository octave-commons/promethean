// ---------------------------------------------------------------------------
// Standalone cosine-similarity & embedding vector utilities.
// These are pure math – no ONNX runtime dependency – so they can be tested
// in any JS runtime (Node, Worker, browser).
// ---------------------------------------------------------------------------

/**
 * Compute the cosine similarity between two vectors.
 *
 * @param a First vector (Float32Array or number[])
 * @param b Second vector (Float32Array or number[])
 * @returns Similarity in [-1, 1]. Returns 0 for zero-length or zero-norm vectors.
 */
export function cosineSimilarity(
  a: Float32Array | readonly number[],
  b: Float32Array | readonly number[],
): number {
  const dim = Math.min(a.length, b.length);
  if (dim === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < dim; i++) {
    const ai = a[i];
    const bi = b[i];
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dot / denom : 0;
}

/**
 * Compute a full cosine similarity matrix between two sets of vectors.
 * Returns a flat Float32Array of size rows × cols in row-major order.
 *
 * This is the CPU fallback that mirrors the ONNX cosine_matrix_dynamic model
 * but runs in pure JS. Useful when the ONNX runtime is unavailable or for
 * testing.
 *
 * @param left  Array of row vectors
 * @param right Array of column vectors
 * @returns { matrix, rows, cols }
 */
export function cosineMatrix(
  left: ReadonlyArray<Float32Array | readonly number[]>,
  right: ReadonlyArray<Float32Array | readonly number[]>,
): { matrix: Float32Array; rows: number; cols: number } {
  const rows = left.length;
  const cols = right.length;

  if (rows === 0 || cols === 0) {
    return { matrix: new Float32Array(0), rows, cols };
  }

  const result = new Float32Array(rows * cols);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i * cols + j] = cosineSimilarity(left[i], right[j]);
    }
  }

  return { matrix: result, rows, cols };
}

/**
 * Compute similarity scores between two lists of text labels using
 * simple character trigram vectors. This is a lightweight approximation
 * when the full ONNX embedding model is not available.
 *
 * @param textsA First set of text strings
 * @param textsB Second set of text strings
 * @returns Matrix of similarity scores (rows=textsA, cols=textsB)
 */
export function trigramSimilarityMatrix(
  textsA: readonly string[],
  textsB: readonly string[],
): { matrix: Float32Array; rows: number; cols: number } {
  const vectorsA = textsA.map(textToTrigramVector);
  const vectorsB = textsB.map(textToTrigramVector);
  return cosineMatrix(vectorsA, vectorsB);
}

/**
 * Convert text into a sparse trigram frequency vector.
 * Uses a fixed hash space of 256 buckets to keep vectors compact.
 */
function textToTrigramVector(text: string): Float32Array {
  const HASH_SPACE = 256;
  const vec = new Float32Array(HASH_SPACE);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const words = normalized.split(/\s+/).filter((w) => w.length > 0);

  let total = 0;
  for (const word of words) {
    for (let i = 0; i <= word.length - 3; i++) {
      const trigram = word.substring(i, i + 3);
      const hash = trigramHash(trigram, HASH_SPACE);
      vec[hash] += 1;
      total += 1;
    }
  }

  // Normalize to unit-ish frequency
  if (total > 0) {
    for (let i = 0; i < HASH_SPACE; i++) {
      vec[i] /= total;
    }
  }

  return vec;
}

/** Simple hash for a 3-character string into [0, space). */
function trigramHash(trigram: string, space: number): number {
  let h = 0;
  for (let i = 0; i < trigram.length; i++) {
    h = (h * 31 + trigram.charCodeAt(i)) | 0;
  }
  return ((h % space) + space) % space;
}

export { textToTrigramVector as _textToTrigramVector };
