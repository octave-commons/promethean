# Lisp CLI prom-lisp

Command-line tools for the lightweight Lisp compiler in `shared/ts/src/compiler/lisp`.

The CLI can:
- Compile Lisp to JavaScript
- Run Lisp source directly (with imported helpers)
- Convert JavaScript to Lisp (js2lisp)
- Convert TypeScript to Lisp (ts2lisp)

## Install / Build

From the repo root (pnpm required):

```bash
pnpm -C shared/ts run build
```

This emits `dist/cli/lisp.js` and adds a bin named `prom-lisp`.

If `node_modules/.bin` is on your PATH, you can run:

```bash
pnpm -C shared/ts run lisp --help
```

Or invoke the bin after linking the package, if desired.

## Usage

```text
prom-lisp — Lisp tools (compile/run/js2lisp/ts2lisp)

Usage:
  prom-lisp compile [--pretty] [--imports name1,name2] [-o out.js] <file|->
  prom-lisp run [--import name=path[:export]]... [--json] <file|->
  prom-lisp js2lisp <file|->
  prom-lisp ts2lisp [--include-intermediate] <file|->
```

### Compile Lisp → JS

```bash
prom-lisp compile --pretty -o out.js program.lisp
cat program.lisp | prom-lisp compile --imports print
```

- `--pretty`: emit more readable JS
- `--imports name1,name2`: names that will be destructured from the runtime import object when the emitted function is called.

The compiler emits a JS function of the form:

```js
(function(args){ const { name1, name2 } = args; return /* ... */; })
```

### Run Lisp directly

```bash
prom-lisp run --import print=./runtime.js:print hello.lisp
```

- `--import name=path[:export]` can be repeated; each is dynamically imported and passed to the program under `name`.
- `--json` prints the result as JSON.

Example runtime `runtime.js`:

```js
export const print = (x) => { console.log(String(x)); return x; };
```

### JS → Lisp

```bash
prom-lisp js2lisp input.js > out.lisp
```

Attempts to parse JS (via Acorn) to ESTree and convert to equivalent Lisp forms.

### TS → Lisp

```bash
prom-lisp ts2lisp component.ts > out.lisp
```

Transpiles TypeScript to JS in-memory and converts to Lisp.

## Notes

- The Lisp compiler is intentionally minimal; feature coverage is limited.
- When using `run`, imported helpers are provided via dynamic `import()`; paths should be relative to your CWD e.g., `./runtime.js`.
- For programmatic use, import from `shared/ts/src/compiler/lisp/driver.ts` (`compileLispToJS`, `runLisp`).
