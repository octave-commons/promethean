// scripts/run-hy-tests.js
const fs = require("fs/promises");
const { spawn } = require("child_process");

async function directoryExists(dir) {
  try {
    await fs.access(dir);
    return true;
  } catch {
    return false;
  }
}

function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd, stdio: "inherit" });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with exit code ${code}`));
    });
  });
}

const services = [
  "services/hy/stt",
  "services/hy/tts",
  "services/hy/discord_indexer",
  "services/hy/discord_attachment_indexer",
  "services/hy/discord_attachment_embedder",
  "services/hy/stt_ws",
  "services/hy/whisper_stream_ws",
];

async function runTests() {
  let allPassed = true;

  for (const service of services) {
    if (!(await directoryExists(service))) {
      console.log(`Skipping ${service} (not found)`);
      continue;
    }

    console.log(`\n=== Running tests in ${service} ===`);
    try {
      await runCommand("hy", ["-m", "pytest", "tests/"], service);
    } catch (err) {
      console.error(`❌ ${err.message}`);
      allPassed = false;
    }
  }

  if (!allPassed) {
    console.error("\nSome tests failed.");
    process.exit(1);
  } else {
    console.log("\n✅ All tests passed.");
  }
}

runTests();
