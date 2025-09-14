import { promises as fs } from "node:fs";

/**
 * Check if a file or directory exists.
 * @param p Path to the file or directory.
 * @returns True if the path exists, false otherwise.
 */
export const fileExists = (p: string): Promise<boolean> =>
  fs
    .stat(p)
    .then(() => true)
    .catch(() => false);
