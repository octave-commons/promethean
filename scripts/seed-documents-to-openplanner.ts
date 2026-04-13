#!/usr/bin/env node
/**
 * Manual Document Ingestion Script
 *
 * This script ingests markdown documents from the devel workspace into OpenPlanner
 * so they appear in the CMS and can be translated.
 *
 * Usage:
 *   node scripts/ingest-documents-to-openplanner.ts [OPTIONS]
 *
 * Options:
 *   --project <name>      Project name (default: devel-docs)
 *   --limit <number>      Limit number of documents (default: 50)
 *   --dry-run             Show what would be ingested without actually ingesting
 */

import { readdir, readFile } from "fs/promises";
import { join, extname, basename } from "path";
import { createHash } from "crypto";

const OPENPLANNER_URL = process.env.OPENPLANNER_URL || "http://localhost:7777";
const OPENPLANNER_API_KEY = process.env.OPENPLANNER_API_KEY || "change-me-openplanner";
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || "/app/workspace/devel";

interface Document {
  id: string;
  title: string;
  content: string;
  project: string;
  kind: "docs" | "code" | "config" | "data";
  visibility: "internal" | "review" | "public" | "archived";
  source: string;
  sourcePath: string;
  domain: string;
  language: string;
  createdBy: string;
  metadata: Record<string, unknown>;
}

async function findMarkdownFiles(root: string, limit: number): Promise<string[]> {
  const files: string[] = [];

  async function scan(dir: string): Promise<void> {
    if (files.length >= limit) return;

    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (files.length >= limit) break;

        // Skip hidden directories and common non-doc directories
        if (entry.name.startsWith(".") || 
            ["node_modules", ".git", ".nx", "dist", "build", "target", ".worktrees", "worktrees"].includes(entry.name)) {
          continue;
        }

        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile() && [".md", ".markdown", ".mdx"].includes(extname(entry.name))) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
  }

  await scan(root);
  return files;
}

function deriveDomain(path: string): string {
  const parts = path.replace(WORKSPACE_ROOT, "").split("/").filter(Boolean);

  if (parts.length === 0) return "general";

  // Check for common domain patterns
  if (parts.includes("docs")) return "documentation";
  if (parts.includes("specs") || parts.includes("spec")) return "specifications";
  if (parts.includes("notes")) return "notes";
  if (parts.includes("README")) return "readme";

  // Use first directory as domain
  return parts[0];
}

async function ingestDocument(filePath: string, project: string, dryRun: boolean): Promise<Document> {
  const content = await readFile(filePath, "utf-8");
  const relativePath = filePath.replace(WORKSPACE_ROOT + "/", "");

  // Create stable ID from path
  const id = createHash("sha256")
    .update(relativePath)
    .digest("hex")
    .substring(0, 16);

  const doc: Document = {
    id,
    title: basename(filePath).replace(/\.(md|markdown|mdx)$/, ""),
    content,
    project,
    kind: "docs",
    visibility: "internal",
    source: "manual-ingestion",
    sourcePath: relativePath,
    domain: deriveDomain(filePath),
    language: "en",
    createdBy: "ingestion-script",
    metadata: {
      ingested_at: new Date().toISOString(),
      file_size: content.length,
      line_count: content.split("\n").length,
    },
  };

  if (dryRun) {
    console.log(`[DRY RUN] Would ingest: ${relativePath}`);
    return doc;
  }

  // Send to OpenPlanner
  const response = await fetch(`${OPENPLANNER_URL}/v1/documents`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENPLANNER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ document: doc }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to ingest ${relativePath}: ${response.status} ${error}`);
  }

  console.log(`✓ Ingested: ${relativePath}`);
  return doc;
}

async function main() {
  const args = process.argv.slice(2);
  const projectIndex = args.indexOf("--project");
  const project = projectIndex >= 0 ? args[projectIndex + 1] : "devel-docs";

  const limitIndex = args.indexOf("--limit");
  const limit = limitIndex >= 0 ? parseInt(args[limitIndex + 1]) : 50;

  const dryRun = args.includes("--dry-run");

  console.log("==========================================");
  console.log("Document Ingestion to OpenPlanner");
  console.log("==========================================");
  console.log(`Workspace: ${WORKSPACE_ROOT}`);
  console.log(`Project: ${project}`);
  console.log(`Limit: ${limit}`);
  console.log(`Dry Run: ${dryRun}`);
  console.log("");

  // Find markdown files
  console.log("Finding markdown files...");
  const files = await findMarkdownFiles(WORKSPACE_ROOT, limit);
  console.log(`Found ${files.length} markdown files\n`);

  if (files.length === 0) {
    console.log("No files found to ingest.");
    return;
  }

  // Ingest documents
  console.log("Ingesting documents...");
  console.log("");

  const results: Document[] = [];
  const errors: { file: string; error: string }[] = [];

  for (const file of files) {
    try {
      const doc = await ingestDocument(file, project, dryRun);
      results.push(doc);
    } catch (error) {
      errors.push({
        file: file.replace(WORKSPACE_ROOT + "/", ""),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Summary
  console.log("\n==========================================");
  console.log("Ingestion Summary");
  console.log("==========================================");
  console.log(`Total files: ${files.length}`);
  console.log(`Successfully ingested: ${results.length}`);
  console.log(`Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach(({ file, error }) => {
      console.log(`  ✗ ${file}: ${error}`);
    });
  }

  // Domain breakdown
  const domains: Record<string, number> = {};
  results.forEach(doc => {
    domains[doc.domain] = (domains[doc.domain] || 0) + 1;
  });

  console.log("\nDomain breakdown:");
  Object.entries(domains)
    .sort((a, b) => b[1] - a[1])
    .forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count}`);
    });

  console.log("\n✅ Ingestion complete!");
  console.log(`\nVerify in CMS: ${OPENPLANNER_URL}/v1/documents?project=${project}`);
}

main().catch(console.error);
