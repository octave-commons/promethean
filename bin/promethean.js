#!/usr/bin/env node

// Promethean CLI Entrypoint

import { fileURLToPath } from "url";
import path from "path";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map CLI commands to Sibilant entrypoints
const commands = {
  repl: path.resolve(
    __dirname,
    "../shared/sibilant/src/node/repl/repl.sibilant",
  ),
  shell: path.resolve(
    __dirname,
    "../shared/sibilant/src/node/shell/index.sibilant",
  ),
  compile: path.resolve(__dirname, "../dev/compile.sibilant"),
};

function runSibilant(file, args = []) {
  // Use dist/lang/cli.js (compiled version of src/lang/cli.sibilant)
  const lithpPath = path.resolve(
    __dirname,
    "../shared/sibilant/dist/lang/cli.js",
  );
  const nodeArgs = [lithpPath, file, ...args];

  const child = spawn("node", nodeArgs, {
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code) => process.exit(code));
}

function main() {
  const [, , cmd, ...args] = process.argv;

  if (!cmd || !(cmd in commands)) {
    console.log(`Promethean CLI\n`);
    console.log(`Usage: prom <command> [args...]\n`);
    console.log(`Available commands:`);
    Object.keys(commands).forEach((c) => console.log(`  ${c}`));
    process.exit(1);
  }

  runSibilant(commands[cmd], args);
}

main();
