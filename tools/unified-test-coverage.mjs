#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const coverageLcovPath = path.join(rootDir, "coverage", "lcov.info");

/**
 * Unified test coverage command for the test-gap pipeline
 *
 * This command:
 * 1. Runs tests for all packages with unified coverage collection using c8
 * 2. Generates a single coverage/lcov.info file
 * 3. Outputs the path to the generated LCOV file for test-gap pipeline
 */

async function main() {
  try {
    // Clean any existing coverage
    const coverageDir = path.join(rootDir, "coverage");
    try {
      await fs.rm(coverageDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist, which is fine
    }

    console.log("🧪 Running unified test coverage collection...");

    // Use c8 directly to run all tests with unified coverage
    const { spawn } = await import("node:child_process");

    await new Promise((resolve, reject) => {
      const child = spawn("pnpm", [
        "exec",
        "c8",
        "--all",
        "--include=packages/**/*.ts",
        "--include=services/**/*.ts",
        "--exclude=**/*.test.js",
        "--exclude=**/*.test.ts",
        "--exclude=**/node_modules/**",
        "--exclude=**/dist/test/**",
        "--exclude=**/tests/**",
        "--reporter=text",
        "--reporter=lcov",
        "--report-dir=coverage",
        "ava",
        "--config",
        "./config/ava.config.mjs",
        "packages/**/dist/**/*.test.js",
        "services/**/dist/**/*.test.js"
      ], {
        stdio: ["inherit", "pipe", "pipe"], // Capture stdout to avoid clutter
        cwd: rootDir,
        env: {
          ...process.env,
          NODE_ENV: "test"
        }
      });

      let output = [];
      child.stdout.on("data", (data) => {
        const text = data.toString();
        // Show progress and coverage summary
        if (text.includes("✔") || text.includes("✓") ||
            text.includes("File") || text.includes("All files") ||
            text.includes("----------") ||
            text.includes("coverage report generated")) {
          console.log(text.trim());
        }
        output.push(text);
      });

      child.stderr.on("data", (data) => {
        const text = data.toString();
        // Only show important errors
        if (text.includes("Error") || text.includes("Failed") || text.includes("ENOENT")) {
          console.error(text.trim());
        }
      });

      child.on("error", reject);
      child.on("exit", (code) => {
        // Allow non-zero exit codes (some tests might fail) but still generate coverage
        console.log(`Test run completed with exit code: ${code}`);
        resolve();
      });
    });

    // Wait a moment for file system operations to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify the LCOV file was created
    try {
      await fs.access(coverageLcovPath);

      // Check file size to ensure it's not empty
      const stats = await fs.stat(coverageLcovPath);
      if (stats.size === 0) {
        throw new Error("LCOV file is empty");
      }

      console.log(`✅ Coverage report generated: ${coverageLcovPath}`);
      console.log(`📊 Coverage file size: ${(stats.size / 1024).toFixed(1)}KB`);

      // Show a sample of the LCOV content to verify it's valid
      const sample = await fs.readFile(coverageLcovPath, 'utf-8');
      const lineCount = sample.split('\n').length;
      console.log(`📝 LCOV file contains ${lineCount} lines`);

      // Output the LCOV file path for pipeline consumption (this is what the pipeline reads)
      console.log(coverageLcovPath);

    } catch (error) {
      console.error("❌ Coverage LCOV file not found or invalid after running tests");

      // Try to list what files were created
      try {
        const files = await fs.readdir(coverageDir);
        console.error("📁 Coverage directory contents:", files);
      } catch (e) {
        console.error("📁 Coverage directory not found");
      }

      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Failed to generate unified test coverage:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

main();