#!/usr/bin/env node

/**
 * Recursively index a directory and append Org headers for each text file.
 * - Writes/updates ./catalog.org in the root.
 * - Uses `ollama run <model>` for a short description per file.
 *
 * Usage:
 *   node catalog-org.js [rootDir] [model] [maxBytes] [concurrency]
 * Example:
 *   node catalog-org.js . "gemma2:2b" 200000 2
 *
 * Notes:
 * - Set OLLAMA_HOST / OLLAMA_MODELS as you normally do.
 * - To keep VRAM free for your main model, you can run the descriptor on CPU:
 *     OLLAMA_NO_GPU=1 node catalog-org.js .
 */

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const ROOT = path.resolve(process.argv[2] || ".");
const MODEL = process.argv[3] || "gemma2:2b";
const MAX_BYTES = parseInt(process.argv[4] || "200000", 10); // cap per-file read (≈200 KB)
const CONCURRENCY = parseInt(process.argv[5] || "2", 10); // 1–4 is sane; more will thrash IO

const OUTPUT = path.join(ROOT, "catalog.org");

// Practical default ignores
const DEFAULT_IGNORES = new Set([
  ".git",
  "node_modules",
  ".venv",
  ".mypy_cache",
  ".pytest_cache",
  ".next",
  "dist",
  "build",
  "out",
  "__pycache__",
  ".DS_Store",
]);

const IGNORE_FILE_GLOBS = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "poetry.lock",
  "Cargo.lock",
  "Gemfile.lock",
  "Podfile.lock",
  ".lock",
  ".log",
  ".min.js",
  ".map",
]);

// Extension->Org source language mapping (extend as needed)
const EXT_LANG = new Map([
  ["js", "js"],
  ["mjs", "js"],
  ["cjs", "js"],
  ["ts", "ts"],
  ["tsx", "tsx"],
  ["jsx", "jsx"],
  ["py", "python"],
  ["sh", "sh"],
  ["bash", "bash"],
  ["zsh", "sh"],
  ["json", "json"],
  ["yml", "yaml"],
  ["yaml", "yaml"],
  ["md", "markdown"],
  ["org", "org"],
  ["txt", "text"],
  ["c", "c"],
  ["h", "c"],
  ["cpp", "cpp"],
  ["cc", "cpp"],
  ["hpp", "cpp"],
  ["rs", "rust"],
  ["go", "go"],
  ["java", "java"],
  ["kt", "kotlin"],
  ["cs", "csharp"],
  ["php", "php"],
  ["rb", "ruby"],
  ["lua", "lua"],
  ["html", "html"],
  ["css", "css"],
  ["scss", "scss"],
  ["sql", "sql"],
  ["toml", "toml"],
]);

function looksBinary(buf) {
  // quick heuristic: >10% non-text or any NUL byte in first 8k
  const n = Math.min(buf.length, 8192);
  let weird = 0;
  for (let i = 0; i < n; i++) {
    const c = buf[i];
    if (c === 0) return true; // hard fail: NUL
    // treat common text range + whitespace as ok
    if (
      !(
        c === 9 ||
        c === 10 ||
        c === 13 ||
        (c >= 32 && c <= 126) ||
        (c >= 160 && c <= 255)
      )
    ) {
      weird++;
    }
  }
  return weird / n > 0.1;
}

function sha1(s) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

async function* walk(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (DEFAULT_IGNORES.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      yield* walk(p);
    } else if (ent.isFile()) {
      yield p;
    }
  }
}

function skipByName(p) {
  const base = path.basename(p);
  for (const gl of IGNORE_FILE_GLOBS) {
    if (base.endsWith(gl)) return true;
  }
  return false;
}

async function readTextSmart(p) {
  const stat = await fsp.stat(p);
  if (stat.size === 0) return { skip: true, reason: "empty" };
  if (stat.size > MAX_BYTES) {
    // Read head only, but still index; description will mention truncation
    const fd = await fsp.open(p, "r");
    const buf = Buffer.alloc(Math.min(MAX_BYTES, 8192));
    await fd.read(buf, 0, buf.length, 0);
    await fd.close();
    if (looksBinary(buf)) return { skip: true, reason: "binary/large" };
    const head = await fsp
      .readFile(p, { encoding: "utf8" })
      .then((s) => s.slice(0, MAX_BYTES));
    return { text: head, truncated: true };
  } else {
    const fd = await fsp.open(p, "r");
    const buf = Buffer.alloc(Math.min(stat.size, 8192));
    await fd.read(buf, 0, buf.length, 0);
    await fd.close();
    if (looksBinary(buf)) return { skip: true, reason: "binary" };
    const text = await fsp.readFile(p, "utf8");
    return { text, truncated: false };
  }
}

