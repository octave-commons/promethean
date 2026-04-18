/**
 * API client for the threat-radar-mcp backend.
 *
 * Provides typed fetch functions with proper error handling.
 * All network errors are caught and re-thrown as descriptive messages
 * without exposing internal details.
 */

import type { RadarTile } from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch all radar tiles from the API.
 *
 * @param apiUrl - Base URL of the threat-radar-mcp API (e.g. "http://localhost:9001")
 * @returns Array of RadarTile objects
 * @throws ApiError on network failure or non-OK HTTP status
 */
export async function fetchRadars(apiUrl: string): Promise<RadarTile[]> {
  let res: Response;
  try {
    res = await fetch(`${apiUrl}/api/radars`);
  } catch (_err: unknown) {
    throw new ApiError("Unable to reach the radar API");
  }

  if (!res.ok) {
    throw new ApiError(`API returned HTTP ${res.status}`, res.status);
  }

  try {
    const data: unknown = await res.json();
    if (!Array.isArray(data)) {
      throw new ApiError("Unexpected API response format");
    }
    return data as RadarTile[];
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("Failed to parse API response");
  }
}
