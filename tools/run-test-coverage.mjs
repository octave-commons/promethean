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

const log = (message) => {
  process.stdout.write(`[test:all] ${message}\n`);
};

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

const runCommand = (command, args, options) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      ...options,
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        const exitSignal = signal ? ` (signal: ${signal})` : "";
        reject(
          new Error(
            `${command} ${args.join(
              " ",
            )} exited with code ${code}${exitSignal}`,
          ),
        );
      }
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
    log("No packages with a coverage script were found.");
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

    log(`Running coverage for ${pkg.name}`);
    try {
      await runCommand("pnpm", ["--filter", pkg.name, "run", "coverage"], {
        cwd: rootDir,
        env: {
          ...process.env,
          NODE_V8_COVERAGE: tempDir,
        },
      });
    } catch (error) {
      log(`Coverage failed for ${pkg.name}`);
      throw error;
    }

    const copied = await copyCoverageArtifacts(
      tempDir,
      aggregatedTempDir,
      safeName,
    );
    if (copied === 0) {
      log(`Warning: no coverage data produced by ${pkg.name}`);
    }
  }

  log("Generating combined coverage report");
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
    { cwd: rootDir },
  );
};

main().catch((error) => {
  log(error.message);
  process.exitCode = 1;
});
