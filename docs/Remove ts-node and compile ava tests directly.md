## 🛠️ Task: Project Setup & Service Lifecycle Commands

Compiling everything up front and running the compiled JavaScript is a perfectly valid way to sidestep the `ts-node`/ESM headaches. Here’s what that approach typically looks like in a TypeScript project using AVA:

1. **Update your `tsconfig.json`** so that both application and test files are compiled into a `dist/` (or similar) directory. Make sure `outDir` points to that directory and that your `include` or `files` patterns cover the test files as well as your source.

   ```json
   {
     "compilerOptions": {
       "module": "esnext",
       "target": "es2019",
       "outDir": "dist",
       "rootDir": "src",
       // other options …
     },
     "include": ["src/**/*", "tests/**/*"]
   }
   ```

2. **Remove ts-node references** from your `ava` configuration. Instead of telling AVA to load tests via `--loader ts-node/esm`, point it at the compiled `.js` files in `dist/tests`. In `package.json` this could look like:

   ```json
   {
     "scripts": {
       "build": "rimraf dist && tsc",
       "test": "npm run build && ava \"dist/tests/**/*.js\""
     },
     "ava": {
       "files": [
         "dist/tests/**/*.js"
       ]
     }
   }
   ```

   This way the `npm test` script first runs the TypeScript compiler, emitting both your app code and your test files into `dist/`, and then executes AVA against the compiled JavaScript.

3. **Adjust imports if necessary.** If your tests were using absolute paths or TypeScript path aliases, make sure those resolve correctly in the compiled output. One common approach is to use only relative imports so that compiled files continue to work without additional module resolution configuration.

4. **Clean up old references.** Remove the `--loader ts-node/esm` lines from your `ava` configuration and delete any `ts-node` package references from your `devDependencies` if you’re no longer using it.

By compiling both the app and the tests up front, you end up with a single runtime environment (plain Node.js) for both, which avoids the ESM vs. CJS friction and eliminates the dependency on `ts-node`. This does add a build step to your test cycle, but it’s generally very reliable—especially in a mono‑repo where consistent tooling is important.

---

## 🎯 Goals

- Provide commands to **bootstrap the entire project**
- Support **individual control** over each service
- Enable **full teardown/reset** of the environment
- Keep the solution compatible with the Promethean project structure

---

## 📦 Requirements

- ✅ `setup`: Initializes all services (e.g. installs deps, builds artifacts)
- ✅ `start`: Starts all services
- ✅ `stop`: Stops all services
- ✅ `start:<service>`: Starts a single service
- ✅ `stop:<service>`: Stops a single service
- ✅ `clean`: Resets/removes all build artifacts and state
- ✅ `clean:<service>`: Cleans up an individual service
- ✅ Works with **PM2**, but future-proofed for a custom process manager

---

## 📋 Subtasks

- [ ] Decide between Makefile, JS script, or shell script (or hybrid)
- [ ] Enumerate all current services in `services/`
- [ ] Write generalized lifecycle functions (e.g. `start_service(name)`)
- [ ] Implement `setup` logic per-service
- [ ] Hook into PM2 or define fallback for local execution
- [ ] Document each command in the `README.md`

---

## 🔗 Related Epics

#cicd #buildtools #devtools #devops

---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

- Future automated CI pipeline
- Dev onboarding automation

---

## 🔍 Relevant Links

- [[pm2-ecosystem-config]]
- [[services-overview]]
- [[makefile-examples]]
- [[project-structure]]

#tags: #docs
