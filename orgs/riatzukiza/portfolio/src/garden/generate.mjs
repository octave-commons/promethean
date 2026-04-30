#!/usr/bin/env node
/**
 * Quartz Garden generator for the riatzukiza portfolio.
 *
 * Reads garden.config.json, generates graphs for each project, and writes:
 * - <outputRoot>/graphs/<projectId>/*
 * - <outputRoot>/manifest.json
 */

import os from "node:os";
import path from "node:path";
import fsp from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceRoot = path.resolve(__dirname, "..", "..");
const workspaceRoot = path.resolve(serviceRoot, "..", "..");

const DEFAULT_CONFIG_PATH = path.join(serviceRoot, "garden.config.json");
const TOOL_PATH = path.join(serviceRoot, "tools", "build-import-graphs.mjs");

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function safeNameForEntry(entryRelPosix) {
  return entryRelPosix.replaceAll("/", "__").replaceAll(".", "_");
}

function parseArgs(argv) {
  const args = {
    config: process.env.QUARTZ_GARDEN_CONFIG || DEFAULT_CONFIG_PATH,
    project: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--config") {
      args.config = argv[i + 1] ?? args.config;
      i += 1;
      continue;
    }
    if (token === "--project") {
      args.project = argv[i + 1] ?? null;
      i += 1;
      continue;
    }
  }

  return args;
}

function resolveUnder(baseAbs, maybeRelOrAbs) {
  if (!maybeRelOrAbs) return baseAbs;
  return path.isAbsolute(maybeRelOrAbs)
    ? maybeRelOrAbs
    : path.resolve(baseAbs, maybeRelOrAbs);
}

function assertInside(childAbs, parentAbs, label) {
  const rel = path.relative(parentAbs, childAbs);
  if (rel === "" || (!rel.startsWith(".." + path.sep) && rel !== ".." && !path.isAbsolute(rel))) {
    return;
  }
  throw new Error(`${label} must be inside ${parentAbs}: ${childAbs}`);
}

