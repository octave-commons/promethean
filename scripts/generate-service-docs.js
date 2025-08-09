import { promises as fs } from "fs";
import path from "path";

function titleize(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

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

    const tags = ["#service", ...new Set(impls.map((i) => `#${i.lang}`))].join(
      " ",
    );
    const lines = [];
    lines.push(`# ${titleize(service)} Service`);
    lines.push("");
    lines.push("## Overview");
    lines.push("");
    lines.push("TODO: Add service description.");
    lines.push("");
    lines.push("## Paths");
    lines.push("");
    for (const impl of impls) {
      lines.push(`- [${impl.implPath}](../../../${impl.implPath})`);
    }
    lines.push("");
    lines.push("## Tags");
    lines.push("");
    lines.push(tags);
    lines.push("");

    await fs.writeFile(agentFile, lines.join("\n"));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
