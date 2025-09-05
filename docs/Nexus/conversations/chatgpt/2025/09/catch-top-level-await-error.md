---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Catch top-level await error"
conversation_id: 68b60654-d730-8330-9374-81ea9255755b
create_time: 09/01/2025 at 3:47 PM
update_time: 09/01/2025 at 3:47 PM
---

# Title: Catch top-level await error

Created: 09/01/2025 at 3:47 PM
Last Updated: 09/01/2025 at 3:47 PM
Chat URL: https://chat.openai.com/c/68b60654-d730-8330-9374-81ea9255755b


>[!nexus_user] **User** - 09/01/2025 at 3:47 PM
> How can I catch this in my IDE/build script before I run code?
> /home/err/devel/promethean/packages/docops/src/04-relations.ts:23:11: ERROR: Top-level await is currently not supported with the "cjs" output format
<!-- UID: cbf45ae9-a13c-4fc7-9c72-d4c39e60f51f -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 3:47 PM
> That error comes from **esbuild/tsc trying to output CommonJS (cjs) while your code uses top-level await**, which is only valid in ES modules. The runtime error happens late (when you try to run it), but you can catch it much earlier in your workflow by tightening your build config and linting.
> 
> Here’s how you can catch it before running:
> 
> ---
> 
> ## 1. Use `moduleDetection` and `module` in `tsconfig.json`
> Set your compiler to **ESM-only** so `tsc` will fail at compile time if it sees top-level await under a `cjs` target.
> 
> ```jsonc
> // tsconfig.json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "ESNext",
>  "moduleDetection": "force", // forces all .ts files to be treated as modules
>  "noEmit": true
>  }
> }
> ```
> 
> Then run:
> 
> ```sh
> pnpm tsc --noEmit
> ```
> 
> That will bail out if your build accidentally points at `commonjs`.
> 
> ---
> 
> ## 2. Add an ESLint rule for top-level await
> ESLint can statically flag `await` at the top level unless the file is explicitly ESM:
> 
> ```json
> // .eslintrc.json
> {
>  "rules": {
>  "no-restricted-syntax": [
>  "error",
>  {
>  "selector": "AwaitExpression",
>  "message": "Top-level await is not supported in CommonJS builds"
>  }
>  ]
>  }
> }
> ```
> 
> Run `pnpm lint` in your CI/build and you’ll catch it before execution.
> 
> ---
> 
> ## 3. Make your build script explicit about format
> If you’re using `esbuild`, always pass a `format` matching your code:
> 
> ```sh
> esbuild src/index.ts --bundle --platform=node --format=esm
> ```
> 
> Then, if you (or another dev) forget and set `--format=cjs`, esbuild will fail immediately at build time instead of letting it slip through.
> 
> ---
> 
> ## 4. Optional: Pre-flight script
> You can write a tiny check in your build pipeline to grep for top-level awaits:
> 
> ```sh
> grep -R "await " src | grep -v "async function"
> ```
> 
> Not perfect, but it’s a cheap safety net.
> 
> ---
> 
> ✅ **Best approach:** 
> - Set `module: "ESNext"` in `tsconfig.json` 
> - Add ESLint restriction on top-level await 
> - Make build scripts explicit about `esm` vs `cjs`
> 
> That way you’ll fail **fast** in your IDE/CI instead of getting that runtime error.
> 
> ---
> 
> Do you want me to show you how to configure this so **VS Code/Spacemacs flags it in-editor** (red squiggles) instead of just failing on build?
<!-- UID: edb49634-f0ee-4dc6-bf22-34e70cde9ab2 -->

---


