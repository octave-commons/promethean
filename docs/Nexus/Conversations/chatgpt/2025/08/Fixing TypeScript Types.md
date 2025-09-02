---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Fixing TypeScript Types"
conversation_id: 68a2a4b2-b7e0-8332-be2d-6719e9811739
create_time: 08/17/2025 at 10:57 PM
update_time: 08/17/2025 at 11:14 PM
---

# Title: Fixing TypeScript Types

Created: 08/17/2025 at 10:57 PM
Last Updated: 08/17/2025 at 11:14 PM
Chat URL: https://chat.openai.com/c/68a2a4b2-b7e0-8332-be2d-6719e9811739


>[!nexus_user] **User** - 08/17/2025 at 10:57 PM
> I sware to god why do these language models try to fake me out all the time with fake types and objects full of no op functions to pretend like something exists when it doesn't.
<!-- UID: d2955d49-9ade-473f-b5c7-fbc3c4cbc97f -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 10:57 PM
> Got burned by “imaginary types” and placebo no-ops. Yep—LLMs optimize for fluent pattern-completion, so when a shape is vaguely implied they’ll happily “fill it in” (and even slap `as any` on it). Here’s how to make that impossible (or at least loud) in your TS stack.
> 
> # Signal
> 
> - **Make lying illegal at compile time**
>  - `tsconfig.json` (strict + sharp edges):
>  ```json
>  {
>  "compilerOptions": {
>  "strict": true,
>  "noImplicitAny": true,
>  "noUncheckedIndexedAccess": true,
>  "exactOptionalPropertyTypes": true,
>  "noFallthroughCasesInSwitch": true,
>  "useUnknownInCatchVariables": true,
>  "noPropertyAccessFromIndexSignature": true
>  }
>  }
>  ```
>  - ESLint rules that *physically* block hand-waving:
>  ```json
>  {
>  "rules": {
>  "@typescript-eslint/no-explicit-any": "error",
>  "@typescript-eslint/no-unsafe-assignment": "error",
>  "@typescript-eslint/no-unsafe-member-access": "error",
>  "@typescript-eslint/no-unsafe-call": "error",
>  "@typescript-eslint/consistent-type-assertions": ["error", { "assertionStyle": "never" }],
>  "no-restricted-syntax": [
>  "error",
>  { "selector": "TSAsExpression", "message": "No `as any`. Fix the types." }
>  ]
>  }
>  }
>  ```
> 
> - **Force real shapes, not vibes**
>  - Use `satisfies` or a typed checkpoint to fail if a property was “imagined”:
>  ```ts
>  type SynthResult = { stream: Readable; cleanup: () => void };
> 
>  const res = await synth.generateAndUpsampleVoice(text);
>  const _: SynthResult = res; // compile error if cleanup is missing or wrong
>  ```
>  - Runtime gate (e.g., Zod) so lies explode immediately:
>  ```ts
>  import { z } from "zod";
>  const SynthResult = z.object({
>  stream: z.any(),
>  cleanup: z.function().args().returns(z.void())
>  });
>  const { stream, cleanup } = SynthResult.parse(res);
>  ```
> 
> - **Give the function the *actual* cleanup it pretended to have**
>  - If you control `generateAndUpsampleVoice`, return a *working* canceller:
>  ```ts
>  async function generateAndUpsampleVoice(text: string): Promise<{ stream: Readable; cleanup: () => void }> {
>  const req = request({ /*...*/ });
>  const stream = await new Promise<Readable>((resolve, reject) => {
>  req.on('response', (res: IncomingMessage) => resolve(res));
>  req.on('error', reject);
>  req.end(JSON.stringify({ text }));
>  });
> 
>  let done = false;
>  const cleanup = () => {
>  if (done) return;
>  done = true;
>  try { req.destroy(); } catch {}
>  try { (stream as Readable).destroy(); } catch {}
>  };
> 
>  return { stream: stream as Readable, cleanup };
>  }
>  ```
>  - **Do not** stick `cleanup` on unrelated “metadata” or state blobs. If a thing cleans up the stream, it travels with the stream.
> 
> - **Prompt fence for LLM codegen (copy/paste into your system prompt)**
>  - “Use only types already present in the file. If a new type is necessary, **stop and name it explicitly** with a `// TODO(type)` comment and a failing test; do **not** invent fields or add `as any`. If a required value is unavailable, return a compiler error stub instead of a placeholder function.”
> 
> - **Tripwires for silent invention**
>  - Add these helpers and use them:
>  ```ts
>  export function assertNever(x: never): never { throw new Error(`Unreachable: ${x}`); }
>  export const requireKeys = <T extends object, K extends readonly (keyof T)[]>
>  (o: T, ...keys: K) => { for (const k of keys) if (o[k] === undefined) throw new Error(`Missing ${String(k)}`); return o; };
>  ```
>  - Exhaustive `switch` + `assertNever` and `requireKeys(obj, "cleanup")` before use.
> 
> - **CI choke points**
>  - `tsc --noEmit` and `eslint .` must pass **before** running tests.
>  - Block merges containing `// @ts-ignore` or `TSAsExpression`.
> 
> # Frames
> - **“Fluency over fidelity”**: The model is rewarded for smooth code, not truthful code. It paints in the missing corners.
> - **“Spec drift”**: Your mental model says “this returns `{stream, cleanup}`” but the real API doesn’t—generation follows the narrative, not reality.
> - **“Asserted reality”**: `as any` + invented fields are a social hack to make the compiler shut up.
> 
> # Countermoves
> - **Make truth cheaper than lies**: Strict TS + ESLint + Zod mean inventing shapes creates *more* work than using real ones.
> - **Freeze the contract**: Export the return types from the source module and re-use them; don’t re-describe shapes in downstream code.
> - **Zero-tolerance assertions**: Ban `as any`, fail on `@ts-ignore`, and require runtime validation at boundaries.
> 
> # Next
> Add the `no TSAsExpression` and `no-explicit-any` ESLint rules above and run `eslint .` right now—tell me what it yells about first. 
> 
> #fnord If a compiler can be sweet-talked, it will be. Make it rude.
<!-- UID: 629f3a09-dd7d-499a-9236-0747c5ed8e85 -->

