#!/usr/bin/env node
/**
 * apply_patch — shim for Codex-style patch tool calls.
 * Supports:
 *   - Unified diffs via stdin -> git apply
 *   - JSON edits via stdin: { changes:[{path, action, content?}] }
 *   - GitHub commits via JSON: { github:{...}, patch:"diff" }
 *
 * Actions (JSON):
 *   - { path, action: "rewrite", content }
 *   - { path, action: "append",  content }
 *   - { path, action: "delete" }
 *   - { path, action: "chmod",   mode }     // e.g. "755"
 *
 * Flags:
 *   --check       Dry-run/validate (git apply --check or no-op verify)
 *   --allow-add   Allow creating new files from JSON (default true)
 *   --no-allow-add  Disallow creating new files from JSON
 *   --plan        Parse a unified diff and emit the structured plan (JSON)
 *
 * Exit codes:
 *   0 success, 1 usage/input error, 2 apply failed
 */
import { spawnSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  statSync,
  rmSync,
  chmodSync,
  mkdtempSync,
} from "node:fs";
import { dirname, resolve, sep, isAbsolute, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const GITHUB_URL =
  process.env.GITHUB_GRAPHQL_URL?.trim() || "https://api.github.com/graphql";

function readStdinSync() {
  let data = "";
  try {
    const buf = readFileSync(0, "utf8");
    data = buf.toString();
  } catch (_) {}
  return data.trim();
}

function die(msg, code = 1) {
  console.error(`[apply_patch] ${msg}`);
  process.exit(code);
}

function insideRepo(path, repoRoot) {
  const abs = resolve(repoRoot, path);
  return abs.startsWith(repoRoot + sep);
}

function getRepoRoot() {
  const probe = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  });
  if (probe.status === 0) return probe.stdout.trim();
  // Fallback to CWD if not a git repo; still enforce path safety.
  return process.cwd();
}

function isUnifiedDiff(s) {
  if (!s) return false;
  // Heuristics: presence of diff headers
  return /^(diff --git|Index: |\+\+\+ |--- )/m.test(s);
}

function maybeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function applyUnifiedDiff(patch, repoRoot, checkOnly) {
  const args = ["apply"];
  if (checkOnly) args.push("--check");
  // More forgiving whitespace; reject hunks if needed.
  args.push("--whitespace=nowarn");
  // Apply relative to repo root
  const res = spawnSync("git", args, {
    encoding: "utf8",
    cwd: repoRoot,
    input: patch,
  });
  if (res.status !== 0) {
    console.error(res.stdout);
    console.error(res.stderr);
    die("git apply failed", 2);
  }
}

function ensureDir(p) {
  mkdirSync(dirname(p), { recursive: true });
}

function applyJsonEdits(doc, repoRoot, checkOnly, allowAdd) {
  if (!doc || !Array.isArray(doc.changes))
    die("Invalid JSON: expected { changes: [...] }", 1);

  // Validate all paths first
  for (const c of doc.changes) {
    if (!c || typeof c.path !== "string" || !c.path.length)
      die("Invalid change entry (missing path)", 1);
    if (isAbsolute(c.path) || c.path.includes(".."))
      die(`Unsafe path: ${c.path}`, 1);
    const abs = resolve(repoRoot, c.path);
    if (!insideRepo(abs, repoRoot)) die(`Path escapes repo: ${c.path}`, 1);
  }

  if (checkOnly) {
    // For check, just verify we *could* do the operations
    for (const c of doc.changes) {
      const abs = resolve(repoRoot, c.path);
      switch (c.action) {
        case "rewrite":
        case "append":
          if (!allowAdd) {
            try {
              statSync(abs);
            } catch {
              die(`File does not exist and --no-allow-add: ${c.path}`, 1);
            }
          }
          if (typeof c.content !== "string")
            die(`Missing content for ${c.action}: ${c.path}`, 1);
          break;
        case "delete":
          try {
            statSync(abs);
          } catch {
            /* ok: deleting non-existent is a no-op */
          }
          break;
        case "chmod":
          if (!c.mode) die(`Missing mode for chmod: ${c.path}`, 1);
          break;
        default:
          die(`Unknown action: ${c.action}`, 1);
      }
    }
    return;
  }

  // Apply
  for (const c of doc.changes) {
    const abs = resolve(repoRoot, c.path);
    switch (c.action) {
      case "rewrite": {
        ensureDir(abs);
        writeFileSync(abs, c.content ?? "", "utf8");
        break;
      }
      case "append": {
        ensureDir(abs);
        let prev = "";
        try {
          prev = readFileSync(abs, "utf8");
        } catch {}
        writeFileSync(abs, prev + (c.content ?? ""), "utf8");
        break;
      }
      case "delete": {
        try {
          rmSync(abs, { force: true });
        } catch {}
        break;
      }
      case "chmod": {
        chmodSync(abs, c.mode);
        break;
      }
      default:
        die(`Unknown action: ${c.action}`, 1);
    }
  }
}

