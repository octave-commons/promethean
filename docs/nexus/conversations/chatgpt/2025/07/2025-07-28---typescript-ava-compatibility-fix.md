---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "TypeScript AVA compatibility fix"
conversation_id: 688822db-cab4-8323-a5db-694c0a8118fc
create_time: 07/28/2025 at 8:24 PM
update_time: 07/28/2025 at 8:26 PM
---

# Title: TypeScript AVA compatibility fix

Created: 07/28/2025 at 8:24 PM
Last Updated: 07/28/2025 at 8:26 PM
Chat URL: https://chat.openai.com/c/688822db-cab4-8323-a5db-694c0a8118fc


>[!nexus_user] **User** - 07/28/2025 at 8:24 PM
> We are having problems with our test suite for a similar reason we had issues with our other typescript code.
> 
> {
>  "scripts": {
>  "test": "npm --prefix services/cephalon test && npm --prefix services/discord-embedder test"
>  },
>  "dependencies": {
>  "@discordjs/voice": "^0.18.0",
>  "pm2": "^6.0.8",
>  "screenshot-desktop": "^1.15.1",
>  "tokenizers": "^0.13.3",
>  "typescript": "^5.8.3"
>  },
>  "devDependencies": {
>  "@types/sbd": "^1.0.5",
>  "@types/screenshot-desktop": "^1.12.3",
>  "ava": "^6.4.1"
>  }
> }
> npm test
> 
> > test
> > npm --prefix services/cephalon test && npm --prefix services/discord-embedder test
> 
> > basic-bot@0.0.1 test
> > ava
> 
> (node:48432) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:
> --import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("ts-node/esm", pathToFileURL("./"));'
> (Use `node --trace-warnings ...` to show where the warning was created)
> (node:48432) [DEP0180] DeprecationWarning: fs.Stats constructor is deprecated.
> (Use `node --trace-deprecation ...` to show where the warning was created)
> (node:48432) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:
> --import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("ts-node/esm", pathToFileURL("./"));'
> (Use `node --trace-warnings ...` to show where the warning was created)
> (node:48432) [DEP0180] DeprecationWarning: fs.Stats constructor is deprecated.
> (Use `node --trace-deprecation ...` to show where the warning was created)
> (node:48432) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:
> --import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("ts-node/esm", pathToFileURL("./"));'
> (Use `node --trace-warnings ...` to show where the warning was created)
> (node:48432) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:
> --import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("ts-node/esm", pathToFileURL("./"));'
> (Use `node --trace-warnings ...` to show where the warning was created)
> (node:48432) [DEP0180] DeprecationWarning: fs.Stats constructor is deprecated.
> (Use `node --trace-deprecation ...` to show where the warning was created)
> (node:48432) [DEP0180] DeprecationWarning: fs.Stats constructor is deprecated.
> (Use `node --trace-deprecation ...` to show where the warning was created)
>  √ test › my passing test
> 
>  Uncaught exception in tests\converter.ts
> 
>  {
>  [Symbol.for(nodejs.util.inspect.custom)]: Function [nodejs.util.inspect.custom] {},
>  }
> 
>  × tests\converter.ts exited with a non-zero exit code: 1
> 
>  Uncaught exception in tests\voice_session.test.ts
> 
>  {
>  [Symbol.for(nodejs.util.inspect.custom)]: Function [nodejs.util.inspect.custom] {},
>  }
> 
>  × tests\voice_session.test.ts exited with a non-zero exit code: 1
> 
>  Uncaught exception in tests\bot.test.ts
> 
>  {
>  [Symbol.for(nodejs.util.inspect.custom)]: Function [nodejs.util.inspect.custom] {},
>  }
> 
>  × tests\bot.test.ts exited with a non-zero exit code: 1
>  ─
> 
>  1 test passed
>  3 uncaught exceptions
<!-- UID: b4377d98-58f7-438e-a9ef-d87ce1d26830 -->




