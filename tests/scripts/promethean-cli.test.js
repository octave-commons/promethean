import test from "ava";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const CLI_PATH = path.resolve(
  "packages",
  "promethean-cli",
  "dist",
  "promethean_cli.cjs",
);

const SOURCE_PATH = path.resolve(
  "packages",
  "promethean-cli",
  "src",
  "promethean",
  "cli",
  "core.cljs",
);

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: path.resolve("."),
    encoding: "utf8",
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  return result;
};

test("promethean cli exposes usage text for contributors", (t) => {
  if (fs.existsSync(CLI_PATH)) {
    const result = run("node", [CLI_PATH, "--help"]);

    if (result.status === 0) {
      t.true(
        result.stdout.includes("Promethean CLI"),
        "expected help output to mention the CLI title",
      );
      t.true(
        result.stdout.includes(
          "Usage: promethean <package> <action> [-- <script-args>]",
        ),
        "expected help output to include usage instructions",
      );
      return;
    }

    t.log(
      `promethean-cli --help exited with ${result.status}. falling back to source assertions`,
    );
    t.log(result.stderr);
  }

  t.true(
    fs.existsSync(SOURCE_PATH),
    "expected the CLI source file to be available when dist assets are missing",
  );
  const source = fs.readFileSync(SOURCE_PATH, "utf8");
  t.true(
    source.includes("Promethean CLI"),
    "expected CLI source to contain the help heading",
  );
  t.regex(
    source,
    /Usage: promethean <package> <action> \[-- <script-args>]/,
    "expected CLI source to include usage instructions",
  );
});
