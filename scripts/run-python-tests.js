// SPDX-License-Identifier: GPL-3.0-only
// scripts/run-python-tests.js

const services = [
  "services/py/stt",
  "services/py/tts",
  "services/py/discord_indexer",
  // WebSocket endpoints now live in their respective HTTP services
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
      await runCommand(
        "python",
        ["-m", "pipenv", "run", "pytest", "tests/"],
        service,
      );
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