>[!nexus_agent] **Assistant** - 07/28/2025 at 8:24 PM
> You're running into a classic TypeScript + ESM + AVA + experimental loader compatibility issue — specifically, AVA is throwing **uncaught exceptions** with very little information about **why**. Based on your logs, here's what’s likely going wrong and how to fix it step-by-step.
> 
> ---
> 
> ## 🔍 Core Problems Identified:
> 
> 1. **AVA doesn’t handle `ts-node/esm` and experimental loaders cleanly** out of the box.
> 2. You’re using TypeScript with `"module": "ESNext"` or similar, which triggers the need for ESM loading.
> 3. **AVA is not showing the error stack** because it’s failing inside the test runner due to missing/broken transpilation or config issues.
> 
> ---
> 
> ## ✅ Step-by-Step Fix
> 
> ### 1. **Use AVA’s Built-in TypeScript Support**
> As of AVA v4+, **you don’t need `ts-node`** or the experimental loader for TypeScript. Instead, you can configure AVA to compile TypeScript ahead of time or use its native `esm` mode with TypeScript.
> 
> #### ➤ Remove custom loaders like `--experimental-loader ts-node/esm` from your config.
> 
> ---
> 
> ### 2. **Fix `package.json` config**
> 
> In `services/cephalon/package.json` (and `discord-embedder` too, if applicable), ensure the following:
> 
> ```json
> "type": "module",
> "ava": {
>  "extensions": {
>  "ts": "module"
>  },
>  "nodeArguments": [
>  "--loader=ts-node/esm" // OPTIONAL: use only if you insist on runtime TS
>  ],
>  "files": [
>  "tests/**/*.test.ts"
>  ]
> }
> ```
> 
> OR, ideally:
> 
> Switch to **precompiled** tests:
> 
> - In your `tsconfig.json`, set:
> ```json
> {
>  "compilerOptions": {
>  "module": "ESNext",
>  "target": "ES2020",
>  "outDir": "build",
>  "rootDir": "src",
>  "moduleResolution": "node",
>  "esModuleInterop": true,
>  "sourceMap": true
>  },
>  "include": ["src/**/*.ts", "tests/**/*.ts"]
> }
> ```
> 
> - Add a script:
> 
> ```json
> "scripts": {
>  "build": "tsc",
>  "test": "npm run build && ava build/tests"
> }
> ```
> 
> ---
> 
> ### 3. **Get Meaningful Error Output**
> 
> AVA sometimes suppresses exceptions if the test process crashes early. Try running a single test directly to isolate:
> 
> ```sh
> node --trace-warnings --trace-deprecation --loader ts-node/esm node_modules/.bin/ava tests/voice_session.test.ts
> ```
> 
> This may reveal:
> 
> - Improper imports (e.g., `require()` in ESM context)
> - Misconfigured mocks
> - AVA crashing due to asynchronous setup/teardown not awaited properly
> 
> ---
> 
> ### 4. **If You're Using `ts-node/esm`, You MUST:**
> 
> - Have `tsconfig.json` with:
> 
> ```json
> {
>  "compilerOptions": {
>  "module": "ESNext",
>  "target": "ES2020",
>  "moduleResolution": "node",
>  "esModuleInterop": true,
>  "allowSyntheticDefaultImports": true
>  }
> }
> ```
> 
> - Import with extensions, e.g.,:
> 
> ```ts
> import { foo } from "./utils.js"; // <- must include .js even in .ts file
> ```
> 
> This is an annoying ESM rule that affects `ts-node/esm`.
> 
> ---
> 
> ### 5. **Upgrade or Downgrade as Needed**
> 
> - `ava@6.x` is pretty bleeding edge. If issues persist, try `ava@5.x` and see if it improves things.
> - Some of this experimental loader warning spam goes away with more recent Node.js versions and stable support for `--import`.
> 
> ---
> 
> ## 🔁 TL;DR Fix Summary
> 
> - ✅ Prefer pre-compiling `.ts` tests instead of relying on `ts-node/esm`
> - ✅ Remove `--experimental-loader` from your test runs
> - ✅ Use AVA config with `"extensions": { "ts": "module" }`
> - ✅ Always include `.js` in import paths for ESM
> - ✅ Run failing test directly with `node --trace-...` to debug
> 
> ---
> 
> Want me to generate a working `services/cephalon/package.json` + `tsconfig.json` for AVA + TypeScript ESM setup based on your layout?
<!-- UID: cf0f03ae-bf4c-40e5-b6b0-c70af9a9b456 -->

---




>[!nexus_user] **User** - 07/28/2025 at 8:26 PM
> {
>  "name": "basic-bot",
>  "version": "0.0.1",
>  "description": "A proof-of-concept basic bot using @discordjs/voice",
>  "main": "dist/index.js",
>  "type": "module",
>  "scripts": {
>  "build": "tsc && node scripts/patch-imports.js",
>  "start": "node dist/index.js",
>  "test": "ava",
>  "build:check": "tsc --noEmit --incremental false",
>  "deploy": "npm run build && node --env-file=../../.env dist/util/deploy.js",
>  "lint": "prettier --cache --check . && eslint src --ext mjs,js,ts --cache",
>  "format": "prettier --cache --write . && eslint src --ext mjs,js,ts --fix --cache",
>  "start:dev": "node --loader ts-node/esm src/index.ts"
>  },
>  "keywords": [
>  "discord",
>  "radio",
>  "bot",
>  "audio",
>  "speakers",
>  "hardware",
>  "dj"
>  ],
>  "author": "Amish Shah <amishshah.2k@gmail.com>",
>  "license": "UNLICENSE",
>  "dependencies": {
>  "@chroma-core/default-embed": "^0.1.8",
>  "@discordjs/opus": "^0.10.0",
>  "@discordjs/voice": "^0.18.0",
>  "@types/sbd": "^1.0.5",
>  "@types/screenshot-desktop": "^1.12.3",
>  "@types/wav": "^1.0.4",
>  "chromadb": "^3.0.9",
>  "discord.js": "^14.17.3",
>  "dotenv": "^17.2.0",
>  "javascript-time-ago": "^2.5.11",
>  "libsodium-wrappers": "^0.7.13",
>  "mongodb": "^6.17.0",
>  "node-crc": "^1.3.2",
>  "ollama": "^0.5.16",
>  "pnpm": "^10.13.1",
>  "prism-media": "^2.0.0-alpha.0",
>  "sbd": "^1.0.19",
>  "screenshot-desktop": "^1.15.1",
>  "wav": "^1.0.2"
>  },
>  "devDependencies": {
>  "@types/node": "^22.10.10",
>  "ava": "^6.4.1",
>  "eslint": "^8.57.0",
>  "eslint-config-neon": "^0.1.62",
>  "prettier": "^3.4.2",
>  "rewrite-imports": "^3.0.0",
>  "rimraf": "^6.0.1",
>  "source-map-support": "^0.5.21",
>  "ts-node": "^10.9.2",
>  "typescript": "5.7.3"
>  },
>  "ava": {
>  "extensions": {
>  "ts": "module"
>  },
>  "files": [
>  "tests/**/*.ts"
>  ],
>  "nodeArguments": [
>  "--loader",
>  "ts-node/esm"
>  ]
>  }
> }
> This is the cephalon package.json
<!-- UID: 79b83a7e-6042-4578-be8d-ccee5414a890 -->




