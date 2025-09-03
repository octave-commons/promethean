// SPDX-License-Identifier: GPL-3.0-only
const { spawn } = require("child_process");
const fs = require("fs/promises");
const path = require("path");
async function directoryExists(dir) {
  try {
    const stat = await fs.stat(dir);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: { ...process.env, PIPENV_NOSPIN: "1" }
    });

    proc.on("exit", code => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed in ${cwd}`));
    });
  });
}

async function runCommandOnAll(command, args, paths) {
    const failedCommands = [];

    for (const path of paths) {
        if (!(await directoryExists(path))) {
            console.log(`Skipping command on ${path} (target not found)`);
            continue;
        }

        console.log(`\n=== Running command ${command} ${args.join(" ")} in ${path} ===`);
        try {
            await runCommand(command, args, path);
        } catch (err) {
            console.error(`❌ ${err.message}`);
            failedCommands.push({
                err, command, args, path,
                errMessage:err.message
            });
        }
    }

    if (failedCommands.length) {
        console.error("\nSome commands failed.");
        console.error(failedCommands);
        process.exit(1);
    } else {
        console.log("\n✅ All commands succeeded.");
    }
}