async function readJson(filePath) {
  const raw = await fsp.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function copyFile(src, dst) {
  await ensureDir(path.dirname(dst));
  await fsp.copyFile(src, dst);
}

async function exists(p) {
  try {
    await fsp.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function writeJson(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await fsp.writeFile(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

async function main() {
  const args = parseArgs(process.argv);
  const configAbs = path.isAbsolute(args.config)
    ? args.config
    : path.resolve(process.cwd(), args.config);

  const config = await readJson(configAbs);

  const outputRootRelOrAbs = process.env.QUARTZ_GARDEN_OUTPUT_ROOT || config.outputRoot;
  const outputRootAbs = resolveUnder(workspaceRoot, outputRootRelOrAbs);

  const graphsRootAbs = path.join(outputRootAbs, "graphs");
  await ensureDir(graphsRootAbs);

  /** @type {any[]} */
  const projects = Array.isArray(config.projects) ? config.projects : [];
  const filteredProjects = args.project
    ? projects.filter((p) => String(p?.id ?? "") === String(args.project))
    : projects;

  const startedAt = Date.now();

  /** @type {any[]} */
  const projectSummaries = [];

  for (const project of filteredProjects) {
    const projectId = String(project?.id ?? "").trim();
    if (!projectId) continue;

    const rootRel = String(project?.root ?? "").trim();
    const title = String(project?.title ?? projectId);

    const outGraphDirAbs = path.join(graphsRootAbs, projectId);
    assertInside(outGraphDirAbs, graphsRootAbs, "graph output dir");

    // Clean old outputs for this project.
    await fsp.rm(outGraphDirAbs, { recursive: true, force: true });
    await ensureDir(outGraphDirAbs);

    const tmpOutAbs = await fsp.mkdtemp(path.join(os.tmpdir(), `quartz-${projectId}-`));

    const entryDefs = Array.isArray(project?.entries) ? project.entries : [];
    const entryFiles = entryDefs
      .map((e) => String(e?.file ?? "").trim())
      .filter(Boolean);

    const toolArgs = [
      TOOL_PATH,
      "--root",
      rootRel,
      "--out",
      tmpOutAbs,
      "--id",
      projectId,
      "--title",
      title,
      ...entryFiles.flatMap((f) => ["--entry", f]),
    ];

    const t0 = Date.now();
    const run = spawnSync(process.execPath, toolArgs, {
      cwd: workspaceRoot,
      stdio: "inherit",
      env: process.env,
    });

    if (run.status !== 0) {
      projectSummaries.push({
        id: projectId,
        ok: false,
        error: `build-import-graphs exited with code ${run.status}`,
        root: rootRel,
        durationMs: Date.now() - t0,
      });
      continue;
    }

    // Copy outputs into the portfolio naming convention.
    const copyPairs = [
      // subsystems
      [path.join(tmpOutAbs, `${projectId}.subsystems.svg`), path.join(outGraphDirAbs, "subsystems.svg")],
      [path.join(tmpOutAbs, `${projectId}.subsystems.png`), path.join(outGraphDirAbs, "subsystems.png")],
      [path.join(tmpOutAbs, `${projectId}.subsystems.json`), path.join(outGraphDirAbs, "subsystems.json")],
      [path.join(tmpOutAbs, `${projectId}.subsystems.dot`), path.join(outGraphDirAbs, "subsystems.dot")],

      // imports
      [path.join(tmpOutAbs, `${projectId}.imports.svg`), path.join(outGraphDirAbs, "imports.svg")],
      [path.join(tmpOutAbs, `${projectId}.imports.png`), path.join(outGraphDirAbs, "imports.png")],
      [path.join(tmpOutAbs, `${projectId}.imports.json`), path.join(outGraphDirAbs, "imports.json")],
      [path.join(tmpOutAbs, `${projectId}.imports.dot`), path.join(outGraphDirAbs, "imports.dot")],
    ];

    for (const [src, dst] of copyPairs) {
      if (!(await exists(src))) {
        throw new Error(`missing expected output: ${src}`);
      }
      await copyFile(src, dst);
    }

    // entry graphs
    for (const entry of entryDefs) {
      const entryId = String(entry?.id ?? "").trim();
      const entryFile = String(entry?.file ?? "").trim();
      if (!entryId || !entryFile) continue;

      const entryRelPosix = toPosix(entryFile);
      const safe = safeNameForEntry(entryRelPosix);
      const srcSvg = path.join(tmpOutAbs, `${projectId}.entry.${safe}.svg`);
      const srcPng = path.join(tmpOutAbs, `${projectId}.entry.${safe}.png`);
      const srcDot = path.join(tmpOutAbs, `${projectId}.entry.${safe}.dot`);

      if (await exists(srcSvg)) {
        await copyFile(srcSvg, path.join(outGraphDirAbs, `entry.${entryId}.svg`));
      }
      if (await exists(srcPng)) {
        await copyFile(srcPng, path.join(outGraphDirAbs, `entry.${entryId}.png`));
      }
      if (await exists(srcDot)) {
        await copyFile(srcDot, path.join(outGraphDirAbs, `entry.${entryId}.dot`));
      }
    }

    // Pull a tiny stats summary from imports.json if present.
    let stats = null;
    try {
      const importsJson = await readJson(path.join(outGraphDirAbs, "imports.json"));
      stats = {
        nodes: Array.isArray(importsJson?.nodes) ? importsJson.nodes.length : null,
        edges: Array.isArray(importsJson?.edges) ? importsJson.edges.length : null,
      };
    } catch {
      // ignore
    }

    projectSummaries.push({
      id: projectId,
      ok: true,
      root: rootRel,
      outDir: toPosix(path.relative(workspaceRoot, outGraphDirAbs)),
      durationMs: Date.now() - t0,
      stats,
    });
  }

  // Build manifest.json for the static garden UI.
  const manifest = {
    generatedAt: new Date().toISOString(),
    projects: projects.map((p) => {
      const id = String(p?.id ?? "").trim();
      const graphBase = `graphs/${id}`;
      const entries = Array.isArray(p?.entries) ? p.entries : [];

      return {
        id,
        title: p?.title ?? id,
        subtitle: p?.subtitle ?? "",
        description: p?.description ?? "",
        tags: Array.isArray(p?.tags) ? p.tags : [],
        graphs: [
          {
            id: "subsystems",
            title: "Subsystems map",
            kind: "subsystems",
            svg: `${graphBase}/subsystems.svg`,
            png: `${graphBase}/subsystems.png`,
            json: `${graphBase}/subsystems.json`,
          },
          ...entries.map((e) => ({
            id: `entry-${String(e?.id ?? "").trim()}`,
            title: e?.title ?? `Entrypoint: ${e?.file ?? ""}`,
            kind: "entry",
            svg: `${graphBase}/entry.${String(e?.id ?? "").trim()}.svg`,
            png: `${graphBase}/entry.${String(e?.id ?? "").trim()}.png`,
          })),
          {
            id: "imports",
            title: "Full file import graph",
            kind: "files",
            svg: `${graphBase}/imports.svg`,
            png: `${graphBase}/imports.png`,
            json: `${graphBase}/imports.json`,
          },
        ],
      };
    }),
  };

  await writeJson(path.join(outputRootAbs, "manifest.json"), manifest);

  const summary = {
    ok: true,
    config: toPosix(path.relative(workspaceRoot, configAbs)),
    outputRoot: toPosix(path.relative(workspaceRoot, outputRootAbs)),
    generatedAt: manifest.generatedAt,
    durationMs: Date.now() - startedAt,
    projects: projectSummaries,
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(msg);
  process.exitCode = 1;
});
