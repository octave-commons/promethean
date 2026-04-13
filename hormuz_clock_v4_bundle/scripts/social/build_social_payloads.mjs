#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundleRoot = path.resolve(__dirname, '../..');

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function trim(text, max) {
  if (text.length <= max) return text;
  if (max <= 3) return text.slice(0, Math.max(0, max));
  const allowed = Math.max(0, max - 3);
  return text.slice(0, allowed).trimEnd() + '...';
}

function extractSummary(markdown) {
  const lines = markdown.split(/\r?\n/).filter(Boolean);
  const bullets = lines.filter((l) => /^[-*]\s/.test(l)).map((l) => l.replace(/^[-*]\s/, '').trim());
  const paragraphs = lines.filter((l) => !/^#/.test(l) && !/^[-*]\s/.test(l));
  return {
    headline: paragraphs[0] || 'Hormuz clock update',
    bullets: bullets.slice(0, 5),
  };
}

function buildPayloads(reportPath, root = bundleRoot) {
  const resolvedReportPath = path.resolve(reportPath);
  const md = readText(resolvedReportPath);
  const summary = extractSummary(md);
  const bulletText = summary.bullets.slice(0, 3).map((b) => `- ${b}`).join('\n');
  const base = [summary.headline, bulletText].filter(Boolean).join('\n').trim();
  return {
    bluesky: {
      text: trim(base, 280),
      thread: summary.bullets.slice(3).map((b) => trim(b, 280)),
      image: {
        path: path.resolve(root, 'assets/hormuz_risk_clock_v4.png'),
        mimeType: 'image/png',
        alt: trim(`${summary.headline} chart`, 1000),
      },
    },
    discord: {
      content: trim(base, 1900),
      embed: {
        title: trim(summary.headline, 200),
        description: trim(summary.bullets.map((b) => `- ${b}`).join('\n'), 3800),
      },
    },
    x: {
      text: trim(base.replace(/\n- /g, ' - '), 280),
      thread: summary.bullets.slice(3).map((b) => trim(b, 280)),
    },
    reddit: {
      title: trim(summary.headline, 300),
      body: md,
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const reportPath = process.argv[2] || path.resolve(bundleRoot, 'reports/v4_snapshot.md');
  const outPath = process.argv[3] || path.resolve(bundleRoot, 'data/social_payloads.latest.json');
  const payloads = buildPayloads(reportPath);
  fs.writeFileSync(outPath, JSON.stringify(payloads, null, 2));
  console.log(`wrote ${outPath}`);
}

export { buildPayloads };