function stripPrefix(p) {
  if (!p) return p;
  if (p.startsWith("a/")) return p.slice(2);
  if (p.startsWith("b/")) return p.slice(2);
  return p;
}

export function parseUnifiedDiff(diff) {
  const files = [];
  if (!diff) return { files };
  const lines = diff.split(/\r?\n/);
  let current = null;
  let lastHunk = null;
  for (const line of lines) {
    if (line.startsWith("diff --git ")) {
      if (current) {
        files.push({ ...current, hunks: current.hunks.slice() });
      }
      const parts = line.slice("diff --git ".length).split(" ");
      const oldPath = stripPrefix(parts[0]?.trim());
      const newPath = stripPrefix(parts[1]?.trim());
      current = {
        oldPath: oldPath === "/dev/null" ? null : oldPath,
        newPath: newPath === "/dev/null" ? null : newPath,
        headers: [],
        hunks: [],
        status: "modified",
        binary: false,
      };
      lastHunk = null;
      continue;
    }
    if (!current) continue;
    if (line.startsWith("new file mode")) {
      current.status = "added";
      current.headers.push(line);
      continue;
    }
    if (line.startsWith("deleted file mode")) {
      current.status = "deleted";
      current.headers.push(line);
      continue;
    }
    if (line.startsWith("rename from ")) {
      current.status = "renamed";
      current.oldPath = line.slice("rename from ".length).trim();
      current.headers.push(line);
      continue;
    }
    if (line.startsWith("rename to ")) {
      current.newPath = line.slice("rename to ".length).trim();
      current.headers.push(line);
      continue;
    }
    if (line.startsWith("similarity index")) {
      current.headers.push(line);
      continue;
    }
    if (line.startsWith("index ")) {
      current.headers.push(line);
      continue;
    }
    if (line.startsWith("Binary files ")) {
      current.binary = true;
      current.headers.push(line);
      continue;
    }
    if (line.startsWith("--- ")) {
      const p = line.slice(4).trim();
      current.oldPath = stripPrefix(p) === "/dev/null" ? null : stripPrefix(p);
      current.headers.push(line);
      continue;
    }
    if (line.startsWith("+++ ")) {
      const p = line.slice(4).trim();
      current.newPath = stripPrefix(p) === "/dev/null" ? null : stripPrefix(p);
      current.headers.push(line);
      continue;
    }
    if (line.startsWith("@@")) {
      lastHunk = { header: line, lines: [] };
      current.hunks.push(lastHunk);
      continue;
    }
    if (lastHunk) {
      lastHunk.lines.push(line);
    }
  }
  if (current) {
    files.push({ ...current, hunks: current.hunks.slice() });
  }
  for (const file of files) {
    if (file.binary) continue;
    if (file.newPath === null && file.oldPath !== null) {
      file.status = "deleted";
    } else if (file.oldPath === null && file.newPath !== null) {
      file.status = "added";
    }
    if (file.status === "renamed") {
      if (!file.oldPath && file.headers.length) {
        const from = file.headers.find((h) => h.startsWith("rename from "));
        if (from) file.oldPath = from.slice("rename from ".length).trim();
      }
      if (!file.newPath && file.headers.length) {
        const to = file.headers.find((h) => h.startsWith("rename to "));
        if (to) file.newPath = to.slice("rename to ".length).trim();
      }
    }
  }
  return { files };
}

