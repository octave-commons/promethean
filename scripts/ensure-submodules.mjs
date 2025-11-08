import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const modulePath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(modulePath), "..");

function defaultOnError(message, error) {
  console.error(message, error);
}

export function ensureSubmodules({
  root = repoRoot,
  onError = defaultOnError,
} = {}) {
  try {
    // Check if we're in a git repository
    if (!existsSync(path.join(root, ".gitmodules"))) {
      console.log("No .gitmodules file found, skipping submodule initialization");
      return 0;
    }

    console.log("Initializing git submodules...");
    
    // Initialize submodules if they don't exist
    execSync("git submodule sync", { cwd: root, stdio: "inherit" });
    execSync("git submodule update --init --recursive", { cwd: root, stdio: "inherit" });
    
    console.log("Submodules initialized successfully");
    return 0;
  } catch (error) {
    onError(`Failed to initialize submodules:`, error);
    return 1;
  }
}

export function runSubmodules(options = {}) {
  const code = ensureSubmodules(options);
  if (code !== 0) {
    process.exitCode = code;
  }
  return code;
}

if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
  const code = ensureSubmodules();
  if (code !== 0) {
    process.exit(code);
  }
}
