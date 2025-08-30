import { promises as fs } from "fs";
import path from "path";

/**
 * Convert a hyphenated service name into title case.
 * @param {string} name Service identifier like "discord-indexer".
 * @returns {string} Title-cased name such as "Discord Indexer".
 */
function titleize(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Build a space-separated list of tags for service implementations.
 * @param {{lang: string}[]} impls Implementations across languages.
 * @returns {string} Example: "#service #js #py".
 */
function buildTags(impls) {
  return ["#service", ...new Set(impls.map((i) => `#${i.lang}`))].join(" ");
}

/**
 * Generate stub AGENTS.md files for each discovered service.
 * @returns {Promise<void>} Resolves when files are written.
 */
async function main() {
  const servicesRoot = path.join(process.cwd(), "services");
  const docsRoot = path.join(process.cwd(), "docs", "services");

  const entries = await fs.readdir(servicesRoot, { withFileTypes: true });
  const exclude = new Set(["shared", "templates"]);
  const serviceMap = new Map();

  for (const langEntry of entries) {
    if (!langEntry.isDirectory()) continue;
    const lang = langEntry.name;
    if (exclude.has(lang)) continue;
    const langDir = path.join(servicesRoot, lang);
    const services = await fs.readdir(langDir, { withFileTypes: true });
    for (const svc of services) {
      if (!svc.isDirectory()) continue;
      const svcName = svc.name;
      const key = svcName.replace(/_/g, "-");
      const implPath = path.join("services", lang, svcName);
      if (!serviceMap.has(key)) serviceMap.set(key, []);
      serviceMap.get(key).push({ lang, implPath });
    }
  }

  await fs.mkdir(docsRoot, { recursive: true });

  for (const [service, impls] of serviceMap.entries()) {
    const docDir = path.join(docsRoot, service);
    await fs.mkdir(docDir, { recursive: true });
    const agentFile = path.join(docDir, "AGENTS.md");
    try {
      await fs.access(agentFile);
      continue; // Skip if already exists
    } catch {
      // File doesn't exist; create stub
    }

    const content = `
# ${titleize(service)} Service

## Overview

TODO: Add service description.

## Paths

${impls
  .map((impl) => `- [${impl.implPath}](../../../${impl.implPath})`)
  .join("\n")}

## Tags

${buildTags(impls)}
`
      .trim()
      .replace(/^ +/gm, "");

    await fs.writeFile(agentFile, `${content}\n`);
  }
}

/*
Example output for a service with JS and Python implementations:

# Stt Service

## Overview

TODO: Add service description.

## Paths

- [services/js/stt](../../../services/js/stt)
- [services/py/stt](../../../services/py/stt)

## Tags

#service #js #py
*/

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