function sanitizeHeaderValue(value) {
  if (typeof value !== "string") return value;
  let sanitized = value.replace(
    /(Authorization\s*:\s*Bearer\s+)[^,;\s]+/gi,
    "$1[redacted]",
  );
  sanitized = sanitized.replace(
    /(token\s*[=:]\s*)([A-Za-z0-9._-]+)/gi,
    "$1[redacted]",
  );
  sanitized = sanitized.replace(
    /\b(gh[oprsu]_[A-Za-z0-9]{10,})/gi,
    "[redacted]",
  );
  return sanitized;
}

function sanitizeHeaders(headers) {
  const result = {};
  if (!headers) return result;
  for (const [key, value] of Object.entries(headers)) {
    if (/authorization/i.test(key) || /token/i.test(key)) {
      result[key] = "[redacted]";
    } else {
      result[key] =
        typeof value === "string" ? sanitizeHeaderValue(value) : value;
    }
  }
  return result;
}

function sanitizeForLog(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return sanitizeHeaderValue(obj);
  if (Array.isArray(obj)) return obj.map((item) => sanitizeForLog(item));
  if (typeof obj === "object") {
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
      if (/authorization/i.test(key) || /token/i.test(key)) {
        out[key] = "[redacted]";
      } else if (
        key === "headers" &&
        typeof value === "object" &&
        value !== null
      ) {
        out[key] = sanitizeHeaders(value);
      } else {
        out[key] = sanitizeForLog(value);
      }
    }
    return out;
  }
  return obj;
}

function summarizeFiles(plan, limit = 5) {
  const names = [];
  for (const file of plan.files) {
    const name = file.newPath || file.oldPath;
    if (name) names.push(name);
  }
  if (names.length === 0) return "no files";
  if (names.length <= limit) return names.join(", ");
  const shown = names.slice(0, limit).join(", ");
  return `${shown}, +${names.length - limit} more`;
}

function appendTrailers(body, trailers) {
  const trimmed = body ? body.trimEnd() : "";
  const lines = [];
  if (trimmed) lines.push(trimmed);
  if (trailers.length) {
    if (lines.length) lines.push("");
    for (const trailer of trailers) {
      lines.push(trailer);
    }
  }
  return lines.join("\n");
}

function runGit(args, repoRoot, env = {}) {
  const res = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  if (res.status !== 0) {
    const msg = res.stderr || res.stdout || `git ${args.join(" ")} failed`;
    throw new Error(msg.trim());
  }
  return res.stdout;
}

