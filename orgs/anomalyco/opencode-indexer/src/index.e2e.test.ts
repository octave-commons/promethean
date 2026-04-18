import test from "ava";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const collectStream = (stream: NodeJS.ReadableStream | null): Promise<string> => {
  if (!stream) return Promise.resolve("");

  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    stream.on("data", (chunk) => chunks.push(String(chunk)));
    stream.on("error", reject);
    stream.on("end", () => resolve(chunks.join("")));
  });
};

const runEntry = async (): Promise<{ code: number | null; stdout: string; stderr: string }> => {
  const entryPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "index.ts");
  const child = spawn(process.execPath, ["--import=tsx", entryPath], {
    env: {
      ...process.env,
      NODE_ENV: "test",
      OPENCODE_INDEXER_NOOP: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const stdoutPromise = collectStream(child.stdout);
  const stderrPromise = collectStream(child.stderr);
  const code = await new Promise<number | null>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  const [stdout, stderr] = await Promise.all([stdoutPromise, stderrPromise]);

  return { code, stdout, stderr };
};

test("indexer entry runs in noop mode", async (t) => {
  const result = await runEntry();

  t.is(result.code, 0);
  t.false(result.stderr.includes("opencode-indexer failed"));
  t.true(result.stdout.length >= 0);
});
