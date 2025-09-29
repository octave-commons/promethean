import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import crypto from "node:crypto";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const packagesDir = path.join(rootDir, "packages");
const coverageRoot = path.join(rootDir, "coverage");
const aggregatedTempDir = path.join(coverageRoot, ".nyc_output");
const perPackageTempRoot = path.join(coverageRoot, "tmp");

const PACKAGE_TIMEOUT_MS = 10 * 60 * 1000;
const COVERAGE_REPORT_TIMEOUT_MS = 2 * 60 * 1000;
const CHILD_PROCESS_GRACE_MS = 5_000;

const readJsonFile = async (filePath) => {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
};

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const removeDir = async (dirPath) => {
  await fs.rm(dirPath, { recursive: true, force: true });
};

const sanitizeName = (name) => name.replace(/[^a-zA-Z0-9_.-]+/g, "-");

const listCoveragePackages = async () => {
  const entries = await fs.readdir(packagesDir, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageJsonPath = path.join(packagesDir, entry.name, "package.json");
    try {
      const pkg = await readJsonFile(packageJsonPath);
      const coverageScript = pkg.scripts?.coverage;
      if (
        typeof coverageScript === "string" &&
        coverageScript.trim().length > 0
      ) {
        result.push({
          name: typeof pkg.name === "string" ? pkg.name : entry.name,
          dir: path.join(packagesDir, entry.name),
        });
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
};

const runCommand = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const {
      timeoutMs,
      killSignalGraceMs = CHILD_PROCESS_GRACE_MS,
      stdio = "inherit",
      ...spawnOptions
    } = options;

    const commandLabel = [command, ...args].filter(Boolean).join(" ");
    const gracePeriodMs = Number.isFinite(killSignalGraceMs)
      ? Math.max(0, killSignalGraceMs)
      : CHILD_PROCESS_GRACE_MS;

    const child = spawn(command, args, {
      stdio,
      ...spawnOptions,
    });

    let timedOut = false;
    let timeoutId;
    let killTimeoutId;

    const clearTimers = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      if (killTimeoutId) {
        clearTimeout(killTimeoutId);
        killTimeoutId = undefined;
      }
    };

    const hasTimeout =
      typeof timeoutMs === "number" &&
      Number.isFinite(timeoutMs) &&
      timeoutMs > 0;

    if (hasTimeout) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        child.kill("SIGTERM");
        if (gracePeriodMs > 0) {
          killTimeoutId = setTimeout(() => {
            if (child.exitCode === null && child.signalCode === null) {
              child.kill("SIGKILL");
            }
          }, gracePeriodMs);
        } else if (gracePeriodMs === 0) {
          child.kill("SIGKILL");
        }
      }, timeoutMs);
    }

    child.on("error", (error) => {
      clearTimers();
      reject(error);
    });

    child.on("exit", (code, signal) => {
      clearTimers();

      if (timedOut) {
        const seconds = Math.ceil((timeoutMs ?? 0) / 1000);
        reject(new Error(`${commandLabel} timed out after ${seconds}s`));
        return;
      }

      if (code === 0) {
        resolve();
        return;
      }

      const exitSignal = signal ? ` (signal: ${signal})` : "";
      reject(
        new Error(`${commandLabel} exited with code ${code}${exitSignal}`),
      );
    });
  });

let coverageFileCounter = 0;

const copyCoverageArtifacts = async (sourceDir, destinationDir, safeName) => {
  let copied = 0;
  let entries;
  try {
    entries = await fs.readdir(sourceDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") {
      return 0;
    }
    throw error;
  }

  for (const entry of entries) {
    const entryPath = path.join(sourceDir, entry.name);
    if (entry.isDirectory()) {
      copied += await copyCoverageArtifacts(
        entryPath,
        destinationDir,
        safeName,
      );
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".json")) {
      continue;
    }

    const uniqueSuffix = `${coverageFileCounter.toString(
      16,
    )}-${crypto.randomUUID()}`;
    coverageFileCounter += 1;
    const destinationPath = path.join(
      destinationDir,
      `${safeName}__${uniqueSuffix}-${entry.name}`,
    );
    await fs.copyFile(entryPath, destinationPath);
    copied += 1;
  }

  return copied;
};

const main = async () => {
  const packages = await listCoveragePackages();
  if (packages.length === 0) {
    console.error("No packages with a coverage script were found.");
    process.exitCode = 1;
    return;
  }

  await removeDir(coverageRoot);
  await ensureDir(coverageRoot);
  await ensureDir(aggregatedTempDir);
  await ensureDir(perPackageTempRoot);

  for (const pkg of packages) {
    const safeName = sanitizeName(pkg.name);
    const tempDir = path.join(perPackageTempRoot, safeName);
    await removeDir(tempDir);
    await ensureDir(tempDir);

    console.info(`Running coverage for ${pkg.name}`);
    try {
      await runCommand("pnpm", ["--filter", pkg.name, "run", "coverage"], {
        cwd: rootDir,
        env: {
          ...process.env,
          NODE_V8_COVERAGE: tempDir,
          ...(process.env.LOG_SILENT === undefined
            ? { LOG_SILENT: "true" }
            : {}),
        },
        timeoutMs: PACKAGE_TIMEOUT_MS,
        killSignalGraceMs: CHILD_PROCESS_GRACE_MS,
      });
    } catch (error) {
      console.error(`Coverage failed for ${pkg.name}`);
      throw error;
    }

    const copied = await copyCoverageArtifacts(
      tempDir,
      aggregatedTempDir,
      safeName,
    );
    if (copied === 0) {
      console.warn(`Warning: no coverage data produced by ${pkg.name}`);
    }
  }

  console.info("Generating combined coverage report");
  await runCommand(
    "pnpm",
    [
      "exec",
      "c8",
      "report",
      "--temp-directory",
      aggregatedTempDir,
      "--reporter",
      "text",
      "--reporter",
      "lcov",
      "--report-dir",
      coverageRoot,
      "--clean=false",
      "--allowExternal",
    ],
    {
      cwd: rootDir,
      timeoutMs: COVERAGE_REPORT_TIMEOUT_MS,
      killSignalGraceMs: CHILD_PROCESS_GRACE_MS,
    },
  );
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
