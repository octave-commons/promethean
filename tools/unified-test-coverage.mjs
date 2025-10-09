#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const packagesDir = path.join(rootDir, "packages");
const servicesDir = path.join(rootDir, "services");
const sharedDir = path.join(rootDir, "shared");
const coverageRoot = path.join(rootDir, "coverage");
const mergedTempDir = path.join(coverageRoot, ".merged_tmp");

const COVERAGE_TIMEOUT_MS = 10 * 60 * 1000;

const findCoveragePackages = async () => {
  const result = [];

  // Search packages with coverage scripts
  const packageEntries = await fs.readdir(packagesDir, { withFileTypes: true });
  for (const entry of packageEntries) {
    if (!entry.isDirectory()) continue;

    const packageJsonPath = path.join(packagesDir, entry.name, "package.json");
    try {
      const pkg = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
      if (pkg.scripts?.coverage) {
        result.push({
          name: pkg.name || entry.name,
          dir: path.join(packagesDir, entry.name),
          type: 'package'
        });
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  // Search services with coverage scripts
  try {
    const serviceEntries = await fs.readdir(servicesDir, { withFileTypes: true });
    for (const entry of serviceEntries) {
      if (!entry.isDirectory()) continue;

      const packageJsonPath = path.join(servicesDir, entry.name, "package.json");
      try {
        const pkg = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
        if (pkg.scripts?.coverage) {
          result.push({
            name: pkg.name || entry.name,
            dir: path.join(servicesDir, entry.name),
            type: 'service'
          });
        }
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  // Search shared with coverage scripts
  try {
    const sharedEntries = await fs.readdir(sharedDir, { withFileTypes: true });
    for (const entry of sharedEntries) {
      if (!entry.isDirectory()) continue;

      const packageJsonPath = path.join(sharedDir, entry.name, "package.json");
      try {
        const pkg = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
        if (pkg.scripts?.coverage) {
          result.push({
            name: pkg.name || entry.name,
            dir: path.join(sharedDir, entry.name),
            type: 'shared'
          });
        }
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
};

const copyCoverageFiles = async (sourceDir, destinationDir) => {
  let copied = 0;
  let entries;
  try {
    entries = await fs.readdir(sourceDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return 0;
    throw error;
  }

  for (const entry of entries) {
    const entryPath = path.join(sourceDir, entry.name);
    if (entry.isDirectory()) {
      copied += await copyCoverageFiles(entryPath, destinationDir);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".json")) {
      continue;
    }

    const destinationPath = path.join(destinationDir, entry.name);
    await fs.copyFile(entryPath, destinationPath);
    copied += 1;
  }

  return copied;
};

const main = async () => {
  try {
    console.log("🧪 Running fixed unified test coverage collection...");

    // Clean and create directories
    await fs.rm(coverageRoot, { recursive: true, force: true });
    await fs.mkdir(coverageRoot, { recursive: true });
    await fs.mkdir(mergedTempDir, { recursive: true });

    const packages = await findCoveragePackages();
    if (packages.length === 0) {
      console.error("No packages with coverage scripts found.");
      process.exit(1);
    }

    console.log(`Found ${packages.length} packages with coverage scripts`);

    // Run coverage for each package individually
    for (const pkg of packages) {
      console.log(`\n📦 Running coverage for ${pkg.name} (${pkg.type})`);

      try {
        // Run the package's coverage script
        await new Promise((resolve, reject) => {
          const child = spawn("pnpm", ["--filter", pkg.name, "run", "coverage"], {
            stdio: "pipe",
            cwd: rootDir,
            env: {
              ...process.env,
              // Override report directory to use package-specific location
              C8_REPORT_DIR: path.join(pkg.dir, "coverage")
            }
          });

          let stdout = "";
          let stderr = "";

          child.stdout.on("data", (data) => {
            stdout += data.toString();
          });

          child.stderr.on("data", (data) => {
            stderr += data.toString();
          });

          child.on("error", reject);
          child.on("exit", (code) => {
            // Allow non-zero exit codes (some tests might fail) but still collect coverage
            if (code !== 0 && code !== null) {
              console.warn(`⚠️  ${pkg.name} tests failed with exit code ${code}, but collecting coverage anyway`);
            }
            resolve();
          });
        });

        // Copy coverage files from package's coverage/tmp directory
        const packageTmpDir = path.join(pkg.dir, "coverage", "tmp");
        const copied = await copyCoverageFiles(packageTmpDir, mergedTempDir);

        if (copied > 0) {
          console.log(`✅ ${pkg.name}: collected ${copied} coverage files`);
        } else {
          console.warn(`⚠️  ${pkg.name}: no coverage files found`);
        }

      } catch (error) {
        console.error(`❌ Failed to collect coverage for ${pkg.name}:`, error.message);
      }
    }

    console.log("\n📊 Generating combined coverage report...");

    // Generate combined report from all collected coverage data
    await new Promise((resolve, reject) => {
      const child = spawn("pnpm", [
        "exec",
        "c8",
        "report",
        "--temp-directory",
        mergedTempDir,
        "--reporter",
        "text",
        "--reporter",
        "lcov",
        "--report-dir",
        coverageRoot,
        "--clean=false"
      ], {
        stdio: "inherit",
        cwd: rootDir,
        timeout: COVERAGE_TIMEOUT_MS
      });

      child.on("error", reject);
      child.on("exit", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`c8 report failed with exit code: ${code}`));
        }
      });
    });

    // Check if combined coverage was generated
    const lcovPath = path.join(coverageRoot, "lcov.info");
    try {
      await fs.access(lcovPath);
      const stats = await fs.stat(lcovPath);

      console.log(`\n✅ Combined coverage report generated successfully!`);
      console.log(`📁 Coverage directory: ${coverageRoot}`);
      console.log(`📊 LCOV file size: ${(stats.size / 1024).toFixed(1)}KB`);

      // Output the path for pipeline consumption
      console.log(lcovPath);

    } catch (error) {
      console.error("\n❌ Failed to generate combined coverage report");
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Failed to generate unified test coverage:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});