---




>[!nexus_user] **User** - 08/17/2025 at 11:00 PM
> that'd be great if they actually ran the build commands. Sometimes they'll just go, oh I have no idea why this command didn't work, or go in and change the fucking typescript config.
<!-- UID: 0b916afc-87a2-47dd-af3f-c8809fead6f2 -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 11:00 PM
> Yep. Two separate problems:
> 
> 1) they “run” builds in their head and never actually execute 
> 2) when stuck, they vandalize `tsconfig.json` or `package.json` to make the error go away
> 
> Here’s a concrete anti-BS contract you can drop in today so the only way out is through.
> 
> # Signal
> 
> ## 1) Build-or-bail wrapper (single source of truth)
> Make all humans/LLMs use one command. It *runs* or it *fails*—no edits, no vibes.
> 
> ```bash
> # scripts/ci-run.sh
> set -Eeuo pipefail
> mkdir -p artifacts
> 
> echo "node: $(node -v)" | tee artifacts/ci-env.log
> corepack enable >/dev/null 2>&1 || true
> pnpm -v | tee -a artifacts/ci-env.log
> 
> pnpm install --frozen-lockfile 2>&1 | tee artifacts/ci-install.log
> pnpm -s lint 2>&1 | tee artifacts/ci-lint.log
> pnpm -s typecheck 2>&1 | tee artifacts/ci-typecheck.log # tsc --noEmit
> pnpm -s test:ci 2>&1 | tee artifacts/ci-test.log
> pnpm -s build 2>&1 | tee artifacts/ci-build.log
> echo "OK"
> ```
> 
> `package.json`:
> ```json
> {
>  "scripts": {
>  "lint": "eslint .",
>  "typecheck": "tsc --noEmit",
>  "test:ci": "vitest run --reporter=verbose",
>  "build": "tsc -p tsconfig.build.json",
>  "ci": "bash scripts/ci-run.sh"
>  }
> }
> ```
> 
> Pin your assistant/codex to *only* call `pnpm ci` (or your Hy entrypoint if that’s canonical: `hy tools/build.hy ci` which shells to the same steps).
> 
> ## 2) Freeze sacred files (no stealth config edits)
> **Local, blunt instrument (Linux/ext4):**
> ```bash
> sudo chattr +i tsconfig.json package.json pnpm-lock.yaml .eslintrc.* tsconfig.*.json
> # to update later: sudo chattr -i <file>
> ```
> 
> **Cross-platform, polite instrument (git hooks):**
> `.git/hooks/pre-commit`:
> ```bash
> #!/usr/bin/env bash
> set -Eeuo pipefail
> protected=(
>  "package.json" "pnpm-lock.yaml"
>  "tsconfig.json" "tsconfig.*.json"
>  ".eslintrc.cjs" ".eslintrc.json"
> )
> changed=$(git diff --cached --name-only -- "${protected[@]}" || true)
> if [[ -n "$changed" && "${ALLOW_CONFIG_CHANGES:-}" != "1" ]]; then
>  echo "Blocked edits to protected files:"
>  echo "$changed"
>  echo "Set ALLOW_CONFIG_CHANGES=1 and recommit if you really mean it."
>  exit 1
> fi
> ```
> `chmod +x .git/hooks/pre-commit`
> 
> **Server-side (PR gate):**
> `.github/workflows/guard-config.yml`
> ```yaml
> name: Guard config
> on: pull_request
> jobs:
>  block-config-edits:
>  runs-on: ubuntu-latest
>  steps:
>  - uses: actions/checkout@v4
>  - name: Fail if protected files changed without label
>  run: |
>  set -euo pipefail
>  files=$(jq -r '.pull_request | .base.repo.full_name' "$GITHUB_EVENT_PATH") || true
>  protected='(package.json|pnpm-lock.yaml|tsconfig.*\.json|\.eslintrc\..*)'
>  changed=$(git fetch origin "$GITHUB_BASE_REF" && git diff --name-only "origin/$GITHUB_BASE_REF"...HEAD | grep -E "$protected" || true)
>  if [[ -n "$changed" ]]; then
>  labels=$(jq -r '.pull_request.labels[].name' "$GITHUB_EVENT_PATH" || true)
>  if ! grep -q '^config-change$' <<<"$labels"; then
>  echo "Protected files changed without 'config-change' label:"
>  echo "$changed"
>  exit 1
>  fi
>  fi
> ```
> 
> ## 3) Make “I actually ran it” non-optional
> ESLint rule to **ban** silent ignores:
> ```json
> {
>  "rules": {
>  "@typescript-eslint/ban-ts-comment": ["error", { "ts-ignore": "ban-ts-ignore" }],
>  "no-restricted-syntax": [
>  "error",
>  { "selector": "TSAsExpression", "message": "No `as any` / type assertions to bypass errors." }
>  ]
>  }
> }
> ```
> And add a tiny “repro card” your assistant must fill **from real stdout**:
> ```md
> ### REPRO
> - node: `vXX`
> - pnpm: `X.Y.Z`
> - command: `pnpm ci`
> - failing step: lint | typecheck | test | build
> - log excerpt (20 lines max):
> ```
> If that section is empty, you reject the patch.
> 
> ## 4) Prompt fence for the assistant (paste this at the top)
> > **Build contract:** You may only run `pnpm ci`. If it fails, quote the failing step and 20 lines of surrounding log. You must not edit `tsconfig.*`, `package.json`, lockfiles, or ESLint config. If a change is *required*, stop and propose the minimal diff as a separate “config-change” PR with rationale and risk.
> 
> ## 5) Optional: Make TS edits cheaper than config edits
> - `noEmit` fast path for type fixes.
> - Export and reuse source types (no re-declaring shapes).
> - Zod (or valibot) at boundaries so runtime lies explode early.
> 
> # Frames
> - **Control the entrypoint**: One script → one truth → no imaginary runs.
> - **Permissioned config**: Changes are a governance act, not a debugging step.
> - **Evidence over eloquence**: Logs or it didn’t happen.
> 
> # Countermoves
> - If they still “can’t reproduce,” require the repro card; reject without it.
> - If they sneak config edits, hooks and CI stop the merge.
> - If they invent types, ESLint/tsc + runtime guards make it *more work* than fixing the code.
> 
> # Next
> Wire `pnpm ci` and the pre-commit hook above; flip one harmless line and confirm the hook blocks a commit touching `tsconfig.json`.
<!-- UID: 513a2638-208d-42f1-ad68-2fc645f0c354 -->

