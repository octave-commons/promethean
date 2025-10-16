#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs/promises";
import { execa } from "execa";

const ROOT = path.join(process.cwd(), "packages/smartgpt-bridge/tests/fixtures");

console.log("=== SmartGPT Bridge Grep Test Investigation ===");
console.log("ROOT:", ROOT);

// Test 1: Check fixtures directory
try {
  const files = await fs.readdir(ROOT);
  console.log("✅ Fixtures directory accessible");
  console.log("Files:", files);
} catch (err) {
  console.error("❌ Cannot read fixtures:", err.message);
  process.exit(1);
}

// Test 2: Read test file content
try {
  const readmeContent = await fs.readFile(path.join(ROOT, "readme.md"), "utf8");
  console.log("✅ readme.md readable");
  console.log("Content preview:");
  console.log(readmeContent.substring(0, 200));
  
  // Check if "heading" exists
  if (readmeContent.toLowerCase().includes("heading")) {
    console.log("✅ 'heading' found in readme.md");
  } else {
    console.log("❌ 'heading' NOT found in readme.md");
  }
} catch (err) {
  console.error("❌ Cannot read readme.md:", err.message);
}

// Test 3: Check ripgrep availability
try {
  const { stdout: version } = await execa("rg", ["--version"]);
  console.log("✅ ripgrep available:", version.trim());
} catch (err) {
  console.error("❌ ripgrep not available:", err.message);
  process.exit(1);
}

// Test 4: Run the actual ripgrep command from test
const args = [
  "--json",
  "--max-count", "200",
  "-C", "1",
  "-i",
  "heading",
  "**/*.md"
];

console.log("\n=== Running Ripgrep Command ===");
console.log("Args:", args);
console.log("CWD:", ROOT);

try {
  const { stdout, exitCode } = await execa("rg", args, { cwd: ROOT });
  console.log("✅ Ripgrep success, exitCode:", exitCode);
  console.log("Output length:", stdout.length);
  
  const lines = stdout.split(/\r?\n/).filter(Boolean);
  console.log("Number of JSON lines:", lines.length);
  
  // Parse first few JSON objects
  lines.slice(0, 3).forEach((line, i) => {
    try {
      const obj = JSON.parse(line);
      console.log(`Line ${i}:`, obj.type, obj.data?.path?.text);
    } catch (parseErr) {
      console.log(`Line ${i}: PARSE ERROR -`, line.substring(0, 100));
    }
  });
  
  // Count matches
  const matchLines = lines.filter(line => {
    try {
      const obj = JSON.parse(line);
      return obj.type === "match";
    } catch {
      return false;
    }
  });
  console.log("Match objects found:", matchLines.length);
  
} catch (err) {
  console.error("❌ Ripgrep failed:");
  console.error("Exit code:", err.exitCode);
  console.error("Message:", err.message);
  console.error("Stderr:", err.stderr);
  
  if (err.exitCode === 1 && typeof err.stdout === "string") {
    console.log("Using stdout from error (exit code 1)");
    console.log("Output length:", err.stdout.length);
    
    const lines = err.stdout.split(/\r?\n/).filter(Boolean);
    console.log("Number of JSON lines:", lines.length);
    
    lines.slice(0, 3).forEach((line, i) => {
      try {
        const obj = JSON.parse(line);
        console.log(`Line ${i}:`, obj.type, obj.data?.path?.text);
      } catch (parseErr) {
        console.log(`Line ${i}: PARSE ERROR -`, line.substring(0, 100));
      }
    });
  }
}

console.log("\n=== Investigation Complete ===");