function langFromExt(p) {
  const ext = path.extname(p).replace(".", "").toLowerCase();
  return EXT_LANG.get(ext) || "text";
}

function runOllama(model, prompt) {
  return new Promise((resolve, reject) => {
    const proc = spawn("ollama", ["run", model], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => {
      out += d.toString();
    });
    proc.stderr.on("data", (d) => {
      err += d.toString();
    });
    proc.on("close", (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(`ollama exit ${code}: ${err || out}`));
    });
    // Keep the prompt short; descriptions should be 1–3 lines max.
    proc.stdin.write(prompt);
    proc.stdin.end();
  });
}

function buildPrompt(relPath, headSample) {
  return `You are a precise code summarizer. In 60 words or less, describe the intent and role of the file named "${relPath}". If it is configuration or data, say so. If there are obvious risks (secrets, keys, hardcoded tokens), call them out briefly. Be concrete, not generic.

FILE SAMPLE (may be truncated):
--------------------------------
${headSample}
--------------------------------`;
}

async function ensureOutputHeader() {
  try {
    await fsp.access(OUTPUT, fs.constants.F_OK);
  } catch {
    const header = `#+TITLE: Catalog for ${path.basename(ROOT)}
#+AUTHOR: Automated (via Ollama)
#+OPTIONS: toc:nil num:nil
#tags #org #ollama #documentation

`;
    await fsp.writeFile(OUTPUT, header, "utf8");
  }
}

async function alreadyIndexed(relPath, contentHash) {
  try {
    const data = await fsp.readFile(OUTPUT, "utf8");
    return (
      data.includes(`:ID: ${contentHash}`) || data.includes(`:FILE: ${relPath}`)
    );
  } catch {
    return false;
  }
}

function toOrgEntry(relPath, desc, lang, body, truncated, contentHash) {
  const now = new Date().toISOString();
  return `* ${relPath}
:PROPERTIES:
:ID: ${contentHash}
:FILE: ${relPath}
:WHEN: ${now}
:MODEL: ${MODEL}
:TRUNCATED: ${truncated ? "yes" : "no"}
:END:

** Description
${desc}

** Contents
#+BEGIN_SRC ${lang} :noweb yes :tangle no
${body}
#+END_SRC

`;
}

async function main() {
  await ensureOutputHeader();

  const tasks = [];
  for await (const abs of walk(ROOT)) {
    if (abs === OUTPUT) continue;
    if (skipByName(abs)) continue;

    const rel = path.relative(ROOT, abs);
    tasks.push({ abs, rel });
  }

  let active = 0;
  let idx = 0;
  let processed = 0,
    skipped = 0,
    errors = 0;

  const next = async () => {
    if (idx >= tasks.length) return;
    if (active >= CONCURRENCY) return;

    const me = tasks[idx++];
    active++;

    (async () => {
      try {
        const res = await readTextSmart(me.abs);
        if (res.skip) {
          skipped++;
        } else {
          const headForLLM = res.text.slice(0, 4000);
          const hash = sha1(me.rel + "|" + sha1(res.text));
          if (await alreadyIndexed(me.rel, hash)) {
            // Already present; skip duplicate entries
            skipped++;
          } else {
            const prompt = buildPrompt(me.rel, headForLLM);
            const desc = await runOllama(MODEL, prompt);
            const lang = langFromExt(me.abs);
            const body = res.text.replace(/\r\n/g, "\n");
            const entry = toOrgEntry(
              me.rel,
              desc,
              lang,
              body,
              !!res.truncated,
              hash,
            );
            await fsp.appendFile(OUTPUT, entry, "utf8");
            processed++;
          }
        }
      } catch (e) {
        errors++;
        console.error("[error]", me.rel, e.message);
      } finally {
        active--;
        await next();
      }
    })();

    // fill workers
    while (active < CONCURRENCY && idx < tasks.length) {
      await next();
    }
  };

  await next();

  // wait for drain
  while (active > 0) {
    await new Promise((r) => setTimeout(r, 50));
  }

  console.log(
    `Done. processed=${processed} skipped=${skipped} errors=${errors} -> ${OUTPUT}`,
  );
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
