import fs from "fs";
import path from "path";

import { isValidTopic, headerOk } from "../shared/js/prom-lib/naming/rules.ts";
import { reg as schemaReg } from "../shared/js/prom-lib/schema/topics.ts";

const ROOT = process.env.REPO_ROOT || process.cwd();
const SRC_DIRS = ["services", "shared/js"]; // add more if needed

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|js|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

// very naive grep; good enough for CI guardrails
const PUB_RE = /publish\(\s*["'`]([a-zA-Z0-9\.\-:]+)["'`]/g;
const HDR_RE = /headers\s*:\s*\{([^}]+)\}/g;
const HDR_KEY_RE = /["'`]([a-zA-Z0-9\-\_]+)["'`]\s*:/g;

let errors: string[] = [];

function checkFile(p: string) {
  const s = fs.readFileSync(p, "utf8");
  let m: RegExpExecArray | null;
  while ((m = PUB_RE.exec(s))) {
    const topic = m[1];
    if (!isValidTopic(topic)) errors.push(`${p}: invalid topic '${topic}'`);
    // schema coverage: either versioned or present in registry (ok to skip for internal)
    const versioned = /\.v\d+$/.test(topic);
    const hasSchema = !!schemaReg.latest(topic);
    if (!versioned && !hasSchema)
      errors.push(`${p}: unregistered topic '${topic}' (no schema)`);
  }

  while ((m = HDR_RE.exec(s))) {
    const obj = m[1];
    let kh: RegExpExecArray | null;
    while ((kh = HDR_KEY_RE.exec(obj))) {
      const k = kh[1];
      if (!/^x-/.test(k) && !/^content-type$/i.test(k)) {
        if (!headerOk(k))
          errors.push(`${p}: header key '${k}' should be 'x-...'`);
      }
    }
  }
}

for (const d of SRC_DIRS) {
  const abs = path.join(ROOT, d);
  if (!fs.existsSync(abs)) continue;
  for (const f of walk(abs)) checkFile(f);
}

if (errors.length) {
  console.error("Topic/Schema/Header lints failed:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
} else {
  console.log("Topic/Schema/Header lints OK");
}
