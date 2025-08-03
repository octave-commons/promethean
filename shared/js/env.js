import { createRequire } from "module";
import path from "path";

let loadEnv;
try {
  // Attempt to load dotenv relative to this module
  loadEnv = createRequire(import.meta.url)("dotenv").config;
} catch {
  try {
    // Fallback: load from current working directory (e.g., service subpackages)
    loadEnv = createRequire(path.join(process.cwd(), "package.json"))(
      "dotenv",
    ).config;
  } catch {
    // dotenv is optional; continue if not installed
  }
}
loadEnv?.();

export const AGENT_NAME = process.env.AGENT_NAME || "duck";
