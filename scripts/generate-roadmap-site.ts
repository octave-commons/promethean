import fs from 'fs';
import path from 'path';

// Directories
const docsDir = path.resolve(__dirname, '../docs/architecture');
const siteDir = path.resolve(__dirname, '../sites/roadmap');
const outFile = path.join(siteDir, 'index.html');
const inventoryFile = path.join(siteDir, 'inventory.json');

type MermaidNode = {
    id: string;
    label: string | null;
};

type InventoryEntry = {
    file: string;
    blockIndex: number;
    nodes: MermaidNode[];
};

// Ensure output dir exists
if (!fs.existsSync(siteDir)) {
    fs.mkdirSync(siteDir, { recursive: true });
}

// Collect markdown files
const files = fs
    .readdirSync(docsDir)
    .filter((f) => f.endsWith('.md'))
    .sort();

// Extract Mermaid blocks + headings
function extractMermaid(content: string): string[] {
    const regex = /```mermaid([\s\S]*?)```/g;
    const blocks: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        blocks.push(match[1]);
    }
    return blocks;
}

function extractLabel(raw: string | undefined): string | null {
    if (!raw) {
        return null;
    }

    const trimmed = raw.trim();
    const wrappers: Array<[string, string]> = [
        ['[[', ']]'],
        ['[', ']'],
        ['((', '))'],
        ['(', ')'],
        ['{{', '}}'],
        ['{', '}'],
    ];

    for (const [open, close] of wrappers) {
        if (trimmed.startsWith(open) && trimmed.endsWith(close)) {
            return trimmed.slice(open.length, trimmed.length - close.length).trim();
        }
    }

    return trimmed || null;
}

function parseMermaidNodes(block: string): MermaidNode[] {
    const nodeRegex = /([A-Za-z0-9_][A-Za-z0-9_-]*)\s*(\[\[[^\]]*\]\]|\[[^\]]*\]|\(\([^)]*\)\)|\([^)]*\)|\{[^}]*\}|\{\{[^}]*\}\})?/g;
    const skipTokens = new Set([
        'graph',
        'subgraph',
        'end',
        'classDef',
        'class',
        'style',
        'linkStyle',
        'click',
        'accTitle',
        'accDescr',
        'accDescrRef',
        'accTitleRef',
        'accRef',
        'accDescrLong',
        'TB',
        'TD',
        'LR',
        'BT',
        'RL',
    ]);

    const nodes = new Map<string, MermaidNode>();
    const lines = block.split('\n');

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('%%')) {
            continue;
        }

        nodeRegex.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = nodeRegex.exec(line)) !== null) {
            const id = match[1];
            if (!id || skipTokens.has(id)) {
                continue;
            }

            const label = extractLabel(match[2] ?? undefined);
            const existing = nodes.get(id);
            if (!existing) {
                nodes.set(id, { id, label });
            } else if (!existing.label && label) {
                nodes.set(id, { ...existing, label });
            }
        }
    }

    return Array.from(nodes.values()).sort((a, b) => a.id.localeCompare(b.id));
}

// Build sections from docs and capture inventory metadata
const inventoryEntries: InventoryEntry[] = [];
const globalNodes = new Map<
    string,
    {
        label: string | null;
        occurrences: Array<{ file: string; blockIndex: number; label: string | null }>;
    }
>();
let sections = '';
for (const file of files) {
    const filePath = path.join(docsDir, file);
    const relativePath = path.relative(path.resolve(__dirname, '..'), filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const title = (content.match(/^#\s+(.*)/m) || [null, file])[1];
    const blocks = extractMermaid(content);
    if (blocks.length > 0) {
        sections += `<section><h2>${title}</h2>`;
        blocks.forEach((block, index) => {
            sections += `<div class="mermaid">${block}</div>`;
            const nodes = parseMermaidNodes(block);
            inventoryEntries.push({
                file: relativePath,
                blockIndex: index,
                nodes,
            });
            nodes.forEach((node) => {
                const occurrence = { file: relativePath, blockIndex: index, label: node.label };
                const existing = globalNodes.get(node.id);
                if (existing) {
                    if (!existing.label && node.label) {
                        existing.label = node.label;
                    }
                    existing.occurrences.push(occurrence);
                } else {
                    globalNodes.set(node.id, {
                        label: node.label,
                        occurrences: [occurrence],
                    });
                }
            });
        });
        sections += `</section>`;
    }
}

inventoryEntries.sort((a, b) => {
    if (a.file === b.file) {
        return a.blockIndex - b.blockIndex;
    }
    return a.file.localeCompare(b.file);
});

const uniqueNodes = Array.from(globalNodes.entries())
    .map(([id, data]) => ({
        id,
        label: data.label,
        occurrences: data.occurrences.sort((a, b) => {
            if (a.file === b.file) {
                return a.blockIndex - b.blockIndex;
            }
            return a.file.localeCompare(b.file);
        }),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

const inventoryReport = {
    generatedAt: new Date().toISOString(),
    totals: {
        files: files.length,
        blocks: inventoryEntries.length,
        uniqueNodes: uniqueNodes.length,
    },
    sources: inventoryEntries,
    nodes: uniqueNodes,
};

// Persist the inventory before emitting HTML so downstream tooling can consume it independently.
fs.writeFileSync(inventoryFile, `${JSON.stringify(inventoryReport, null, 2)}\n`, 'utf-8');

// HTML template
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Promethean Roadmap Dashboard</title>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true });
  </script>
  <style>
    body { font-family: sans-serif; padding: 2rem; max-width: 1000px; margin: auto; }
    section { margin-bottom: 3rem; }
    h1, h2 { border-bottom: 1px solid #ccc; padding-bottom: 0.3rem; }
    .mermaid { margin: 1rem 0; }
  </style>
</head>
<body>
  <h1>Promethean Roadmap Dashboard</h1>
  ${sections}
</body>
</html>`;

// Write output
fs.writeFileSync(outFile, html, 'utf-8');
console.log(`✅ Roadmap site generated at ${outFile}`);
