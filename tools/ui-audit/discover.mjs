#!/usr/bin/env node

/**
 * UI Discovery Script for devel monorepo
 * Scans all TSX, JSX, CLJS, CLJC files to create a manifest for component extraction
 */

import { readdirSync, statSync, readFileSync, writeFileSync, existsSync, lstatSync } from 'fs';
import { join, relative, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..', '..');

// Skip patterns
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'out', 'target', '.cpcache', '.shadow-cljs',
  '.nx', '.worktrees', 'coverage', '.pnpm-store', 'external'
]);

const SKIP_PATTERNS = [
  /\/\.git\//,
  /\/node_modules\//,
  /\/dist\//,
  /\/target\//,
  /\.baseline$/,
  /lock$/,
  /pnpm-lock\.yaml$/,
  /bun\.lock$/,
  /package-lock\.json$/,
];

// Owned orgs for submodule classification
const OWNED_ORGS = ['riatzukiza', 'octave-commons', 'open-hax', 'ussyverse', 'anomalyco'];

// File extensions to scan
const UI_EXTENSIONS = new Set(['.tsx', '.jsx', '.cljs', '.cljc']);

// Third-party vendor patterns to skip
const VENDOR_PATTERNS = [
  /bevy_replicon/,
  /egregoria/,
  /ggrs/,
  /lightyear/,
  /verathar-server/,
];

/**
 * Parse .gitmodules to get submodule info
 */
function parseGitmodules(root) {
  const gmPath = join(root, '.gitmodules');
  if (!existsSync(gmPath)) return {};
  
  const content = readFileSync(gmPath, 'utf-8');
  const modules = {};
  
  // Parse ini-style gitmodules
  let current = null;
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[submodule')) {
      const match = trimmed.match(/\[submodule\s+"(.+)"\]/) || trimmed.match(/\[submodule\s+(.+)\]/);
      if (match) {
        current = match[1];
        modules[current] = {};
      }
    } else if (current && trimmed.includes('=')) {
      const [key, ...valParts] = trimmed.split('=');
      modules[current][key.trim()] = valParts.join('=').trim();
    }
  }
  
  return modules;
}

/**
 * Check if path is a vendor (third-party) repo
 */
function isVendorPath(path, submodules) {
  for (const pattern of VENDOR_PATTERNS) {
    if (pattern.test(path)) return true;
  }
  
  for (const [name, mod] of Object.entries(submodules)) {
    if (path.includes(name)) {
      const url = mod.url || '';
      const isOwned = OWNED_ORGS.some(org => url.includes(org));
      return !isOwned;
    }
  }
  
  return false;
}

/**
 * Classify submodule ownership
 */
function classifySubmodule(path, submodules) {
  // Check direct org paths
  for (const org of OWNED_ORGS) {
    if (path.includes(`/orgs/${org}/`) || path.includes(`/orgs/${org}\\`)) {
      return { owned: true, org };
    }
  }
  
  // Check gitmodules
  for (const [name, mod] of Object.entries(submodules)) {
    if (path.includes(name)) {
      const url = mod.url || '';
      const isOwned = OWNED_ORGS.some(org => url.includes(org));
      return { owned: isOwned, org: isOwned ? OWNED_ORGS.find(o => url.includes(o)) : 'vendor' };
    }
  }
  
  return { owned: true, org: 'root' };
}

/**
 * Walk directory recursively with cycle detection
 */
function* walkDir(dir, visited = new Set()) {
  const realPath = existsSync(dir) ? (lstatSync(dir).isSymbolicLink() ? dir : dir) : dir;
  
  if (visited.has(realPath)) return;
  visited.add(realPath);
  
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return; // Permission denied or other error
  }
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    // Skip hidden dirs and known skip dirs
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      yield* walkDir(fullPath, visited);
    } else if (entry.isFile()) {
      yield fullPath;
    } else if (entry.isSymbolicLink()) {
      // Follow symlink if it points to a directory
      try {
        const target = statSync(fullPath);
        if (target.isDirectory()) {
          yield* walkDir(fullPath, visited);
        } else {
          yield fullPath;
        }
      } catch (e) {
        // Broken symlink, skip
      }
    }
  }
}

/**
 * Main discovery function
 */
function discover() {
  console.error('Starting UI discovery from:', ROOT);
  
  const submodules = parseGitmodules(ROOT);
  console.error('Found submodules:', Object.keys(submodules).length);
  
  const files = [];
  const stats = {
    byExtension: {},
    byOrg: {},
    byDir: {},
    total: 0,
    skipped: 0
  };
  
  for (const filePath of walkDir(ROOT)) {
    const ext = extname(filePath);
    
    if (!UI_EXTENSIONS.has(ext)) continue;
    
    // Check skip patterns
    const relPath = relative(ROOT, filePath);
    if (SKIP_PATTERNS.some(p => p.test(relPath))) {
      stats.skipped++;
      continue;
    }
    
    // Check vendor paths
    if (isVendorPath(filePath, submodules)) {
      stats.skipped++;
      continue;
    }
    
    // Classify
    const { owned, org } = classifySubmodule(filePath, submodules);
    
    if (!owned) {
      stats.skipped++;
      continue;
    }
    
    // Get file size
    let size = 0;
    try {
      size = statSync(filePath).size;
    } catch (e) {
      // File may have disappeared
    }
    
    // Record file
    const record = {
      absPath: filePath,
      repoRelPath: relPath,
      submodule: org,
      lang: ext.slice(1),
      size
    };
    
    files.push(record);
    
    // Update stats
    stats.total++;
    stats.byExtension[ext] = (stats.byExtension[ext] || 0) + 1;
    stats.byOrg[org] = (stats.byOrg[org] || 0) + 1;
    
    const dir = dirname(relPath);
    stats.byDir[dir] = (stats.byDir[dir] || 0) + 1;
  }
  
  // Sort by size descending
  files.sort((a, b) => b.size - a.size);
  
  // Output
  const output = {
    generated: new Date().toISOString(),
    root: ROOT,
    stats: {
      ...stats,
      byDir: Object.fromEntries(
        Object.entries(stats.byDir)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 100)
      )
    },
    files
  };
  
  const outPath = join(ROOT, 'tools', 'ui-audit', 'discovered-files.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  
  console.error('\n=== Discovery Summary ===');
  console.error(`Total files: ${stats.total}`);
  console.error(`Skipped: ${stats.skipped}`);
  console.error('\nBy Extension:');
  for (const [ext, count] of Object.entries(stats.byExtension).sort((a, b) => b[1] - a[1])) {
    console.error(`  ${ext}: ${count}`);
  }
  console.error('\nBy Org:');
  for (const [org, count] of Object.entries(stats.byOrg).sort((a, b) => b[1] - a[1])) {
    console.error(`  ${org}: ${count}`);
  }
  console.error(`\nOutput written to: ${outPath}`);
  
  return output;
}

discover();
