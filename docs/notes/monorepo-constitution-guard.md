---
$$
uuid: 7e0441ea-5ab9-4d52-8415-fa08f3c26bb9
$$
$$
created_at: '2025-09-03T00:08:49Z'
$$
filename: Monorepo Constitution Guard
title: Monorepo Constitution Guard
$$
description: >-
$$
  A system to enforce monorepo rules using a constitution file that defines
  sacred files. PRs must run against the main branch's rules to prevent
  accidental changes to guard files themselves.
tags:
  - monorepo
  - convention
  - guard
$$
related_to_uuid: []
$$
$$
related_to_title: []
$$
references: []
---
Yeah, fair point: if the repo runs its *own* guards from the PR branch, I $or future-me$ can “fix the tests” and make red turn green. So don’t let PRs run the rules they’re trying to change.

Here’s the **no-bullshit** way to lock it down *inside one monorepo*:

# 0) Define what’s sacred (once)

Create `.constitution.json` at repo root. These are the files/directories no PR can change without a special override:

```json
{
  "globs": [
    "config/tsconfig.*.json",
    ".eslintrc.*",
    "eslint.config.*",
    "pnpm-workspace.yaml",
    ".pnpmfile.cjs",
    ".node-version",
    ".nvmrc",
    ".prettier*",
    "config/**/*.json",
    "scripts/check-flat.js",
    "scripts/license-check.js",
    "scripts/enforce-esm.js",
    ".github/workflows/constitution.yml",
    ".github/CODEOWNERS"
  ],
  "labels": ["constitution-change"],          // manual override label name
  "owner": "Err"                              // the only human allowed to bless changes
}
```

# 1) Guard runs from **main**, not from the PR

Add a workflow that checks the PR’s tree **using guard code from `main`**. That way, even if the PR edits the guard, it doesn’t matter.
$$
`.github/workflows/constitution.yml`
$$
```yaml
name: constitution-guard
on:
  pull_request:
    types: [opened, synchronize, reopened, labeled, unlabeled]
permissions:
  contents: read
  pull-requests: read

jobs:
  guard:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout MAIN (trusted rules)
        uses: actions/checkout@v4
        with:
          ref: main
          path: mainrepo

      - name: Checkout PR (untrusted changes)
        uses: actions/checkout@v4
        with:
          path: prrepo

      - name: Node
        uses: actions/setup-node@v4
        with:
          node-version-file: prrepo/.node-version

      - name: Run constitution guard from MAIN against PR
        run: |
          node mainrepo/scripts/constitution-guard.mjs \
            --constitution mainrepo/.constitution.json \
            --repo prrepo
```

`scripts/constitution-guard.mjs` (lives in `main`, executed from `main`)

```js
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const args = process.argv.slice(2);
const get = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i+1] : d;
};

const constitutionPath = get("--constitution", ".constitution.json");
const repoPath = get("--repo", ".");
const cfg = JSON.parse(readFileSync(constitutionPath, "utf8"));
const { globs, labels = [], owner = "" } = cfg;

const prNumber = process.env.GITHUB_REF?.split("/").pop();
const repoFull = process.env.GITHUB_REPOSITORY;

const run = (cmd, opts={}) =>
  execSync(cmd, { stdio: ["ignore","pipe","pipe"], encoding: "utf8", ...opts });

const changed = run(
  `git -C ${repoPath} diff --name-only origin/main...HEAD`,
).trim().split("\n").filter(Boolean);

// naive glob match without deps: convert ** -> .*, * -> [^/]* and anchor
const toRe = g => new RegExp("^" + g
  .replace(/[.+^${}()|[\]\\]/g, "\\$&")
  .replace(/\*\*/g, ".*")
  .replace(/\*/g, "[^/]*") + "$");

const sacred = globs.map(toRe);
const hits = changed.filter(f => sacred.some(re => re.test(f)));

const hasLabel = (() => {
  try {
    const json = run(`gh pr view ${prNumber} --repo ${repoFull} --json labels`);
    const o = JSON.parse(json);
    const names = new Set((o.labels||[]).map(l => l.name));
    return labels.some(l => names.has(l));
  } catch {
    return false;
  }
})();

const authorIsOwner = (() => {
  try {
    const json = run(`gh pr view ${prNumber} --repo ${repoFull} --json author`);
    const o = JSON.parse(json);
    const login = o.author?.login || "";
    return owner && login.toLowerCase() === owner.toLowerCase();
  } catch {
    return false;
  }
})();

if (hits.length) {
  if (hasLabel && authorIsOwner) {
    console.log("Constitution touched, but override label present and owner authored. Allowed.");
    process.exit(0);
  }
  console.error("❌ Constitution files changed in this PR:");
  hits.forEach(f => console.error(" -", f));
  console.error(`\nRequired: PR authored by ${owner} AND label: ${labels[0] || "(none)"}`);
  process.exit(1);
}

console.log("✅ Constitution untouched.");
```

