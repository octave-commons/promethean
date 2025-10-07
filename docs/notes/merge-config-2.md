---
```
uuid: 549566cf-0309-41e8-93de-0d7399324ccd
```
```
created_at: '2025-09-05T12:27:32Z'
```
```
filename: merge-config
```
```
title: merge-config
```
```
description: >-
```
  A flat, functional TypeScript package for deterministic merging of
  package.json, JSON, and YAML files with semver-aware dependency resolution.
tags:
  - typescript
  - packagejson
  - deterministic-merge
  - semver
  - yaml
  - ava
  - cli
```
related_to_uuid: []
```
```
related_to_title: []
```
references: []
---
Alright — let’s scaffold `@promethean/merge-config` as a flat, functional TypeScript package. It’ll compile to ESM (`.js` imports), be tested with **AVA**, and include the deterministic merge rules we talked about. You can then wire it into your Emacs Magit/AI workflow.

---

# 📦 `packages/merge-config/package.json`

```json
{
  "name": "@promethean/merge-config",
  "version": "0.1.0",
  "type": "module",
  "license": "GPL-3.0-only",
  "private": true,
  "bin": {
    "prom-merge-config": "dist/index.js"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "ava"
  },
  "dependencies": {
    "yaml": "^2.5.0",
    "semver": "^7.6.0"
  },
  "devDependencies": {
    "ava": "^6.1.2",
    "typescript": "^5.4.0"
  }
}
```

---

# ⚙️ `packages/merge-config/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "strict": true,
    "declaration": true
  },
  "include": ["src"]
}
```

---

# 🏗️ `src/index.ts`
```
Entry point + CLI dispatch.
```
```ts
#!/usr/bin/env node
import fs from "node:fs";
import { mergePackageJson } from "./merge-pkg.js";
import { mergeJson } from "./merge-json.js";
import { mergeYaml } from "./merge-yaml.js";

function usage() {
  console.error("Usage: prom-merge-config <package-json|json|yaml> BASE OURS THEIRS OUT");
  process.exit(1);
}

const [,, type, basePath, oursPath, theirsPath, outPath] = process.argv;
if (!type || !basePath || !oursPath || !theirsPath || !outPath) usage();

const base = fs.readFileSync(basePath, "utf8");
const ours = fs.readFileSync(oursPath, "utf8");
const theirs = fs.readFileSync(theirsPath, "utf8");

let merged: string;
switch (type) {
  case "package-json":
    merged = JSON.stringify(
      mergePackageJson(
        JSON.parse(base || "{}"),
        JSON.parse(ours || "{}"),
        JSON.parse(theirs || "{}")
      ),
      null,
      2
    );
    break;
  case "json":
    merged = JSON.stringify(
      mergeJson(
        JSON.parse(base || "{}"),
        JSON.parse(ours || "{}"),
        JSON.parse(theirs || "{}")
      ),
      null,
      2
    );
    break;
  case "yaml":
    merged = mergeYaml(base, ours, theirs);
    break;
  default:
    usage();
}

fs.writeFileSync(outPath, merged, "utf8");
```

---

# 📦 `src/merge-pkg.ts`

Rules for `package.json`.

```ts
import { mergeJson } from "./merge-json.js";
import semver from "semver";

type JSONObject = Record<string, any>;

function mergeDeps(a: JSONObject, b: JSONObject): JSONObject {
  const out: JSONObject = { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (out[k]) {
      const newer = pickNewerSemver(out[k], v as string);
      out[k] = newer ?? v;
    } else {
      out[k] = v;
    }
  }
  return out;
}

function pickNewerSemver(a: string, b: string): string | null {
  try {
    const ra = semver.minVersion(a);
    const rb = semver.minVersion(b);
    if (ra && rb) {
      return semver.gt(ra, rb) ? a : b;
    }
  } catch {}
  return null;
}

export function mergePackageJson(base: JSONObject, ours: JSONObject, theirs: JSONObject): JSONObject {
  const merged = mergeJson(base, ours, theirs);

  const depSections = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
  for (const section of depSections) {
    merged[section] = mergeDeps(ours[section] ?? {}, theirs[section] ?? {});
  }

  if (ours.scripts || theirs.scripts) {
    merged.scripts = { ...ours.scripts, ...theirs.scripts };
  }

  return sortKeys(merged);
}

function sortKeys(obj: JSONObject): JSONObject {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}
```

---

# 🧩 `src/merge-json.ts`

Simple deep merge.

```ts
type JSONObject = Record<string, any>;

export function mergeJson(base: JSONObject, ours: JSONObject, theirs: JSONObject): JSONObject {
  const out: JSONObject = { ...base };

  const keys = new Set([...Object.keys(base), ...Object.keys(ours), ...Object.keys(theirs)]);
  for (const key of keys) {
    const bv = base[key];
    const ov = ours[key];
    const tv = theirs[key];

    if (typeof ov === "object" && typeof tv === "object" && !Array.isArray(ov) && !Array.isArray(tv)) {
      out[key] = mergeJson(bv ?? {}, ov, tv);
    } else if (tv !== undefined) {
      out[key] = tv;
    } else if (ov !== undefined) {
      out[key] = ov;
    } else {
      out[key] = bv;
    }
  }
  return out;
}
```

---

# 🧩 `src/merge-yaml.ts`

Preserve YAML structure.

```ts
import { parseDocument } from "yaml";

export function mergeYaml(base: string, ours: string, theirs: string): string {
  const bdoc = parseDocument(base || "{}");
  const odoc = parseDocument(ours || "{}");
  const tdoc = parseDocument(theirs || "{}");

  const merged = deepMerge(bdoc.toJS(), odoc.toJS(), tdoc.toJS());
  const outDoc = parseDocument(merged);
  return outDoc.toString();
}

function deepMerge(base: any, ours: any, theirs: any): any {
  if (Array.isArray(ours) && Array.isArray(theirs)) {
    const combined = [...ours, ...theirs];
    return Array.from(new Set(combined));
  }
  if (typeof ours === "object" && typeof theirs === "object") {
    const out: Record<string, any> = { ...base };
    for (const k of new Set([...Object.keys(base || {}), ...Object.keys(ours || {}), ...Object.keys(theirs || {})])) {
      out[k] = deepMerge(base?.[k], ours?.[k], theirs?.[k]);
    }
    return out;
  }
  return theirs ?? ours ?? base;
}
```

---

# ✅ `test/merge-pkg.test.ts`

Example AVA tests.

```ts
import test from "ava";
import { mergePackageJson } from "../src/merge-pkg.js";

test("merges dependencies by picking newer", t => {
  const base = {};
  const ours = { dependencies: { lodash: "^4.17.0" } };
  const theirs = { dependencies: { lodash: "^4.18.0" } };

  const out = mergePackageJson(base, ours, theirs);
  t.is(out.dependencies.lodash, "^4.18.0");
});

test("merges scripts", t => {
  const base = {};
  const ours = { scripts: { build: "tsc" } };
  const theirs = { scripts: { test: "ava" } };

  const out = mergePackageJson(base, ours, theirs);
  t.deepEqual(out.scripts, { build: "tsc", test: "ava" });
});
```

---

👉 This gives you a **deterministic merge tool**:

* `package.json`: semver-union deps, merge scripts, deep-merge configs, sorted keys.
* JSON: recursive deep merge, prefer THEIRS on conflict.
* YAML: deep merge maps, dedup arrays.

You can now call it from Emacs `prom-merge-config …` before invoking an AI fallback.

Do you want me to zip this whole scaffold so you can drop it directly into your `packages/` folder, or just keep it inline like this?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
