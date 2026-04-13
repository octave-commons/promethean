#!/usr/bin/env node
/**
 * riatzukiza-portfolio service
 *
 * - Serves the portfolio static site from orgs/riatzukiza/riatzukiza.github.io/static
 * - Exposes Quartz Garden generation endpoints
 */

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(serviceRoot, "..", "..");

const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number.parseInt(process.env.PORT ?? process.env.RIATZUKIZA_PORTFOLIO_PORT ?? "8088", 10);

const DEFAULT_STATIC_ROOT = path.resolve(
  workspaceRoot,
  "orgs/riatzukiza/riatzukiza.github.io/static",
);

const STATIC_ROOT = path.resolve(
  process.env.PORTFOLIO_STATIC_ROOT
    ? path.resolve(workspaceRoot, process.env.PORTFOLIO_STATIC_ROOT)
    : DEFAULT_STATIC_ROOT,
);

const GARDEN_OUTPUT_ROOT = process.env.QUARTZ_GARDEN_OUTPUT_ROOT
  ? path.resolve(workspaceRoot, process.env.QUARTZ_GARDEN_OUTPUT_ROOT)
  : path.join(STATIC_ROOT, "garden");

const GENERATE_SCRIPT = path.join(serviceRoot, "src", "garden", "generate.mjs");

let generationInFlight = null;

function json(res, statusCode, body) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function text(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "content-type": contentType,
    "cache-control": "no-store",
  });
  res.end(body);
}

function contentTypeForPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
    case ".mjs":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".ico":
      return "image/x-icon";
    case ".txt":
      return "text/plain; charset=utf-8";
    case ".xml":
      return "application/xml; charset=utf-8";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    case ".ttf":
      return "font/ttf";
    case ".otf":
      return "font/otf";
    case ".wasm":
      return "application/wasm";
    case ".map":
      return "application/json; charset=utf-8";
    case ".mp4":
      return "video/mp4";
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

function sanitizeUrlPath(urlPath) {
  // Decode safely; if it fails, treat as not found.
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }

  // Remove any null bytes.
  decoded = decoded.replaceAll("\u0000", "");

  // Normalize path segments and forbid traversal.
  const parts = decoded.split("/").filter((p) => p.length > 0);
  const safe = [];
  for (const part of parts) {
    if (part === "." || part === "..") continue;
    safe.push(part);
  }
  return "/" + safe.join("/");
}

async function tryStat(filePath) {
  try {
    return await fsp.stat(filePath);
  } catch {
    return null;
  }
}

async function serveStatic(req, res, url) {
  const safePath = sanitizeUrlPath(url.pathname);
  if (!safePath) {
    json(res, 400, { error: "bad_path" });
    return;
  }

  // Default to index.html
  let target = safePath === "/" ? "/index.html" : safePath;

  // If path ends with /, serve index.html in that directory.
  if (target.endsWith("/")) {
    target = target + "index.html";
  }

  const abs = path.resolve(STATIC_ROOT, "." + target);
  const rel = path.relative(STATIC_ROOT, abs);
  if (rel.startsWith(".." + path.sep) || rel === "..") {
    json(res, 403, { error: "forbidden" });
    return;
  }

  const stat = await tryStat(abs);
  if (!stat) {
    json(res, 404, { error: "not_found" });
    return;
  }

  if (stat.isDirectory()) {
    // Directory -> try index.html
    const idx = path.join(abs, "index.html");
    const idxStat = await tryStat(idx);
    if (!idxStat || !idxStat.isFile()) {
      json(res, 404, { error: "not_found" });
      return;
    }

    res.writeHead(200, {
      "content-type": contentTypeForPath(idx),
      "content-length": String(idxStat.size),
      "cache-control": "no-cache",
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    createReadStream(idx).pipe(res);
    return;
  }

  res.writeHead(200, {
    "content-type": contentTypeForPath(abs),
    "content-length": String(stat.size),
    "cache-control": "no-cache",
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  createReadStream(abs).pipe(res);
}

async function handleGenerate(req, res, projectId) {
  if (generationInFlight) {
    json(res, 409, { error: "generation_in_flight" });
    return;
  }

  const args = [GENERATE_SCRIPT];
  if (projectId) {
    args.push("--project", projectId);
  }

  generationInFlight = new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: workspaceRoot,
      env: {
        ...process.env,
        QUARTZ_GARDEN_OUTPUT_ROOT: path.relative(workspaceRoot, GARDEN_OUTPUT_ROOT),
      },
    });

    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString("utf8");
    });

    child.on("close", (code) => {
      resolve({ code, output });
    });
  });

  const result = await generationInFlight;
  generationInFlight = null;

  const lines = String(result.output || "").trim().split(/\r?\n/);
  const last = lines.length > 0 ? lines[lines.length - 1] : "";
  let parsed = null;
  try {
    parsed = last.startsWith("{") ? JSON.parse(last) : null;
  } catch {
    parsed = null;
  }

  json(res, result.code === 0 ? 200 : 500, {
    ok: result.code === 0,
    exitCode: result.code,
    summary: parsed,
    output: result.output.slice(-60_000),
  });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    if (url.pathname === "/api/health") {
      json(res, 200, {
        ok: true,
        staticRoot: path.relative(workspaceRoot, STATIC_ROOT),
        gardenOutputRoot: path.relative(workspaceRoot, GARDEN_OUTPUT_ROOT),
      });
      return;
    }

    if (url.pathname === "/api/garden/manifest") {
      const manifestPath = path.join(GARDEN_OUTPUT_ROOT, "manifest.json");
      const raw = await fsp.readFile(manifestPath, "utf8").catch(() => null);
      if (!raw) {
        json(res, 404, { error: "manifest_not_found" });
        return;
      }
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(raw);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/garden/generate") {
      const projectId = url.searchParams.get("project") ?? null;
      await handleGenerate(req, res, projectId);
      return;
    }

    if (req.method === "POST" && url.pathname.startsWith("/api/garden/generate/")) {
      const projectId = url.pathname.split("/").pop() || null;
      await handleGenerate(req, res, projectId);
      return;
    }

    // Static
    if (req.method !== "GET" && req.method !== "HEAD") {
      json(res, 405, { error: "method_not_allowed" });
      return;
    }

    await serveStatic(req, res, url);
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[riatzukiza-portfolio] listening on http://${HOST}:${PORT}`);
});