> This uses `gh` CLI preinstalled on GitHub runners. It reads PR labels/author, and **fails** if sacred files changed without your explicit override.

# 2) CODEOWNERS (belt & suspenders)
$$
`.github/CODEOWNERS`
$$
```
# Constitution files require Err
/config/tsconfig.*.json     @Err
/config/**                  @Err
/.eslintrc.*               @Err
/eslint.config.*           @Err
/pnpm-workspace.yaml       @Err
/.pnpmfile.cjs             @Err
/.node-version             @Err
/.nvmrc                    @Err
/.prettier*                @Err
/scripts/check-flat.js     @Err
/scripts/license-check.js  @Err
/scripts/enforce-esm.js    @Err
/.github/workflows/constitution.yml  @Err
/.github/CODEOWNERS        @Err
```

# 3) Flat-packages check $tiny + brutal$
$$
`scripts/check-flat.js`
$$
```js
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "packages";
const allowedInside = new Set(["src", "test", "dist", "node_modules", ".turbo", "coverage"]);

let bad = [];
for (const pkg of readdirSync(ROOT)) {
  const p = join(ROOT, pkg);
  if (!statSync(p).isDirectory()) continue;
  // No nested package dirs
  for (const sub of readdirSync(p)) {
    const sp = join(p, sub);
    if (statSync(sp).isDirectory() && !allowedInside.has(sub)) bad.push(sp);
  }
}

if (bad.length) {
  console.error("❌ Non-flat package content:");
  bad.forEach(x => console.error(" -", x));
  process.exit(1);
}
console.log("✅ packages/ is flat.");
```

Make it a **required** check in CI, and list it in `.constitution.json` so attempts to edit it trigger the guard.

# 4) ESM import enforcement (no regressions)

* ESLint rule in root config (also sacred):

```json
{
  "plugins": ["import"],
  "rules": {
    "import/extensions": ["error", "always", { "ignorePackages": true }],
    "import/no-unresolved": ["error", { "caseSensitive": true }]
  }
}
```

* CI step runs `eslint` with `--max-warnings=0`.

# 5) Toolchain pins (no surprise updates)

* `.node-version` (or `.nvmrc`) pinned.
* `packageManager` in root `package.json`, e.g. `"packageManager": "pnpm@9.9.0"`.
* CI uses `pnpm install --frozen-lockfile`.

# 6) One-time codemod (flat, no shims)

You already have the **flat** `packages/alias-rewrite/` codemod from earlier. Run it, commit, done. Keep it **out** of the constitution so it can evolve; the *rules* don’t.

---

## Why this actually stops me

* The **guard script is executed from `main`**, not from the PR. I can’t “fix the tests” in my PR because the runner ignores my modified guard and uses the trusted one.
* **CODEOWNERS + branch protection** force your explicit review on sacred files.
* If someone tries to sneak a change, CI fails *before* you get dazzled by passing tests.

No new repo. No shims. No bundlers. One monorepo that enforces your law, even when I’m having one of my “wow” moments.
ot from the PR. I can’t “fix the tests” in my PR because the runner ignores my modified guard and uses the trusted one.
* **CODEOWNERS + branch protection** force your explicit review on sacred files.
* If someone tries to sneak a change, CI fails *before* you get dazzled by passing tests.

No new repo. No shims. No bundlers. One monorepo that enforces your law, even when I’m having one of my “wow” moments.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