function buildAdditions(plan, diffText, repoRoot) {
  const tmpDir = mkdtempSync(join(tmpdir(), "apply-patch-"));
  const indexPath = join(tmpDir, "index");
  const patchFile = join(tmpDir, "plan.patch");
  writeFileSync(patchFile, diffText, "utf8");
  const env = { GIT_INDEX_FILE: indexPath };
  try {
    runGit(["read-tree", "HEAD"], repoRoot, env);
    runGit(
      ["apply", "--cached", "--whitespace=nowarn", patchFile],
      repoRoot,
      env,
    );
    const additions = new Map();
    for (const file of plan.files) {
      if (file.binary) {
        throw new Error(
          `Binary patch not supported: ${file.newPath || file.oldPath}`,
        );
      }
      if (file.status === "deleted") continue;
      const target = file.newPath || file.oldPath;
      if (!target) continue;
      const result = spawnSync("git", ["show", `:${target}`], {
        cwd: repoRoot,
        encoding: "utf8",
        env: { ...process.env, ...env },
      });
      if (result.status !== 0) {
        throw new Error(
          result.stderr || result.stdout || `Unable to materialize ${target}`,
        );
      }
      additions.set(target, result.stdout);
    }
    return additions;
  } finally {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

function extractConflict(error) {
  if (!error || typeof error !== "object") return null;
  const extensions = error.extensions || {};
  const expected =
    extensions.expectedHeadOid ||
    extensions.expectedOid ||
    extensions.expected ||
    null;
  const actual =
    extensions.currentOid ||
    extensions.actualHeadOid ||
    extensions.actual ||
    null;
  if (expected && actual) {
    return { expectedHeadOid: expected, actualHeadOid: actual };
  }
  if (typeof error.message === "string") {
    const match = error.message.match(
      /expectedHeadOid[^A-Za-z0-9]*([0-9a-fA-F]{4,40}).*actual[^0-9a-fA-F]*([0-9a-fA-F]{4,40})/,
    );
    if (match) {
      return { expectedHeadOid: match[1], actualHeadOid: match[2] };
    }
  }
  return null;
}

function defaultSleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchWithRetry(
  fetchImpl,
  url,
  options,
  sleepFn,
  randomFn,
  maxAttempts,
) {
  let attempt = 0;
  let response;
  while (attempt < maxAttempts) {
    response = await fetchImpl(url, options);
    if (response.status === 502 || response.status === 503) {
      attempt += 1;
      if (attempt >= maxAttempts) break;
      const jitter = Math.floor(randomFn() * 150);
      const delay = attempt * 200 + jitter;
      await sleepFn(delay);
      continue;
    }
    break;
  }
  return response;
}

export async function createGithubCommit(options, overrides = {}) {
  const {
    repoRoot,
    diff,
    repositoryNameWithOwner,
    branchName,
    expectedHeadOid,
    message,
    checkOnly = false,
    graphqlUrl = GITHUB_URL,
    token = process.env.GITHUB_TOKEN,
  } = options;
  if (!diff || !diff.trim()) {
    throw new Error(
      'GitHub commit mode requires a unified diff in "patch" or "diff"',
    );
  }
  if (!repositoryNameWithOwner || !branchName) {
    throw new Error(
      "GitHub commit mode requires repositoryNameWithOwner and branchName",
    );
  }
  if (!expectedHeadOid) {
    throw new Error("GitHub commit mode requires expectedHeadOid");
  }
  if (!repoRoot) {
    throw new Error("GitHub commit mode requires repoRoot");
  }

  const plan = parseUnifiedDiff(diff);
  const summary = summarizeFiles(plan);
  if (checkOnly) {
    const res = spawnSync("git", ["apply", "--check", "--whitespace=nowarn"], {
      cwd: repoRoot,
      encoding: "utf8",
      input: diff,
    });
    if (res.status !== 0) {
      console.error(
        "[apply_patch] GitHub check failed",
        JSON.stringify(
          sanitizeForLog({ stdout: res.stdout, stderr: res.stderr }),
        ),
      );
      return { ok: false, kind: "CheckFailed", summary, plan };
    }
    return { ok: true, kind: "CheckOnly", summary, plan };
  }
  if (!token) {
    throw new Error("GITHUB_TOKEN is required for GitHub commit mode");
  }
  const additionsMap = buildAdditions(plan, diff, repoRoot);
  const additions = [];
  for (const [pathName, content] of additionsMap.entries()) {
    additions.push({
      path: pathName,
      contents: Buffer.from(content, "utf8").toString("base64"),
    });
  }
  const deletionSet = new Set();
  for (const file of plan.files) {
    if (file.status === "deleted") {
      if (file.oldPath) deletionSet.add(file.oldPath);
    }
    if (file.status === "renamed" && file.oldPath) {
      deletionSet.add(file.oldPath);
    }
  }
  const deletions = Array.from(deletionSet).map((pathName) => ({
    path: pathName,
  }));

  const trailers = ["mcp: apply_patch", `changes: ${summary}`];
  const headline = message?.headline || "apply patch";
  const bodyWithTrailers = appendTrailers(message?.body || "", trailers);

  const mutation = `mutation ApplyPatch($input: CreateCommitOnBranchInput!) {
    createCommitOnBranch(input: $input) {
      commit {
        oid
        messageHeadline
      }
    }
  }`;

  const payload = {
    query: mutation,
    variables: {
      input: {
        branch: {
          repositoryNameWithOwner,
          branchName,
        },
        expectedHeadOid,
        message: {
          headline,
          body: bodyWithTrailers,
        },
        fileChanges: {
          additions,
          deletions,
        },
      },
    },
  };

  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "apply_patch/1.0",
    Authorization: `Bearer ${token}`,
  };

  const fetchImpl = overrides.fetchImpl || globalThis.fetch;
  const sleepFn = overrides.sleep || defaultSleep;
  const randomFn = overrides.random || Math.random;
  const response = await fetchWithRetry(
    fetchImpl,
    graphqlUrl,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
    sleepFn,
    randomFn,
    3,
  );

  let data;
  try {
    data = await response.json();
  } catch (error) {
    console.error(
      "[apply_patch] GitHub response parse error",
      sanitizeForLog({
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return { ok: false, kind: "ParseError", summary };
  }

  if (data.errors?.length) {
    const conflict = extractConflict(data.errors[0]);
    if (conflict) {
      return {
        ok: false,
        kind: "Conflict",
        expectedHeadOid: conflict.expectedHeadOid,
        actualHeadOid: conflict.actualHeadOid,
        summary,
      };
    }
    console.error(
      "[apply_patch] GitHub commit failed",
      JSON.stringify(
        sanitizeForLog({
          status: response.status,
          headers,
          errors: data.errors,
        }),
      ),
    );
    return { ok: false, kind: "GraphQLError", summary };
  }

  const commitOid = data?.data?.createCommitOnBranch?.commit?.oid;
  if (!commitOid) {
    console.error(
      "[apply_patch] Unexpected GitHub response",
      JSON.stringify(sanitizeForLog(data)),
    );
    return { ok: false, kind: "UnexpectedResponse", summary };
  }
  return {
    ok: true,
    kind: "Committed",
    oid: commitOid,
    summary,
    message: {
      headline,
      body: bodyWithTrailers,
    },
  };
}

function normalizeGithubPayload(doc) {
  if (!doc || typeof doc !== "object") return null;
  const github = doc.github;
  if (!github || typeof github !== "object") return null;
  const diff = doc.patch || doc.diff;
  return {
    github,
    diff,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const args = argv;
  const checkOnly = args.includes("--check");
  const allowAdd = args.includes("--no-allow-add") ? false : true;
  const planOnly = args.includes("--plan");

  const input = readStdinSync();
  if (!input)
    die("No input provided on stdin (expecting unified diff or JSON).", 1);

  const repoRoot = getRepoRoot();

  if (planOnly) {
    if (!isUnifiedDiff(input))
      die("Plan mode expects a unified diff input.", 1);
    const plan = parseUnifiedDiff(input);
    console.log(JSON.stringify(plan, null, 2));
    return 0;
  }

  if (isUnifiedDiff(input)) {
    applyUnifiedDiff(input, repoRoot, checkOnly);
    console.log(
      checkOnly
        ? "[apply_patch] OK (diff validated)"
        : "[apply_patch] OK (diff applied)",
    );
    return 0;
  }

  const asJson = maybeJson(input);
  if (asJson) {
    const maybeGithub = normalizeGithubPayload(asJson);
    if (maybeGithub) {
      const { github, diff } = maybeGithub;
      if (!diff) die("GitHub commit payload missing diff/patch field.", 1);
      const result = await createGithubCommit(
        {
          repoRoot,
          diff,
          repositoryNameWithOwner: github.repositoryNameWithOwner,
          branchName: github.branchName,
          expectedHeadOid: github.expectedHeadOid,
          message: github.message,
          checkOnly,
          graphqlUrl: github.graphqlUrl || GITHUB_URL,
          token: github.token || process.env.GITHUB_TOKEN,
        },
        {},
      );
      console.log(JSON.stringify(result, null, 2));
      if (result.ok) return 0;
      if (result.kind === "Conflict") return 0;
      return 2;
    }

    applyJsonEdits(asJson, repoRoot, checkOnly, allowAdd);
    console.log(
      checkOnly
        ? "[apply_patch] OK (json validated)"
        : "[apply_patch] OK (json applied)",
    );
    return 0;
  }

  die("Unrecognized input. Provide a unified diff or JSON edits.", 1);
  return 1;
}

const isMain = (() => {
  if (!process.argv[1]) return false;
  const entry = resolve(process.argv[1]);
  return entry === fileURLToPath(import.meta.url);
})();

if (isMain) {
  main().catch((error) => {
    console.error("[apply_patch] fatal", sanitizeForLog({ error }));
    process.exit(1);
  });
}
