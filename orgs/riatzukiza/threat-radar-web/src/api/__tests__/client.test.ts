import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchRadars, ApiError } from "../client";

const MOCK_API_URL = "http://localhost:9001";

const MOCK_RADAR_TILES = [
  {
    radar: { id: "r1", slug: "geopolitical-stress", name: "Geopolitical Stress", category: "geopolitical", status: "active" },
    sourceCount: 5,
    submissionCount: 3,
    liveSnapshot: {
      as_of_utc: "2025-01-01T00:00:00Z",
      disagreement_index: 0.2,
      quality_score: 80,
      signals: { energy: { median: 2.5, range: [1.5, 3.5] as [number, number], agreement: 0.8, sample_size: 10 } },
      branches: [{ name: "Escalation", support: "moderate", agreement: 0.6, triggers: ["conflict"] }],
      model_count: 2,
    },
  },
];

describe("fetchRadars", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns radar tiles on successful fetch", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_RADAR_TILES),
    });

    const result = await fetchRadars(MOCK_API_URL);
    expect(result).toEqual(MOCK_RADAR_TILES);
    expect(globalThis.fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/api/radars`);
  });

  it("throws ApiError on network failure", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetchRadars(MOCK_API_URL)).rejects.toThrow(ApiError);
    await expect(fetchRadars(MOCK_API_URL)).rejects.toThrow("Unable to reach the radar API");
  });

  it("throws ApiError with status on non-OK response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    try {
      await fetchRadars(MOCK_API_URL);
      expect.fail("Should have thrown");
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).message).toBe("API returned HTTP 500");
      expect((err as ApiError).status).toBe(500);
    }
  });

  it("throws ApiError on non-array response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: "unexpected" }),
    });

    await expect(fetchRadars(MOCK_API_URL)).rejects.toThrow("Unexpected API response format");
  });

  it("throws ApiError on JSON parse failure", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError("Unexpected token")),
    });

    await expect(fetchRadars(MOCK_API_URL)).rejects.toThrow("Failed to parse API response");
  });

  it("returns empty array for empty API response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const result = await fetchRadars(MOCK_API_URL);
    expect(result).toEqual([]);
  });
});