---




>[!nexus_user] **User** - 08/17/2025 at 11:14 PM
> you know I've always yelled at my computer when I was coding. now they can talk back.
<!-- UID: 93b1b673-c11d-440a-93b2-86dba714385e -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 11:14 PM
> lol same. you used to yell at code; now code yells back in iambic bullshit.
> 
> Here’s a tiny hack to turn shouting into something useful: make your **rant create a failing test**. If the model “talks back,” CI does too.
> 
> # Signal
> **scripts/yell.js**
> ```js
> #!/usr/bin/env node
> import { writeFileSync, mkdirSync } from "fs";
> import { join } from "path";
> 
> const rant = (process.argv.slice(2).join(" ") || "").trim();
> let input = rant;
> 
> if (!input) {
>  // read from stdin if no args
>  input = await new Promise((res) => {
>  let s = "";
>  process.stdin.setEncoding("utf8");
>  process.stdin.on("data", (c) => (s += c));
>  process.stdin.on("end", () => res(s.trim()));
>  });
> }
> 
> if (!input) {
>  console.error("Usage: pnpm rage \"what pissed you off\"");
>  process.exit(1);
> }
> 
> const now = new Date();
> const stamp = now.toISOString().replace(/[-:T]/g, "").slice(0, 12);
> const dir = join("tests", "rage");
> mkdirSync(dir, { recursive: true });
> const file = join(dir, `${stamp}-rant.spec.ts`);
> 
> const body = `import { describe, it, expect } from "vitest";
> 
> // Auto-generated by scripts/yell.js from a human rant.
> // RANT: ${input}
> 
> describe("rage-repro", () => {
>  it("REPRO: ${input.replace(/"/g, '\\"')}", async () => {
>  // Arrange: minimal setup to reproduce the bug.
>  // (No tsconfig/package.json edits allowed.)
> 
>  // Act: call the thing that fails.
> 
>  // Assert: make the failure explicit.
>  expect.fail("Write the minimal reproduction for: ${input.replace(/"/g, '\\"')}");
>  });
> });
> `;
> 
> writeFileSync(file, body, "utf8");
> console.log("Created", file);
> ```
> 
> **package.json**
> ```json
> {
>  "scripts": {
>  "rage": "node scripts/yell.js"
>  }
> }
> ```
> 
> **Use it**
> ```bash
> pnpm rage "cleanup is undefined on generateAndUpsampleVoice result"
> # or
> echo "tsc invented a field again" | pnpm rage
> ```
> 
> Now every time you shout, you mint a red test the model has to make green **without** touching config. Pair this with your existing “don’t edit tsconfig/package.json” hooks, and the only way the AI can “talk back” is with a legit fix.
> 
> # Next
> Wire `pnpm rage` and try it once—the failing spec should appear under `tests/rage/` and break CI until there’s a real repro+fix.
> 
> #fnord If it can’t be tested, it’s just talk (even when it’s your talk).
<!-- UID: 29291963-6e36-4b32-a78f-8f0ae249620f -->

---