>[!nexus_agent] **Assistant** - 07/28/2025 at 8:26 PM
> Thanks — this `package.json` clarifies a lot. You're using:
> 
> - ESM (`"type": "module"`)
> - TypeScript (`ts-node/esm`)
> - AVA v6
> - Runtime TS execution instead of precompiling
> - Custom `patch-imports.js` script (which likely fixes `.js` extensions post-`tsc`)
> 
> Your config *should* work, but the **uncaught exceptions** during test execution suggest there's a deeper issue with AVA + `ts-node/esm`.
> 
> Let’s fix this **without switching to pre-compilation**, unless you want that (let me know).
> 
> ---
> 
> ## ✅ Fix Checklist for Your Current Setup (Runtime TS with ESM)
> 
> ### 1. **Ensure test files use `.test.ts` extension**
> 
> AVA doesn’t glob non-`*.test.ts` files by default unless configured. Right now you have:
> 
> ```json
> "files": ["tests/**/*.ts"]
> ```
> 
> Update to:
> 
> ```json
> "files": ["tests/**/*.test.ts"]
> ```
> 
> Or rename your test files to `*.test.ts`.
> 
> ---
> 
> ### 2. **Ensure every import uses `.js` extensions in `.ts` files**
> 
> Since you're using ESM with `ts-node/esm`, you must do this:
> 
> ```ts
> // ✅ Correct for ts-node/esm
> import { something } from './util.js'
> 
> // ❌ Will crash silently or throw mysterious errors
> import { something } from './util'
> ```
> 
> ---
> 
> ### 3. **Add a minimal `tsconfig.json` (if not already present)**
> 
> Make sure it's in `services/cephalon/tsconfig.json`:
> 
> ```json
> {
>  "compilerOptions": {
>  "target": "ES2020",
>  "module": "ESNext",
>  "moduleResolution": "NodeNext",
>  "strict": true,
>  "esModuleInterop": true,
>  "skipLibCheck": true,
>  "resolveJsonModule": true,
>  "types": ["node"]
>  },
>  "include": ["src", "tests"]
> }
> ```
> 
> > Key part: `moduleResolution: "NodeNext"` — allows TypeScript to understand ESM import resolution like `.js` suffixes.
> 
> ---
> 
> ### 4. **Set `"exports"` in `package.json` (optional but helps resolution)**
> 
> ```json
> "exports": {
>  "./*": "./dist/*"
> }
> ```
> 
> ---
> 
> ### 5. **Temporarily run AVA with trace output for debugging**
> 
> ```bash
> node --trace-uncaught --trace-warnings --loader ts-node/esm node_modules/.bin/ava tests/voice_session.test.ts
> ```
> 
> This will give a full stack trace on the exceptions.
> 
> ---
> 
> ### 6. **Patch suggestion (optional)**
> 
> If `patch-imports.js` rewrites `.ts` → `.js`, consider wrapping it with a log and verifying your `dist/` tree is correctly updated.
> 
> ---
> 
> ## 🚨 Still Broken? Try a Debug Print in AVA
> 
> Inside `tests/voice_session.test.ts`, add:
> 
> ```ts
> console.log("🔥 Test loaded");
> test('init', t => {
>  t.pass();
> });
> ```
> 
> If `🔥 Test loaded` never prints: import or loader crash.
> If it prints then crashes: code-level issue, not AVA config.
> 
> ---
> 
> ## 🧹 Alternative: Precompiled Test Flow
> 
> If you're ready to move to precompiled TS (easier long-term):
> 
> ```json
> "scripts": {
>  "build": "tsc && node scripts/patch-imports.js",
>  "test": "npm run build && ava dist/tests"
> }
> ```
> 
> And you can remove:
> 
> ```json
> "nodeArguments": ["--loader", "ts-node/esm"]
> ```
> 
> ---
> 
> Would you like a codemod script to auto-rewrite `import './foo'` to `import './foo.js'` across your project?
<!-- UID: fb848fbd-e2cb-4dbd-86dc-8273f9b27e54 -->

---


