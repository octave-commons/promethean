// SPDX-License-Identifier: GPL-3.0-only
import fs from 'fs';
import path from 'path';

// Directories
const docsDir = path.resolve(__dirname, '../docs/architecture');
const siteDir = path.resolve(__dirname, '../sites/roadmap');
const outFile = path.join(siteDir, 'index.html');

// Ensure output dir exists
if (!fs.existsSync(siteDir)) {
    fs.mkdirSync(siteDir, { recursive: true });
}

// Collect markdown files
const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md'));

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

// Build sections from docs
let sections = '';
for (const file of files) {
    const filePath = path.join(docsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const title = (content.match(/^#\s+(.*)/m) || [null, file])[1];
    const blocks = extractMermaid(content);
    if (blocks.length > 0) {
        sections += `<section><h2>${title}</h2>`;
        blocks.forEach((b, i) => {
            sections += `<div class="mermaid">${b}</div>`;
        });
        sections += `</section>`;
    }
}

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
