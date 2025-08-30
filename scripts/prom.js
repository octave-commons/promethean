#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Import compiler bits
import {
  runLisp,
  compileLispToJS,
} from "../shared/ts/src/compiler/lisp/driver.js";
import { tsToLisp } from "../shared/ts/src/compiler/lisp/ts2lisp.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const [cmd, ...args] = process.argv.slice(2);

  if (!cmd) {
    console.error("Usage: prom <command> <code/file>");
    process.exit(1);
  }

  if (cmd === "run-lisp") {
    const src = args.join(" ");
    const result = runLisp(src);
    console.log(result);
  } else if (cmd === "run-ts") {
    const src = args.join(" ");
    const { lisp } = await tsToLisp(src);
    console.log("=== Lisp ===");
    console.log(lisp);
    const result = runLisp(lisp);
    console.log("=== Result ===");
    console.log(result);
  } else if (cmd === "compile-ts") {
    const filePath = args[0];
    const tsCode = fs.readFileSync(
      path.resolve(__dirname, "..", filePath),
      "utf8",
    );
    const { lisp, js } = await tsToLisp(tsCode);

    console.log("=== TypeScript ===");
    console.log(tsCode);
    console.log("\n=== Transpiled JS ===");
    console.log(js);
    console.log("\n=== Lisp ===");
    console.log(lisp);

    const { expanded, ast, js: emitted } = compileLispToJS(lisp);
    console.log("\n=== Expanded Lisp ===");
    console.log(expanded.map((e) => JSON.stringify(e, null, 2)).join("\n"));
    console.log("\n=== Core AST ===");
    console.log(JSON.stringify(ast, null, 2));
    console.log("\n=== Emitted JS ===");
    console.log(emitted);
  } else {
    console.error(`Unknown command: ${cmd}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("CLI Error:", err);
  process.exit(1);
});
